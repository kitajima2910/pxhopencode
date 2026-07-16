# Policy: Thử lại (Retry)

**Áp dụng bởi:** Tầng 2 (Điều phối)  
**Kích hoạt:** Khi worker trả `Result{status:"failure"}` với lỗi tạm thời

## Điều kiện
- Timeout (task quá 300s)
- Rate limit (429)
- Network lỗi (5xx, connection refused)
- Worker crash / unavailable

## Luồng
```
T2 nhận Result{failure} → kiểm tra error.code có phải transient?
  ├─ Có: tái tạo Task contract với attempt+1
  │      → backoff: 2^attempt giây (1s, 2s, 4s)
  │      → max 3 lần
  │      → hết 3 lần vẫn lỗi → chuyển sang chính sách Phục hồi
  └─ Không: gửi Event{error, permanent} → T4 → báo user
```

## Quy tắc
- Chỉ T2 mới được quyết định thử lại — worker không tự thử.
- `task_id` giữ nguyên qua các lần thử lại.
- Mỗi lần thử ghi Event{retry_attempt} → T4.
- Nếu task là non-idempotent (vd: tạo resource), không thử lại.
