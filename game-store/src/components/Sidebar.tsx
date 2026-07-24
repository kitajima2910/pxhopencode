import { RESOURCE_TYPES, GAMES } from '../data/products'

interface SidebarProps {
  selectedGame: string
  selectedType: string
  onGameChange: (g: string) => void
  onTypeChange: (t: string) => void
  priceRange: [number, number]
  onPriceRangeChange: (range: [number, number]) => void
}

const PRICE_RANGES = [
  { label: 'Tất cả', min: 0, max: Infinity },
  { label: 'Dưới 50k', min: 0, max: 50000 },
  { label: '50k - 200k', min: 50000, max: 200000 },
  { label: '200k - 500k', min: 200000, max: 500000 },
  { label: '500k - 1tr', min: 500000, max: 1000000 },
  { label: 'Trên 1tr', min: 1000000, max: Infinity },
]

export default function Sidebar({ selectedGame, selectedType, onGameChange, onTypeChange, priceRange, onPriceRangeChange }: SidebarProps) {
  return (
    <aside className="w-64 shrink-0 hidden lg:block">
      <div className="sticky top-20 space-y-6">
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Game</h3>
          <div className="space-y-1">
            <button
              onClick={() => onGameChange('')}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                selectedGame === '' ? 'bg-white/10 text-white font-medium' : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              🎮 Tất cả game
            </button>
            {GAMES.map(g => (
              <button
                key={g.id}
                onClick={() => onGameChange(g.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  selectedGame === g.id ? 'bg-white/10 text-white font-medium' : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {g.icon} {g.name}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Loại</h3>
          <div className="space-y-1">
            <button
              onClick={() => onTypeChange('')}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                selectedType === '' ? 'bg-white/10 text-white font-medium' : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              📋 Tất cả loại
            </button>
            {RESOURCE_TYPES.map(rt => (
              <button
                key={rt.id}
                onClick={() => onTypeChange(rt.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  selectedType === rt.id ? 'bg-white/10 text-white font-medium' : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {rt.icon} {rt.name}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Giá</h3>
          <div className="space-y-1">
            {PRICE_RANGES.map((r, i) => {
              const active = priceRange[0] === r.min && priceRange[1] === r.max
              return (
                <button
                  key={i}
                  onClick={() => onPriceRangeChange([r.min, r.max])}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    active ? 'bg-white/10 text-white font-medium' : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {r.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </aside>
  )
}
