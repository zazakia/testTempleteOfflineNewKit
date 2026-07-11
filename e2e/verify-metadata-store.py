"""
Tenant Metadata Store Verification Test
Tests that per-tenant JSON/JSONB metadata can be stored, retrieved,
and queried via dot-path notation using the TenantMetadataStore.
"""
from playwright.sync_api import sync_playwright
import sys

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

    print("\n[Test] Tenant Metadata Store...")
    TENANT = "test-tenant-metadata"

    # Test 1: set full metadata blob
    print("\n--- Test 1: set() full metadata blob ---")
    result = page.evaluate("""
        async (tenantId) => {
            const store = window.__METADATA__;
            await store.set(tenantId, {
                loan: {
                    interestFormulas: {
                        declining_balance: { rateMultiplier: 1.0, roundingMode: 'nearest_cent' },
                        flat_rate: { rateMultiplier: 1.2 }
                    },
                    maxTermMonths: 60,
                    minAmount: 1000,
                    maxAmount: 500000
                },
                savings: { interestRate: 0.04, compoundingFrequency: 'monthly', minBalance: 500 },
                ui: { theme: { primaryColor: '#16a34a' }, customFields: [] },
                approvalWorkflows: { loan: { steps: [
                    { role: 'loan_encoder', action: 'encode' },
                    { role: 'manager', action: 'approve', minAmount: 50000 }
                ]}}
            });
            return 'ok';
        }
    """, TENANT)
    check("Metadata set successfully", result == "ok", f"Got: {result}")

    # Test 2: get() retrieves full blob
    print("\n--- Test 2: get() retrieves full metadata ---")
    metadata = page.evaluate("""
        async (tenantId) => {
            return await window.__METADATA__.get(tenantId);
        }
    """, TENANT)
    check("Metadata retrieved", metadata is not None)
    if metadata:
        check("Has loan config", "loan" in metadata)
        check("Has savings config", "savings" in metadata)
        check("Has UI theme", "ui" in metadata)
        check("Loan maxAmount is 500000",
              metadata.get("loan", {}).get("maxAmount") == 500000,
              f"Got: {metadata.get('loan', {}).get('maxAmount')}")

    # Test 3: getField with dot-path
    print("\n--- Test 3: getField() dot-path access ---")
    max_amount = page.evaluate("""
        async (tenantId) => {
            return await window.__METADATA__.getField(tenantId, 'loan.maxAmount');
        }
    """, TENANT)
    check("getField('loan.maxAmount') -> 500000", max_amount == 500000, f"Got: {max_amount}")

    interest_rate = page.evaluate("""
        async (tenantId) => {
            return await window.__METADATA__.getField(tenantId, 'savings.interestRate');
        }
    """, TENANT)
    check("getField('savings.interestRate') -> 0.04",
          interest_rate == 0.04, f"Got: {interest_rate}")

    primary_color = page.evaluate("""
        async (tenantId) => {
            return await window.__METADATA__.getField(tenantId, 'ui.theme.primaryColor');
        }
    """, TENANT)
    check("getField('ui.theme.primaryColor') -> #16a34a",
          primary_color == "#16a34a", f"Got: {primary_color}")

    missing = page.evaluate("""
        async (tenantId) => {
            return await window.__METADATA__.getField(tenantId, 'loan.nonexistent');
        }
    """, TENANT)
    check("getField('loan.nonexistent') -> undefined", missing is None)

    # Test 4: setField() with dot-path (merge)
    print("\n--- Test 4: setField() dot-path merge ---")
    page.evaluate("""
        async (tenantId) => {
            await window.__METADATA__.setField(tenantId, 'loan.maxAmount', 750000);
            await window.__METADATA__.setField(tenantId, 'savings.interestRate', 0.06);
            await window.__METADATA__.setField(tenantId, 'ui.theme.primaryColor', '#2563eb');
        }
    """, TENANT)
    
    updated_max = page.evaluate("""
        async (tenantId) => {
            return await window.__METADATA__.getField(tenantId, 'loan.maxAmount');
        }
    """, TENANT)
    check("setField updated loan.maxAmount to 750000",
          updated_max == 750000, f"Got: {updated_max}")

    updated_rate = page.evaluate("""
        async (tenantId) => {
            return await window.__METADATA__.getField(tenantId, 'savings.interestRate');
        }
    """, TENANT)
    check("setField updated savings.interestRate to 0.06",
          updated_rate == 0.06, f"Got: {updated_rate}")

    # Verify merge preserved other fields
    full = page.evaluate("""
        async (tenantId) => {
            return await window.__METADATA__.get(tenantId);
        }
    """, TENANT)
    check("Merge preserved loan.interestFormulas",
          full.get("loan", {}).get("interestFormulas") is not None)
    check("Merge preserved loan.minAmount (1000)",
          full.get("loan", {}).get("minAmount") == 1000)

    # Test 5: exists()
    print("\n--- Test 5: exists() check ---")
    exists = page.evaluate("""
        async (tenantId) => {
            return await window.__METADATA__.exists(tenantId);
        }
    """, TENANT)
    check("exists() returns true after set", exists == True)

    nonexistent = page.evaluate("""
        async () => {
            return await window.__METADATA__.exists('nonexistent-tenant');
        }
    """)
    check("exists('nonexistent-tenant') returns false", nonexistent == False)

    # Test 6: New tenant gets empty metadata
    print("\n--- Test 6: Empty metadata for new tenant ---")
    empty = page.evaluate("""
        async () => {
            return await window.__METADATA__.get('brand-new-tenant');
        }
    """)
    check("New tenant get() returns empty object",
          isinstance(empty, dict) and len(empty) == 0)

    page.screenshot(path="D:/GitHub/testTempleteOfflineNewKit/test-results/metadata-store-verify.png")
    print("\n[Screenshot] test-results/metadata-store-verify.png")
    browser.close()

print(f"\n{'='*50}")
print(f"Results: {results['pass']} passed, {results['fail']} failed")
if results["fail"] > 0:
    print("FAIL: Some tests FAILED")
    sys.exit(1)
else:
    print("PASS: All tenant metadata store tests passed")
