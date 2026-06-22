# Workflow Họp — Agents thảo luận & quyết định

Triệu tập agents thảo luận, phản biện, quyết định chung.

## Agents tham gia
`@pxh-architect` (tech stack/scale), `@pxh-expert` (khả thi/perf), `@pxh-qa` (testability), `@pxh-devops` (deploy/cost), `@pxh-save-history` (thư ký).

## Quy trình
1. **Khai mạc**: PM nêu chủ đề, mục tiêu, thời gian
2. **Trình bày**: Mỗi agent: Đề xuất → Lý do → Ưu/Nhược điểm → Alternatives
3. **Phản biện**: Cross-discussion với evidence
4. **Tổng hợp & Quyết định**: Biên bản (tham gia, đồng ý/phản đối, quyết định, lý do, action items)
5. **Persist**: `Event{type: decision}` → @pxh-save-history

## Ma trận quyết định
Khi nhiều option: đánh giá theo Time/Performance/Maintainability/Scalability/Chi phí (⭐1-3). Tổng điểm → chọn.

## Xử lý bất đồng
| Tình huống | Xử lý |
|-----------|-------|
| Ý kiến trái ngược | Mỗi agent đưa thêm evidence |
| Không consensus | PM quyết định, ghi dissent |
| User có ý kiến | Làm theo user |
| Quá phức tạp | Hỏi user thêm thông tin |

Xem `_shared/architecture-overview.md` và `_shared/agent-listing.md`.
