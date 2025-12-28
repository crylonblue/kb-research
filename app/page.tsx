'use client'

import { useState, useEffect, useMemo } from 'react'
import Papa from 'papaparse'

interface Player {
  i: string
  fn: string
  ln: string
  ap: string
  smc: string  // smc = gespielte Spiele
  mv: string
  fair_market_value: string
  mv_diff: string
  mv_diff_pct: string
  tn: string
  pos: string
  tp: string
  [key: string]: string
}

type SortField = keyof Player | null
type SortDirection = 'asc' | 'desc' | null

export default function Home() {
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [positionFilter, setPositionFilter] = useState<string>('all') // 'all', '1', '2', '3', '4'
  const [minMarketValue, setMinMarketValue] = useState<number>(0) // Min market value filter (0-50M)
  const [sortField, setSortField] = useState<SortField>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>(null)
  const [visibleColumns, setVisibleColumns] = useState<string[]>([
    'fn', 'ln', 'tn', 'pos', 'tp', 'ap', 'smc', 'mv', 'fair_market_value', 'mv_diff_pct'
  ])

  // Load CSV data
  useEffect(() => {
    fetch('/players_with_fmv.csv')
      .then(response => response.text())
      .then(csv => {
        Papa.parse<Player>(csv, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            setPlayers(results.data)
            setLoading(false)
          },
          error: (error: Error) => {
            console.error('Error parsing CSV:', error)
            setLoading(false)
          }
        })
      })
      .catch(error => {
        console.error('Error loading CSV:', error)
        setLoading(false)
      })
  }, [])

  // Filter and sort players
  const filteredAndSortedPlayers = useMemo(() => {
    let filtered = players.filter(player => {
      // Search filter
      if (searchTerm) {
        const search = searchTerm.toLowerCase()
        const matchesSearch = (
          player.fn?.toLowerCase().includes(search) ||
          player.ln?.toLowerCase().includes(search) ||
          player.tn?.toLowerCase().includes(search) ||
          player.pos?.toLowerCase().includes(search)
        )
        if (!matchesSearch) return false
      }
      
      // Position filter
      if (positionFilter !== 'all') {
        // Convert both to string for comparison to handle number/string mismatches
        const playerPos = String(player.pos || '').trim()
        const filterPos = String(positionFilter).trim()
        if (playerPos !== filterPos) {
          return false
        }
      }
      
      // Min market value filter (show only players with market value >= minMarketValue)
      const marketValue = parseFloat(player.mv || '0')
      if (marketValue < minMarketValue) {
        return false
      }
      
      return true
    })

    if (sortField && sortDirection) {
      filtered = [...filtered].sort((a, b) => {
        const aVal = a[sortField] || ''
        const bVal = b[sortField] || ''
        
        // Try to parse as number
        const aNum = parseFloat(aVal)
        const bNum = parseFloat(bVal)
        
        if (!isNaN(aNum) && !isNaN(bNum)) {
          return sortDirection === 'asc' ? aNum - bNum : bNum - aNum
        }
        
        // String comparison
        const comparison = aVal.localeCompare(bVal)
        return sortDirection === 'asc' ? comparison : -comparison
      })
    }

    return filtered
  }, [players, searchTerm, positionFilter, minMarketValue, sortField, sortDirection])

  const handleSort = (field: keyof Player) => {
    if (sortField === field) {
      if (sortDirection === 'asc') {
        setSortDirection('desc')
      } else if (sortDirection === 'desc') {
        setSortField(null)
        setSortDirection(null)
      } else {
        setSortDirection('asc')
      }
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const formatNumber = (value: string | undefined): string => {
    if (!value) return '-'
    const num = parseFloat(value)
    if (isNaN(num)) return value
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(2)}M`
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`
    }
    return num.toFixed(0)
  }

  const formatCurrency = (value: string | undefined): string => {
    if (!value) return '-'
    const num = parseFloat(value)
    if (isNaN(num)) return value
    return `€${(num / 1000000).toFixed(2)}M`
  }

  const getColumnLabel = (key: string): string => {
    const labels: Record<string, string> = {
      fn: 'First Name',
      ln: 'Last Name',
      tn: 'Team',
      pos: 'Position',
      ap: 'Avg Points',
      smc: 'Games',
      mv: 'Market Value',
      fair_market_value: 'Fair MV',
      mv_diff: 'Difference',
      mv_diff_pct: 'Diff %',
      tp: 'Total Points',
      a: 'Assists',
    }
    return labels[key] || key
  }

  const getPositionLabel = (pos: string): string => {
    const positions: Record<string, string> = {
      '1': 'GK',
      '2': 'DEF',
      '3': 'MID',
      '4': 'FWD',
    }
    return positions[pos] || pos
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading player data...</div>
      </div>
    )
  }

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">Search Player</h1>
        <p className="text-gray-600 mb-6">
          {filteredAndSortedPlayers.length} of {players.length} players
        </p>

        {/* Search Bar and Filters */}
        <div className="mb-6 space-y-4">
          <input
            type="text"
            placeholder="Search by name, team, or position..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          
          {/* Min Market Value Slider */}
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center gap-4">
              <label className="text-sm font-semibold text-gray-700 whitespace-nowrap">
                Min Market Value:
              </label>
              <div className="flex-1 flex items-center gap-4">
                <div className="flex-1 relative">
                  <input
                    type="range"
                    min="0"
                    max="50000000"
                    step="1000000"
                    value={minMarketValue}
                    onChange={(e) => setMinMarketValue(parseInt(e.target.value))}
                    className="w-full h-2 bg-gradient-to-r from-blue-500 to-blue-300 rounded-lg appearance-none cursor-pointer slider-thumb"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>€0</span>
                    <span>€50M</span>
                  </div>
                </div>
                <div className="bg-blue-50 px-4 py-2 rounded-lg border border-blue-200 min-w-[120px]">
                  <span className="text-base font-bold text-blue-700">
                    €{(minMarketValue / 1_000_000).toFixed(1)}M
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Position Filter */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Position:</label>
            <div className="flex gap-2">
              <button
                onClick={() => setPositionFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  positionFilter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Alle
              </button>
              <button
                onClick={() => setPositionFilter('1')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  positionFilter === '1'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                GK
              </button>
              <button
                onClick={() => setPositionFilter('2')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  positionFilter === '2'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                DEF
              </button>
              <button
                onClick={() => setPositionFilter('3')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  positionFilter === '3'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                MID
              </button>
              <button
                onClick={() => setPositionFilter('4')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  positionFilter === '4'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                FWD
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  {visibleColumns.map((col) => (
                    <th
                      key={col}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200"
                      onClick={() => handleSort(col as keyof Player)}
                    >
                      <div className="flex items-center gap-2">
                        {getColumnLabel(col)}
                        {sortField === col && (
                          <span className="text-blue-600">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAndSortedPlayers.map((player, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    {visibleColumns.map((col) => {
                      const value = player[col]
                      let displayValue: React.ReactNode = value || '-'

                      if (col === 'mv' || col === 'fair_market_value') {
                        displayValue = formatCurrency(value)
                      } else if (col === 'mv_diff') {
                        displayValue = formatCurrency(value)
                      } else if (col === 'mv_diff_pct') {
                        const num = parseFloat(value || '0')
                        displayValue = (
                          <span className={num >= 0 ? 'text-green-600' : 'text-red-600'}>
                            {num >= 0 ? '+' : ''}{num.toFixed(1)}%
                          </span>
                        )
                      } else if (col === 'pos') {
                        displayValue = getPositionLabel(value || '')
                      } else if (col === 'ap' || col === 'smc' || col === 'tp') {
                        displayValue = formatNumber(value)
                      }

                      return (
                        <td key={col} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {displayValue}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredAndSortedPlayers.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No players found matching your search.
          </div>
        )}
      </div>
    </main>
  )
}

