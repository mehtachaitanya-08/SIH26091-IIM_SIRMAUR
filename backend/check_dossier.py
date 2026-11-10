"""Check a dossier: quotes exist in saved sources, sums are right, figures are tagged.
Usage: python -I check_dossier.py research_dossiers/D16_Motor_Rewinding_Dossier.md
"""
import sys, re, os, html
sys.stdout.reconfigure(encoding="utf-8")
path = sys.argv[1]
root = os.path.join(os.path.dirname(path), "sources")
text = open(path, encoding="utf8").read()
problems = 0

def norm(s):
    s = s.replace("’", "'").replace("‘", "'").replace("“", '"').replace("”", '"').replace("―", '"').replace("‖", '"')
    return re.sub(r"\s+", "", s).lower()

cache = {}
def source_text(rel):
    if rel in cache: return cache[rel]
    full = os.path.join(root, rel)
    if not os.path.exists(full): cache[rel] = None; return None
    if full.lower().endswith(".pdf"):
        import pymupdf
        t = "".join(p.get_text() for p in pymupdf.open(full))
    else:
        t = open(full, encoding="utf8", errors="ignore").read()
        t = re.sub(r"(?s)<(script|style).*?</\1>", "", t)
        t = html.unescape(re.sub(r"<[^>]+>", " ", t))
    cache[rel] = norm(t); return cache[rel]

# 1. Quote check (Source log rows)
log = text.split("## Source log", 1)[1].split("## Quality gates", 1)[0]
for row in log.splitlines():
    if not row.startswith("| S"): continue
    cells = [c.strip() for c in row.strip("|").split("|")]
    tag, saved, quotes = cells[0], cells[-1], cells[4]
    if 'OCR text:' in saved: saved = saved.split('OCR text:')[1].strip()
    src = source_text(saved)
    if src is None:
        print(f"PROBLEM {tag}: saved copy not found: {saved}"); problems += 1; continue
    for q in re.findall(r"“([^”]+)”|\"([^\"]+)\"", quotes):
        q = q[0] or q[1]
        for part in q.split("…"):
            part = part.strip(" .;,")
            if len(part) < 4: continue
            if norm(part) not in src:
                print(f"PROBLEM {tag}: quote not in {saved}: {part!r}"); problems += 1

# 2. Sums (dossier-specific): (description, computed, stated)
SUMS = {
 "D16": [
  ("fin 0.85+5.23+2.44", 0.85+5.23+2.44, 8.52),
  ("CoP", 9.90+0.43+0+3.43+0.59+0.40, 14.75),
  ("GP", 20.01-12.97, 7.04),
  ("NP", 7.04-2.68, 4.36),
  ("D+E", 0.45+0.24+1.58+0.40, 2.67),
  ("TL repaid", 1.31*3+1.75, 5.68),
  ("cash opex", 14.75-0.59+1.58+0.40, 16.14),
  ("opex/12", (14.75-0.59+1.58+0.40)/12, 1.345),
  ("stock days", 2.27/14.75*365, 56.2),
  ("debtor days", 0.67/20.01*365, 12.2),
  ("cycle", 56.2+12.2, 68.4),
  ("WC", 68.4/30*1.345, 3.07),
  ("RM share %", 9.90/20.01*100, 49.5),
  ("GP %", 7.04/20.01*100, 35.2),
  ("NP %", 4.36/20.01*100, 21.8),
  ("loan 90% of 8.52", min(0.9*8.52, 45), 7.668),
  ("own 8.52", 8.52-7.668, 0.852),
  ("micro loan", min(0.9*140000, 125000), 125000),
  ("micro own", 140000-125000, 15000),
  ("basis A", 5.31+2.27+0.67+2.50, 10.75),
  ("gap A-B", 10.75-8.52, 2.23),
  ("loan A", min(0.9*10.75, 45), 9.675),
  ("own A", 10.75-9.675, 1.075),
  ("stock days v2", 1.78/14.75*365, 44.0),
  ("cycle v2", 44.0+12.2, 56.2),
  ("WC v2", 56.2/30*1.345, 2.52),
 ],
 "D15": [
  ("micro loan", min(0.9*140000, 125000), 125000),
  ("micro own", 140000-125000, 15000),
  ("guide subtotal", 25000+20000, 45000),
  ("room", 140000-45000, 95000),
 ],
 "D19": [
  ("machines", sum([285500,44000,29500,100000,80000,9500,20000,5500,45000,1000,2000,1500,1500,2500,1000,9500]), 638000),
  ("project", 6.38+1.50+5.78, 13.66), ("means", 1.37+5.20+7.09, 13.66),
  ("CoP", 50.40+1.01+1.57+15.12+1.11, 69.21),
  ("micro kit", 44000+29500+9500+9500+2000+1500+1500+5500, 103000), ("room", 140000-103000, 37000),
  ("micro loan", min(0.9*140000,125000),125000), ("micro own",140000-125000,15000),
  ("TL loan", min(0.9*13.66,45), 12.294), ("TL own", 13.66-12.294, 1.366),
  ("kW", 15*0.746, 11.19), ("cash opex", 69.20-1.11+5.67+2.35, 76.11), ("pm", 76.11/12, 6.343),
  ("stock sum", 2.70+1.68, 4.38), ("debtors", 3.92/78.30*365, 18.3),
  ("gross", 10+10+15, 35), ("net", 35-15, 20), ("wc gross", 35/30*6.343, 7.40), ("wc net", 20/30*6.343, 4.23),
  ("paid stock", 4.38-2.52, 1.86), ("prof wc", 1.86+3.92, 5.78), ("wc fund", 5.20+0.58, 5.78),
  ("kit loan", 0.9*103000, 92700), ("kit own", 103000-92700, 10300),
  ("creditor days", 2.52/50.40*365, 18.2), ("rm%", 50.40/78.30*100, 64.4),
  ("wc share", 5.78/13.66*100, 42.3), ("cap/worker", (6.38+1.50)/12, 0.66),
  ("UP", 3481/4122, 0.84), ("BR", 3670/4122, 0.89), ("MP", 3441/4122, 0.83), ("RJ", 4510/4122, 1.09), ("MH", 4145/4122, 1.01),
 ],
 "D20": [
  ("machines", 40000+36000+20000+40000+20000+75000+25000+15000+10000+50000+10000+10000, 351000),
  ("project", 3.51+0.80+0.30+0.30+38.93, 43.84), ("own", 0.88+0.20+0.08+0.30+9.73, 11.19), ("loan", 2.63+0.60+0.23+29.20, 32.66),
  ("salary", 4*7000+4*5000+15000+7000, 70000), ("annual", 70000*12, 840000),
  ("turnover", 202.50*65000+64.80*150000+2.70*1200000, 26122500), ("wc2m", 233.58/6, 38.93), ("profit", 266.63-238.08, 28.55),
  ("staff", 4+4+1+1, 10), ("sourced", 25000+20000+10000, 55000), ("room", 140000-55000, 85000), ("src loan", 0.9*55000, 49500),
  ("micro loan", min(0.9*140000,125000),125000), ("TL loan", min(0.9*43.84,45), 39.456), ("TL own", 43.84-39.456, 4.384),
  ("cap room", 45-39.456, 5.544), ("wc share", 38.93/43.84*100, 88.8), ("opex pm", 233.58/12, 19.465),
  ("rm per t", 21775000/(202.50+64.80+2.70), 80648), ("tonnes", 202.50+64.80+2.70, 270), ("wc formula", 60/30*19.465, 38.93),
  ("UP", 3481/4122, 0.84), ("MP", 3441/4122, 0.83), ("RJ", 4510/4122, 1.09),
  ("wastage", 26122500+540000, 26662500), ("own pct", 11.19/43.84*100, 25.5),
 ],
 "D21": [
  ("PP CoP", 6.05+0.50+0.13+0.51+0.09, 7.28), ("PP GP", 9.24-6.68, 2.56), ("PP NP", 2.56-1.36, 1.20), ("PP uses", 1.00+1.11+0.69+0.60, 3.40),
  ("CP CoP", 12.15+0.29+0.95+3.48+0.21+0.25, 17.33), ("CP GP", 21.38-16.46, 4.92),
  ("CP src", 0.76+1.16+0.95+1.00+5.85+0.41+1.00, 11.13), ("CP app", 6.50+1.27+0.14+0.65+0.50+0.50, 9.56),
  ("micro wc", 140000-100000, 40000), ("micro loan", min(0.9*140000,125000),125000), ("micro own",140000-125000,15000),
  ("PP A", 1.00+1.11+0.69, 2.80), ("PP loanA", 0.9*2.80, 2.52), ("PP ownA", 2.80-2.52, 0.28), ("PP loanB", 0.9*2.50, 2.25), ("PP ownB", 2.50-2.25, 0.25),
  ("CP A", 6.50+1.27+0.14+0.50, 8.41), ("CP B", 0.76+5.85+1.00, 7.61), ("CP loanA", 0.9*8.41, 7.569), ("CP ownA", 8.41-7.569, 0.841),
  ("CP loanB", 0.9*7.61, 6.849), ("CP ownB", 7.61-6.849, 0.761), ("CP own%", 0.76/7.61*100, 10.0),
  ("PP opex", 7.29-0.13+1.08+0.28, 8.52), ("PP pm", 8.52/12, 0.71), ("CP opex", 17.33-0.95+1.44+1.20+0.43, 19.45), ("CP pm", 19.45/12, 1.621),
  ("PP stock", 1.11/7.29*365, 55.6), ("PP deb", 0.69/9.24*365, 27.3), ("PP cred", 0.30/6.05*365, 18.1), ("PP net", 55.6+27.3-18.1, 64.8),
  ("CP stock", 1.27/17.33*365, 26.7), ("CP deb", 0.14/21.38*365, 2.4), ("CP cred", 0.41/12.15*365, 12.3), ("CP net", 26.7+2.4-12.3, 16.8),
  ("PP wc net", 64.8/30*0.71, 1.53), ("PP wc gross", 82.9/30*0.71, 1.96), ("PP prof", 1.11+0.69-0.30, 1.50),
  ("CP wc net", 16.8/30*1.621, 0.91), ("CP wc gross", 29.1/30*1.621, 1.57),
  ("PP rm%", 6.05/9.24*100, 65.5), ("CP rm%", 12.15/21.38*100, 56.8), ("PP gm", 2.56/9.24*100, 27.7), ("CP gm", 4.91/21.38*100, 22.97), ("PP np", 1.20/9.24*100, 13.0),
  ("PP wc%", (1.11+0.69)/2.80*100, 64.3), ("CP wc%", (1.27+0.14)/8.41*100, 16.8),
  ("micro pm", 0.40/(64.8/30), 0.185), ("micro share", 0.185/0.71*100, 26), ("micro sales", 9.24*0.26, 2.40),
  ("owner pm", 1.20/12*100000, 10000), ("cap3", 6.50/3, 2.17), ("cap2", 6.50/2, 3.25),
 ],
 "D22": [
  ("CoP", 69.58+5.94+0.29+13.86+1.10, 90.77), ("GP", 110.16-83.81, 26.35), ("D", 10.80+3.30+2.34+3.00+4.13, 23.57), ("NP", 26.35-23.57, 2.78),
  ("build", 9.80+21.50+0.30+0.20, 31.80), ("wcint", 3.00/5.00*100, 60), ("cap", 9.80+2.78-1.00, 11.58), ("capPAT", 9.80+2.22-1.00, 11.02),
  ("assets", 26.35+7.34+6.96+1.42+0.55, 42.62), ("wc", 6.96+7.34-5.50, 8.80), ("A", 30.48+8.80, 39.28), ("B", 9.80+21.50+5.00, 36.30),
  ("loanA", min(0.9*39.28,45), 35.352), ("ownA", 39.28-35.352, 3.928), ("loanB", 0.9*36.30, 32.67), ("ownB", 36.30-32.67, 3.63),
  ("own%", 9.80/31.30*100, 31.3), ("tl%", 2.34/21.50*100, 10.9), ("opex", 90.77+10.80+3.30, 104.87), ("pm", 104.87/12, 8.739),
  ("inv d", 6.96/90.77*365, 28.0), ("deb d", 7.34/110.16*365, 24.3), ("cred d", 5.50/69.58*365, 28.9), ("net", 28.0+24.3-28.9, 23.4),
  ("wc net", 23.4/30*8.739, 6.82), ("wc gross", 52.3/30*8.739, 15.23), ("rm%", 69.58/110.16*100, 63.2),
  ("int8", 5.00*0.08, 0.40), ("gain", 3.00-0.40, 2.60), ("wc%", 8.80/39.28*100, 22.4), ("capw10", 30.48/10, 3.05),
  ("micro loan", min(0.9*140000,125000),125000), ("micro own",140000-125000,15000),
 ],
 "D17": [
  ("micro loan", min(0.9*140000,125000),125000), ("micro own",140000-125000,15000),
  ("UP", 3481/4122, 0.84), ("MP", 3441/4122, 0.83), ("RJ", 4510/4122, 1.09),
 ],
}
code = os.path.basename(path)[:3]
for name, got, stated in SUMS.get(code, []):
    if abs(got - stated) > 0.006 * max(1, abs(stated)) and abs(got-stated) > 0.006:
        print(f"PROBLEM sum {name}: computed {got:.4f}, dossier says {stated}"); problems += 1

# 3. Untagged figures (G1)
body = text.split("## Source log", 1)[0]
ok = re.compile(r"\[S\d+|ESTIMATE|NOT FOUND|VENDOR QUOTE|our design choice|our judgement|our reading|⚠|framework|D18|\(S\d+\)")
for i, line in enumerate(body.splitlines(), 1):
    if re.search(r"₹\s?[\d,.]+|\d+(\.\d+)?%", line) and not ok.search(line):
        print(f"PROBLEM untagged line {i}: {line[:110]}"); problems += 1

print(f"{problems} problem(s)")
