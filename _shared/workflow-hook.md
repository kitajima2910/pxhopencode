# Workflow State Hook

> Hướng dẫn AI agent ghi state real-time vào `_shared/opencode-state.json`
> để Virtual Office hiển thị agents đang làm việc tại bàn.

## Nguyên tắc quan trọng

**Ghi state TRƯỚC mỗi tool call** — không chỉ lúc bắt đầu/kết thúc prompt.
Mỗi lần agent chuẩn bị gọi một tool, phải ghi state ngay lập tức để Virtual Office cập nhật agent tương ứng.

## Lifecycle bắt buộc

```
[1] workflow_start  ->  khi bắt đầu xử lý prompt
[2] <tool_state>    ->  TRƯỚC mỗi tool call (quan trọng nhất!)
[3] idle            ->  khi xử lý xong hoàn toàn
```

**Luôn luôn** kết thúc bằng `{"state":"idle"}` — nếu không, agents sẽ bị kẹt ở trạng thái "đang làm việc" vĩnh viễn.

> **Xử lý bị gián đoạn (error/interrupt):** Trong error handler, ghi `{"state":"idle"}` trước khi throw exception hoặc return để giải phóng agents.

## Cách ghi state

Dùng tool **write_file** để ghi đè toàn bộ nội dung file `_shared/opencode-state.json`:

```json
{
  "path": "_shared/opencode-state.json",
  "content": "{\"state\":\"<tool_name>\",\"agent\":\"<agent_id>\",\"message\":\"<mô tả ngắn>\"}"
}
```

Mỗi lần ghi là một object JSON hoàn chỉnh. Không cần đọc file trước.

> **Quan trọng:** Validate JSON trước khi ghi. File phải luôn là JSON hợp lệ — sai syntax = eventWatcher không đọc được.

## Format state

### 1. Bắt đầu xử lý prompt

```json
{"state":"workflow_start","agent":"pxh-pm","message":"User prompt: <tóm tắt ngắn>"}
```

Ghi ngay khi nhận được prompt từ user, TRƯỚC khi làm bất cứ điều gì khác.

### 2. Trước mỗi tool call (QUAN TRỌNG)

```json
{"state":"<tool_name>","agent":"<agent_id>","message":"<hành động đang làm>"}
```

Trong đó `<tool_name>` lấy từ tên tool/openpipe đang gọi.

**Luôn ghi state TRƯỚC khi gọi tool** (ngay lập tức, không delay), không phải sau khi có kết quả.

> **Tool call liên tiếp cùng state:** Nếu nhiều tool call có cùng state (vd: đọc 3 file với state `read`), hãy ghi state cho mỗi lần — Virtual Office sẽ giữ agent ở bàn, nhưng `message` thay đổi giúp user biết đang xử lý file nào.

### 3. Kết thúc xử lý

```json
{"state":"idle"}
```

Ghi KHI agent trả lời xong và chờ prompt tiếp theo. Nếu có lỗi, ghi idle trong error handler trước khi throw/return.

## Agent & Tool Mapping (đầy đủ)

| Tier | Agent | Tool / State patterns | Màu |
|------|-------|----------------------|------|
| **T1** | `pxh-help` | `read`, `classify`, `websearch`, `webfetch`, `explore` | `#58a6ff` |
| **T2** | `pxh-pm` | `task`, `deleg`, `route`, `plan`, `planning`, `todos`, `question`, `monitoring`, `workflow_start` | `#d29922` |
| **T3** | `pxh-architect` | `design`, `explore`, `outline` | `#bc8cff` |
| **T3** | `pxh-expert` | `thinking`, `edit`, `write`, `prepare`, `lsp`, `skill`, `preparing edit` | `#3fb950` |
| **T3** | `pxh-fix-bugs` | `fix`, `debug`, `doom_loop` | `#f85149` |
| **T3** | `pxh-qa` | `grep`, `glob`, `test`, `list` | `#3fb950` |
| **T3** | `pxh-review-code` | `review` | `#d29922` |
| **T3** | `pxh-devops` | `bash`, `build`, `deploy` | `#58a6ff` |
| **T3** | `pxh-ui-ux` | `polish`, `design`, `ui`, `ux` | `#f85149` |
| **T3** | `pxh-opencode` | Ghi bởi eventWatcher khi có `tui_mirror` | `#00e5ff` |
| **T4** | `pxh-save-history` | `save` | `#bc8cff` |

## Ví dụ workflow đầy đủ

Giả sử agent nhận prompt: *"Sửa lỗi login form và thêm validation"*

### Bước 1: Start -> `pxh-pm`
```json
{"state":"workflow_start","agent":"pxh-pm","message":"User prompt: Sửa lỗi login form và thêm validation"}
```

### Bước 2: Đọc file -> `pxh-help`
```json
{"state":"read","agent":"pxh-help","message":"Reading: src/components/Login.tsx"}
```

### Bước 3: Đọc thêm -> `pxh-help` (cùng state, message khác)
```json
{"state":"read","agent":"pxh-help","message":"Reading: src/utils/validation.ts"}
```

### Bước 4: Suy nghĩ -> `pxh-expert`
```json
{"state":"thinking","agent":"pxh-expert","message":"Analyzing: login form structure"}
```

### Bước 5: Sửa code -> `pxh-expert`
```json
{"state":"edit","agent":"pxh-expert","message":"Editing: src/components/Login.tsx"}
```

### Bước 6: Chạy test -> `pxh-qa`
```json
{"state":"test","agent":"pxh-qa","message":"Running: npm test"}
```

### Bước 7: Xong -> idle
```json
{"state":"idle"}
```

## Kênh ghi bổ sung (Activity Log Fallback)

Có thể ghi 1 dòng vào `_shared/opencode-activity.log` để kích hoạt cơ chế fallback:

```
[workflow_start] User prompt: <nội dung>
[workflow_end] Processing complete
```

Format này giúp eventWatcher phát hiện workflow bắt đầu/kết thúc thông qua file modification time.
**Lưu ý:** Activity log chỉ hỗ trợ phát hiện workflow lifecycle, không mapping được từng agent state riêng lẻ. 
Luôn ưu tiên ghi state file `opencode-state.json` cho từng tool call.

## Best practices

1. **Ghi state TRƯỚC tool call** — ngay khi biết tool nào sẽ được gọi, không delay
2. **Message ngắn gọn** — < 80 ký tự, focus vào hành động chính
3. **Dùng đúng agent** — tham khảo bảng mapping ở trên
4. **Không bao giờ bỏ qua `idle`** — quên ghi `idle` = Virtual Office tưởng agent vẫn đang làm việc
5. **Tool call song song** — nếu gọi nhiều tool cùng lúc, ưu tiên agent quan trọng nhất (T2 > T1 > T3 > T4)
6. **Contract signals** — nếu chuyển việc giữa các agents, ghi state cho agent mới ngay khi bắt đầu
7. **Cùng state liên tiếp** — vẫn ghi, message thay đổi giúp user phân biệt các bước
8. **Ghi thêm vào activity log** — thêm dòng `[workflow_start]` vào `_shared/opencode-activity.log` để fallback hoạt động
9. **Validate JSON trước khi ghi** — sai syntax = eventWatcher không đọc được

## Checklist cho AI agent

Khi nhận prompt mới:
- [ ] Ghi `workflow_start` với agent=`pxh-pm` (dùng tool write_file)
- [ ] Với mỗi tool call sắp thực thi (ngay trước khi gọi):
  - [ ] Xác định agent từ bảng mapping
  - [ ] Ghi state với `state` = tên tool, `agent` = agent id, `message` = mô tả ngắn
  - [ ] Nếu cùng state liên tiếp, vẫn ghi để giữ agent ở bàn
- [ ] Khi xong: ghi `idle`
- [ ] Trong error handler: ghi `idle` trước khi throw/return

> **Lưu ý:** Nếu quên ghi state, agent sẽ không xuất hiện ở bàn làm việc trong Virtual Office và user sẽ không thấy tiến trình xử lý.
