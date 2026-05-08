export const BODY_SHAPES = [
  { value: "balanced", label: "Balanced" },
  { value: "triangle", label: "Triangle" },
  { value: "inverted-triangle", label: "Inverted Triangle" },
  { value: "rectangle", label: "Rectangle" },
  { value: "oval", label: "Oval" },
]

export const FIT_PREFERENCES = [
  { value: "regular", label: "Regular" },
  { value: "relaxed", label: "Relaxed" },
  { value: "tailored", label: "Tailored" },
  { value: "loose", label: "Loose" },
]

export const MOBILITY_PREFERENCES = [
  { value: "none", label: "No adaptive preference" },
  { value: "seated-friendly", label: "Seated-friendly" },
  { value: "easy-fastening", label: "Easy fastening" },
  { value: "low-friction", label: "Low-friction fabrics" },
]

export const STYLE_TRENDS = [
  {
    id: "quiet-luxury",
    title: "Quiet Luxury",
    summary: "Minimal, clean lines and premium-looking neutrals.",
    occasions: ["Work", "Date", "Casual"],
    keywords: ["blazer", "shirt", "chinos", "loafers", "neutral", "minimal"],
    pinterestUrl: "https://www.pinterest.com/search/pins/?q=quiet%20luxury%20outfit",
  },
  {
    id: "streetwear-modern",
    title: "Modern Streetwear",
    summary: "Layered casual pieces, sneakers, utility accents.",
    occasions: ["Casual", "Party"],
    keywords: ["joggers", "bomber", "sneakers", "oversized", "hoodie", "streetwear"],
    pinterestUrl: "https://www.pinterest.com/search/pins/?q=modern%20streetwear%20outfit",
  },
  {
    id: "smart-casual-core",
    title: "Smart Casual Core",
    summary: "Polished everyday staples with comfort-first fit.",
    occasions: ["Work", "Casual", "Date"],
    keywords: ["polo", "chinos", "jeans", "jacket", "boots", "smart"],
    pinterestUrl: "https://www.pinterest.com/search/pins/?q=smart%20casual%20outfit",
  },
  {
    id: "athleisure-active",
    title: "Athleisure Active",
    summary: "Movement-friendly looks for sport and lifestyle.",
    occasions: ["Sport", "Casual"],
    keywords: ["tee", "leggings", "joggers", "trainers", "sport", "active"],
    pinterestUrl: "https://www.pinterest.com/search/pins/?q=athleisure%20outfit",
  },
  {
    id: "soft-feminine",
    title: "Soft Feminine",
    summary: "Elegant silhouettes, soft textures and lighter palettes.",
    occasions: ["Date", "Party", "Casual"],
    keywords: ["blouse", "dressy", "layer", "heels", "soft", "flowy"],
    pinterestUrl: "https://www.pinterest.com/search/pins/?q=soft%20feminine%20style",
  },
  {
    id: "afrofusion-bold",
    title: "Afro-Fusion Bold",
    summary: "Color-forward combinations with strong cultural flair.",
    occasions: ["Party", "Date", "Casual"],
    keywords: ["bold", "pattern", "statement", "vibrant", "print", "layer"],
    pinterestUrl: "https://www.pinterest.com/search/pins/?q=afrofusion%20fashion",
  },
]

export function getDefaultPhysicalProfile() {
  return {
    heightCm: null,
    weightKg: null,
    bodyShape: "balanced",
    hasPotbelly: false,
    pregnant: false,
    hasDisability: false,
    disabilityNotes: "",
    fitPreference: "regular",
    mobilityPreference: "none",
  }
}

export function getDefaultStyleTaste() {
  return {
    likedTrendIds: [],
    source: "in-app-curated",
    lastUpdated: null,
  }
}

export function isOnboardingComplete(user) {
  if (!user) return false

  const heightCm = Number(user?.physicalProfile?.heightCm)
  const weightKg = Number(user?.physicalProfile?.weightKg)
  const hasBasicPhysicalProfile = Number.isFinite(heightCm)
    && heightCm > 0
    && Number.isFinite(weightKg)
    && weightKg > 0

  const likedTrendIds = user?.styleTaste?.likedTrendIds || []
  const hasStyleSelection = Array.isArray(likedTrendIds) && likedTrendIds.length > 0

  return hasBasicPhysicalProfile && hasStyleSelection
}