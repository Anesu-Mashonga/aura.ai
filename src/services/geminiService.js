import { ok, fail, delay, safeParse, safeSet } from './utils.js'

const CACHE_KEY_PREFIX = 'alclo_vto_'
const RATE_LIMIT_KEY_PREFIX = 'alclo_vto_rate_limit_'
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY
const IMAGE_MODEL = 'gemini-2.5-flash-image'
const API_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${IMAGE_MODEL}:generateContent`

function toCacheKey(userProfile, outfitItems) {
  return `${CACHE_KEY_PREFIX}${userProfile?.id || 'default'}_${(outfitItems || []).map((i) => i.id || i.name).join('-') || 'outfit'}`
}

function toRateLimitKey(userProfile) {
  return `${RATE_LIMIT_KEY_PREFIX}${userProfile?.id || 'default'}`
}

function getRetryDelayMs(response, attempt) {
  const retryAfter = response?.headers?.get('retry-after')
  if (retryAfter) {
    const seconds = Number(retryAfter)
    if (Number.isFinite(seconds) && seconds > 0) return Math.ceil(seconds * 1000)
  }

  // Exponential backoff with a small jitter to avoid synchronized retries.
  return Math.min(8000, 1000 * (2 ** attempt)) + Math.floor(Math.random() * 250)
}

/**
 * Constructs a description of the outfit from clothing items
 * @param {Array} items - Array of clothing items with name, type, color
 * @returns {string} Natural language description of outfit
 */
function constructOutfitDescription(items) {
  if (!items || items.length === 0) {
    return 'casual everyday outfit'
  }

  const grouped = {
    top: items.filter((i) => i.type === 'top'),
    bottom: items.filter((i) => i.type === 'bottom'),
    shoes: items.filter((i) => i.type === 'shoes'),
    outer: items.filter((i) => i.type === 'outer'),
    accessories: items.filter((i) => i.type === 'accessories'),
  }

  const parts = []

  if (grouped.outer.length > 0) {
    parts.push(`wearing a ${grouped.outer.map((i) => i.name).join(' and a ')}`)
  }

  if (grouped.top.length > 0) {
    parts.push(`with a ${grouped.top.map((i) => i.name).join(' and a ')}`)
  }

  if (grouped.bottom.length > 0) {
    parts.push(`${grouped.bottom.map((i) => i.name).join(' and ')}`)
  }

  if (grouped.shoes.length > 0) {
    parts.push(`and ${grouped.shoes.map((i) => i.name).join(' and ')}`)
  }

  if (grouped.accessories.length > 0) {
    parts.push(`accessories including ${grouped.accessories.map((i) => i.name).join(', ')}`)
  }

  return parts.join(' ')
}

/**
 * Gets or constructs avatar description based on avatar image
 * @param {string} avatarImg - Path to avatar image
 * @returns {string} Description of the avatar
 */
function getAvatarDescription(avatarImg) {
  // Map avatar images to descriptions
  if (avatarImg && avatarImg.includes('african')) {
    return 'an African woman with natural features'
  }
  if (avatarImg && avatarImg.includes('male')) {
    return 'a professional man'
  }
  return 'a stylish person'
}

/**
 * Generates a virtual try-on image using Gemini API
 * @param {string} avatarImg - Path to user's avatar image
 * @param {Array} outfitItems - Array of clothing items to wear
 * @param {Object} userProfile - User profile (name, preferences, etc.)
 * @returns {Promise<Object>} { success: true, data: { imageUrl, generatedAt, prompt } } or { success: false, error }
 */
export async function generateVTOImage(avatarImg, outfitItems, userProfile = {}) {
  try {
    // Check if API key is configured
    if (!API_KEY) {
      return fail('NO_API_KEY', 'Gemini API key not configured. Please add VITE_GEMINI_API_KEY to .env.local')
    }

    const cacheKey = toCacheKey(userProfile, outfitItems)
    const rateLimitKey = toRateLimitKey(userProfile)

    // Return cached image immediately if already generated for this exact outfit.
    const cached = safeParse(cacheKey, null)
    if (cached?.imageUrl) {
      return ok({
        ...cached,
        fromCache: true,
      })
    }

    const rateLimitState = safeParse(rateLimitKey, null)
    if (rateLimitState?.until && Date.now() < rateLimitState.until) {
      const secondsLeft = Math.ceil((rateLimitState.until - Date.now()) / 1000)
      return fail('RATE_LIMIT', `Gemini is temporarily rate-limited. Try again in about ${secondsLeft}s.`)
    }

    // Construct descriptions
    const avatarDescription = getAvatarDescription(avatarImg)
    const outfitDescription = constructOutfitDescription(outfitItems)

    // Construct the prompt
    const prompt = `You are an AI fashion stylist. Generate a realistic and professional fashion photo of ${avatarDescription} wearing ${outfitDescription}. 
    
Key requirements:
- Keep the person's facial features, face shape, ethnicity, and body type exactly as they are
- Show a complete head-to-toe outfit view
- Use professional fashion photography lighting and composition
- Set against a clean, neutral background (white or light gray)
- Make it look like a professional fashion lookbook or catalog photo
- The person should be standing facing the camera in a natural pose

Generate the image now.`

    // Simulate network delay
    await delay(800)

    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
      generationConfig: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    }

    let response = null
    const maxRetries = 2
    for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
      response = await fetch(`${API_ENDPOINT}?key=${API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      if (response.ok || response.status !== 429 || attempt === maxRetries) {
        break
      }

      const waitMs = getRetryDelayMs(response, attempt)
      await delay(waitMs)
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const errorMessage = errorData?.error?.message || `API error: ${response.status}`

      if (response.status === 401 || response.status === 403) {
        return fail('AUTH_ERROR', 'Invalid API key or Generative Language API is not enabled for this Google Cloud project')
      }

      if (response.status === 429) {
        const waitMs = getRetryDelayMs(response, 1)
        safeSet(rateLimitKey, { until: Date.now() + waitMs })
        return fail('RATE_LIMIT', `Gemini quota/rate limit reached. Please retry in about ${Math.ceil(waitMs / 1000)}s.`)
      }

      return fail('API_ERROR', errorMessage)
    }

    const data = await response.json()

    if (!data.candidates || data.candidates.length === 0) {
      return fail('NO_CONTENT', 'Gemini API returned no candidates')
    }

    const parts = data.candidates[0]?.content?.parts || []
    const imagePart = parts.find((part) => part.inlineData?.data)
    const textPart = parts.find((part) => part.text)

    if (!imagePart?.inlineData?.data) {
      return fail('NO_IMAGE', textPart?.text || 'No image data returned. Ensure your model/key supports image generation.')
    }

    const mimeType = imagePart.inlineData.mimeType || 'image/png'
    const imageUrl = `data:${mimeType};base64,${imagePart.inlineData.data}`

    const vtoData = {
      imageUrl,
      generatedAt: new Date().toISOString(),
      prompt,
      outfitItemsCount: outfitItems.length,
      model: IMAGE_MODEL,
      fromCache: false,
    }

    // Cache in localStorage
    safeSet(cacheKey, vtoData)

    return ok(vtoData)
  } catch (error) {
    console.error('VTO Generation Error:', error)

    if (error.message.includes('fetch') || error.message.includes('network')) {
      return fail('NETWORK_ERROR', 'Network error while generating outfit preview. Please check your connection.')
    }

    return fail('GENERATION_ERROR', error.message || 'Failed to generate outfit preview')
  }
}

/**
 * Gets cached VTO image for an outfit if it exists
 * @param {string} outfitId - ID of the outfit
 * @returns {Object|null} Cached VTO data or null
 */
export function getCachedVTO(outfitId) {
  if (!outfitId) return null
  const cacheKey = `${CACHE_KEY_PREFIX}${outfitId}`
  return safeParse(cacheKey, null)
}

/**
 * Clears cached VTO image for an outfit
 * @param {string} outfitId - ID of the outfit
 */
export function clearCachedVTO(outfitId) {
  if (!outfitId) return
  try {
    localStorage.removeItem(`${CACHE_KEY_PREFIX}${outfitId}`)
  } catch {
    // Ignore
  }
}
