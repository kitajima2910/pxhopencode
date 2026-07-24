import { useState } from 'react'
import { GAMES, RESOURCE_TYPES, PRODUCTS } from '../data/products'

interface MobileFiltersProps {
  selectedGame: string
  selectedType: string
  priceRange: [number, number]
  onGameChange: (g: string) => void
  onTypeChange: (t: string) => void
  onPriceRangeChange: (r: [number, number]) => void
  totalResults: number
}

const PRICE_RANGES = [
  { label: 'Tất cả', min: 0, max: Infinity },
  { label: 'Dưới 50k', min: 0, max: 50000 },
  { label: '50k - 200k', min: 50000, max: 200000 },
  { label: '200k - 500k', min: 200000, max: 500000 },
  { label: '500k - 1tr', min: 500000, max: 1000000 },
  { label: 'Trên 1tr', min: 1000000, max: Infinity },
]

const gameCounts = (gameId: string) => PRODUCTS.filter(p => p.gameId === gameId).length
const typeCounts = (typeId: string, gameId: string) =>
  PRODUCTS.filter(p => p.resourceType === typeId && (!gameId || p.gameId === gameId)).length

export default function MobileFilters({
  selectedGame, selectedType, priceRange,
  onGameChange, onTypeChange, onPriceRangeChange, totalResults,
}: MobileFiltersProps) {
  const [open, setOpen] = useState<'game' | 'type' | 'price' | null>(null)

  return (
    <div className="lg:hidden border-b border-gray-800 bg-gray-900/50">
      <div className="px-4 py-2 flex items-center gap-2 overflow-x-auto">
        <button
          onClick={() => setOpen(open === 'game' ? null : 'game')}
          className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            open === 'game' ? 'bg-white/10 text-white' : 'bg-gray-800 text-gray-400'
          }`}
        >
          🎮 {selectedGame ? GAMES.find(g => g.id === selectedGame)?.name : 'Game'}
        </button>
        <button
          onClick={() => setOpen(open === 'type' ? null : 'type')}
          className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            open === 'type' ? 'bg-white/10 text-white' : 'bg-gray-800 text-gray-400'
          }`}
        >
          📋 {selectedType ? RESOURCE_TYPES.find(r => r.id === selectedType)?.name : 'Loại'}
        </button>
        <button
          onClick={() => setOpen(open === 'price' ? null : 'price')}
          className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            open === 'price' ? 'bg-white/10 text-white' : 'bg-gray-800 text-gray-400'
          }`}
        >
          💰 {priceRange[1] === Infinity && priceRange[0] === 0 ? 'Giá' : PRICE_RANGES.find(r => r.min === priceRange[0] && r.max === priceRange[1])?.label || 'Giá'}
        </button>
        <span className="text-xs text-gray-600 ml-auto shrink-0">{totalResults} sp</span>
      </div>

      {open === 'game' && (
        <div className="px-4 pb-3 flex flex-wrap gap-2">
          <button onClick={() => { onGameChange(''); setOpen(null) }} className={`px-3 py-1.5 rounded-lg text-xs ${selectedGame === '' ? 'bg-white/10 text-white' : 'bg-gray-800 text-gray-400'}`}>
            Tất cả ({PRODUCTS.length})
          </button>
          {GAMES.map(g => (
            <button key={g.id} onClick={() => { onGameChange(g.id); setOpen(null) }} className={`px-3 py-1.5 rounded-lg text-xs ${selectedGame === g.id ? 'bg-white/10 text-white' : 'bg-gray-800 text-gray-400'}`}>
              {g.icon} {g.name} ({gameCounts(g.id)})
            </button>
          ))}
        </div>
      )}

      {open === 'type' && (
        <div className="px-4 pb-3 flex flex-wrap gap-2">
          <button onClick={() => { onTypeChange(''); setOpen(null) }} className={`px-3 py-1.5 rounded-lg text-xs ${selectedType === '' ? 'bg-white/10 text-white' : 'bg-gray-800 text-gray-400'}`}>
            Tất cả
          </button>
          {RESOURCE_TYPES.map(rt => (
            <button key={rt.id} onClick={() => { onTypeChange(rt.id); setOpen(null) }} className={`px-3 py-1.5 rounded-lg text-xs ${selectedType === rt.id ? 'bg-white/10 text-white' : 'bg-gray-800 text-gray-400'}`}>
              {rt.icon} {rt.name} ({typeCounts(rt.id, selectedGame)})
            </button>
          ))}
        </div>
      )}

      {open === 'price' && (
        <div className="px-4 pb-3 flex flex-wrap gap-2">
          {PRICE_RANGES.map((r, i) => {
            const active = priceRange[0] === r.min && priceRange[1] === r.max
            return (
              <button
                key={i}
                onClick={() => { onPriceRangeChange([r.min, r.max]); setOpen(null) }}
                className={`px-3 py-1.5 rounded-lg text-xs ${active ? 'bg-white/10 text-white' : 'bg-gray-800 text-gray-400'}`}
              >
                {r.label}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
