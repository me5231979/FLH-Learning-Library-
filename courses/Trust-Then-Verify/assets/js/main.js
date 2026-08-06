/* =====================================================================
   TRUST, THEN VERIFY, classroom deck
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
    root: '#statGuess', q: '#sgQ', options: '#sgOptions', feedback: '#sgFeedback',
    progress: '#sgProgress', next: '#sgNext', result: '#sgResult',
    progressWord: 'Finding', goodColor: 'var(--vu-oak)',
    resultColor: 'var(--ink-soft, #555)', passAt: 3,
    passMsg: 'You called the research. The pattern behind every number: the errors are fluent, the checking is learnable, and the people who check well keep the speed.',
    failMsg: 'Most rooms miss these, and the misses are the lesson: the cleanup tax is bigger than it feels, and it lands on whoever trusted the fluent draft.',
    labels: [],
    items: [
      { q: 'SHRM\'s workplace research: about how much time per week does the average AI-using worker spend fixing or double-checking AI output?',
        opts: ['Under 1 hour', 'Around 4 hours', 'Around 10 hours'],
        answer: 1, why: 'Around 4 hours a week, per SHRM. Half a workday, every week, spent correcting work the tool produced in seconds. That is the cleanup tax this session trains away.' },
      { q: 'Run that 4 hours a week across a working year. Roughly how much time is it?',
        opts: ['About one full work week', 'About five full work weeks', 'About twelve full work weeks'],
        answer: 1, why: 'Call it 4 hours across 48 working weeks: nearly 200 hours, about five 40-hour weeks a year. A month and change of cleanup, per person, hiding in plain sight.' },
      { q: 'The Stanford AI Index tracks publicly reported AI incidents: real-world harms and failures. As models have improved, what has the incident count done?',
        opts: ['Fallen as models matured', 'Held roughly steady', 'Hit a record high, again'],
        answer: 2, why: 'Record highs, year after year, per the AI Index. Better models earn more trust and reach more decisions, so the misses that do happen land harder and get reported more.' },
      { q: 'Decision-aid research has watched humans work with mostly-right automated systems for decades. When the system is usually right, what happens to human checking?',
        opts: ['People check more carefully over time', 'Checking stays about constant', 'Checking fades as trust builds'],
        answer: 2, why: 'It fades, reliably. Researchers call the drift automation bias: every correct output teaches you to check the next one less, which is exactly when the expensive miss ships.' }
    ]
  });

  /* Name the failure (Section 02) */
  makeTrainer({
    root: '#modeName', q: '#mnQ', options: '#mnOptions', feedback: '#mnFeedback',
    progress: '#mnProgress', next: '#mnNext', result: '#mnResult',
    progressWord: 'Output', goodColor: 'var(--vu-gold-flat)',
    resultColor: 'rgba(255,255,255,.85)', passAt: 4,
    passMsg: 'You can name the species on sight, which means you already know which check to run. The Three Reads on the next screen turn that diagnosis into a routine.',
    failMsg: 'Close. The tells: orphan details are hallucination, undated moving numbers are staleness, arguing adjectives are slant, a too-smooth summary is omission, and any arithmetic the model did itself is suspect.',
    labels: [],
    items: [
      { q: 'An AI report cites "the 2019 staff engagement survey (Vanderbilt HR, 2019)" and quotes its finding that 72 percent of staff wanted more training. Nobody can find any such survey.',
        opts: ['Hallucination', 'Staleness', 'Slant'],
        answer: 0, why: 'Hallucination. The citation is fully formatted, precisely dated, and does not exist. Invented sources are the classic tell: real facts leave trails, and this one is an orphan.' },
      { q: 'An AI-drafted expense guide states the federal mileage reimbursement rate as 58.5 cents per mile. That was the rate, two years ago.',
        opts: ['Faked math', 'Staleness', 'Hallucination'],
        answer: 1, why: 'Staleness. The number was true when the model learned it and the world moved on. The tell was there before you checked: a moving rate stated with no date attached.' },
      { q: 'An AI summary of program feedback reads beautifully and is all praise. The source survey included a pointed paragraph of criticism about scheduling, which appears nowhere.',
        opts: ['Omission', 'Slant', 'Faked math'],
        answer: 0, why: 'Omission. Nothing in the summary is false; something true went missing. The tell: the summary is smoother than the source, and the friction that vanished was the useful part.' },
      { q: 'An AI comparison of two proposals gets every fact right, and describes one team\'s objections as "concerns raised" while the other team\'s become "repeated complaints."',
        opts: ['Hallucination', 'Staleness', 'Slant'],
        answer: 2, why: 'Slant. Every fact checks out and the adjectives still picked a winner. This mode survives fact-checking, which is why the slant read exists as its own pass.' },
      { q: 'An AI summary reports "average quarterly enrollment growth of 23.5 percent" from four quarterly figures it lists right there. Average those four numbers yourself and you get 21.',
        opts: ['Omission', 'Faked math', 'Staleness'],
        answer: 1, why: 'Faked math. The model predicted a plausible-looking average instead of computing one. Any arithmetic the model did itself gets redone by you or a calculator, every time.' }
    ]
  });

  /* Find the fault line (Section 03) */
  makeTrainer({
    root: '#faultLine', q: '#flQ', options: '#flOptions', feedback: '#flFeedback',
    progress: '#flProgress', next: '#flNext', result: '#flResult',
    progressWord: 'Sentence', goodColor: 'var(--vu-oak)',
    resultColor: 'var(--ink-soft, #555)', passAt: 4,
    passMsg: 'Your eye goes straight to the claim that can break. That is the claim read working, and it is the skill that makes the whole method fast.',
    failMsg: 'Close. The first check goes to the claim that is both checkable and load-bearing: the specific name, number, date, quote, or citation that people will act on if it is wrong.',
    labels: [],
    items: [
      { q: '"The revised travel policy takes effect March 1 and caps domestic hotel reimbursement at 150 dollars a night." What do you check first?',
        opts: ['The 150 dollar cap, against the policy document', 'The word "revised," which might mean "proposed"', 'Whether hotel prices vary by city'],
        answer: 0, why: 'The cap. It is checkable, and it is the claim people will book travel against. The date is your second check; the number that changes behavior comes first.' },
      { q: '"According to a 2023 Gallup study, employees who receive weekly feedback are 3.6 times more engaged." What do you check first?',
        opts: ['Whether weekly is the right cadence for your team', 'Whether the Gallup study exists and says this', 'Whether engagement is worth measuring'],
        answer: 1, why: 'The citation itself. A named study with a precise multiplier is either a real, findable source or a hallucination, and everything the sentence argues stands on it. Open it first.' },
      { q: '"Registration for the leadership cohort closes Friday, October 17." What do you check first?',
        opts: ['The deadline, against the actual registration page', 'The word "cohort," which sounds like jargon', 'Nothing; deadlines are usually copied correctly'],
        answer: 0, why: 'The deadline, and open the registration page to do it. A date people will plan around is the definition of load-bearing, and checking it costs thirty seconds. While you\'re there, confirm October 17 really falls on a Friday; mismatched date-and-day pairs are a classic AI tell.' },
      { q: '"As the provost said at the town hall, \'this restructuring will not affect current staff.\'" What do you check first?',
        opts: ['The quote, word for word, against the recording or notes', 'Whether the town hall was well attended', 'The provost\'s general communication style'],
        answer: 0, why: 'The quote. A direct quotation attributed to a named leader is the highest-stakes claim a summary can carry, and models paraphrase into quotation marks constantly. Check the exact words.' },
      { q: '"Most teams find the new system intuitive, and support tickets fell 40 percent after launch." What do you check first?',
        opts: ['The claim that the system feels intuitive', 'The 40 percent figure, against the ticket data', 'The word "launch" and when it happened'],
        answer: 1, why: 'The 40 percent. "Most teams find it intuitive" is vibes and cannot be checked; the ticket number can be, and it is the claim a decision would lean on. Fault lines are specific.' }
    ]
  });

  /* Check, ship, or stop (Section 04) */
  makeTrainer({
    root: '#shipCheck', q: '#scQ', options: '#scOptions', feedback: '#scFeedback',
    progress: '#scProgress', next: '#scNext', result: '#scResult',
    progressWord: 'Situation', goodColor: 'var(--vu-oak)',
    resultColor: 'var(--ink-soft, #555)', passAt: 4,
    passMsg: 'You size checks like a working verifier: stakes first, prose second. That instinct is what keeps the method affordable enough to actually use.',
    failMsg: 'Close. The sizing questions: how far does this travel, who can it hurt, and has this task earned trust or burned it? And the light outranks everything: red data never goes in at all.',
    labels: ['Ship as is', 'Run the reads', 'Stop using AI for this'],
    items: [
      { q: 'You asked AI for twenty icebreaker ideas for Friday\'s team meeting. The list looks fun.',
        answer: 0, why: 'Ship it. There are no checkable claims to be wrong and the stakes are a slightly awkward Friday. Spending verification here teaches you that checking is theater; save the budget.' },
      { q: 'AI summarized a new procurement policy, and the summary is going out to your whole department this afternoon.',
        answer: 1, why: 'All three reads. It travels, people will act on it, and a policy summary is exactly where an invented deadline or stale threshold does real damage. Claim, source, slant, then send.' },
      { q: 'A colleague suggests using a free AI chatbot to draft talking points about a named employee\'s medical accommodation request.',
        answer: 2, why: 'Stop, before any output exists. Private information about a person is red-light data and never goes into unapproved tools. This is the traffic light\'s call, and it outranks every read.' },
      { q: 'For the third time in a row, the AI\'s literature scan for your grant application has included a source that does not exist.',
        answer: 2, why: 'Stop. Three misses in a row is stop rule one, and invented sources are stop rule two; this task has triggered both. Take the scan back to a human method and revisit later, if ever.' },
      { q: 'AI drafted a one-paragraph recap of yesterday\'s planning meeting for your own follow-up notes. You were in the meeting.',
        answer: 1, why: 'Run the claim read, which here takes under a minute: scan the names, dates, and decisions against your own memory and notes. Cheap check, and recaps are where wrong decisions calcify.' }
    ]
  });

  /* ---------- INTERACTIVE: private ritual builder (Section 06) ---------- */
  var rbm = $('#ritualBuild');
  if (rbm) {
    var rOut = $('#rbOutput'), rMiss = $('#rbMiss'), rCheck = $('#rbCheck'),
        rBtn = $('#rbBuild'), rStatus = $('#rbStatus'), rOutEl = $('#rbOut');
    var rbReady = function () {
      var ok = rOut.value.trim().length >= 5 && rMiss.value.trim().length >= 5 && rCheck.value.trim().length >= 5;
      rBtn.disabled = !ok;
      rStatus.textContent = ok ? 'Ready, build it' : 'Fill in all three';
      return ok;
    };
    [rOut, rMiss, rCheck].forEach(function (el) { el.addEventListener('input', rbReady); });
    rBtn.addEventListener('click', function () {
      if (!rbReady()) return;
      var esc = function (t) { return t.replace(/</g, '&lt;'); };
      rOutEl.innerHTML = '<span class="tag">My verification ritual · private</span>' +
        '<div class="plan__out-grid">' +
        '<div class="row"><b>The output</b><span>' + esc(rOut.value.trim()) + '</span></div>' +
        '<div class="row"><b>The worst plausible miss</b><span>' + esc(rMiss.value.trim()) + '. This is the reason the ritual exists; keep it in view when the output looks clean.</span></div>' +
        '<div class="row"><b>The 90-second check</b><span>' + esc(rCheck.value.trim()) + '. Run it the moment the output arrives, before you do anything else with it.</span></div>' +
        '<div class="row"><b>The trigger</b><span>The check starts when the output lands, every time. Two weeks of that and the underlining happens on its own.</span></div>' +
        '<div class="row"><b>The stop line</b><span>Tally the misses. Three in a row on this task and the task comes back to you; the model just told you it cannot do this one.</span></div>' +
        '</div>';
      rOutEl.hidden = false;
      rOutEl.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'nearest' });
    });
  }

  /* ---------- INTERACTIVE: The Verification Lab (Section 05) ---------- */
  var lab = $('#verifyLab');
  if (lab) {
    var SLOTS = [
      { key: 'What you check', opts: [
        { t: 'Read it once for flow; it was drafted from your own numbers, so the facts should hold.', pts: 1, coach: '"Should hold" is belief, and belief is free right up until the meeting where it isn\'t. Drafted-from-your-data is where the plausible wrong number hides best.' },
        { t: 'Spot-check the two or three numbers that look most important on the way through.', pts: 2, coach: 'Better than trust, but "look most important" found the numbers the draft emphasized, which may miss the ones the dean will lean on. The claim read finds them all first, then you choose.' },
        { t: 'Run the claim read on both pages, underline every fault line, then trace the load-bearing claims to the enrollment system.', pts: 3, coach: 'Five minutes to see every place the briefing can break, fifteen to check the ones that matter. This is the method at full strength, and the hour holds it easily.' }]},
      { key: 'The citation you cannot find', opts: [
        { t: 'Leave it in; it is formatted correctly, and benchmark reports like that certainly exist.', pts: 1, coach: 'A properly formatted citation you cannot find is the signature hallucination. If the dean\'s office looks it up, the whole briefing\'s credibility goes with it.' },
        { t: 'Soften the sentence so the claim leans on the citation less, and keep moving.', pts: 2, coach: 'Softening hides the problem without solving it: the invented source is still in a document with your name on it. Unfindable sources get removed, every time.' },
        { t: 'Cut the claim, or restate it from a benchmark source you actually opened.', pts: 3, coach: 'The stop rule applied at document scale: a source that does not exist leaves the text. What survives is only what you can stand behind, which is the entire point of a briefing.' }]},
      { key: 'The slanted closing paragraph', opts: [
        { t: 'Keep it; it argues your case well, and every fact in it checks out.', pts: 1, coach: 'The facts survived the reads and the framing still overreaches. When the dean hears the same numbers framed differently by someone else, the gap reads as spin, and it is yours now.' },
        { t: 'Add a hedge or two, so the paragraph sounds less certain.', pts: 2, coach: 'Hedging blurs the slant without removing it, and it also blunts your legitimate case. The slant read asks a sharper question: what would the strongest opposite reading say?' },
        { t: 'Rewrite it to make your case and name the counter-case: what the same numbers look like from the other side.', pts: 3, coach: 'A briefing that names the opposite case is one the dean can take into any room. You kept the argument and removed the ambush; that is the slant read earning its keep.' }]},
      { key: 'The sign-off', opts: [
        { t: 'Send it with a note that AI helped draft it, so any errors are understandable.', pts: 1, coach: 'The disclaimer quietly hands the dean your verification job. Whoever sends the briefing owns its claims; the tool that drafted it is not a party to that.' },
        { t: 'Send it clean, saying nothing about how it was made or checked.', pts: 2, coach: 'Workable, and it wastes something valuable: the dean cannot tell what was verified, so either everything gets re-checked or nothing does. Your checking is information; share it.' },
        { t: 'Send it with one line: numbers verified against the enrollment system, benchmark confirmed, projections are estimates.', pts: 3, coach: 'One sentence tells the dean exactly where your checking ended and their judgment begins. That line is what trustworthy AI-assisted work looks like from the outside.' }]}
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
          statusEl.textContent = ready ? 'Ready, send it' :
            'Choose ' + picks.filter(function (p) { return p === null; }).length + ' more move(s)';
          outEl.hidden = true;
        });
        d.appendChild(b);
      });
      slotsEl.appendChild(d);
    });
    var REACTIONS = {
      strong: 'Two weeks later: the dean quotes your briefing in the leadership meeting and every number holds. The invented benchmark died on your desk instead of in that room, the counter-case paragraph preempted the one hard question, and your one-line sign-off meant the dean spent review time on the decision instead of the arithmetic. Your briefings now get read as reliable, which is the quietest possible promotion.',
      mid: 'Two weeks later: mostly fine, with one bruise. The claims you checked held, and the thing you handled halfway surfaced: a soft spot the dean\'s office found on its own. Nothing exploded, and the dean now reads your work a little more slowly, which costs you both time. The fix was fifteen more minutes of the reads; the reputation repair takes longer.',
      weak: 'Two weeks later: the dean quoted the briefing\'s enrollment figure in a budget meeting, and it was wrong. Worse, someone in the room looked up the benchmark citation and found nothing. The correction email has your name on it; the tool that drafted the number appears nowhere in it. "Looks right to me" just became the most expensive sentence of your quarter.'
    };
    runBtn.addEventListener('click', function () {
      var score = picks.reduce(function (t, p, i) { return t + SLOTS[i].opts[p].pts; }, 0); // 4..12
      var pct = Math.round((score / 12) * 100);
      var tier = score >= 11 ? 'strong' : score >= 8 ? 'mid' : 'weak';
      var head = tier === 'strong' ? 'Verified and signed like a professional. The reads found the faults, the faults died privately, and the sign-off told the dean what to trust.'
               : tier === 'mid' ? 'Half a verification. What you checked held; what you softened or skipped is exactly where the next two weeks found you.'
               : 'A fluent draft, believed. Every unchecked claim shipped at full confidence, and the errors introduced themselves to the dean before you could.';
      var coach = picks.map(function (p, i) { return '<div><b>' + SLOTS[i].key + ':</b> ' + SLOTS[i].opts[p].coach + '</div>'; }).join('');
      outEl.innerHTML = '<span class="tag">Two weeks later · ' + score + ' / 12</span>' +
        '<div class="lab__meter"><span style="width:0"></span></div>' +
        '<p style="margin:0;color:#fff;font-weight:500">' + head + '</p>' +
        '<div class="sample">' + REACTIONS[tier] + '</div>' +
        '<div class="lab__coach">' + coach + '</div>' +
        (tier !== 'strong' ? '<p class="why" style="margin-top:1rem"><b>Try again:</b> strengthen your weakest move and rerun it. Watch what changes in the meeting two weeks out.</p>'
                           : '<p class="why" style="margin-top:1rem"><b>Now the real thing:</b> the next AI draft that lands on your desk gets this exact treatment, and the hour will be enough.</p>');
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

  /* ---------- INTERACTIVE: Verification Card capstone ---------- */
  var planEl = $('#vcPlan');
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
      claim: { name: 'The claim read on the very next output', move: 'The moment it arrives, underline every name, number, date, quote, and citation before doing anything else with it. Ninety seconds, and the fault lines are visible.' },
      citation: { name: 'Trace one citation to its source', move: 'Pick the citation carrying the most weight and open the actual source. Confirm it exists and says what the output claims. One traced citation teaches more than ten skimmed ones.' },
      slant: { name: 'The slant question on my standing review', move: 'Add three questions to how you review this output: what is it assuming, who is missing from it, and what would the strongest opposite case say? Ask them every time, whoever drafted it.' }
    };
    var NOT = {
      unread: 'Ship an output I have not read. Counter-move: the claim read is the minimum toll for anything leaving my hands; if I did not underline it, it does not ship.',
      citation: 'Trust a citation I did not open. Counter-move: an unopened citation is an unverified claim wearing a suit, and the load-bearing ones get opened before anything travels.',
      misses: 'Keep using AI after three misses in a row. Counter-move: tally the misses per task, and at three straight the task comes back to me. The tally is the stop rule\'s memory.'
    };
    var WHEN = { tomorrow: 'tomorrow', threedays: 'within the next 3 days', week: 'within 7 days' };
    buildBtn.addEventListener('click', function () {
      if (!planReady()) return;
      var who = whoIn.value.trim();
      var p = PRACTICE[pick.practice];
      var rows = '' +
        '<div class="row"><b>The output</b><span>' + who.replace(/</g, '&lt;') + '</span></div>' +
        '<div class="row"><b>The first move</b><span>' + p.name + '. ' + p.move + '</span></div>' +
        '<div class="row"><b>What I will NOT do</b><span>' + NOT[pick.not] + '</span></div>' +
        '<div class="row"><b>The first verified output</b><span>Ships ' + WHEN[pick.when] + ', with the Three Reads run and timed. Claim read, source read on the riskiest claim, slant question.</span></div>' +
        '<div class="row"><b>The evidence</b><span>Two things written down after the first run: what the reads caught, and how long they took. That pair of numbers decides whether the ritual feels worth keeping.</span></div>' +
        '<div class="row"><b>The stop line</b><span>Misses get tallied by task. Three in a row on the same task and AI comes off that task, no debate; the tally already made the call.</span></div>';
      outEl2.innerHTML = '<span class="tag">My verification card</span>' +
        '<div class="plan__out-grid">' + rows + '</div>' +
        '<div class="lab__runrow" style="margin-top:1.25rem">' +
        '<button class="btn" id="planCopy">Copy my card</button>' +
        '<span class="quiz__progress" id="planCopied" style="color:rgba(255,255,255,.6)">Put the first verified output on the calendar now</span></div>';
      outEl2.hidden = false;
      $('#planCopy').addEventListener('click', function () {
        var text = 'MY VERIFICATION CARD (Trust, Then Verify, Vanderbilt)\n' +
          'The output: ' + who + '\n' +
          'First move: ' + p.name + '. ' + p.move + '\n' +
          'I will NOT: ' + NOT[pick.not] + '\n' +
          'First verified output ships ' + WHEN[pick.when] + '.\n' +
          'Evidence: what the reads caught + how long they took, written down.\n' +
          'Stop line: three misses in a row on a task and AI comes off that task.';
        (navigator.clipboard ? navigator.clipboard.writeText(text) : Promise.reject()).then(function () {
          $('#planCopied').textContent = 'Copied. Paste it somewhere you\'ll see when the next output arrives.';
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
      { q: 'SHRM\'s workplace research found that AI-using workers spend roughly how much time fixing or double-checking AI output?',
        opts: ['A few minutes a week', 'About an hour a week', 'About four hours a week', 'About fifteen hours a week'],
        correct: 2, why: 'Around four hours a week: half a workday of cleanup, which is the tax this course trains away. Verification done well is faster than the fixing it prevents.' },
      { q: 'An AI summary quotes a named study with a precise finding, and nobody can find the study anywhere. That failure mode is…',
        opts: ['Staleness', 'Hallucination', 'Slant', 'Omission'],
        correct: 1, why: 'Hallucination: invented material delivered with full confidence. The tell is the orphan detail, precise and findable nowhere, and the fix is the source read: open it or lose it.' },
      { q: 'In the claim read, which of these is a fault line worth underlining?',
        opts: ['The friendly, confident tone', 'A specific date and dollar figure', 'The length of the paragraph', 'The formatting of the bullet points'],
        correct: 1, why: 'Fault lines are checkable claims: names, numbers, dates, quotes, citations. Tone, length, and formatting cannot be wrong in a checkable way; the date and the dollar figure can.' },
      { q: 'An hour before a briefing ships, you cannot find the source behind its key citation. The move is…',
        opts: ['Keep it; it is formatted like a real citation', 'Soften the sentence so the citation matters less', 'Cut the claim or restate it from a source you actually opened', 'Add a disclaimer that AI helped draft the document'],
        correct: 2, why: 'Unfindable sources leave the document, and the claim either goes with them or gets rebuilt on a source you opened. Formatting proves nothing, and disclaimers hand your job to the reader.' },
      { q: 'Which output needs a qualified human expert regardless of how clean it reads?',
        opts: ['A brainstorm list for your own use', 'An internal recap of a meeting you attended', 'Anything with legal, medical, financial, or people consequences', 'A first draft nobody else will see'],
        correct: 2, why: 'Consequences set the ceiling: legal, medical, financial, and people matters get expert review no matter how polished the draft. AI can help produce the text; it cannot carry the accountability.' },
      { q: 'What makes a team miss log actually work?',
        opts: ['Recording who made each mistake, for accountability', 'Recording the task and failure mode with no blame, so catches become wins', 'Keeping it private to the team lead', 'Only logging the serious misses'],
        correct: 1, why: 'Task and mode, never the person: the log exists to find patterns and feed the stop rules, and people only report misses honestly when catching one is a win. Blame kills the data.' }
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
      var msg = pct >= 80 ? 'The method is loaded. The output you named on your card is where it becomes real.' :
                pct >= 50 ? 'Solid. Revisit the sections you missed before the first verified output ships.' :
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
