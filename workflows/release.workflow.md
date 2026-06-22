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
1. **Lint + TypeCheck**: scripts trong `_shared/build-scripts.ps1`
2. **Test Suite**: scripts trong `_shared/build-scripts.ps1`
3. **Build**: scripts trong `_shared/build-scripts.ps1`
4. **Báo user**: `✅ Build thành công! 📁 Output: dist/ (hoặc .next/) 👉 Bạn deploy tuỳ ý.`

Sau build → Event{phase: release, status: success, data: {version, size, date}} → @pxh-save-history.

## XỬ LÝ SỰ CỐ
| Vấn đề | Hành động |
|--------|----------|
| Lint lỗi | Fix → commit → chạy lại pipeline |
| Test fail | Báo QA, không release |
| Build fail | Kiểm tra log, fix dependency |

## NGUYÊN TẮC
1. **Fail fast**: lỗi → dừng ngay
2. Mỗi bước phải pass — không skip
