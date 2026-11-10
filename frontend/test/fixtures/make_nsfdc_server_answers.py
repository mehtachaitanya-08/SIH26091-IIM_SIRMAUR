import json, random
from fastapi.testclient import TestClient
from backend.app import app
c = TestClient(app)
random.seed(26091)
costs = [1, 9, 10, 11, 1000, 99999, 100000, 139999, 140000, 140001, 500000, 680000, 1234567, 4999999, 5000000, 5000001]
costs += [random.randint(1, 5_000_000) for _ in range(15)]
cases = [(x, 100000, True) for x in costs] + [(140000, 500001, True), (140000, 100000, False), (680000, 500000, True), (0, 100000, True),
         (5, 100000, True), (4851916, 100000, True), (6000000, 600000, False), (140000.5, 100000.75, True),
         (0, -5, True), (-50000, 100000, True), (10**9 + 1, 100000, True), (2 * 10**12, 100000, True), (140000, -1, True),
         (140000, 100000, None), (140000, 100000, "false")]
out = []
for cost, inc, sc in cases:
    body = {"projectCost": cost, "familyIncome": inc}
    if sc is not None:
        body["isSc"] = sc
    r = c.post("/api/engine/nsfdc/calculate", json=body)
    # the whole server reply except the error timestamp: the browser copy must match all of it
    d = {k: v for k, v in r.json().items() if k != "timestamp"}
    # snake_case twins hold the same values as their camelCase keys: keep only their names (test checks they match)
    twins = sorted(k for k in d if "_" in k and k != "_error")
    d = {k: v for k, v in d.items() if k not in twins}
    if "amortizationSchedule" in d:
        d["amortizationSchedule"] = [{k: v for k, v in row.items() if "_" not in k} for row in d["amortizationSchedule"]]
    out.append({"input": body, "httpStatus": r.status_code, "expected": d, "snakeTwins": twins})
json.dump({"_about": "Whole replies from the verified server (POST /api/engine/nsfdc/calculate), made by "
           "backend/app.py. The browser's offline loan maths (src/services/nsfdcLoan.js) must match them exactly.",
           "cases": out}, open("frontend/test/fixtures/nsfdc_server_answers.json", "w"), separators=(",", ":"), ensure_ascii=False)
print(len(out), [(e['input'], e['httpStatus'], e['expected'].get('error')) for e in out if e['httpStatus'] != 200])
