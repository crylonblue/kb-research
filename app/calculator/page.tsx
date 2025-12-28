'use client'

import { useState, useEffect, useMemo } from 'react'
import Papa from 'papaparse'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts'

// Formula parameters from regression.py
// These should match the values from your regression model
const A = 3_000_000  // Baseline market value
const TP0 = 200      // Total points baseline
// B and alpha will be loaded from regression_metrics.csv if available, otherwise use defaults
const DEFAULT_B = 558
const DEFAULT_ALPHA = 1.445

interface RegressionMetrics {
  A?: number
  TP0?: number
  B?: number
  alpha?: number
  n_samples?: number
}

export default function Calculator() {
  const [totalPoints, setTotalPoints] = useState<string>('')
  const [fairMarketValue, setFairMarketValue] = useState<number | null>(null)
  const [B, setB] = useState<number>(DEFAULT_B)
  const [alpha, setAlpha] = useState<number>(DEFAULT_ALPHA)
  const [loading, setLoading] = useState(true)

  // Try to load regression metrics from CSV
  useEffect(() => {
    fetch('/regression_metrics.csv')
      .then(response => {
        if (response.ok) {
          return response.text()
        }
        throw new Error('Metrics file not found')
      })
      .then(csv => {
        Papa.parse<RegressionMetrics>(csv, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            if (results.data.length > 0) {
              const metrics = results.data[0]
              // Load B and alpha from metrics, keep A and TP0 as constants
              if (metrics.B) setB(parseFloat(String(metrics.B)))
              if (metrics.alpha) setAlpha(parseFloat(String(metrics.alpha)))
            }
            setLoading(false)
          },
          error: () => {
            setLoading(false)
          }
        })
      })
      .catch(() => {
        // Use default values if file doesn't exist
        setLoading(false)
      })
  }, [])

  const calculateFMV = (points: string) => {
    const tp = parseFloat(points)
    
    if (isNaN(tp) || tp <= TP0) {
      return A  // Return baseline if points are too low or invalid
    }
    
    return A + B * Math.pow(tp - TP0, alpha)
  }

  const handlePointsChange = (value: string) => {
    setTotalPoints(value)
    
    if (value === '' || value === null) {
      setFairMarketValue(null)
      return
    }
    
    const fmv = calculateFMV(value)
    setFairMarketValue(fmv)
  }

  const formatCurrency = (value: number): string => {
    if (value >= 1000000) {
      return `€${(value / 1000000).toFixed(2)}M`
    }
    if (value >= 1000) {
      return `€${(value / 1000).toFixed(1)}K`
    }
    return `€${value.toFixed(0)}`
  }

  // Generate data points for the chart
  const chartData = useMemo(() => {
    const points: Array<{ tp: number; fmv: number }> = []
    // Generate points from TP0 to 4000 (reasonable range)
    for (let tp = TP0; tp <= 4000; tp += 50) {
      // Calculate FMV directly here to avoid dependency issues
      const fmv = tp <= TP0 ? A : A + B * Math.pow(tp - TP0, alpha)
      points.push({ tp, fmv })
    }
    return points
  }, [B, alpha])

  // Format chart tooltip with rounded and human-readable numbers
  const formatTooltip = (value: number, name: string) => {
    if (name === 'fmv') {
      // Round to nearest thousand for better readability
      const rounded = Math.round(value / 1000) * 1000
      return formatCurrency(rounded)
    }
    // Round total points to nearest integer
    return Math.round(value).toLocaleString()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading calculator...</div>
      </div>
    )
  }

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">Fair Market Value Calculator</h1>
        <p className="text-gray-600 mb-8">
          Calculate the fair market value based on total points using our regression model.
        </p>

        {/* Formula Display */}
        <div className="bg-white p-6 rounded-lg shadow mb-8 border border-gray-200">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Formula</h2>
          <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm mb-4">
            <div className="mb-2">FMV = A + B · (TP − TP₀)^α</div>
            <div className="text-xs text-gray-600 mt-2">
              Where TP = Total Points
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">A (Baseline):</span>
              <span className="ml-2 font-semibold">{formatCurrency(A)}</span>
            </div>
            <div>
              <span className="text-gray-600">TP₀ (Points Baseline):</span>
              <span className="ml-2 font-semibold">{TP0}</span>
            </div>
            <div>
              <span className="text-gray-600">B (Scaling):</span>
              <span className="ml-2 font-semibold">{B.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-gray-600">α (Exponent):</span>
              <span className="ml-2 font-semibold">{alpha.toFixed(3)}</span>
            </div>
          </div>
        </div>

        {/* Calculator */}
        <div className="bg-white p-8 rounded-lg shadow border border-gray-200">
          <h2 className="text-xl font-semibold mb-6 text-gray-800">Calculate FMV</h2>
          
          <div className="space-y-6">
            <div>
              <label htmlFor="total-points" className="block text-sm font-medium text-gray-700 mb-2">
                Total Points (TP)
              </label>
              <input
                id="total-points"
                type="number"
                value={totalPoints}
                onChange={(e) => handlePointsChange(e.target.value)}
                placeholder="Enter total points"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                min="0"
                step="1"
              />
              <p className="mt-2 text-sm text-gray-500">
                Enter the player's total points. Values ≤ {TP0} will return the baseline value.
              </p>
            </div>

            {fairMarketValue !== null && (
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
                <div className="text-sm text-gray-600 mb-2">Fair Market Value</div>
                <div className="text-4xl font-bold text-blue-700">
                  {formatCurrency(fairMarketValue)}
                </div>
                <div className="mt-4 text-sm text-gray-600">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-gray-500">Calculation:</span>
                      <div className="font-mono text-xs mt-1">
                        {A.toLocaleString()} + {B.toLocaleString()} · ({totalPoints} − {TP0})^
                        {alpha.toFixed(3)}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500">Result:</span>
                      <div className="font-mono text-xs mt-1">
                        {fairMarketValue.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {totalPoints && parseFloat(totalPoints) <= TP0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="text-sm text-yellow-800">
                  ⚠️ Points are at or below the baseline ({TP0}). The FMV will be set to the baseline value of {formatCurrency(A)}.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Chart */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow border border-gray-200">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">FMV Function Graph</h3>
          <p className="text-sm text-gray-600 mb-4">
            Visual representation of how Fair Market Value changes with Total Points
          </p>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="tp" 
                label={{ value: 'Total Points (TP)', position: 'insideBottom', offset: -5 }}
                tickFormatter={(value) => value.toLocaleString()}
                domain={[TP0, 4000]}
              />
              <YAxis 
                label={{ value: 'Fair Market Value', angle: -90, position: 'insideLeft' }}
                tickFormatter={(value) => formatCurrency(value)}
              />
              <Tooltip 
                formatter={formatTooltip}
                labelFormatter={(value) => `Total Points: ${Math.round(Number(value)).toLocaleString()}`}
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="fmv" 
                stroke="#2563eb" 
                strokeWidth={3}
                dot={false}
                name="Fair Market Value"
              />
              {totalPoints && parseFloat(totalPoints) > TP0 && (
                <ReferenceLine 
                  x={parseFloat(totalPoints)} 
                  stroke="#ef4444" 
                  strokeDasharray="5 5"
                  label={{ value: 'Current Input', position: 'top' }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
          {totalPoints && parseFloat(totalPoints) > TP0 && (
            <div className="mt-4 text-sm text-gray-600 text-center">
              Red dashed line shows your input: {totalPoints} points = {formatCurrency(fairMarketValue!)}
            </div>
          )}
        </div>

        {/* Examples */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow border border-gray-200">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Example Calculations</h3>
          <div className="space-y-3">
            {[300, 500, 1000, 2000].map((points) => {
              const fmv = calculateFMV(String(points))
              return (
                <div key={points} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                  <span className="text-gray-600">{points} points</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(fmv)}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </main>
  )
}

