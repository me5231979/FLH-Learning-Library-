/* =====================================================================
   LEADING AI ADOPTION, classroom deck
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

  /* Model, mandate, or undermine? (Section 01) */
  makeTrainer({
    root: '#modelJudge', q: '#mjQ', options: '#mjOptions', feedback: '#mjFeedback',
    progress: '#mjProgress', next: '#mjNext', result: '#mjResult',
    progressWord: 'Move', goodColor: 'var(--vu-oak)',
    resultColor: 'var(--ink-soft, #555)', passAt: 4,
    passMsg: 'Your ear is calibrated: modeling is visible, honest, and specific. Mandates and silence both teach the wrong lesson.',
    failMsg: 'Close. The tells: modeling shows real use, real checks, and real misses. Mandates demand what the leader won\'t show. And silence, or drive-by cynicism, teaches the team the subject is unsafe.',
    labels: ['Models adoption well', 'Mandates without modeling', 'Quietly undermines it'],
    items: [
      { q: 'In the staff meeting, the manager walks through how they drafted the budget memo with AI, including the figure it got wrong and how the check against the tracker caught it.',
        answer: 0, why: 'The complete move: real use, real check, real miss. The team just learned that AI is usable, checkable, and safe to be imperfect with.' },
      { q: '"Everyone logs three AI uses a week; it\'s in your goals now." The manager\'s own use: nobody has ever seen it.',
        answer: 1, why: 'A quota without a model. Gallup\'s data is blunt about this: mandates without manager modeling produce compliance theater and hidden shortcuts, not adoption.' },
      { q: 'The manager forwards the university\'s AI policy, uses AI privately every day, and never mentions it to the team.',
        answer: 2, why: 'Invisible use teaches nothing, and the silence teaches something worse: that the subject is unspoken here. The team reads the quiet as risk.' },
      { q: 'A 15-minute "show your prompts" round each month: real uses, real prompts, misses welcome, manager goes first.',
        answer: 0, why: 'The cheapest adoption program that exists. Manager-first sets the safety; misses-welcome sets the honesty; monthly sets the habit.' },
      { q: '"I tried it once, it made something up, so I\'d be careful relying on it." The manager\'s only public statement on AI, ever.',
        answer: 2, why: 'One anecdote, framed as a warning, doing the work of a policy. The team hears "don\'t," and the shortcuts that exist anyway go underground where no guardrail reaches them.' }
    ]
  });

  /* Which rail is missing? (Section 02) */
  makeTrainer({
    root: '#railSpot', q: '#rsQ', options: '#rsOptions', feedback: '#rsFeedback',
    progress: '#rsProgress', next: '#rsNext', result: '#rsResult',
    progressWord: 'Situation', goodColor: 'var(--vu-gold-flat)',
    resultColor: 'rgba(255,255,255,.85)', passAt: 4,
    passMsg: 'You can diagnose an incident to its missing rail, which means you can prevent the next one with a sentence on a page.',
    failMsg: 'Close. The tells: wrong data in a tool is the data rail. Unreviewed output that moved is the sign-off rail. Nobody\'s name on a result is the ownership rail.',
    labels: ['The data rail is missing', 'The sign-off rail is missing', 'The ownership rail is missing'],
    items: [
      { q: 'A teammate pastes a donor list into a free online tool "because it\'s faster."',
        answer: 0, why: 'Private information about people in an unapproved tool: the data rail, and it\'s the rail with no exceptions. The light goes on the wall so nobody has to guess.' },
      { q: 'An AI-drafted reply goes out to a department chair with a meeting date that\'s wrong. Nobody had read it before it sent.',
        answer: 1, why: 'Outbound and unreviewed: the sign-off rail. "Outbound, high-stakes, or about people gets eyes" would have caught this at the cost of one read.' },
      { q: 'The quarterly report was wrong, and in the retro everyone points at "the AI." No one\'s name was ever on it.',
        answer: 2, why: 'The ownership rail: you own what you ship, whoever drafted it. A result nobody answers for is a result nobody checked.' },
      { q: 'The AI meeting summary auto-posts to the shared channel, and one week it states a decision the meeting never made.',
        answer: 1, why: 'Publishing without review is a sign-off gap, automated. Auto-posting is fine for raw notes; anything that reads as a record of decisions gets a human eye first.' },
      { q: 'Two people each assumed the other was checking the AI-triaged request queue. A request sat for nine days.',
        answer: 2, why: 'Ownership again, in its quieter form: a step with two possible owners has zero. Every AI-assisted step gets exactly one name.' }
    ]
  });

  /* ---------- INTERACTIVE: The AI-enabled work audit (Section 03) ---------- */
  var audit = $('#workAudit');
  if (audit) {
    var DIMS = [
      { id: 'auUse', label: 'Where AI shows up', max: 3,
        move: 'Pick ONE repeated output and design it properly: AI drafts, a named person verifies against sources, you own the send. One designed workflow beats ten shortcuts.' },
      { id: 'auModel', label: 'Visible modeling', max: 3,
        move: 'Narrate one real AI use at the next team meeting: what you used it for, what the check caught, what you\'d do differently. Three sentences, this week.' },
      { id: 'auRails', label: 'Guardrails', max: 3,
        move: 'Book 30 minutes with the team and write the three rails on one page: the data light, the sign-off line, the ownership sentence. Post it where the work happens.' },
      { id: 'auTalk', label: 'Coaching conversations', max: 3,
        move: 'Add one question to your 1:1s: "what have you tried with AI lately, and what did you learn?" Ask it every time; the answers become your development map.' }
    ];
    var vals = { auUse: null, auModel: null, auRails: null, auTalk: null };
    var workIn = $('#auWork'), runBtn = $('#auRun'), statusEl3 = $('#auStatus'), outEl3 = $('#auOut');
    function auReady() {
      var ok = workIn.value.trim().length >= 8 && DIMS.every(function (d) { return vals[d.id] !== null; });
      runBtn.disabled = !ok;
      statusEl3.textContent = ok ? 'Ready, score it' : 'Answer all five';
      return ok;
    }
    workIn.addEventListener('input', auReady);
    DIMS.forEach(function (d) {
      var group = $('#' + d.id);
      $$('.opt', group).forEach(function (b) {
        b.addEventListener('click', function () {
          vals[d.id] = parseInt(b.getAttribute('data-v'), 10);
          $$('.opt', group).forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
          outEl3.hidden = true;
          auReady();
        });
      });
    });
    runBtn.addEventListener('click', function () {
      if (!auReady()) return;
      var score = DIMS.reduce(function (t, d) { return t + vals[d.id]; }, 0); // 0..12
      var pct = Math.round((score / 12) * 100);
      var tier = score >= 10 ? 'lead' : score >= 6 ? 'found' : 'shadow';
      var head = tier === 'lead' ? 'Adoption leader. Your team can see the use, the rules, and the point. Keep compounding: the audit\'s job now is catching drift.'
               : tier === 'found' ? 'Foundations laid. Something real exists, and one or two dimensions are carrying the others. You are one visible move from momentum.'
               : 'Shadow adoption. Your team is almost certainly using AI; they\'re just doing it where you can\'t see it, without rails, alone. The good news: every fix on this list is cheap.';
      var sample = tier === 'lead' ?
        'What the research says about teams like yours: keep the modeling visible and the audit quarterly. The risk at this stage is quiet drift: checks going soft, new people never seeing the rails. Your repeated outputs (' + workIn.value.trim().replace(/</g, '&lt;') + ') are where the next designed workflow comes from.'
        : tier === 'found' ?
        'What the research says: manager modeling and workflow integration are the two strongest predictors of frequent team AI use (Gallup), and both are within your reach this month. Your repeated outputs (' + workIn.value.trim().replace(/</g, '&lt;') + ') are the raw material: one of them becomes the designed workflow.'
        : 'What the research says: without visible modeling and guardrails, teams use AI anyway, unmanaged, which is the worst of both worlds. Gallup\'s data puts the fix in your hands specifically: the manager\'s visible use is the strongest human predictor there is. Start with the smallest move below.';
      var sorted = DIMS.map(function (d) { return { d: d, v: vals[d.id] }; })
        .sort(function (a, b) { return a.v - b.v; });
      var moves = sorted.slice(0, 3).map(function (x, i) {
        return '<div class="row"><b>Move ' + (i + 1) + ' · ' + x.d.label + ' (' + x.v + '/' + x.d.max + ')</b><span>' + x.d.move + '</span></div>';
      }).join('');
      outEl3.innerHTML = '<span class="tag">My work audit · ' + score + ' / 12</span>' +
        '<div class="lab__meter"><span style="width:0"></span></div>' +
        '<p style="margin:0;color:#fff;font-weight:500">' + head + '</p>' +
        '<div class="sample">' + sample + '</div>' +
        '<div class="plan__out-grid" style="margin-top:1rem">' + moves +
        '<div class="row"><b>The cadence</b><span>Rerun this audit quarterly, and once with your team in the room scoring question 3 about you. Rising scores are your adoption metric.</span></div>' +
        '</div>' +
        '<p class="why" style="margin-top:1rem"><b>Next:</b> the capstone turns your lowest dimension into a dated first move.</p>';
      outEl3.hidden = false;
      requestAnimationFrame(function () {
        var bar = $('.lab__meter span', outEl3);
        if (bar) requestAnimationFrame(function () { bar.style.width = Math.max(pct, 6) + '%'; });
      });
      outEl3.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'nearest' });
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

  /* ---------- INTERACTIVE: Adoption Plan capstone ---------- */
  var planEl = $('#adPlan');
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
      narrate: { name: 'The narrated use', move: 'At the team meeting: what you used AI for, what the check caught, what you\'d do differently. Three sentences, spoken plainly, no slides.' },
      prompts: { name: 'Show your prompts', move: 'Fifteen minutes: real uses, real prompts, real misses. You go first, and your example includes the check. Monthly after that.' },
      rails: { name: 'The guardrails session', move: 'Thirty minutes with the team: the data light, the sign-off line, the ownership sentence, one page, posted. Existing shortcuts get amnesty into redesign.' },
      oneone: { name: 'The 1:1 question', move: '"What have you tried with AI lately, and what did you learn?" asked in every 1:1. The answers become your development map and your next show-your-prompts material.' }
    };
    var NOT = {
      mandate: 'Mandating use without modeling it. Counter-move: nothing is asked of the team that they have not watched me do, checks included.',
      unwritten: 'Leaving the guardrails unwritten. Counter-move: one page, written with the team, posted where the work happens, revised quarterly.',
      polish: 'Showing only wins. Counter-move: every narrated use includes the check, and misses get airtime; polished stories teach people to hide their real questions.'
    };
    var WHEN = { meeting: 'at the next team meeting', week: 'within 7 days', twoweeks: 'within 14 days' };
    buildBtn.addEventListener('click', function () {
      if (!planReady()) return;
      var who = whoIn.value.trim();
      var p = PRACTICE[pick.practice];
      var rows = '' +
        '<div class="row"><b>The work I model on</b><span>' + who.replace(/</g, '&lt;') + '</span></div>' +
        '<div class="row"><b>The first visible move</b><span>' + p.name + '. ' + p.move + '</span></div>' +
        '<div class="row"><b>What I will NOT do</b><span>' + NOT[pick.not] + '</span></div>' +
        '<div class="row"><b>The date</b><span>The move happens ' + WHEN[pick.when] + ', visibly, with the team watching.</span></div>' +
        '<div class="row"><b>The metric</b><span>The work audit, rerun in a month: which dimension moved? Rising scores are the adoption metric.</span></div>' +
        '<div class="row"><b>The standard</b><span>Curiosity, courage, connection: openly interested, honest about misses, and adoption stays a team practice, never a compliance program.</span></div>';
      outEl2.innerHTML = '<span class="tag">My adoption plan</span>' +
        '<div class="plan__out-grid">' + rows + '</div>' +
        '<div class="lab__runrow" style="margin-top:1.25rem">' +
        '<button class="btn" id="planCopy">Copy my plan</button>' +
        '<span class="quiz__progress" id="planCopied" style="color:rgba(255,255,255,.6)">Put the first move on the calendar now</span></div>';
      outEl2.hidden = false;
      $('#planCopy').addEventListener('click', function () {
        var text = 'MY ADOPTION PLAN (Leading AI Adoption, Vanderbilt)\n' +
          'The work I model on: ' + who + '\n' +
          'First visible move: ' + p.name + '. ' + p.move + '\n' +
          'I will NOT: ' + NOT[pick.not] + '\n' +
          'Date: ' + WHEN[pick.when] + '.\n' +
          'Metric: the work audit, rerun in a month; which dimension moved?\n' +
          'Standard: curiosity, courage, connection.';
        (navigator.clipboard ? navigator.clipboard.writeText(text) : Promise.reject()).then(function () {
          $('#planCopied').textContent = 'Copied. Paste it somewhere you\'ll see before the meeting.';
        }, function () {
          $('#planCopied').textContent = 'Select the plan text above and copy it manually.';
        });
      });
      outEl2.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'nearest' });
    });
  }

  /* ---------- INTERACTIVE: scored recap quiz ---------- */
  var recap = $('#recap');
  if (recap) {
    var QUESTIONS = [
      { q: 'Gallup\'s research: the strongest predictors of a team frequently using AI are…',
        opts: ['The capability of the tools purchased', 'Manager modeling and integration into real workflows', 'The size of the AI budget', 'Written policies and training hours'],
        correct: 1, why: 'The manager visibly championing it, and the tools living inside real work. Tools, budgets, and memos barely move the needle on their own.' },
      { q: 'The three team guardrails are…',
        opts: ['Speed, quality, cost', 'Data (what goes in), sign-off (when a human approves), ownership (who answers for it)', 'Curiosity, courage, connection', 'Green, yellow, red'],
        correct: 1, why: 'Data, sign-off, ownership, on one page, written with the team. The light is the data rail\'s content; the three C\'s are the leader\'s behaviors.' },
      { q: 'Visible modeling means…',
        opts: ['Telling the team you use AI', 'Requiring weekly AI usage logs', 'Narrating real uses with the checks shown and misses included', 'Sharing articles about AI'],
        correct: 2, why: 'Seen, specific, and honest: the use, the check, the miss. Telling isn\'t showing, and mandates without modeling produce hidden shortcuts.' },
      { q: 'The work audit\'s five dimensions are repeated work, usage state, modeling, guardrails, and…',
        opts: ['Tool spend', 'Whether AI shows up in performance and coaching conversations', 'The team\'s average prompt quality', 'Number of licenses active'],
        correct: 1, why: 'Adoption sticks when it becomes a skill you develop in people: the 1:1 question, the review conversation. That\'s the fifth dimension, and the most forgotten.' }
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
      var msg = pct >= 75 ? 'The playbook is loaded. Monday\'s visible move is where it becomes real.' :
                pct >= 50 ? 'Solid. Revisit the section you missed before the first move.' :
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
