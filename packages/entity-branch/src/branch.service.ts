/**
 * ─── Branch Service ──────────────────────────────────────────
 * Pure business logic for Branches.
 * No I/O — operates on data in memory.
 */

import type { Branch } from './branch.schema'

export interface BranchValidationResult {
  valid: boolean
  reason?: string
}

export class BranchService {
  /**
   * Validate and normalize branch data before creation.
   */
  static prepareForCreate(input: Record<string, unknown>): Record<string, unknown> {
    const data = { ...input }

    // Normalize branch code (uppercase, trimmed)
    if (typeof data.branchCode === 'string') {
      data.branchCode = data.branchCode.toUpperCase().trim()
    }

    // Normalize name (title case)
    if (typeof data.name === 'string') {
      data.name = data.name
        .trim()
        .toLowerCase()
        .replace(/\b\w/g, (c: string) => c.toUpperCase())
    }

    // Defaults
    if (data.isMainBranch === undefined) {
      data.isMainBranch = false
    }
    if (!data.status) {
      data.status = 'active'
    }
    if (!data.openedDate) {
      data.openedDate = Date.now()
    }

    return data
  }

  /**
   * Validate branch data for business rules.
   */
  static validate(branch: Partial<Branch>): BranchValidationResult {
    if (!branch.name || branch.name.trim().length === 0) {
      return { valid: false, reason: 'Branch name is required' }
    }

    if (!branch.branchCode || branch.branchCode.trim().length === 0) {
      return { valid: false, reason: 'Branch code is required' }
    }

    // Branch code format: letters, numbers, hyphens only
    const codeRegex = /^[A-Z0-9-]+$/
    if (branch.branchCode && !codeRegex.test(branch.branchCode)) {
      return {
        valid: false,
        reason: 'Branch code must contain only uppercase letters, numbers, and hyphens',
      }
    }

    return { valid: true }
  }

  /**
   * Generate a unique branch code from tenant abbreviation and location.
   */
  static generateBranchCode(tenantSlug: string, location: string): string {
    const tenantPart = tenantSlug.substring(0, 3).toUpperCase()
    const locationPart = location
      .substring(0, 5)
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
    return `${tenantPart}-${locationPart}`
  }

  /**
   * Check if a branch can be deactivated.
   * Main branch cannot be deactivated if it's the only active branch.
   */
  static canDeactivate(
    branch: Branch,
    allBranches: Branch[],
  ): { allowed: boolean; reason?: string } {
    if (branch.isMainBranch) {
      // Check if there are other active branches that could take over
      const otherActive = allBranches.filter(
        (b) => b.id !== branch.id && b.status === 'active',
      )
      if (otherActive.length === 0) {
        return {
          allowed: false,
          reason: 'Cannot deactivate the only active branch. Designate another branch as main first.',
        }
      }
    }
    return { allowed: true }
  }

  /**
   * Get summary statistics for a branch.
   */
  static getSummary(
    branch: Branch,
    memberCount: number,
    loanCount: number,
    totalDeposits: number,
  ) {
    return {
      branchId: branch.id,
      branchName: branch.name,
      branchCode: branch.branchCode,
      isMainBranch: branch.isMainBranch,
      status: branch.status,
      memberCount,
      loanCount,
      totalDeposits,
      openedDate: branch.openedDate,
      daysSinceOpened: branch.openedDate
        ? Math.floor((Date.now() - branch.openedDate) / (1000 * 60 * 60 * 24))
        : null,
    }
  }
}
