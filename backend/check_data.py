"""
Check a business data file (data/businesses/Dxx.json) against its dossier, in BOTH directions.

Usage (from the repo root):
    python3 -I backend/check_data.py data/businesses/D20.json [more files...]
Prints each problem and "N problem(s)" per file; exit code 1 if any problem.

Forward (data -> dossier):
  F1  every item's line exists, and its text / cells are copied EXACTLY from that dossier line
  F2  every digit run on that line is accounted for, once: either a figure or a declared text number
  F3  every figure's as_written appears in its cell, and value = as_written read exactly
  F4  every figure's tag is traceable on the line: [S#] (+ page) written there, ESTIMATE for CALCULATED,
      an "our ..." phrase for ASSUMED; every [S#] is in the dossier's Source log.
      Where a table's source is written once above it (e.g. "[S13] p.12" in the sentence before the table),
      the figure names that line as tag_line; it must be earlier in the same section.
      A figure repeated from elsewhere (e.g. "88.8% working capital" in the SWOT, worked out in section 2)
      names that line as same_as; the same value must be there, with the same tag.
  F5  status (NOT FOUND / VENDOR QUOTE NEEDED) only where the line says so, with value null and the
      dossier's own words as the reason; unverified == line has the warning sign; the item's tag is on its line
  F6  rules: every "quote" is a real quotation (inside quote marks on its line), not our dossier's wording;
      a category must appear in the dossier text it comes from; chain steps fire on "yes" and follow the
      dossier's order; every outcome carries an unverified flag matching the warning sign on its line;
      every outcome, note and advice text has a Hindi slot
  F7  every source's saved copy exists under research_dossiers/sources/
Reverse (dossier -> data):
  R1  every non-blank line in sections 1-8 (except "## " headings and table separators) is covered by
      an item, a rule, or data/businesses/skip_list.json (with a reason)
  R2  every line with an IF ... THEN app rule is used by a rule, or is on the skip list (kind "rule") with a reason
  R3  every rupee, per-cent, lakh or crore number on a covered line is a served figure (not hidden as text)
"""

import json
import re
import sys
from decimal import Decimal, InvalidOperation
from pathlib import Path

REPO = Path(__file__).resolve().parents[1]
WARN = "⚠"
DIGITS = re.compile(r"\d[\d,]*(?:\.\d+)?")
SOURCE_TAG = re.compile(r"\[S(\d+)\]")
ASSUMED_PHRASES = ("our reading", "our judgement", "our design choice", "our assumption", "design choice")
CALC_MARKERS = ("ESTIMATE", "(SOP D4)")  # SOP D4 = the dossier's "Checks on the profile's arithmetic" tables
QUOTED = re.compile(r'"([^"]*)"|“([^”]*)”')
MONEY = re.compile(r"(?:₹\s?|Rs\.?\s?)(\d[\d,]*(?:\.\d+)?)|(\d[\d,]*(?:\.\d+)?)(?=\s?(?:%|lakh|Lakh|crore|Crore))")
TEXT_NUMBER_KINDS = {"page", "code", "date", "ref", "quote", "label", "tag", "formula"}
UNITS = {"INR", "INR lakh", "INR crore", "%", "days", "months", "years", "count", "hundred",
         "tonnes", "INR per tonne", "INR per day", "INR per month", "INR per tonne lakh", "index", "ratio",
         "kg", "hours", "km", "people", "items", "per month", "per year", "multiplier", "number", "HP", "kW",
         "TPD", "KLD", "lines", "workers", "times", "INR per metric tonne", "INR per sq ft", "per cent"}


def page_on(page, text):
    """Exact page reference: "p.2" must not match inside "p.27"."""
    return re.search(re.escape(page) + r"(?![\d])", text) is not None


def in_quotes(q, text):
    q = q.strip().strip('"“”').strip()
    return any(q and q in (a or b) for a, b in QUOTED.findall(text))


def money_tokens(text):
    text = SOURCE_TAG.sub("[S]", text)
    return [(a or b).rstrip(",") for a, b in MONEY.findall(text)]


def row_cells(line: str):
    """Cells of a markdown table row, exactly as written (outer pipes removed, spaces trimmed)."""
    return [c.strip() for c in line.strip().strip("|").split("|")]


def read_value(as_written: str) -> Decimal:
    """The number as written: strip the rupee sign, words and commas; nothing else changes."""
    m = DIGITS.search(as_written)
    if not m:
        raise ValueError(f"no number in {as_written!r}")
    return Decimal(m.group(0).replace(",", ""))


def digit_runs(text: str):
    """Every digit run on a line, except the numbers inside source tags like [S5]."""
    text = SOURCE_TAG.sub("[S]", text)
    return [m.group(0).rstrip(",") for m in DIGITS.finditer(text)]


def section_bounds(lines):
    start = next(i for i, l in enumerate(lines) if l.startswith("## 1."))
    end = next(i for i, l in enumerate(lines) if l.startswith("## Source log"))
    return start, end  # 0-based, [start, end)


def source_log_tags(lines):
    start, _ = section_bounds(lines)
    log = next(i for i, l in enumerate(lines) if l.startswith("## Source log"))
    tags = {}
    for i in range(log, len(lines)):
        if lines[i].startswith("| S"):
            cells = row_cells(lines[i])
            tags[f"[{cells[0]}]"] = {"line": i + 1, "saved": cells[-1]}
        if lines[i].startswith("## Quality gates"):
            break
    return tags


def check(path: Path) -> int:
    problems = []
    p = problems.append
    data = json.loads(path.read_text(encoding="utf-8"))
    dossier = REPO / data["dossier"]
    lines = dossier.read_text(encoding="utf-8").split("\n")
    log = source_log_tags(lines)

    def line_text(n):
        if not isinstance(n, int) or not (1 <= n <= len(lines)):
            p(f"line {n!r} is outside the dossier")
            return None
        return lines[n - 1]

    covered = set()
    figures_at = {}
    for sec in data["sections"]:
        for it in sec["items"]:
            for f in it.get("figures", []):
                figures_at.setdefault(it.get("line"), []).append(f)
    section_of = {}
    current = None
    for i, l in enumerate(lines, 1):
        if l.startswith("## "):
            current = l
        section_of[i] = current

    def context(n, tag_line):
        """The line's text, plus the named earlier line in the same section that carries the tag."""
        t = lines[n - 1]
        if tag_line is None:
            return t
        if not isinstance(tag_line, int) or not (1 <= tag_line <= n) or section_of.get(tag_line) != section_of.get(n):
            p(f"line {n}: tag_line {tag_line!r} is not an earlier line in the same section")
            return t
        return t + "\n" + lines[tag_line - 1]

    # ---- F1-F5: items
    for sec in data["sections"]:
        for it in sec["items"]:
            n = it.get("line")
            where = f"{sec['id']} line {n}"
            text = line_text(n)
            if text is None:
                continue
            covered.add(n)
            if "cells" in it:
                if not text.lstrip().startswith("|"):
                    p(f"{where}: item has cells but the line is not a table row")
                    continue
                if it["cells"] != row_cells(text):
                    p(f"{where}: cells are not an exact copy of the dossier row")
            elif "text" in it:
                if it["text"] != text.strip():
                    p(f"{where}: text is not an exact copy of the dossier line")
            else:
                p(f"{where}: item has neither cells nor text")
                continue

            # F2: every digit run accounted for exactly once
            want = sorted(digit_runs(text))
            got = []
            for f in it.get("figures", []):
                got += digit_runs(f.get("as_written", ""))
            for t in it.get("text_numbers", []):
                if t.get("kind") not in TEXT_NUMBER_KINDS:
                    p(f"{where}: text number {t!r} has an unknown kind")
                got.append(t.get("token"))
            if sorted(got) != want:
                missing = list(want)
                for g in got:
                    if g in missing:
                        missing.remove(g)
                extra = list(got)
                for w in want:
                    if w in extra:
                        extra.remove(w)
                p(f"{where}: digits not accounted for exactly: missing {missing}, extra {extra}")

            # F3/F4: figures
            cursor = {}
            for f in it.get("figures", []):
                aw = f.get("as_written", "")
                ctx = context(n, f.get("tag_line"))
                scope = text
                if "cells" in it and f.get("cell") is not None:
                    try:
                        scope = it["cells"][f["cell"]]
                    except (IndexError, TypeError):
                        p(f"{where}: figure {aw!r} points to cell {f.get('cell')!r}, which does not exist")
                if aw not in scope:
                    p(f"{where}: figure {aw!r} is not written there")
                try:
                    if Decimal(str(f.get("value"))) != read_value(aw):
                        p(f"{where}: figure {aw!r} has value {f.get('value')!r}, which is not what is written")
                except (InvalidOperation, ValueError) as exc:
                    p(f"{where}: figure {aw!r}: {exc}")
                unit = f.get("unit")
                if unit not in UNITS:
                    p(f"{where}: figure {aw!r} has unknown unit {unit!r}")
                key = f.get("cell")
                pos = scope.find(aw, cursor.get(key, 0))
                if pos < 0:
                    pos = scope.find(aw)
                else:
                    cursor[key] = pos + len(aw)
                follow = scope[pos + len(aw):pos + len(aw) + 8] if pos >= 0 else ""
                if aw.endswith("%") != (unit == "%"):
                    p(f"{where}: figure {aw!r} has unit {unit!r}, which does not match the per-cent sign")
                if re.match(r"\s?(lakh|Lakh)", follow) and unit not in ("INR lakh", "INR per tonne lakh"):
                    p(f"{where}: figure {aw!r} is written in lakh but has unit {unit!r}")
                if re.match(r"\s?(crore|Crore)", follow) and unit != "INR crore":
                    p(f"{where}: figure {aw!r} is written in crore but has unit {unit!r}")
                if unit == "INR" and re.match(r"\s?(lakh|Lakh|crore|km|days|%|t\b|tonnes|HP|kW)", follow):
                    p(f"{where}: figure {aw!r} has unit INR but is followed by {follow.strip()[:6]!r}")
                tag = f.get("tag", "")
                if f.get("same_as") is not None:
                    try:
                        mine = read_value(aw)
                    except ValueError:
                        mine = None
                    twins = [g for g in figures_at.get(f["same_as"], [])
                             if g.get("same_as") is None and g.get("tag") == tag and read_value(g["as_written"]) == mine
                             and g.get("unit") == f.get("unit")]
                    if not twins:
                        p(f"{where}: figure {aw!r} says same_as line {f['same_as']}, but no figure there has "
                          f"that value with tag {tag!r}")
                    continue
                if SOURCE_TAG.fullmatch(tag or ""):
                    if tag not in ctx:
                        p(f"{where}: figure {aw!r} tagged {tag} but {tag} is not written on the line")
                    if tag not in log:
                        p(f"{where}: {tag} is not in the dossier's Source log")
                    page = f.get("page")
                    if page and not page_on(page, ctx):
                        p(f"{where}: figure {aw!r} page {page!r} is not written on the line")
                elif tag == "CALCULATED":
                    if not any(mk in ctx for mk in CALC_MARKERS):
                        p(f"{where}: figure {aw!r} is CALCULATED but the line has no ESTIMATE")
                    if f.get("basis") and f["basis"] not in ctx:
                        p(f"{where}: figure {aw!r} basis {f['basis']!r} is not on the line")
                elif tag == "ASSUMED":
                    words = f.get("basis") or ""
                    if not words or not any(ph in ctx for ph in ASSUMED_PHRASES) or words not in ctx:
                        p(f"{where}: figure {aw!r} is ASSUMED but the line has no 'our reading/judgement/"
                          f"design choice/assumption' wording matching {words!r}")
                else:
                    p(f"{where}: figure {aw!r} has tag {tag!r}, not one of [S#] / CALCULATED / ASSUMED")

            # F5: status and warning flag
            st = it.get("status")
            if st is not None:
                if st not in ("NOT FOUND", "VENDOR QUOTE NEEDED"):
                    p(f"{where}: unknown status {st!r}")
                elif st not in text:
                    p(f"{where}: status {st!r} is not written on the line")
                if "value" not in it or it["value"] is not None:
                    p(f"{where}: a gap must carry value null")
                if not it.get("reason") or it["reason"] not in text or st not in it["reason"]:
                    p(f"{where}: a gap must give the dossier's own words (containing {st!r}) as its reason")
            elif ("NOT FOUND" in text or "VENDOR QUOTE NEEDED" in text) and not it.get("figures"):
                p(f"{where}: the line says NOT FOUND / VENDOR QUOTE NEEDED but the item has no status")
            itag = it.get("tag")
            linked = {f.get("tag") for f in it.get("figures", []) if f.get("same_as") is not None}
            if itag and itag not in linked:
                ctxs = text + "".join("\n" + lines[f["tag_line"] - 1] for f in it.get("figures", [])
                                       if isinstance(f.get("tag_line"), int) and 1 <= f["tag_line"] <= len(lines))
                if SOURCE_TAG.fullmatch(itag):
                    if itag not in ctxs:
                        p(f"{where}: item tag {itag} is not written on the line")
                elif itag.startswith("ASSUMED"):
                    words = itag.split(":", 1)[1].strip() if ":" in itag else ""
                    if not words or words not in ctxs:
                        p(f"{where}: item tag {itag!r} does not match the line's wording")
                elif itag == "CALCULATED":
                    if not any(mk in ctxs for mk in CALC_MARKERS):
                        p(f"{where}: item tag CALCULATED but the line has no ESTIMATE")
                else:
                    p(f"{where}: unknown item tag {itag!r}")
            served = []
            for f in it.get("figures", []):
                served += digit_runs(f.get("as_written", ""))
            for tok in money_tokens(text):
                if tok in served:
                    served.remove(tok)
                else:
                    p(f"{where}: money / per-cent number {tok!r} is not served as a figure")
            if bool(it.get("unverified")) != (WARN in text):
                p(f"{where}: unverified flag does not match the warning sign on the line")
            for tag in SOURCE_TAG.findall(text):
                if f"[S{tag}]" not in log:
                    p(f"{where}: [S{tag}] is not in the dossier's Source log")

    # ---- F6: questions and rules
    for q in data.get("questions", []):
        if q.get("line") is not None:
            t = line_text(q["line"])
            if t is not None and q.get("quote") and q["quote"] not in t:
                p(f"question {q['id']}: quote not on line {q['line']}")
    rule_lines = set()

    def check_ref(rid, ref, outcome=False):
        """A piece of rule text that claims to come from the dossier: its words, tag and page must be on its line."""
        n = ref.get("line")
        tag = ref.get("tag", "") or ""
        if outcome or ref.get("text") is not None:
            if "hi" not in ref:
                p(f"rule {rid}: text {str(ref.get('text', ''))[:40]!r} has no Hindi slot ('hi')")
        if outcome and n is not None:
            rule_lines.add(n)
        if n is None:
            # Only our own advice may have no dossier line, and it must say so.
            if not tag.startswith("ASSUMED"):
                p(f"rule {rid}: text {ref.get('text', '')[:40]!r} has no dossier line and is not tagged ASSUMED")
            return
        t = line_text(n)
        if t is None:
            return
        covered.add(n)
        full = context(n, ref.get("tag_line"))
        for key in ("quote", "dossier_text"):
            if ref.get(key) and ref[key] not in t:
                p(f"rule {rid} line {n}: {key} {ref[key][:50]!r} not found on the line")
        if ref.get("quote") and not in_quotes(ref["quote"], t):
            p(f"rule {rid} line {n}: 'quote' {ref['quote'][:50]!r} is not inside quote marks on the line "
              f"(our own wording must go in dossier_text, not be shown as a source quote)")
        if ref.get("category") and ref["category"] not in (ref.get("dossier_text") or ""):
            p(f"rule {rid} line {n}: category {ref['category']!r} is not in the dossier text it comes from")
        if SOURCE_TAG.fullmatch(tag) and tag not in full:
            p(f"rule {rid} line {n}: {tag} not on the line")
        if tag.startswith("ASSUMED") and not any(ph in full for ph in ASSUMED_PHRASES) and ref.get("dossier_text"):
            p(f"rule {rid} line {n}: tagged ASSUMED but the line has no 'our ...' wording")
        if ref.get("page") and not page_on(ref["page"], full):
            p(f"rule {rid} line {n}: page {ref['page']!r} not on the line")
        if outcome and "unverified" not in ref:
            p(f"rule {rid} line {n}: outcome has no unverified flag")
        if "unverified" in ref and bool(ref["unverified"]) != (WARN in t):
            p(f"rule {rid} line {n}: unverified flag does not match the warning sign on the line")

    question_ids = {q["id"] for q in data.get("questions", [])}
    for r in data.get("rules", []):
        outcomes = list(r.get("steps", []))
        if r.get("otherwise"):
            outcomes.append(r["otherwise"])
        outcomes += list((r.get("cases") or {}).values())
        if r.get("outcome"):
            outcomes.append(r["outcome"])
        for q in [s.get("question") for s in r.get("steps", [])] + [r.get("question")]:
            if q and q not in question_ids:
                p(f"rule {r['id']}: question {q!r} is not defined")
        for o in outcomes:
            check_ref(r["id"], o, outcome=True)
            for key in ("evidence", "notes", "advice"):
                for ref in o.get(key, []):
                    check_ref(r["id"], ref)
        for extra in r.get("lines", []):
            if line_text(extra) is not None:
                covered.add(extra)
                rule_lines.add(extra)
        if r.get("kind") == "chain":
            qline = {q["id"]: q for q in data.get("questions", [])}
            order = []
            for st in r.get("steps", []):
                if st.get("when") != "yes":
                    p(f"rule {r['id']}: chain step {st.get('question')!r} must fire on 'yes' (dossier: IF ... THEN)")
                q = qline.get(st.get("question"))
                if q and q.get("line") is not None:
                    if q["line"] != st.get("line") and q.get("quote", "") not in (lines[st["line"] - 1] if st.get("line") else ""):
                        p(f"rule {r['id']}: step for {q['id']!r} is not on the line its question comes from")
                    pos = lines[q["line"] - 1].find(q.get("quote", ""))
                    order.append((q["line"], pos))
            if order != sorted(order):
                p(f"rule {r['id']}: chain steps are not in the dossier's order")

    # ---- F7: sources
    for s in data.get("sources", []):
        if s["tag"] not in log:
            p(f"source {s['tag']} not in the dossier's Source log")
            continue
        saved = s.get("saved", "")
        if saved != log[s["tag"]]["saved"]:
            p(f"source {s['tag']}: saved copy {saved!r} differs from the Source log")
        rel = saved.split("OCR text:")[-1].strip()
        if not (REPO / "research_dossiers" / "sources" / rel).exists():
            p(f"source {s['tag']}: saved copy {rel!r} does not exist")

    # ---- R1: reverse coverage
    skips = json.loads((path.parent / "skip_list.json").read_text(encoding="utf-8"))
    for s in skips.get(data["code"], []):
        if not s.get("reason"):
            p(f"skip list line {s.get('line')}: no reason given")
        t = line_text(s.get("line"))
        if t is not None:
            if s.get("text") is not None and s["text"] != t.strip():
                p(f"skip list line {s['line']}: text is not an exact copy of the dossier line")
            if s.get("kind") == "rule":
                rule_lines.add(s["line"])
            else:
                covered.add(s["line"])
    start, end = section_bounds(lines)
    for i in range(start, end):
        t = lines[i]
        if t.startswith("|---") or t.startswith("## ") or not t.strip() or t.strip() == "---":
            continue
        if (i + 1) not in covered:
            p(f"dossier line {i + 1} is not in the data and not on the skip list: {t.strip()[:80]!r}")
        if re.search(r"\bIF\b.*\bTHEN\b", t) and (i + 1) not in rule_lines:
            p(f"dossier line {i + 1} has an IF ... THEN app rule but no rule uses it: {t.strip()[:80]!r}")

    for msg in problems:
        print(f"PROBLEM {data.get('code', path.name)}: {msg}")
    print(f"{path}: {len(problems)} problem(s)")
    return len(problems)


def main(argv):
    total = sum(check(Path(a)) for a in argv)
    return 1 if total else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
