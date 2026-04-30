import { v4 as uuidv4 } from 'uuid'
import { delay, ok, safeParse, safeSet } from './utils'
import { getLaundryStatus } from './laundryService'

const OUTFIT_HISTORY_KEY = 'alclo_outfit_history'
const FAVORITE_STYLES_KEY = 'alclo_favorite_styles'
const WARDROBE_KEY = 'alclo_wardrobe'
const VARIATION_WINDOW = 4

const OCCASION_WEIGHTS = {
  Work: { top: ['shirt', 'polo', 'blouse'], bottom: ['chinos', 'trousers', 'slacks'], outer: ['blazer', 'jacket'], shoes: ['boots', 'loafers', 'oxfords'] },
  Casual: { top: ['tee', 't-shirt', 'polo', 'hoodie'], bottom: ['jeans', 'shorts', 'joggers'], outer: ['jacket', 'bomber'], shoes: ['sneakers', 'canvas'] },
  Party: { top: ['shirt', 'blouse', 'top'], bottom: ['trousers', 'jeans', 'skirt'], outer: ['blazer'], shoes: ['boots', 'heels', 'loafers'] },
  Date: { top: ['shirt', 'blouse', 'polo'], bottom: ['chinos', 'jeans', 'trousers'], outer: ['blazer', 'jacket'], shoes: ['boots', 'loafers'] },
  Sport: { top: ['tee', 't-shirt', 'jersey', 'hoodie'], bottom: ['shorts', 'joggers', 'leggings'], outer: ['hoodie', 'jacket'], shoes: ['sneakers', 'trainers'] },
}

function scoreItem(item, occasion, weather) {
  let score = 0
  const laundryStatus = getLaundryStatus(item)
  const daysSince = item.lastWorn
    ? Math.floor((Date.now() - new Date(item.lastWorn)) / 86400000)
    : 30
  score += Math.min(daysSince, 14) // recency bonus
  if (laundryStatus.isDirty) score -= 50
  if (item.favorite) score += 3

  const occasionKeywords = OCCASION_WEIGHTS[occasion] || OCCASION_WEIGHTS.Casual
  const allKeywords = Object.values(occasionKeywords).flat()
  const nameLower = `${item.name} ${item.categoryLabel || ''} ${(item.tags || []).join(' ')}`.toLowerCase()
  if (allKeywords.some(k => nameLower.includes(k))) score += 8

  // Weather scoring
  const tempC = weather?.tempC ?? 18
  if (item.type === 'outer') {
    score += tempC < 15 ? 10 : tempC < 22 ? 2 : -5
  }
  const cond = (weather?.condition || '').toLowerCase()
  if (cond.includes('rain') && item.type === 'shoes') {
    if (nameLower.includes('boot')) score += 5
    else if (nameLower.includes('sneaker') || nameLower.includes('canvas')) score -= 4
  }
  return score
}

function pickBest(items, type, { count = 1, excludeItemIds = [], variationIndex = 0 } = {}) {
  const ranked = [...items]
    .filter(i => i.type === type)
    .sort((a, b) => {
      if (b._score !== a._score) return b._score - a._score
      return a.name.localeCompare(b.name)
    })

  if (ranked.length === 0) return []

  const preferred = ranked.filter(item => !excludeItemIds.includes(item.id))
  const pool = preferred.length >= count ? preferred : ranked

  if (variationIndex <= 0 || pool.length <= count) {
    return pool.slice(0, count)
  }

  const rotationWindow = Math.min(pool.length, Math.max(count + 1, VARIATION_WINDOW))
  const offset = variationIndex % rotationWindow
  const rotated = []

  for (let index = 0; index < rotationWindow && rotated.length < count; index += 1) {
    rotated.push(pool[(offset + index) % rotationWindow])
  }

  return rotated
}

export const outfitService = {
  async generateOutfit({ weather, occasion, wardrobe, excludeItemIds = [], variationIndex = 0 }) {
    await delay(500)
    if (!wardrobe || wardrobe.length === 0) {
      return ok({ items: [], reason: 'Add some items to your wardrobe to get outfit suggestions!', meta: { mainItemsCount: 0, accessoryCount: 0 }, vtoImage: null })
    }

    const cleanWardrobe = wardrobe
      .map(item => ({ ...item, laundryStatus: getLaundryStatus(item) }))
      .filter(item => !item.laundryStatus.isDirty)

    if (cleanWardrobe.length === 0) {
      return ok({
        items: [],
        reason: 'No clean outfit is available right now. Mark items clean in Laundry or add more pieces to your wardrobe.',
        meta: { mainItemsCount: 0, accessoryCount: 0, cleanItemCount: 0, variationIndex },
        vtoImage: null,
      })
    }

    const scored = cleanWardrobe.map(i => ({ ...i, _score: scoreItem(i, occasion, weather) }))
    const pickOptions = { excludeItemIds, variationIndex }
    const tops = pickBest(scored, 'top', pickOptions)
    const bottoms = pickBest(scored, 'bottom', pickOptions)
    const shoes = pickBest(scored, 'shoes', pickOptions)
    const outers = weather?.tempC < 15 ? pickBest(scored, 'outer', pickOptions) : []
    const accessories = pickBest(scored, 'accessories', { ...pickOptions, count: 2 })

    const selected = [...tops, ...bottoms, ...shoes, ...outers, ...accessories].filter(Boolean)
    const mainItemsCount = tops.length + bottoms.length + shoes.length

    if (mainItemsCount === 0) {
      return ok({
        items: [],
        reason: 'Not enough clean core pieces are available for this look. Mark items clean in Laundry to expand today\'s options.',
        meta: { mainItemsCount: 0, accessoryCount: accessories.length, cleanItemCount: cleanWardrobe.length, variationIndex },
        vtoImage: null,
      })
    }

    const conditionText = weather?.condition ? ` with ${weather.condition.toLowerCase()}` : ''
    const tempText = weather?.tempC !== undefined ? ` at ${weather.tempC}°C` : ''
    const variationText = variationIndex > 0
      ? 'Showing a fresh clean variation under the same conditions.'
      : 'Only clean pieces were considered, based on your laundry status.'
    const reason = `Outfit picked for ${occasion}${conditionText}${tempText}. ${variationText}`

    return ok({
      id: uuidv4(),
      date: new Date().toISOString(),
      weather,
      occasion,
      items: selected,
      reason,
      accepted: false,
      vtoImage: null,
      meta: {
        mainItemsCount,
        accessoryCount: accessories.length,
        cleanItemCount: cleanWardrobe.length,
        variationIndex,
      },
    })
  },

  async acceptOutfit(outfit) {
    await delay(300)
    const acceptedAt = new Date().toISOString()
    const history = safeParse(OUTFIT_HISTORY_KEY, [])
    const accepted = {
      ...outfit,
      accepted: true,
      generatedAt: outfit?.date || null,
      acceptedAt,
      wornAt: acceptedAt,
      date: acceptedAt,
    }

    const wardrobe = safeParse(WARDROBE_KEY, [])
    const wornItemIds = new Set((accepted.items || []).map((item) => item.id))
    if (wardrobe.length && wornItemIds.size) {
      const updatedWardrobe = wardrobe.map((item) => (
        wornItemIds.has(item.id)
          ? {
            ...item,
            lastWorn: acceptedAt,
            acceptedWearAt: acceptedAt,
            inLaundry: false,
            updatedAt: acceptedAt,
          }
          : item
      ))
      safeSet(WARDROBE_KEY, updatedWardrobe)
    }

    history.unshift(accepted)
    safeSet(OUTFIT_HISTORY_KEY, history.slice(0, 50))
    return ok(accepted)
  },

  async getOutfitHistory() {
    await delay(300)
    return ok(safeParse(OUTFIT_HISTORY_KEY, []))
  },

  async saveFavoriteStyle(outfit) {
    await delay(200)
    const favorites = safeParse(FAVORITE_STYLES_KEY, [])
    const sourceOutfitId = outfit?.id || uuidv4()
    const alreadySaved = favorites.some((entry) => entry.sourceOutfitId === sourceOutfitId)
    if (alreadySaved) return ok(favorites)

    const favorite = {
      ...outfit,
      id: uuidv4(),
      sourceOutfitId,
      favoriteAt: new Date().toISOString(),
      savedAsFavorite: true,
    }
    favorites.unshift(favorite)
    safeSet(FAVORITE_STYLES_KEY, favorites.slice(0, 100))
    return ok(favorite)
  },

  async getFavoriteStyles() {
    await delay(200)
    return ok(safeParse(FAVORITE_STYLES_KEY, []))
  },
}
