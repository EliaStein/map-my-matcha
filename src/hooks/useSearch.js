import { useState, useMemo } from 'react'

export function useSearch(items, searchFields = ['name']) {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredItems = useMemo(() => {
    if (!searchTerm.trim()) {
      return items
    }

    const term = searchTerm.toLowerCase()

    return items.filter(item => {
      return searchFields.some(field => {
        const value = item[field]
        if (Array.isArray(value)) {
          return value.some(v => String(v).toLowerCase().includes(term))
        }
        return String(value || '').toLowerCase().includes(term)
      })
    })
  }, [items, searchTerm, searchFields])

  return {
    searchTerm,
    setSearchTerm,
    filteredItems,
    hasResults: filteredItems.length > 0,
    isSearching: searchTerm.trim().length > 0
  }
}
