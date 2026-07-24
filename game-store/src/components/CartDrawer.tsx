import { X, Minus, Plus, Trash2, ShoppingCart } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { GAMES, RESOURCE_TYPES } from '../data/products'

interface CartDrawerProps {
  open: boolean
  onClose: () => void
  onCheckout: () => void
}

export default function CartDrawer({ open, onClose, onCheckout }: CartDrawerProps) {
  const { items, totalAmount, removeFromCart, updateQuantity, clearCart } = useCart()

  if (!open) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-gray-900 border-l border-gray-800 z-50 flex flex-col animate-[slideIn_0.2s_ease-out]">
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <ShoppingCart size={20} /> Giỏ hàng ({items.length})
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-3">
              <ShoppingCart size={48} />
              <p>Giỏ hàng trống</p>
            </div>
          ) : (
            items.map(item => {
              const game = GAMES.find(g => g.id === item.product.gameId)!
              const rt = RESOURCE_TYPES.find(r => r.id === item.product.resourceType)!
              return (
                <div key={item.product.id} className="flex gap-3 bg-gray-800/50 rounded-xl p-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{item.product.name}</p>
                    <p className="text-xs text-gray-500">{game.icon} {game.name} · {rt.icon} {rt.name}</p>
                    <p className="text-sm font-bold text-purple-400 mt-1">{item.product.price.toLocaleString('vi-VN')}đ</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      className="w-7 h-7 rounded-lg bg-gray-700 flex items-center justify-center hover:bg-gray-600 text-white"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      className="w-7 h-7 rounded-lg bg-gray-700 flex items-center justify-center hover:bg-gray-600 text-white"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="text-gray-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )
            })
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-gray-800 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Tổng cộng</span>
              <span className="text-xl font-bold text-white">{totalAmount.toLocaleString('vi-VN')}đ</span>
            </div>
            <button
              onClick={onCheckout}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-xl font-bold text-white hover:opacity-90 transition-opacity"
            >
              Thanh toán ngay
            </button>
            <button
              onClick={clearCart}
              className="w-full py-2 text-sm text-gray-500 hover:text-red-400 transition-colors"
            >
              Xóa giỏ hàng
            </button>
          </div>
        )}
      </div>
    </>
  )
}
