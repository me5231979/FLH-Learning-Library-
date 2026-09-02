#!/usr/bin/env python3
"""Publish gate for the self-paced editions: no classroom assumptions.
Fails if a self-paced page carries hidden classroom blocks or instruction-shaped
classroom language. Run: python3 tools/check-self-paced.py"""
import re, glob, sys, os
os.chdir(os.path.join(os.path.dirname(__file__), '..'))
PAGES = [f for f in glob.glob('courses/*/web/index.html') + glob.glob('*/web/index.html')
         + glob.glob('learn/[a-z]*/index.html') + ['learn/index.html']
         if '-class' not in f and 'facilitator' not in f and 'managers' not in f and 'classroom' not in f]
PHRASES = re.compile(r"\b(pair with a neighbor|your neighbor|turn to a neighbor|share with a neighbor|your instructor|the instructor will|show of hands|hands up|delivered to the group|around the room, everyone|everyone speaks once)\b", re.I)
bad = 0
for f in sorted(PAGES):
    t = open(f, encoding='utf-8').read()
    body = re.sub(r'<script.*?</script>|<style.*?</style>|<!--.*?-->', '', t, flags=re.S)
    txt = re.sub(r'<[^>]+>', ' ', body)
    hits = [m.group(0) for m in PHRASES.finditer(txt)]
    if 'mode-class' in body:
        hits.append('hidden mode-class block')
    if hits:
        bad += 1
        print(f'{f}: {sorted(set(hits))}')
print(f'{len(PAGES)} self-paced pages checked, {bad} with classroom assumptions')
sys.exit(1 if bad else 0)
