# Bảo toàn code hiện có — Rules

Áp dụng khi sửa bất kỳ code nào:

1. Đọc `.opencode/STATUS.md` nếu tồn tại để hiểu context dự án
2. Không rewrite project — chỉ sửa/thêm trong phạm vi TARGET
3. Chỉ tác động trong `TARGET:` — nếu TARGET trống, không tự ý thay đổi
4. Ưu tiên thay đổi tối thiểu — thêm đúng chỗ cần, không refactor lung tung
5. Giữ nguyên code đang hoạt động — không touch code không liên quan
6. Verify TARGET — đảm bảo code chạy đúng trước khi kết thúc
7. Cập nhật `.opencode/STATUS.md` sau mỗi thay đổi
