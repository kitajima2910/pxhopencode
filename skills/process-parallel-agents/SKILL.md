---
name: process-parallel-agents
description: Dùng khi có 2+ task độc lập, không share state, có thể chạy song song
---

# Dispatching Parallel Agents

## Core Principle

**Dispatch one agent per independent problem domain. Let them work concurrently.**

Khi có nhiều failures/subystems độc lập, investigate tuần tự là lãng phí.

## Khi nào dùng

**Dùng khi:**
- 3+ test files fail với root causes khác nhau
- Multiple subsystems broken independently
- Mỗi problem có thể hiểu không cần context từ problem khác
- No shared state giữa các investigations

**Không dùng khi:**
- Failures related (fix 1 có thể fix others)
- Cần understand full system state
- Agents would interfere with nhau

## Pattern

### 1. Identify Independent Domains
Phân tích failures → group theo root cause → xác định domains độc lập

### 2. Dispatch Per Domain
Mỗi domain → 1 subagent:
- Craft context độc lập (chỉ files/subystem liên quan)
- Set clear investigation goal
- Expected output format

### 3. Collect Results
Gom kết quả từ tất cả subagents:
- Phân loại: fixed, needs review, blocked
- Nếu conflicts → resolve trước khi merge

## Anti-Rationalization

| Excuse | Reality |
|--------|---------|
| "Làm tuần tự cho chắc" | Độc lập → tuần tự = 3x thời gian |
| "Sợ agents conflict" | Craft context cách ly đúng → không conflict |
