# Workflow Phát hành — Build Pipeline

Pipeline: lint → typecheck → test → build. Bạn tự deploy sau build.

## Điều kiện (Gate Check)
```
☐ QA passed — @pxh-qa Result{status: pass}
☐ Code reviewed — @pxh-review-code Result{approved: true}
☐ Git status clean
```
Không thỏa → **TỪ CHỐI**, Event{reject} → T4 + báo user.

## Steps
1. **Lint + TypeCheck**: `powershell.exe -ExecutionPolicy Bypass -File "_shared/build-scripts.ps1" -Step lint`
2. **Test Suite**: `powershell.exe -ExecutionPolicy Bypass -File "_shared/build-scripts.ps1" -Step test`
3. **Build**: `powershell.exe -ExecutionPolicy Bypass -File "_shared/build-scripts.ps1" -Step build`
4. **Báo user**: `✅ Build thành công! 📁 Output: dist/ (hoặc .next/) 👉 Bạn deploy tuỳ ý.`

Sau build → Event{phase: release, status: success, data: {version, size, date}} → @pxh-save-history.

## XỬ LÝ SỰ CỐ
| Vấn đề | Hành động |
|--------|----------|
| Lint lỗi | Fix → commit → chạy lại pipeline |
| Test fail | Báo QA, không release |
| Build fail | Kiểm tra log, fix dependency |

## Anti-Rationalization
| Excuse | Reality |
|--------|---------|
| "Lint warning nhỏ, release vẫn được" | Warning hôm nay = error ngày mai |
| "Typecheck chậm, skip đi" | Runtime error type-related lúc nào cũng xảy ra |
| "Test flaky, chạy lại là pass" | Flaky test bỏ qua bug → regression |

## Red Flags
- Build success nhưng có warning
- Gate check chưa pass (QA/review)
- Output file không tồn tại hoặc size 0

## Verification
- [ ] Gate: QA pass + Review pass + Git clean
- [ ] Lint 0 error, typecheck pass, test all green
- [ ] Build output exists + size hợp lý

## NGUYÊN TẮC
1. **Fail fast**: lỗi → dừng ngay
2. Mỗi bước phải pass — không skip
