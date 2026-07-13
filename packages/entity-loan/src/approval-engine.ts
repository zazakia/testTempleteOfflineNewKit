/**
 * ─── Approval Workflow Engine ─────────────────────────────────
 * Executes multi-step approval workflows defined in tenant metadata.
 * Each step requires a specific role to approve before proceeding.
 *
 * Usage:
 *   const engine = new ApprovalEngine(metadataResolver)
 *   const result = await engine.process('tenant-1', 'loan', entityId, {
 *     action: 'approve',
 *     performedBy: { userId: 'u1', role: 'manager' },
 *     amount: 75000
 *   })
 *
 * Metadata-driven: workflow steps come from tenant metadata,
 * no hardcoded per-tenant logic.
 */

import type { MetadataResolver, ApprovalStep, ApprovalWorkflow } from '@repo/multi-tenant'

// ─── Types ──────────────────────────────────────────────────

export interface ApprovalAction {
  action: 'encode' | 'approve' | 'verify' | 'disburse' | 'reject'
  performedBy: { userId: string; role: string; fullName?: string }
  amount?: number
  notes?: string
}

export interface ApprovalDecision {
  id: string
  tenantId: string
  module: string
  entityId: string
  stepIndex: number
  stepRole: string
  stepAction: string
  decidedBy: string
  decidedAt: number
  decision: 'approved' | 'rejected'
  notes?: string
}

export interface ApprovalResult {
  status: 'pending' | 'approved' | 'rejected' | 'in_progress'
  currentStep: number
  totalSteps: number
  decisions: ApprovalDecision[]
  nextRequiredRole?: string
  nextRequiredAction?: string
}

// ─── In-Memory Decision Store ──────────────────────────────

class DecisionStore {
  private decisions: ApprovalDecision[] = []

  async add(decision: ApprovalDecision): Promise<void> {
    this.decisions.push(decision)
  }

  async getForEntity(module: string, entityId: string): Promise<ApprovalDecision[]> {
    return this.decisions.filter(d => d.module === module && d.entityId === entityId)
  }

  async clear(): Promise<void> {
    this.decisions = []
  }
}

// ─── Engine ─────────────────────────────────────────────────

export class ApprovalEngine {
  private decisions = new DecisionStore()

  constructor(private resolver: MetadataResolver) {}

  /**
   * Process an approval action against a workflow.
   * Returns the current approval state after the action.
   */
  async process(
    tenantId: string,
    module: string,
    entityId: string,
    action: ApprovalAction,
  ): Promise<ApprovalResult> {
    // Get the tenant's workflow for this module
    const workflow = await this.resolver.getApprovalWorkflow(tenantId, module)

    // Get existing decisions
    const existingDecisions = await this.decisions.getForEntity(module, entityId)

    // Find current step
    const currentStepIndex = existingDecisions.length

    const currentStep = workflow.steps[currentStepIndex]
    if (!currentStep) {
      return {
        status: 'approved',
        currentStep: workflow.steps.length,
        totalSteps: workflow.steps.length,
        decisions: existingDecisions,
      }
    }

    // Allow rejection at any step
    if (action.action === 'reject') {
      const decision: ApprovalDecision = {
        id: `dec-${entityId}-${currentStepIndex}-${Date.now()}`,
        tenantId, module, entityId,
        stepIndex: currentStepIndex,
        stepRole: currentStep.role,
        stepAction: action.action,
        decidedBy: action.performedBy.userId,
        decidedAt: Date.now(),
        decision: 'rejected',
        notes: action.notes,
      }
      await this.decisions.add(decision)
      return {
        status: 'rejected',
        currentStep: currentStepIndex + 1,
        totalSteps: workflow.steps.length,
        decisions: [...existingDecisions, decision],
      }
    }

    // Check if the user's role can perform this step's action
    if (action.action !== currentStep.action) {
      throw new Error(
        `Invalid action "${action.action}". Step ${currentStepIndex + 1} requires "${currentStep.action}"`
      )
    }

    if (action.performedBy.role !== currentStep.role) {
      throw new Error(
        `Role "${action.performedBy.role}" cannot perform this step. Required role: "${currentStep.role}"`
      )
    }

    // Check minimum amount threshold on THIS step (amount must meet threshold to require this step)
    if (currentStep.minAmount != null && (action.amount ?? 0) < currentStep.minAmount) {
      // Skip this step — amount below threshold, auto-approve
      const skipDecision: ApprovalDecision = {
        id: `dec-skip-${entityId}-${currentStepIndex}-${Date.now()}`,
        tenantId, module, entityId,
        stepIndex: currentStepIndex,
        stepRole: currentStep.role,
        stepAction: currentStep.action,
        decidedBy: action.performedBy.userId,
        decidedAt: Date.now(),
        decision: 'approved',
        notes: 'Auto-skipped (amount below threshold)',
      }
      await this.decisions.add(skipDecision)
      const allDecisions = [...existingDecisions, skipDecision]
      // Check if there are more steps
      const nextIdx = currentStepIndex + 1
      const nextStep = workflow.steps[nextIdx]
      if (!nextStep) {
        return { status: 'approved', currentStep: workflow.steps.length, totalSteps: workflow.steps.length, decisions: allDecisions }
      }
      return {
        status: 'in_progress', currentStep: nextIdx, totalSteps: workflow.steps.length,
        decisions: allDecisions,
        nextRequiredRole: nextStep.role, nextRequiredAction: nextStep.action,
      }
    }

    // Record the decision
    const decision: ApprovalDecision = {
      id: `dec-${entityId}-${currentStepIndex}-${Date.now()}`,
      tenantId,
      module,
      entityId,
      stepIndex: currentStepIndex,
      stepRole: currentStep.role,
      stepAction: currentStep.action,
      decidedBy: action.performedBy.userId,
      decidedAt: Date.now(),
      decision: 'approved',
      notes: action.notes,
    }

    await this.decisions.add(decision)

    // Move to next step, auto-skipping threshold steps if amount below min
    const allDecisions = [...existingDecisions, decision]
    return this.advanceWorkflow(tenantId, module, entityId, workflow, allDecisions, action.amount ?? 0)
  }
  /** Advance through remaining steps, auto-skipping threshold-gated steps */
  private async advanceWorkflow(
    tenantId: string, module: string, entityId: string,
    workflow: ApprovalWorkflow, decisions: ApprovalDecision[],
    amount: number,
  ): Promise<ApprovalResult> {
    let allDecisions = [...decisions]
    let idx = allDecisions.length

    while (idx < workflow.steps.length) {
      const step = workflow.steps[idx]
      if (!step) {
        idx++
        continue
      }
      // Auto-skip if amount below threshold
      if (step.minAmount != null && amount < step.minAmount) {
        const skipDec: ApprovalDecision = {
          id: `dec-skip-${entityId}-${idx}-${Date.now()}`,
          tenantId, module, entityId,
          stepIndex: idx, stepRole: step.role, stepAction: step.action,
          decidedBy: 'system', decidedAt: Date.now(),
          decision: 'approved',
          notes: 'Auto-skipped (amount below threshold)',
        }
        allDecisions.push(skipDec)
        await this.decisions.add(skipDec)
        idx++
        continue
      }
      // This step needs manual approval — stop here
      return {
        status: 'in_progress', currentStep: idx, totalSteps: workflow.steps.length,
        decisions: allDecisions,
        nextRequiredRole: step.role, nextRequiredAction: step.action,
      }
    }

    return { status: 'approved', currentStep: workflow.steps.length, totalSteps: workflow.steps.length, decisions: allDecisions }
  }

  /** Get current approval state for an entity */
  async getState(tenantId: string, module: string, entityId: string): Promise<ApprovalResult> {
    const workflow = await this.resolver.getApprovalWorkflow(tenantId, module)
    const decisions = await this.decisions.getForEntity(module, entityId)

    if (decisions.length === 0) {
      const firstStep = workflow.steps[0]
      return {
        status: 'pending',
        currentStep: 0,
        totalSteps: workflow.steps.length,
        decisions: [],
        nextRequiredRole: firstStep?.role,
        nextRequiredAction: firstStep?.action,
      }
    }

    const lastDecision = decisions[decisions.length - 1]
    if (!lastDecision) {
      return { status: 'pending', currentStep: 0, totalSteps: workflow.steps.length, decisions: [] }
    }
    if (lastDecision.decision === 'rejected') {
      return { status: 'rejected', currentStep: decisions.length, totalSteps: workflow.steps.length, decisions }
    }

    if (decisions.length >= workflow.steps.length) {
      return { status: 'approved', currentStep: workflow.steps.length, totalSteps: workflow.steps.length, decisions }
    }

    const nextStep = workflow.steps[decisions.length]
    if (!nextStep) {
      return { status: 'approved', currentStep: workflow.steps.length, totalSteps: workflow.steps.length, decisions }
    }
    return {
      status: 'in_progress',
      currentStep: decisions.length,
      totalSteps: workflow.steps.length,
      decisions,
      nextRequiredRole: nextStep.role,
      nextRequiredAction: nextStep.action,
    }
  }

  /** Clear all decisions (for testing) */
  async reset(): Promise<void> {
    await this.decisions.clear()
  }
}
