"""
Runtime Metadata Interpreter Verification Test
Tests that per-tenant metadata drives business logic at runtime.
"""
from playwright.sync_api import sync_playwright
import sys, math

BASE = "http://localhost:5174"
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
    page.wait_for_timeout(3000)

    # Seed two tenants with different configs
    print("\n  Seeding metadata for coop-alfa and coop-bravo...")
    page.evaluate("""
        async () => {
            const s = window.__METADATA__;
            await s.set('coop-alfa', {
                loan: {
                    interestFormulas: {
                        declining_balance: { rateMultiplier: 0.85, roundingMode: 'floor' },
                        flat_rate: { rateMultiplier: 1.0, roundingMode: 'nearest_cent' }
                    },
                    maxTermMonths: 36, minAmount: 500, maxAmount: 100000
                },
                savings: { interestRate: 0.03, compoundingFrequency: 'quarterly', minBalance: 200 },
                approvalWorkflows: { loan: { steps: [
                    { role: 'loan_encoder', action: 'encode' },
                    { role: 'officer', action: 'verify' },
                    { role: 'manager', action: 'approve', minAmount: 25000 }
                ]}},
                ui: { customFields: { member: [
                    { name: 'occupation', label: 'Occupation', type: 'text', required: true },
                    { name: 'tribe', label: 'Tribe', type: 'select', required: false,
                      options: ['Tagalog', 'Cebuano', 'Ilocano', 'Other'] }
                ]}}
            });
            await s.set('coop-bravo', {
                loan: {
                    interestFormulas: {
                        declining_balance: { rateMultiplier: 1.5, roundingMode: 'ceil' },
                        flat_rate: { rateMultiplier: 1.8, roundingMode: 'ceil' }
                    },
                    maxTermMonths: 72, minAmount: 2000, maxAmount: 1000000
                },
                savings: { interestRate: 0.06, compoundingFrequency: 'monthly', minBalance: 1000 }
            });
        }
    """)

    # --- Test 1: Defaults ---
    print("\n--- Test 1: Defaults for unknown tenant ---")
    d = page.evaluate("""
        async () => {
            const m = await import('/src/lib/db.ts');
            const r = m.metadataResolver;
            const f = await r.getLoanInterestFormula('unknown', 'declining_balance');
            const l = await r.getLoanLimits('unknown');
            return { mult: f.rateMultiplier, round: f.roundingMode, maxAmt: l.maxAmount, maxTerm: l.maxTermMonths };
        }
    """)
    check("Default rateMultiplier=1.0", d["mult"] == 1.0)
    check("Default roundingMode=nearest_cent", d["round"] == "nearest_cent")
    check("Default maxAmount=500000", d["maxAmt"] == 500000)
    check("Default maxTermMonths=60", d["maxTerm"] == 60)

    # --- Test 2: Alfa config ---
    print("\n--- Test 2: Alfa config (conservative) ---")
    a = page.evaluate("""
        async () => {
            const m = await import('/src/lib/db.ts');
            const r = m.metadataResolver;
            const f = await r.getLoanInterestFormula('coop-alfa', 'declining_balance');
            const l = await r.getLoanLimits('coop-alfa');
            const s = await r.getSavingsConfig('coop-alfa');
            return { mult: f.rateMultiplier, round: f.roundingMode, maxAmt: l.maxAmount,
                     savRate: s.interestRate, comp: s.compoundingFrequency };
        }
    """)
    check("Alfa rateMultiplier=0.85", a["mult"] == 0.85)
    check("Alfa roundingMode=floor", a["round"] == "floor")
    check("Alfa maxAmount=100000", a["maxAmt"] == 100000)
    check("Alfa savings rate=3%", a["savRate"] == 0.03)
    check("Alfa compounding=quarterly", a["comp"] == "quarterly")

    # --- Test 3: Bravo config ---
    print("\n--- Test 3: Bravo config (aggressive) ---")
    b = page.evaluate("""
        async () => {
            const m = await import('/src/lib/db.ts');
            const r = m.metadataResolver;
            const f = await r.getLoanInterestFormula('coop-bravo', 'declining_balance');
            const l = await r.getLoanLimits('coop-bravo');
            return { mult: f.rateMultiplier, round: f.roundingMode, maxAmt: l.maxAmount, maxTerm: l.maxTermMonths };
        }
    """)
    check("Bravo rateMultiplier=1.5", b["mult"] == 1.5)
    check("Bravo roundingMode=ceil", b["round"] == "ceil")
    check("Bravo maxAmount=1000000", b["maxAmt"] == 1000000)
    check("Bravo maxTerm=72", b["maxTerm"] == 72)

    # --- Test 4: Metadata-driven amortization ---
    print("\n--- Test 4: Metadata-driven rate adjustment ---")
    adj = page.evaluate("""
        async () => {
            const m = await import('/src/lib/db.ts');
            const r = m.metadataResolver;
            const f = await r.getLoanInterestFormula('coop-alfa', 'declining_balance');
            const adjusted = 12 * f.rateMultiplier;
            return adjusted;
        }
    """)
    check("12% * 0.85 = 10.2% adjusted rate", abs(adj - 10.2) < 0.01, f"Got: {adj}")

    # --- Test 5: Custom fields ---
    print("\n--- Test 5: Custom fields per tenant ---")
    cf = page.evaluate("""
        async () => {
            const m = await import('/src/lib/db.ts');
            const r = m.metadataResolver;
            const aFields = await r.getCustomFields('coop-alfa', 'member');
            const bFields = await r.getCustomFields('coop-bravo', 'member');
            return { aCount: aFields.length, bCount: bFields.length,
                     field1Name: aFields.length > 0 ? aFields[0].name : null,
                     field2Name: aFields.length > 1 ? aFields[1].name : null };
        }
    """)
    check("Alfa has 2 custom fields", cf["aCount"] == 2, f"Got: {cf['aCount']}")
    check("Alfa field1 = occupation", cf["field1Name"] == "occupation")
    check("Alfa field2 = tribe", cf["field2Name"] == "tribe")
    check("Bravo has 0 custom fields (default)", cf["bCount"] == 0)

    # --- Test 6: Approval workflows ---
    print("\n--- Test 6: Approval workflows ---")
    wf = page.evaluate("""
        async () => {
            const m = await import('/src/lib/db.ts');
            const r = m.metadataResolver;
            const a = await r.getApprovalWorkflow('coop-alfa', 'loan');
            const d = await r.getApprovalWorkflow('unknown', 'loan');
            return { alfaSteps: a.steps.length, defaultSteps: d.steps.length,
                     step2role: a.steps.length > 1 ? a.steps[1].role : null };
        }
    """)
    check("Alfa has 3-step workflow", wf["alfaSteps"] == 3)
    check("Alfa step 2 = officer verify", wf["step2role"] == "officer")
    check("Default workflow = 2 steps", wf["defaultSteps"] == 2)

    # --- Test 7: Cache invalidation ---
    print("\n--- Test 7: Cache invalidation after update ---")
    page.evaluate("""
        async () => {
            await window.__METADATA__.setField('coop-alfa', 'loan.interestFormulas.declining_balance.rateMultiplier', 0.90);
        }
    """)
    upd = page.evaluate("""
        async () => {
            const m = await import('/src/lib/db.ts');
            const r = m.metadataResolver;
            r.invalidate('coop-alfa');
            const f = await r.getLoanInterestFormula('coop-alfa', 'declining_balance');
            return f.rateMultiplier;
        }
    """)
    check("After setField+invalidate, rateMultiplier=0.90", upd == 0.90, f"Got: {upd}")

    page.screenshot(path="D:/GitHub/testTempleteOfflineNewKit/test-results/metadata-interpreter-verify.png")
    print("\n[Screenshot] test-results/metadata-interpreter-verify.png")
    browser.close()

print(f"\n{'='*50}")
print(f"Results: {results['pass']} passed, {results['fail']} failed")
sys.exit(1 if results["fail"] > 0 else 0)
