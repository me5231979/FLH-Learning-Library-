/* =====================================================================
   PEOPLE DATA WITH AI, classroom deck
   interactions (vanilla JS, no dependencies)
   ===================================================================== */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isTouch = window.matchMedia('(hover: none)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- Nav: scroll state, mobile toggle, active link ---------- */
  var nav = $('.nav');
  var toggle = $('.nav__toggle');
  var links = $('.nav__links');
  window.addEventListener('scroll', function () {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });
  if (toggle) {
    toggle.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
    });
    $$('.nav__links a').forEach(function (a) {
      a.addEventListener('click', function () {
        links.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- Reveal on scroll ---------- */
  var revEls = $$('[data-reveal]');
  if ('IntersectionObserver' in window && !reduce) {
    var revObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); revObs.unobserve(e.target); }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
    revEls.forEach(function (el) { revObs.observe(el); });
    // elements already on screen at load can sit inside the observer's
    // excluded margin: reveal them directly
    requestAnimationFrame(function () {
      revEls.forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.top < window.innerHeight && r.left < window.innerWidth && r.right > 0) {
          el.classList.add('in'); revObs.unobserve(el);
        }
      });
    });
  } else {
    revEls.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- Manifesto word-by-word reveal ---------- */
  $$('.manifesto p').forEach(function (p) {
    var words = p.textContent.trim().split(/\s+/);
    p.innerHTML = words.map(function (w) { return '<span class="w">' + w + '</span>'; }).join(' ');
  });
  if ('IntersectionObserver' in window && !reduce) {
    var wObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var ws = $$('.w', e.target);
        ws.forEach(function (w, i) { setTimeout(function () { w.classList.add('lit'); }, i * 55); });
        wObs.unobserve(e.target);
      });
    }, { threshold: 0.5 });
    $$('.manifesto').forEach(function (m) { wObs.observe(m); });
  }

  /* ---------- Welcome slide: QR code ---------- */
  var qrBox = $('#qrBox');
  if (qrBox && typeof qrcode === 'function') {
    // Encodes the deployed URL. Override by setting data-url on #qrCard.
    var qrCard = $('#qrCard');
    var qrTarget = (qrCard && qrCard.getAttribute('data-url')) ||
      (location.protocol === 'file:' ? '' : location.origin + location.pathname);
    var qrUrlEl = $('#qrUrl');
    if (qrTarget) {
      try {
        var qr = qrcode(0, 'M');
        qr.addData(qrTarget);
        qr.make();
        qrBox.innerHTML = qr.createSvgTag({ scalable: true, margin: 2 });
        if (qrUrlEl) qrUrlEl.textContent = qrTarget.replace(/^https?:\/\//, '').replace(/\/$/, '');
      } catch (err) {
        qrBox.parentElement.style.display = 'none';
      }
    } else {
      if (qrUrlEl) qrUrlEl.textContent = 'QR appears when the site is hosted';
      qrBox.innerHTML = '<div style="width:100%;aspect-ratio:1;display:grid;place-items:center;border:1px dashed #E4E4E4;color:#777;font-family:Inter,Arial,sans-serif;font-size:.8rem;padding:1rem;text-align:center">Deploy to generate the QR code</div>';
    }
  }

  /* ---------- Hero ambient particles ---------- */
  var canvas = $('.hero__canvas');
  if (canvas && !reduce && !isTouch) {
    var ctx = canvas.getContext('2d');
    var W, H, parts = [];
    var size = function () {
      W = canvas.width = canvas.offsetWidth * (window.devicePixelRatio > 1 ? 2 : 1);
      H = canvas.height = canvas.offsetHeight * (window.devicePixelRatio > 1 ? 2 : 1);
    };
    size(); window.addEventListener('resize', size);
    for (var i = 0; i < 46; i++) {
      parts.push({ x: Math.random() * 1, y: Math.random() * 1, r: Math.random() * 1.6 + 0.4,
        vy: (Math.random() * 0.00018 + 0.00006), vx: (Math.random() - 0.5) * 0.00008,
        a: Math.random() * 0.5 + 0.2 });
    }
    (function draw() {
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i];
        p.y -= p.vy; p.x += p.vx;
        if (p.y < -0.05) { p.y = 1.05; p.x = Math.random(); }
        ctx.beginPath();
        ctx.arc(p.x * W, p.y * H, p.r * (window.devicePixelRatio > 1 ? 2 : 1), 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(207,174,112,' + p.a + ')';
        ctx.fill();
      }
      requestAnimationFrame(draw);
    })();
  } else if (canvas) { canvas.style.display = 'none'; }

  /* ---------- INTERACTIVE: knowledge check quizzes ---------- */
  $$('[data-quiz]').forEach(function (root) {
    $$('.quiz__options', root).forEach(function (group) {
      var answered = false;
      var fb = group.parentElement.querySelector('.quiz__feedback');
      $$('.opt', group).forEach(function (opt) {
        opt.addEventListener('click', function () {
          if (answered) return; answered = true;
          var correct = opt.getAttribute('data-correct') === '1';
          $$('.opt', group).forEach(function (o) {
            o.setAttribute('disabled', 'true');
            if (o.getAttribute('data-correct') === '1') o.classList.add('correct');
          });
          if (!correct) opt.classList.add('wrong');
          if (fb) {
            fb.classList.add('show');
            fb.textContent = (correct ? '✓ Correct. ' : '✗ Not quite. ') + (opt.getAttribute('data-why') || '');
            fb.style.color = correct ? 'var(--vu-oak)' : '#c76b5a';
          }
        });
      });
    });
  });

  /* ---------- Generic scenario trainer (used four times) ---------- */
  function makeTrainer(cfg) {
    var root = $(cfg.root);
    if (!root) return;
    var idx = 0, score = 0, locked = false;
    var qEl = $(cfg.q), optEl = $(cfg.options), fbEl = $(cfg.feedback),
        progEl = $(cfg.progress), nextBtn = $(cfg.next), resEl = $(cfg.result);
    var navEl = $(cfg.root + ' .quiz__nav');
    function render() {
      locked = false;
      var S = cfg.items[idx];
      progEl.textContent = cfg.progressWord + ' ' + (idx + 1) + ' of ' + cfg.items.length;
      qEl.textContent = S.q;
      fbEl.textContent = '';
      nextBtn.style.visibility = 'hidden';
      nextBtn.textContent = idx === cfg.items.length - 1 ? 'See result' : nextBtn.textContent;
      optEl.innerHTML = '';
      var labels = S.opts || cfg.labels;
      labels.forEach(function (label, i) {
        var b = document.createElement('button');
        b.className = 'opt';
        b.innerHTML = '<span class="mark">' + String.fromCharCode(65 + i) + '</span><span>' + label + '</span>';
        b.addEventListener('click', function () {
          if (locked) return; locked = true;
          var right = i === S.answer;
          if (right) score++;
          $$('.opt', optEl).forEach(function (o, oi) {
            o.setAttribute('disabled', 'true');
            if (oi === S.answer) o.classList.add('correct');
          });
          if (!right) b.classList.add('wrong');
          fbEl.textContent = (right ? '✓ ' : '✗ ') + S.why;
          fbEl.style.color = right ? cfg.goodColor : '#c76b5a';
          nextBtn.style.visibility = 'visible';
        });
        optEl.appendChild(b);
      });
    }
    nextBtn.addEventListener('click', function () {
      idx++;
      if (idx >= cfg.items.length) {
        navEl.style.display = 'none';
        qEl.textContent = ''; optEl.innerHTML = ''; progEl.textContent = ''; fbEl.textContent = '';
        resEl.hidden = false;
        resEl.innerHTML = '<div class="quiz__score gold-text">' + score + ' / ' + cfg.items.length + '</div>' +
          '<p style="margin-top:.75rem;color:' + cfg.resultColor + '">' +
          (score >= cfg.passAt ? cfg.passMsg : cfg.failMsg) +
          '</p><button class="btn btn--ghost" data-retry style="margin-top:1rem">Run it again</button>';
        $('[data-retry]', resEl).addEventListener('click', function () {
          idx = 0; score = 0; resEl.hidden = true;
          navEl.style.display = '';
          render();
        });
      } else render();
    });
    render();
  }

  /* Guess the number (Section 01) */
  makeTrainer({
    root: '#gnGame', q: '#gnQ', options: '#gnOptions', feedback: '#gnFeedback',
    progress: '#gnProgress', next: '#gnNext', result: '#gnResult',
    progressWord: 'Finding', goodColor: 'var(--vu-oak)',
    resultColor: 'var(--ink-soft, #555)', passAt: 3,
    passMsg: 'You called the shape of it: engagement runs through the manager, the numbers alone have never moved it, and AI reached teams before the guidance did. That squeeze is why this session exists.',
    failMsg: 'Most rooms miss these, and the pattern is the point: engagement lives or dies with the manager, dashboards alone have never fixed it, and AI use is sprinting ahead of the rules. Today closes that gap.',
    labels: [],
    items: [
      { q: 'Gallup\'s long-running workplace research: how much of the difference in team engagement traces back to the manager?',
        opts: ['About a quarter', 'About half', 'About 70 percent'],
        answer: 2, why: 'About 70 percent of the variance, in Gallup\'s research on managers. The biggest lever on whether a team is engaged is the person reading the dashboard: you.' },
      { q: 'Globally, what share of employees does Gallup count as engaged at work?',
        opts: ['About one in five', 'About half', 'About three in four'],
        answer: 0, why: 'Roughly one in five. The survey data arrives every year, and engagement barely moves. Numbers on a dashboard have never fixed this; conversations do.' },
      { q: 'Gallup on AI at work: what share of US employees now use AI in their job at least a few times a year?',
        opts: ['About one in ten', 'About one in three', 'About two in three'],
        answer: 1, why: 'About one in three, and climbing fast, with white-collar roles far ahead. The tools reached your team well before the guidance did.' },
      { q: 'And what share of employees say their organization has communicated a clear plan for using AI?',
        opts: ['About a fifth', 'About half', 'About 80 percent'],
        answer: 0, why: 'Around a fifth. Adoption is sprinting ahead of guidance, which is exactly why this course spends a whole section on the rules before any technique.' }
    ]
  });

  /* Red, yellow, or green (Section 02) */
  makeTrainer({
    root: '#tlSort', q: '#tsQ', options: '#tsOptions', feedback: '#tsFeedback',
    progress: '#tsProgress', next: '#tsNext', result: '#tsResult',
    progressWord: 'Case', goodColor: 'var(--vu-gold-flat)',
    resultColor: 'rgba(255,255,255,.85)', passAt: 4,
    passMsg: 'The rule is installed, traps included. Everything AI does for you in the next four sections happens inside the lines you just drew.',
    failMsg: 'Close. The tells: published and generic is green. Team-level, de-identified, in an approved VU tool is yellow. Anything that could point at a person, including small teams and notes about someone, is red.',
    labels: ['Green: go', 'Yellow: approved VU tools only', 'Red: never'],
    items: [
      { q: 'You paste a table from a published industry engagement report into an AI tool to compare your team\'s overall score against the benchmark.',
        answer: 0, why: 'Published and generic: green. Nobody on your team is in that table, so this is exactly the kind of context AI is free to chew on.' },
      { q: 'Your 12-person team\'s engagement scores by question, names and comments stripped, into ChatGPT EDU to look for themes.',
        answer: 1, why: 'Aggregated, de-identified, twelve respondents, approved VU tool: yellow, working as intended. The approved-tool part is load-bearing; the same file in a personal account breaks the rule.' },
      { q: 'One survey comment is a gem: "my manager Sarah cancels our 1:1s every time leadership calls." You want AI to help you phrase a response.',
        answer: 2, why: 'Red. A named person plus an author you could probably guess: identifiable from both ends. Comments with names or identifying detail never go in, whatever you want the AI to do with them.' },
      { q: 'Your product trio\'s "team-level" average on the manager-support question. Three people, no names attached.',
        answer: 2, why: 'The small-team trap: red. With three respondents, an average is three people wearing a trench coat. Count heads before you believe the word aggregate; under five, it stays out.' },
      { q: 'Six months of your running 1:1 notes about Jordan. You want AI to pull the themes so you can prep a better conversation.',
        answer: 2, why: 'Red: notes about a named person are private information about a person, full stop. The workable version: build your own de-identified pattern list, roles and recurring topics only, and THAT list is yellow in an approved tool.' }
    ]
  });

  /* Judge the draft (Section 04) */
  makeTrainer({
    root: '#draftJudge', q: '#djQ', options: '#djOptions', feedback: '#djFeedback',
    progress: '#djProgress', next: '#djNext', result: '#djResult',
    progressWord: 'Line', goodColor: 'var(--vu-oak)',
    resultColor: 'var(--ink-soft, #555)', passAt: 4,
    passMsg: 'Your ear is calibrated: evidence you own, words you wrote, and no person\'s data anywhere near a tool. Now aim it at the feedback you\'ve been postponing.',
    failMsg: 'Close. The tells: specific and owned names a real situation, behavior, and impact from the manager\'s own eyes. Mush names nothing anyone could act on. And the line is crossed the moment a person enters a prompt or a verdict comes out of one.',
    labels: ['Specific and owned', 'Generic mush', 'Crosses the line'],
    items: [
      { q: '"In Thursday\'s sprint review, when the demo failed, you kept troubleshooting live for ten minutes and the client started checking email. Next time I want us to cut to the backup recording inside two minutes."',
        answer: 0, why: 'SBI with a real situation, an observed behavior, a named impact, and a next move. AI can polish a line like this; the substance came from the manager\'s own eyes, which is what makes it land.' },
      { q: '"You\'re a valued member of the team, but there are opportunities to leverage your communication skills more impactfully going forward."',
        answer: 1, why: 'No situation, no behavior, no impact: nothing to act on Monday. This is what AI writes when you give it no evidence, and it costs more than silence because the person can hear that nobody is really talking to them.' },
      { q: '"I ran your last quarter through the AI and it flagged your performance as below expectations."',
        answer: 2, why: 'Twice over. "The AI flagged you" is an outsourced verdict, which is a manager resigning mid-sentence. And an individual\'s record went into a tool to produce it, which broke the Aggregate Rule before the sentence was spoken.' },
      { q: 'Typed into an AI tool: "Draft tough feedback for Maria Chen in finance, who missed the March and April close deadlines."',
        answer: 2, why: 'A named person and her performance record just entered an AI tool: red, before any output exists. The rehearsal version uses a role, "an accountant who missed two close deadlines," and keeps every name out.' },
      { q: '"I\'ve noticed our last three releases slipped at the handoff to QA. Walk me through what you\'re seeing there, and let\'s design the checklist together. I\'d like you to own it."',
        answer: 0, why: 'Feedforward: a specific observed pattern, a genuine question, and a next attempt the person owns. Exactly the kind of line a rehearsal partner helps you tighten, without ever supplying the judgment.' }
    ]
  });

  /* Judge the share-back (Section 06) */
  makeTrainer({
    root: '#shareJudge', q: '#sbQ', options: '#sbOptions', feedback: '#sbFeedback',
    progress: '#sbProgress', next: '#sbNext', result: '#sbResult',
    progressWord: 'Share-back', goodColor: 'var(--vu-oak)',
    resultColor: 'var(--ink-soft, #555)', passAt: 4,
    passMsg: 'You can hear the difference between closing the loop and performing it. Now draft yours in the activity below, against your real signal.',
    failMsg: 'Close. The tells: closing the loop names what was heard, commits to something visible, and levels with the team about what stays. Distrust grows wherever scores get coached or respondents get hunted. And a link to a dashboard says nothing at all.',
    labels: ['Closes the loop', 'Breeds distrust', 'Says nothing'],
    items: [
      { q: '"Here\'s what we heard: recognition scored lowest again. Two things we\'ll try this quarter: shout-outs in Monday standup, and I\'m asking each of you what recognition actually counts for you. One thing we won\'t change: the release pace, and here\'s why."',
        answer: 0, why: 'All three parts: what we heard, what we\'ll try, what stays and why. Every claim is checkable by the team in real time, which is what makes it believable.' },
      { q: '"The scores dipped, which reflects on all of us, so I\'d ask everyone to keep the bigger picture in mind next time the survey comes around."',
        answer: 1, why: 'That is coaching the score instead of the problem. The team hears "make the number look better," trust in the survey dies, and next cycle\'s data is fiction. The score is the messenger; this shoots it.' },
      { q: '"Results are in. Overall pretty good, nothing dramatic. The full dashboard is on the shared drive if anyone wants a look."',
        answer: 2, why: 'A link is a filing cabinet with better branding. Nothing was heard, nothing will be tried, nothing was decided. The team learns that answering the survey changes nothing, and answers accordingly next time.' },
      { q: '"One of the low ratings on manager support has a comment attached. I think I know who wrote it, and I\'d love to just clear the air with them directly."',
        answer: 1, why: 'Hunting the respondent, even warmly, kills anonymity retroactively for everyone. It is the single fastest way to poison a survey, and it flirts with the red line too: identifying an individual behind team-level data.' },
      { q: '"We got clear themes back this cycle. Over the next month I\'ll work through them with each of you in 1:1s, starting with the two the data says matter most, and we\'ll pick what to change together."',
        answer: 0, why: 'Themes routed into conversations, on a timeline, with the deciding shared. This is the question-bank move: the data sets the agenda and the people fill it in.' }
    ]
  });

  /* ---------- INTERACTIVE: private interrogation-plan builder (Section 03) ---------- */
  var ipb = $('#intPlan');
  if (ipb) {
    var iSig = $('#intSignal'), iSus = $('#intSuspect'), iGap = $('#intGap'),
        iBtn = $('#intBuild'), iStatus = $('#intStatus'), iOut = $('#intOut');
    var ipReady = function () {
      var ok = iSig.value.trim().length >= 5 && iSus.value.trim().length >= 5 && iGap.value.trim().length >= 5;
      iBtn.disabled = !ok;
      iStatus.textContent = ok ? 'Ready, build it' : 'Fill in all three';
      return ok;
    };
    [iSig, iSus, iGap].forEach(function (el) { el.addEventListener('input', ipReady); });
    iBtn.addEventListener('click', function () {
      if (!ipReady()) return;
      var esc = function (t) { return t.replace(/</g, '&lt;'); };
      iOut.innerHTML = '<span class="tag">My interrogation plan · private</span>' +
        '<div class="plan__out-grid">' +
        '<div class="row"><b>The signal</b><span>' + esc(iSig.value.trim()) + '</span></div>' +
        '<div class="row"><b>Question 1 · Themes</b><span>"Here are our team-level results, de-identified. What are the strongest themes, and quote the data that supports each one." Themes without support get dropped on the spot.</span></div>' +
        '<div class="row"><b>Question 2 · Contrast</b><span>"Compare with last cycle at team level: what moved, what stayed stuck, and where does the data disagree with itself?" Then test your suspicion against what comes back: ' + esc(iSus.value.trim()) + '. If the data will not support it, it is a hunch, and hunches go to the team as questions.</span></div>' +
        '<div class="row"><b>Question 3 · The mystery</b><span>"What would explain both the signal and this: ' + esc(iGap.value.trim()) + '?" The contradiction is usually where the real story hides.</span></div>' +
        '<div class="row"><b>The humanize test</b><span>Every theme that survives needs one concrete example you have actually seen. With an example, it is a finding. Without one, it is a hypothesis for your next 1:1, never an announcement.</span></div>' +
        '<div class="row"><b>The rule</b><span>All of this happens at team level, names out, head count checked, in an approved VU tool. The light outranks the plan.</span></div>' +
        '</div>';
      iOut.hidden = false;
      iOut.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'nearest' });
    });
  }

  /* ---------- INTERACTIVE: The Review Prep Lab (Section 05) ---------- */
  var lab = $('#reviewLab');
  if (lab) {
    var SLOTS = [
      { key: 'Gather the evidence', opts: [
        { t: 'Write from memory; you know your people.', pts: 1, coach: 'Memory is a recency machine: the last six weeks and the loudest incidents. Reviews built on it feel arbitrary because, statistically, they are.' },
        { t: 'Reread your running 1:1 notes the weekend before drafting.', pts: 2, coach: 'Real evidence exists, which already beats memory. But a year of notes read in one sitting still lands recency-first, and the quiet performer\'s thin file gets reproduced instead of noticed.' },
        { t: 'Keep notes all year; de-identify them to roles and patterns, let AI in an approved tool surface themes, then check every theme against dated examples.', pts: 3, coach: 'Evidence first, aggregation before any tool, and a ground truth pass at the end. The machine did volume and recall; the judgment still runs on your own dated examples.' }]},
      { key: 'Draft the reviews', opts: [
        { t: 'AI writes each review from the themes; you polish the wording.', pts: 1, coach: 'The verdict just got outsourced. AI-written reviews converge on the same confident mush, people compare notes, and "the AI wrote our reviews" is the sentence that ends up in the grievance.' },
        { t: 'Write each one from scratch the night before it\'s due.', pts: 2, coach: 'The words are yours, and the 11 pm versions are uneven: the first review gets craft, the eighth gets a template. Fatigue is a fairness problem wearing a diligence costume.' },
        { t: 'AI structures your evidence into the review format; you write every judgment sentence yourself, in your words.', pts: 3, coach: 'Structure and recall to the machine, every evaluating sentence from you. This is rehearsal-not-verdict applied to the highest-stakes document you write about a person.' }]},
      { key: 'Calibrate the ratings', opts: [
        { t: 'Skip it; the ratings came from the evidence, so they\'re done.', pts: 1, coach: 'Every manager\'s bar drifts across eight reviews. Uncalibrated ratings are where bias lives undisturbed, and where appeals come from.' },
        { t: 'Skim the eight ratings for anything that looks odd.', pts: 2, coach: 'A glance catches the outrageous and misses the systematic: the quiet person rated on visibility, the recent stumble outweighing a strong year.' },
        { t: 'Lay the eight ratings against the evidence and check the pattern: same bar for the same performance, recency and visibility named, reasons written down.', pts: 3, coach: 'Consistency is a pattern property; you can only see it across the set. Ten minutes of pattern-checking is the cheapest fairness in the whole cycle.' }]},
      { key: 'Prepare the delivery', opts: [
        { t: 'Wing it; the written review speaks for itself.', pts: 1, coach: 'The conversation IS the review; the document is its receipt. Winging the hard ones gives the year\'s most important feedback your least prepared delivery.' },
        { t: 'Reread each review just before its meeting.', pts: 2, coach: 'Prepared to present, and unprepared to converse. The hard conversations will leave the document, and what happens then is what decides how fair the cycle feels.' },
        { t: 'Rehearse the two hardest conversations with AI as a sparring partner, roles not names: likely reactions, your opening line, the question you\'re dreading.', pts: 3, coach: 'Rehearsal spent where it pays, with every name kept out of the tool. You walk in having already heard the hard version once.' }]}
    ];
    var picks = [null, null, null, null];
    var slotsEl = $('#labSlots'), runBtn = $('#labRun'), statusEl = $('#labStatus'), outEl = $('#labOutcome');
    SLOTS.forEach(function (slot, si) {
      var d = document.createElement('div');
      d.className = 'slot';
      d.innerHTML = '<h3>' + (si + 1) + ' · ' + slot.key + '</h3>';
      slot.opts.forEach(function (o, oi) {
        var b = document.createElement('button');
        b.className = 'opt'; b.setAttribute('aria-pressed', 'false');
        b.innerHTML = '<span class="mark">' + String.fromCharCode(65 + oi) + '</span><span>' + o.t + '</span>';
        b.addEventListener('click', function () {
          picks[si] = oi;
          $$('.opt', d).forEach(function (x, xi) { x.setAttribute('aria-pressed', String(xi === oi)); });
          var ready = picks.every(function (p) { return p !== null; });
          runBtn.disabled = !ready;
          statusEl.textContent = ready ? 'Ready, run the cycle' :
            'Choose ' + picks.filter(function (p) { return p === null; }).length + ' more stage(s)';
          outEl.hidden = true;
        });
        d.appendChild(b);
      });
      slotsEl.appendChild(d);
    });
    var REACTIONS = {
      strong: 'Two weeks later: the cycle people called fair. Reviews cite dated examples, the ratings hold one bar across all eight people, and the two hard conversations landed because you had already heard the hard version once. One person disagreed with a rating, read the evidence, and said so without appealing. That is what fair sounds like.',
      mid: 'Two weeks later: no disaster, and no trust either. Two reviews read thinner than the year deserved, one rating got walked back when someone produced evidence you had missed, and the hardest conversation ran long and ended vague. Fairness leaked out through the stages you left soft.',
      weak: 'Two weeks later: the grievance. Two teammates compared reviews, recognized the same AI phrasing in both, and filed together; HR\'s first question was "who wrote these?" The ratings could not be defended with evidence, and next cycle everyone performs for the machine they now assume is grading them.'
    };
    runBtn.addEventListener('click', function () {
      var score = picks.reduce(function (t, p, i) { return t + SLOTS[i].opts[p].pts; }, 0); // 4..12
      var pct = Math.round((score / 12) * 100);
      var tier = score >= 11 ? 'strong' : score >= 8 ? 'mid' : 'weak';
      var head = tier === 'strong' ? 'A fair cycle by design: your evidence, AI on structure and volume, and your name on every judgment.'
               : tier === 'mid' ? 'Half a cycle. The machine and the crunch split the work, and the soft stages are deciding your reputation.'
               : 'An outsourced cycle: verdicts nobody owns, built on evidence nobody kept. This is where grievances come from.';
      var coach = picks.map(function (p, i) { return '<div><b>' + SLOTS[i].key + ':</b> ' + SLOTS[i].opts[p].coach + '</div>'; }).join('');
      outEl.innerHTML = '<span class="tag">The cycle, two weeks later · ' + score + ' / 12</span>' +
        '<div class="lab__meter"><span style="width:0"></span></div>' +
        '<p style="margin:0;color:#fff;font-weight:500">' + head + '</p>' +
        '<div class="sample">' + REACTIONS[tier] + '</div>' +
        '<div class="lab__coach">' + coach + '</div>' +
        (tier !== 'strong' ? '<p class="why" style="margin-top:1rem"><b>Try again:</b> strengthen your weakest stage and rerun the cycle. Watch what changes in the outcome.</p>'
                           : '<p class="why" style="margin-top:1rem"><b>Now the real thing:</b> the pair drill in Go deeper scores your actual review prep against these same four stages.</p>');
      outEl.hidden = false;
      requestAnimationFrame(function () {
        var bar = $('.lab__meter span', outEl);
        if (bar) requestAnimationFrame(function () { bar.style.width = pct + '%'; });
      });
      outEl.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'nearest' });
    });
  }

  /* ---------- In-flow video embeds (click-to-load, privacy-friendly) ---------- */
  $$('.yt').forEach(function (box) {
    var btn = $('.yt__load', box);
    if (!btn) return;
    btn.addEventListener('click', function () {
      var f = document.createElement('iframe');
      f.src = box.getAttribute('data-embed') + '?autoplay=1&rel=0';
      f.title = box.getAttribute('data-yttitle') || 'Video';
      f.allow = 'accelerometer; autoplay; encrypted-media; picture-in-picture';
      f.setAttribute('allowfullscreen', '');
      btn.replaceWith(f);
    });
  });

  /* ---------- INTERACTIVE: People-Data Card capstone ---------- */
  var planEl = $('#pdPlan');
  if (planEl) {
    var pick = { practice: null, not: null, when: null };
    var whoIn = $('#planWho'), buildBtn = $('#planBuild'), statusEl2 = $('#planStatus'), outEl2 = $('#planOut');
    function planReady() {
      var ok = whoIn.value.trim().length >= 8 && pick.practice && pick.not && pick.when;
      buildBtn.disabled = !ok;
      statusEl2.textContent = ok ? 'Ready, build it' : 'Fill in all four parts';
      return ok;
    }
    whoIn.addEventListener('input', planReady);
    [['#planPractice', 'practice', 'data-practice'], ['#planNot', 'not', 'data-not'], ['#planWhen', 'when', 'data-when']].forEach(function (cfg) {
      var group = $(cfg[0]);
      $$('.opt', group).forEach(function (b) {
        b.addEventListener('click', function () {
          pick[cfg[1]] = b.getAttribute(cfg[2]);
          $$('.opt', group).forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
          outEl2.hidden = true;
          planReady();
        });
      });
    });
    var PRACTICE = {
      aggregate: { name: 'Aggregate and de-identify first', move: 'Take the source to team level yourself: names out, identifying roles and events out, and any slice under five people out entirely. Nothing opens an AI tool until this pass is done, and then only an approved VU tool.' },
      interrogate: { name: 'Run the three-question interrogation', move: 'On the aggregated data, in an approved VU tool: the themes question with supporting quotes, the contrast with last cycle, and the question behind the question. Then the ground truth test on every theme that survives.' },
      rehearse: { name: 'Rehearse one hard feedback conversation', move: 'Describe the situation with roles instead of names, draft against SBI or feedforward, stress-test the tone, and practice against the three hardest likely responses. Every judgment sentence stays yours.' },
      bank: { name: 'Build the 1:1 question bank', move: 'Turn each team-level theme into one question you will actually ask, put the two strongest at the top of next week\'s 1:1 agendas, and note afterward which conversations happened.' }
    };
    var NOT = {
      named: 'Putting a named person\'s data in any AI tool. Counter-move: de-identify to roles and patterns yourself before anything opens a tool, and when in doubt, keep it out.',
      verdict: 'Letting AI write the verdict on a person. Counter-move: AI may structure, summarize, and rehearse; every sentence that evaluates a person gets written by you, from your evidence, in your words.',
      smalln: 'Treating small-team data as safe because it is technically aggregated. Counter-move: run the head count before any tool sees anything; under five people, the average IS the individuals, so it stays red.'
    };
    var WHEN = { tomorrow: 'tomorrow', threedays: 'within the next 3 days', week: 'within 7 days' };
    buildBtn.addEventListener('click', function () {
      if (!planReady()) return;
      var who = whoIn.value.trim();
      var p = PRACTICE[pick.practice];
      var rows = '' +
        '<div class="row"><b>The source</b><span>' + who.replace(/</g, '&lt;') + '</span></div>' +
        '<div class="row"><b>The first move</b><span>' + p.name + '. ' + p.move + '</span></div>' +
        '<div class="row"><b>What I will NOT do</b><span>' + NOT[pick.not] + '</span></div>' +
        '<div class="row"><b>When</b><span>I start ' + WHEN[pick.when] + ', with the 45-minute theme-to-conversation session on the calendar.</span></div>' +
        '<div class="row"><b>The rule that rides along</b><span>Individual and identifiable: red, never. Aggregated and de-identified: yellow, approved VU tools only. Published benchmarks: green. The light outranks every technique on this card.</span></div>' +
        '<div class="row"><b>The finish line</b><span>The output is a conversation on the calendar, never a chart. Two weeks out, one line: which conversations happened, and what did they change?</span></div>';
      outEl2.innerHTML = '<span class="tag">My people-data card</span>' +
        '<div class="plan__out-grid">' + rows + '</div>' +
        '<div class="lab__runrow" style="margin-top:1.25rem">' +
        '<button class="btn" id="planCopy">Copy my card</button>' +
        '<span class="quiz__progress" id="planCopied" style="color:rgba(255,255,255,.6)">Put the first move on the calendar now</span></div>';
      outEl2.hidden = false;
      $('#planCopy').addEventListener('click', function () {
        var text = 'MY PEOPLE-DATA CARD (People Data with AI, Vanderbilt)\n' +
          'The source: ' + who + '\n' +
          'First move: ' + p.name + '. ' + p.move + '\n' +
          'I will NOT: ' + NOT[pick.not] + '\n' +
          'When: I start ' + WHEN[pick.when] + '.\n' +
          'The rule: identifiable = red, never. Aggregated + de-identified = yellow, approved VU tools only. Published = green.\n' +
          'Finish line: a conversation on the calendar. Two weeks out, one line on which conversations happened.';
        (navigator.clipboard ? navigator.clipboard.writeText(text) : Promise.reject()).then(function () {
          $('#planCopied').textContent = 'Copied. Paste it somewhere you\'ll see before your start day.';
        }, function () {
          $('#planCopied').textContent = 'Select the card text above and copy it manually.';
        });
      });
      outEl2.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'nearest' });
    });
  }

  /* ---------- INTERACTIVE: scored recap quiz ---------- */
  var recap = $('#recap');
  if (recap) {
    var QUESTIONS = [
      { q: 'Engagement survey results land on most teams and change nothing. What actually turns people data into engagement?',
        opts: ['A better dashboard with more drill-downs', 'The manager turning themes into conversations the team can see', 'A higher response rate next cycle', 'Sharing the raw results with everyone immediately'],
        correct: 1, why: 'Gallup puts roughly 70 percent of the variance in team engagement on the manager. Data moves a team only when it becomes a visible conversation, which is why every technique today ends in one.' },
      { q: 'Your team of four gets its "team-level" engagement average. Under the Aggregate Rule, that number is...',
        opts: ['Green; it is just a number', 'Yellow; it is technically aggregated', 'Red; at that size the average identifies people', 'Whatever the survey tool\'s default says'],
        correct: 2, why: 'The small-n trap. Under about five respondents, an aggregate is the individuals wearing a trench coat. The head count comes before any tool, every time.' },
      { q: 'AI reports a theme in your aggregated retro data: "the team feels micromanaged." You cannot recall one concrete example. The theme is...',
        opts: ['A finding to announce at the next team meeting', 'A hypothesis to take to the team as a question', 'Proof the AI misread the data; discard it', 'Grounds to reread individual comments and find who said it'],
        correct: 1, why: 'The ground truth test: no example means hypothesis, and hypotheses go to the team as questions. Hunting the commenter would also break anonymity, which poisons every future survey.' },
      { q: 'Which use of AI in hard feedback stays on the right side of the line?',
        opts: ['"Draft feedback for Maria Chen, who missed two deadlines"', 'Stress-testing the tone of your draft about "a senior analyst on my team"', 'Sending its draft unedited so the wording stays neutral', 'Asking it whether the person deserves a formal warning'],
        correct: 1, why: 'Roles instead of names, and AI on the rehearsal side only. A named person\'s record in a tool is red, and the warning question hands over the verdict, the one thing that must stay yours.' },
      { q: 'Review season, eight reviews to write. The division of labor this course teaches:',
        opts: ['AI writes the reviews; you polish the wording', 'You write everything from scratch the night before', 'AI structures your evidence; you write every judgment sentence', 'Skip drafting; the ratings speak for themselves'],
        correct: 2, why: 'Structure and recall are machine work; judgment is yours, in your words, under your name. AI-written verdicts converge on the same mush, and people recognize it when they compare.' },
      { q: 'The measure that shows a survey process is actually working:',
        opts: ['Dashboard views per manager', 'A response rate above 90 percent', 'Scores improving every single cycle', 'Themes turned into conversations or experiments within a month'],
        correct: 3, why: 'Conversations are the product; everything else is exhaust. A theme with nothing attached a month later is a chart, and teams can tell the difference.' }
    ];
    var idx = 0, score = 0, locked = false;
    var qEl = $('#recapQ'), optEl2 = $('#recapOptions'), fbEl = $('#recapFeedback'),
        progEl = $('#recapProgress'), nextBtn = $('#recapNext'), panelEl = $('#recapPanel'), resultEl = $('#recapResult');
    function render() {
      locked = false;
      var Q = QUESTIONS[idx];
      qEl.textContent = Q.q;
      progEl.textContent = 'Question ' + (idx + 1) + ' of ' + QUESTIONS.length;
      fbEl.textContent = ''; fbEl.classList.remove('show');
      nextBtn.style.visibility = 'hidden';
      nextBtn.textContent = idx === QUESTIONS.length - 1 ? 'See score' : 'Next question';
      optEl2.innerHTML = '';
      Q.opts.forEach(function (text, i) {
        var b = document.createElement('button');
        b.className = 'opt';
        b.innerHTML = '<span class="mark">' + String.fromCharCode(65 + i) + '</span><span>' + text + '</span>';
        b.addEventListener('click', function () {
          if (locked) return; locked = true;
          var right = i === Q.correct;
          if (right) score++;
          $$('.opt', optEl2).forEach(function (o, oi) {
            o.setAttribute('disabled', 'true');
            if (oi === Q.correct) o.classList.add('correct');
          });
          if (!right) b.classList.add('wrong');
          fbEl.classList.add('show');
          fbEl.textContent = (right ? '✓ Correct. ' : '✗ ') + Q.why;
          fbEl.style.color = right ? 'var(--vu-oak)' : '#c76b5a';
          nextBtn.style.visibility = 'visible';
        });
        optEl2.appendChild(b);
      });
    }
    nextBtn.addEventListener('click', function () {
      idx++;
      if (idx >= QUESTIONS.length) { showResult(); }
      else render();
    });
    function showResult() {
      panelEl.hidden = true;
      resultEl.hidden = false;
      var pct = Math.round((score / QUESTIONS.length) * 100);
      var msg = pct >= 80 ? 'The method is loaded. The data source you named is where it becomes real.' :
                pct >= 50 ? 'Solid. Revisit the sections you missed before you touch real people data.' :
                            'Worth another pass through the deck before the capstone.';
      resultEl.innerHTML = '<span class="eyebrow">Your result</span>' +
        '<div class="quiz__score gold-text">' + score + ' / ' + QUESTIONS.length + '</div>' +
        '<p class="lead" style="margin-top:1rem">' + msg + '</p>' +
        '<button class="btn btn--dark" id="recapRetry" style="margin-top:1.5rem">Try again</button>';
      $('#recapRetry').addEventListener('click', function () {
        idx = 0; score = 0; resultEl.hidden = true; panelEl.hidden = false; render();
      });
    }
    render();
  }

  /* ---------- INTERACTIVE: glossary flip ---------- */
  $$('.flip').forEach(function (card) {
    card.addEventListener('click', function () { card.classList.toggle('flipped'); });
    card.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); card.classList.toggle('flipped'); }
    });
  });

  /* ---------- Deck navigation: dots, arrows, keyboard, progress ---------- */
  var slides = $$('.slide');
  var dotWrap = $('#dots');
  var bar = $('#progressBar');
  var counter = $('#deckCount');
  var current = 0;

  if (dotWrap) {
    slides.forEach(function (s, i) {
      var b = document.createElement('button');
      b.type = 'button';
      var label = s.getAttribute('data-title') || ('Section ' + (i + 1));
      b.setAttribute('aria-label', 'Go to: ' + label);
      b.addEventListener('click', function () { goTo(i); });
      dotWrap.appendChild(b);
    });
  }
  var dots = dotWrap ? $$('button', dotWrap) : [];

  function goTo(i) {
    i = Math.max(0, Math.min(slides.length - 1, i));
    slides[i].scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', inline: 'start', block: 'nearest' });
  }
  var barTitle = $('#barTitle');
  function setActive(i) {
    current = i;
    dots.forEach(function (d, di) { d.setAttribute('aria-current', String(di === i)); });
    if (counter) counter.textContent = (i + 1) + ' / ' + slides.length;
    if (barTitle) barTitle.textContent = slides[i].getAttribute('data-title') || '';
    if (typeof checkHint === 'function') checkHint();
    $$('.nav__links a').forEach(function (a) {
      var href = a.getAttribute('href');
      a.setAttribute('aria-current', String(href === '#' + slides[i].id));
    });
  }
  if ('IntersectionObserver' in window) {
    var sObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { setActive(slides.indexOf(e.target)); }
      });
    }, { threshold: 0.5 });
    slides.forEach(function (s) { sObs.observe(s); });
  }
  setActive(0);

  // progress bar follows the deck's horizontal position
  var deckEl = $('.deck');
  if (deckEl) {
    deckEl.addEventListener('scroll', function () {
      var w = deckEl.scrollWidth - deckEl.clientWidth;
      if (bar) bar.style.width = (w > 0 ? (deckEl.scrollLeft / w) * 100 : 0) + '%';
      nav.classList.toggle('scrolled', deckEl.scrollLeft > 40);
    }, { passive: true });
  }

  // "scroll for more" indicator
  var hint = $('#scrollHint');
  function checkHint() {
    if (!hint || !slides[current]) return;
    var s = slides[current];
    var need = s.scrollHeight - s.clientHeight > 56;
    var atEnd = s.scrollTop + s.clientHeight >= s.scrollHeight - 24;
    hint.classList.toggle('show', need && !atEnd);
  }
  if (hint) {
    hint.addEventListener('click', function () {
      var s = slides[current];
      s.scrollBy({ top: s.clientHeight * 0.7, behavior: reduce ? 'auto' : 'smooth' });
    });
    slides.forEach(function (s) { s.addEventListener('scroll', checkHint, { passive: true }); });
    window.addEventListener('resize', checkHint);
    setTimeout(checkHint, 400);
  }

  // in-page anchor links jump the horizontal deck
  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href').slice(1);
      if (!id) return;
      var target = document.getElementById(id);
      if (!target) return;
      var slide = target.closest ? (target.closest('.slide') || target) : target;
      if (slides.indexOf(slide) > -1) {
        e.preventDefault();
        goTo(slides.indexOf(slide));
      } else if (id === 'top') {
        e.preventDefault();
        goTo(0);
      }
    });
  });

  // keyboard
  document.addEventListener('keydown', function (e) {
    if (['INPUT', 'TEXTAREA', 'SELECT'].indexOf(document.activeElement.tagName) > -1) return;
    if (e.key === 'ArrowRight' || e.key === 'PageDown' || (e.key === ' ' && !e.shiftKey)) {
      e.preventDefault(); goTo(current + 1);
    } else if (e.key === 'ArrowLeft' || e.key === 'PageUp' || (e.key === ' ' && e.shiftKey)) {
      e.preventDefault(); goTo(current - 1);
    } else if (e.key === 'Home') { e.preventDefault(); goTo(0); }
    else if (e.key === 'End') { e.preventDefault(); goTo(slides.length - 1); }
  });

  // every non-anchor link opens in a new tab
  $$('a[href]').forEach(function (a) {
    var href = a.getAttribute('href');
    if (href && href.charAt(0) !== '#') {
      a.setAttribute('target', '_blank');
      a.setAttribute('rel', 'noopener');
    }
  });

  // deck bar buttons
  var prevB = $('#deckPrev'), nextB = $('#deckNext');
  if (prevB) prevB.addEventListener('click', function () { goTo(current - 1); });
  if (nextB) nextB.addEventListener('click', function () { goTo(current + 1); });

  // year
  var yEl = $('#year'); if (yEl) yEl.textContent = new Date().getFullYear();
})();
