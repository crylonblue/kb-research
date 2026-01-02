'use client'

import { useState, useEffect } from 'react'
import Papa from 'papaparse'

interface ManagerData {
  manager_id: string
  manager_name: string
  team_value_dashboard: string
  team_value_calculated: string
  profit_taken: string
  unrealized_profit_loss: string
  bank_balance: string
  available_liquidity: string
}

export default function Managers() {
  const [managers, setManagers] = useState<ManagerData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sortField, setSortField] = useState<keyof ManagerData>('manager_name')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  useEffect(() => {
    // Try to find the manager liquidity CSV file
    // The filename format is manager_liquidity_{league_id}.csv
    // We'll try common league IDs or look for any manager_liquidity file
    const possibleFiles = [
      'manager_liquidity.csv', // Generic filename (most recent)
      'manager_liquidity_7087364.csv', // Example league ID from the data
      'manager_liquidity_1.csv'
    ]

    const loadManagers = async () => {
      for (const filename of possibleFiles) {
        try {
          const response = await fetch(`/${filename}`)
          if (response.ok) {
            const csv = await response.text()
            Papa.parse<ManagerData>(csv, {
              header: true,
              skipEmptyLines: true,
              complete: (results) => {
                setManagers(results.data)
                setLoading(false)
                setError(null)
              },
              error: (error: any) => {
                console.error('CSV parsing error:', error)
                setError('Error parsing CSV file')
                setLoading(false)
              }
            })
            return
          }
        } catch (err) {
          continue
        }
      }
      setError('Manager liquidity CSV file not found. Please run the calculate_manager_liquidity.py script first.')
      setLoading(false)
    }

    loadManagers()
  }, [])

  const formatCurrency = (value: string | number): string => {
    const num = typeof value === 'string' ? parseFloat(value) : value
    if (isNaN(num)) return 'N/A'
    
    if (num >= 1000000) {
      return `€${(num / 1000000).toFixed(2)}M`
    }
    if (num >= 1000) {
      return `€${(num / 1000).toFixed(1)}K`
    }
    return `€${num.toFixed(0)}`
  }

  const formatNumber = (value: string | number): string => {
    const num = typeof value === 'string' ? parseFloat(value) : value
    if (isNaN(num)) return 'N/A'
    return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  const handleSort = (field: keyof ManagerData) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const sortedManagers = [...managers].sort((a, b) => {
    const aValue = parseFloat(a[sortField] as string) || 0
    const bValue = parseFloat(b[sortField] as string) || 0
    
    if (sortField === 'manager_name') {
      const aName = a[sortField] || ''
      const bName = b[sortField] || ''
      return sortDirection === 'asc' 
        ? aName.localeCompare(bName)
        : bName.localeCompare(aName)
    }
    
    return sortDirection === 'asc' ? aValue - bValue : bValue - aValue
  })

  const getDiscrepancy = (dashboard: string, calculated: string): number => {
    const dash = parseFloat(dashboard) || 0
    const calc = parseFloat(calculated) || 0
    return Math.abs(dash - calc)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading managers...</div>
      </div>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen p-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-4">Manager Liquidity</h1>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">Manager Liquidity</h1>
        <p className="text-gray-600 mb-8">
          View bank balance and available liquidity for all managers in the league.
        </p>

        {managers.length === 0 ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <p className="text-yellow-800">No manager data found.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('manager_name')}
                    >
                      Manager
                      {sortField === 'manager_name' && (
                        <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('team_value_dashboard')}
                    >
                      Team Value
                      {sortField === 'team_value_dashboard' && (
                        <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('profit_taken')}
                    >
                      Profit Taken
                      {sortField === 'profit_taken' && (
                        <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('unrealized_profit_loss')}
                    >
                      Unrealized P/L
                      {sortField === 'unrealized_profit_loss' && (
                        <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('bank_balance')}
                    >
                      Bank Balance
                      {sortField === 'bank_balance' && (
                        <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('available_liquidity')}
                    >
                      Available Liquidity
                      {sortField === 'available_liquidity' && (
                        <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedManagers.map((manager, index) => {
                    const discrepancy = getDiscrepancy(
                      manager.team_value_dashboard,
                      manager.team_value_calculated
                    )
                    const hasDiscrepancy = discrepancy > 0.01

                    return (
                      <tr key={manager.manager_id || index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {manager.manager_name}
                          </div>
                          <div className="text-xs text-gray-500">ID: {manager.manager_id}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {formatCurrency(manager.team_value_dashboard)}
                          </div>
                          {hasDiscrepancy && (
                            <div className="text-xs text-yellow-600">
                              ⚠️ Calc: {formatCurrency(manager.team_value_calculated)}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(manager.profit_taken)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(manager.unrealized_profit_loss)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm font-semibold ${
                            parseFloat(manager.bank_balance) >= 0 
                              ? 'text-green-600' 
                              : 'text-red-600'
                          }`}>
                            {formatCurrency(manager.bank_balance)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm font-semibold ${
                            parseFloat(manager.available_liquidity) >= 0 
                              ? 'text-green-600' 
                              : 'text-red-600'
                          }`}>
                            {formatCurrency(manager.available_liquidity)}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {managers.length > 0 && (
          <div className="mt-6 bg-white rounded-lg shadow border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4">Summary Statistics</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-gray-600">Total Managers</div>
                <div className="text-2xl font-bold">{managers.length}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Avg Bank Balance</div>
                <div className="text-2xl font-bold">
                  {formatCurrency(
                    managers.reduce((sum, m) => sum + (parseFloat(m.bank_balance) || 0), 0) / managers.length
                  )}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Avg Available Liquidity</div>
                <div className="text-2xl font-bold">
                  {formatCurrency(
                    managers.reduce((sum, m) => sum + (parseFloat(m.available_liquidity) || 0), 0) / managers.length
                  )}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Total Team Value</div>
                <div className="text-2xl font-bold">
                  {formatCurrency(
                    managers.reduce((sum, m) => sum + (parseFloat(m.team_value_dashboard) || 0), 0)
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

