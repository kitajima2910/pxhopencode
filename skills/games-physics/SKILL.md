---
name: games-physics
description: Physics & collision — AABB, spatial hash, raycast, response. Tối ưu cho hàng ngàn object, không overshoot.
---

# games-physics — Physics & Collision

## AABB Collision (nhanh nhất)
`aabbOverlap` cho kiểm tra nhanh, `sweptAABB` chống xuyên object khi di chuyển nhanh.
Xem: `templates/aabb-collision.ts`

## Spatial Hash (va chạm hàng ngàn object)
Chia grid, chỉ kiểm tra object trong cell liền kề. Insert bằng AABB, query trả về Set<id>.
Xem: `templates/spatial-hash.ts`

## Raycast
Duyệt objects, tìm giao điểm sớm nhất với AABB dùng ray vs box test.
Xem: `templates/raycast.ts`

## Collision Response (không overshoot, không stuck)
Phân giải x và y riêng theo overlap nhỏ nhất, zero vận tốc khi chạm.
Xem: `templates/collision-response.ts`
