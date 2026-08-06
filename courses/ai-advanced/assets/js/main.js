/* =====================================================================
   AI 201: BEYOND THE BASICS — classroom deck interactions
   (vanilla JS, no dependencies)
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
    // excluded margin — reveal them directly
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

  /* ---------- Hero video: 3-clip montage with graceful fallback ---------- */
  var heroVideo = $('#heroVideo');
  if (heroVideo) {
    var killVideo = function () { if (heroVideo) { heroVideo.remove(); heroVideo = null; } };
    if (reduce) {
      killVideo();
    } else {
      var playlist = [];
      try { playlist = JSON.parse(heroVideo.getAttribute('data-playlist') || '[]'); } catch (e) {}
      if (!playlist.length) {
        killVideo();
      } else {
        var clip = 0, failures = 0;
        var playClip = function (i) {
          if (!heroVideo) return;
          clip = ((i % playlist.length) + playlist.length) % playlist.length;
          heroVideo.src = playlist[clip];
          var p = heroVideo.play && heroVideo.play();
          if (p && p.catch) p.catch(function () { /* autoplay blocked; canvas remains */ });
        };
        heroVideo.addEventListener('ended', function () { failures = 0; playClip(clip + 1); });
        heroVideo.addEventListener('error', function () {
          failures++;
          if (failures >= playlist.length) { killVideo(); }
          else { playClip(clip + 1); }
        });
        playClip(0);
      }
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

  /* ---------- INTERACTIVE: context window simulator (Section 01) ---------- */
  var ctxSim = $('#ctxSim');
  if (ctxSim) {
    var MESSAGES = [
      { who: 'You', text: 'Always answer in one sentence, and cite the policy section.' },
      { who: 'AI', text: 'Understood: one sentence, with the policy citation.' },
      { who: 'You', text: 'What counts as a travel day?' },
      { who: 'AI', text: 'A day with 4+ hours of work travel counts (Policy 7.1).' },
      { who: 'You', text: '…thirty more exchanges about travel, expenses, and receipts…' },
      { who: 'You', text: 'And how do meal receipts work abroad?' },
      { who: 'AI', text: 'Convert to USD at the transaction-date rate (Policy 7.4).' }
    ];
    var cStack = $('#ctxStack'), cSlider = $('#ctxSlider'), cAnswer = $('#ctxAnswer'), cVal = $('#ctxVal');
    MESSAGES.forEach(function (m) {
      var d = document.createElement('div');
      d.className = 'ctxsim__msg' + (m.who === 'AI' ? ' ctxsim__msg--ai' : '');
      d.innerHTML = '<b>' + m.who + ':</b> ' + m.text;
      cStack.appendChild(d);
    });
    var BANDS = [
      { max: 41, out: 0, label: 'Message 8 of a conversation',
        ans: '“You asked me to always answer in one sentence and cite the policy section.” ✓ The instruction is inside the window; every word of the chat still competes for attention.' },
      { max: 81, out: 2, label: 'Message 30, the window is filling',
        ans: '“You asked me to keep answers brief, I believe.” Partially right, and hedged: the instruction sits at the window\'s edge, losing the attention contest to thirty newer messages.' },
      { max: 121, out: 5, label: 'Message 60, deep in the marathon',
        ans: '“You didn\'t specify any formatting requirements in this conversation.” ✗ Not defiance: the instruction has scrolled out of the window entirely. For this answer, it never existed.' }
    ];
    var updCtx = function () {
      var v = +cSlider.value;
      var band = BANDS.find(function (b) { return v < b.max; }) || BANDS[BANDS.length - 1];
      $$('.ctxsim__msg', cStack).forEach(function (m, i) {
        m.classList.toggle('out', i < band.out);
      });
      cAnswer.textContent = band.ans;
      cVal.textContent = band.label;
    };
    cSlider.addEventListener('input', updCtx);
    updCtx();
  }

  /* ---------- INTERACTIVE: RAG on/off simulator (Section 02) ---------- */
  var ragSim = $('#ragSim');
  if (ragSim) {
    var ragOff = $('#ragOff'), ragOn = $('#ragOn'), ragAns = $('#ragAnswer'), ragSrc = $('#ragSource');
    var setRag = function (on) {
      ragOff.setAttribute('aria-pressed', String(!on));
      ragOn.setAttribute('aria-pressed', String(on));
      if (on) {
        ragAns.innerHTML = '<span class="tag" style="background:#8BA18E;color:#1c1c1c">Grounded answer</span><p style="margin:.6rem 0 0">“Up to <b>3 unused PTO days</b> carry over, and they must be used by March 31. Source: HR Policy 4.2, <em>Paid Time Off</em>, updated last month.”</p>';
        ragSrc.hidden = false;
        ragSrc.innerHTML = '<b>Retrieved before answering:</b> HR Policy 4.2 §3 — “A maximum of three (3) unused PTO days may be carried into the following calendar year and must be used by March 31.” <span style="opacity:.7">· source retrieved, cited, and clickable</span>';
      } else {
        ragAns.innerHTML = '<span class="tag" style="background:#c76b5a;color:#1c1c1c">Educated guess</span><p style="margin:.6rem 0 0">“Most organizations allow <b>5 unused PTO days</b> to carry over into the next calendar year, though some cap it at 10.”</p><p class="why" style="margin:.5rem 0 0">Fluent, confident, and generic: the model is guessing from frozen training data about other organizations. No source, because there isn\'t one.</p>';
        ragSrc.hidden = true;
      }
    };
    ragOff.addEventListener('click', function () { setRag(false); });
    ragOn.addEventListener('click', function () { setRag(true); });
    setRag(false);
  }

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

  /* Pick the method (Section 03) */
  makeTrainer({
    root: '#methodMatch', q: '#mmQ', options: '#mmOptions', feedback: '#mmFeedback',
    progress: '#mmProgress', next: '#mmNext', result: '#mmResult',
    progressWord: 'Request', goodColor: 'var(--vu-oak)',
    resultColor: 'var(--ink-soft, #555)', passAt: 4,
    passMsg: 'You run the framework in order: prompt first, retrieve when facts must be current, tune only for permanent change at scale.',
    failMsg: 'Close. The order is the framework: can a prompt fix it? Does it need current or internal facts? Does it need a PERMANENT behavior change worth real maintenance?',
    labels: ['Prompting', 'RAG', 'Fine-tuning'],
    items: [
      { q: '"Our team needs a chatbot that answers questions from our current, frequently-updated PTO policy."',
        answer: 1, why: 'Current, proprietary facts that change: retrieval territory. The model needs your documents, not new training.' },
      { q: '"I want better answers to one-off questions, and I don\'t want to change any settings or build anything."',
        answer: 0, why: 'Cheapest tool first: better prompting. No infrastructure, no maintenance, works today.' },
      { q: '"We want a support bot that always responds in our brand\'s exact tone and format, running for years across thousands of tickets."',
        answer: 2, why: 'A permanent behavior change at real scale: the one case where fine-tuning\'s cost and upkeep can earn out.' },
      { q: '"The grants office wants answers grounded in this year\'s federal guidelines, which change quarterly."',
        answer: 1, why: 'Quarterly-changing external facts: retrieval again. Fine-tuning would bake in guidance that\'s stale by the next quarter.' },
      { q: '"This one email needs to sound more formal before I send it to the provost\'s office."',
        answer: 0, why: 'A single output with a clear instruction: prompting, and probably a one-line prompt at that. Escalating further would be using a crane to lift an envelope.' }
    ]
  });

  /* Match the pattern (Section 04) */
  makeTrainer({
    root: '#patternMatch', q: '#pmQ', options: '#pmOptions', feedback: '#pmFeedback',
    progress: '#pmProgress', next: '#pmNext', result: '#pmResult',
    progressWord: 'Task', goodColor: 'var(--vu-gold-flat)',
    resultColor: 'rgba(255,255,255,.85)', passAt: 4,
    passMsg: 'You reach for the right pattern on sight. The drill in Go deeper puts one into a prompt you actually use.',
    failMsg: 'Close. The tells: examples to imitate → Few-Shot. Multi-step reasoning → Chain-of-Thought. Same structure every time → Template. Don\'t know what you need → Flipped.',
    labels: ['Few-Shot', 'Chain-of-Thought', 'Template', 'Flipped Interaction'],
    items: [
      { q: 'The model keeps formatting names wrong. You want "Last, First (Department)" every time, and telling it hasn\'t worked.',
        answer: 0, why: 'Show, don\'t tell: two or three worked examples of the exact format teach it faster than another paragraph of instructions.' },
      { q: 'A budget reallocation with several dependent calculations keeps coming back with subtle arithmetic and logic slips.',
        answer: 1, why: 'Multi-step and numeric: ask it to reason step by step. Accuracy improves measurably, and you can audit each step.' },
      { q: 'Your weekly status update must always have the same five sections in the same order, forever.',
        answer: 2, why: 'A recurring output with a fixed structure: hand it the template once, reuse it every week.' },
      { q: 'You need a project plan but honestly aren\'t sure what you need yet: scope, milestones, and staffing are all fuzzy.',
        answer: 3, why: 'When you can\'t specify the task, flip it: "ask me clarifying questions before you attempt this." The interview surfaces what you actually need.' },
      { q: 'Sorting 200 open-ended survey comments into your team\'s exact six category labels, and the labels are non-obvious.',
        answer: 0, why: 'Non-obvious labels want examples: a few correctly-labeled comments in the prompt beats a definition of each category.' }
    ]
  });

  /* Babysit the agent (Section 05) */
  makeTrainer({
    root: '#agentSpot', q: '#agQ', options: '#agOptions', feedback: '#agFeedback',
    progress: '#agProgress', next: '#agNext', result: '#agResult',
    progressWord: 'Trace', goodColor: 'var(--vu-oak)',
    resultColor: 'var(--ink-soft, #555)', passAt: 4,
    passMsg: 'You read traces like a reviewer. That skill IS the human checkpoint; the capstone decides where you\'ll stand.',
    failMsg: 'Close. The tells: wrong tool for the step, tool output misunderstood, or the same step repeating with no exit. And a trace that ends at a human checkpoint is a healthy one.',
    labels: ['Wrong tool call', 'Misread input or output', 'Infinite loop', 'No failure'],
    items: [
      { q: 'Goal: email the Q3 report to the team. Trace: plan drafted → agent searches the CALENDAR for "Q3 report" → no results → reports "the Q3 report does not exist."',
        answer: 0, why: 'Wrong tool call: it searched the calendar for a file. The report exists; the agent looked in the wrong drawer and then trusted the empty drawer.' },
      { q: 'Goal: summarize support tickets. Trace: ticket tool returns the message "0 results found (query timed out)" → agent writes "Great news: there were zero support tickets this week."',
        answer: 1, why: 'Misread output: it treated a timeout error as data. The tool spoke; the agent misunderstood what it said.' },
      { q: 'Goal: book a conference room. Trace: checks room A, taken → checks room A, taken → checks room A, taken… 47 identical attempts and counting.',
        answer: 2, why: 'Infinite loop: no exit condition and no strategy change. The fix is a step limit and an escalation path, never "let it keep trying."' },
      { q: 'Goal: draft renewal reminders. Trace: pulls the renewals list → drafts three emails → STOPS and queues them as "awaiting human review before send."',
        answer: 3, why: 'No failure, and notice the tell of a healthy trace: it ends at a checkpoint instead of at "sent." That design choice is the whole lesson.' },
      { q: 'Goal: remove duplicate rows from a spreadsheet. Trace: agent deletes EVERY row that appears more than once, including all the originals, and reports success.',
        answer: 1, why: 'Misread instructions: "remove duplicates" became "remove everything that has a duplicate." Plausible reading, destructive result, and exactly why destructive steps get a checkpoint.' }
    ]
  });

  /* Spot the hallucination (Section 06) */
  makeTrainer({
    root: '#hallSpot', q: '#hsQ', options: '#hsOptions', feedback: '#hsFeedback',
    progress: '#hsProgress', next: '#hsNext', result: '#hsResult',
    progressWord: 'Answer', goodColor: 'var(--vu-gold-flat)',
    resultColor: 'rgba(255,255,255,.85)', passAt: 5,
    passMsg: 'Sharp detector. Now the humbling part: the ones you caught had tells, and production hallucinations often don\'t. The habit beats the instinct.',
    failMsg: 'The point exactly: some of these fooled you, and they were TRYING to be catchable. Fluency and accuracy are separate qualities; verify facts, dates, numbers, names, and citations at the source.',
    labels: ['Accurate', 'Hallucinated'],
    items: [
      { q: 'AI answer: "According to the 2023 Harvard Business Review article \'The Meeting Audit\' by R. Chen, managers waste 31% of meeting time on recaps for latecomers."',
        answer: 1, why: 'Hallucinated: that article and author don\'t exist. The tell is a suspiciously specific citation you can\'t find; fabricated sources are the classic hallucination.' },
      { q: 'AI answer: "Excel\'s VLOOKUP searches the first column of a range and returns a value from a column you specify in the same row."',
        answer: 0, why: 'Accurate, and checkable in ten seconds against documentation. Notice it sounds no more or less confident than the fabricated ones.' },
      { q: 'AI answer: "The average office worker receives about 1,200 emails per day, which is why inbox-zero strategies fail."',
        answer: 1, why: 'Hallucinated: real estimates land near 100 to 120. Off by 10x, delivered smoothly, with a plausible-sounding conclusion attached to the fake number.' },
      { q: 'AI answer: "FERPA is a U.S. federal law that protects the privacy of student education records."',
        answer: 0, why: 'Accurate, and load-bearing for this campus. Grounding, citations, and your own verification all still apply when you act on it.' },
      { q: 'AI answer: "In Outlook, you can recall any sent email as long as you do it within 24 hours, regardless of the recipient\'s organization."',
        answer: 1, why: 'Hallucinated: recall only works inside the same organization, and only on unread mail. Absolute rules ("any," "regardless") where reality has exceptions are a tell.' },
      { q: 'AI answer: "Python is named after the snake, which is why its logo shows two intertwined snakes."',
        answer: 1, why: 'Hallucinated, subtly: the logo does show two snakes, but the language is named after Monty Python. Half-true answers are the hardest kind, because the checkable half checks out.' }
    ]
  });

  /* Tier the information (Section 07) */
  makeTrainer({
    root: '#tierSort', q: '#tsQ', options: '#tsOptions', feedback: '#tsFeedback',
    progress: '#tsProgress', next: '#tsNext', result: '#tsResult',
    progressWord: 'Item', goodColor: 'var(--vu-oak)',
    resultColor: 'var(--ink-soft, #555)', passAt: 4,
    passMsg: 'Tiering is a reflex now. Notice how fast it is: three seconds of classification prevents the incident that takes three months to clean up.',
    failMsg: 'Close. The rules: public or generic → green, any approved tool. Internal content → yellow, company-managed tools only. Anything touching students, health, personnel, donors, credentials, unpublished research, or contracts → red.',
    labels: ['🟢 Green', '🟡 Yellow', '🔴 Red'],
    items: [
      { q: 'The already-published marketing blurb for a public event, which you want punched up.',
        answer: 0, why: 'Green: it\'s already public. Any approved tool, no hesitation.' },
      { q: 'Your team\'s internal standard-operating-procedure document, to be summarized for onboarding.',
        answer: 1, why: 'Yellow: internal operational content. Company-managed tools only, where enterprise protections apply.' },
      { q: 'A spreadsheet of program participants with names, emails, and phone numbers, to be "cleaned up."',
        answer: 2, why: 'Red: personal data about real people. Named approval required, and honestly, this one probably shouldn\'t touch a generative tool at all.' },
      { q: 'A draft reorganization memo naming which roles move under which director, not yet announced.',
        answer: 2, why: 'Red: personnel decisions about identifiable people, pre-announcement. The blast radius of a leak makes this named-approval territory.' },
      { q: 'A general question about how to structure a pivot table, no data attached.',
        answer: 0, why: 'Green: generic how-to with nothing sensitive attached. The question is the content, and the question is public knowledge.' }
    ]
  });

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

  /* ---------- INTERACTIVE: Team AI Workflow capstone ---------- */
  var planEl = $('#flowPlan');
  if (planEl) {
    var pick = { pattern: null, check: null, tier: null };
    var taskIn = $('#planTask'), stepIn = $('#planStep'),
        buildBtn = $('#planBuild'), statusEl2 = $('#planStatus'), outEl2 = $('#planOut');
    function planReady() {
      var ok = taskIn.value.trim().length >= 8 && stepIn.value.trim().length >= 8 &&
               pick.pattern && pick.check && pick.tier;
      buildBtn.disabled = !ok;
      statusEl2.textContent = ok ? 'Ready, build it' : 'Fill in all five parts';
      return ok;
    }
    taskIn.addEventListener('input', planReady);
    stepIn.addEventListener('input', planReady);
    [['#planPattern', 'pattern', 'data-pattern'], ['#planCheck', 'check', 'data-check'], ['#planTier', 'tier', 'data-tier']].forEach(function (cfg) {
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
    var PATTERN = {
      fewshot: 'Few-Shot: keep two or three gold-standard examples in the prompt so every run imitates your best.',
      cot: 'Chain-of-Thought: require step-by-step reasoning so the logic is visible and auditable at the checkpoint.',
      template: 'Template: the prompt carries your exact output structure, so every run comes back in the same shape.',
      flipped: 'Flipped Interaction: the model interviews you first, so fuzzy runs start with clarifying questions instead of guesses.'
    };
    var CHECK = {
      spot: 'Spot-check a sample. Right for low-stakes volume; agree on the sample rate and who pulls it.',
      full: 'Full review, every output, before it ships. Right for external or consequential work.',
      named: 'Named approval: one accountable person signs off. Right for anything touching money, people, or commitments.'
    };
    var TIER = {
      green: { label: '🟢 Green: public or generic.', rule: 'Any approved tool works. Keep the checkpoint anyway; green data can still carry wrong answers.' },
      yellow: { label: '🟡 Yellow: internal content.', rule: 'Company-managed tools only (Amplify, VU-signed Copilot). The workflow stays inside enterprise protections.' },
      red: { label: '🔴 Red: sensitive data.', rule: 'Stop and get the named approval in writing before this workflow runs at all, or redesign the AI step so the sensitive data never enters the tool.' }
    };
    buildBtn.addEventListener('click', function () {
      if (!planReady()) return;
      var task = taskIn.value.trim(), step = stepIn.value.trim();
      var t = TIER[pick.tier];
      var rows = '' +
        '<div class="row"><b>Trigger</b><span>' + task.replace(/</g, '&lt;') + '</span></div>' +
        '<div class="row"><b>AI step</b><span>' + step.replace(/</g, '&lt;') + '</span></div>' +
        '<div class="row"><b>Pattern</b><span>' + PATTERN[pick.pattern] + '</span></div>' +
        '<div class="row"><b>Human checkpoint</b><span>' + CHECK[pick.check] + '</span></div>' +
        '<div class="row"><b>Governance tier</b><span>' + t.label + ' ' + t.rule + '</span></div>' +
        '<div class="row"><b>Output rule</b><span>Nothing ships until the checkpoint clears. The AI drafts; a human owns what goes out.</span></div>' +
        '<div class="row"><b>The commitment</b><span>I will run this workflow once, end to end, within 7 days, and note what the checkpoint catches.</span></div>';
      outEl2.innerHTML = '<span class="tag">My team AI workflow</span>' +
        '<div class="plan__out-grid">' + rows + '</div>' +
        '<div class="lab__runrow" style="margin-top:1.25rem">' +
        '<button class="btn" id="planCopy">Copy my workflow card</button>' +
        '<span class="quiz__progress" id="planCopied" style="color:rgba(255,255,255,.6)">Share it with one colleague for feedback before you leave</span></div>';
      outEl2.hidden = false;
      $('#planCopy').addEventListener('click', function () {
        var text = 'MY TEAM AI WORKFLOW (AI 201, Vanderbilt)\n' +
          'Trigger: ' + task + '\n' +
          'AI step: ' + step + '\n' +
          'Pattern: ' + PATTERN[pick.pattern] + '\n' +
          'Human checkpoint: ' + CHECK[pick.check] + '\n' +
          'Governance tier: ' + t.label + ' ' + t.rule + '\n' +
          'Output rule: nothing ships until the checkpoint clears.\n' +
          'Commitment: run it once within 7 days; note what the checkpoint catches.';
        (navigator.clipboard ? navigator.clipboard.writeText(text) : Promise.reject()).then(function () {
          $('#planCopied').textContent = 'Copied. Paste it into notes or email, then show a colleague.';
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
      { q: 'Deep in a long conversation, a model ignores your opening instruction. The mechanical reason is…',
        opts: ['It deprioritized you', 'The instruction fell outside the finite context window', 'Long chats corrupt the model\'s memory', 'The instruction was phrased impolitely'],
        correct: 1, why: 'The window is finite and re-read every turn. Outside it, the instruction doesn\'t exist for that answer.' },
      { q: 'RAG improves a chatbot\'s answers by…',
        opts: ['Making the model itself smarter', 'Retrieving real, current documents and answering from them', 'Removing the context window limit', 'Guaranteeing zero hallucinations'],
        correct: 1, why: 'Same model, trustworthy raw material. It grounds answers in your current sources; verification still applies.' },
      { q: 'A team wants answers from a policy that changes monthly. Best-fit method?',
        opts: ['Fine-tune a model on the policy', 'Prompt harder', 'RAG, retrieval from the current policy', 'Print the policy'],
        correct: 2, why: 'Changing, proprietary facts are retrieval\'s home turf. Fine-tuning would bake in a stale version every month.' },
      { q: 'A multi-step budget calculation keeps coming back subtly wrong. The pattern to reach for is…',
        opts: ['Few-Shot', 'Chain-of-Thought', 'Template', 'Flipped Interaction'],
        correct: 1, why: 'Step-by-step reasoning measurably improves multi-step accuracy, and lets your checkpoint audit the steps.' },
      { q: 'An agent retries the same failing search 47 times. The failure mode, and the right fix?',
        opts: ['Wrong tool; give it more tools', 'Infinite loop; add step limits and an escalation path', 'Misread output; trust it more', 'No failure; persistence is good'],
        correct: 1, why: 'No exit condition is an infinite loop. The fix is never "trust it more": scoped tools, step limits, human checkpoint.' },
      { q: 'The NIST AI Risk Management Framework\'s four functions are…',
        opts: ['Plan, Act, Observe, Repeat', 'Govern, Map, Measure, Manage', 'Prompt, Retrieve, Tune, Deploy', 'Green, Yellow, Red, Review'],
        correct: 1, why: 'Govern, Map, Measure, Manage: who decides, what\'s running, how well it works, and what you do about it.' }
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
      var msg = pct >= 80 ? 'The hood is open and you know what you\'re looking at. Build the workflow.' :
                pct >= 50 ? 'Solid. Revisit the sections you missed before your workflow runs for real.' :
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
