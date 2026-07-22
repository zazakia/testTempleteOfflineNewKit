import { describe, it, expect } from 'vitest'
import { cn, formatTimestamp, formatCurrency, truncate, parseTags } from '../lib/utils'

// ─── cn (class name merger) ───────────────────────────────────

describe('cn', () => {
  it('merges simple class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('handles conditional classes', () => {
    expect(cn('base', false && 'hidden', 'visible')).toBe('base visible')
  })

  it('handles undefined and null', () => {
    expect(cn('base', undefined, null, 'extra')).toBe('base extra')
  })

  it('resolves Tailwind conflicts via twMerge', () => {
    // bg-red-500 should be overridden by bg-blue-500
    const result = cn('bg-red-500 p-4', 'bg-blue-500')
    expect(result).toContain('bg-blue-500')
    expect(result).not.toContain('bg-red-500')
    expect(result).toContain('p-4')
  })

  it('handles object syntax', () => {
    expect(cn({ active: true, disabled: false })).toBe('active')
  })

  it('handles empty input', () => {
    expect(cn()).toBe('')
  })
})

// ─── formatTimestamp ──────────────────────────────────────────

describe('formatTimestamp', () => {
  it('returns em-dash for null', () => {
    expect(formatTimestamp(null)).toBe('—')
  })

  it('returns em-dash for undefined', () => {
    expect(formatTimestamp(undefined)).toBe('—')
  })

  it('formats a valid timestamp', () => {
    const ts = new Date('2024-01-15T10:30:00').getTime()
    const result = formatTimestamp(ts)
    expect(result).toContain('2024')
    expect(result).toContain('Jan')
    expect(result).toContain('15')
  })

  it('accepts custom formatter options', () => {
    const ts = new Date('2024-01-15').getTime()
    const result = formatTimestamp(ts, { year: 'numeric', month: 'long', day: 'numeric' })
    expect(result).toContain('January')
    expect(result).toContain('2024')
  })

  it('handles zero timestamp', () => {
    const result = formatTimestamp(0)
    expect(result).not.toBe('—')
  })
})

// ─── formatCurrency ───────────────────────────────────────────

describe('formatCurrency', () => {
  it('returns em-dash for null', () => {
    expect(formatCurrency(null)).toBe('—')
  })

  it('returns em-dash for undefined', () => {
    expect(formatCurrency(undefined)).toBe('—')
  })

  it('formats USD by default', () => {
    const result = formatCurrency(1234.56)
    expect(result).toContain('1,234.56')
  })

  it('formats custom currency', () => {
    const result = formatCurrency(500, 'PHP')
    expect(result).toContain('500.00')
  })

  it('formats zero', () => {
    const result = formatCurrency(0)
    expect(result).toContain('0.00')
  })

  it('formats large numbers with separators', () => {
    const result = formatCurrency(1000000)
    expect(result).toContain('1,000,000')
  })
})

// ─── truncate ─────────────────────────────────────────────────

describe('truncate', () => {
  it('returns full text when shorter than maxLength', () => {
    expect(truncate('hello', 10)).toBe('hello')
  })

  it('returns full text when equal to maxLength', () => {
    expect(truncate('hello', 5)).toBe('hello')
  })

  it('truncates long text with ellipsis', () => {
    const result = truncate('hello world this is long', 10)
    expect(result.length).toBeLessThanOrEqual(11) // 10 + … (ellipsis is 1 char)
    expect(result.endsWith('…')).toBe(true)
  })

  it('trims trailing whitespace before ellipsis', () => {
    const result = truncate('hello     world', 8)
    expect(result).toBe('hello…') // 'hello   ' trimmed to 'hello' + '…'
  })

  it('handles empty string', () => {
    expect(truncate('', 5)).toBe('')
  })

  it('handles zero maxLength', () => {
    expect(truncate('hello', 0)).toBe('…')
  })
})

// ─── parseTags ────────────────────────────────────────────────

describe('parseTags', () => {
  it('parses comma-separated tags', () => {
    expect(parseTags('tag1, tag2, tag3')).toEqual(['tag1', 'tag2', 'tag3'])
  })

  it('trims whitespace', () => {
    expect(parseTags('  a  ,  b  ,  c  ')).toEqual(['a', 'b', 'c'])
  })

  it('filters out empty strings', () => {
    expect(parseTags('a,,b,')).toEqual(['a', 'b'])
  })

  it('handles single tag', () => {
    expect(parseTags('only')).toEqual(['only'])
  })

  it('handles empty string', () => {
    expect(parseTags('')).toEqual([])
  })

  it('handles whitespace-only string', () => {
    expect(parseTags('   ')).toEqual([])
  })
})
