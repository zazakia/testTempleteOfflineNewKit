"""
Feature Flag Verification Test
Tests toggle behavior of feature flags in the running app.
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
    page = browser.new_page(viewport={"width": 1280, "height": 800})

    print("\n[Test] Loading app...")
    page.goto(BASE, wait_until="networkidle", timeout=15000)
    page.wait_for_timeout(3000)

    # Test 1: debug.error-details should be ON in dev mode
    print("\n--- Test 1: debug.error-details ON -> debug bar visible ---")
    debug_bar = page.locator("text=env=development")
    check("Debug bar visible", debug_bar.is_visible())
    if debug_bar.is_visible():
        text = debug_bar.text_content()
        check("Shows env=development", "development" in text, "Text: " + text)
        check("Shows tenant=default", "default" in text, "Text: " + text)

    # Test 2: export.csv ON -> Analytics visible
    print("\n--- Test 2: export.csv ON -> Analytics section visible ---")
    analytics = page.locator("nav >> text=Analytics")
    check("Analytics section visible", analytics.is_visible())

    # Test 3: sync.enabled ON -> Sync Center visible
    print("\n--- Test 3: sync.enabled ON -> Sync Center visible ---")
    sync_center = page.locator("nav >> text=Sync Center")
    check("Sync Center visible", sync_center.is_visible())

    # Test 4: Toggle export.csv OFF -> Analytics hides
    print("\n--- Test 4: Toggle export.csv OFF -> Analytics hides ---")
    page.evaluate("window.__FEATURE_FLAGS__.setEnabled('export.csv', false)")
    page.wait_for_timeout(500)
    check("Analytics hidden after toggle", not analytics.is_visible())

    # Test 5: Toggle export.csv ON -> Analytics reappears
    print("\n--- Test 5: Toggle export.csv ON -> Analytics reappears ---")
    page.evaluate("window.__FEATURE_FLAGS__.setEnabled('export.csv', true)")
    page.wait_for_timeout(500)
    check("Analytics visible after re-enable", analytics.is_visible())

    # Test 6: Toggle sync.enabled OFF -> Sync Center hides
    print("\n--- Test 6: Toggle sync.enabled OFF -> Sync Center hides ---")
    page.evaluate("window.__FEATURE_FLAGS__.setEnabled('sync.enabled', false)")
    page.wait_for_timeout(500)
    check("Sync Center hidden after toggle", not sync_center.is_visible())

    # Restore defaults
    page.evaluate("window.__FEATURE_FLAGS__.setEnabled('sync.enabled', true)")

    # Test 7: App stability
    print("\n--- Test 7: App stability ---")
    logo = page.locator("text=CoopERP")
    check("App logo visible (no crash)", logo.is_visible())

    # Screenshot
    page.screenshot(path="D:/GitHub/testTempleteOfflineNewKit/test-results/feature-flags-verify.png", full_page=True)
    print("\n[Screenshot] test-results/feature-flags-verify.png")

    browser.close()

print(f"\n{'='*50}")
print(f"Results: {results['pass']} passed, {results['fail']} failed")
if results["fail"] > 0:
    print("FAIL: Some tests FAILED")
    sys.exit(1)
else:
    print("PASS: All feature flag tests passed")
