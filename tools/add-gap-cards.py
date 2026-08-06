#!/usr/bin/env python3
"""Insert the ten CHART gap courses as catalog cards, before the 'Your next course' card."""
import json, re, os, html as H

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = json.load(open('/tmp/claude-0/-home-user-FLH-Portfolio-and-Imact-/8c92505e-dece-5d8d-ad77-0879e809df13/scratchpad/courses.json'))
BASE = "https://me5231979.github.io/Course_Library/courses"

CLOCK = ('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13"'
         ' aria-hidden="true"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15.5 14"/></svg>')
ARROW = ('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">'
         '<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>')
CHEV = ('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">'
        '<polyline points="6 9 12 15 18 9"/></svg>')

STAFF = "For all Vanderbilt staff &middot; Part of the CHART Program"
MGR = "For people managers &amp; team leads &middot; Part of the CHART Program &middot; Manager Voyage"

# repo -> (slug, topics, tag, voyage, description, interactions line, take-home label)
META = {
 "Numbers-Faster": ("numbers-faster", "ai", STAFF, False,
   "Vanderbilt runs on spreadsheets, and most of the analysis in them is still done by hand. Gallup finds data work among the highest-payoff AI use cases, with roughly three in four users reporting clear productivity gains. This session teaches the Data Loop (describe, ask, check, tell): how to prepare a file safely, interrogate it with a question ladder instead of one vague prompt, recompute the numbers that matter before believing them, and turn the finding into two plain sentences a busy reader can act on. The traffic light governs every file that goes near a tool.",
   "6 sections &middot; 4 trainers, a private data mapper, and the graded Analysis Lab", "Data Loop card"),
 "AI-Guardrails": ("ai-guardrails", "ai", STAFF, False,
   "Start Smarter taught the traffic light. This is the session that writes the rest down. Stanford's AI Index counts AI misuse incidents climbing right alongside adoption, and at a university holding FERPA-protected records, good intentions are not a policy. Learners build the Four Lines, a one-page team agreement covering what data may go in, when a human must verify, when readers are told AI helped, and who owns the output. The hard cases get their own drills: student work, meeting notes, letters about people.",
   "6 sections &middot; 4 trainers, a private agreement drafter, and the graded Guardrails Lab", "Four Lines agreement"),
 "Trust-Then-Verify": ("trust-then-verify", "ai", STAFF, False,
   "AI errors do not arrive looking like errors. They arrive fluent, specific, and confident, which is why SHRM finds workers losing hours every week to cleaning up output they trusted too fast. This session makes verification a discipline: the Three Reads (claim, source, slant), the failure taxonomy of hallucination, staleness, slant, omission, and faked math, verification budgets sized to what the output can break, and the stop rules for when a task should leave AI entirely.",
   "6 sections &middot; 4 trainers, a private verification ritual builder, and the graded Verification Lab", "verification card"),
 "AI-Across-Your-Week": ("ai-across-your-week", "ai", STAFF, False,
   "The CHART integrator. Gallup's most striking finding is about breadth: people using AI across seven or more tasks are about twice as likely to report real productivity gains as those using it for one or two. Every other CHART course builds one use case; this one strings them together across a learner's actual week. They inventory their recurring blocks, match each to a CHART method, stack two methods on one task, and name where the reclaimed hours go before those hours quietly evaporate into more meetings.",
   "6 sections &middot; 4 trainers, a private week inventory, and the graded Week Lab", "Week Map"),
 "Admin-Automated": ("admin-automated", "ai", STAFF, False,
   "Automating repetitive work is the highest-payoff AI use case Gallup measures, with around 77 percent of users reporting clear gains, and it is also where saved time most often disappears without a trace. This session runs the Repeat Audit: spot the work you have done the same way more than twice, template it with slots instead of leftovers, route what arrives with a three-pile triage you stay accountable for, and retire what should simply stop. It ends by banking the recovered hours on purpose.",
   "6 sections &middot; 4 trainers, a private repeat inventory, and the graded Automation Lab", "Repeat Audit card"),
 "People-Data-with-AI": ("people-data-with-ai", "ai leadership", MGR, True,
   "Coaching for Performance taught the human method. This teaches the data side, inside hard privacy lines. Culture Amp, Lattice, and 15Five are all pushing managers toward AI-assisted people insight, and the skill that matters is doing it without ever putting a person into a tool. The spine is the Aggregate Rule: individuals are red, always; aggregated and de-identified team data is yellow, approved VU tools only. On top of it sits the Coach's Loop, ending where people data should always end, in a conversation.",
   "6 sections &middot; 4 trainers, a private interrogation planner, and the graded Review Prep Lab", "people-data card"),
 "Leading-AI-Adoption": ("making-ai-normal", "ai leadership", MGR, True,
   "The 90-minute companion to the short Leading the Shift course, for managers who want the full method. Gallup names manager modeling and workflow integration the two strongest predictors of a team actually using AI, and most employees say nobody ever told them what is encouraged. This session teaches Show, Say, Set, Sustain: narrating your own use including the misses, giving explicit permission and explicit limits, installing AI into the rituals where habits live, and holding the practice past the month-three novelty cliff.",
   "6 sections &middot; 4 trainers, a private permission-talk builder, and the graded Adoption Lab", "adoption plan"),
 "Delegating-with-AI": ("delegating-with-ai", "ai leadership", MGR, True,
   "The same task can now go to AI, to a junior as a stretch assignment, or stay with you, and nobody trained managers for that choice. Route everything routine to the machine and you hollow out the apprenticeship your team learns by. Stanford GSB frames the shift as leaders redesigning roles rather than overseeing execution. This session teaches the Routing Test (growth first, then judgment, then volume) and the role math for rebuilding a job as AI absorbs its routine layer.",
   "6 sections &middot; 4 trainers, a private role-math sketch, and the graded Routing Lab", "routing card"),
 "Hiring-with-AI": ("hiring-with-ai", "ai leadership", MGR, True,
   "Pasting a resume into a chatbot feels efficient and is a violation: candidate materials are private information about people, and AI never ranks, screens, or scores a human being. This session draws that line hard, then teaches everything valuable on the right side of it. Structure is the most evidence-backed fairness tool in hiring, and AI is excellent at building structure: inclusive postings, requirement audits that catch proxies, behavioral questions, and scoring anchors written before a single application is read.",
   "6 sections &middot; 4 trainers, a private structure planner, and the graded Hiring Lab", "hiring structure card"),
 "Change-Leadership-for-AI": ("change-leadership-for-ai", "ai leadership", MGR, True,
   "Accenture finds only about 18 percent of leaders lead AI investments effectively, and the differentiators are curiosity, courage, and connection rather than tool fluency. AI change fails on human ground: announced as technology, experienced as threat. This session teaches Name, Frame, Invite, Hold: saying the fear out loud before it says itself, answering the job-security question honestly without promising what you cannot, inviting the team into the design, and holding the container across months.",
   "6 sections &middot; 4 trainers, a private conversation planner, and the graded Change Lab", "change card"),
}

def card(repo):
    d = DATA[repo]
    slug, topics, tag, voyage, desc, inter, take = META[repo]
    url = f"{BASE}/{repo}"
    pills = "".join(f'<span class="skillpill skillpill--core">{c}</span>' for c in d["core"]) + \
            "".join(f'<span class="skillpill">{s}</span>' for s in d["skills"])
    objs = "".join(f"<li>{o}</li>" for o in d["objectives"])
    vy = '\n          <p class="course__voyage">Part of the Manager Voyage program</p>' if voyage else ""
    return f'''<article class="course" data-reveal data-topics="{topics}">
          <p class="course__tag">{tag}</p>
          <h3>{d["title"]}</h3>
          <p class="course__length">{CLOCK} Classroom 90 min &middot; Self-paced ~45 min</p>{vy}
          <div class="course__skills" aria-label="Skills this course builds">{pills}</div>
          <p class="course__desc">{desc}</p>
          <ul class="course__meta">
            <li>{inter}</li>
            <li>Classroom 90 min (60 core) &middot; self-paced ~45 min</li>
            <li>In person, virtual, or self-paced</li>
          </ul>
          <a class="course__syllabus" href="syllabus-{slug}.html">Full course description (printable){ARROW}</a>
          <details class="course__obj">
            <summary>Learning objectives</summary>
            <ol>{objs}</ol>
          </details>
          <div class="course__cta">
            <a class="btn btn--dark" href="{url}/">Launch the course</a>
            <a class="btn btn--ghost-dark" href="{url}/facilitator/">Facilitator edition</a>
            <a class="btn btn--ghost-dark" href="{url}/web/">Self-paced edition</a>
          </div>
          <p class="course__extras">Take-home: <a href="{url}/cheatsheet.html">cheat sheet</a> &middot; <a href="{url}/worksheet.html">{take}</a></p>
                  <button class="course__toggle" type="button" aria-expanded="false" aria-label="Show course details">{CHEV}</button>
        </article>

        '''

ORDER = ["Numbers-Faster", "AI-Guardrails", "Trust-Then-Verify", "Admin-Automated",
         "AI-Across-Your-Week", "People-Data-with-AI", "Leading-AI-Adoption",
         "Delegating-with-AI", "Hiring-with-AI", "Change-Leadership-for-AI"]

p = os.path.join(ROOT, 'index.html')
s = open(p).read()
for repo in ORDER:
    if f'{BASE}/{repo}/' in s:
        raise SystemExit(f"card for {repo} already present; aborting to avoid duplicates")
anchor = s.index('<article class="course course--soon"')
s = s[:anchor] + "".join(card(r) for r in ORDER) + s[anchor:]
open(p, 'w').write(s)
print(f"inserted {len(ORDER)} cards")
