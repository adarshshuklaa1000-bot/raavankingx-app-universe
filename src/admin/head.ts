/** Head tags for private admin screens: unique titles, never indexed by search engines. */
export function adminHead(page: string) {
  const title = `${page} — RaavanKingX Admin`;
  const description = `RaavanKingX admin panel: ${page.toLowerCase()}.`;
  return {
    meta: [
      { title },
      { name: "description", content: description },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  };
}
