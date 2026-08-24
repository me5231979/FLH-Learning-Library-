#!/usr/bin/env python3
"""Generate printable course-description pages (syllabus-*.html) for the
Course Library. One page per course: description, objectives, topics,
activities, outcomes/measurement, delivery details, links.

Run after editing the COURSES data below:

    python3 tools/build-syllabi.py
"""
import html, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from gap_syllabi_configs import GAP_COURSES

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

COURSES = [
    {
        "slug": "start-smarter",
        "coreSkills": ['Embodies an entrepreneurial spirit and leverages data and technology'],
        "skills": ['Artificial Intelligence', 'Digital Fluency/Information Literacy', 'Data Security'],
        "title": "Start Smarter",
        "subtitle": "A first introduction for people who have never used AI",
        "audience": "Absolute beginners: staff who have never opened an AI tool, or tried once and gave up. No prerequisites of any kind",
        "length": "Classroom: 60 minutes (30-minute core path). Self-paced web edition: about 25 minutes",
        "format": "Instructor-led, in person or virtual, with learners joining on their own devices via QR code, or fully self-paced at the /web/ edition. No jargon, no code, no assumptions",
        "group": "Any size works; 8 to 30 is the sweet spot",
        "description": "Most AI training assumes you've already started. This course assumes nothing. In five plain-language ideas, it takes someone who has never touched an AI tool to their first successful use: what AI actually is (a program that learned from examples, with proof you've been using it for years in spam filters and map apps), why and how to use it (type in ordinary English, read the draft, improve it with one follow-up), when to use it and when not to (the green/yellow/red traffic light: public content is fine anywhere, internal content belongs only in Vanderbilt-approved tools, and private information about people never goes in), what it can do for you (the five superpowers: draft, summarize, brainstorm, explain, rewrite), and your first try, a real prompt for a real chore, assembled in the session with a copy button, plus a dated commitment card. The classroom edition adds group rounds and a live demo; the web edition delivers the identical course self-paced.",
        "objectives": [
            "Say what AI is in one plain sentence, and spot it in tools you already use every day",
            "Ask AI for help in ordinary English, and make the answer better with one follow-up",
            "Know the traffic-light rule: what's fine to ask, what needs an approved tool, and what never goes in",
            "Name five everyday chores AI can take off your plate",
            "Make your first try this week, with a starter prompt built in the session"
        ],
        "topics": [
            ("What is AI?", "One jargon-free sentence, a program that learned from millions of examples, and the Is That AI? game proving everyone already uses it daily"),
            ("Why and how do we use it?", "The three-step loop: ask in plain English, look at the draft, improve with one follow-up, practiced in the Pick the Next Move trainer"),
            ("When to use it, and when not to", "The traffic light drilled to reflex: green (public), yellow (internal, approved VU tools only), red (private information about people, never), plus the check-what-matters habit"),
            ("What can it do for you?", "Five superpowers matched to real chores: draft, summarize, brainstorm, explain, rewrite, and the honest list of what it can't do"),
            ("Your first try", "The prompt recipe (job + details + shape) built into a real, copyable prompt for a chore from the learner's own week")
        ],
        "activities": "Four scenario trainers (Is That AI?, Pick the Next Move, Green-Yellow-Red, Match the Superpower), a live vague-to-good demo, an inline knowledge check, a prompt builder that assembles a real copyable request, a five-question scored recap, and the My First Try commitment card.",
        "outcomes": "Learners leave having converted from non-user to first-time user: a one-sentence understanding of AI, the follow-up habit that makes answers good, the traffic-light safety reflex, and a real prompt in their clipboard with a dated commitment to run it. Learning is measured in session (trainer scores and the recap), at close (confidence check and a spoken chore-and-day commitment), and after (a 7-day pulse whose count of completed first tries is the program's headline metric).",
        "takehomes": [
            ("Printable cheat sheet", "courses/start-smarter/cheatsheet.html"),
            ("First-try card", "courses/start-smarter/worksheet.html"),
            ("Self-paced web edition", "courses/start-smarter/web/")
        ],
        "learner": "courses/start-smarter/",
        "facilitator": "courses/start-smarter/facilitator/",
        "frameworks": "Designed on adult-learning principles for novice audiences (plain language, immediate application, low-stakes first success), with Kirkpatrick-instrumented follow-up. Data-safety rules align with Vanderbilt's approved-tool guidance and carry into the rest of the collection."
    },
    {
        "slug": "difficult-conversations",
        "coreSkills": ['Leads and inspires teams'],
        "skills": ['Conflict Resolution', 'De-escalation Techniques', 'Influencing Skills'],
        "title": "Navigating Difficult Conversations",
        "subtitle": "A manager's toolkit for candor, trust, and courage",
        "audience": "Part of the Manager Voyage program. People managers, team leads, and HR/talent partners",
        "length": "Classroom: 90 minutes (60-minute core path). Self-paced web edition: about 45 minutes",
        "format": "Instructor-led, in person or virtual; learners join on their own devices via QR code",
        "group": "8 to 24 works best for the pair practice",
        "description": "Most managers already know what they need to say; they freeze on how. This session gives leaders a shared, research-backed language for the conversations they've been avoiding: the feedback that gets softened into vagueness, the redirect that never happens, the conflict that quietly erodes trust. Rather than one script, it blends the field's most respected frameworks into a single practical toolkit, practiced live. Each learner carries one real avoided conversation through the whole session and leaves with it planned and dated.",
        "objectives": [
            "Name the three conversations hiding inside any hard exchange (What Happened, Feelings, Identity), and spot the one that trips you up",
            "Turn a vague concern into specific, fair feedback using the SBI model",
            "Open a candid conversation in a way that keeps the other person safe, using STATE",
            "Assess your own trust-building behaviors with the BRAVING inventory and pick one to strengthen",
            "Plan one real conversation you've been avoiding, and commit to having it within seven days"
        ],
        "topics": [
            ("The cost of avoiding", "Why postponed conversations compound, with McKinsey's obligation-to-dissent framing"),
            ("The three conversations", "The Harvard Negotiation Project model, practiced in a label-the-line game"),
            ("SBI feedback", "Situation, Behavior, Impact (CCL), then assembled hands-on in a graded Feedback Lab"),
            ("Opening with STATE", "Crucial Conversations' safe-opening moves, rehearsed out loud in pairs"),
            ("Trust and BRAVING", "Brené Brown's seven trust behaviors, self-scored privately, plus the circle of safety"),
            ("Radical Candor", "Kim Scott's care/challenge grid, practiced in a quadrant-sorting game"),
            ("The first 30 seconds", "SHRM's three questions and one assembled opening line"),
            ("Sideways and listening", "Recovering from tears, anger, and silence; contrast statements; the listening turn")
        ],
        "activities": "An avoidance-cost meter, a conversation labeler, a graded SBI Feedback Lab, tap-to-explore SBI and STATE anatomies, a private BRAVING scorecard, a Radical Candor quadrant sort, out-loud pair practice with partner verdicts, a six-question scored recap, and the My Conversation Plan capstone.",
        "outcomes": "Learners leave with a written opener for a real conversation, a recovery line for when it gets heated, a listening plan, and a date within seven days, plus a shared team vocabulary (SBI, STATE, BRAVING, Radical Candor). Learning is measured in session (checks and a recap mapped to objectives), at close (readiness check and public commitment), and after (a seven-day follow-up pulse).",
        "takehomes": [
            ("Printable cheat sheet", "courses/difficult-conversations/cheatsheet.html"),
            ("Capstone plan worksheet", "courses/difficult-conversations/worksheet.html")
        ],
        "learner": "courses/difficult-conversations/",
        "facilitator": "courses/difficult-conversations/facilitator/",
        "frameworks": "Blends Stone, Patton & Heen (Harvard Negotiation Project), CCL's SBI, Crucial Conversations' STATE, Brené Brown's BRAVING, Kim Scott's Radical Candor, SHRM's manager guidance, ATD's CLEAR, and McKinsey's courageous-conversations research."
    },
    {
        "slug": "coaching-for-performance",
        "coreSkills": ['Grows self and others', 'Leads and inspires teams'],
        "skills": ['Coaching Techniques', 'Leadership Development', 'Employee Engagement'],
        "title": "Coaching for Performance",
        "subtitle": "Building managers who grow people, not just manage tasks",
        "audience": "Part of the Manager Voyage program. People managers, team leads, and HR/talent partners",
        "length": "Classroom: 90 minutes (60-minute core path). Self-paced web edition: about 45 minutes",
        "format": "Instructor-led, in person or virtual; learners join on their own devices via QR code",
        "group": "8 to 24 works best for the pair and triad practice",
        "description": "Google's largest study of its own managers found one behavior at the top of the list, ahead of technical skill: 'is a good coach.' Yet most managers were promoted for being excellent doers, so they default to telling, fixing, and directing. This session rewires the default: a repeatable coaching structure (GROW), the question craft that makes it work, Marshall Goldsmith's Feedforward exchange, and the judgment to know when directing is actually the right call. Learners coach a virtual coachee, then each other, then commit to coaching a real person on their team within the week.",
        "objectives": [
            "Explain why coaching, not directing, is the top predictor of great management, and spot your own telling default",
            "Structure a full coaching conversation with the GROW model, from goal to committed action",
            "Convert closed, leading, and advice-loaded lines into open, powerful questions",
            "Give and receive future-focused Feedforward suggestions without judgment or defense",
            "Choose your coaching model (GROW, CLEAR, or OSKAR) and commit to one real coaching conversation this week, opening question written"
        ],
        "topics": [
            ("The case for coaching", "Google's Project Oxygen and McKinsey's controller-to-coach shift, plus a private coaching-ratio self-check"),
            ("Your telling default", "Goleman's leadership styles and why excellent doers over-direct, practiced in a catch-the-style game"),
            ("The GROW conversation", "Goal, Reality, Options, Will, run live against a virtual coachee in the Coach Jordan simulator, then with a partner"),
            ("Powerful questions", "The ICF's three tests (open, clean, theirs), the six-second silence, and a question-conversion drill"),
            ("Feedforward", "Goldsmith's future-only development exchange, run live in triads"),
            ("Choose your model", "GROW vs CLEAR vs OSKAR, matched to real coaching situations"),
            ("When NOT to coach", "Situational judgment: when directing is right, and how to default back to coaching")
        ],
        "activities": "A coaching-ratio meter (the baseline for a 30-day re-measure), a style-spotting trainer, the Coach Jordan GROW conversation simulator, a powerful-question converter, a feedforward classifier, a model matcher, live pair and triad practice, a six-question scored recap, and the My Coaching Plan capstone.",
        "outcomes": "Learners leave with a chosen coaching model, a written opening question for a real team member, a counter-move for their personal telling trap, and a date within seven days. Learning is measured in session (trainer scores, simulator outcomes, and a recap mapped to objectives), at close (readiness check and public commitment), and after (a seven-day pulse and a 30-day coaching-ratio re-poll against the in-session baseline).",
        "takehomes": [
            ("Printable cheat sheet", "courses/coaching-for-performance/cheatsheet.html"),
            ("Coaching plan worksheet", "courses/coaching-for-performance/worksheet.html")
        ],
        "learner": "courses/coaching-for-performance/",
        "facilitator": "courses/coaching-for-performance/facilitator/",
        "frameworks": "Blends Google re:Work's Project Oxygen, Whitmore's GROW, the ICF core competencies, Marshall Goldsmith's Feedforward, Goleman's leadership styles, McKinsey's leadership research, Hawkins' CLEAR, the solution-focused OSKAR model, and Ibarra & Scoular's 'The Leader as Coach' (HBR)."
    },
    {
        "slug": "working-smarter",
        "coreSkills": ['Embodies an entrepreneurial spirit and leverages data and technology'],
        "skills": ['Artificial Intelligence', 'Prompt Writing', 'Digital Fluency/Information Literacy'],
        "title": "Working Smarter",
        "subtitle": "Learn the new tools by using them",
        "audience": "All Vanderbilt staff; no technical background needed",
        "length": "Classroom: 60 to 90 minutes. Self-paced: 60 to 90 minutes; every module is skippable and embedded videos are optional",
        "format": "Classroom (instructor-led, in person or virtual; learners join on their own devices) or fully self-paced online",
        "group": "Any size in the classroom; the self-paced edition works alone at a desk",
        "description": "The flagship course of the AI-enabled Education Series. Instead of talking about AI, it has you use it: you watch a language model predict the next word, map your own role the way AI actually meets it (task by task), learn the CRIT prompt framework, and drill it in working practice apps before taking one real task into your own tools. Along the way you learn the two questions that route any task to the right Vanderbilt tool, ChatGPT EDU, Amplify, or Copilot: how sensitive is the data, and where are you already working. It closes with a knowledge check and a personal plan for the week ahead.",
        "objectives": [
            "Explain what AI tools like ChatGPT are, and why they sometimes state made-up things as fact",
            "Map your own role task by task, identify where AI can help, and build a 30/60/90 development plan from that list",
            "Write clear, complete prompts with the CRIT framework: Context, Role, Interview, Task",
            "Choose the right approved tool for any task by data sensitivity: ChatGPT EDU, Amplify, or Copilot",
            "Use AI responsibly: verify outputs before they leave your hands, disclose substantive AI help, and keep sensitive data out of public tools"
        ],
        "topics": [
            ("What AI is, and how it works", "Five terms that build on each other (AI, machine learning, generative AI, large language models, agents), plus an in-page demo where you watch a model predict the next word"),
            ("Your role, task by task", "A readiness assessment that looks at your job the way AI meets it, task by task, and starts your 30/60/90 development plan"),
            ("The CRIT prompt framework", "Context, Role, Interview, Task: the four-part way to write a prompt, assembled step by step in the CRIT builder"),
            ("The Playground", "Practice apps with no live AI: build prompts for your own work in the Prompt Lab, tighten them in the Prompt Grader, then take one real task from your week"),
            ("Your three tools", "ChatGPT EDU, Amplify, and Copilot compared card by card, then drilled in Tool Match; the right tool depends on the data"),
            ("The AI Opportunity Simulator", "Describe one real task and get back an opportunity map, starter prompts, data flags, and the first 30 days of a plan"),
            ("Using AI responsibly", "Six guardrail habits, the never-paste list, and four workplace scenarios that test your judgment"),
            ("The knowledge check", "Eight self-scored questions covering the whole course; nobody sees your score, and you can retake it anytime"),
            ("Put it to work this week", "A five-step weekly loop that turns the course into a habit, closing with completion marked in Oracle Learning")
        ],
        "activities": "An in-page next-word prediction demo, a role readiness assessment with a 30/60/90 plan, four working practice apps (the CRIT builder, the Prompt Lab, the Prompt Grader, and Tool Match), the AI Opportunity Simulator, section-by-section self-checks with progress tracking, an eight-question knowledge check, and a closing shelf of Oracle Learning picks, podcasts, and videos for continued learning.",
        "outcomes": "Learners leave with a tested CRIT prompt for a real task from their own week, the two-question rule for routing any task to the right tool, the never-paste list, a 30/60/90 development plan built from their own task list, and a five-step weekly loop for putting AI on one task at a time. Learning is self-measured in the course (section self-checks and the eight-question knowledge check), and learners record completion themselves in Oracle Learning.",
        "takehomes": [],
        "learner": "learn/classroom/",
        "facilitator": "learn/classroom/facilitator/",
        "selfpaced": "learn/",
        "frameworks": "CRIT (Context, Role, Interview, Task) is credited to Geoff Woods, The AI-Driven Leader. Prompt patterns draw on Vanderbilt's Dr. Jules White (the Persona pattern). Task-exposure research from Eloundou et al., 'GPTs are GPTs,' and the Anthropic Economic Index. Tool routing follows Vanderbilt's data classification."
    },
    {
        "slug": "first-drafts-faster",
        "coreSkills": ['Embodies an entrepreneurial spirit and leverages data and technology'],
        "skills": ['Business Writing', 'Artificial Intelligence', 'Editing & Proofreading'],
        "title": "First Drafts, Faster",
        "subtitle": "Save time and be more efficient in writing and editing communications",
        "audience": "All Vanderbilt staff whose job includes everyday writing: emails, announcements, and summaries; no technical background needed",
        "length": "About 15 minutes self-paced; one 45-to-60-minute session live",
        "format": "Classroom (instructor-led, in person or virtual; learners join on their own devices via QR code) with a scripted facilitator edition, or fully self-paced online",
        "group": "Any size in the classroom; the self-paced edition works alone at a desk",
        "description": "Part of the AI-enabled Education Series. If your job includes writing emails, announcements, or summaries, this course teaches one method for it: the AI writes the first draft, and you edit the version that gets sent. Research puts the gain at about 40% faster with better results (Noy & Zhang, Science, 2023), and the quality lift shows up when a person edits what comes back. The method is brief, draft, edit: brief the AI with CRIT (Context, Role, Interview, Task) the way you'd brief a colleague, let it write the whole first pass, then make it sound like you, check every name, date, and number, and cut what isn't needed.",
        "objectives": [
            "Brief an AI like a colleague using CRIT: Context, Role, Interview, Task",
            "Produce a usable first draft of an email, announcement, or summary without starting from a blank page",
            "Edit an AI draft into your own: restore your voice, verify every fact, cut what isn't needed",
            "Route each writing task to the right Vanderbilt tool by data sensitivity: ChatGPT EDU, Amplify, or Copilot",
            "Apply the method to tomorrow's first piece of writing, and leave with a printed plan",
        ],
        "topics": [
            ("The evidence", "Four cited studies on drafting with AI: Noy & Zhang (Science), the Harvard/BCG field experiment, Generative AI at Work (QJE), and Nielsen Norman Group's case studies"),
            ("The method", "Brief, draft, edit, with a cited proof point on every step and CRIT credited to Geoff Woods"),
            ("Three worked examples", "A polite no to a vendor, the lobby closure notice, and a long report turned into a short brief, each with a copyable prompt, a tool recommendation, and an edit pass"),
            ("The four rules", "Safe data only; verify everything; you own every word you send; keep your own voice"),
            ("Practice and knowledge check", "A typed CRIT brief for a real task that prints on the takeaway, plus three scenario questions"),
            ("Recap and appendix", "What you learned, three next steps, a calendar check-in, Oracle Learning courses, and every source cited in full"),
        ],
        "activities": "Three worked examples with copyable prompts and a fictional practice report to run, a try-it row under each example naming the right Vanderbilt tool (ChatGPT EDU, Amplify, or Copilot, with the recommendation explained and the wrong choice greyed out with the reason), a typed practice brief, and a room-run live demo in the classroom edition",
        "outcomes": "Learners leave with a typed CRIT brief for a real piece of writing from their own week, three prompts ready to use at work, the four rules, and a printable one-page plan, plus a calendar file for a 15-minute self check-in two weeks out",
        "takehomes": [],
        "learner": "learn/drafts-class/",
        "facilitator": "learn/drafts-class/facilitator/",
        "selfpaced": "learn/drafts/",
        "frameworks": "CRIT (Context, Role, Interview, Task) from Geoff Woods' The AI-Driven Leader; the brief, draft, edit method; Vanderbilt tool routing by data sensitivity (ChatGPT EDU, Amplify, Copilot)",
    },
    {
        "slug": "answers-faster",
        "coreSkills": ['Embodies an entrepreneurial spirit and leverages data and technology'],
        "skills": ['Artificial Intelligence', 'Digital Fluency/Information Literacy', 'Critical Thinking'],
        "title": "Answers, Faster",
        "subtitle": "Find, check, and summarize information in a fraction of the time",
        "audience": "All Vanderbilt staff whose job includes digging answers out of policies, reports, and the open web; no technical background needed",
        "length": "About 15 minutes self-paced; one 45-to-60-minute session live",
        "format": "Classroom (instructor-led, in person or virtual; learners join on their own devices via QR code) with a scripted facilitator edition, or fully self-paced online",
        "group": "Any size in the classroom; the self-paced edition works alone at a desk",
        "description": "Part of the AI-enabled Education Series. If your job includes digging answers out of policies, reports, and the open web, this course teaches a simple way to have AI do the finding while you stay the one who decides what's true. Searching for information is already the most common thing Americans use AI chatbots for (Pew Research Center), and in field experiments the gains held up on tasks within the tool's reach when a person confirmed the result. The method is ask, anchor, check: brief the question with CRIT the way you'd brief a colleague, give the AI the source so the answer comes from something real (with a page or section reference for every claim), then open the citation and confirm before anything gets used. Three worked examples walk it through, and the course ends with you briefing a real question of your own.",
        "objectives": [
            "Brief a real question with CRIT (Context, Role, Interview, Task) the way you'd brief a colleague",
            "Anchor the AI in a real source (paste the document, name the site, attach the file), and ask for a page or section reference with every claim",
            "Open the citation and confirm an answer before it gets used, because a wrong answer reads exactly like a right one",
            "Apply the four rules: safe data only, open the source before you repeat the claim, check the date, own what you pass along",
            "Route each question to the right Vanderbilt tool by data sensitivity, and take three ready prompts back to your desk"
        ],
        "topics": [
            ("The evidence", "Three studies on handing the finding to AI and keeping the checking: Pew Research Center on how common AI search already is, plus field experiments from Dell'Acqua et al. (HBS) and Noy & Zhang (Science)"),
            ("The method: ask, anchor, check", "Brief the question with CRIT, give the AI the source and ask for references, then verify before you use"),
            ("Example: the document", "Getting one answer out of a long policy, with a section reference to check"),
            ("Example: the web brief", "Comparing three tools on the open web, with dates and sources demanded up front"),
            ("Example: the synthesis", "Three sets of notes combined into one update"),
            ("Guardrails: the four rules", "Safe data only; open the source before you repeat the claim (models fabricate citations that look completely real); dates matter; you own what you pass along"),
            ("Practice now", "Type the CRIT brief for a question you actually have; it saves in your browser and copies straight into your tool"),
            ("Knowledge check and recap", "Three self-scored questions, the method and rules in one view, and three next steps"),
            ("Appendix", "Every statistic in the course, cited in full")
        ],
        "activities": "Three worked examples with copyable prompts, a try-it row under each example naming the right Vanderbilt tool (ChatGPT EDU, Amplify, or Copilot, with the recommendation explained and the wrong choice greyed out with the reason), a typed CRIT brief for a real question that feeds the printable plan, a three-question knowledge check, and a printable one-page takeaway with the method, your brief, all three prompts, the guardrails, and the tools.",
        "outcomes": "Learners leave with a typed CRIT brief for a real question from their own week, three prompts ready to use at work, the four rules, and a printable one-page plan, plus a calendar file for a 15-minute self check-in two weeks out: are you still opening the sources, or just forwarding answers? Learning is self-checked in the course; nothing typed is saved or transmitted.",
        "takehomes": [],
        "learner": "learn/answers-class/",
        "facilitator": "learn/answers-class/facilitator/",
        "selfpaced": "learn/answers/",
        "frameworks": "CRIT (Context, Role, Interview, Task) is credited to Geoff Woods, The AI-Driven Leader. Evidence cited in the course includes Pew Research Center's Americans and AI, Dell'Acqua et al. (HBS Working Paper, 2023), Noy & Zhang (Science, 2023), and the Mata v. Avianca sanctions order on fabricated citations. Tool routing follows Vanderbilt's guidance: ChatGPT EDU for everyday non-sensitive work; anything sensitive or internal goes in Amplify or Copilot through a Vanderbilt account."
    },
    {
        "slug": "ideas-faster",
        "coreSkills": ['Embodies an entrepreneurial spirit and leverages data and technology'],
        "skills": ['Artificial Intelligence', 'Creative Thinking', 'Problem Solving'],
        "title": "Ideas, Faster",
        "subtitle": "Get unstuck: more options, better questions, clearer thinking",
        "audience": "All Vanderbilt staff; anyone whose job hands them problems with no obvious answer: a stalled project, a falling number, a goal as vague as 'make it better'",
        "length": "About 15 minutes self-paced; one 45-to-60-minute session live",
        "format": "Classroom (instructor-led, in person or virtual; learners join on their own devices via QR code) with a scripted facilitator edition, or fully self-paced online",
        "group": "Any size in the classroom; the self-paced edition works alone at a desk",
        "description": "Part of the AI-enabled Education Series. This course teaches a simple way to use AI as a thinking partner when you're stuck, so you start from twenty options instead of a blank page. Working people already reach for AI at exactly that moment: in Gallup's survey of U.S. employees, generating ideas was one of the two most common uses of AI at work. The method is frame, flood, filter: frame the problem with CRIT the way you'd brief a colleague, ask for twenty options with real range (wild ones included), then pick, combine, and sharpen with criteria you own. The evidence page is honest about the catch: AI ideas cluster, so the course teaches you to bring your own weird. Three worked examples walk it through, and the course ends with you framing a real stuck problem of your own.",
        "objectives": [
            "Frame a stuck problem with CRIT (Context, Role, Interview, Task) instead of circling it alone",
            "Ask for twenty options with real range, wild ones included, rather than stopping at the first answer that sounds fine",
            "Filter the flood with criteria you own (cost, effort, impact, fit): pick, combine, and sharpen the two or three worth developing",
            "Avoid the sameness trap by adding the option only you would think of",
            "Treat ideas as starters, not decisions, and credit people, not the tool, in what gets proposed"
        ],
        "topics": [
            ("The evidence", "Three studies on why the flood works and where it doesn't: Wharton's idea-generation experiment (200 usable ideas in about 15 minutes), Slack's Workforce Lab, and Doshi & Hauser's sameness finding in Science Advances"),
            ("The method: frame, flood, filter", "Tell it what you're stuck on with CRIT, ask for quantity and range, then you pick, combine, and sharpen"),
            ("Example: the blank page", "Twenty ideas for the fall event"),
            ("Example: the mystery", "The ambiguous problem: nobody comes to the optional trainings"),
            ("Example: the vague goal", "'Make onboarding better,' turned into something you can actually work"),
            ("Guardrails: the four rules", "Safe data only; ideas are starters, not decisions; watch the sameness trap; credit people, not the tool"),
            ("Practice now", "Type the frame for the problem you're stuck on; it saves in your browser and copies straight into your tool"),
            ("Knowledge check and recap", "Three self-scored questions, the method and rules in one view, and three next steps"),
            ("Appendix", "Every statistic in the course, cited in full")
        ],
        "activities": "Three worked examples with copyable prompts, a try-it row under each example naming the right Vanderbilt tool (ChatGPT EDU, Amplify, or Copilot, with the recommendation explained), a typed CRIT brief for a real stuck problem that feeds the printable plan, a three-question knowledge check, and a printable one-page takeaway with the method, your brief, all three prompts, the guardrails, and the tools.",
        "outcomes": "Learners leave with a typed frame for a real problem they own, three prompts ready for the next time they're stuck, the four rules, and a printable one-page plan, plus a calendar file for a 15-minute self check-in two weeks out: are you still flooding before you filter? Learning is self-checked in the course; nothing typed is saved or transmitted.",
        "takehomes": [],
        "learner": "learn/ideas-class/",
        "facilitator": "learn/ideas-class/facilitator/",
        "selfpaced": "learn/ideas/",
        "frameworks": "CRIT (Context, Role, Interview, Task) is credited to Geoff Woods, The AI-Driven Leader. Evidence cited in the course includes Girotra, Meincke, Terwiesch & Ulrich (SSRN, 2023), Slack Workforce Lab's Workforce Index, Doshi & Hauser (Science Advances, 2024), and Gallup's AI Use at Work surveys. Tool routing follows Vanderbilt's guidance: ChatGPT EDU for everyday non-sensitive work; anything sensitive or internal goes in Amplify or Copilot through a Vanderbilt account."
    },
    {
        "slug": "minutes-faster",
        "coreSkills": ['Embodies an entrepreneurial spirit and leverages data and technology'],
        "skills": ['Artificial Intelligence', 'Meeting Management', 'Business Writing'],
        "title": "Minutes, Faster",
        "subtitle": "Turn meetings and long documents into decisions, action items, and takeaways people actually read",
        "audience": "All Vanderbilt staff whose week includes meetings that need minutes, reports too long to read before the deadline, and transcripts nobody opens",
        "length": "About 15 minutes self-paced; one 45-to-60-minute session live",
        "format": "Classroom (instructor-led, in person or virtual; learners join on their own devices via QR code) with a scripted facilitator edition, or fully self-paced online",
        "group": "Any size in the classroom; the self-paced edition works alone at a desk",
        "description": "Part of the AI-enabled Education Series. Turning what was said into what gets done is real work, and it competes with a workday that interrupts you about every two minutes (Microsoft WorkLab). This course teaches a three-step way to turn a faithful record into a summary you can trust: capture (get an announced recording and transcript from Teams or Zoom), condense (brief the AI with CRIT so the summary leads with decisions, then action items with owners and dates), confirm (read the result against the source before it circulates, because a transcript mishears and a model summarizes confidently either way). Workers who use AI for this kind of work estimate saving about six hours a week (SHRM). Three worked examples walk it through, and the course ends with you briefing the minutes for a real meeting of your own.",
        "objectives": [
            "Get a faithful record with announced recording and transcription in Teams or Zoom",
            "Brief the condense with CRIT (Context, Role, Interview, Task) so the summary leads with decisions, then action items with owners and dates",
            "Confirm names, numbers, and owners against the transcript or report before the summary circulates, and ask about anything marked inaudible instead of guessing",
            "Apply the four rules: safe data only, recording is announced, confirm before it circulates, the summary is the start, not the record",
            "Brief the minutes for a real meeting of your own, and take three ready prompts back to your desk"
        ],
        "topics": [
            ("The evidence", "Three findings on handing the condensing to AI and keeping the checking: Microsoft WorkLab on the interrupted workday, SHRM's survey of U.S. workers, and Noy & Zhang's writing-task experiment in Science"),
            ("The method: capture, condense, confirm", "Get a faithful record, brief the condense with CRIT, then check it against the source"),
            ("Example: the staff meeting", "Minutes for the Monday staff meeting: decisions first, action items with owners and dates"),
            ("Example: the long report", "A 30-page report into one page"),
            ("Example: the meeting you missed", "Catching up from the transcript without watching the recording"),
            ("Guardrails: the four rules", "Safe data only; recording is announced, not assumed; confirm before it circulates; the summary is the start, not the record"),
            ("Practice now", "Type the brief for your next meeting's minutes; when the transcript lands, paste it in and run it"),
            ("Knowledge check and recap", "Three self-scored questions, the method and rules in one view, and three next steps"),
            ("Appendix", "Every statistic and every Teams and Zoom step in the course, cited in full")
        ],
        "activities": "Three worked examples with copyable prompts, a capture cheat sheet with the actual Teams and Zoom steps, a try-it row under each example naming the right Vanderbilt tool (transcripts and internal reports belong in Amplify or Copilot), a typed CRIT brief for a real meeting that feeds the printable plan, a three-question knowledge check, and a printable one-page takeaway with the method, your brief, all three prompts, the capture cheat-lines, the guardrails, and the tools.",
        "outcomes": "Learners leave with a typed brief for their next meeting's minutes, three prompts ready to use this week, the capture steps for Teams and Zoom, the four rules, and a printable one-page plan, plus a calendar file for a 15-minute self check-in two weeks out: are your summaries confirmed, or just fast? Learning is self-checked in the course; nothing typed is saved or transmitted.",
        "takehomes": [],
        "learner": "learn/minutes-class/",
        "facilitator": "learn/minutes-class/facilitator/",
        "selfpaced": "learn/minutes/",
        "frameworks": "CRIT (Context, Role, Interview, Task) is credited to Geoff Woods, The AI-Driven Leader. Evidence cited in the course includes Microsoft WorkLab's Work Trend Index, SHRM's Navigating AI in the Workplace, Noy & Zhang (Science, 2023), and Microsoft and Zoom product documentation for the capture steps. Tool routing follows Vanderbilt's guidance: meeting transcripts and internal reports go in Amplify or Copilot through a Vanderbilt account, never personal tools."
    },
    {
        "slug": "slides-faster",
        "coreSkills": ['Embodies an entrepreneurial spirit and leverages data and technology'],
        "skills": ['Artificial Intelligence', 'Presentation Development', 'Storytelling'],
        "title": "Slides, Faster",
        "subtitle": "Build decks in a fraction of the time, and make them land with the people who matter",
        "audience": "All Vanderbilt staff who build slide decks, from a quarterly update to a training session; it earns its keep fastest on teams producing executive-facing materials",
        "length": "About 15 minutes self-paced; one 45-to-60-minute session live",
        "format": "Classroom (instructor-led, in person or virtual; learners join on their own devices via QR code) with a scripted facilitator edition, or fully self-paced online",
        "group": "Any size in the classroom; the self-paced edition works alone at a desk",
        "description": "Part of the AI-enabled Education Series. The hours in most deck builds don't go where the value is: they go into blank slides, layout fiddling, and rewriting bullet three at midnight. This course teaches a simple way to have AI build the rough deck so your time goes into the story and the polish instead. Among people who already use AI for deck building, 76% say it has had a positive effect on their productivity (Gallup). The method is story, build, polish: brief the deck with CRIT before any slide exists (who is in the room, what they care about, the one thing they should do afterward), let Copilot in PowerPoint or Designer build the rough version, then cut it hard, put it on your template, and check every number before the room sees it. Three worked examples walk it through, and the course ends with you briefing a real deck of your own.",
        "objectives": [
            "Brief a deck with CRIT (Context, Role, Interview, Task) before any slide exists, starting from the audience instead of the blank slide",
            "Let Copilot in PowerPoint or Designer build the rough deck, speaker notes included",
            "Polish the rough deck into yours: one idea per slide, your unit's template, alt text confirmed",
            "Check every number and chart against its source before the room sees it, because a confident chart is not a correct chart",
            "Apply the four rules: safe data only, check every number, the template and the credit are yours, slides support the talk"
        ],
        "topics": [
            ("The evidence", "One survey and two experiments: Gallup on how common AI deck building already is and how it lands, plus Noy & Zhang (Science) and Dell'Acqua et al. (HBS) on where the gains hold up"),
            ("The method: story, build, polish", "Brief the deck before it exists, let the tools build the rough deck, then you make it worth the room's time"),
            ("Example: the leadership update", "Five slides for the dean's leadership team"),
            ("Example: the training deck", "A how-to document becomes a training deck"),
            ("Example: the workshop talk", "A talk for a room of strangers"),
            ("Guardrails: the four rules", "Safe data only; check every number; the template and the credit are yours; slides support the talk, not replace it"),
            ("Practice now", "Type the brief for your next real deck before you open PowerPoint; it saves in your browser and copies straight into your tool"),
            ("Knowledge check and recap", "Three self-scored questions, the method and rules in one view, and three next steps"),
            ("Appendix", "Every statistic and every Copilot and Designer step in the course, cited in full")
        ],
        "activities": "Three worked examples with copyable prompts, a try-it row under each example naming the right Vanderbilt tool (internal numbers and unreleased plans go through Amplify or Copilot), a typed CRIT brief for a real upcoming deck that feeds the printable plan, a three-question knowledge check, and a printable one-page takeaway with the method, your brief, all three prompts, the guardrails, and the tools.",
        "outcomes": "Learners leave with a typed brief for their next real deck, three deck prompts ready to use at work, the four rules, and a printable one-page plan, plus a calendar file for a 15-minute self check-in two weeks out: did your last deck start with a brief, or a blank slide? Learning is self-checked in the course; nothing typed is saved or transmitted.",
        "takehomes": [],
        "learner": "learn/slides-class/",
        "facilitator": "learn/slides-class/facilitator/",
        "selfpaced": "learn/slides/",
        "frameworks": "CRIT (Context, Role, Interview, Task) is credited to Geoff Woods, The AI-Driven Leader. Evidence cited in the course includes Gallup's Organizational AI Adoption panel survey, Noy & Zhang (Science, 2023), Dell'Acqua et al. (HBS Working Paper, 2023), and Microsoft's Copilot in PowerPoint and Designer documentation. Tool routing follows Vanderbilt's guidance: ChatGPT EDU for everyday non-sensitive work; internal numbers, personnel matters, and unreleased plans go through Amplify or Copilot on a Vanderbilt account."
    },
    {
        "slug": "decisions-sharper",
        "coreSkills": ['Embodies an entrepreneurial spirit and leverages data and technology'],
        "skills": ['Artificial Intelligence', 'Decision Making', 'Critical Thinking'],
        "title": "Decisions, Sharper",
        "subtitle": "Widen the view before the call: test scenarios, surface hidden assumptions, and decide with more confidence",
        "audience": "Part of the Manager Voyage program. People managers and team leads who make the calls other people wait on: schedules, budgets, coverage, a plan to pitch",
        "length": "About 15 minutes self-paced; one 45-to-60-minute session live",
        "format": "Classroom (instructor-led, in person or virtual; learners join on their own devices via QR code) with a scripted facilitator edition, or fully self-paced online",
        "group": "Any size in the classroom; the self-paced edition works alone at a desk",
        "description": "Part of the AI-enabled Education Series and a Managers Voyage course. Think about the last decision you sat on for a week, not because the choice was hard to say out loud, but because you couldn't be sure what you were missing. This course teaches a simple way to use AI to widen what you can see before you decide, while the decision stays yours. In Deloitte's survey of 3,235 leaders, 60% named better decision-making among the benefits they're seeing from AI, and Stanford GSB's advice to leaders says the boundary in its title: you're in charge. The method is widen, weigh, decide: lay the decision out with CRIT (every person described by role, never by name), test best, expected, and worst case, run a premortem, ask for second-order effects and the case against your favorite option, then make the call yourself and write down why. Three worked examples walk it through, and the course ends with you laying out a real decision you own.",
        "objectives": [
            "Lay a decision out with CRIT (Context, Role, Interview, Task), describing every person by role, never by name",
            "Test the decision before it's real: best, expected, and worst case, a premortem, and second-order effects",
            "Design the AI's role for each decision: it informs or recommends, and it never decides",
            "Interrogate confident answers, and check any factual claim before it moves your decision",
            "Make the call yourself, keep your reasoning in the record, and disclose substantive AI help to the people who rely on it"
        ],
        "topics": [
            ("The evidence", "Two studies and one piece of advice: Deloitte's State of AI in the Enterprise, Stanford GSB's 'You're in Charge,' and Klein's premortem research from Harvard Business Review"),
            ("The method: widen, weigh, decide", "Lay the decision out, test it before it's real, and the call is yours"),
            ("Example: the recommendations", "Two trusted leads, two opposite answers"),
            ("Example: the scenario test", "Changing the coverage hours before you commit"),
            ("Example: the assumptions check", "Stress-testing the plan before the director does"),
            ("Guardrails: the four rules", "Never personal or sensitive data, and when it's about a person, HR; it informs or recommends, it never decides; interrogate confident answers; own it and show your work"),
            ("Practice now", "Type the brief for the decision sitting on your desk, roles not names; it saves in your browser and copies straight into your tool"),
            ("Knowledge check and recap", "Three self-scored questions, the method and rules in one view, and three next steps"),
            ("Appendix", "Every statistic in the course, cited in full")
        ],
        "activities": "Three worked examples with copyable prompts, a try-it row under each example naming the right Vanderbilt tool for decision work, a typed decision brief (roles, never names) that feeds the printable plan, a three-question knowledge check, and a printable one-page takeaway with the method, your brief, all three prompts, the guardrails, and the tools.",
        "outcomes": "Learners leave with a typed brief for a real open decision, three prompts ready to use this week, the four rules, and a printable one-page plan, plus a calendar file for a 15-minute self check-in two weeks out: did the AI widen the view, and did the calls stay yours? The recap sends the three hardest questions from the test back to the people involved. Learning is self-checked in the course; nothing typed is saved or transmitted.",
        "takehomes": [],
        "learner": "learn/decisions-class/",
        "facilitator": "learn/decisions-class/facilitator/",
        "selfpaced": "learn/decisions/",
        "frameworks": "CRIT (Context, Role, Interview, Task) is credited to Geoff Woods, The AI-Driven Leader. Evidence cited in the course includes Deloitte's State of AI in the Enterprise, Stanford GSB Insights' 'You're in Charge' (2024), Dell'Acqua et al. (HBS Working Paper, 2023), and Gary Klein's 'Performing a Project Premortem' (Harvard Business Review, 2007). Data rules are strict: no names in people decisions, and personnel matters go to HR."
    },
    {
        "slug": "emotional-intelligence",
        "coreSkills": ['Grows self and others', 'Radically collaborates and cultivates belonging'],
        "skills": ['Conflict Management', 'Communication Strategies'],
        "title": "Emotional Intelligence & Interpersonal Skills",
        "subtitle": "Lead yourself, then lead others",
        "audience": "Part of the Manager Voyage program. Managers, team leads, and individual contributors who work through relationships: anyone whose week includes feedback, conflict, or collaboration",
        "length": "Classroom: 90 minutes (60-minute core path). Self-paced web edition: about 45 minutes",
        "format": "Instructor-led, in person or virtual; learners join on their own devices via QR code. Private by design: exercises use roles (never names) and nothing typed is saved or transmitted",
        "group": "9 to 24 works best (the listening drill runs in triads); scales larger with pairs and room votes",
        "description": "When researchers studied what separates star performers from average ones, emotional intelligence came out roughly twice as important as IQ and technical skill combined, yet 95 percent of people believe they're self-aware and only 10 to 15 percent are. This session closes that gap with practice, not platitudes. It opens with the published evidence (Goleman, McKinsey, DDI, SHRM), installs the four-domain map with the Mayer-Salovey science named underneath, then works inward: mapping blind spots with the Johari Window and using UCLA's affect-labeling research to turn reactivity into regulation. The second half turns outward: active listening scored against a real rubric in a triad drill, rebuilding accusations with Rosenberg's Nonviolent Communication in a graded lab, and Edmondson's psychological safety, saying the hard thing with candor AND care. Every learner leaves with a commitment card: one relationship, one practice, one date.",
        "objectives": [
            "Explain Goleman's four EI domains and map your own blind spots with the Johari Window",
            "Identify the Mayer-Salovey ability model, the research foundation beneath the applied one",
            "Name emotions precisely and use affect labeling to turn reactivity into regulation",
            "Practice active listening, paraphrase, clarify, withhold judgment, against a real rubric",
            "Reframe an accusation into Nonviolent Communication's Observation, Feeling, Need, Request",
            "Raise a hard truth with candor and care, and commit one practice to a real relationship this week"
        ],
        "topics": [
            ("The case for EI", "Four research findings played as a guessing game: Goleman's 2x finding, DDI's empathy data, McKinsey's demand projections, SHRM on respect"),
            ("The map", "Goleman's four domains in sequence (notice, steer, read the room, move together), with the Mayer-Salovey ability model underneath"),
            ("Self-awareness and the Johari Window", "Eurich's 95-vs-10-15 gap, the four quadrants, and a private blind-spot mapper; only feedback shrinks the blind quadrant"),
            ("Name it to tame it", "UCLA's affect-labeling neuroscience: precise emotional labels calm the amygdala and point at the next move"),
            ("Active listening", "Paraphrase, clarify, withhold judgment, drilled in scored triads with an observer holding the rubric"),
            ("The NVC reframe", "Rosenberg's Observation, Feeling, Need, Request, practiced in a graded lab where the reply changes as each part sharpens"),
            ("Candor with care", "Edmondson's psychological safety and Google's Project Aristotle: safety plus standards, not niceness")
        ],
        "activities": "A guess-the-number research game, a domain-spotting trainer, a private Johari Window mapper, an emotion-label upgrader, a rate-the-reply listening trainer plus a live triad drill, a graded NVC Reframe Lab, a judge-the-opener candor trainer, inline knowledge checks, a scored recap, and the EI Commitment Card capstone.",
        "outcomes": "Learners leave with a dated commitment card: one real relationship, one practice (listening, NVC, candor with care, or affect labeling), one named failure mode to avoid, and a first rep within seven days, plus the blind-spot question to ask a trusted colleague. Learning is measured in session (trainer scores, a graded lab, and a recap mapped to the objectives), at close (a confidence check and a spoken commitment round), and after (a 7-day pulse on the first rep and a 30-day self-check re-poll).",
        "takehomes": [
            ("Printable cheat sheet", "courses/emotional-intelligence/cheatsheet.html"),
            ("Commitment card worksheet", "courses/emotional-intelligence/worksheet.html")
        ],
        "learner": "courses/emotional-intelligence/",
        "facilitator": "courses/emotional-intelligence/facilitator/",
        "frameworks": "Grounded in Goleman's 'What Makes a Leader?' (HBR) and four-domain model, the Mayer-Salovey-Caruso ability model, Tasha Eurich's self-awareness research, Lieberman et al.'s affect-labeling studies (UCLA, Psychological Science 2007), Luft & Ingham's Johari Window, Rosenberg's Nonviolent Communication, and Amy Edmondson's psychological safety research with Google's Project Aristotle."
    },
    {
        "slug": "building-brave-teams",
        "coreSkills": ['Radically collaborates and cultivates belonging'],
        "skills": ['Psychological Safety', 'Team Building', 'Trust Building'],
        "title": "Building Brave Teams",
        "subtitle": "The team-building workshop on psychological safety",
        "audience": "All Vanderbilt staff; intact teams get the most from it, and it works equally well as an open-enrollment session",
        "length": "Classroom: 120 minutes (90-minute core path). Self-paced web edition: about 60 minutes",
        "format": "Instructor-led, in person or virtual; learners join on their own devices via QR code. Built around live team exercises: a safety diagnostic, Johari pairs, team-built grids with a gallery walk, and a triad rehearsal",
        "group": "8 to 30 works best; intact teams sit together, and the rehearsal runs in triads",
        "description": "The workshop opens where commitment starts: with why. Learners hear the Chancellor's charge, then build their own why live using Simon Sinek's Golden Circle (why, how, what), because borrowed whys don't survive hard weeks. From there it makes the case for the how: Google spent five years studying what separates its best teams and the answer was not who is on the team; it was psychological safety, whether people can speak up without paying for it. The evidence runs from Edmondson's hospital studies, where better units reported more errors because reporting was safe, to the Challenger cockpit, where silence had a body count. Teams then diagnose themselves with Edmondson's actual 7-item survey and place their team on Clark's four-stage ladder. The middle is practice: the Johari Window in pairs to expand the Open quadrant, team-built Expand/Contract grids naming the behaviors that grow or quietly shrink safety, and a three-round Candor Rehearsal delivering real feedback with SBI + Ask. It closes with a commitment ritual: one start, one stop, and one question each person's team will hear within 14 days",
        "objectives": [
            "Define psychological safety, and tell it apart from being nice, lowering the bar, or needing consensus",
            "Diagnose your team's current stage using Clark's ladder and Edmondson's 7-item survey",
            "Explain why safety predicts performance, using the evidence from hospitals, cockpits, and Google",
            "Practice disclosure and feedback with the Johari Window, and expand your Open quadrant",
            "Differentiate behaviors that expand safety from the ones that quietly contract it, then deliver candid feedback with SBI + Ask",
            "Commit to one start, one stop, and one question your team will hear within 14 days"
        ],
        "topics": [
            ("The Chancellor's charge", "The institutional mission, stated plainly, as the frame for everything the team builds next"),
            ("Our why (Golden Circle)", "Simon Sinek's why, how, what from the inside out, with his TED talk and a live builder where each learner drafts their own why"),
            ("The case", "Edmondson's medication-error finding, the Challenger and cockpit evidence, and Google's Project Aristotle: safety predicts performance"),
            ("What safety is and is not", "A working definition, and the four look-alikes it gets confused with: niceness, low standards, consensus, comfort"),
            ("Clark's four stages", "Included, learner, contributor, challenger: a ladder teams climb in order, diagnosed live"),
            ("The team diagnostic", "Edmondson's 7-item survey, the same instrument used in the research, scored and discussed by the team"),
            ("The Johari Window", "Disclosure and feedback in pairs; the Open quadrant grows only when both move"),
            ("Expand and contract", "Team-built grids of the behaviors that grow safety and the ones that quietly shrink it, shared in a gallery walk"),
            ("The Candor Rehearsal", "Three rounds of real feedback in triads with SBI + Ask, because candor is a skill, not a trait"),
            ("The commitment ritual", "One start, one stop, one question, written, spoken, and dated within 14 days")
        ],
        "activities": "A Golden Circle builder (why, how, what), a stat-guessing evidence game, an is-it-safety sorter, a live team diagnostic on Edmondson's 7-item survey, a Johari Window pair exercise with peer stickies, team-built Expand/Contract grids with a gallery walk, a three-round triad Candor Rehearsal, inline knowledge checks, a scored recap, and the start-stop-question commitment capstone.",
        "outcomes": "Learners leave with a dated commitment card: one behavior to start, one to stop, and one question their team will hear within 14 days, plus their team's diagnostic score and stage. Learning is measured in session (trainer scores, the diagnostic, and a recap mapped to the objectives), at close (a fist-to-five confidence check and the spoken commitment round), and after (a 14-day pulse on whether the team heard the question).",
        "takehomes": [
            ("Printable cheat sheet", "courses/building-brave-teams/cheatsheet.html"),
            ("Commitment worksheet", "courses/building-brave-teams/worksheet.html")
        ],
        "learner": "courses/building-brave-teams/",
        "facilitator": "courses/building-brave-teams/facilitator/",
        "frameworks": "Grounded in Amy Edmondson's psychological safety research (Administrative Science Quarterly 1999, The Fearless Organization) and her 7-item team survey, Google's Project Aristotle, Timothy R. Clark's The 4 Stages of Psychological Safety, Luft & Ingham's Johari Window, Tuckman's group development model, SBI + Ask feedback from the Center for Creative Leadership lineage, and Simon Sinek's Golden Circle (Start With Why)."
    },
    {
        "slug": "presentation-public-speaking",
        "coreSkills": ['Continuously strives for excellence'],
        "skills": ['Public Speaking', 'Storytelling', 'Strategic Communication', 'Stakeholder Communications'],
        "title": "Presentation & Public Speaking",
        "subtitle": "Building and delivering to a room or leadership audience",
        "audience": "Part of the Manager Voyage program. Managers, senior ICs, and leaders who present to teams, stakeholders, or executive and board audiences",
        "length": "Classroom: 90 minutes (60-minute core path). Self-paced web edition: about 45 minutes",
        "format": "Instructor-led, in person or virtual; learners join on their own devices via QR code. Practice-heavy: everyone speaks out loud at least once. Pre-work: bring one real upcoming presentation",
        "group": "8 to 20 works best so every participant gets a live speaking rep with feedback",
        "description": "Public speaking is not most people's top fear anymore, the 2024 Chapman Survey ranks it 59th of 85, behind sharks. What actually separates forgettable presenters from ones a room remembers is structure and presence, and both are learnable. This session opens with that myth-busting evidence and the career stakes (Coqual found 67 percent of senior executives name gravitas as the core signal of leadership readiness; Deloitte's CFOs rank communication skills the #1 quality in a successor). Then it builds: Duarte's Big Idea distills a real presentation into one sentence of point-of-view-plus-stakes; her Sparkline shapes it for hearts and minds; Minto's SCQA and Pyramid Principle restructure it for the executive room, leading with the answer. Delivery technique comes from Chris Anderson, Carmine Gallo, and the AMA's Seven Principles, drilled in a live, strictly-timed speaking round where every participant delivers their Big Idea and opening line for one piece of framework-anchored feedback. It closes with tough-question handling, the AMA bridge, under rapid fire, and a capstone that rebuilds one real upcoming presentation with the opening line written word for word.",
        "objectives": [
            "Explain why gravitas and communication, not technical mastery alone, decide how a leader's message lands, and name your own executive-presence growth edge",
            "Distill a real presentation topic into one resonant sentence using Duarte's Big Idea: point of view plus what's at stake",
            "Structure a presentation with Duarte's Sparkline, alternating What Is and What Could Be toward New Bliss",
            "Structure an executive briefing with Minto's Pyramid Principle and SCQA, leading with the answer",
            "Apply the delivery techniques of Anderson's and Gallo's HBR frameworks and the AMA's Seven Principles in a live, timed speaking round",
            "Handle pointed questions with the acknowledge-answer-return bridge, and commit to rebuilding one real presentation with the opening line written"
        ],
        "topics": [
            ("The myth and the case", "Chapman's fear data (public speaking: 59th of 85), Coqual's gravitas finding, and Deloitte's CFO communication stat, played as a guessing game"),
            ("Executive presence", "Hewlett's three pillars, gravitas 67%, communication 28%, appearance 5%, and each learner's growth edge"),
            ("The Big Idea", "Duarte's one-sentence discipline: a point of view someone could oppose, plus what's at stake, drafted privately for a real talk"),
            ("The Sparkline", "What Is alternating with What Could Be, ending in New Bliss, the shape under MLK's Dream speech and the great product launches"),
            ("SCQA and the Pyramid Principle", "Minto's executive structure: Situation, Complication, Question, Answer-first, practiced in a graded briefing lab"),
            ("Delivery", "Anderson's five keys, Gallo's five tips, and AMA's Seven Principles, applied in a live 60-to-90-second speaking round with peer feedback"),
            ("The tough question", "The AMA bridge, acknowledge, answer directly, return to the Big Idea, drilled under rapid fire from a mock executive")
        ],
        "activities": "A research guessing game, a pillar-spotting trainer, a topic-or-Big-Idea judge plus a private Big Idea drafter, a Sparkline beat tagger, a graded SCQA Exec Briefing Lab where the executive room reacts to each choice, a delivery-fix trainer, a live timed speaking round for every participant, a judge-the-bridge Q&A trainer with live rapid fire, inline knowledge checks, a scored recap, and the Presentation Rebuild capstone.",
        "outcomes": "Learners leave with one real presentation rebuilt: a one-sentence Big Idea, a structure chosen for the actual audience (Sparkline or SCQA), the literal opening line written and spoken aloud, one deck vice named and cut, and a rehearsal committed. Learning is measured in session (trainer scores, the graded briefing lab, a recap mapped to the six objectives, and the live round itself), at close (readiness check and a spoken structure-plus-opening-line commitment), and after (a 7-day pulse on the delivered talk and a 30/60/90-day structure check on whether decks are shifting from bullet-heavy to story-led and answer-first).",
        "takehomes": [
            ("Printable cheat sheet", "courses/presentation-public-speaking/cheatsheet.html"),
            ("Rebuild worksheet", "courses/presentation-public-speaking/worksheet.html")
        ],
        "learner": "courses/presentation-public-speaking/",
        "facilitator": "courses/presentation-public-speaking/facilitator/",
        "frameworks": "Grounded in Nancy Duarte's Presentation Principles (Big Idea™, Presentation Sparkline™; TEDxEast), Barbara Minto's Pyramid Principle and SCQA (McKinsey), Chris Anderson's 'How to Give a Killer Presentation' (HBR/TED), Carmine Gallo's 'What It Takes to Give a Great Presentation' (HBR), the AMA's Seven Principles of Effective Public Speaking and Effective Executive Speaking curriculum, SHRM's six pre-speaking questions, Coqual/Hewlett's Executive Presence research, Deloitte's CFO Signals survey, and the Chapman Survey of American Fears."
    },
    {
        "slug": "workflow-process-redesign",
        "coreSkills": ['Embodies an entrepreneurial spirit and leverages data and technology', 'Leads and inspires teams'],
        "skills": ['Process Mapping', 'AI Literacy', 'Change Management'],
        "title": "Workflow & Process Redesign",
        "subtitle": "Redesign the work, then add the AI",
        "audience": "Part of the Manager Voyage program. Managers, team leads, and project owners: anyone who owns a repeating team workflow and is deciding where AI fits in it",
        "length": "Classroom: 90 minutes (60-minute core path). Self-paced web edition: about 45 minutes",
        "format": "Instructor-led, in person or virtual; learners join on their own devices via QR code. Private by design: exercises use workflows and roles (never names) and nothing typed is saved or transmitted",
        "group": "8 to 24 works best (the mapping and assignment drills run in pairs); scales larger with room votes",
        "description": "Nearly nine in ten organizations now use AI, and only around six percent get meaningful bottom-line value from it. McKinsey's State of AI research found the strongest thing separating the two, out of everything measured, is fundamentally redesigned workflows, and that work happens at the manager's level. This session teaches the method end to end. It opens with the evidence played as a guessing game, then teaches managers to see their team's work as a step map (gather, transform, judge, commit) and to map one real workflow privately. The core is the draft-verify-decide pattern: for every step, one assignment, AI drafts the volume, a named human verifies against real sources, a human decides wherever accountability lives, bounded by the shared data traffic light. A full section on verification design covers automation bias, rubber stamps, and checks with teeth. Learners then rebuild a realistic weekly-report workflow in the graded Redesign Lab and watch their design succeed or fail at week three, before the final section on running a pilot the team will trust: doers design the checks, the metric stays visible, and the saved hours get an honest purpose. Every learner leaves with a redesign card: one workflow, one draft step, one dated team mapping session.",
        "objectives": [
            "Explain why workflow redesign separates AI high performers from the crowd seeing no bottom-line impact",
            "Map one of your team's workflows into steps and separate the mechanical work from the judgment work",
            "Apply the draft-verify-decide pattern to assign every step: AI drafts, a human verifies, a human decides",
            "Design verification with teeth: a named owner, real sources, and a reject path that gets used",
            "Build a redesign card for one real workflow and commit to a piloted first step with a visible metric"
        ],
        "topics": [
            ("The case for redesign", "McKinsey's State of AI numbers played as a guessing game: 88 percent adoption, about 6 percent high performers, redesign as the strongest EBIT factor, 2.8x"),
            ("See the work as a process", "Step maps and the four step types (gather, transform, judge, commit), with a private mapper for one real team workflow"),
            ("Draft, verify, decide", "The per-step assignment pattern, made once at design time, bounded by the green/yellow/red data traffic light"),
            ("Design the verify", "Automation bias, rubber stamps, wrong-sized checks, and the verifier's rubric: named owner, real sources, logged reject path"),
            ("The Redesign Lab", "A graded rebuild of the weekly client report: four steps, four assignments, and a four-week simulated outcome"),
            ("Bring the team along", "The pilot standard: doers design the checks, a visible metric, a real rollback, and an honest answer about the saved hours")
        ],
        "activities": "A guess-the-number research game, a step-type trainer, a private workflow mapper, an assignment trainer, a rate-the-check trainer, a judge-the-announcement trainer, the graded Redesign Lab with rerun, inline knowledge checks, a scored recap, and the My Redesign Card capstone.",
        "outcomes": "Learners leave with a dated redesign card: one real workflow, the first step AI will draft, a named failure mode to avoid, and a 30-minute team mapping session within seven days, plus a pilot metric (hours saved and errors caught). Learning is measured in session (trainer scores, the graded lab, and a recap mapped to the objectives), at close (a confidence check and a spoken workflow-and-day commitment round), and after (a 7-day pulse on mapping sessions held and a 30-day re-poll on workflow cost and catches).",
        "takehomes": [
            ("Printable cheat sheet", "courses/workflow-process-redesign/cheatsheet.html"),
            ("Redesign card worksheet", "courses/workflow-process-redesign/worksheet.html")
        ],
        "learner": "courses/workflow-process-redesign/",
        "facilitator": "courses/workflow-process-redesign/facilitator/",
        "frameworks": "Grounded in McKinsey's State of AI global survey (workflow redesign as the strongest measured link to EBIT impact from gen AI), automation-bias research on human oversight of automated systems, and classic process-mapping practice. The data rules align with the traffic light taught in Start Smarter and AI 201."
    },
    {
        "slug": "ai-coaching-feedback",
        "coreSkills": ['Grows self and others', 'Embodies an entrepreneurial spirit and leverages data and technology'],
        "skills": ['Coaching Techniques', 'Performance Feedback', 'AI Literacy'],
        "title": "Feedback, Ready",
        "subtitle": "Prep like a coach, show up human",
        "audience": "Part of the Manager Voyage program and the AI-enabled Education Series. People managers and team leads who run 1:1s, give feedback, and want AI's help preparing without losing the human conversation",
        "length": "Classroom: 40 minutes (30-minute core path). Self-paced web edition: about 15 minutes",
        "format": "Instructor-led, in person or virtual; learners join on their own devices via QR code. Private by design: exercises use roles (never names) and nothing typed is saved or transmitted",
        "group": "8 to 24 works best; the drills run in pairs",
        "description": "SHRM's workplace research finds managers' work is already about 50 percent AI-assisted (versus 34 percent for individual contributors), and coaching platforms like Culture Amp's AI Coach, Lattice, and 15Five now embed AI into the flow of people work. This short session installs the discipline that separates good use from bad in one line: AI preps the conversation, and you have it. Learners drill the prep-outsource boundary on five real manager moves, run the graded Feedback Prep Lab (what you feed it, what you ask for, what you do with the draft, and what happens in the room) built on Situation-Behavior-Impact, and learn to mine aggregate signals, engagement survey themes and their own 1:1 notes, for coaching opportunities without crossing into surveillance. The data rules run throughout: de-identify first, approved VU tools only, behavior not character, aggregate not individual. Every learner leaves with a prep card for a real upcoming conversation.",
        "objectives": [
            "Explain the prep-not-outsource line: what AI can prepare, and why the conversation itself never delegates",
            "Draft behavior-based feedback with AI from your own de-identified observations, structured as Situation, Behavior, Impact",
            "Use AI on aggregate signals to surface coaching opportunities without crossing into surveillance",
            "Build a prep card for one real upcoming conversation, with the privacy rules attached"
        ],
        "topics": [
            ("Prep, not outsource", "The line between AI that sharpens conversations and AI that replaces you in them, drilled on five manager moves, with the traffic-light data rules"),
            ("The feedback draft", "SBI structure and the graded Feedback Prep Lab: input, ask, rewrite pass, and the human conversation"),
            ("Signals, not surveillance", "Aggregate survey themes and your own 1:1 notes as coaching radar, bounded by the two-question test: aggregate or individual, and would you tell the team?")
        ],
        "activities": "A prep-or-outsource trainer, the graded Feedback Prep Lab, a signal-or-surveillance trainer, inline knowledge checks, a scored recap, and the 1:1 Prep Card capstone.",
        "outcomes": "Learners leave with a dated prep card: one real conversation (role, not name), one prep move (rehearsal, SBI draft, notes mine, or themes move), one named failure mode to avoid, and the privacy rules attached. Learning is measured in session (trainer scores and the graded lab), at close (fist-to-five and a spoken role-and-day commitment), and after (a 7-day pulse on prepped conversations actually held).",
        "takehomes": [
            ("Printable cheat sheet", "ai-coaching-feedback/cheatsheet.html"),
            ("Prep card worksheet", "ai-coaching-feedback/worksheet.html")
        ],
        "learner": "ai-coaching-feedback/",
        "facilitator": "ai-coaching-feedback/facilitator/",
        "frameworks": "Grounded in SHRM's Navigating AI in the Workplace research, the Center for Creative Leadership's Situation-Behavior-Impact feedback model, and the embedded-coaching-AI market context (Culture Amp AI Coach, Lattice, 15Five). Data rules align with the traffic light taught in Start Smarter and AI 201."
    },
    {
        "slug": "ai-talent-decisions",
        "coreSkills": ['Makes effective and ethical decisions for the University', 'Grows self and others'],
        "skills": ['Structured Interviewing', 'Succession Planning', 'Skills Mapping'],
        "title": "Talent Calls, Sharper",
        "subtitle": "Sharper talent inputs, human talent calls",
        "audience": "Part of the Manager Voyage program and the AI-enabled Education Series. Leaders and managers who hire, run talent reviews, plan succession, or own team capability. Anything candidate-facing runs with HR; the course says so repeatedly",
        "length": "Classroom: 40 minutes (30-minute core path). Self-paced web edition: about 15 minutes",
        "format": "Instructor-led, in person or virtual; learners join on their own devices via QR code. Exercises use roles and rubrics, never names; nothing typed is saved or transmitted",
        "group": "8 to 24 works best; the drills run in pairs",
        "description": "Leaders now use AI across the talent pipeline: screening, structured interview design, skills inference, succession planning, internal matching. These are the highest-stakes decisions a manager makes, about people, with bias risk and identifying data everywhere, and automated employment decisions are increasingly regulated territory. This session teaches the one discipline that keeps talent AI useful and defensible: AI drafts the instruments (structured interview kits from the job description, 9-box rubrics with behavioral anchors, de-identified skills maps, succession profiles) and every verdict about a person stays human. Learners sort five real talent tasks against the line, build a defensible 9-box in the graded Rubric Lab (source, criteria, anchors, scoring), learn the camera test that catches bias magnets like culture fit and polish, and run the skills-map recipe with grow-borrow-hire gap closing. The strictest data rules in the series apply: resumes, reviews, and names never enter unapproved tools.",
        "objectives": [
            "Identify which talent tasks AI can draft (instruments, questions, maps) and which stay human calls, always",
            "Build a behaviorally anchored rubric for interviews or a 9-box, with AI stress-testing your criteria",
            "Draft structured interview questions from a real job description, with anchored scoring",
            "Map your team's skills against goals, de-identified, and draft a gap-closing development plan"
        ],
        "topics": [
            ("Instruments, not verdicts", "The line that keeps talent AI defensible, drilled on five tasks, with the red-light data rules and the HR partnership requirement"),
            ("The Rubric Lab", "A graded 9-box build: source, observable criteria, behavioral anchors, and independent human scoring; the same build makes the interview kit"),
            ("Skills, gaps, and growth", "De-identified skills maps, inference as draft, grow-borrow-hire gap closing, and succession profiles without names")
        ],
        "activities": "A draft-call-or-keep-it-out trainer, the graded Rubric Lab, a useful-and-safe skills trainer, inline knowledge checks, a scored recap, and the Talent Toolkit Card capstone.",
        "outcomes": "Learners leave with a dated toolkit card: one talent decision, one instrument to build (interview kit, 9-box rubric, skills map, or succession profile), one named failure mode to avoid, and a 45-minute build session with the stranger-could-score standard. Learning is measured in session (trainer scores and the graded lab), at close (fist-to-five and a spoken instrument-and-day commitment), and after (a 7-day pulse on instruments actually built).",
        "takehomes": [
            ("Printable cheat sheet", "ai-talent-decisions/cheatsheet.html"),
            ("Toolkit card worksheet", "ai-talent-decisions/worksheet.html")
        ],
        "learner": "ai-talent-decisions/",
        "facilitator": "ai-talent-decisions/facilitator/",
        "frameworks": "Grounded in industry coverage of AI across the talent pipeline (People Managing People; Rework), the validity research behind structured interviews and behaviorally anchored rating scales, and the emerging bias-audit regulation for automated employment decision tools. Data rules align with the traffic light taught in Start Smarter and AI 201."
    },
    {
        "slug": "leading-ai-adoption",
        "coreSkills": ['Leads and inspires teams', 'Embodies an entrepreneurial spirit and leverages data and technology'],
        "skills": ['Change Management', 'AI Literacy', 'Team Development'],
        "title": "Leading the Shift",
        "subtitle": "Your team adopts what you model",
        "audience": "Part of the Manager Voyage program and the AI-enabled Education Series. Managers and team leads who want their teams actually using AI well, safely and openly. Pairs naturally with Workflow & Process Redesign",
        "length": "Classroom: 40 minutes (30-minute core path). Self-paced web edition: about 15 minutes",
        "format": "Instructor-led, in person or virtual; learners join on their own devices via QR code. The work audit stays entirely on the learner's screen; nothing typed is saved or transmitted",
        "group": "8 to 24 works best; drills run in pairs",
        "description": "Gallup's workplace research keeps finding the same two predictors of a team actually using AI: the manager visibly championing it, and the tools being integrated into real workflows. Tools, budgets, and mandates barely move the needle, and Accenture finds only about 18 percent of leaders are doing this well, separated by curiosity, courage, and connection. This session teaches the visible moves: the narrated use (what you used AI for, what the check caught, what you'd do differently), the monthly show-your-prompts round, and the three written guardrails that make it safe for a team to try: what data goes in (the traffic light), when a human signs off, and who owns the result. The signature block is the AI-enabled work audit: five honest, scored questions about the learner's real team (repeated outputs, usage state, visible modeling, guardrails, and whether AI enters coaching conversations), producing a score out of 12 and the three highest-leverage moves ranked by weakest dimension. Every learner leaves with a dated first visible move, measured by rerunning the audit in a month.",
        "objectives": [
            "Explain why manager modeling and workflow integration predict team AI use better than tools or mandates",
            "Model AI use visibly: narrate real uses, show the checks, share the misses",
            "Set the three team guardrails: what data goes in, when human sign-off is required, who owns the result",
            "Run the AI-enabled work audit on your team and leave with a dated first move"
        ],
        "topics": [
            ("Model it, visibly", "Gallup's two predictors, Accenture's three C's, and the narrated-use move, drilled on five leader behaviors"),
            ("The three guardrails", "Data, sign-off, ownership: one page written with the team, with amnesty for existing shortcuts; incidents diagnosed to their missing rail"),
            ("The AI-enabled work audit", "Five scored questions on the team's real AI state, with the three highest-leverage moves ranked by weakest dimension and a quarterly cadence")
        ],
        "activities": "A model-mandate-or-undermine trainer, a which-rail-is-missing trainer, the scored AI-enabled work audit, inline knowledge checks, a scored recap, and the Adoption Plan capstone.",
        "outcomes": "Learners leave with a scored audit of their own team and a dated adoption plan: the work they'll model on, one visible first move (narrated use, show-your-prompts round, guardrails session, or the 1:1 question), one named failure mode to avoid, and the audit rerun as the metric. Learning is measured in session (trainer scores and the completed audit), at close (fist-to-five and a spoken move-and-day commitment), and after (a 7-day pulse on first moves made and a 30-day audit rerun).",
        "takehomes": [
            ("Printable cheat sheet", "leading-ai-adoption/cheatsheet.html"),
            ("Audit + plan worksheet", "leading-ai-adoption/worksheet.html")
        ],
        "learner": "leading-ai-adoption/",
        "facilitator": "leading-ai-adoption/facilitator/",
        "frameworks": "Grounded in Gallup's 2026 workplace AI research (manager championing and workflow integration as top drivers of frequent use) and Accenture's AI leadership research (~18 percent leading well; curiosity, courage, connection). The data guardrail is the traffic light taught in Start Smarter and AI 201, verbatim."
    },
]

COURSES += GAP_COURSES

CSS = """
  @font-face { font-family: 'Libre Caslon Display'; font-style: normal; font-weight: 400;
    src: url('assets/fonts/libre-caslon-display-latin-400-normal.woff2') format('woff2'); }
  @font-face { font-family: 'Inter'; font-style: normal; font-weight: 400;
    src: url('assets/fonts/inter-latin-400-normal.woff2') format('woff2'); }
  @font-face { font-family: 'Inter'; font-style: normal; font-weight: 600;
    src: url('assets/fonts/inter-latin-600-normal.woff2') format('woff2'); }
  @font-face { font-family: 'Antonio'; font-style: normal; font-weight: 700;
    src: url('assets/fonts/antonio-latin-700-normal.woff2') format('woff2'); }
  * { box-sizing: border-box; }
  body { margin: 0; font-family: 'Inter', Arial, sans-serif; color: #1C1C1C; background: #fff;
    font-size: 13px; line-height: 1.5; }
  .sheet { max-width: 820px; margin: 0 auto; padding: 28px 32px; }
  header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px;
    border-bottom: 2px solid #CFAE70; padding-bottom: 14px; margin-bottom: 16px; }
  header img { width: 150px; flex-shrink: 0; }
  h1 { font-family: 'Libre Caslon Display', 'Times New Roman', serif; font-weight: 400;
    font-size: 27px; margin: 0; line-height: 1.15; }
  h1 em { font-style: italic; color: #946E24; }
  .eyebrow { font-family: 'Antonio', Impact, sans-serif; font-weight: 700; text-transform: uppercase;
    letter-spacing: .08em; font-size: 10px; color: #946E24; margin: 0 0 6px; }
  .subtitle { margin: 4px 0 0; color: #555; font-size: 14px; }
  .facts { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px 20px; margin: 0 0 16px;
    border: 1px solid #E4E4E4; border-radius: 4px; padding: 12px 14px; }
  .facts div b { display: block; font-family: 'Antonio', Impact, sans-serif; font-weight: 700;
    text-transform: uppercase; letter-spacing: .06em; font-size: 10px; color: #946E24; }
  h2 { font-family: 'Antonio', Impact, sans-serif; font-weight: 700; text-transform: uppercase;
    letter-spacing: .06em; font-size: 13px; color: #946E24; margin: 18px 0 6px; }
  p { margin: 0 0 8px; }
  ol, ul { margin: 0 0 8px; padding-left: 20px; }
  li { margin-bottom: 4px; }
  .topics li b { font-weight: 600; }
  .frameworks { color: #555; font-size: 12px; font-style: italic; }
  .links { border: 1px solid #CFAE70; background: #fdf9ef; border-radius: 4px; padding: 12px 14px; margin-top: 14px; }
  footer { margin-top: 16px; border-top: 1px solid #E4E4E4; padding-top: 10px; font-size: 11px; color: #777;
    display: flex; justify-content: space-between; flex-wrap: wrap; gap: 8px; }
  a { color: #946E24; }
  .pills { display: flex; flex-wrap: wrap; gap: 5px; margin: 0 0 4px; }
  .pill { display: inline-block; font-family: 'Antonio', Impact, sans-serif; font-weight: 700;
    text-transform: uppercase; letter-spacing: .05em; font-size: 9.5px; line-height: 1.4;
    padding: 3px 9px; border-radius: 999px; border: 1px solid rgba(148,110,36,.5); color: #946E24; }
  .pill--core { background: #CFAE70; border-color: #CFAE70; color: #1C1C1C; }
  .printbtn { position: fixed; right: 18px; top: 18px; background: #CFAE70; border: 0; border-radius: 4px;
    padding: 9px 16px; font-family: Inter, Arial, sans-serif; font-weight: 600; font-size: 13px; cursor: pointer; }
  @media print { .printbtn { display: none; } body { font-size: 11.5px; } .sheet { padding: 0; max-width: none; }
    .links { break-inside: avoid; } }
  @media (max-width: 640px) { .facts { grid-template-columns: 1fr; } header { flex-direction: column; } }
"""

def esc(t):
    return html.escape(t, quote=False)

def build(c):
    objectives = ''.join(f'<li>{esc(o)}</li>' for o in c['objectives'])
    pills = ''.join(f'<span class="pill pill--core">{esc(x)}</span>' for x in c.get('coreSkills', [])) + \
            ''.join(f'<span class="pill">{esc(x)}</span>' for x in c.get('skills', []))
    topics = ''.join(f'<li><b>{esc(t)}.</b> {esc(d)}</li>' for t, d in c['topics'])
    takehomes = ' · '.join(f'<a href="{u}">{esc(n)}</a>' for n, u in c['takehomes'])
    link_lines = [
        f'<b>Take the course:</b> <a href="{c["learner"]}">{c["learner"].replace("https://","")}</a>',
        f'<b>Deliver it (facilitator edition):</b> <a href="{c["facilitator"]}">{c["facilitator"].replace("https://","")}</a>'
    ]
    if c.get('selfpaced'):
        link_lines.append(f'<b>Self-paced edition:</b> <a href="{c["selfpaced"]}">{c["selfpaced"].replace("https://","")}</a>')
    if takehomes:
        link_lines.append(f'<b>Take-homes:</b> {takehomes}')
    links = '<br>\n    '.join(link_lines)
    title_words = c['title'].rsplit(' ', 1)
    h1 = f'{esc(title_words[0])} <em>{esc(title_words[1])}</em>' if len(title_words) == 2 else esc(c['title'])
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{esc(c['title'])} · Course Description | Vanderbilt</title>
<meta name="robots" content="noindex">
<style>{CSS}</style>
<!-- Vercel Web Analytics (vercel-analytics): served only by Vercel, so it is skipped on GitHub Pages -->
<script>
  window.va = window.va || function () {{ (window.vaq = window.vaq || []).push(arguments); }};
  if (!/(^|\.)github\.io$/.test(location.hostname)) {{
    var vaScript = document.createElement('script');
    vaScript.defer = true;
    vaScript.src = '/_vercel/insights/script.js';
    document.head.appendChild(vaScript);
  }}
</script>
</head>
<body>
<button class="printbtn" onclick="window.print()">Print / Save as PDF</button>
<div class="sheet">
  <header>
    <div>
      <p class="eyebrow">Vanderbilt · Staff Learning Collection · Course description</p>
      <h1>{h1}</h1>
      <p class="subtitle">{esc(c['subtitle'])}</p>
    </div>
    <img src="assets/img/vu-lockup-black.png" alt="Vanderbilt University">
  </header>

  <div class="facts">
    <div><b>Audience</b>{esc(c['audience'])}</div>
    <div><b>Length</b>{esc(c['length'])}</div>
    <div><b>Format</b>{esc(c['format'])}</div>
    <div><b>Group size</b>{esc(c['group'])}</div>
  </div>

  <h2>Skills this course builds</h2>
  <div class="pills">{pills}</div>

  <h2>About this course</h2>
  <p>{esc(c['description'])}</p>

  <h2>Learning objectives</h2>
  <p>By the end of this session, participants will be able to:</p>
  <ol>{objectives}</ol>

  <h2>Topics covered</h2>
  <ul class="topics">{topics}</ul>

  <h2>How you'll learn</h2>
  <p>{esc(c['activities'])} Every section pairs teaching with something to do; nothing is watch-only. Private exercises stay on the learner's screen and are never collected.</p>

  <h2>Outcomes and how learning is measured</h2>
  <p>{esc(c['outcomes'])}</p>

  <p class="frameworks">{esc(c['frameworks'])}</p>

  <div class="links">
    {links}
  </div>

  <footer>
    <span>Vanderbilt Learning Series · <a href="./">Course Library</a></span>
    <span>Questions? <a href="mailto:chart@vanderbilt.edu">chart@vanderbilt.edu</a></span>
  </footer>
</div>
<script>
  /* Printed syllabi show the course address; resolve it from wherever this site is served
     so the printout is correct on any domain. */
  document.querySelectorAll('a[href]').forEach(function (a) {{
    if (/^(me5231979\.github\.io|https?:\/\/)/.test(a.textContent.trim())) {{
      a.textContent = a.href.replace(/^https?:\/\//, '');
    }}
  }});
</script>
</body>
</html>
"""

for c in COURSES:
    out = os.path.join(ROOT, f"syllabus-{c['slug']}.html")
    open(out, 'w').write(build(c))
    print(f"wrote {out}")
