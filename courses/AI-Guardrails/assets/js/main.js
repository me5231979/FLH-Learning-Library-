/* =====================================================================
   AI GUARDRAILS & RESPONSIBLE USE, classroom deck
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
    root: '#gnGuess', q: '#gnQ', options: '#gnOptions', feedback: '#gnFeedback',
    progress: '#gnProgress', next: '#gnNext', result: '#gnResult',
    progressWord: 'Finding', goodColor: 'var(--vu-oak)',
    resultColor: 'var(--ink-soft, #555)', passAt: 3,
    passMsg: 'You called the pattern: use is up, incidents are up, and policy is behind. One page of written lines is the cheapest fix on that whole board.',
    failMsg: 'Most rooms miss these, and the misses teach the lesson: the risk is growing faster than the rules, and the rules are the part your team controls.',
    labels: [],
    items: [
      { q: 'Stanford\'s AI Index tracks reported AI incidents worldwide. Year over year, the count of AI misuse incidents did what?',
        opts: ['Held roughly flat', 'Grew by a few percent', 'Nearly doubled'],
        answer: 2, why: 'Nearly doubled. Incidents track adoption, and adoption is still climbing. For any team that touches these tools weekly, the risk conversation stopped being hypothetical.' },
      { q: 'Workplace surveys of AI users keep circling one number. Roughly what share use AI for work without their manager knowing?',
        opts: ['Around one in ten', 'Around half', 'Almost none'],
        answer: 1, why: 'Around half, survey after survey. Quiet, untracked use is the norm, and an unwritten rule cannot govern work nobody mentions. Written lines are what make the quiet use safe to say out loud.' },
      { q: 'And what share of organizations using AI have a written policy their staff could actually find and follow?',
        opts: ['Nearly all of them', 'Around three quarters', 'A minority, fewer than half'],
        answer: 2, why: 'A minority. Policy lags adoption almost everywhere, which is why Metaintro reads AI policy as line-manager work now: the team level is where a usable rule can exist this quarter.' },
      { q: 'When a data incident does happen, which cost pattern shows up again and again?',
        opts: ['Costs are flat however it surfaces', 'Early-caught and late-caught cost about the same', 'The later it surfaces, the more it costs'],
        answer: 2, why: 'Later means costlier: more copies, more readers, more cleanup, less trust. Written lines move discovery earlier, and earlier is the cheapest place to catch anything.' }
    ]
  });

  /* Green, yellow, or red (Section 02) */
  makeTrainer({
    root: '#tlSort', q: '#tsQ', options: '#tsOptions', feedback: '#tsFeedback',
    progress: '#tsProgress', next: '#tsNext', result: '#tsResult',
    progressWord: 'Case', goodColor: 'var(--vu-gold-flat)',
    resultColor: 'rgba(255,255,255,.85)', passAt: 4,
    passMsg: 'You can classify the hard cases, which means line one of your agreement is nearly written. The builder in section 06 is where it lands.',
    failMsg: 'Close. The tells: about a person means red, internal work means yellow in approved tools, and public on purpose means green. When two lights seem to apply, the stricter one wins.',
    labels: ['Green', 'Yellow', 'Red'],
    items: [
      { q: 'A spreadsheet of advisee names and GPAs, so AI can draft outreach emails to each student.',
        answer: 2, why: 'Names plus grades is a FERPA-protected education record. The efficiency case does not matter; the light outranks it. Red, never.' },
      { q: 'The draft revision of your unit\'s internal travel policy, for a clarity pass.',
        answer: 1, why: 'Internal university work with nobody\'s personal information in it: yellow. Approved VU tools only: ChatGPT EDU, Amplify, or Copilot.' },
      { q: 'The text of your department\'s public About page, to tighten the wording.',
        answer: 0, why: 'It was published on purpose for anyone to read. Public information is green: go.' },
      { q: 'The transcript of a recorded team meeting, names included, to pull out action items.',
        answer: 2, why: 'It is about identifiable people until the names and identifying details come out. Strip them first and the leftover work product turns yellow: approved tools only.' },
      { q: 'A grant budget spreadsheet, no personal data anywhere in it, for formatting help.',
        answer: 1, why: 'Unpublished internal financials are university work: yellow, approved tools only. It only turns green once the grant is public on purpose.' }
    ]
  });

  /* Size the check (Section 03) */
  makeTrainer({
    root: '#szCheck', q: '#szQ', options: '#szOptions', feedback: '#szFeedback',
    progress: '#szProgress', next: '#szNext', result: '#szResult',
    progressWord: 'Output', goodColor: 'var(--vu-oak)',
    resultColor: 'var(--ink-soft, #555)', passAt: 4,
    passMsg: 'You are sizing checks to consequences, which is line two working exactly as written. Spend the saved attention on the outputs that earn it.',
    failMsg: 'Close. The sorting question is blast radius: how far does it travel, and who acts on it? Stays with you: no check. A few colleagues: quick read. Numbers, names, dates, policy, or anyone acting on it: full source check.',
    labels: ['No check needed', 'Quick read', 'Full source check'],
    items: [
      { q: 'AI brainstormed ten possible titles for a staff workshop; you will pick the one you like.',
        answer: 0, why: 'It never travels, and your judgment picking one IS the check. Formal verification here spends attention the student-facing work needed.' },
      { q: 'An AI-drafted reply to a student asking which forms they need before graduation.',
        answer: 2, why: 'A student will act on this, and it carries policy and deadlines. Every word read, every requirement checked against the registrar\'s actual page.' },
      { q: 'An AI summary of an article you plan to mention in passing in the team chat.',
        answer: 1, why: 'Low stakes, small audience: one attentive read for accuracy and tone. If the summary starts driving a decision, the check grows with it.' },
      { q: 'An AI-drafted slide of enrollment numbers for the dean\'s briefing.',
        answer: 2, why: 'Numbers that travel upward get acted on, and a wrong figure in a dean\'s deck has a long half-life. Every figure checked against the source system first.' },
      { q: 'An AI-drafted agenda for your own team\'s weekly meeting.',
        answer: 1, why: 'It travels, barely, to people who can push back in the meeting itself. One quick read for anything off, then ship it.' }
    ]
  });

  /* Disclose or not (Section 04) */
  makeTrainer({
    root: '#dcCall', q: '#dcQ', options: '#dcOptions', feedback: '#dcFeedback',
    progress: '#dcProgress', next: '#dcNext', result: '#dcResult',
    progressWord: 'Scenario', goodColor: 'var(--vu-oak)',
    resultColor: 'var(--ink-soft, #555)', passAt: 4,
    passMsg: 'The misled test is installed. Notice how rarely it needed a lawyer: imagine facing the reader, and the reader tells you the answer.',
    failMsg: 'Close. One test does the work: would the reader feel misled learning AI helped? Yes means disclose. A clear no means carry on. Cannot tell means ask the policy owner, never improvise.',
    labels: ['Disclose', 'No disclosure needed', 'Unclear: say so and ask'],
    items: [
      { q: 'AI drafted most of the comments you are returning on a staff member\'s self-evaluation.',
        answer: 0, why: 'This is judgment about a person\'s work, and they would absolutely feel misled learning a model drafted it. Disclose, and rewrite until the judgment is genuinely yours.' },
      { q: 'You used AI to brainstorm icebreaker ideas for Friday\'s team meeting.',
        answer: 1, why: 'Nobody feels misled about an icebreaker\'s origin story. The test returns a clear no; brainstorms are yours to keep.' },
      { q: 'An alumni newsletter story going out mostly as AI wrote it, under the university\'s name.',
        answer: 0, why: 'External, in the university\'s voice, and lightly edited: readers assume a person wrote it, and that assumption is wrong. Disclose it, or rewrite it until a human honestly owns it.' },
      { q: 'AI suggested the structure for your report; you wrote every sentence yourself.',
        answer: 1, why: 'Structure help is an outline conversation. The words, the claims, and the judgment are yours, so there is nothing a reader could feel misled about.' },
      { q: 'Your grant proposal used AI for a first draft, and you cannot tell whether the funder\'s rules require saying so.',
        answer: 2, why: 'Funders increasingly publish explicit AI policies, and guessing at one gambles with trust. Check the rules, ask the research office, and write the answer down for the next proposal.' }
    ]
  });

  /* ---------- INTERACTIVE: The Guardrails Lab (Section 05) ---------- */
  var lab = $('#guardLab');
  if (lab) {
    var SLOTS = [
      { key: 'What goes in (line one)', opts: [
        { t: 'Skip the rule; everyone just uses whatever tool they already like.', pts: 1, coach: 'The FAQ prep involves student questions, and unwritten means each person decides alone, in a hurry, in whatever tool is open. This is how people data lands in personal accounts with nobody ever deciding it should.' },
        { t: 'One line in the kickoff email: use common sense and be careful with sensitive stuff.', pts: 2, coach: 'Careful is a mood. Six people will draw six different lines, all in good faith, and the strictest and the loosest will both believe they are following the rule.' },
        { t: 'Written: newsletter and FAQ drafting is yellow, approved VU tools only, and nothing naming a student or colleague ever goes in.', pts: 3, coach: 'The light, in writing, with the hard case decided before deadline pressure decides it. New team members inherit the line on day one.' }]},
      { key: 'When a human verifies (line two)', opts: [
        { t: 'Ship the drafts as they come; the tool has been right so far.', pts: 1, coach: 'The FAQ is exactly what the full source check exists for: students act on it, and it is full of dates and requirements. "So far" is how every wrong-deadline story starts.' },
        { t: 'Someone skims things when there is time.', pts: 2, coach: 'A check with no name dies on the first busy week, quietly, and looks fine from a distance right up to the correction.' },
        { t: 'Named: the editor reads the newsletter fully, and FAQ answers get checked against the actual policy pages before posting.', pts: 3, coach: 'A named checker and a real source, sized to blast radius: the newsletter gets the read, the student-facing answers get the source check. Line two with teeth.' }]},
      { key: 'When we disclose (line three)', opts: [
        { t: 'Say nothing; readers care about the content, and how it was made is nobody\'s business.', pts: 1, coach: 'Both outputs carry the university\'s voice, so the misled test says disclose. Silence is a bet that nobody asks, and the pot is your office\'s credibility.' },
        { t: 'Tell people AI helped if someone asks directly.', pts: 2, coach: 'Reactive honesty reads as concealment the day it surfaces. The reader learns two things at once: AI helped, and you decided they would not be told.' },
        { t: 'A standing line on both: drafted with AI assistance, reviewed by the team. Decided once, printed every issue.', pts: 3, coach: 'Decided once, applied everywhere, and the awkward question is pre-answered in print. Routine disclosure costs a sentence and buys standing trust.' }]},
      { key: 'Who owns it (line four)', opts: [
        { t: 'If something ships wrong, note that the tool made the error and move on.', pts: 1, coach: 'No reader accepts a tool in the apology. The correction will carry a person\'s name either way; the only question is whether that person knew they were the owner before the error.' },
        { t: 'The team owns everything together.', pts: 2, coach: 'Together means the reading gets split, then skipped: everyone assumes someone else read it, and an output everyone owns has nobody who must answer for it.' },
        { t: 'One name per output: whoever hits publish has read every word and answers for it.', pts: 3, coach: 'Ownership with a name. And notice the side effect: the named owner suddenly cares deeply about lines one, two, and three, which is how one line enforces the other three.' }]}
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
            'Write ' + picks.filter(function (p) { return p === null; }).length + ' more line(s)';
          outEl.hidden = true;
        });
        d.appendChild(b);
      });
      slotsEl.appendChild(d);
    });
    var REACTIONS = {
      strong: 'Month one: a trusted rollout. The newsletter ships in half the time. The FAQ check caught an answer citing last year\'s deadline before it posted, and the catch made the team trust the process more, because the safety net visibly works. The disclosure line has drawn zero complaints and one compliment, and when a professor asked whether the FAQ was AI-written, the answer was already printed at the bottom of the page.',
      mid: 'Month one: a quiet near-miss. A draft prepped in someone\'s personal AI account turned out to have a student\'s email pasted into it, caught by luck when a colleague glanced over. Nothing left the building, this time. But nobody can point to the line it crossed, because the line was never written, and the team\'s quiet users just got quieter, which is the opposite of what a policy is for.',
      weak: 'Month one: a public correction. The FAQ carried a wrong deadline, a student missed it, and the correction went out under the university\'s name. In the postmortem someone said the AI wrote it, and everyone heard how that sounded. The tool took the blame the missing lines earned, and AI use is now frozen while trust rebuilds, which costs far more than writing four lines ever would.'
    };
    runBtn.addEventListener('click', function () {
      var score = picks.reduce(function (t, p, i) { return t + SLOTS[i].opts[p].pts; }, 0); // 4..12
      var pct = Math.round((score / 12) * 100);
      var tier = score >= 11 ? 'strong' : score >= 8 ? 'mid' : 'weak';
      var head = tier === 'strong' ? 'A working agreement. All four lines written, named, and sized to the work; month one builds trust instead of spending it.'
               : tier === 'mid' ? 'Lines with gaps. The written parts work, and the unwritten parts are where the near-miss lives. Near-misses teach teams to hide things.'
               : 'Vibes with a rollout date. Unwritten lines, unread output, unowned errors: month one was always going to write the rules for you, in public.';
      var coach = picks.map(function (p, i) { return '<div><b>' + SLOTS[i].key + ':</b> ' + SLOTS[i].opts[p].coach + '</div>'; }).join('');
      outEl.innerHTML = '<span class="tag">Month one · ' + score + ' / 12</span>' +
        '<div class="lab__meter"><span style="width:0"></span></div>' +
        '<p style="margin:0;color:#fff;font-weight:500">' + head + '</p>' +
        '<div class="sample">' + REACTIONS[tier] + '</div>' +
        '<div class="lab__coach">' + coach + '</div>' +
        (tier !== 'strong' ? '<p class="why" style="margin-top:1rem"><b>Try again:</b> rewrite your weakest line and rerun the month. Watch the near-miss disappear.</p>'
                           : '<p class="why" style="margin-top:1rem"><b>Now the real thing:</b> the pair drill in Go deeper walks one of YOUR outputs down the four lines.</p>');
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

  /* ---------- INTERACTIVE: private Four Lines builder (Section 06) ---------- */
  var flb = $('#flBuild');
  if (flb) {
    var flL1 = $('#flLine1'), flL2 = $('#flLine2'),
        flBtn = $('#flMake'), flStatus = $('#flStatus'), flOut = $('#flOut');
    var flDisc = null;
    var DISC = {
      voice: 'We disclose whenever the university\'s voice or judgment of a person\'s work is involved. The test for everything else: would the reader feel misled? When unsure, we say so and ask.',
      external: 'We disclose on everything external by default: one plain line, drafted once, used every time. Internal drafts a human rewrote and owns need nothing.',
      test: 'We run the misled test case by case: would the reader feel misled learning AI helped? Yes means disclose, and unclear cases go to the policy owner, never to a guess.'
    };
    var flReady = function () {
      var ok = flL1.value.trim().length >= 8 && flL2.value.trim().length >= 8 && !!flDisc;
      flBtn.disabled = !ok;
      flStatus.textContent = ok ? 'Ready, draft it' : 'Write both lines and pick a default';
      return ok;
    };
    [flL1, flL2].forEach(function (el) { el.addEventListener('input', flReady); });
    var discGroup = $('#flDisc');
    $$('.opt', discGroup).forEach(function (b) {
      b.addEventListener('click', function () {
        flDisc = b.getAttribute('data-disc');
        $$('.opt', discGroup).forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        flOut.hidden = true;
        flReady();
      });
    });
    flBtn.addEventListener('click', function () {
      if (!flReady()) return;
      var esc = function (t) { return t.replace(/</g, '&lt;'); };
      flOut.innerHTML = '<span class="tag">My Four Lines starter · private</span>' +
        '<div class="plan__out-grid">' +
        '<div class="row"><b>1 · What goes in</b><span>' + esc(flL1.value.trim()) + '. The traffic light backs this line: red never enters, yellow lives in approved VU tools, green goes.</span></div>' +
        '<div class="row"><b>2 · Who verifies</b><span>' + esc(flL2.value.trim()) + '. Named checker, real source, and the check happens before the output reaches anyone who acts on it.</span></div>' +
        '<div class="row"><b>3 · When we disclose</b><span>' + DISC[flDisc] + '</span></div>' +
        '<div class="row"><b>4 · Who owns it</b><span>The human who ships it answers for it. One name per output, every word read before it travels, and the tool never appears in the accountability chain. This line comes pre-written; every team keeps it.</span></div>' +
        '<div class="row"><b>The next move</b><span>Bring this page to your team as a draft to edit, never a decree. Pick its home, put the quarterly revisit on the calendar, and the capstone card two pages ahead sets the date.</span></div>' +
        '</div>';
      flOut.hidden = false;
      flOut.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'nearest' });
    });
  }

  /* ---------- INTERACTIVE: Four Lines Card capstone ---------- */
  var planEl = $('#capPlan');
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
      draft: { name: 'Draft first, then edit together', move: 'Write all four lines tonight while the session is fresh, label the page DRAFT in the title, and hand the team the pen. People follow lines they helped draw.' },
      agenda: { name: 'The 20-minute team conversation', move: 'Four lines, five minutes each: what goes in, who verifies, when we disclose, who owns it. Leave with wording the team said out loud and a home for the page.' },
      route: { name: 'Settle a real unclear case first', move: 'Take the case your team already argues about to the right policy owner, get the answer in writing, and make it the first line on the page. Nothing sells an agreement like a settled argument.' }
    };
    var NOT = {
      paste: 'Paste anything about a person into an unapproved tool. Counter-move: when a task touches people data, the names come out first or the task stays manual. The light outranks every deadline.',
      unread: 'Ship AI output I have not read to the last word. Counter-move: the byline rule, said plainly to the team: if your name sends it, your eyes have crossed every word of it.',
      silent: 'Treat disclosure as optional when the university\'s voice is involved. Counter-move: a standing disclosure line, drafted once and pasted every time. Routine is what makes honesty cheap.'
    };
    var WHEN = { tomorrow: 'tomorrow', threedays: 'within the next 3 days', week: 'within 7 days' };
    buildBtn.addEventListener('click', function () {
      if (!planReady()) return;
      var who = whoIn.value.trim();
      var p = PRACTICE[pick.practice];
      var rows = '' +
        '<div class="row"><b>The team</b><span>' + who.replace(/</g, '&lt;') + '</span></div>' +
        '<div class="row"><b>The first move</b><span>' + p.name + '. ' + p.move + '</span></div>' +
        '<div class="row"><b>What I will NOT do</b><span>' + NOT[pick.not] + '</span></div>' +
        '<div class="row"><b>The date</b><span>The first move happens ' + WHEN[pick.when] + '. A dated move is a rollout; an undated one is a hope.</span></div>' +
        '<div class="row"><b>The agreement\'s home</b><span>Pick one findable place before the team meeting ends: the team drive\'s front page, the wiki, or the onboarding doc. An agreement nobody can find governs nobody.</span></div>' +
        '<div class="row"><b>The revisit</b><span>Quarterly, 15 minutes: what new cases showed up, what got asked, which line needs a word changed. Put the first revisit on the calendar the day the page is agreed.</span></div>';
      outEl2.innerHTML = '<span class="tag">My Four Lines card</span>' +
        '<div class="plan__out-grid">' + rows + '</div>' +
        '<div class="lab__runrow" style="margin-top:1.25rem">' +
        '<button class="btn" id="planCopy">Copy my card</button>' +
        '<span class="quiz__progress" id="planCopied" style="color:rgba(255,255,255,.6)">Put the first move on the calendar now</span></div>';
      outEl2.hidden = false;
      $('#planCopy').addEventListener('click', function () {
        var text = 'MY FOUR LINES CARD (AI Guardrails & Responsible Use, Vanderbilt)\n' +
          'The team or workflow: ' + who + '\n' +
          'First move: ' + p.name + '. ' + p.move + '\n' +
          'I will NOT: ' + NOT[pick.not] + '\n' +
          'When: ' + WHEN[pick.when] + '.\n' +
          'The agreement\'s home: one findable place, named at the team meeting.\n' +
          'The revisit: quarterly, 15 minutes, on the calendar the day the page is agreed.';
        (navigator.clipboard ? navigator.clipboard.writeText(text) : Promise.reject()).then(function () {
          $('#planCopied').textContent = 'Copied. Paste it somewhere you\'ll see before the team meeting.';
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
      { q: 'Stanford\'s AI Index shows AI misuse incidents nearly doubling year over year while adoption keeps climbing. For a team, the working conclusion is…',
        opts: ['Pause AI use until the incident curve flattens', 'As use scales, unwritten rules stop protecting anyone; write the lines down before the incident', 'Incidents are a vendor problem handled centrally', 'Careful people have nothing to change'],
        correct: 1, why: 'Incidents track adoption, and adoption is here. The variable your team controls is whether its lines exist in writing before the hard case arrives on a deadline.' },
      { q: 'Meeting notes that name colleagues are…',
        opts: ['Green, because meetings are routine internal events', 'Yellow in any tool that promises privacy', 'Red until the names and identifying details come out, then yellow in approved tools', 'Red forever, even fully de-identified'],
        correct: 2, why: 'About a person means red. De-identification changes what the data is: with names out, the leftover work product is internal, yellow, approved VU tools only.' },
      { q: 'Which output needs the full source check before it travels?',
        opts: ['Everything AI touches, equally', 'Only documents leaving the university', 'Anything with numbers, names, dates, or policy that someone will act on', 'Nothing, once a tool has proven reliable for a month'],
        correct: 2, why: 'Blast radius sizes the check. Acted-on facts get checked against the source, checking everything equally means checking nothing well, and a reliable month is exactly when unread errors start shipping.' },
      { q: 'The dependable test for when to disclose AI help is…',
        opts: ['Whether the reader would feel misled learning AI was involved', 'Whether AI wrote more than half the words', 'Whether the format legally requires it', 'Whether a colleague thinks it reads fine'],
        correct: 0, why: 'The misled test protects what disclosure exists for: the reader\'s trust. Law sets a floor in some formats; the test covers everything the floor never reaches.' },
      { q: 'An AI-assisted output ships with an error. Under line four, accountability sits with…',
        opts: ['The tool that drafted it', 'The human who shipped it', 'The team, collectively', 'Whoever wrote the team\'s AI agreement'],
        correct: 1, why: 'The byline is a promise, and it belongs to whoever hit send. That is also why line four makes the other three matter: the named owner has every reason to enforce them.' },
      { q: 'What makes a Four Lines agreement actually govern anything?',
        opts: ['A strong all-staff announcement email', 'Length: covering every conceivable case', 'Written with the team, one findable page, revisited quarterly, unclear cases routed to a named owner', 'Signatures from everyone on the team'],
        correct: 2, why: 'Agreements govern when people helped write them, can find them, and watch them stay current. A page nobody can find is a vibe with a filename.' }
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
      var msg = pct >= 80 ? 'The four lines are loaded. The starter card on the next page turns them into your team\'s page.' :
                pct >= 50 ? 'Solid. Revisit the sections you missed; the cheat sheet carries all four lines on one page.' :
                            'Worth another pass through the deck before you draft the agreement.';
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
