import { ShoppingCart, Check } from 'lucide-react'
import { useState } from 'react'
import { GAMES, RESOURCE_TYPES, gameTextColorMap, gameBgLightMap } from '../data/products'
import type { Product } from '../data/products'
import { useCart } from '../context/CartContext'

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart, items } = useCart()
  const [added, setAdded] = useState(false)
  const game = GAMES.find(g => g.id === product.gameId)!
  const resourceType = RESOURCE_TYPES.find(rt => rt.id === product.resourceType)!
  const inCart = items.some(i => i.product.id === product.id)

  const handleAdd = () => {
    addToCart(product)
    setAdded(true)
    setTimeout(() => setAdded(false), 1200)
  }

  const discounted = product.originalPrice && product.originalPrice > product.price
  const discountPercent = discounted ? Math.round((1 - product.price / product.originalPrice!) * 100) : 0

  return (
    <div className={`rounded-2xl border ${gameBgLightMap[product.gameId]} overflow-hidden group hover:border-opacity-60 transition-all duration-300 hover:scale-[1.02]`}>
      <div className="p-5 space-y-3">
        <div className="flex items-center justify-between">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full bg-white/5 ${gameTextColorMap[product.gameId]}`}>
            {game.icon} {game.name}
          </span>
          <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded-full">
            {resourceType.icon} {resourceType.name}
          </span>
        </div>

        <div>
          <h3 className="font-semibold text-white leading-tight">{product.name}</h3>
          <p className="text-xs text-gray-400 mt-1 line-clamp-2">{product.description}</p>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-xl font-bold text-white">{product.price.toLocaleString('vi-VN')}đ</span>
          {discounted && (
            <>
              <span className="text-sm text-gray-500 line-through">{product.originalPrice!.toLocaleString('vi-VN')}đ</span>
              <span className="text-xs font-bold text-green-400 bg-green-400/10 px-1.5 py-0.5 rounded">-{discountPercent}%</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          {product.inStock ? (
            <span className="text-xs text-green-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full" /> Còn hàng
            </span>
          ) : (
            <span className="text-xs text-red-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-red-400 rounded-full" /> Hết hàng
            </span>
          )}
          {product.featured && (
            <span className="text-xs text-yellow-400 bg-yellow-400/10 px-1.5 py-0.5 rounded">Hot</span>
          )}
        </div>

        <button
          onClick={handleAdd}
          disabled={!product.inStock}
          className={`w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 ${
            !product.inStock
              ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
              : added
                ? 'bg-green-600 text-white'
                : inCart
                  ? 'bg-purple-600/30 text-purple-300 hover:bg-purple-600/50'
                  : 'bg-purple-600 hover:bg-purple-500 text-white'
          }`}
        >
          {!product.inStock ? (
            'Hết hàng'
          ) : added ? (
            <>
              <Check size={16} /> Đã thêm
            </>
          ) : (
            <>
              <ShoppingCart size={16} /> {inCart ? 'Thêm lần nữa' : 'Thêm vào giỏ'}
            </>
          )}
        </button>
      </div>
    </div>
  )
}
