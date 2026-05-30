// Pure parser for the self-improvement approve loop. No IO.
// COMPLEX items are structurally non-eligible — the one safety guarantee.

// GitHub logins allowed to approve. Alex confirms his actual commenting login;
// the repo owner is Meta-Psy.
export const APPROVERS = ['Meta-Psy']

const CATEGORIES = ['TRIVIAL', 'STANDARD', 'COMPLEX']

// Extract {items:[{n,category,title}]} from the hidden manifest, or null.
export function parseManifest(issueBody) {
  if (typeof issueBody !== 'string') return null
  const m = issueBody.match(/<!--\s*AUDIT-MANIFEST\s*([\s\S]*?)\s*AUDIT-MANIFEST\s*-->/)
  if (!m) return null
  let data
  try { data = JSON.parse(m[1]) } catch { return null }
  if (!data || !Array.isArray(data.items)) return null
  const items = data.items
    .filter(it => Number.isInteger(it.n) && CATEGORIES.includes(it.category))
    .map(it => ({ n: it.n, category: it.category, title: String(it.title ?? '') }))
  return { items }
}

// Parse a /approve command body. Returns a selection or null (not a command).
export function parseApproveCommand(commentBody) {
  if (typeof commentBody !== 'string') return null
  const line = commentBody.trim().split('\n')[0].trim()
  const m = line.match(/^\/approve\s+(.+)$/i)
  if (!m) return null
  const arg = m[1].trim().toLowerCase()
  if (arg === 'all') return { kind: 'all' }
  const tokens = arg.split(',').map(t => t.trim()).filter(Boolean)
  if (tokens.length === 0) return null
  if (tokens.every(t => /^\d+$/.test(t))) {
    return { kind: 'numbers', numbers: [...new Set(tokens.map(Number))] }
  }
  const cats = ['trivial', 'standard'] // COMPLEX is never an approvable category
  if (tokens.every(t => cats.includes(t))) {
    return { kind: 'categories', categories: [...new Set(tokens.map(t => t.toUpperCase()))] }
  }
  return null // mixed numbers+words, or unknown word (e.g. "complex")
}

// Resolve a selection against the manifest. COMPLEX never lands in `eligible`.
export function resolveApproval(selection, manifest) {
  const items = manifest?.items ?? []
  const byN = new Map(items.map(it => [it.n, it]))
  let chosen = []
  const unknown = []
  if (selection.kind === 'all') {
    chosen = items.slice()
  } else if (selection.kind === 'categories') {
    chosen = items.filter(it => selection.categories.includes(it.category))
  } else if (selection.kind === 'numbers') {
    for (const n of selection.numbers) {
      if (byN.has(n)) chosen.push(byN.get(n))
      else unknown.push(n)
    }
  }
  const skippedComplex = chosen.filter(it => it.category === 'COMPLEX')
  const eligible = chosen.filter(it => it.category !== 'COMPLEX')
  return { eligible, skippedComplex, unknown }
}

// Top-level decision from a raw comment event.
export function handleApproveComment({ author, commentBody, issueBody }, approvers = APPROVERS) {
  const selection = parseApproveCommand(commentBody)
  if (!selection) return { action: 'ignore', reason: 'not-an-approve-command' }
  if (!approvers.includes(author)) return { action: 'reject', reason: 'unauthorized-author', author }
  const manifest = parseManifest(issueBody)
  if (!manifest) return { action: 'error', reason: 'no-manifest' }
  return { action: 'approve', selection, ...resolveApproval(selection, manifest) }
}
