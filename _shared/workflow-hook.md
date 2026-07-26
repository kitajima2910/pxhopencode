# Workflow State Hook

Ghi state real-time vào `_shared/opencode-state.json` trước mỗi tool call để Virtual Office hiển thị agent.

## Lifecycle
[1] `workflow_start` → [2] `<tool_state>` → [3] `idle`

Luôn kết thúc bằng `{"state":"idle"}` — nếu không agent bị kẹt vĩnh viễn. Ghi idle trong error handler trước khi throw/return.

## Ghi state
Dùng write_file ghi đè `_shared/opencode-state.json`:
```json
{"state":"<tool_name>","agent":"<agent_id>","message":"<mô tả ngắn>"}
```
Validate JSON trước khi ghi (sai syntax = eventWatcher không đọc được).

## Format

| Thời điểm | State |
|-----------|-------|
| Đầu prompt | `{"state":"workflow_start","agent":"pxh-pm","message":"User prompt: <tóm tắt>"}` |
| Trước tool call | `{"state":"<tool>","agent":"<agent>","message":"<hành động>"}` |
| Kết thúc | `{"state":"idle"}` |

## Agent mapping

| Agent | Tools |
|-------|-------|
| pxh-help | read, classify, websearch, webfetch, explore |
| pxh-pm | task, deleg, route, plan, workflow_start |
| pxh-architect | design, explore, outline |
| pxh-expert | thinking, edit, write, prepare, lsp, skill |
| pxh-fix-bugs | fix, debug, doom_loop |
| pxh-qa | grep, glob, test, list |
| pxh-review-code | review |
| pxh-devops | bash, build, deploy |
| pxh-ui-ux | polish, design, ui, ux |
| pxh-save-history | save |

## Best practices
- Ghi state TRƯỚC tool call, message < 80 ký tự
- Cùng state liên tiếp → vẫn ghi, đổi message
- Tool call song song → ưu tiên agent T2 > T1 > T3 > T4
- Nhiều tool cùng lúc → ghi 1 state cho agent quan trọng nhất
