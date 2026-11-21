export const CONFIG=Object.freeze({
  par:[150,180,210],
  strikes:3,
  hints:3,
  penalty:10,
  hintDuration:2200,
  restartDelay:1300,
  minimumHitRadius:13, // Small details still have a comfortable pointer target.
});

export function clock(seconds) {
  const n=Math.max(0,Math.floor(seconds));
  return `${String(Math.floor(n/60)).padStart(2,'0')}:${String(n%60).padStart(2,'0')}`;
}
