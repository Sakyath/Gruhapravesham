export type CountdownState =
  | { phase: "before"; days: number; hours: number; minutes: number; seconds: number }
  | { phase: "today" }
  | { phase: "after" };

/** startUtc = event day start (IST midnight), endUtc = next IST midnight. */
export function getCountdown(nowMs: number, startUtc: number, endUtc: number): CountdownState {
  if (nowMs >= endUtc) return { phase: "after" };
  if (nowMs >= startUtc) return { phase: "today" };
  let s = Math.floor((startUtc - nowMs) / 1000);
  const days = Math.floor(s / 86400);
  s -= days * 86400;
  const hours = Math.floor(s / 3600);
  s -= hours * 3600;
  const minutes = Math.floor(s / 60);
  return { phase: "before", days, hours, minutes, seconds: s - minutes * 60 };
}
