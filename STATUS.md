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
| **V2.0: Agent slim (9 files)** | **-227 dòng (-39%)** |
| **V2.0: Contracts schema concise** | **-29 dòng** |
| **V2.0: Skill quickref → 25 SKILL.md reads avoided** | **-728 dòng (-96%)** |
| **V2.0: Context budget + tiered loading** | **~-50% token/phiên** |
| **Total** | **~6.300 + 984 = ~7.284 dòng khỏi prompt context** |

## 🚀 V2.0 Changelog

| Thay đổi | Tác động |
|----------|---------|
| Thêm `_shared/context-budget.md` | Tiered loading, batch calls, fail fast → ~50% token/phiên |
| Thêm `_shared/skill-quickref.md` | 1 read thay 25 SKILL.md → -728 dòng/skill selection |
| Agent slim (9 files, 586→359 dòng) | -227 dòng (-39%) mỗi agent invocation |
| Contract concise (bỏ JSON mẫu dài) | -29 dòng |
| Tier 0/1/2/3 context strategy | Chỉ load đúng tier cần thiết |
| Conversation budget (max rounds) | Không vòng lặp vô hạn |
| Quota-saving behaviors | Batch, cache, fail fast, lazy template |

## 🛠 Changelog

| Ngày | Phiên bản | Thay đổi |
|------|-----------|----------|
| 2026-06-23 | v2.0 | **Critical fix**: Prompt auto-classification, permission inconsistency, skill integration, QA→Fix-Bugs contract, feedback loop |

## ✅ Điều kiện hoàn thành

- [x] 9 agents với thẻ layer + tham chiếu chéo
- [x] Runtime 4 layer, 6 contracts, 3 policies
- [x] 7 workflows theo lĩnh vực
- [x] 25 skills với templates/ riêng
- [x] _shared/ dùng chung (templates, scripts, agent-listing)
- [x] MCP Playwright tích hợp
- [x] README hướng dẫn copy vào `.opencode/`
- [x] **Prompt auto-classification** — T1/T2/T3 tự động phân tích prompt → workflow+skill
- [x] **Permission đúng** — Architect/DevOps `edit: deny`
- [x] **Skill integration** — Worker bắt buộc đọc SKILL.md + templates trước khi code
- [x] **Contract-only communication** — QA→Fix-Bugs dùng Task contract, không @mention trần
- [x] **Feedback loop** — Worker→T2→Worker qua Result/Task contract
