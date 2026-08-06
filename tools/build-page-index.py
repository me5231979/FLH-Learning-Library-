#!/usr/bin/env python3
"""Rebuild index-of-pages.html: every course, edition, and page in the collection.

Run after adding or removing a course. Paths in the output are relative to the
site root, so the index stays correct whatever address the site is served from.
"""
import os
import html as H
from collections import OrderedDict

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# course -> the directories that belong to it, classroom edition first
COURSES = OrderedDict([
    ('Working Smarter', ['learn/classroom', 'learn']),
    ('First Drafts, Faster', ['learn/drafts-class', 'learn/drafts']),
    ('Answers, Faster', ['learn/answers-class', 'learn/answers']),
    ('Ideas, Faster', ['learn/ideas-class', 'learn/ideas']),
    ('Minutes, Faster', ['learn/minutes-class', 'learn/minutes']),
    ('Slides, Faster', ['learn/slides-class', 'learn/slides']),
    ('Decisions, Sharper', ['learn/decisions-class', 'learn/decisions']),
    ('Managers Voyage', ['learn/managers']),
    ('Start Smarter', ['courses/start-smarter']),
    ('Building Brave Teams', ['courses/building-brave-teams']),
    ('Navigating Difficult Conversations', ['courses/difficult-conversations']),
    ('Coaching for Performance', ['courses/coaching-for-performance']),
    ('Emotional Intelligence & Interpersonal Skills', ['courses/emotional-intelligence']),
    ('Presentation & Public Speaking', ['courses/presentation-public-speaking']),
    ('Workflow & Process Redesign', ['courses/workflow-process-redesign']),
    ('Feedback, Ready', ['ai-coaching-feedback']),
    ('Talent Calls, Sharper', ['ai-talent-decisions']),
    ('Leading the Shift', ['leading-ai-adoption']),
    ('Numbers, Faster', ['courses/Numbers-Faster']),
    ('Guardrails & Responsible Use', ['courses/AI-Guardrails']),
    ('Trust, Then Verify', ['courses/Trust-Then-Verify']),
    ('Admin, Automated', ['courses/Admin-Automated']),
    ('Across Your Week', ['courses/AI-Across-Your-Week']),
    ('People Data, Safely', ['courses/People-Data-with-AI']),
    ('Making It Normal', ['courses/Leading-AI-Adoption']),
    ('Delegating, Rethought', ['courses/Delegating-with-AI']),
    ('Hiring, Human', ['courses/Hiring-with-AI']),
    ('Change That Sticks', ['courses/Change-Leadership-for-AI']),
    ('AI 201: Beyond the Basics (retired, kept for reference)', ['courses/ai-advanced']),
])

SUFFIX = {
    'index.html': 'Classroom edition',
    'web/index.html': 'Self-paced edition',
    'facilitator/index.html': 'Facilitator edition',
    'facilitator/guide.html': 'Printable facilitator guide',
    'cheatsheet.html': 'Cheat sheet',
    'worksheet.html': 'Worksheet',
    'checklist.html': 'Checklist',
}
SELF_PACED_DIRS = {'learn', 'learn/drafts', 'learn/answers', 'learn/ideas',
                   'learn/minutes', 'learn/slides', 'learn/decisions'}
SKIP = {'index-of-pages.html'}


def all_pages():
    out = []
    for dp, dn, fns in os.walk(ROOT):
        if '.git' in dp.split(os.sep):
            continue
        for fn in fns:
            if fn.endswith('.html'):
                out.append(os.path.relpath(os.path.join(dp, fn), ROOT))
    return sorted(out)


def build():
    pages = [p for p in all_pages() if p not in SKIP and not p.endswith('404.html')]
    used, sections = set(), []
    for name, bases in COURSES.items():
        items = []
        for base in bases:
            if not os.path.isdir(os.path.join(ROOT, base)):
                continue
            for rel in pages:
                if rel in used:
                    continue
                d = os.path.dirname(rel) or '.'
                if base == 'learn':
                    # learn/ holds sibling courses; only the flagship's own page
                    if d != 'learn':
                        continue
                elif not (d == base or d.startswith(base + '/')):
                    continue
                tail = rel[len(base):].lstrip('/')
                lab = SUFFIX.get(tail, tail)
                if base in SELF_PACED_DIRS and tail == 'index.html':
                    lab = 'Self-paced edition'
                items.append((rel, lab))
                used.add(rel)
        if items:
            sections.append((name, items))

    extra = [r for r in pages if r not in used and '/' not in r]
    used.update(extra)
    total = sum(len(i) for _, i in sections) + len(extra)

    rows = []
    for name, items in sections:
        lis = '\n'.join(
            f'          <li><a href="{H.escape(r)}">{H.escape(l)}</a> <code>{H.escape(r)}</code></li>'
            for r, l in items)
        rows.append('        <section class="idx__course">\n'
                    f'          <h3>{H.escape(name)}</h3>\n          <ul>\n{lis}\n          </ul>\n'
                    '        </section>')
    cat = '\n'.join(f'          <li><a href="{H.escape(r)}">{H.escape(r)}</a></li>' for r in extra)

    page = f'''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Page index | The Vanderbilt Staff Learning Collection</title>
<meta name="robots" content="noindex">
<link rel="icon" href="assets/img/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="assets/css/styles.css?v=10">
<style>
  .idx {{ padding: 3rem 0 4rem; }}
  .idx__course {{ margin: 0 0 1.9rem; }}
  .idx__course h3 {{ margin: 0 0 .5rem; font-size: 1.1rem; }}
  .idx__course ul, .idx__misc ul {{ list-style: none; padding: 0; margin: 0; display: grid; gap: .3rem; }}
  .idx__course li, .idx__misc li {{ font-size: .9rem; }}
  .idx code {{ font-size: .76rem; color: var(--ink-soft); margin-left: .4rem; }}
  .idx__count {{ font-family: var(--font-condensed); text-transform: uppercase;
    letter-spacing: .05em; margin-bottom: 2.2rem; }}
</style>
</head>
<body>
<main class="section on-cream idx">
  <div class="wrap">
    <p class="eyebrow">Every page in the collection</p>
    <h1 class="h2">Page <em>index</em>.</h1>
    <p class="lead">Every course, every edition, and every page in this site, with the path each one
      lives at. Paths are relative to the site root, so they stay correct whatever address the site is
      served from.</p>
    <p class="idx__count">{total} pages &middot; {len(sections)} courses</p>

{chr(10).join(rows)}

    <section class="idx__misc">
      <h3>Catalog and printable syllabi</h3>
      <ul>
{cat}
      </ul>
    </section>
  </div>
</main>
</body>
</html>
'''
    open(os.path.join(ROOT, 'index-of-pages.html'), 'w', encoding='utf-8').write(page)
    print(f'wrote index-of-pages.html: {total} pages, {len(sections)} courses')


if __name__ == '__main__':
    build()
