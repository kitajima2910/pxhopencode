// SFX tự động theo FSM state transition
const SFX_MAP: Record<string, string> = {
  jump:   "jump",
  attack: "shoot",
  hurt:   "hurt",
  die:    "die",
};
// Gọi trong onStateChange: if (SFX_MAP[to]) audio.playSFX(SFX_MAP[to])
