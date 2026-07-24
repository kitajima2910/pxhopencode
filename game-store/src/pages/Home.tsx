import { useState, useMemo } from 'react'
import { PRODUCTS, GAMES, RESOURCE_TYPES } from '../data/products'
import { useCart } from '../context/CartContext'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'
import ProductCard from '../components/ProductCard'
import CartDrawer from '../components/CartDrawer'
import MobileFilters from '../components/MobileFilters'

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedGame, setSelectedGame] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [priceRange, setPriceRange] = useState<[number, number]>([0, Infinity])
  const [cartOpen, setCartOpen] = useState(false)
  const [checkoutOpen, setCheckoutOpen] = useState(false)

  const filtered = useMemo(() => {
    return PRODUCTS.filter(p => {
      if (selectedGame && p.gameId !== selectedGame) return false
      if (selectedType && p.resourceType !== selectedType) return false
      if (p.price < priceRange[0] || p.price > priceRange[1]) return false
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        const game = GAMES.find(g => g.id === p.gameId)
        const rt = RESOURCE_TYPES.find(r => r.id === p.resourceType)
        return (
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          game?.name.toLowerCase().includes(q) ||
          rt?.name.toLowerCase().includes(q) ||
          p.subcategory.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [selectedGame, selectedType, priceRange, searchQuery])

  return (
    <div className="min-h-screen bg-gray-950">
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onCartClick={() => setCartOpen(true)}
        selectedGame={selectedGame}
        onGameChange={setSelectedGame}
      />

      <MobileFilters
        selectedGame={selectedGame}
        selectedType={selectedType}
        priceRange={priceRange}
        onGameChange={setSelectedGame}
        onTypeChange={setSelectedType}
        onPriceRangeChange={setPriceRange}
        totalResults={filtered.length}
      />

      <div className="max-w-7xl mx-auto px-4 py-6 flex gap-6">
        <Sidebar
          selectedGame={selectedGame}
          selectedType={selectedType}
          onGameChange={setSelectedGame}
          onTypeChange={setSelectedType}
          priceRange={priceRange}
          onPriceRangeChange={setPriceRange}
        />

        <main className="flex-1 min-w-0">
          <p className="text-sm text-gray-500 mb-4">{filtered.length} sản phẩm</p>

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500 gap-3">
              <span className="text-4xl">🔍</span>
              <p className="text-lg">Không tìm thấy sản phẩm</p>
              <p className="text-sm">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </main>
      </div>

      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        onCheckout={() => { setCartOpen(false); setCheckoutOpen(true) }}
      />

      {checkoutOpen && <CheckoutModal onClose={() => setCheckoutOpen(false)} />}
    </div>
  )
}

function CheckoutModal({ onClose }: { onClose: () => void }) {
  const { totalAmount, clearCart } = useCart()
  const [step, setStep] = useState<'info' | 'payment' | 'done'>('info')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [method, setMethod] = useState('momo')

  const handlePay = () => {
    setStep('payment')
    setTimeout(() => {
      setStep('done')
      clearCart()
    }, 2000)
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
          {step === 'info' && (
            <>
              <h2 className="text-xl font-bold">Thông tin thanh toán</h2>
              <div className="space-y-3">
                <input
                  type="text" value={name} onChange={e => setName(e.target.value)}
                  placeholder="Họ và tên"
                  className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                />
                <input
                  type="text" value={phone} onChange={e => setPhone(e.target.value)}
                  placeholder="Số điện thoại"
                  className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                />
                <select
                  value={method} onChange={e => setMethod(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="momo">Ví MoMo</option>
                  <option value="bank">Chuyển khoản ngân hàng</option>
                  <option value="zalopay">ZaloPay</option>
                  <option value="viettel">Viettel Pay</option>
                </select>
              </div>
              <div className="border-t border-gray-800 pt-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Tổng tiền</span>
                  <span className="font-bold text-white">{totalAmount.toLocaleString('vi-VN')}đ</span>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={onClose} className="flex-1 py-2.5 bg-gray-800 rounded-xl text-gray-400 hover:text-white">
                  Hủy
                </button>
                <button
                  onClick={handlePay}
                  disabled={!name || !phone}
                  className="flex-1 py-2.5 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-xl font-bold text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Thanh toán
                </button>
              </div>
            </>
          )}

          {step === 'payment' && (
            <div className="flex flex-col items-center gap-4 py-8">
              <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-lg font-medium">Đang xử lý thanh toán...</p>
              <p className="text-sm text-gray-500">Vui lòng không đóng trang này</p>
            </div>
          )}

          {step === 'done' && (
            <div className="flex flex-col items-center gap-4 py-8">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
                <span className="text-3xl">✅</span>
              </div>
              <p className="text-xl font-bold text-green-400">Thanh toán thành công!</p>
              <p className="text-sm text-gray-400">Cảm ơn {name}, đơn hàng của bạn đang được xử lý</p>
              <button onClick={onClose} className="px-8 py-2.5 bg-purple-600 rounded-xl font-medium hover:bg-purple-500">
                Đóng
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
