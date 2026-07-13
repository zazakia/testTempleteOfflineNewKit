import { describe, it, expect, beforeEach } from 'vitest'
import { ApprovalEngine } from '../approval-engine'
import type { MetadataResolver, ApprovalWorkflow } from '@repo/multi-tenant'

describe('ApprovalEngine', () => {
  let mockWorkflow: ApprovalWorkflow
  let mockResolver: MetadataResolver
  let engine: ApprovalEngine

  beforeEach(() => {
    mockWorkflow = {
      steps: [
        { role: 'encoder', action: 'encode' },
        { role: 'validator', action: 'verify' },
        { role: 'manager', action: 'approve', minAmount: 50000 },
        { role: 'disburser', action: 'disburse' },
      ],
    }

    mockResolver = {
      getApprovalWorkflow: async () => mockWorkflow,
    } as unknown as MetadataResolver

    engine = new ApprovalEngine(mockResolver)
  })

  describe('getState', () => {
    it('should return pending state when no decisions exist', async () => {
      const state = await engine.getState('tenant-1', 'loan', 'loan-1')
      expect(state.status).toBe('pending')
      expect(state.currentStep).toBe(0)
      expect(state.totalSteps).toBe(4)
      expect(state.nextRequiredRole).toBe('encoder')
      expect(state.nextRequiredAction).toBe('encode')
      expect(state.decisions).toHaveLength(0)
    })
  })

  describe('process - happy path and state progression', () => {
    it('should progress step-by-step when roles and actions are correct', async () => {
      // Step 0: encode
      let state = await engine.process('tenant-1', 'loan', 'loan-1', {
        action: 'encode',
        performedBy: { userId: 'u1', role: 'encoder' },
        amount: 20000,
      })
      expect(state.status).toBe('in_progress')
      expect(state.currentStep).toBe(1)
      expect(state.nextRequiredRole).toBe('validator')
      expect(state.nextRequiredAction).toBe('verify')
      expect(state.decisions).toHaveLength(1)
      expect(state.decisions[0]!.decision).toBe('approved')

      // Step 1: verify
      state = await engine.process('tenant-1', 'loan', 'loan-1', {
        action: 'verify',
        performedBy: { userId: 'u2', role: 'validator' },
        amount: 20000,
      })
      // Note: step index 2 (manager approve) requires minAmount = 50000.
      // Since amount is 20000, it should auto-skip the manager step!
      // Therefore, it should advance to step 3 (disburser disburse).
      expect(state.status).toBe('in_progress')
      expect(state.currentStep).toBe(3)
      expect(state.nextRequiredRole).toBe('disburser')
      expect(state.nextRequiredAction).toBe('disburse')
      expect(state.decisions).toHaveLength(3) // encode + verify + skipped manager
      expect(state.decisions[2]!.decision).toBe('approved')
      expect(state.decisions[2]!.notes).toContain('Auto-skipped')

      // Step 3: disburse
      state = await engine.process('tenant-1', 'loan', 'loan-1', {
        action: 'disburse',
        performedBy: { userId: 'u3', role: 'disburser' },
        amount: 20000,
      })
      expect(state.status).toBe('approved')
      expect(state.currentStep).toBe(4)
      expect(state.nextRequiredRole).toBeUndefined()
      expect(state.decisions).toHaveLength(4)
    })

    it('should require manager approval if amount is above threshold', async () => {
      // Step 0: encode
      let state = await engine.process('tenant-1', 'loan', 'loan-2', {
        action: 'encode',
        performedBy: { userId: 'u1', role: 'encoder' },
        amount: 60000,
      })
      // Step 1: verify
      state = await engine.process('tenant-1', 'loan', 'loan-2', {
        action: 'verify',
        performedBy: { userId: 'u2', role: 'validator' },
        amount: 60000,
      })
      // Manager step is NOT skipped because 60000 >= 50000.
      expect(state.status).toBe('in_progress')
      expect(state.currentStep).toBe(2)
      expect(state.nextRequiredRole).toBe('manager')
      expect(state.nextRequiredAction).toBe('approve')

      // Step 2: approve
      state = await engine.process('tenant-1', 'loan', 'loan-2', {
        action: 'approve',
        performedBy: { userId: 'u3', role: 'manager' },
        amount: 60000,
      })
      expect(state.status).toBe('in_progress')
      expect(state.currentStep).toBe(3)
      expect(state.nextRequiredRole).toBe('disburser')

      // Step 3: disburse
      state = await engine.process('tenant-1', 'loan', 'loan-2', {
        action: 'disburse',
        performedBy: { userId: 'u4', role: 'disburser' },
        amount: 60000,
      })
      expect(state.status).toBe('approved')
      expect(state.currentStep).toBe(4)
    })
  })

  describe('process - error handling and validation', () => {
    it('should throw error when role is incorrect for the step', async () => {
      await expect(
        engine.process('tenant-1', 'loan', 'loan-3', {
          action: 'encode',
          performedBy: { userId: 'u1', role: 'manager' }, // expected encoder
          amount: 20000,
        })
      ).rejects.toThrow('Role "manager" cannot perform this step')
    })

    it('should throw error when action is incorrect for the step', async () => {
      await expect(
        engine.process('tenant-1', 'loan', 'loan-3', {
          action: 'verify', // expected encode
          performedBy: { userId: 'u1', role: 'encoder' },
          amount: 20000,
        })
      ).rejects.toThrow('Invalid action "verify". Step 1 requires "encode"')
    })
  })

  describe('process - rejection logic', () => {
    it('should allow rejection at any step and transition to rejected status', async () => {
      // Step 0: encode
      await engine.process('tenant-1', 'loan', 'loan-4', {
        action: 'encode',
        performedBy: { userId: 'u1', role: 'encoder' },
        amount: 20000,
      })

      // Step 1: reject
      const state = await engine.process('tenant-1', 'loan', 'loan-4', {
        action: 'reject',
        performedBy: { userId: 'u2', role: 'validator' },
        notes: 'Documents are unclear',
      })

      expect(state.status).toBe('rejected')
      expect(state.currentStep).toBe(2) // 1 + 1 (the rejected step index + 1)
      expect(state.decisions).toHaveLength(2)
      expect(state.decisions[1]!.decision).toBe('rejected')
      expect(state.decisions[1]!.notes).toBe('Documents are unclear')

      // Further actions should fail or reflect rejected state in getState
      const checkState = await engine.getState('tenant-1', 'loan', 'loan-4')
      expect(checkState.status).toBe('rejected')
    })
  })
})
