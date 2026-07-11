"""
Approval Engine Verification Test
Tests multi-step, role-gated, amount-thresholded approval workflows
driven by tenant metadata (not hardcoded logic).
"""
from playwright.sync_api import sync_playwright
import sys

BASE = "http://localhost:5177"
results = {"pass": 0, "fail": 0}

def check(label, condition, detail=""):
    if condition:
        results["pass"] += 1
        print(f"  PASS: {label}")
    else:
        results["fail"] += 1
        print(f"  FAIL: {label}  {detail}")

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    page.goto(BASE, wait_until="networkidle", timeout=15000)
    page.wait_for_timeout(2000)

    print("\n[Test] Approval Workflow Engine...")

    # Setup: seed approval metadata for two tenants
    page.evaluate("""
        async () => {
            const s = window.__METADATA__;
            // Tenant A: 3-step loan approval (encoder -> officer -> manager)
            await s.set('approval-tenant-a', {
                approvalWorkflows: { loan: { steps: [
                    { role: 'loan_encoder', action: 'encode' },
                    { role: 'officer', action: 'verify' },
                    { role: 'manager', action: 'approve', minAmount: 50000 }
                ]}}
            });
            // Tenant B: simple 2-step (encoder -> manager, no threshold)
            await s.set('approval-tenant-b', {
                approvalWorkflows: { loan: { steps: [
                    { role: 'loan_encoder', action: 'encode' },
                    { role: 'manager', action: 'approve' }
                ]}}
            });
        }
    """)

    # Test 1: Tenant A — Step 1 (encoder submits)
    print("\n--- Test 1: Tenant A, Step 1 — encoder encodes loan ---")
    r1 = page.evaluate("""
        async () => {
            const e = window.__APPROVAL__;
            await e.reset();
            return await e.process('approval-tenant-a', 'loan', 'loan-001', {
                action: 'encode', performedBy: { userId: 'u5', role: 'loan_encoder', fullName: 'Ana Encoder' },
                amount: 75000, notes: 'Loan application for farm equipment'
            });
        }
    """)
    check("Status is 'in_progress' after step 1", r1["status"] == "in_progress", f"Got: {r1['status']}")
    check("Current step is 1 (of 3)", r1["currentStep"] == 1)
    check("Next role is 'officer'", r1["nextRequiredRole"] == "officer", f"Got: {r1['nextRequiredRole']}")
    check("Next action is 'verify'", r1["nextRequiredAction"] == "verify")

    # Test 2: Tenant A — Step 2 (officer verifies)
    print("\n--- Test 2: Tenant A, Step 2 — officer verifies ---")
    r2 = page.evaluate("""
        async () => {
            return await window.__APPROVAL__.process('approval-tenant-a', 'loan', 'loan-001', {
                action: 'verify', performedBy: { userId: 'u10', role: 'officer', fullName: 'Maria Officer' },
                amount: 75000
            });
        }
    """)
    check("Status is 'in_progress' after step 2", r2["status"] == "in_progress")
    check("Current step is 2", r2["currentStep"] == 2)
    check("Next role is 'manager'", r2["nextRequiredRole"] == "manager")
    check("Next action is 'approve'", r2["nextRequiredAction"] == "approve")

    # Test 3: Tenant A — Step 3 (manager approves — amount triggers threshold)
    print("\n--- Test 3: Tenant A, Step 3 — manager approves (75000 > 50000 threshold) ---")
    r3 = page.evaluate("""
        async () => {
            return await window.__APPROVAL__.process('approval-tenant-a', 'loan', 'loan-001', {
                action: 'approve', performedBy: { userId: 'u2', role: 'manager', fullName: 'Maria Santos' },
                amount: 75000
            });
        }
    """)
    check("Status is 'approved' after all steps", r3["status"] == "approved")
    check("Current step is 3 (complete)", r3["currentStep"] == 3)
    check("All 3 decisions recorded", len(r3["decisions"]) == 3)

    # Test 4: Tenant A — Skip threshold (amount below minAmount)
    print("\n--- Test 4: Tenant A — threshold skip (amount < 50000 skips manager) ---")
    page.evaluate("window.__APPROVAL__.reset()")
    # Encode
    page.evaluate("""
        async () => {
            await window.__APPROVAL__.process('approval-tenant-a', 'loan', 'loan-002', {
                action: 'encode', performedBy: { userId: 'u5', role: 'loan_encoder' }, amount: 10000
            });
        }
    """)
    # Verify
    r4 = page.evaluate("""
        async () => {
            return await window.__APPROVAL__.process('approval-tenant-a', 'loan', 'loan-002', {
                action: 'verify', performedBy: { userId: 'u10', role: 'officer' }, amount: 10000
            });
        }
    """)
    check("Auto-skipped manager step (amount 10000 < 50000 threshold)",
          r4["status"] == "approved", f"Got status: {r4['status']}, steps: {r4['currentStep']}")

    # Test 5: Wrong role rejection
    print("\n--- Test 5: Wrong role should throw error ---")
    page.evaluate("window.__APPROVAL__.reset()")
    r5 = page.evaluate("""
        async () => {
            try {
                await window.__APPROVAL__.process('approval-tenant-a', 'loan', 'loan-003', {
                    action: 'approve', performedBy: { userId: 'u4', role: 'borrower' }, amount: 5000
                });
                return 'no-error';
            } catch (e) { return e.message || 'error'; }
        }
    """)
    check("Role 'borrower' rejected for step 1 (wrong action, then wrong role)",
          "invalid action" in str(r5).lower() or "cannot perform" in str(r5).lower(),
          f"Got: {r5}")

    # Test 6: Tenant B — simple 2-step approval (no threshold)
    print("\n--- Test 6: Tenant B — simple 2-step approval ---")
    page.evaluate("window.__APPROVAL__.reset()")
    page.evaluate("""
        async () => {
            await window.__APPROVAL__.process('approval-tenant-b', 'loan', 'loan-b01', {
                action: 'encode', performedBy: { userId: 'u5', role: 'loan_encoder' }, amount: 2000
            });
        }
    """)
    r6 = page.evaluate("""
        async () => {
            return await window.__APPROVAL__.process('approval-tenant-b', 'loan', 'loan-b01', {
                action: 'approve', performedBy: { userId: 'u2', role: 'manager' }, amount: 2000
            });
        }
    """)
    check("Tenant B approved in 2 steps", r6["status"] == "approved")
    check("Tenant B: totalSteps = 2", r6["totalSteps"] == 2, f"Got: {r6['totalSteps']}")
    check("Tenant B: 2 decisions", len(r6["decisions"]) == 2)

    # Test 7: Rejection mid-workflow
    print("\n--- Test 7: Rejection mid-workflow ---")
    page.evaluate("window.__APPROVAL__.reset()")
    page.evaluate("""
        async () => {
            await window.__APPROVAL__.process('approval-tenant-a', 'loan', 'loan-rej', {
                action: 'encode', performedBy: { userId: 'u5', role: 'loan_encoder' }, amount: 5000
            });
        }
    """)
    r7 = page.evaluate("""
        async () => {
            return await window.__APPROVAL__.process('approval-tenant-a', 'loan', 'loan-rej', {
                action: 'reject', performedBy: { userId: 'u10', role: 'officer' },
                amount: 5000, notes: 'Incomplete documents'
            });
        }
    """)
    check("Status is 'rejected'", r7["status"] == "rejected")
    check("Rejection has notes", r7["decisions"][1]["notes"] == "Incomplete documents")
    check("Only 2 decisions (encode + reject)", len(r7["decisions"]) == 2)

    # Test 8: Pending state (no decisions yet)
    print("\n--- Test 8: Pending state for new entity ---")
    r8 = page.evaluate("""
        async () => {
            return await window.__APPROVAL__.getState('approval-tenant-a', 'loan', 'loan-new');
        }
    """)
    check("New entity status is 'pending'", r8["status"] == "pending")
    check("Current step is 0", r8["currentStep"] == 0)
    check("First required role is 'loan_encoder'", r8["nextRequiredRole"] == "loan_encoder")

    print("\n--- Test 9: Wrong action rejected ---")
    r9 = page.evaluate("""
        async () => {
            try {
                await window.__APPROVAL__.process('approval-tenant-a', 'loan', 'loan-err', {
                    action: 'approve', performedBy: { userId: 'u5', role: 'loan_encoder' }, amount: 1000
                });
                return 'no-error';
            } catch (e) { return e.message || 'error'; }
        }
    """)
    check("Action 'approve' rejected for encode step",
          "invalid action" in str(r9).lower(),
          f"Got: {r9}")

    page.screenshot(path="D:/GitHub/testTempleteOfflineNewKit/test-results/approval-engine-verify.png")
    print("\n[Screenshot] test-results/approval-engine-verify.png")
    browser.close()

print(f"\n{'='*50}")
print(f"Results: {results['pass']} passed, {results['fail']} failed")
sys.exit(1 if results["fail"] > 0 else 0)
