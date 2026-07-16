# Policy: Phản ánh (Reflection)

**Áp dụng bởi:** Mọi tầng → lưu qua T4  
**Kích hoạt:** Sau mỗi task, phase, workflow, hoặc khi có sự cố

## 4 Mức phản ánh

| Mức | Khi nào | Nội dung | Dung lượng |
|-----|---------|----------|-----------|
| Task | Sau mỗi Task hoàn tất | Task result, duration, errors | 1 dòng |
| Phase | Sau mỗi Phase (code/test/build) | Phase status, artifacts, quality | 3-5 dòng |
| Workflow | Sau mỗi Workflow hoàn tất | Workflow summary, lessons learned | 10-15 dòng |
| Incident | Khi có lỗi nghiêm trọng | Root cause, impact, prevention | 20-30 dòng |

## Format
```json
{
  "level": "task|phase|workflow|incident",
  "timestamp": "<ISO8601>",
  "agent": "<worker_name>",
  "summary": "...",
  "metrics": {"duration_ms": 0, "errors": 0, "artifacts": []},
  "lessons": []
}
```

## Quy tắc
- Task reflection: worker gửi Event{reflection} sau mỗi Result.
- Phase/Workflow reflection: T2 tổng hợp từ task reflections → gửi T4.
- Incident reflection: bất kỳ tầng nào phát hiện lỗi nghiêm trọng → gửi ngay.
- T4 lưu tất cả reflection vào session log.
