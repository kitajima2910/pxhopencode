import { Search, ShoppingCart, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { useCart } from '../context/CartContext'
import { GAMES, gameTextColorMap } from '../data/products'

interface HeaderProps {
  searchQuery: string
  onSearchChange: (q: string) => void
  onCartClick: () => void
  selectedGame: string
  onGameChange: (g: string) => void
}

export default function Header({ searchQuery, onSearchChange, onCartClick, selectedGame, onGameChange }: HeaderProps) {
  const { itemCount, totalAmount } = useCart()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 bg-gray-950/95 backdrop-blur border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-4">
        <button className="lg:hidden text-gray-400 hover:text-white" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-2xl">🎮</span>
          <span className="font-bold text-lg hidden sm:block bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
            GameStore
          </span>
        </div>

        <div className="hidden lg:flex items-center gap-1 ml-4">
          <button
            onClick={() => onGameChange('')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              selectedGame === '' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Tất Cả
          </button>
          {GAMES.map(g => (
            <button
              key={g.id}
              onClick={() => onGameChange(g.id)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                selectedGame === g.id
                  ? `bg-white/10 ${gameTextColorMap[g.id]}`
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {g.icon} {g.name}
            </button>
          ))}
        </div>

        <div className="flex-1" />

        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="Tìm sản phẩm..."
            className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>

        <button
          onClick={onCartClick}
          className="relative flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-xl transition-colors"
        >
          <ShoppingCart size={20} />
          {itemCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-cyan-400 text-black text-xs font-bold rounded-full flex items-center justify-center">
              {itemCount}
            </span>
          )}
          <span className="hidden sm:inline text-sm font-medium">
            {totalAmount.toLocaleString('vi-VN')}đ
          </span>
        </button>
      </div>

      {menuOpen && (
        <div className="lg:hidden border-t border-gray-800 bg-gray-900 p-4 flex flex-wrap gap-2">
          <button
            onClick={() => { onGameChange(''); setMenuOpen(false) }}
            className={`px-3 py-1.5 rounded-lg text-sm ${selectedGame === '' ? 'bg-white/10 text-white' : 'text-gray-400'}`}
          >
            Tất Cả
          </button>
          {GAMES.map(g => (
            <button
              key={g.id}
              onClick={() => { onGameChange(g.id); setMenuOpen(false) }}
              className={`px-3 py-1.5 rounded-lg text-sm ${selectedGame === g.id ? `bg-white/10 ${gameTextColorMap[g.id]}` : 'text-gray-400'}`}
            >
              {g.icon} {g.name}
            </button>
          ))}
        </div>
      )}
    </header>
  )
}
