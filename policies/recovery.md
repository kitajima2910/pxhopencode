# Policy: Phục hồi (Recovery)

**Áp dụng bởi:** Tầng 2 (Điều phối)  
**Kích hoạt:** Khi Retry hết 3 lần hoặc lỗi permanent

## Luồng
```
T2 nhận Result{failure} (sau retry hết)
  → Gửi Event{recovery_needed} → T4 yêu cầu State
  → T4 trả về State{completed_phases[], artifacts[]}
  → T2 quyết định:
      ├─ Resume: tiếp tục từ phase gần nhất (state còn valid)
      ├─ Rollback: quay lại phase trước, clean artifacts
      └─ Abort: dừng toàn bộ, báo user
```

## Checkpoint
- Mỗi phase hoàn tất → T4 lưu State checkpoint.
- Checkpoint gồm: `phase, artifacts, errors, metadata`.
- T2 gửi Event{checkpoint} → T4 trước mỗi phase transition.

## Quy tắc
- Không auto-recovery cho security/critical failures — luôn abort + báo user.
- Recovery chỉ khả thi nếu checkpoint ≤ 5 phút tuổi.
- Sau recovery, T2 ghi Event{recovery_result} → T4.
