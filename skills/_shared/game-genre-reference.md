# Game Genre Reference — Vibe Coding Production Guide

> Tài liệu tham khảm cho mọi thể loại game HTML5. Dùng khi `pxh-expert` nhận task game — đọc genre tương ứng, follow architecture + anti-patterns để code chuẩn, đẹp, không lỗi.

---

## Cách dùng
1. Xác định thể loại game từ task
2. Tìm category trong doc này
3. Đọc core mechanics + camera + controls + anti-patterns
4. Code theo architecture pattern
5. Test theo checklist

---

## 1. ACTION (Platformer, Run & Gun, Beat 'em Up, Hack & Slash)

| Sub-genre | Engine | Camera | Core Mechanic |
|-----------|--------|--------|---------------|
| Platformer | Phaser 3 | Side-scroll, follow player | Jump + gravity + platform collision |
| Run & Gun | Phaser 3 | Side-scroll | Run + shoot + dodge |
| Beat 'em Up | Phaser 3 | Side-scroll, multiple targets | Combo + crowd control + pickup |
| Hack & Slash | Phaser 3 / Three.js | Top-down / TPS | Melee combo + dodge roll + enemies |

### Core Architecture
```
Scenes: Boot → Menu → Game → GameOver → LevelSelect
GameObjects:
  Player (FSM: idle/run/jump/attack/hurt/die)
  Enemy (FSM: idle/patrol/chase/attack/hurt/die)
  Projectile pool (object pool)
  Spawner (wave-based)
  HUD (health, score, combo)
```

### Anti-patterns (causes "cùi" feel)
| Problem | Fix |
|---------|-----|
| Jump không có gravity arc | Dùng arcade physics gravity + jump velocity |
| Attack không có hit-stop | freeze frame 50-100ms khi hit |
| Enemy không có anticipation | Add tell animation trước khi attack |
| Camera rigid | Add deadzone + smooth lerp |
| No screen shake | `camera.shake(100, 0.01)` khi hit |
| Input lag | Dùng `justPressed` thay vì `isDown` |
| Spawn trùng vị trí | Check spawn không overlap với player |

### Testing Checklist
- [ ] Jump arc đúng (lên nhanh → xuống chậm hơn)
- [ ] Collision box không lệch với visual
- [ ] Enemy spawn không trong player
- [ ] Hitbox active đúng frame animation
- [ ] Combo không bị reset giữa chừng (buffer input)
- [ ] Platform edge: player đứng được sát mép, không rơi qua

---

## 2. SHOOTER (Shmup, Twin-stick, Bullet Hell, Arena, TPS, FPS)

| Sub-genre | Engine | Camera | Core Mechanic |
|-----------|--------|--------|---------------|
| Shmup | Phaser 3 | Vertical/horizontal scroll | Ship + bullet patterns + power-ups |
| Twin-stick | Phaser 3 | Top-down | Left stick move + right stick shoot |
| Bullet Hell | Phaser 3 | Top-down/fixed | Dense pattern + narrow hitbox |
| Arena Shooter | Phaser 3 / Three.js | Top-down / 3rd person | Wave survival + weapon pickups |
| TPS | Three.js | Third-person shoulder | Cover + aiming + shooting |
| FPS | Three.js | First-person | Mouse look + WASD + shooting |

### Core Architecture (2D Shooters)
```
Player:
  - Circular/spritesheet hitbox (bullet hell: 2px radius)
  - Velocity-based movement (không acceleration cho precision)
  - Auto-fire / charge shot
BulletPool:
  - Object pool (maxSize = 200)
  - Self-destruct outside bounds
  - Pooled particle hit effect
Enemy:
  - Movement pattern (sine, aim, straight, spiral)
  - Bullet pattern system (config array of angles + timing)
  - HP bar + flash when hit
Spawner:
  - Wave config: [{enemy, count, interval, pattern}]
  - Difficulty scaling over time
```

### Anti-patterns
| Problem | Fix |
|---------|-----|
| Bullet Hell: hitbox lớn | Hitbox = 2px, visual = 16px |
| Bullet pattern đều đều | Add variation + gap dodgeable |
| Player chết 1 hit | Add HP system + invincibility frames (1s) |
| No visual feedback | Flash + scale punch + particle on hit |
| FPS: mouse lag | Dùng `pointer-lock` + raw mouse delta |
| TPS: camera xuyên wall | Raycast camera, zoom in khi gần wall |
| FPS: head bob quá mức | Bob = sin(time * speed) * 0.03 |

### Testing Checklist
- [ ] Bullet pool không leak (check active count)
- [ ] Hitbox player đủ nhỏ (bullet hell)
- [ ] Invincibility frames hoạt động
- [ ] Power-up pickup + effect đúng
- [ ] Wave scaling đúng difficulty
- [ ] TPS: camera không clip xuyên wall

---

## 3. STEALTH / SURVIVAL ACTION / PARKOUR / RHYTHM ACTION

| Sub-genre | Engine | Camera | Core Mechanic |
|-----------|--------|--------|---------------|
| Stealth | Three.js | TPS / FPS | Detection meter + distraction + takedown |
| Survival Action | Phaser / Three.js | Top-down / TPS | Resource management + combat + crafting |
| Parkour | Three.js | TPS | Wall run + vault + slide + climb |
| Rhythm Action | Phaser 2D / Canvas | Fixed | Notes fall → press at timing |

### Anti-patterns
| Problem | Fix |
|---------|-----|
| Stealth: detection đột ngột | Add detection meter + gradient (0→100%) |
| Stealth: enemy mù | Cone of vision + sound radius |
| Parkour: wall detect sai | Raycast wall normal + align velocity |
| Rhythm: timing cứng | Add ±50ms window, visual feedback sớm |
| Rhythm: input miss | Dùng `justPressed` + buffer 100ms |

---

## 4. ADVENTURE (Point & Click, Interactive Story, Visual Novel, Escape Room, Detective, Walking Simulator)

| Sub-genre | Engine | Camera | Core Mechanic |
|-----------|--------|--------|---------------|
| Point & Click | Phaser 2D | Fixed scenes | Click hotspot → collect → combine → use |
| Visual Novel | HTML/CSS/Canvas | Static | Text + choices + branching |
| Escape Room | Phaser / Three.js | First-person / 3D | Find items → solve puzzle → unlock |
| Detective | Phaser 2D | Top-down / Scene | Investigate + deduce + accuse |
| Walking Sim | Three.js | First-person | Explore + story triggers + environmental |

### Anti-patterns
| Problem | Fix |
|---------|-----|
| P&C: hotspot không rõ ràng | Highlight + cursor change + glow |
| P&C: pixel hunting | Hotspot area ≥ 48×48px |
| VN: text speed chậm | Skip button + tap to advance |
| Escape: puzzle không logic | Hint system sau 3 lần fail |
| Walking: chán | Story trigger mỗi 30s + environmental audio |

---

## 5. RPG (ARPG, Turn-Based, Tactical, JRPG, Western, Roguelike, Dungeon Crawler, Monster Collecting, Open World)

| Sub-genre | Engine | Camera | Core Mechanic |
|-----------|--------|--------|---------------|
| ARPG | Phaser / Three.js | Top-down / TPS | Real-time combat + stats + loot |
| Turn-Based | Phaser 2D | Top-down | Menu combat + party + turns |
| Tactical RPG | Phaser 2D / Isometric | Grid | Grid movement + positioning + skills |
| JRPG | Phaser 2D | Top-down overworld | Party + random encounters + cutscenes |
| Roguelike | Phaser 2D | Top-down | Permadeath + procedural + turn-based |
| Roguelite | Phaser 2D | Top-down | Roguelike + persistent upgrades |
| Dungeon Crawler | Phaser / Three.js | First-person / Top-down | Grid/tile dungeon + loot + traps |
| Monster Collecting | Phaser 2D | Top-down | Capture + train + battle |
| Open World RPG | Three.js | TPS | Large map + quests + factions |

### Core Architecture (RPG)
```
Data-driven (JSON config for everything):
  - Characters: {stats, skills, equipment, animations}
  - Items: {type, effect, rarity, icon}
  - Quests: {objectives, rewards, dialogue}
  - Encounters: {enemies, terrain, loot table}
  - Map: {tiles, NPCs, triggers, warps}

Combat System (ARPG):
  - Hitbox + hurtbox based (frame data)
  - Damage = (atk * skill_mult) - (def * 0.5)
  - Crit = random < crit_rate → damage * 1.5
  - I-frames: 0.5s after hit (dodge roll: entire roll)

Turn-Based:
  - Speed-based turn order
  - Action queue: select all → execute
  - Damage formula transparent to player
```

### Anti-patterns
| Problem | Fix |
|---------|-----|
| ARPG: hitbox không khớp visual | Debug draw hitbox + adjust |
| Turn-based: battle dài quá | Add auto-battle / speedup ×2 |
| Tactical: grid không rõ | Highlight move range + attack range |
| Roguelike: procedural不公平 | Seed-based + cap difficulty per depth |
| Loot: không cân bằng | Use loot table with rarity weights |
| Open World: map rỗng | POI density: 1 per 10×10 tiles |
| Stats: không transparent | Show damage formula on hover |
| Random encounter: quá nhiều | Reduce rate in explored areas |

### Testing Checklist
- [ ] Damage formula đúng (test various ATK/DEF)
- [ ] Turn order đúng speed
- [ ] Buff/debuff stack đúng
- [ ] Equipment equip/unequip không bug
- [ ] Save/load đúng state
- [ ] Quest progression chain đúng
- [ ] Procedural generation: seed tạo same map

---

## 6. STRATEGY (RTS, TBS, Tower Defense, Auto Battler, MOBA, 4X, Grand Strategy, City Builder, Colony Sim)

| Sub-genre | Engine | Camera | Core Mechanic |
|-----------|--------|--------|---------------|
| RTS | Phaser / Three.js | Top-down / Isometric | Gather → Build → Train → Attack |
| TBS | Phaser 2D / Isometric | Grid top-down | Move → Action → End turn |
| Tower Defense | Phaser 2D | Top-down / Side | Build towers on path → enemies follow path |
| Auto Battler | Phaser 2D | Board top-down | Buy units → position → auto fight |
| MOBA | Phaser / Three.js | Top-down / Isometric | 5v5 lanes + towers + jungle |
| 4X | Phaser 2D / Isometric | Top-down scroll | Explore → Expand → Exploit → Exterminate |
| City Builder | Phaser 2D / Isometric | Top-down scroll | Zone + build + manage resources |

### Core Architecture (Strategy)
```
ECS-like pattern:
  Entity: {id, position, components}
  Components: Health, Position, Attack, Move, Gather, Build
  Systems: MoveSystem, AttackSystem, GatherSystem, BuildSystem

Pathfinding:
  - A* on grid (2D / isometric)
  - Flow field for RTS (multiple units)
  - NavMesh for 3D

Economy:
  - Resource pool (gold, wood, food, stone)
  - Income per tick
  - Cost balance spreadsheet
```

### Anti-patterns
| Problem | Fix |
|---------|-----|
| TD: path không rõ | Highlight path + arrow indicators |
| RTS: unit di chuyển chậm | Steering behavior (separation + alignment) |
| RTS: worker idling | Auto-assign idle workers |
| Auto Battler: RNG too high | Skill-based positioning matters |
| City Builder: growth stall | Add milestone rewards + events |
| 4X: late game chán | Add crisis events + victory conditions |
| Selection: khó click | Click radius ≥ 8px + drag select |

### Testing Checklist
- [ ] A* path tìm được valid path (no wall inside)
- [ ] Unit collision không stuck
- [ ] Resource income/expense đúng
- [ ] Build queue không duplicate
- [ ] Save/load game state
- [ ] AI opponent không cheat (hoặc cheat hợp lý)

---

## 7. SIMULATION (Life, Farming, Business, Vehicle, Flight, Train, Truck, Construction, Medical, Cooking, Sports Management)

| Sub-genre | Engine | Camera | Core Mechanic |
|-----------|--------|--------|---------------|
| Life Sim | Phaser 2D | Top-down / Side | Needs + activities + relationships |
| Farming | Phaser 2D | Top-down / Isometric | Plant → Water → Grow → Harvest → Sell |
| Business | Phaser 2D / Web UI | Top-down / Dashboard | Buy → Process → Sell → Expand |
| Vehicle Sim | Three.js | Cockpit / Chase | Realistic physics + controls |
| Flight Sim | Three.js | Cockpit | Aerodynamics + instruments |
| Sports Mgmt | Phaser 2D / Web UI | Dashboard | Team + tactics + season + transfers |

### Anti-patterns
| Problem | Fix |
|---------|-----|
| Farming: plant không rõ stage | 4-5 visual stages + progress bar |
| Life Sim: repetitive | Random events + NPC interactions |
| Business: snowball economy | Logarithmic scaling + diminishing returns |
| Flight: controls khó | Arcade mode + realistic mode toggle |
| Sports: match simulation boring | Highlight goals + key moments |
| All: waiting too long | Speed-up button (2×, 4×) |

---

## 8. RACING (Arcade, Sim, Kart, Motorcycle, Boat, Air, Futuristic, Marble, Obstacle)

| Sub-genre | Engine | Camera | Core Mechanic |
|-----------|--------|--------|---------------|
| Arcade Racing | Three.js | Chase | Drift + boost + shortcuts |
| Sim Racing | Three.js | Chase / Cockpit | Realistic physics + tire model |
| Kart Racing | Three.js | Chase | Items + drifting + shortcuts |
| Marble Racing | Three.js + Cannon-es | Chase follow | Ball physics + spline track |
| Obstacle Racing | Three.js | Chase | Jump + dodge + slide |

### Core Architecture
```
Track Spline (CatmullRomCurve3):
  - Control points → mesh segments
  - Wall auto-gen dọc normal + tangent
  - Checkpoints at t = 0.2, 0.4, 0.6, 0.8

Vehicle:
  - Physics body (sphere cho marble, box cho car)
  - Force-based steering (camera-relative)
  - Speed clamp + drag
  - Drift: reduce forward friction + angular velocity

Camera:
  - Position behind + above target
  - Look-ahead = velocity direction
  - Smooth lerp (factor = 0.05)
  - Obstruction check → zoom in
```

### Anti-patterns
| Problem | Fix |
|---------|-----|
| Ball/vehicle physics xuyên wall | CCD (continuous collision detection) |
| Drift không có feel | Add drift angle visual + tire marks |
| Camera rigid → motion sick | Reduce lerp + add deadzone |
| Track có gap giữa segments | Overlap segments slightly |
| AI opponent rubber-band | Keep AI within 10-20% of player speed |
| No speed feeling | FOV dynamic: increase with speed |
| Marble bouncing vô hạn | Lock Y velocity khi on ground |

### Testing Checklist
- [ ] Ball không xuyên wall (CCD)
- [ ] Drift mechanic hoạt động
- [ ] Camera không clip
- [ ] Track continuous (no gaps)
- [ ] Checkpoint trigger đúng
- [ ] Timer chính xác
- [ ] Respawn không spawn inside wall
- [ ] Lap counting đúng

---

## 9. SPORTS (Football, Basketball, Tennis, Golf, Baseball, Volleyball, Boxing, MMA, Olympic)

| Sub-genre | Engine | Camera | Core Mechanic |
|-----------|--------|--------|---------------|
| Football | Phaser / Three.js | Top-down / Broadcast | Pass → Shoot → Score + AI team |
| Basketball | Phaser / Three.js | Side / Broadcast | Dribble → Pass → Shoot |
| Tennis | Phaser / Three.js | Side / Broadcast | Serve → Rally → Smash |
| Golf | Phaser / Three.js | Top-down / 3rd | Power bar + aim + terrain |
| Boxing | Phaser / Three.js | Side / 3rd | Punch combo + dodge + stamina |
| Olympic | Phaser / Three.js | Side | Timing-based mini-games |

### Anti-patterns
| Problem | Fix |
|---------|-----|
| Ball physics không chân thực | Arc ball trajectory + spin |
| AI quá mạnh/yếu | Difficulty curve: reaction time + accuracy |
| Controls không responsive | Input buffer 100ms + animation cancel |
| No crowd/atmosphere | Ambient audio + crowd cheer layer |
| Sports: camera xa quá | Dynamic zoom: wide for overview, close for action |

---

## 10. PUZZLE (Match-3, Physics Puzzle, Logic Puzzle, Hidden Object, Sokoban, Jigsaw)

| Sub-genre | Engine | Camera | Core Mechanic |
|-----------|--------|--------|---------------|
| Match-3 | Phaser 2D | Fixed | Swap adjacent → match 3+ |
| Physics Puzzle | Phaser 2D (Matter) | Fixed | Build + physics solve |
| Logic Puzzle | HTML/Canvas | Fixed | Rules-based deduction |
| Hidden Object | Phaser 2D | Fixed scene | Find items in scene |
| Sokoban | Phaser 2D | Top-down grid | Push boxes → goal |

### Anti-patterns
| Problem | Fix |
|---------|-----|
| Match-3: swap animation chậm | Animation < 200ms |
| Match-3: no new moves | Reshuffle when stuck |
| Physics: object xuyên nhau | Increase Physics iterations |
| Hidden Object: pixel hunt | Click area ≥ 32px + hint system |
| Sokoban: unsolvable level | BFS solver to verify solvability |
| All: no feedback | Particle + sound + score popup |

---

## 11. CASUAL (Idle, Clicker, Hyper Casual, Party, Time Management, Endless Runner, Endless Climber)

| Sub-genre | Engine | Camera | Core Mechanic |
|-----------|--------|--------|---------------|
| Idle/Clicker | Phaser 2D / HTML | Fixed | Click → earn → upgrade → auto |
| Hyper Casual | Phaser 2D | Fixed / Side | Tap to interact, simple mechanic |
| Endless Runner | Phaser 2D / Three.js | Side / Forward | Auto-run + jump/slide/dodge |
| Party Game | Phaser 2D | Varies | Mini-games + local multiplayer |
| Time Mgmt | Phaser 2D | Top-down / Side | Serve customers → upgrade |

### Anti-patterns
| Problem | Fix |
|---------|-----|
| Idle: no interesting decisions | Add prestige layer + synergy |
| Clicker: button fatigue | Auto-clicker upgrade sớm |
| Runner: obstacles unfair | Visual tell 0.5s before hazard |
| Hyper Casual: retention thấp | Meta-progression + daily reward |
| All: no juice | Screen shake + particles + tween everything |

---

## 12. SURVIVAL / HORROR (Open World, Zombie, Craft, Survival Horror, Wave, Psychological Horror, Asymmetrical)

| Sub-genre | Engine | Camera | Core Mechanic |
|-----------|--------|--------|---------------|
| Open World Survival | Three.js | TPS / FPS | Gather → Craft → Build → Survive |
| Zombie Survival | Three.js | TPS / FPS | Horde defense + scavenge + base |
| Survival Horror | Three.js | FPS / TPS | Limited resources + atmosphere + puzzle |
| Wave Survival | Phaser / Three.js | Top-down / TPS | Kill waves → buy upgrades → survive |
| Asymmetrical | Three.js | Varies | 1 vs Many (hunter vs survivors) |

### Anti-patterns
| Problem | Fix |
|---------|-----|
| Horror: jump scare predictable | Random timing + fake-outs |
| Craft: recipe quá nhiều | Progressive unlock + category UI |
| Survival: starvation death spiral | Difficulty floor (resources always spawn) |
| Wave: chán early game | Start with basic gear + immediate threat |
| Asym: balance khó | Role-based power curve + objectives |

---

## 13. SANDBOX / CREATIVE (Open Sandbox, Physics Sandbox, Building Sandbox)

| Sub-genre | Engine | Camera | Core Mechanic |
|-----------|--------|--------|---------------|
| Open Sandbox | Three.js | Free flight | No goals, tools to create/modify |
| Physics Sandbox | Phaser (Matter) / Three.js | Top-down / 3D | Spawn objects + physics interaction |
| Building Sandbox | Three.js | Free flight | Place blocks + rotate + connect |

### Anti-patterns
| Problem | Fix |
|---------|-----|
| No guidance → chán nhanh | Build challenges + inspiration prompts |
| Physics unstable with many objects | Spatial hash + sleep threshold |
| Placement không chính xác | Snap to grid + raycast placement |
| Save không được | Serialize world state to localStorage |

---

## 14. FIGHTING (2D Fighter, 3D Fighter, Platform Fighter, Arena Fighter)

| Sub-genre | Engine | Camera | Core Mechanic |
|-----------|--------|--------|---------------|
| 2D Fighter | Phaser 2D | Side, fixed | Frame data + combo + spacing |
| Platform Fighter | Phaser 2D | Side, dynamic | Attack → knockback → ring-out |
| Arena Fighter | Three.js | 3rd person | Lock-on + combo + special |

### Core Architecture (2D Fighter)
```
Frame Data system (JSON):
  - startup frames (before hit active)
  - active frames (hitbox active)
  - recovery frames (can't act)
  - damage, knockback, hitstun, blockstun

Input Buffer:
  - Last 10 inputs stored
  - Motion detection (→↓→ + punch = hadouken)
  - Priority: special > normal

State Machine:
  idle → walk, crouch, jump
  attack → startup → active → recovery → idle
  hit → hitstun → idle
  block → blockstun → idle
```

### Anti-patterns
| Problem | Fix |
|---------|-----|
| Input không responsive | Buffer system (store 100ms of inputs) |
| Combo không connect correctly | Cancel windows (specific frames) |
| Hitbox không match visual | Debug draw hitbox + frame-by-frame |
| No hitstun/blockstun | Minimum 8 frames hitstun |
| Infinite combo | Add scaling damage + gravity |

---

## 15. CARD / BOARD (CCG, TCG, Deck Builder, Board Game, Chess, Mahjong, Domino)

| Sub-genre | Engine | Camera | Core Mechanic |
|-----------|--------|--------|---------------|
| CCG/TCG | Phaser 2D / HTML | Fixed | Collect → Build → Play matches |
| Deck Builder | Phaser 2D | Fixed | Start small → draft → thin deck |
| Board Game | Phaser 2D | Top-down fixed | Roll → Move → Action |
| Chess | Phaser 2D | Top-down grid | Piece movement + checkmate |
| Mahjong | Phaser 2D | Top-down | Match tiles → clear board |

### Anti-patterns
| Problem | Fix |
|---------|-----|
| Card game: text quá nhỏ | Min font 14px, card min 64×88px |
| Deck builder: synergy không rõ | Card tagging + auto-suggest |
| Board: animation chậm | Speed slider + skip option |
| Chess: AI too weak/strong | Difficulty: depth 1-6 |
| All: drag & drop khó | Snap-to-zone + generous hit area |

---

## 16. MUSIC / RHYTHM (Rhythm Game, Dance Game, Music Creation, Instrument Sim)

| Sub-genre | Engine | Camera | Core Mechanic |
|-----------|--------|--------|---------------|
| Rhythm | Phaser 2D / Canvas | Fixed | Notes fall → hit at timing line |
| Dance | Phaser 2D | Fixed | Arrow patterns → step |
| Music Creation | HTML Audio API | UI | Sequencer + synth + export |

### Anti-patterns
| Problem | Fix |
|---------|-----|
| Timing off | Sync audio + visual offset config |
| Notes không readable | Scroll speed option + note size |
| No feedback on miss/hit | Hit/Miss text + screen flash + score popup |
| Song charting bad | Use BPM calculator + snap to beat |

---

## 17. MULTIPLAYER (Battle Royale, MMO, Co-op, PvP, Social Deduction)

| Sub-genre | Engine | Networking | Core Mechanic |
|-----------|--------|------------|---------------|
| Battle Royale | Phaser / Three.js | WebSocket + authoritative | 100 players → last standing |
| MMO | Three.js | WebSocket | Persistent world + thousands players |
| Co-op | Phaser / Three.js | WebSocket / P2P | Players vs AI |
| Social Deduction | Phaser 2D | WebSocket | Roles + voting + deception |

### Anti-patterns
| Problem | Fix |
|---------|-----|
| Lag | Interpolation + reconciliation + prediction |
| Cheating | Authoritative server + validate all actions |
| BR: circle unfair | Circle center = random POI, not pure random |
| MMO: too empty | Dynamic events + NPCs to fill world |
| Social: no discussion | Text chat + emoji reactions + call timer |

---

## 18. INCREMENTAL / MANAGEMENT (Factory Automation, Theme Park, Zoo, Restaurant, Hospital, Tycoon)

| Sub-genre | Engine | Camera | Core Mechanic |
|-----------|--------|--------|---------------|
| Factory Automation | Phaser 2D | Top-down / Isometric | Belt + machine + resource → product |
| Tycoon | Phaser 2D / Isometric | Top-down scroll | Build → attract customers → earn |
| Management | HTML / Phaser 2D | Dashboard | Hire → train → schedule → optimize |

### Anti-patterns
| Problem | Fix |
|---------|-----|
| Factory: belt không trực quan | Arrow direction + item animation on belt |
| Tycoon: growth stall | Events + VIP customers + upgrades |
| Management: micro nhiều quá | Auto-manage toggle for routine tasks |
| All: số quá lớn | Format: 1.2K, 3.5M, 7.8B |

---

## 19. METROIDVANIA / SOULSLIKE

| Sub-genre | Engine | Camera | Core Mechanic |
|-----------|--------|--------|---------------|
| Metroidvania | Phaser 2D | Side-scroll | Gated exploration + ability gating |
| Soulslike | Three.js | TPS | Stamina management + punish windows |

### Architecture
```
World Map:
  - Connected rooms (graph)
  - Ability gates: {ability_needed, blocked_until}
  - Teleport between save points

Combat (Soulslike):
  - Stamina: attack/dodge cost stamina
  - Recovery: stamina regen when idle
  - I-frames: dodge roll = invincible
  - Boss: phase transitions at HP thresholds
```

### Anti-patterns
| Problem | Fix |
|---------|-----|
| Metroid: backtrack quá xa | Teleport rooms + shortcuts |
| Soulslike: input reading | Add startup frames + recovery |
| Soulslike: unfair damage | Telegraphed attacks + dodge windows |
| Map confusing | Revealed map + room name popup |

---

## 20. SHOOTER VARIATIONS (Extraction Shooter, Bullet Heaven, Auto Shooter, Survivor-like, Auto Chess, Merge)

| Sub-genre | Engine | Camera | Core Mechanic |
|-----------|--------|--------|---------------|
| Extraction Shooter | Three.js | FPS / TPS | Loot → Extract → Keep loot |
| Bullet Heaven | Phaser 2D | Top-down | Auto-attack + dodge + upgrade |
| Survivor-like | Phaser 2D | Top-down | Auto-attack + XP + evolve weapons |
| Auto Chess | Phaser 2D | Board | Buy → Position → Auto battle |
| Merge | Phaser 2D | Fixed | Drag merge → upgrade → earn |

### Survivor-like Architecture (非常重要)
```
Core Loop:
  XP Orbs → Level Up → Choose Upgrade → Enemies stronger
  Weapons auto-attack in patterns
  XP magnet radius grows with pickups

Weapon System:
  - Each weapon: {damage, interval, pattern, pierce, area}
  - Pattern: radial, aimed, orbital, zone, aura
  - Evolution: weapon + passive → evolved weapon at max level

Difficulty Scaling:
  Time → Enemy HP ×1.05/min, Spawn rate ×1.1/min
  Elite enemies every 2 min
  Boss every 5 min
```

### Anti-patterns
| Problem | Fix |
|---------|-----|
| Survivor: no direction early | Auto-attract XP orbs initial radius 100px |
| Survivor: upgrades useless | No duplicate upgrades + synergy bonuses |
| Bullet Heaven: screen too cluttered | Reduce bullet opacity + pool max 500 |
| Merge: space management | Preview merge result on hover |
| Extraction: gear fear | Base loadout + insurance system |

---

## Genre Mapping: Engine + Templates

| Engine | Best for | Templates dir |
|--------|----------|---------------|
| Phaser 3 + Arcade | 2D platformer, shmup, twin-stick, top-down RPG | `skills/games-2d/templates/` |
| Phaser 3 + Matter | Physics puzzle, ragdoll, destruction | `skills/games-physics/templates/` |
| Phaser 3 + Isometric | Strategy, city builder, tactical RPG | `skills/games-isometric/templates/` |
| Three.js | 3D FPS/TPS, racing, open world | `skills/games-3d/templates/` |
| Three.js + Cannon-es | Physics 3D, marble racing, vehicle sim | `skills/games-3d/` (xem marble racing doc) |
| HTML Canvas | Rhythm, visual novel, card game | — custom |

---

## General Anti-Patterns (mọi thể loại)

| Problem | Solution |
|---------|----------|
| Game không có "feel" | Add juice: particles, screen shake, tween, sound |
| Loading lâu không progress bar | Preload + progress callback |
| Font mặc định xấu | Web font (Google Fonts) + drop shadow |
| UI không responsive | Use relative sizing + media queries |
| No sound → game chết | Ambient loop + SFX pool |
| Touch không support | Add virtual controls / touch input mapping |
| Performance drop → 20 FPS | Object pool + LOD + disable off-screen |
| Memory leak → crash after 10min | Check event listener cleanup + object disposal |
| Code không test → bug | Add Vitest + phaser-test-helper / three-test-helper |

---

## Testing Checklist (mọi game)

- [ ] Game init không crash
- [ ] Scene transition không leak
- [ ] Input responsive (justPressed pattern)
- [ ] Object pool không leak (acquire = release)
- [ ] FPS ≥ 55 desktop / ≥ 30 mobile
- [ ] Audio play/stop/restart không throw
- [ ] Pause → Resume đúng state
- [ ] Restart reset toàn bộ state
- [ ] Screen resize không break UI
- [ ] Touch input hoạt động
- [ ] No console error
- [ ] Memory: heap diff < 500KB sau 5 phút chơi

---

## References
- Game workflow: `workflows/game.workflow.md`
- 2D implementation: `skills/games-2d/game-h5-2d.md`
- 3D implementation: `skills/games-3d/game-h5-3d.md`
- Marble Racing: `skills/games-3d/game-h5-3d-marble-racing.md`
- Physics: `skills/games-physics/SKILL.md`
- Testing: `skills/games-testing/SKILL.md`
- Performance: `skills/games-optimization/SKILL.md`
- Audio: `skills/games-audio/SKILL.md`
- Assets: `skills/games-assets/SKILL.md`
