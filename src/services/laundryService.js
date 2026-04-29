import { delay, ok, safeParse, safeSet } from './utils'

const DIRTY_THRESHOLD_H = 24
const URGENT_THRESHOLD_H = 36

export function getLaundryStatus(item, now = Date.now()) {
  const hasAcceptedWearAt = Boolean(item?.acceptedWearAt)
  const hoursSinceWorn = hasAcceptedWearAt
    ? Math.floor((now - new Date(item.acceptedWearAt)) / 3600000)
    : null
  const isDirty = Boolean(item?.inLaundry) || (hoursSinceWorn !== null && hoursSinceWorn >= DIRTY_THRESHOLD_H)
  const urgency = Boolean(item?.inLaundry) || (hoursSinceWorn !== null && hoursSinceWorn >= URGENT_THRESHOLD_H)
    ? 'urgent'
    : 'normal'
  return { isDirty, hoursSinceWorn, urgency }
}

export function isCleanItem(item, now = Date.now()) {
  return !getLaundryStatus(item, now).isDirty
}

export const laundryService = {
  async getLaundryItems(wardrobe) {
    await delay(300)
    const dirty = wardrobe
      .map(item => ({ ...item, ...getLaundryStatus(item) }))
      .filter(item => item.isDirty)
    return ok(dirty)
  },

  async getLaundryStats(wardrobe) {
    await delay(200)
    const all = wardrobe.map(item => ({ ...item, ...getLaundryStatus(item) }))
    const dirtyItems = all.filter(i => i.isDirty)
    return ok({
      totalItems: all.length,
      dirtyItems: dirtyItems.length,
      urgentItems: dirtyItems.filter(i => i.urgency === 'urgent').length,
      cleanItems: all.length - dirtyItems.length,
      dirtyPercentage: all.length > 0 ? Math.round((dirtyItems.length / all.length) * 100) : 0,
    })
  },
}
