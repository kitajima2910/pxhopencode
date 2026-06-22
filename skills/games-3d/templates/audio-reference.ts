// Copy class SoundManager từ 2D (giống hệt)
// Web Audio API + procedural fallback

// Trong Game:
// const audio = new SoundManager();
// audio.loadAll().then(() => audio.playBGM());
//
// Gắn SFX vào FSM transitions:
// player.fsm.onStateChange = (from, to) => {
//   const sfxMap: Record<string, string> = { jump: "jump", attack: "shoot", hurt: "hurt", die: "die" };
//   if (sfxMap[to]) audio.playSFX(sfxMap[to]);
// };
// enemy.takeDamage() → audio.playSFX("hit")
// enemy.die() → audio.playSFX("die")
