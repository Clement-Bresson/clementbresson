export const PUBLISH_TIME_ZONE = "Europe/Paris";

export function today(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: PUBLISH_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export function isLive(pubDate, now = new Date()) {
  const day =
    typeof pubDate === "string" ? pubDate : pubDate.toISOString().slice(0, 10);
  return day <= today(now);
}
