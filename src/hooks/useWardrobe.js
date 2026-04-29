import { useState, useEffect, useCallback } from 'react'
import { wardrobeService } from '../services/wardrobeService'

export function useWardrobe() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadItems = useCallback(async () => {
    setLoading(true)
    const res = await wardrobeService.getAllItems()
    if (res.success) setItems(res.data)
    else setError(res.error)
    setLoading(false)
  }, [])

  useEffect(() => { loadItems() }, [loadItems])

  const addItem = useCallback(async (payload) => {
    const res = await wardrobeService.createItem(payload)
    if (res.success) setItems(prev => [...prev, res.data])
    return res
  }, [])

  const editItem = useCallback(async (id, payload) => {
    const res = await wardrobeService.updateItem(id, payload)
    if (res.success) setItems(prev => prev.map(i => i.id === id ? res.data : i))
    return res
  }, [])

  const removeItem = useCallback(async (id) => {
    const res = await wardrobeService.deleteItem(id)
    if (res.success) setItems(prev => prev.filter(i => i.id !== id))
    return res
  }, [])

  const toggleFav = useCallback(async (id) => {
    const res = await wardrobeService.toggleFavorite(id)
    if (res.success) setItems(prev => prev.map(i => i.id === id ? res.data : i))
    return res
  }, [])

  const markClean = useCallback(async (ids) => {
    const res = await wardrobeService.bulkUpdate(ids, { inLaundry: false, lastWorn: null, acceptedWearAt: null })
    if (res.success) setItems(res.data)
    return res
  }, [])

  return { items, loading, error, reload: loadItems, addItem, editItem, removeItem, toggleFav, markClean }
}
