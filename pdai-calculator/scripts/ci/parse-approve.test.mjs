import { describe, it, expect } from 'vitest'
import {
  parseManifest, parseApproveCommand, resolveApproval, handleApproveComment,
} from './parse-approve.mjs'

const BODY = `Some report text.
<!-- AUDIT-MANIFEST
{"repo":"pdai","generated":"2026-05-30","items":[
{"n":1,"category":"TRIVIAL","title":"a"},
{"n":2,"category":"STANDARD","title":"b"},
{"n":3,"category":"COMPLEX","title":"c"}
]}
AUDIT-MANIFEST -->`

describe('parseManifest', () => {
  it('extracts items from a valid body', () => {
    expect(parseManifest(BODY).items).toHaveLength(3)
  })
  it('returns null when manifest is absent', () => {
    expect(parseManifest('no manifest here')).toBeNull()
  })
  it('returns null on malformed json', () => {
    expect(parseManifest('<!-- AUDIT-MANIFEST {bad json} AUDIT-MANIFEST -->')).toBeNull()
  })
  it('drops items with invalid category or n', () => {
    const body = '<!-- AUDIT-MANIFEST {"items":[{"n":1,"category":"BOGUS"},{"n":"x","category":"TRIVIAL"},{"n":2,"category":"STANDARD","title":"ok"}]} AUDIT-MANIFEST -->'
    expect(parseManifest(body).items).toEqual([{ n: 2, category: 'STANDARD', title: 'ok' }])
  })
})

describe('parseApproveCommand', () => {
  it('parses numbers', () => {
    expect(parseApproveCommand('/approve 1,3,5')).toEqual({ kind: 'numbers', numbers: [1, 3, 5] })
  })
  it('parses single category', () => {
    expect(parseApproveCommand('/approve trivial')).toEqual({ kind: 'categories', categories: ['TRIVIAL'] })
  })
  it('parses multiple categories', () => {
    expect(parseApproveCommand('/approve trivial,standard')).toEqual({ kind: 'categories', categories: ['TRIVIAL', 'STANDARD'] })
  })
  it('parses all', () => {
    expect(parseApproveCommand('/approve all')).toEqual({ kind: 'all' })
  })
  it('is case-insensitive and trims', () => {
    expect(parseApproveCommand('  /APPROVE 2 ')).toEqual({ kind: 'numbers', numbers: [2] })
  })
  it('returns null for non-approve comments', () => {
    expect(parseApproveCommand('looks good, thanks')).toBeNull()
  })
  it('returns null for mixed/invalid args', () => {
    expect(parseApproveCommand('/approve 1,trivial')).toBeNull()
    expect(parseApproveCommand('/approve complex')).toBeNull()
  })
})

describe('resolveApproval — COMPLEX is never eligible', () => {
  const man = parseManifest(BODY)
  it('numbers: eligible excludes COMPLEX, reports it skipped', () => {
    const r = resolveApproval({ kind: 'numbers', numbers: [1, 2, 3] }, man)
    expect(r.eligible.map(i => i.n)).toEqual([1, 2])
    expect(r.skippedComplex.map(i => i.n)).toEqual([3])
  })
  it('all: still skips COMPLEX', () => {
    const r = resolveApproval({ kind: 'all' }, man)
    expect(r.eligible.map(i => i.n)).toEqual([1, 2])
    expect(r.skippedComplex.map(i => i.n)).toEqual([3])
  })
  it('categories: only matching non-COMPLEX', () => {
    const r = resolveApproval({ kind: 'categories', categories: ['TRIVIAL'] }, man)
    expect(r.eligible.map(i => i.n)).toEqual([1])
  })
  it('numbers: unknown n reported, not implemented', () => {
    const r = resolveApproval({ kind: 'numbers', numbers: [2, 99] }, man)
    expect(r.eligible.map(i => i.n)).toEqual([2])
    expect(r.unknown).toEqual([99])
  })
})

describe('handleApproveComment', () => {
  it('ignores non-approve comments', () => {
    expect(handleApproveComment({ author: 'Meta-Psy', commentBody: 'hi', issueBody: BODY }).action).toBe('ignore')
  })
  it('rejects unauthorized authors', () => {
    const r = handleApproveComment({ author: 'mallory', commentBody: '/approve all', issueBody: BODY })
    expect(r.action).toBe('reject')
    expect(r.reason).toBe('unauthorized-author')
  })
  it('errors when no manifest', () => {
    const r = handleApproveComment({ author: 'Meta-Psy', commentBody: '/approve 1', issueBody: 'nope' })
    expect(r.action).toBe('error')
  })
  it('approves eligible, skips COMPLEX under all', () => {
    const r = handleApproveComment({ author: 'Meta-Psy', commentBody: '/approve all', issueBody: BODY })
    expect(r.action).toBe('approve')
    expect(r.eligible.map(i => i.n)).toEqual([1, 2])
    expect(r.skippedComplex.map(i => i.n)).toEqual([3])
  })
})
