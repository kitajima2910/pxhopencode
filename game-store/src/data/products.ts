export interface Game {
  id: string
  name: string
  slug: string
  color: string
  colorLight: string
  icon: string
}

export interface ResourceType {
  id: string
  name: string
  icon: string
}

export interface Product {
  id: string
  gameId: string
  resourceType: string
  name: string
  subcategory: string
  description: string
  price: number
  originalPrice?: number
  image: string
  inStock: boolean
  featured?: boolean
}

export const GAMES: Game[] = [
  { id: 'lq', name: 'Liên Quân', slug: 'lien-quan', color: 'lq', colorLight: 'lq-light', icon: '⚔️' },
  { id: 'pubg', name: 'PUBG Mobile', slug: 'pubg', color: 'pubg', colorLight: 'pubg-light', icon: '🔫' },
  { id: 'ff', name: 'Free Fire', slug: 'free-fire', color: 'ff', colorLight: 'ff-light', icon: '💥' },
  { id: 'genshin', name: 'Genshin Impact', slug: 'genshin', color: 'genshin', colorLight: 'genshin-light', icon: '✨' },
]

export const RESOURCE_TYPES: ResourceType[] = [
  { id: 'cash', name: 'Nạp Tiền', icon: '💰' },
  { id: 'dame', name: 'Tài Khoản', icon: '👤' },
  { id: 'tokens', name: 'Vật Phẩm', icon: '🎁' },
  { id: 'items', name: 'Item', icon: '📦' },
  { id: 'characters', name: 'Nhân Vật', icon: '🦸' },
  { id: 'accounts', name: 'Acc', icon: '🔐' },
]

export const PRODUCTS: Product[] = [
  // ── LIÊN QUÂN ──
  // Nạp tiền
  { id: 'lq-cash-1', gameId: 'lq', resourceType: 'cash', name: 'Nạp 100 Quân Huy', subcategory: 'Quân Huy', description: 'Nạp nhanh 100 Quân Huy, nhận ngay trong 5 phút', price: 20000, originalPrice: 25000, image: '', inStock: true, featured: true },
  { id: 'lq-cash-2', gameId: 'lq', resourceType: 'cash', name: 'Nạp 500 Quân Huy', subcategory: 'Quân Huy', description: 'Nạp 500 Quân Huy giá ưu đãi, tặng kèm 50 Quân Huy', price: 100000, originalPrice: 125000, image: '', inStock: true },
  { id: 'lq-cash-3', gameId: 'lq', resourceType: 'cash', name: 'Nạp 1000 Quân Huy', subcategory: 'Quân Huy', description: 'Nạp 1000 Quân Huy siêu tiết kiệm, tặng kèm 150 Quân Huy', price: 200000, originalPrice: 250000, image: '', inStock: true },
  { id: 'lq-cash-4', gameId: 'lq', resourceType: 'cash', name: 'Nạp 50 Vàng', subcategory: 'Vàng', description: 'Nạp 50 Vàng Liên Quân Mobile', price: 5000, image: '', inStock: true },
  { id: 'lq-cash-5', gameId: 'lq', resourceType: 'cash', name: 'Nạp 200 Vàng', subcategory: 'Vàng', description: 'Nạp 200 Vàng giá rẻ, nhận ngay', price: 20000, originalPrice: 25000, image: '', inStock: true },
  // Tài khoản
  { id: 'lq-dame-1', gameId: 'lq', resourceType: 'dame', name: 'Acc Cao Thủ 50 Tướng', subcategory: 'Rank Cao', description: 'Tài khoản rank Cao Thủ, 50 tướng, 80 skin, thông tin đầy đủ', price: 500000, originalPrice: 700000, image: '', inStock: true, featured: true },
  { id: 'lq-dame-2', gameId: 'lq', resourceType: 'dame', name: 'Acc Tinh Anh 30 Skin', subcategory: 'Skin VIP', description: 'Acc Tinh Anh 30 skin VIP, 40 tướng, skin S+ và Limited', price: 350000, image: '', inStock: true },
  { id: 'lq-dame-3', gameId: 'lq', resourceType: 'dame', name: 'Acc Kim Cương Đẹp', subcategory: 'Rank Cao', description: 'Tài khoản Kim Cương, tỉ lệ thắng cao, 60 tướng', price: 800000, originalPrice: 1000000, image: '', inStock: false },
  // Vật phẩm
  { id: 'lq-tokens-1', gameId: 'lq', resourceType: 'tokens', name: 'Kho Báu Linh Thú', subcategory: 'Event', description: 'Mở kho báu Linh Thú - cơ hội nhận skin hiếm', price: 15000, image: '', inStock: true },
  { id: 'lq-tokens-2', gameId: 'lq', resourceType: 'tokens', name: 'Đá Quý Nâng Cấp', subcategory: 'Nâng Cấp', description: 'Đá quý nâng cấp bậc tướng, set 10 viên', price: 30000, image: '', inStock: true },
  // Nhân vật
  { id: 'lq-char-1', gameId: 'lq', resourceType: 'characters', name: 'Tướng Mới Zata', subcategory: 'Tướng', description: 'Mua tướng Zata - pháp sư cơ động', price: 45000, image: '', inStock: true },
  { id: 'lq-char-2', gameId: 'lq', resourceType: 'characters', name: 'Skin S+ Murad', subcategory: 'Skin', description: 'Skin S+ Murad Huyền Thoại Bóng Đêm', price: 150000, originalPrice: 200000, image: '', inStock: true },
  { id: 'lq-char-3', gameId: 'lq', resourceType: 'characters', name: 'Skin Airi Cung Đình', subcategory: 'Skin', description: 'Skin Airi Cung Đình phiên bản giới hạn', price: 90000, image: '', inStock: true },

  // ── PUBG ──
  { id: 'pubg-cash-1', gameId: 'pubg', resourceType: 'cash', name: 'Nạp 60 UC', subcategory: 'UC', description: 'Nạp 60 Unknown Cash, nhận ngay', price: 15000, image: '', inStock: true, featured: true },
  { id: 'pubg-cash-2', gameId: 'pubg', resourceType: 'cash', name: 'Nạp 300 UC', subcategory: 'UC', description: 'Nạp 300 UC giá ưu đãi, tặng 30 UC', price: 75000, originalPrice: 85000, image: '', inStock: true },
  { id: 'pubg-cash-3', gameId: 'pubg', resourceType: 'cash', name: 'Nạp 600 UC', subcategory: 'UC', description: 'Nạp 600 UC siêu tiết kiệm, tặng 80 UC', price: 150000, originalPrice: 170000, image: '', inStock: true },
  { id: 'pubg-cash-4', gameId: 'pubg', resourceType: 'cash', name: 'Nạp Royal Pass', subcategory: 'Royal Pass', description: 'Mua Royal Pass mùa mới, nhận thưởng VIP', price: 100000, image: '', inStock: true },
  { id: 'pubg-dame-1', gameId: 'pubg', resourceType: 'dame', name: 'Acc PUBG Ace Dominator', subcategory: 'Rank Cao', description: 'Tài khoản rank Ace Dominator, tỉ lệ K/D cao, nhiều skin súng', price: 600000, originalPrice: 800000, image: '', inStock: true },
  { id: 'pubg-dame-2', gameId: 'pubg', resourceType: 'dame', name: 'Acc PUBG Skin Mythic', subcategory: 'Skin VIP', description: 'Acc nhiều skin Mythic, X-suit, Glacier M416', price: 1200000, image: '', inStock: true, featured: true },
  { id: 'pubg-tokens-1', gameId: 'pubg', resourceType: 'tokens', name: 'Mảnh Skin Súng', subcategory: 'Nâng Cấp', description: 'Mảnh nâng cấp skin súng, set 10 mảnh', price: 25000, image: '', inStock: true },
  { id: 'pubg-items-1', gameId: 'pubg', resourceType: 'items', name: 'Skin M416 Glacier', subcategory: 'Skin Súng', description: 'Skin M416 Glacier level 4, hiệu ứng băng tuyết', price: 250000, originalPrice: 320000, image: '', inStock: true },
  { id: 'pubg-items-2', gameId: 'pubg', resourceType: 'items', name: 'Set Đồ X-suit', subcategory: 'Trang Phục', description: 'Set X-suit full set, hiếm, mới ra mắt', price: 500000, image: '', inStock: true },
  { id: 'pubg-items-3', gameId: 'pubg', resourceType: 'items', name: 'Dù Skin Bạch Kim', subcategory: 'Phụ Kiện', description: 'Dù skin Bạch Kim phiên bản giới hạn', price: 80000, image: '', inStock: true },

  // ── FREE FIRE ──
  { id: 'ff-cash-1', gameId: 'ff', resourceType: 'cash', name: 'Nạp 100 Kim Cương', subcategory: 'Kim Cương', description: 'Nạp 100 Kim Cương Free Fire, nhận ngay', price: 10000, image: '', inStock: true, featured: true },
  { id: 'ff-cash-2', gameId: 'ff', resourceType: 'cash', name: 'Nạp 500 Kim Cương', subcategory: 'Kim Cương', description: 'Nạp 500 Kim Cương, tặng 50 KC bonus', price: 50000, originalPrice: 55000, image: '', inStock: true },
  { id: 'ff-cash-3', gameId: 'ff', resourceType: 'cash', name: 'Nạp 1000 Kim Cương', subcategory: 'Kim Cương', description: 'Nạp 1000 Kim Cương siêu ưu đãi, tặng 150 KC', price: 100000, originalPrice: 110000, image: '', inStock: true },
  { id: 'ff-dame-1', gameId: 'ff', resourceType: 'dame', name: 'Acc FF Huyền Thoại', subcategory: 'Rank Cao', description: 'Acc rank Huyền Thoại, K/D cao, đầy đủ skin', price: 300000, originalPrice: 400000, image: '', inStock: true },
  { id: 'ff-dame-2', gameId: 'ff', resourceType: 'dame', name: 'Acc FF Skin Súng VIP', subcategory: 'Skin VIP', description: 'Acc nhiều skin súng Evo, skin nhân vật hiếm', price: 500000, image: '', inStock: true },
  { id: 'ff-tokens-1', gameId: 'ff', resourceType: 'tokens', name: 'Thẻ Nâng Cấp Súng', subcategory: 'Nâng Cấp', description: 'Thẻ nâng cấp skin súng Evo, set 5 thẻ', price: 20000, image: '', inStock: true },
  { id: 'ff-items-1', gameId: 'ff', resourceType: 'items', name: 'Skin Súng M1887 Evo', subcategory: 'Skin Súng', description: 'Skin súng M1887 Evo max level, hiệu ứng lửa', price: 200000, originalPrice: 280000, image: '', inStock: true },
  { id: 'ff-char-1', gameId: 'ff', resourceType: 'characters', name: 'Nhân Vật Alok', subcategory: 'Nhân Vật', description: 'Nhân vật Alok - skill tăng tốc + hồi máu', price: 60000, image: '', inStock: true },
  { id: 'ff-char-2', gameId: 'ff', resourceType: 'characters', name: 'Skin Bundle Mùa', subcategory: 'Skin', description: 'Bundle skin mùa mới nhất, full set', price: 120000, image: '', inStock: true },

  // ── GENSHIN ──
  { id: 'gs-cash-1', gameId: 'genshin', resourceType: 'cash', name: 'Nạp 60 Nguyên Thạch', subcategory: 'Nguyên Thạch', description: 'Nạp 60 Nguyên Thạch Genshin Impact', price: 15000, image: '', inStock: true },
  { id: 'gs-cash-2', gameId: 'genshin', resourceType: 'cash', name: 'Nạp 300 Nguyên Thạch', subcategory: 'Nguyên Thạch', description: 'Nạp 300 Nguyên Thạch, tặng 30 bonus', price: 70000, originalPrice: 80000, image: '', inStock: true, featured: true },
  { id: 'gs-cash-3', gameId: 'genshin', resourceType: 'cash', name: 'Nạp 980 Nguyên Thạch', subcategory: 'Nguyên Thạch', description: 'Nạp 980 Nguyên Thạch, tặng 110 bonus', price: 220000, originalPrice: 250000, image: '', inStock: true },
  { id: 'gs-cash-4', gameId: 'genshin', resourceType: 'cash', name: 'Nạp Blessing Welkin', subcategory: 'Thẻ Tháng', description: 'Thẻ Blessing Welkin 30 ngày, nhận 90 NT/ngày', price: 75000, image: '', inStock: true },
  { id: 'gs-dame-1', gameId: 'genshin', resourceType: 'dame', name: 'Acc AR55+ Nhiều 5 Sao', subcategory: 'Rank Cao', description: 'Acc AR55+, 8 nhân vật 5 sao, vũ khí trấn, map khám phá 80%', price: 800000, originalPrice: 1200000, image: '', inStock: true, featured: true },
  { id: 'gs-dame-2', gameId: 'genshin', resourceType: 'dame', name: 'Acc AR45 C6 Character', subcategory: 'C6 VIP', description: 'Acc AR45, có nhân vật C6, vũ khí 5 sao R1', price: 1500000, image: '', inStock: true },
  { id: 'gs-tokens-1', gameId: 'genshin', resourceType: 'tokens', name: 'Nhựa Resin Dồi Dào', subcategory: 'Event', description: 'Nhựa Resin để farm boss và domain', price: 10000, image: '', inStock: true },
  { id: 'gs-items-1', gameId: 'genshin', resourceType: 'items', name: 'Vũ Khí 5 Sao Homa', subcategory: 'Vũ Khí', description: 'Staff of Homa - vũ khí 5 sao cho Hu Tao/Zhongli', price: 300000, originalPrice: 400000, image: '', inStock: true },
  { id: 'gs-char-1', gameId: 'genshin', resourceType: 'characters', name: 'Raiden Shogun C2', subcategory: 'Nhân Vật', description: 'Tài khoản có Raiden Shogun C2, build full', price: 450000, image: '', inStock: true },
  { id: 'gs-char-2', gameId: 'genshin', resourceType: 'characters', name: 'Nahida C0 Build EM', subcategory: 'Nhân Vật', description: 'Nhân vật Nahida build full EM, sát thương cỏ', price: 250000, image: '', inStock: true },
  { id: 'gs-acc-1', gameId: 'genshin', resourceType: 'accounts', name: 'Acc AR60 Full Map', subcategory: 'Full', description: 'Acc AR60, map 100%, tất cả boss, 12 nhân vật 5 sao', price: 2000000, originalPrice: 3000000, image: '', inStock: true },
]

export const gameColorMap: Record<string, string> = {
  lq: 'bg-lq border-lq-light',
  pubg: 'bg-pubg border-pubg-light',
  ff: 'bg-ff border-ff-light',
  genshin: 'bg-genshin border-genshin-light',
}

export const gameTextColorMap: Record<string, string> = {
  lq: 'text-lq-light',
  pubg: 'text-pubg-light',
  ff: 'text-ff-light',
  genshin: 'text-genshin-light',
}

export const gameBgLightMap: Record<string, string> = {
  lq: 'bg-lq/10 border-lq/30',
  pubg: 'bg-pubg/10 border-pubg/30',
  ff: 'bg-ff/10 border-ff/30',
  genshin: 'bg-genshin/10 border-genshin/30',
}

export function getSubcategories(gameId: string, resourceType: string): string[] {
  const prods = PRODUCTS.filter(p => p.gameId === gameId && p.resourceType === resourceType)
  return [...new Set(prods.map(p => p.subcategory))]
}

export function getResourceTypesForGame(gameId: string): ResourceType[] {
  const typeIds = [...new Set(PRODUCTS.filter(p => p.gameId === gameId).map(p => p.resourceType))]
  return RESOURCE_TYPES.filter(rt => typeIds.includes(rt.id))
}
