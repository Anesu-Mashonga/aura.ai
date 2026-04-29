import { v4 as uuidv4 } from 'uuid'
import { delay, ok, fail, safeParse, safeSet } from './utils'
import { DEMO_WARDROBE_MEDIA, INITIAL_WARDROBE } from '../data/seedData'

const WARDROBE_KEY = 'alclo_wardrobe'

function getItems() {
  return safeParse(WARDROBE_KEY, null)
}

function migrateDemoImages(items) {
  let changed = false
  const nextItems = items.map((item) => {
    const localImage = DEMO_WARDROBE_MEDIA[item.name]
    if (!localImage) return item
    if (!item.imageUrl || !item.imageUrl.includes('images.unsplash.com')) return item
    changed = true
    return { ...item, imageUrl: localImage }
  })

  if (changed) {
    safeSet(WARDROBE_KEY, nextItems)
  }

  return nextItems
}

export const wardrobeService = {
  async seedInitialDataIfEmpty() {
    const existing = safeParse(WARDROBE_KEY, null)
    if (!existing) {
      safeSet(WARDROBE_KEY, INITIAL_WARDROBE)
      return
    }

    migrateDemoImages(existing)
  },

  async getAllItems() {
    await delay(300)
    const items = getItems() || []
    return ok(migrateDemoImages(items))
  },

  async getItemById(id) {
    await delay(200)
    const items = getItems() || []
    const item = items.find(i => i.id === id)
    return item ? ok(item) : fail('NOT_FOUND', 'Item not found.')
  },

  async createItem(payload) {
    await delay(400)
    const items = getItems() || []
    const newItem = {
      ...payload,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      favorite: payload.favorite || false,
      inLaundry: false,
      tags: payload.tags || [],
    }
    items.push(newItem)
    safeSet(WARDROBE_KEY, items)
    return ok(newItem)
  },

  async updateItem(id, payload) {
    await delay(400)
    const items = getItems() || []
    const idx = items.findIndex(i => i.id === id)
    if (idx === -1) return fail('NOT_FOUND', 'Item not found.')
    items[idx] = { ...items[idx], ...payload, updatedAt: new Date().toISOString() }
    safeSet(WARDROBE_KEY, items)
    return ok(items[idx])
  },

  async deleteItem(id) {
    await delay(300)
    const items = getItems() || []
    const filtered = items.filter(i => i.id !== id)
    if (filtered.length === items.length) return fail('NOT_FOUND', 'Item not found.')
    safeSet(WARDROBE_KEY, filtered)
    return ok({ id })
  },

  async toggleFavorite(id) {
    await delay(200)
    const items = getItems() || []
    const idx = items.findIndex(i => i.id === id)
    if (idx === -1) return fail('NOT_FOUND', 'Item not found.')
    items[idx].favorite = !items[idx].favorite
    items[idx].updatedAt = new Date().toISOString()
    safeSet(WARDROBE_KEY, items)
    return ok(items[idx])
  },

  async bulkUpdate(ids, patch) {
    await delay(300)
    const items = getItems() || []
    ids.forEach(id => {
      const idx = items.findIndex(i => i.id === id)
      if (idx !== -1) items[idx] = { ...items[idx], ...patch, updatedAt: new Date().toISOString() }
    })
    safeSet(WARDROBE_KEY, items)
    return ok(items)
  },
}
