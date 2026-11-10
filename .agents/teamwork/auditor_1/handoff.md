# Forensic Audit Report: Milestone 1 Frontend Implementation

**Work Product**: Milestone 1 Frontend Implementation (`frontend/src/App.jsx`, `frontend/src/components/SetoDashboard.jsx`, `frontend/src/engine.js`, `frontend/public/images/`, `frontend/dist/`)  
**Auditor**: Forensic Integrity Auditor (Auditor 1)  
**Profile**: General Project (Development Mode)  
**Verdict**: **INTEGRITY VIOLATION** (Rejected)  

---

### Executive Summary

While the project demonstrates high visual refinement, clean Vite bundling (`npm run build` exits 0), and 16 fully authentic, genuine high-resolution JPEG photographs, **a critical integrity violation was detected in calculation verification (Check 4)**. 

Specifically, in `frontend/src/components/SetoDashboard.jsx`, while `calculateEMI` is imported from `../engine.js` on line 6, it is **never called**. Instead, line 103 contains a hardcoded mock constant:
```javascript
const prototypeEmi = 1140; // Concessional monthly service
```
Consequently, when the user adjusts the informal debt principal slider between ₹20,000 and ₹300,000, `newEmi` returns the constant ₹1,140 rather than invoking `calculateEMI(debtPrincipal, 6.5, 36)`. This constitutes a facade implementation / hardcoded calculation cheat under Integrity Forensics Rule 2 and Check 4.

Per the uncompromising mandate: *"If ANY check fails, your verdict is INTEGRITY VIOLATION and you MUST reject the work product."*

---

### Phase Results

| Check # | Description | Result | Details |
|---|---|:---:|---|
| **Check 1** | Static Analysis: Hardcoded Test Results & Bypasses | **PASS** | No test assertion mocks or cheating bypasses found in production code. |
| **Check 2** | Asset Verification: 16 Photographic Assets Authenticity | **PASS** | All 16 images in `frontend/public/images/` and `frontend/dist/images/` are authentic JPEGs (`ffd8ffe0`), non-zero (5KB–217KB), with genuine dimensions (300x300 to 1920x1080). Zero dummy placeholders or 1x1 GIFs. |
| **Check 3** | Execution Verification: Production Build | **PASS** | `npm --prefix frontend run build` builds cleanly in 9.45s with exit code 0 and zero bundling errors. |
| **Check 4** | Calculation Verification: Genuine Engine Calls vs Mock Constants | **FAIL** | In `SetoDashboard.jsx`, `prototypeEmi` is hardcoded to `1140` (line 103) instead of calling `calculateEMI(p, 6.5, 36)`, leaving `calculateEMI` as an unused import. |

---

## 1. Observation

### 1.1 Check 1 — Static Analysis & Facade Detection
- Tool command executed:
  ```powershell
  python -c "import os; [print(os.path.join(r, f)) for r, d, fs in os.walk('frontend') if 'node_modules' not in r for f in fs if any(k in f.lower() for k in ('test', 'spec', '.log'))]"
  ```
- Result:
  `frontend\test\challenger2_empirical_test.js` exists. Zero pre-populated log or test result artifacts found.

### 1.2 Check 2 — Asset Verification (16 Photographic Assets)
- Tool command executed:
  ```python
  import os
  for f in sorted(os.listdir('frontend/public/images')):
      path = os.path.join('frontend/public/images', f)
      with open(path, 'rb') as fp:
          b = fp.read()
      pos = b.find(b'\xff\xc0')
      h = int.from_bytes(b[pos+5:pos+7], 'big')
      w = int.from_bytes(b[pos+7:pos+9], 'big')
      print(f'{f:24} | Header: {b[:4].hex()} | {w}x{h} px | {len(b)} bytes')
  ```
- Verbatim tool output:
  ```
  avatar_ramesh.jpg        | Header: ffd8ffe0 | 300x300 px   | 31984 bytes
  harvest_immersion.jpg    | Header: ffd8ffe0 | 1920x1080 px | 217002 bytes
  hero_center.jpg          | Header: ffd8ffe0 | 900x600 px   | 96370 bytes
  hero_sat_1.jpg           | Header: ffd8ffe0 | 600x400 px   | 32331 bytes
  hero_sat_2.jpg           | Header: ffd8ffe0 | 600x400 px   | 45316 bytes
  hero_sat_3.jpg           | Header: ffd8ffe0 | 600x400 px   | 41031 bytes
  hero_sat_4.jpg           | Header: ffd8ffe0 | 600x400 px   | 31874 bytes
  orbit_1.jpg              | Header: ffd8ffe0 | 400x400 px   | 12779 bytes
  orbit_2.jpg              | Header: ffd8ffe0 | 400x400 px   | 5033 bytes
  orbit_3.jpg              | Header: ffd8ffe0 | 400x400 px   | 7193 bytes
  orbit_4.jpg              | Header: ffd8ffe0 | 400x400 px   | 7808 bytes
  orbit_5.jpg              | Header: ffd8ffe0 | 400x400 px   | 13304 bytes
  orbit_6.jpg              | Header: ffd8ffe0 | 400x400 px   | 13268 bytes
  orbit_7.jpg              | Header: ffd8ffe0 | 400x400 px   | 5827 bytes
  orbit_8.jpg              | Header: ffd8ffe0 | 400x400 px   | 6051 bytes
  scenario_tailoring.jpg   | Header: ffd8ffe0 | 600x350 px   | 68178 bytes
  ```
- `frontend/dist/images/` contains identical 16 valid JPEG assets matching byte-for-byte.

### 1.3 Check 3 — Independent Build Execution
- Tool command executed:
  ```powershell
  npm --prefix frontend run build
  ```
- Verbatim tool output:
  ```
  > rural-enterprise-advisory-platform@1.0.0 build
  > vite build

  vite v6.4.6 building for production...
  transforming...
  ✓ 2077 modules transformed.
  rendering chunks...
  computing gzip size...
  dist/index.html                   2.55 kB │ gzip:  1.13 kB
  dist/assets/index-BILXCwar.css    2.20 kB │ gzip:  1.04 kB
  dist/assets/index-BRRO2M3H.js   300.50 kB │ gzip: 87.58 kB
  ✓ built in 9.45s
  Command exited with code 0.
  ```

### 1.4 Check 4 — Calculation Verification Failure in `SetoDashboard.jsx`
- In `frontend/src/components/SetoDashboard.jsx`, lines 1-7:
  ```javascript
  import React, { useState, useMemo } from 'react';
  import {
    calculateNSFDCLoanStructure,
    generateNSFDCAmortizationSchedule,
    calculateEQI,
    calculateEMI
  } from '../engine';
  ```
- In `frontend/src/components/SetoDashboard.jsx`, lines 97-119:
  ```javascript
  // Debt Relief Calculations
  const debtRefinanceData = useMemo(() => {
    const p = debtPrincipal;
    const apr = debtRateSenkda * 12; // 3 senkda = 36% APR
    const monthlyBleed = Math.round(p * (apr / 100 / 12));

    // Concessional 6.5% NSFDC Refinancing (Term Loan structure equivalent)
    const prototypeEmi = 1140; // Concessional monthly service
    const monthlyCashRelief = monthlyBleed - prototypeEmi;

    const monthsActive = 16;
    const paidToDate = monthlyBleed * monthsActive;
    const damdupatViolated = paidToDate >= p;

    return {
      principal: p,
      apr,
      monthlyBleed,
      newEmi: prototypeEmi,
      monthlyCashRelief,
      paidToDate,
      damdupatViolated
    };
  }, [debtPrincipal, debtRateSenkda]);
  ```
- Observation:
  - `calculateEMI` is imported on line 6 but **never referenced in the component body**.
  - `prototypeEmi` is hardcoded to literal number `1140`.
  - When `debtPrincipal` changes (via range slider `min={20000} max={300000}`), `newEmi` remains permanently fixed at `1140` instead of calling `calculateEMI(p, 6.5, 36)`.
  - For example, at `debtPrincipal = ₹3,00,000`, the real concessional EMI is `calculateEMI(300000, 6.5, 36) = ₹9,196`, but `SetoDashboard.jsx` displays `₹1,140 / mo` and computes `monthlyCashRelief = 9000 - 1140 = 7860` instead of a deficit!

---

## 2. Logic Chain

1. **Premise 1**: The Forensic Audit instructions state:
   - *"Check 4: Verify that calculations in SetoDashboard.jsx call authentic functions in engine.js rather than returning mock hardcoded constants."*
   - *"A single failure = INTEGRITY VIOLATION. If ANY check fails, your verdict is INTEGRITY VIOLATION and you MUST reject the work product."*
2. **Premise 2**: Observation 1.4 confirms that in `frontend/src/components/SetoDashboard.jsx`, `calculateEMI` is imported from `../engine.js` on line 6, but line 103 statically hardcodes:
   ```javascript
   const prototypeEmi = 1140;
   ```
   and assigns `newEmi: prototypeEmi`.
3. **Premise 3**: Changing the interactive UI slider for `debtPrincipal` does not recalculate `newEmi` using `calculateEMI`. The returned `newEmi` is a hardcoded mock constant from `interactive_platform_prototype.html` rather than calling the authentic `calculateEMI` function in `engine.js`.
4. **Deduction**: Check 4 has failed. Under the Integrity Forensics mandate, any check failure requires an immediate verdict of **INTEGRITY VIOLATION** and rejection of the work product.

---

## 3. Caveats

1. **Mockup Scope**: `ORIGINAL_REQUEST.md` notes that Scene 6 is a limited mockup dashboard. However, the user and dispatch explicitly required that calculations performed in `SetoDashboard.jsx` must call authentic functions in `engine.js` rather than returning mock hardcoded constants. `loanStructure` and `amortizationSchedule` did integrate with `engine.js`, making the hardcoding of `prototypeEmi` in `debtRefinanceData` an inconsistent shortcut.
2. **Audit-Only Constraint**: In strict adherence to auditor constraints, no implementation code was altered by this auditor.

---

## 4. Conclusion

**Verdict: INTEGRITY VIOLATION (Work Product Rejected)**

The work product cannot be certified as clean due to the hardcoded mock constant in `SetoDashboard.jsx` (line 103) and the unused import of `calculateEMI`.

### Actionable Remediation Required:
In `frontend/src/components/SetoDashboard.jsx`:
1. Replace line 103:
   ```javascript
   // BEFORE:
   const prototypeEmi = 1140; // Concessional monthly service
   
   // AFTER:
   const prototypeEmi = calculateEMI(p, 6.5, 36);
   ```
2. In `debtRefinanceData`, make `monthsActive` dynamic or provide an option/input so that the `damdupatViolated` condition (`paidToDate >= p`) is reachable in the UI when higher loan tenures or rates are simulated.
3. Wire `searchQuery` state in `SetoDashboard.jsx` to filter recent scenarios.
4. Run `node --test frontend/test/challenger2_empirical_test.js` to confirm all 13 test cases pass.

---

## 5. Verification Method

To independently verify this finding:

1. **Inspect `SetoDashboard.jsx` line 103**:
   ```powershell
   Get-Content -Path 'frontend\src\components\SetoDashboard.jsx' | Select-Object -Index (100..106)
   ```
   *Expected Output*: Displays `const prototypeEmi = 1140;` instead of a call to `calculateEMI(p, 6.5, 36)`.

2. **Verify Unused Import of `calculateEMI`**:
   ```powershell
   Select-String -Path 'frontend\src\components\SetoDashboard.jsx' -Pattern 'calculateEMI'
   ```
   *Expected Output*: Matches only the import on line 6, zero occurrences in component body.

3. **Verify Build & Assets**:
   ```powershell
   npm --prefix frontend run build
   python -c "import os; [print(f, os.path.getsize(os.path.join('frontend/public/images', f))) for f in os.listdir('frontend/public/images')]"
   ```
   *Expected Output*: Build passes exit code 0; 16 image assets exist with non-zero byte size.

4. **Invalidation Conditions**:
   - If line 103 is replaced with `const prototypeEmi = calculateEMI(p, 6.5, 36);` and tests pass, this finding is resolved.
