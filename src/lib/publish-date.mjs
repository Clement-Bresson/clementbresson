// When an article goes live. Pure (no file access) so the site code, astro.config
// and scripts/article.mjs can all import it.

/** An article goes live when its `pubDate`, read as a calendar day, has started in this time zone. */
export const PUBLISH_TIME_ZONE = "Europe/Paris";

/** Today's date in the publishing time zone, as YYYY-MM-DD. */
export function today(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: PUBLISH_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/** False for an article scheduled for a later day. Accepts a Date or a YYYY-MM-DD string. */
export function isLive(pubDate, now = new Date()) {
  const day =
    typeof pubDate === "string" ? pubDate : pubDate.toISOString().slice(0, 10);
  return day <= today(now);
}
