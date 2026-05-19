// Build-time prerender: per-language static <head>. Без npm-зависимостей.

export function escAttr(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function extractViteAssetTags(shellHtml) {
  const re = /<script\b[^>]*\bsrc="\/assets\/[^"]*"[^>]*><\/script>|<link\b[^>]*\bhref="\/assets\/[^"]*"[^>]*>/g;
  const tags = shellHtml.match(re) || [];
  if (tags.length === 0) {
    throw new Error('prerender: no Vite asset tags found in dist/index.html — aborting (JS would not load)');
  }
  return tags;
}
