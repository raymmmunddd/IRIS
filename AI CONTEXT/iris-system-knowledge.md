# IRIS System – Project Knowledge

## 1. Core Role System
The system has 3 roles:

- Residents → submit incident reports
- Admin (Barangay Officials, including Lupon Tagapamayapa) → manage cases, assign officers, handle decisions
- BPAT Officers → field response, documentation, coordination (NO mediation role)
- Lupon Tagapamayapa → mediation and dispute resolution (Katarungang Pambarangay)

---

## 2. Incident Submission (Resident)
Residents submit complaints with:
- Complaint type (dispute, injury, VAWC, ordinance violation, etc.)
- Parties involved (complainant + respondent)
- Evidence (optional: images, descriptions)

### System Validation (Jurisdiction Check)
Automatically flag as **FOR REFERRAL (outside barangay scope)** if:
- Crime exceeds 1 year imprisonment or ₱1,000,000 fine
- Cybercrime or non-barangay defamation cases
- Court-required cases (e.g., BP Blg. 22 / BP22)
- Outside barangay territorial jurisdiction
- Cases requiring higher authority (e.g., human rights violations)

➡ These cases cannot proceed in barangay mediation workflow.

---

## 3. Case Review (Admin)
Admin reviews all submissions.

Actions:
- ACCEPT → valid barangay case
- REJECT → invalid or insufficient data
- REFER → outside jurisdiction

If accepted:
- Case becomes officially recorded (blotter entry created)

---

## 4. BPAT Assignment
Admin assigns BPAT Officers for:
- Verification
- Field assistance
- Documentation

NOTE:
- BPAT does NOT mediate cases
- BPAT only supports enforcement and coordination

---

## 5. Mediation Scheduling (Lupon Process)
Admin schedules hearing under Lupon Tagapamayapa.

Rules:
- First hearing must be within 5 days (excluding weekends)
- Respondent must be notified within 2 days

---

## 6. Attendance Rules
- Complainant absent twice → case dismissed
- Respondent absent → loses counterclaim rights
- Both present → mediation proceeds

---

## 7. Mediation (Lupon Tagapamayapa)
- Lupon conducts mediation
- If unresolved → proceed to second hearing

---

## 8. Conciliation Stage
If mediation fails:
- Case enters conciliation phase
- 15-day resolution period starts

Extension:
- Barangay Captain may extend timeline if necessary

---

## 9. Time Limit Rule
- Maximum case duration: 60 days total
- Case must end as:
  - RESOLVED, or
  - UNRESOLVED (for court escalation)

---

## 10. Settlement (Kasunduan)
If resolved:
- Settlement agreement is created (Kasunduan)
- Both parties sign agreement
- Supporting proof may be attached

---

## 11. Post-Resolution Monitoring
- 10-day compliance tracking period

If violated:
- Case can be reopened (Repudiation)

If no violation:
- Case becomes permanently closed

---

## 12. Case Closure (Admin)
Final status options:
- RESOLVED
- UNRESOLVED (court referral)
- DISMISSED

---

## SYSTEM FLOW
Resident → Admin → BPAT → Lupon Mediation → Conciliation → Resolution → Monitoring → Closure