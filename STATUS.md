# 📊 pxhopencode — AI Company cho Vibe Coding

## 🎯 Tổng quan

| Trường | Giá trị |
|--------|---------|
| Giai đoạn | PHÁT HÀNH ✅ |
| Mô hình | AI Company — 4-Tầng Enterprise AI Runtime |
| Agents | 9 chuyên biệt (Tầng 1-4) |
| Workflows | 7 theo lĩnh vực |
| Skills | 25 skills (4 lĩnh vực) |
| Contracts | 6 cấu trúc |
| Policies | 3 (Thử lại, Phục hồi, Phản ánh) |

## 🔗 Ma trận liên kết

| Thành phần | Agents | Runtime | Workflows | Skills | Contracts | Policies |
|-----------|--------|---------|-----------|--------|-----------|----------|
| **agents/** | — | ✅ Thẻ layer | ✅ Liên kết giai đoạn | ✅ Tham chiếu | ✅ Tham chiếu | ✅ Tham chiếu |
| **runtime/** | ✅ Agents | — | ✅ Luồng | — | ✅ Sơ đồ | ✅ Thi hành |
| **workflows/** | ✅ Tham chiếu | ✅ Luồng | — | ✅ Tham chiếu | ✅ Tham chiếu | ✅ Tham chiếu |
| **skills/** | ✅ Agent dùng | ✅ Ngữ cảnh | ✅ Được gọi | — | ✅ Tham chiếu | — |
| **contracts/** | ✅ | ✅ Hướng | ✅ Luồng | — | — | ✅ Tương tác |
| **policies/** | ✅ Agent | ✅ Tầng thi hành | — | — | ✅ Tham chiếu | — |

## 📁 Cấu trúc

```
.opencode/
├── opencode.json           # Config: agents, commands, skills
├── README.md / STATUS.md   # Tổng quan + Dashboard
├── agents/                 # 9 agents (Tầng 1-4)
├── runtime/                # 4 tầng, contracts, policies
├── workflows/              # 7 workflow templates
├── skills/                 # 4 lĩnh vực, 25 skills + templates/
└── _shared/                # Dùng chung: templates, scripts, agent-listing
```

## ✅ Token Optimization

| Cải tiến | Savings |
|----------|---------|
| Code SKILL.md → templates/ (22 files) | -3.171 dòng |
| Game implementation → templates/ (6 files) | -1.714 dòng |
| Agent normalization (9 files) | -837 dòng |
| Workflow trim + shared includes | -400 dòng |
| runtime/README.md, README.md trim | -179 dòng |
| **Total** | **~6.300 dòng khỏi prompt context** |

## ✅ Điều kiện hoàn thành

- [x] 9 agents với thẻ layer + tham chiếu chéo
- [x] Runtime 4 layer, 6 contracts, 3 policies
- [x] 7 workflows theo lĩnh vực
- [x] 25 skills với templates/ riêng
- [x] _shared/ dùng chung (templates, scripts, agent-listing)
- [x] MCP Playwright tích hợp
- [x] README hướng dẫn copy vào `.opencode/`
