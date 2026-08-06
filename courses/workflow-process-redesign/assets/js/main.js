/* =====================================================================
   WORKFLOW & PROCESS REDESIGN, classroom deck
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

  /* ---------- Generic scenario trainer (used five times) ---------- */
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
    root: '#statGuess', q: '#sgQ', options: '#sgOptions', feedback: '#sgFeedback',
    progress: '#sgProgress', next: '#sgNext', result: '#sgResult',
    progressWord: 'Finding', goodColor: 'var(--vu-oak)',
    resultColor: 'var(--ink-soft, #555)', passAt: 3,
    passMsg: 'You called the research. The pattern in every number: the tools spread everywhere, and the value went only where the work was redesigned.',
    failMsg: 'Most rooms miss these, and that IS the finding: we assume adopting the tool is the hard part, while the data says the redesign is.',
    labels: [],
    items: [
      { q: 'McKinsey\'s State of AI survey: what share of organizations now use AI in at least one business function?',
        opts: ['About 40 percent', 'About 65 percent', 'Nearly 90 percent'],
        answer: 2, why: '88 percent. Adoption is essentially solved; if your team hasn\'t formally adopted AI, individuals on it have. The open question is what happens after adoption.' },
      { q: 'And what share clear McKinsey\'s bar for AI "high performers," where AI drives meaningful bottom-line impact?',
        opts: ['Around 6 percent', 'Around 25 percent', 'Around half'],
        answer: 0, why: 'Around 6 percent. Nearly nine in ten organizations use AI; fewer than one in ten gets serious value. That gap is the subject of this session.' },
      { q: 'Of organizations using gen AI, how many have fundamentally redesigned any workflows around it?',
        opts: ['About one in five', 'About half', 'About three in four'],
        answer: 0, why: 'About one in five (21 percent). Most organizations bolted the tool onto old processes and kept the old process problems, at higher speed.' },
      { q: 'High performers versus everyone else: how much more likely are they to have fundamentally redesigned workflows?',
        opts: ['About equally likely', 'About 1.3 times as likely', 'Nearly 3 times as likely'],
        answer: 2, why: '2.8 times: 55 percent of high performers versus 20 percent of the rest. Of everything McKinsey measured, redesign showed the strongest link to bottom-line impact.' }
    ]
  });

  /* Name the step (Section 02) */
  makeTrainer({
    root: '#stepSpot', q: '#ssQ', options: '#ssOptions', feedback: '#ssFeedback',
    progress: '#ssProgress', next: '#ssNext', result: '#ssResult',
    progressWord: 'Moment', goodColor: 'var(--vu-gold-flat)',
    resultColor: 'rgba(255,255,255,.85)', passAt: 4,
    passMsg: 'You can sight-read a workflow. Now do it to your own: the private mapper below is waiting.',
    failMsg: 'Close. The tells: collecting inputs is gather, shaping a first version is transform, checking against standards is judge, and owning the outcome is commit.',
    labels: ['Gather', 'Transform', 'Judge', 'Commit'],
    items: [
      { q: 'An analyst spends two hours pulling last week\'s ticket counts out of three different systems into one sheet.',
        answer: 0, why: 'Collecting inputs from wherever they live: a gather step. High volume, low judgment, and the classic Monday-morning grind.' },
      { q: 'The team lead turns the raw meeting notes into the first draft of the client update.',
        answer: 1, why: 'Inputs in, first version out: a transform step. The shaping is mechanical even when the words are polished.' },
      { q: 'The account manager reads the draft update and checks its numbers against the source sheet before it goes anywhere.',
        answer: 2, why: 'Checking work against sources and standards: a judge step. Notice it needs someone who knows what wrong looks like.' },
      { q: 'The account manager hits send, putting the team\'s name on what the client reads.',
        answer: 3, why: 'The commit step: the decision and the accountability. Whoever sends it answers for it, which is why this step behaves differently.' },
      { q: 'The director weighs three vendor proposals and picks which one gets the contract.',
        answer: 3, why: 'A commit step again: judgment plus accountability plus consequences. Money moves and a relationship starts; this is the kind of step the pattern keeps human.' }
    ]
  });

  /* Assign the step (Section 03) */
  makeTrainer({
    root: '#assignStep', q: '#asQ', options: '#asOptions', feedback: '#asFeedback',
    progress: '#asProgress', next: '#asNext', result: '#asResult',
    progressWord: 'Step', goodColor: 'var(--vu-oak)',
    resultColor: 'var(--ink-soft, #555)', passAt: 4,
    passMsg: 'The pattern is installed. In the lab you\'ll feel what happens when an assignment is wrong, which is how it becomes instinct.',
    failMsg: 'Close. The sorting questions: is this step volume or judgment? And if it\'s wrong, who gets hurt and how fast would we find out?',
    labels: ['AI drafts', 'A human verifies', 'A human decides'],
    items: [
      { q: 'Writing the first pass of the weekly status update from the project tracker\'s data.',
        answer: 0, why: 'A transform step: high volume, mechanical shaping, errors catchable downstream. Exactly what drafting is for, as long as a verify step follows.' },
      { q: 'Checking that status update\'s claims against what actually happened this week before it ships.',
        answer: 1, why: 'The verify step, and it needs a named human with sources open. A draft without this step is a rumor with good formatting.' },
      { q: 'Choosing which of three final candidates gets the job offer.',
        answer: 2, why: 'A commit step about a person: judgment, accountability, and red-light data all in one. AI can help earlier in the funnel with public materials; the decision stays human.' },
      { q: 'Summarizing 40 open customer tickets into themes for the ops meeting.',
        answer: 0, why: 'Pure volume condensation, the strongest draft candidate there is. The verify design for it is the group drill in the next section.' },
      { q: 'Signing off that the quarter\'s budget reallocation is right before it goes to finance.',
        answer: 2, why: 'A commit step: the signature carries the accountability. AI can draft the reallocation table upstream; the sign-off is precisely what cannot be delegated.' }
    ]
  });

  /* Rate the check (Section 04) */
  makeTrainer({
    root: '#checkRate', q: '#crQ', options: '#crOptions', feedback: '#crFeedback',
    progress: '#crProgress', next: '#crNext', result: '#crResult',
    progressWord: 'Setup', goodColor: 'var(--vu-oak)',
    resultColor: 'var(--ink-soft, #555)', passAt: 4,
    passMsg: 'You can hear the difference between a check and a ritual. Now design one for real in the group drill below.',
    failMsg: 'Close. The tells: real verification has a named owner, real sources, and a reject path. A rubber stamp has vibes. A wrong-sized check spends scarce attention where the stakes don\'t justify it.',
    labels: ['Real verification', 'Rubber stamp', 'Wrong-sized check'],
    items: [
      { q: 'The AI drafts the client email; the account lead reads it against the meeting notes and this quarter\'s goals before sending.',
        answer: 0, why: 'Named owner, real sources, clear standard. This is the pattern working as designed.' },
      { q: 'The AI summarizes the week\'s tickets; whoever happens to be free skims it and forwards it if nothing looks weird.',
        answer: 1, why: 'No owner, no source, and "looks weird" is a vibe, not a standard. This check will pass everything, right up until the miss that matters.' },
      { q: 'The AI drafts internal meeting agendas; two senior managers independently review every agenda line by line.',
        answer: 2, why: 'The stakes are an internal agenda; the check costs more than the work. Over-verification is real: it burns scarce attention and teaches people that checking is theater.' },
      { q: 'The AI drafts the compliance summary; the reviewer checks three random claims against source documents every time, and every miss gets logged.',
        answer: 0, why: 'Sampling with teeth: rotating spot checks plus a log. The log is the tell; it means someone can see the catch rate moving.' },
      { q: 'The AI routes incoming requests to the right queue; nobody has ever overridden it, which the team reads as proof it works.',
        answer: 1, why: 'A check that has never fired is either perfection or nobody looking, and only one of those is common. Zero overrides is a warning light, not a trophy.' }
    ]
  });

  /* Judge the announcement (Section 06) */
  makeTrainer({
    root: '#sayJudge', q: '#sjQ', options: '#sjOptions', feedback: '#sjFeedback',
    progress: '#sjProgress', next: '#sjNext', result: '#sjResult',
    progressWord: 'Line', goodColor: 'var(--vu-oak)',
    resultColor: 'var(--ink-soft, #555)', passAt: 4,
    passMsg: 'Your ear is calibrated: checkable claims, named owners, honest purpose. Now draft your own line in the group activity.',
    failMsg: 'Close. The tells: a good setup names the workflow, the owner, the metric, and the review date. Fear and hype talk about people and magnitudes; vagueness names nothing that could be checked.',
    labels: ['Sets up the pilot well', 'Breeds fear or hype', 'Too vague to change anything'],
    items: [
      { q: '"We\'re piloting AI on the numbers pull for four weeks. Sam owns the checks, the metric is hours saved and errors caught, and we review together on the 30th. Nothing else changes until we see the data."',
        answer: 0, why: 'Every claim is checkable: one workflow, a named owner, a visible metric, a review date, and an explicit limit. This line can be believed.' },
      { q: '"Leadership wants us using AI more, so please start finding ways to use it where you can."',
        answer: 2, why: 'No workflow, no owner, no metric, no date. Six months later this team has shortcuts, no redesign, and a manager who thinks the initiative happened.' },
      { q: '"Good news: AI will handle the report going forward, which frees up headcount for higher-value work."',
        answer: 1, why: '"Frees up headcount" lands on a team as "one of us is the efficiency." Whatever was meant, fear does the interpreting, and fear makes sure the pilot fails.' },
      { q: '"This pilot exists to buy back your Monday mornings for client work, and you\'ll design the checks yourselves: you know where this report bites us."',
        answer: 0, why: 'Honest purpose, doers own the verification, and the saved hours have a named destination. This is the pilot standard in one sentence.' },
      { q: '"AI is going to 10x this team. Everything changes starting Monday."',
        answer: 1, why: 'Hype is fear wearing a party hat: unbounded claims, everything at once, nothing checkable. Redesign runs one workflow at a time or it isn\'t design.' }
    ]
  });

  /* ---------- INTERACTIVE: private workflow mapper (Section 02) ---------- */
  var wfm = $('#wfMap');
  if (wfm) {
    var wName = $('#wfName'), wGrind = $('#wfGrind'), wJudge = $('#wfJudge'),
        wBtn = $('#wfBuild'), wStatus = $('#wfStatus'), wOut = $('#wfOut');
    var wfReady = function () {
      var ok = wName.value.trim().length >= 5 && wGrind.value.trim().length >= 5 && wJudge.value.trim().length >= 5;
      wBtn.disabled = !ok;
      wStatus.textContent = ok ? 'Ready, map it' : 'Fill in all three';
      return ok;
    };
    [wName, wGrind, wJudge].forEach(function (el) { el.addEventListener('input', wfReady); });
    wBtn.addEventListener('click', function () {
      if (!wfReady()) return;
      var esc = function (t) { return t.replace(/</g, '&lt;'); };
      wOut.innerHTML = '<span class="tag">My workflow map · private</span>' +
        '<div class="plan__out-grid">' +
        '<div class="row"><b>The workflow</b><span>' + esc(wName.value.trim()) + '</span></div>' +
        '<div class="row"><b>The grind (gather, transform)</b><span>' + esc(wGrind.value.trim()) + '. This is your first draft candidate: high volume, low judgment, and the hours you want back.</span></div>' +
        '<div class="row"><b>The judgment (judge, commit)</b><span>' + esc(wJudge.value.trim()) + '. This stays human; a redesign that hands this step to a tool has left the pattern.</span></div>' +
        '<div class="row"><b>What the map says</b><span>The distance between those two steps is your redesign: AI drafts the grind, a named human verifies, and the judgment keeps its owner.</span></div>' +
        '<div class="row"><b>The move</b><span>Hold onto this map. Section 03 assigns its steps, section 04 designs its check, and the capstone puts a date on it.</span></div>' +
        '</div>';
      wOut.hidden = false;
      wOut.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'nearest' });
    });
  }

  /* ---------- INTERACTIVE: The Redesign Lab (Section 05) ---------- */
  var lab = $('#redesignLab');
  if (lab) {
    var SLOTS = [
      { key: 'Pull the numbers (gather)', opts: [
        { t: 'Keep it fully manual; the analyst knows where everything lives.', pts: 1, coach: 'Three systems, every Monday, zero judgment: this is exactly the mechanical volume the draft assignment exists for. Keeping it manual spends your scarcest hours on your most mechanical work.' },
        { t: 'AI pulls and formats the numbers; nobody re-checks, the systems are usually right.', pts: 2, coach: 'Right assignment, missing check. "Usually right" is how a wrong figure gets four weeks of momentum before a client finds it for you.' },
        { t: 'AI assembles the numbers into the template; the analyst spot-checks two figures against the source systems.', pts: 3, coach: 'Draft assigned to the volume, verification with an owner and a source. The step now costs minutes and still has someone watching it.' }]},
      { key: 'Write the update (transform)', opts: [
        { t: 'The manager keeps writing it from scratch; clients can tell when a machine wrote it.', pts: 1, coach: 'What clients can actually tell is when nobody verified it. Scratch-writing spends the manager\'s judgment hours on transcription, the exact trade the pattern exists to reverse.' },
        { t: 'AI drafts it from the numbers plus last week\'s update; the analyst sends it along when it reads well.', pts: 2, coach: '"Reads well" is plausibility, and plausibility is what AI is best at faking. The draft assignment was right; the missing standard is the problem.' },
        { t: 'AI drafts from the numbers and the account plan; the account lead rewrites the two judgment paragraphs, risks and asks.', pts: 3, coach: 'The machine does the shaping, the human rewrites exactly where judgment lives. This is the draft assignment at its best.' }]},
      { key: 'Check it (judge)', opts: [
        { t: 'A peer gives it a quick once-over if they have time.', pts: 1, coach: 'No owner, no source, no reject path: a rubber stamp with good intentions. This is the check that fails in week three, quietly.' },
        { t: 'The account lead reads the whole thing carefully before it goes.', pts: 2, coach: 'An owner now, but "carefully" against what? Without a source and a standard, attention fades and the read becomes a skim by week six.' },
        { t: 'The account lead checks every number against the source pull, reads the risks paragraph against this week\'s notes, and logs any miss.', pts: 3, coach: 'Named owner, real sources, and a log that makes drift visible. This check can fail, which is what makes it a check.' }]},
      { key: 'Send it and own it (commit)', opts: [
        { t: 'Auto-send every Friday at 4; the process is solid now.', pts: 1, coach: 'The client relationship just became nobody\'s job. Commit steps carry accountability, and accountability is the one thing in this workflow that cannot be automated.' },
        { t: 'The analyst sends it once the checks pass.', pts: 2, coach: 'Workable, but the client reads that send as the relationship speaking. The call about what this client hears belongs with whoever owns the account.' },
        { t: 'The account lead makes the final call and sends; owning what the client hears is the job.', pts: 3, coach: 'The decision stays with the accountable human, and thanks to the redesign it now costs minutes instead of the morning.' }]}
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
          statusEl.textContent = ready ? 'Ready, run the month' :
            'Choose ' + picks.filter(function (p) { return p === null; }).length + ' more step(s)';
          outEl.hidden = true;
        });
        d.appendChild(b);
      });
      slotsEl.appendChild(d);
    });
    var REACTIONS = {
      strong: 'Week four: Monday costs 40 minutes instead of half a day. The analyst\'s spot check caught two bad numbers before any client saw them, the miss log has real entries, and the account lead spends the recovered time on the two accounts that are wobbling. The team trusts the process because they can see it working.',
      mid: 'Week four: faster, technically. But a wrong figure reached a client in week three, and now everyone quietly re-checks everything, so the saved hours are gone. The team\'s verdict is forming: the weak parts of the design are deciding the whole redesign\'s reputation.',
      weak: 'Week four: the report ships fast and nobody trusts it. A client caught the error your process didn\'t, the team went back to the old way without telling you, and "we tried AI, it didn\'t work" is now the story. The tool took the blame for the design.'
    };
    runBtn.addEventListener('click', function () {
      var score = picks.reduce(function (t, p, i) { return t + SLOTS[i].opts[p].pts; }, 0); // 4..12
      var pct = Math.round((score / 12) * 100);
      var tier = score >= 11 ? 'strong' : score >= 8 ? 'mid' : 'weak';
      var head = tier === 'strong' ? 'A real redesign. The volume went to the machine, the judgment kept its owners, and the checks have teeth.'
               : tier === 'mid' ? 'Half a redesign. The draft assignments are right, and the soft spots in the verify are where week three finds you.'
               : 'A speed-up wearing a redesign\'s clothes. Fast drafts flowing past soft checks toward an unowned commit is how AI failures reach clients.';
      var coach = picks.map(function (p, i) { return '<div><b>' + SLOTS[i].key + ':</b> ' + SLOTS[i].opts[p].coach + '</div>'; }).join('');
      outEl.innerHTML = '<span class="tag">Four weeks in · ' + score + ' / 12</span>' +
        '<div class="lab__meter"><span style="width:0"></span></div>' +
        '<p style="margin:0;color:#fff;font-weight:500">' + head + '</p>' +
        '<div class="sample">' + REACTIONS[tier] + '</div>' +
        '<div class="lab__coach">' + coach + '</div>' +
        (tier !== 'strong' ? '<p class="why" style="margin-top:1rem"><b>Try again:</b> strengthen your weakest step and rerun the month. Watch week three change.</p>'
                           : '<p class="why" style="margin-top:1rem"><b>Now the real thing:</b> the pair drill in Go deeper finds the week-three failure in YOUR workflow.</p>');
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

  /* ---------- INTERACTIVE: Redesign Card capstone ---------- */
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
      gather: { name: 'AI drafts the gather step', move: 'AI pulls and formats the inputs; a named person spot-checks a sample against the source systems every single time, and misses get logged.' },
      write: { name: 'AI drafts the first written pass', move: 'AI drafts from the real sources; the owner rewrites the judgment paragraphs and checks every claim against the tracker before anything ships.' },
      summarize: { name: 'AI drafts the summary step', move: 'AI condenses the volume into themes; the verifier traces a few items back to the raw material each round, so the summary never becomes a rumor.' },
      map: { name: 'Map before assigning', move: 'Run the 30-minute mapping session first: real steps, tagged gather, transform, judge, commit, with the doers in the room. The draft step will pick itself.' }
    };
    var NOT = {
      decide: 'Letting AI drift into the decide step. Counter-move: write the workflow\'s decide steps down and name their owners; anything with accountability keeps a human signature.',
      noverify: 'Running drafts without a named verifier. Counter-move: no draft step turns on until its check has an owner, a source, and a reject path, designed by whoever does the work.',
      efficiency: 'Announcing it as an efficiency play. Counter-move: name what the saved hours are FOR, out loud, in the first sentence, and put the metric where the team can see it.'
    };
    var WHEN = { tomorrow: 'tomorrow', threedays: 'within the next 3 days', week: 'within 7 days' };
    buildBtn.addEventListener('click', function () {
      if (!planReady()) return;
      var who = whoIn.value.trim();
      var p = PRACTICE[pick.practice];
      var rows = '' +
        '<div class="row"><b>The workflow</b><span>' + who.replace(/</g, '&lt;') + '</span></div>' +
        '<div class="row"><b>The first draft step</b><span>' + p.name + '. ' + p.move + '</span></div>' +
        '<div class="row"><b>What I will NOT do</b><span>' + NOT[pick.not] + '</span></div>' +
        '<div class="row"><b>The first move</b><span>The mapping session with the team, ' + WHEN[pick.when] + ': 30 minutes, one whiteboard, the people who actually do the work.</span></div>' +
        '<div class="row"><b>The metric</b><span>Hours saved and errors caught, posted where the team can see both, reviewed together at the end of the pilot.</span></div>' +
        '<div class="row"><b>The evidence</b><span>After two weeks, one line: what does Monday cost now, and what did the checks catch? That line decides iteration two.</span></div>';
      outEl2.innerHTML = '<span class="tag">My redesign card</span>' +
        '<div class="plan__out-grid">' + rows + '</div>' +
        '<div class="lab__runrow" style="margin-top:1.25rem">' +
        '<button class="btn" id="planCopy">Copy my card</button>' +
        '<span class="quiz__progress" id="planCopied" style="color:rgba(255,255,255,.6)">Put the mapping session on the calendar now</span></div>';
      outEl2.hidden = false;
      $('#planCopy').addEventListener('click', function () {
        var text = 'MY REDESIGN CARD (Workflow & Process Redesign, Vanderbilt)\n' +
          'The workflow: ' + who + '\n' +
          'First draft step: ' + p.name + '. ' + p.move + '\n' +
          'I will NOT: ' + NOT[pick.not] + '\n' +
          'First move: team mapping session ' + WHEN[pick.when] + '.\n' +
          'Metric: hours saved + errors caught, visible to the team.\n' +
          'Evidence: after two weeks, one line on what Monday costs now and what the checks caught.';
        (navigator.clipboard ? navigator.clipboard.writeText(text) : Promise.reject()).then(function () {
          $('#planCopied').textContent = 'Copied. Paste it somewhere you\'ll see before the mapping session.';
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
      { q: 'In McKinsey\'s State of AI research, the practice most strongly linked to bottom-line impact from gen AI is…',
        opts: ['Adopting the most capable models', 'Fundamentally redesigning workflows', 'Hiring dedicated AI teams', 'Increasing AI spend year over year'],
        correct: 1, why: 'Redesign beat every other factor they measured. High performers are 2.8 times more likely to have done it, and almost everyone else hasn\'t.' },
      { q: 'The right order for a redesign is…',
        opts: ['Pick a tool, then find uses for it', 'Automate the longest step first and iterate', 'Map the workflow, assign draft-verify-decide per step, then pilot with a metric', 'Wait until the models stop changing'],
        correct: 2, why: 'Map, assign, pilot. Tools come last because the gains live in the steps, handoffs, and checks, and you can\'t assign steps you haven\'t seen.' },
      { q: 'Which step is the best candidate for "AI drafts"?',
        opts: ['A high-volume gather or transform step with catchable errors', 'The final sign-off, to save the most senior time', 'Any step touching private information about people', 'The step the team enjoys most'],
        correct: 0, why: 'Volume with catchable errors is where drafting pays. Sign-offs are commit steps, and red-light data stays out of unapproved tools entirely.' },
      { q: 'A verify step is real when…',
        opts: ['Someone reliable promises to be careful', 'It has a named owner, real sources, and a logged reject path', 'The AI double-checks its own output', 'It has never caught an error, proving the drafts are good'],
        correct: 1, why: 'Owner, sources, reject path, log. And a check that has never fired is a warning light: it usually means nobody is looking, which is automation bias doing its quiet work.' },
      { q: 'Under the pattern, which of these always stays with a human?',
        opts: ['Formatting the weekly numbers', 'Summarizing long threads', 'The commit step: decisions that carry accountability', 'Writing first drafts of routine updates'],
        correct: 2, why: 'Send, approve, spend, hire: accountability doesn\'t delegate to a tool. The other three are classic draft candidates, with verification behind them.' },
      { q: 'What makes a team trust a redesign pilot?',
        opts: ['Announcing it with maximum enthusiasm', 'Keeping the details quiet until the results are in', 'Doers design the checks, the metric is visible, and the saved hours have an honest, stated purpose', 'Guaranteeing the pilot will succeed'],
        correct: 2, why: 'Checkable claims build trust: named workflow, named owner, visible metric, honest purpose. Vagueness gets filled with the scariest available story.' }
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
      var msg = pct >= 80 ? 'The method is loaded. The workflow you named is where it becomes real.' :
                pct >= 50 ? 'Solid. Revisit the sections you missed before the mapping session.' :
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
