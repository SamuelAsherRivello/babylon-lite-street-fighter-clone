const lerp = (from, to, amount) => from + (to - from) * amount;

export function interpolateGameState(older, newer, amount) {
  if (!older) return newer;
  if (!newer) return older;
  const alpha = Math.max(0, Math.min(1, amount));
  return {
    ...newer,
    fighters: (newer.fighters ?? []).map((fighter, index) => {
      const previous = older.fighters?.[index];
      if (!previous) return fighter;
      return {
        ...fighter,
        x: lerp(previous.x, fighter.x, alpha),
        y: lerp(previous.y, fighter.y, alpha),
        vx: lerp(previous.vx, fighter.vx, alpha),
        vy: lerp(previous.vy, fighter.vy, alpha),
        facing: alpha < 0.5 ? previous.facing : fighter.facing,
        projectile: previous.projectile && fighter.projectile
          ? { ...fighter.projectile, x: lerp(previous.projectile.x, fighter.projectile.x, alpha), y: lerp(previous.projectile.y, fighter.projectile.y, alpha) }
          : fighter.projectile ?? previous.projectile,
      };
    }),
  };
}

export function sampleGameState(frames, targetTime) {
  if (!frames.length) return null;
  if (frames.length === 1 || targetTime <= frames[0].time) return frames[0].state;
  for (let index = 1; index < frames.length; index++) {
    const next = frames[index];
    if (targetTime <= next.time) {
      const previous = frames[index - 1];
      return interpolateGameState(previous.state, next.state, (targetTime - previous.time) / Math.max(1, next.time - previous.time));
    }
  }
  return frames.at(-1).state;
}
