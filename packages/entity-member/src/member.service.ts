/**
 * ─── Member Service ─────────────────────────────────────────
 * Pure business logic for Philippine Cooperative members.
 * CDA compliance rules and member management operations.
 */

import type { Member, MembershipStatus } from './member.schema'

export interface ValidationResult {
  valid: boolean
  reason?: string
}

export class MemberService {
  /**
   * Generate a membership number based on format: COOP-YYYY-XXXX
   */
  static generateMembershipNumber(coopCode: string, year: number, sequence: number): string {
    return `${coopCode}-${year}-${String(sequence).padStart(4, '0')}`
  }

  /**
   * Compute full name from components.
   */
  static formatFullName(firstName: string, lastName: string, middleName?: string, extension?: string): string {
    let name = `${firstName} ${lastName}`
    if (middleName) name = `${firstName} ${middleName} ${lastName}`
    if (extension) name = `${name} ${extension}`
    return name
  }

  /**
   * Validate that member can be activated (PMES must be completed).
   */
  static canActivate(member: Member): ValidationResult {
    if (member.membershipStatus === 'active') {
      return { valid: false, reason: 'Member is already active' }
    }
    if (!member.pmesCompleted) {
      return { valid: false, reason: 'PMES (Pre-Membership Education Seminar) must be completed first' }
    }
    if (!member.bodResolutionNumber) {
      return { valid: false, reason: 'Board resolution number is required for activation' }
    }
    return { valid: true }
  }

  /**
   * Check if member is eligible for a loan based on membership status.
   */
  static canApplyForLoan(member: Member): ValidationResult {
    if (member.membershipStatus !== 'active') {
      return { valid: false, reason: `Only active members can apply for loans. Status: ${member.membershipStatus}` }
    }
    if (member.membershipType === 'associate') {
      return { valid: false, reason: 'Associate members are not eligible for loans' }
    }
    if (member.terminationDate) {
      return { valid: false, reason: 'Member is terminated' }
    }
    return { valid: true }
  }

  /**
   * Get membership status for display.
   */
  static getStatusLabel(status: MembershipStatus): string {
    const labels: Record<MembershipStatus, string> = {
      active: 'Active',
      inactive: 'Inactive',
      suspended: 'Suspended',
      terminated: 'Terminated',
      deceased: 'Deceased',
    }
    return labels[status] ?? status
  }

  /**
   * Check if member has complete requirements (for CDA compliance).
   */
  static hasCompleteRequirements(member: Member): { complete: boolean; missing: string[] } {
    const missing: string[] = []

    if (!member.firstName) missing.push('First Name')
    if (!member.lastName) missing.push('Last Name')
    if (!member.dateOfBirth) missing.push('Date of Birth')
    if (!member.barangay) missing.push('Barangay')
    if (!member.cityMunicipality) missing.push('City/Municipality')
    if (!member.province) missing.push('Province')
    if (!member.pmesCompleted) missing.push('PMES Completion')
    if (!member.tinNumber) missing.push('TIN Number')
    if (!member.membershipNumber) missing.push('Membership Number')

    return {
      complete: missing.length === 0,
      missing,
    }
  }

  /**
   * Compute member age from date of birth.
   */
  static computeAge(dateOfBirth: number): number {
    const now = Date.now()
    const diff = now - dateOfBirth
    return Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000))
  }

  /**
   * Check if member should be automatically marked inactive.
   */
  static shouldAutoInactivate(member: Member): boolean {
    if (member.membershipStatus !== 'active') return false
    if (!member.updatedAt) return false
    const yearsSinceUpdate = (Date.now() - member.updatedAt) / (365.25 * 24 * 60 * 60 * 1000)
    return yearsSinceUpdate > 3 // No activity for 3+ years
  }
}
