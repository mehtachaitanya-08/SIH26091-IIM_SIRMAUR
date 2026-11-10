import os
import re

print("Starting Check 1: Static bypass and trivial return scan...")
suspicious = []
for root, dirs, files in os.walk('frontend/src'):
    for f in files:
        if f.endswith(('.js', '.jsx')):
            p = os.path.join(root, f)
            with open(p, 'r', encoding='utf-8') as fp:
                lines = fp.readlines()
            for i, line in enumerate(lines):
                stripped = line.strip()
                if re.match(r'^return\s+(true|false|null|0|1|""|\'\'|\{\}|\[\]);?$', stripped):
                    suspicious.append((p, i+1, stripped))

print(f"Total trivial returns found: {len(suspicious)}")
for s in suspicious:
    print(f"  {s[0]}:{s[1]} -> {s[2]}")
