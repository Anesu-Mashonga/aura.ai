import { useState, useCallback, useEffect } from 'react'
import { outfitService } from '../services/outfitService'

export function useOutfit() {
  const [outfit, setOutfit] = useState(null)
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState([])
  const [historyLoading, setHistoryLoading] = useState(true)
  const [favoriteStyles, setFavoriteStyles] = useState([])
  const [favoriteLoading, setFavoriteLoading] = useState(true)

  const refreshHistory = useCallback(async () => {
    setHistoryLoading(true)
    const res = await outfitService.getOutfitHistory()
    if (res.success) setHistory(res.data)
    setHistoryLoading(false)
    return res
  }, [])

  useEffect(() => {
    refreshHistory()
  }, [refreshHistory])

  const refreshFavorites = useCallback(async () => {
    setFavoriteLoading(true)
    const res = await outfitService.getFavoriteStyles()
    if (res.success) setFavoriteStyles(res.data)
    setFavoriteLoading(false)
    return res
  }, [])

  useEffect(() => {
    refreshFavorites()
  }, [refreshFavorites])

  const generate = useCallback(async (options) => {
    setLoading(true)
    const res = await outfitService.generateOutfit(options)
    if (res.success) setOutfit(res.data)
    setLoading(false)
    return res
  }, [])

  const accept = useCallback(async () => {
    if (!outfit) return
    const res = await outfitService.acceptOutfit(outfit)
    if (res.success) {
      setOutfit(res.data)
      setHistory((current) => [
        res.data,
        ...current.filter((entry) => entry.id !== res.data.id),
      ].slice(0, 50))
    }
    return res
  }, [outfit])

  const saveFavorite = useCallback(async () => {
    if (!outfit) return
    const res = await outfitService.saveFavoriteStyle(outfit)
    if (res.success) {
      setFavoriteStyles((current) => [
        res.data,
        ...current.filter((entry) => entry.sourceOutfitId !== res.data.sourceOutfitId),
      ].slice(0, 100))
    }
    return res
  }, [outfit])

  return {
    outfit,
    loading,
    generate,
    accept,
    saveFavorite,
    history,
    historyLoading,
    refreshHistory,
    favoriteStyles,
    favoriteLoading,
    refreshFavorites,
  }
}
