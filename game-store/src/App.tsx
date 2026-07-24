import { CartProvider } from './context/CartContext'
import Home from './pages/Home'

export default function App() {
  return (
    <CartProvider>
      <Home />
    </CartProvider>
  )
}
