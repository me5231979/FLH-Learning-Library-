/* =====================================================================
   DELEGATING TO AI AND TO PEOPLE, classroom deck
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

  /* Guess the pattern (Section 01) */
  makeTrainer({
    root: '#patGuess', q: '#pgQ', options: '#pgOptions', feedback: '#pgFeedback',
    progress: '#pgProgress', next: '#pgNext', result: '#pgResult',
    progressWord: 'Finding', goodColor: 'var(--vu-oak)',
    resultColor: 'var(--ink-soft, #555)', passAt: 3,
    passMsg: 'You called the pattern: AI use is racing ahead of anyone managing it, and the design job landed on managers. The rest of this session is the method for that job.',
    failMsg: 'Most rooms miss a few, and the misses share a shape: we underestimate how fast AI use is spreading and overestimate how much of it is managed. Unmanaged routing is the gap this session closes.',
    labels: [],
    items: [
      { q: 'Gallup tracks how often US employees use AI at work. Over the two years to 2025, use at least a few times a year did what?',
        opts: ['Held roughly steady', 'Nearly doubled, to about 4 in 10 employees', 'Fell back as the novelty wore off'],
        answer: 1, why: 'It nearly doubled, from 21 percent to about 40 percent. The routing volume is already arriving at your desk; the only question is whether anyone is deciding where it goes.' },
      { q: 'And how many US employees use AI at work daily?',
        opts: ['About 1 in 12', 'About 1 in 3', 'More than half'],
        answer: 0, why: 'About 8 percent, double what it was two years earlier. Daily use is where routing habits form, which is why the deciding matters now, while the habits are still wet cement.' },
      { q: 'How many employees say their organization has communicated a clear plan for using AI?',
        opts: ['About 1 in 5', 'About half', 'Nearly all of them'],
        answer: 0, why: 'About 22 percent. The tools arrived before the management did. Today is the plan, at the level where it actually gets made: one manager, one task at a time.' },
      { q: 'Stanford GSB researchers describe what the AI era does to a leader\'s job. The core shift they name is...',
        opts: ['Leaders oversee execution more closely, because AI raises the stakes of errors', 'Leaders redesign roles and processes rather than simply oversee execution', 'Leaders hand the routing decisions to whoever knows the tools best'],
        answer: 1, why: 'Redesign, never just closer oversight. When machines absorb the routine layer, deciding what work goes where, and what each role becomes, moves to the center of the job. That decision is this session.' }
    ]
  });

  /* Route the task (Section 02) */
  makeTrainer({
    root: '#routeTask', q: '#rtQ', options: '#rtOptions', feedback: '#rtFeedback',
    progress: '#rtProgress', next: '#rtNext', result: '#rtResult',
    progressWord: 'Task', goodColor: 'var(--vu-gold-flat)',
    resultColor: 'rgba(255,255,255,.85)', passAt: 4,
    passMsg: 'You ran the test in order: growth, then judgment, then volume. The lab will pressure-test the same instinct at quarter scale.',
    failMsg: 'Close. The order is the tell: ask growth first, and only what fails it goes on to judgment; only what fails both belongs to volume. Speed never gets the first word.',
    labels: ['Route it to AI', 'Give it to a person as stretch', 'Keep it yourself'],
    items: [
      { q: 'First-pass meeting minutes from the weekly project call, drafted from the recording\'s transcript.',
        answer: 0, why: 'Nobody grows on transcription, no relationship is listening, and the errors are catchable: AI\'s lane. One rule rides along: whoever ran the meeting skims the minutes against their own memory before they post.' },
      { q: 'The de-escalation call with a client who is threatening to walk over last month\'s miss.',
        answer: 2, why: 'The judgment question at full volume: relationship, context, and accountability, with a counterpart listening for whether they matter. The tell: when a fumble costs a relationship, the test stops at question two. Bring a senior along to own the follow-up plan; the call itself is yours.' },
      { q: 'Drafting the junior analyst\'s first board memo.',
        answer: 1, why: 'The growth question says yes loudly: this rep is theirs to earn. AI would draft it faster and would steal the exact struggle that builds the skill. Stretch with review: they write, you coach the drafts.' },
      { q: 'Reformatting 60 rows of survey feedback into a themed summary table, again this quarter.',
        answer: 0, why: 'Mechanical repetition with catchable errors, and nobody grows on their fourth quarter of reformatting. AI drafts; a named verifier traces a few themes back to the raw rows before it circulates.' },
      { q: 'Deciding which two projects to cut when the budget lands 15 percent short.',
        answer: 2, why: 'A judgment call with your name on it and consequences for people\'s work. AI can assemble the numbers upstream, and the cut itself is accountability, which does not delegate to a tool or to a junior.' }
    ]
  });

  /* Stretch or grunt (Section 03) */
  makeTrainer({
    root: '#stretchGrunt', q: '#sgQ', options: '#sgOptions', feedback: '#sgFeedback',
    progress: '#sgProgress', next: '#sgNext', result: '#sgResult',
    progressWord: 'Task', goodColor: 'var(--vu-oak)',
    resultColor: 'var(--ink-soft, #555)', passAt: 4,
    passMsg: 'You can hear the difference from the junior\'s chair: new teaches, long repeats, and the old apprenticeship needs replacements. Role math, next section, is how you build them.',
    failMsg: 'Close. The tells: stretch is hard because it is new and comes with feedback. Grunt is hard because it is long; rep 30 teaches nothing rep 3 did not. And some tasks taught for decades before AI took them; those need replacement reps, never nostalgia.',
    labels: ['Stretch: hard because it is new', 'Grunt: hard because it is long', 'Yesterday\'s stretch, today\'s AI lane'],
    items: [
      { q: 'Running the kickoff meeting for a small account, with your manager in the room and deliberately silent.',
        answer: 0, why: 'New, scary in the useful way, and the feedback loop is built in: the debrief happens the same afternoon. This is what stretch looks like, and no machine can take the rep for you.' },
      { q: 'Your fourth quarter in a row of copying numbers between the same two systems every Monday morning.',
        answer: 1, why: 'Rep 40 teaches nothing rep 4 did not. This is grunt, and it is also a volume-question candidate: routing it to AI with a named verifier is a favor to everyone, including the pipeline.' },
      { q: 'Writing the first draft of the market scan, the way juniors in this field learned the trade for decades.',
        answer: 2, why: 'It genuinely taught, and AI now drafts it in minutes. This is the trap category: route it away with no replacement and the trade stops getting learned. The new rep: the junior directs the research, judges what is missing, and owns the verification.' },
      { q: 'Owning verification of the AI-drafted competitor summary: checking claims against source filings and signing off before it circulates.',
        answer: 0, why: 'This is new stretch, invented for exactly this decade: a judgment rep with a signature on it. Verification ownership is how juniors learn what wrong looks like, which used to take years of drafting to acquire.' },
      { q: 'The research pass: two days pulling background on a prospect before the partner\'s pitch, the way associates used to learn the industry.',
        answer: 2, why: 'Another one AI absorbed. Mourn it briefly, then rebuild: the associate runs the AI\'s research, decides what is thin, and presents the gaps to the partner. The learning moves up a level instead of disappearing.' }
    ]
  });

  /* Judge the handoff (Section 06) */
  makeTrainer({
    root: '#handoffJudge', q: '#hjQ', options: '#hjOptions', feedback: '#hjFeedback',
    progress: '#hjProgress', next: '#hjNext', result: '#hjResult',
    progressWord: 'Brief', goodColor: 'var(--vu-oak)',
    resultColor: 'var(--ink-soft, #555)', passAt: 4,
    passMsg: 'Your ear is calibrated: a complete handoff names the outcome, the context, the checkpoint, and leaves room to struggle. Now write one for the task on your capstone card.',
    failMsg: 'Close. The tells: a complete handoff has outcome, context, checkpoints, and struggle room. A dump has none of them. Micromanagement has checkpoints so tight nobody can learn between them. And an AI handoff with no verifier is a dump with a machine on the receiving end.',
    labels: ['A complete handoff', 'A dump, not a delegation', 'Micromanagement in a memo'],
    items: [
      { q: '"Take our Q3 win with the logistics client and turn it into a case study for the site. Audience is prospects who stall at pricing. Draft by Thursday, we review together Friday, and how you get there is yours to figure out."',
        answer: 0, why: 'Outcome, audience context, one agreed checkpoint, and explicit room to struggle. Every line of the brief is doing work. This person can run.' },
      { q: '"Handle the vendor renewals this cycle." Sent at 5:55 on a Friday, no context, no checkpoint, and the first mention of renewals all year.',
        answer: 1, why: 'An outcome-less transfer with no context and no agreed look-in is a dump wearing delegation\'s clothes. The person left holding it learns one lesson: stay away from this manager\'s Friday inbox.' },
      { q: '"Write the summary, but run every paragraph past me before you start the next one, and stick to my phrasing from last quarter\'s version."',
        answer: 2, why: 'Checkpoints so tight they are a cage. Nobody grows inside another person\'s sentences; remove the struggle and you remove the learning, while paying full price for the labor.' },
      { q: '"I set the AI up to draft the weekly digest and it posts automatically. It has been fine so far."',
        answer: 1, why: 'A dump with a machine on the receiving end: no standard, no named verifier, no reject path. "Fine so far" is what every unverified pipeline says right up until it isn\'t. A delegation to AI with no verifier is a delegation to nobody.' },
      { q: '"AI drafts the competitor summary each Friday from the source filings; Priya verifies the claims against those filings before it circulates, and she bounces it back when it doesn\'t hold."',
        answer: 0, why: 'The AI brief, complete: a draft assignment with inputs and a standard, plus a named verifier with sources and the power to reject. Notice who really received this delegation: Priya.' }
    ]
  });

  /* ---------- INTERACTIVE: private role-math builder (Section 04) ---------- */
  var rmb = $('#roleMath');
  if (rmb) {
    var rRole = $('#rmRole'), rChunk = $('#rmChunk'), rGrow = $('#rmGrow'),
        rBtn = $('#rmBuild'), rStatus = $('#rmStatus'), rOut = $('#rmOut');
    var rmReady = function () {
      var ok = rRole.value.trim().length >= 5 && rChunk.value.trim().length >= 5 && rGrow.value.trim().length >= 5;
      rBtn.disabled = !ok;
      rStatus.textContent = ok ? 'Ready, sketch it' : 'Fill in all three';
      return ok;
    };
    [rRole, rChunk, rGrow].forEach(function (el) { el.addEventListener('input', rmReady); });
    rBtn.addEventListener('click', function () {
      if (!rmReady()) return;
      var esc = function (t) { return t.replace(/</g, '&lt;'); };
      rOut.innerHTML = '<span class="tag">My role-math sketch · private</span>' +
        '<div class="plan__out-grid">' +
        '<div class="row"><b>The role</b><span>' + esc(rRole.value.trim()) + '</span></div>' +
        '<div class="row"><b>What AI absorbs</b><span>' + esc(rChunk.value.trim()) + '. Routed to AI with a named verifier from day one; absorbed never means unwatched.</span></div>' +
        '<div class="row"><b>What backfills</b><span>' + esc(rGrow.value.trim()) + '. Name this in the same breath as the absorption, so the role\'s story is growth instead of shrinkage. Add the standing backfills: verification ownership and a judgment rep with feedback.</span></div>' +
        '<div class="row"><b>The conversation</b><span>Three sentences, delivered together: here is the routine chunk AI is taking, here is what you get back, and here is what the freed hours are for. A role redesigned with its owner grows; a role shrunk from a distance starts job hunting.</span></div>' +
        '<div class="row"><b>The move</b><span>Hold onto this sketch. The lab stress-tests your routing instincts next, and the capstone puts a date on the first handoff.</span></div>' +
        '</div>';
      rOut.hidden = false;
      rOut.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'nearest' });
    });
  }

  /* ---------- INTERACTIVE: The Routing Lab (Section 05) ---------- */
  var lab = $('#routingLab');
  if (lab) {
    var SLOTS = [
      { key: 'The recurring data pull (every Monday, three systems, zero surprises)', opts: [
        { t: 'Keep it yourself; you know the systems and it goes fastest that way.', pts: 1, coach: 'The comfort-keep. Mechanical repetition with catchable errors is the volume question\'s easiest yes, and your hours are the team\'s scarcest resource. Familiarity is not judgment.' },
        { t: 'Route it to AI; it has been accurate for weeks, so no check needed.', pts: 2, coach: 'Right lane, no verifier. The first bad pull ships in week eight, when nobody is looking, and takes the team\'s trust in the whole setup with it. A delegation to AI is a delegation to the verifier, and you have not named one.' },
        { t: 'Route it to AI; the junior owns verification, spot-checking two figures against source each week.', pts: 3, coach: 'Two routings in one move: the volume goes to the machine and the junior gets a new rep, verification ownership. The pull now costs minutes and someone is learning what wrong looks like.' }]},
      { key: 'The new client\'s kickoff deck (their first impression of the team)', opts: [
        { t: 'AI drafts it from the proposal; you send it on after a quick skim.', pts: 1, coach: 'A first impression built on a skim. This task was never volume: it is a relationship starting. What AI saved in hours here, it spent in judgment nobody applied.' },
        { t: 'Build it yourself over the weekend; it is too important to hand off.', pts: 2, coach: 'Safe, and the growth question went unasked. Important is exactly what stretch is made of: your senior analyst could build this with your review and earn client-facing trust doing it. You bought quality and paid in someone\'s growth.' },
        { t: 'The senior analyst builds it as stretch: AI drafts the boilerplate, they own the story, you review before it ships.', pts: 3, coach: 'The test run in order: growth says stretch, judgment says your review stays, volume says AI can carry the boilerplate. This is a designed delegation, and it shows in the quarter-end numbers.' }]},
      { key: 'The process documentation nobody owns (everyone\'s least favorite backlog item)', opts: [
        { t: 'Assign it to the junior; they have capacity and it has to get done.', pts: 1, coach: 'The capacity-dump. Documenting a process they barely know teaches little and lands as punishment. The growth question came back no, and you routed it there anyway because the calendar was empty.' },
        { t: 'Leave it in the backlog again; nobody is asking for it this week.', pts: 2, coach: 'Honest, and the debt compounds: undocumented process is why every handoff on this team starts from zero. There is a routing that costs almost nothing; look for the mechanical layer inside the chore.' },
        { t: 'AI drafts each page from recordings and tickets; the person who runs each process verifies their own section in fifteen minutes.', pts: 3, coach: 'The unowned chore dissolves: AI absorbs the writing nobody wanted, verification is sliced thin across the people who actually know, and the debt finally clears with nobody\'s week eaten.' }]},
      { key: 'The escalation from an angry partner (they want someone senior, today)', opts: [
        { t: 'Have AI draft a careful, apologetic email; it is faster than a call.', pts: 1, coach: 'The judgment question at full volume: a relationship, live context, and a counterpart listening for whether they matter. An AI-drafted apology is a fumble even when every word is right, because the message is the sender.' },
        { t: 'Send the senior analyst; they need exposure to hard conversations.', pts: 2, coach: 'The growth instinct is right and the stakes are wrong. Stretch works where a fumble is affordable; an angry partner asking for seniority is not that day. Bring them to observe; the call is yours.' },
        { t: 'Take the call yourself today, with the senior analyst in the room to own the follow-up plan.', pts: 3, coach: 'Keep the judgment, share the exposure. The partner hears seniority, and the analyst still banks a rep: watching the call and owning what happens next. The keep-layer at its correct, small size.' }]}
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
          statusEl.textContent = ready ? 'Ready, run the quarter' :
            'Route ' + picks.filter(function (p) { return p === null; }).length + ' more task(s)';
          outEl.hidden = true;
        });
        d.appendChild(b);
      });
      slotsEl.appendChild(d);
    });
    var REACTIONS = {
      strong: 'Quarter end: the data pull costs minutes and the junior\'s verification log has real catches in it. The senior analyst has a client deck and a de-escalation follow-up on their record, and asks for harder work in the next one-on-one. The documentation debt is gone. And your calendar has judgment hours in it again, which the whole team can feel.',
      mid: 'Quarter end: everything shipped, and the quarter is lopsided. At least one task landed where it was easy instead of where it built something, so either somebody\'s growth got skipped or something circulates unverified. A quarter with no new rep in it is invisible now and expensive later; the routing worked for the tasks and not yet for the team.',
      weak: 'Quarter end: you are the bottleneck on three things, the junior is quietly bored, the partner got an email where a call was owed, and the documentation is still in the backlog. Nothing failed loudly. That is what hollowing out sounds like: nothing, for about a year, and then a role you cannot fill.'
    };
    runBtn.addEventListener('click', function () {
      var score = picks.reduce(function (t, p, i) { return t + SLOTS[i].opts[p].pts; }, 0); // 4..12
      var pct = Math.round((score / 12) * 100);
      var tier = score >= 11 ? 'strong' : score >= 8 ? 'mid' : 'weak';
      var head = tier === 'strong' ? 'A routed quarter. The mechanical layer went to the machine, the growth went to people, and the judgment kept its owner.'
               : tier === 'mid' ? 'Half a routing. Some tasks found the right lane; the misses came from reflex: a comfort-keep, a capacity-dump, or a handoff with no verifier.'
               : 'A busy quarter, never a designed one. Tasks went where reflex sent them, and the team ends the quarter exactly as capable as it started.';
      var coach = picks.map(function (p, i) { return '<div><b>' + SLOTS[i].key + ':</b> ' + SLOTS[i].opts[p].coach + '</div>'; }).join('');
      outEl.innerHTML = '<span class="tag">Quarter end · ' + score + ' / 12</span>' +
        '<div class="lab__meter"><span style="width:0"></span></div>' +
        '<p style="margin:0;color:#fff;font-weight:500">' + head + '</p>' +
        '<div class="sample">' + REACTIONS[tier] + '</div>' +
        '<div class="lab__coach">' + coach + '</div>' +
        (tier !== 'strong' ? '<p class="why" style="margin-top:1rem"><b>Try again:</b> rethink your weakest routing and rerun the quarter. Watch what changes at quarter end.</p>'
                           : '<p class="why" style="margin-top:1rem"><b>Now the real thing:</b> the pair drill in Go deeper runs the same test on the task you think is least routable.</p>');
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

  /* ---------- INTERACTIVE: Routing Card capstone ---------- */
  var planEl = $('#rdPlan');
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
      ai: { name: 'To AI, with a named verifier', move: 'Write the AI brief before you route: what it produces, from which inputs, to what standard. Then name the verifier, their source, and their power to reject. The handoff is not done until the verifier knows the check is theirs.' },
      stretch: { name: 'To a team member, as a stretch assignment', move: 'Brief it in four lines: outcome, context, checkpoints, struggle room. Say why you chose them; stretch lands differently when the person knows it was deliberate. Then hold the checkpoints and skip the rescues.' },
      split: { name: 'Split: AI drafts, the junior verifies and finishes', move: 'Two handoffs in one. AI gets the draft assignment; the junior gets verification ownership, sources and reject path included. Say out loud that the verification is a judgment rep, never a chore, and review their first few calls with them.' },
      keep: { name: 'Keep it, on purpose this time', move: 'Keeping is a routing decision too, and now it has a reason: name the judgment, relationship, or accountability that makes it yours. Then name the piece someone could still take: the observer seat, the follow-up plan, or the next one like it.' }
    };
    var NOT = {
      speed: 'Routing away a junior\'s learning rep for speed. Counter-move: before any task leaves for the AI lane, ask the growth question out loud. If the answer is yes, the test is over and the person gets the rep.',
      noverifier: 'Handing AI work with no named verifier. Counter-move: no AI routing turns on until a person owns the check, with a source and the power to reject. A delegation to AI is a delegation to the verifier.',
      habit: 'Keeping work out of habit that someone could grow on. Counter-move: once a month, list what only you did last week and ask of each item: judgment, or just familiarity? Familiar work is stretch waiting for a new owner.'
    };
    var WHEN = { tomorrow: 'tomorrow', threedays: 'within the next 3 days', week: 'within 7 days' };
    buildBtn.addEventListener('click', function () {
      if (!planReady()) return;
      var who = whoIn.value.trim();
      var p = PRACTICE[pick.practice];
      var rows = '' +
        '<div class="row"><b>The task</b><span>' + who.replace(/</g, '&lt;') + '</span></div>' +
        '<div class="row"><b>The destination</b><span>' + p.name + '. ' + p.move + '</span></div>' +
        '<div class="row"><b>What I will NOT do</b><span>' + NOT[pick.not] + '</span></div>' +
        '<div class="row"><b>The first move</b><span>The handoff conversation, ' + WHEN[pick.when] + ': fifteen minutes with the person or the verifier it needs. Outcome, context, checkpoint, said out loud.</span></div>' +
        '<div class="row"><b>The check</b><span>Two weeks out, one line: what did the routing free up, and what did the person or the verifier catch or learn? That line tells you whether to route the next task the same way.</span></div>';
      outEl2.innerHTML = '<span class="tag">My routing card</span>' +
        '<div class="plan__out-grid">' + rows + '</div>' +
        '<div class="lab__runrow" style="margin-top:1.25rem">' +
        '<button class="btn" id="planCopy">Copy my card</button>' +
        '<span class="quiz__progress" id="planCopied" style="color:rgba(255,255,255,.6)">Put the handoff conversation on the calendar now</span></div>';
      outEl2.hidden = false;
      $('#planCopy').addEventListener('click', function () {
        var text = 'MY ROUTING CARD (Delegating to AI and to People, Vanderbilt)\n' +
          'The task: ' + who + '\n' +
          'The destination: ' + p.name + '. ' + p.move + '\n' +
          'I will NOT: ' + NOT[pick.not] + '\n' +
          'First move: the handoff conversation ' + WHEN[pick.when] + '.\n' +
          'The check: after two weeks, one line on what the routing freed up and what the person or verifier caught or learned.';
        (navigator.clipboard ? navigator.clipboard.writeText(text) : Promise.reject()).then(function () {
          $('#planCopied').textContent = 'Copied. Paste it somewhere you\'ll see before the handoff.';
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
      { q: 'A manager routes everything routine to AI, reflexively. What does that actually cost?',
        opts: ['More than the AI subscription is worth', 'The apprenticeship: juniors lose the tasks they learn by, and the team hollows out quietly', 'Output quality, since AI drafts are usually worse than a junior\'s', 'Nothing, that is the recommended default'],
        correct: 1, why: 'The hollow team fails silently: everything ships, nobody grows, and the cost surfaces a year later when no one is ready for the next role. That is why routing is a design decision, never a reflex.' },
      { q: 'The Routing Test asks three questions in a fixed order. Which comes first, and why?',
        opts: ['Volume, because speed matters most this quarter', 'Judgment, because accountability is the manager\'s first duty', 'Growth, because it is the question AI-era managers forget when speed is on the table', 'The order doesn\'t matter as long as all three get asked'],
        correct: 2, why: 'Growth first is the method. Ask volume first and the meeting minutes and the junior\'s first memo look identical: both mechanical enough to automate. Growth first separates them in one breath.' },
      { q: 'The honest test that separates stretch work from grunt work is...',
        opts: ['Whether the task is billable', 'Is it hard because it is new, or hard because it is long? What did rep 30 teach that rep 3 did not?', 'Whether the junior enjoys doing it', 'Whether AI can do it at all'],
        correct: 1, why: 'New teaches; long repeats. Removing grunt is a favor, removing stretch is a theft, and the distinction only works when you look at the task through the junior\'s eyes.' },
      { q: 'AI just absorbed a big routine chunk of a role on your team. Role math says...',
        opts: ['Shrink the task list and bank the savings', 'Say nothing and let the person adjust on their own', 'Name what backfills the space, judgment reps, client contact, verification ownership, and say what the freed capacity is for', 'Wait for the organization to redesign the role from above'],
        correct: 2, why: 'Backfill named first, change announced second, purpose said out loud. A role redesigned with its owner grows; a role shrunk from a distance quietly starts job hunting.' },
      { q: 'Which of these tasks should stay with the manager?',
        opts: ['The recurring Monday data pull', 'First-pass minutes from the weekly call', 'The de-escalation call with a partner who wants someone senior', 'Reformatting survey feedback into a summary table'],
        correct: 2, why: 'The judgment question at full volume: relationship, context, accountability. The other three are volume-question tasks: AI\'s lane, each with a named verifier.' },
      { q: 'A complete delegation to AI includes...',
        opts: ['The draft assignment plus a named verifier with sources and the power to reject', 'Automation with no check, once the model has proven itself', 'A transfer of accountability to the tool', 'Whatever the fastest setup is, since AI work is easily undone'],
        correct: 0, why: 'A delegation to AI is really a delegation to the verifier. No verifier, no handoff, and the accountability for what ships never leaves you either way.' }
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
      var msg = pct >= 80 ? 'The method is loaded. The task you named is where it becomes real.' :
                pct >= 50 ? 'Solid. Revisit the sections you missed before the handoff conversation.' :
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


  // wheel advances the deck when the current screen has nothing left to scroll
  var wheelLock = 0;
  window.addEventListener('wheel', function (e) {
    var s = slides[current];
    if (!s) return;
    var now = Date.now();
    if (now - wheelLock < 900) return;
    var atBottom = s.scrollTop + s.clientHeight >= s.scrollHeight - 4;
    var atTop = s.scrollTop <= 4;
    if (e.deltaY > 24 && atBottom) { wheelLock = now; goTo(current + 1); }
    else if (e.deltaY < -24 && atTop && current > 0) { wheelLock = now; goTo(current - 1); }
  }, { passive: true });


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
