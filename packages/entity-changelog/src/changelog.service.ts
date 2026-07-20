/**
 * ─── Changelog Service ──────────────────────────────────────
 * Pure business logic for changelog entries.
 */

import type { ChangelogEntry, ChangelogCategory, ChangelogStatus } from './changelog.schema'

export interface ChangelogSummary {
  totalEntries: number
  totalReleases: number
  latestVersion: string | null
  categories: Partial<Record<ChangelogCategory, number>>
  breakingChanges: number
  migrationsRequired: number
  upcomingCount: number
}

export class ChangelogService {
  /**
   * Validate and normalize changelog data before creation.
   */
  static prepareForCreate(
    input: Record<string, unknown>,
  ): Record<string, unknown> {
    const data = { ...input }

    // Trim title
    if (typeof data.title === 'string') {
      data.title = data.title.trim()
    }

    // Normalize version — strip leading 'v' if present
    if (typeof data.releaseVersion === 'string') {
      data.releaseVersion = data.releaseVersion.replace(/^v/i, '').trim()
    }

    // Ensure tags is an array
    if (!data.tags) {
      data.tags = []
    }
    if (!data.affectedModules) {
      data.affectedModules = []
    }
    if (!data.affectedPlatforms) {
      data.affectedPlatforms = ['all']
    }

    // Auto-detect isBreaking from category or title
    if (data.category === 'breaking') {
      data.isBreaking = true
    }
    if (
      typeof data.title === 'string' &&
      /\bbreaking\b/i.test(data.title)
    ) {
      data.isBreaking = true
    }

    return data
  }

  /**
   * Validate semantic version string.
   */
  static isValidSemver(version: string): boolean {
    const semverRegex =
      /^\d+\.\d+\.\d+(-[a-zA-Z0-9.]+)?(\+[a-zA-Z0-9.]+)?$/
    return semverRegex.test(version)
  }

  /**
   * Compare two semantic versions.
   * Returns: -1 if a < b, 0 if equal, 1 if a > b
   */
  static compareVersions(a: string, b: string): number {
    const parse = (v: string) => {
      const parts = v.split(/[-+]/)
      const nums = (parts[0] ?? '').split('.').map(Number)
      return {
        major: nums[0] ?? 0,
        minor: nums[1] ?? 0,
        patch: nums[2] ?? 0,
        preRelease: parts[1] ?? '',
      }
    }
    const va = parse(a)
    const vb = parse(b)

    if (va.major !== vb.major) return va.major - vb.major
    if (va.minor !== vb.minor) return va.minor - vb.minor
    if (va.patch !== vb.patch) return va.patch - vb.patch

    // Pre-release versions sort before releases
    if (va.preRelease && !vb.preRelease) return -1
    if (!va.preRelease && vb.preRelease) return 1
    if (va.preRelease && vb.preRelease) {
      return va.preRelease.localeCompare(vb.preRelease)
    }
    return 0
  }

  /**
   * Sort entries by version descending (newest first).
   */
  static sortByVersion(entries: ChangelogEntry[]): ChangelogEntry[] {
    return [...entries].sort((a, b) =>
      ChangelogService.compareVersions(b.releaseVersion, a.releaseVersion),
    )
  }

  /**
   * Sort entries by release date descending.
   */
  static sortByDate(entries: ChangelogEntry[]): ChangelogEntry[] {
    return [...entries].sort((a, b) => b.releasedAt - a.releasedAt)
  }

  /**
   * Build a roadmap timeline grouped by status.
   */
  static buildRoadmap(entries: ChangelogEntry[]): {
    planned: ChangelogEntry[]
    inProgress: ChangelogEntry[]
    released: ChangelogEntry[]
    other: ChangelogEntry[]
  } {
    return {
      planned: entries
        .filter((e) => e.status === 'planned')
        .sort((a, b) => a.releasedAt - b.releasedAt),
      inProgress: entries
        .filter((e) => e.status === 'in-progress')
        .sort((a, b) => a.releasedAt - b.releasedAt),
      released: entries
        .filter((e) => e.status === 'released')
        .sort((a, b) => b.releasedAt - a.releasedAt),
      other: entries.filter(
        (e) =>
          e.status === 'rolled-back' || e.status === 'cancelled',
      ),
    }
  }

  /**
   * Compute summary statistics from a list of entries.
   */
  static computeSummary(entries: ChangelogEntry[]): ChangelogSummary {
    const released = entries.filter((e) => e.status === 'released')
    const latest = ChangelogService.sortByVersion(released)[0] ?? null

    const categories: Partial<Record<ChangelogCategory, number>> = {}
    for (const entry of entries) {
      categories[entry.category] =
        (categories[entry.category] ?? 0) + 1
    }

    return {
      totalEntries: entries.length,
      totalReleases: released.length,
      latestVersion: latest?.releaseVersion ?? null,
      categories,
      breakingChanges: entries.filter((e) => e.isBreaking).length,
      migrationsRequired: entries.filter(
        (e) => e.migrationRequired,
      ).length,
      upcomingCount: entries.filter(
        (e) => e.status === 'planned' || e.status === 'in-progress',
      ).length,
    }
  }

  /**
   * Generate release notes in markdown format.
   */
  static generateReleaseNotes(
    version: string,
    entries: ChangelogEntry[],
  ): string {
    const lines: string[] = [
      `# Release Notes — v${version}`,
      '',
      `**Date:** ${new Date(entries[0]?.releasedAt ?? Date.now()).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`,
      '',
      '---',
      '',
    ]

    // Group by category
    const byCategory = new Map<ChangelogCategory, ChangelogEntry[]>()
    for (const entry of entries) {
      const existing = byCategory.get(entry.category) ?? []
      existing.push(entry)
      byCategory.set(entry.category, existing)
    }

    const categoryOrder: ChangelogCategory[] = [
      'feature',
      'enhancement',
      'performance',
      'bugfix',
      'security',
      'breaking',
      'deprecation',
      'infrastructure',
      'documentation',
    ]

    for (const category of categoryOrder) {
      const catEntries = byCategory.get(category)
      if (!catEntries || catEntries.length === 0) continue

      lines.push(`## ${CHANGELOG_CATEGORY_LABELS[category]}s`)
      lines.push('')

      for (const entry of catEntries) {
        lines.push(`### ${entry.title}`)
        lines.push('')
        lines.push(entry.description)
        lines.push('')
        if (entry.purpose) {
          lines.push(`**Purpose:** ${entry.purpose}`)
          lines.push('')
        }
        if (entry.impactNotes) {
          lines.push(`**Impact:** ${entry.impactNotes}`)
          lines.push('')
        }
        if (entry.migrationRequired && entry.migrationNotes) {
          lines.push(`**⚠ Migration Required:** ${entry.migrationNotes}`)
          lines.push('')
        }
      }
    }

    return lines.join('\n')
  }
}

// Re-import for the generateReleaseNotes helper
import {
  CHANGELOG_CATEGORY_LABELS,
} from './changelog.schema'
