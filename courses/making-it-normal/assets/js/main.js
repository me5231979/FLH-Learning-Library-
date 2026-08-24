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
    root: '#gallupGuess', q: '#ggQ', options: '#ggOptions', feedback: '#ggFeedback',
    progress: '#ggProgress', next: '#ggNext', result: '#ggResult',
    progressWord: 'Finding', goodColor: 'var(--vu-oak)',
    resultColor: 'var(--ink-soft, #555)', passAt: 3,
    passMsg: 'You called the research. The through line in every number: usage is spreading in silence, and comfort follows visible leadership.',
    failMsg: 'Most rooms miss these, and that IS the finding: we assume adoption is about tools, while the data says it follows what leaders visibly do and say.',
    labels: [],
    items: [
      { q: 'Gallup\'s workplace research: what share of U.S. employees now use AI at work at least a few times a year?',
        opts: ['About 15 percent', 'About 40 percent', 'About 75 percent'],
        answer: 1, why: 'About 40 percent, roughly double the share of two years earlier. Someone on your team is already using it; the open question is whether anyone is leading it.' },
      { q: 'And what share use AI frequently, meaning a few times a week or more?',
        opts: ['About 8 percent', 'About 19 percent', 'About 45 percent'],
        answer: 1, why: '19 percent, and climbing fast. Frequent use is where the value lives, and it concentrates on teams where AI sits inside real workflows instead of alongside them.' },
      { q: 'What share of employees say their organization has communicated a clear plan or strategy for using AI?',
        opts: ['About 22 percent', 'About half', 'About 70 percent'],
        answer: 0, why: '22 percent. Nearly four out of five employees are working out the rules by watching what their leaders do, which makes your behavior the de facto policy.' },
      { q: 'Employees whose leadership HAS communicated a clear AI plan: how much more likely are they to feel comfortable using AI at work?',
        opts: ['About 1.5 times as likely', 'About 2 times as likely', 'Nearly 5 times as likely'],
        answer: 2, why: '4.7 times as likely. Saying the plan out loud does more for comfort than any license or training, and comfort is the thing that turns into practice.' }
    ]
  });

  /* Judge the model (Section 02) */
  makeTrainer({
    root: '#judgeModel', q: '#jmQ', options: '#jmOptions', feedback: '#jmFeedback',
    progress: '#jmProgress', next: '#jmNext', result: '#jmResult',
    progressWord: 'Behavior', goodColor: 'var(--vu-gold-flat)',
    resultColor: 'rgba(255,255,255,.85)', passAt: 4,
    passMsg: 'Your ear is calibrated: visible practice with the check in the story. The group drill below is where you rehearse your own narration.',
    failMsg: 'Close. The tells: real modeling shows the prompt, the fix, and the check. Invisible use gives the team nothing to copy, and speed without verification teaches exactly the wrong lesson.',
    labels: ['Real modeling', 'Nothing to copy', 'Speed without the check'],
    items: [
      { q: 'In the team meeting, a manager shows the prompt she used for the quarterly update, the first draft, and the two numbers she corrected against the tracker before sending.',
        answer: 0, why: 'Prompt, draft, fix: the full narration. The team just learned the tool, the standard, and the check in ninety seconds.' },
      { q: 'A manager drafts most of his reports with AI and tells nobody. His results are strong, and he figures the work speaks for itself.',
        answer: 1, why: 'Results don\'t model anything; nobody can copy what nobody can see. Meanwhile his team is still guessing whether AI use is even allowed.' },
      { q: 'At the all-hands, a director calls AI a game changer and urges everyone to lean in. The team has never seen her use it for anything.',
        answer: 1, why: 'Hype without practice is a poster. With nothing visible to copy, the team hears enthusiasm and reads it as pressure, and the permission gap stays exactly where it was.' },
      { q: 'A team lead shows how AI wrote his status report in four minutes and sends it on the spot. "Look how fast this is," he says.',
        answer: 2, why: 'He modeled the speed and skipped the check in public, and teams copy what they see. When the first error ships, AI takes the blame for a skipped verification.' },
      { q: 'A manager shares a miss log entry in the team meeting: the AI invented a citation last week, she caught it against the source, and she calls the catch the win.',
        answer: 0, why: 'Modeling the miss is advanced modeling. It makes imperfect use safe in public and it makes the check the hero of the story, which is where you want the team\'s attention.' }
    ]
  });

  /* Fix the ritual (Section 04) */
  makeTrainer({
    root: '#fixRitual', q: '#frQ', options: '#frOptions', feedback: '#frFeedback',
    progress: '#frProgress', next: '#frNext', result: '#frResult',
    progressWord: 'Setup', goodColor: 'var(--vu-oak)',
    resultColor: 'var(--ink-soft, #555)', passAt: 4,
    passMsg: 'You can read a ritual\'s failure mode straight from its setup. Now script your own first ritual in the drill below, safety promise included.',
    failMsg: 'Close. The tells: safety problems punish honesty, cadence problems let the ritual fade, and an enthusiast-only ritual reaches the people who least need it.',
    labels: ['Missing safety', 'Missing cadence', 'Enthusiast-only', 'Working as designed'],
    items: [
      { q: 'A manager adds a share-one round to the weekly meeting. The same two AI fans present every single week while the rest of the team checks email.',
        answer: 2, why: 'The round is running on volunteers, and volunteers are always the enthusiasts. Rotate it through everyone and let misses count as shares; the quiet skeptics are the audience that matters.' },
      { q: 'A team starts a miss log. The first person to log a miss gets grilled in front of everyone about why they didn\'t catch it sooner.',
        answer: 0, why: 'That log is now empty forever. Safety is the precondition: the log only works when a logged miss is treated as the system working, and the grilling just taught the team to hide.' },
      { q: 'A manager announces the 1:1 AI question with real energy. She asks it twice in October, then the quarter gets busy and it never comes up again.',
        answer: 1, why: 'A question asked twice is an event; asked every week for a quarter, it becomes how the team thinks. Norms are made of cadence, and cadence is the part the busy season eats first.' },
      { q: 'A manager writes a thorough AI norms page on the team wiki, links it in the channel, and considers the norms set.',
        answer: 1, why: 'A wiki page is a memo, and memos have no schedule. Norms live in repeated moments on a calendar; the page is a fine reference for a ritual that still needs to exist.' },
      { q: 'Every 1:1 includes the same two minutes: what did you try with AI, what did it get wrong, what did you do about it. Misses go in the log without blame, and the team reviews the log monthly.',
        answer: 3, why: 'Cadence, safety, and the check built into the question itself. This is what installed looks like: small, repeated, and unremarkable, which is exactly the point.' }
    ]
  });

  /* Month-three moves (Section 06) */
  makeTrainer({
    root: '#monthMoves', q: '#mmQ', options: '#mmOptions', feedback: '#mmFeedback',
    progress: '#mmProgress', next: '#mmNext', result: '#mmResult',
    progressWord: 'Scenario', goodColor: 'var(--vu-oak)',
    resultColor: 'var(--ink-soft, #555)', passAt: 3,
    passMsg: 'You have the month-three playbook: seed the rituals, defend the time, celebrate the catch, and report stories. The dip is now a maintenance task.',
    failMsg: 'Close. The pattern in every answer: the dip responds to structure and leadership attention. Panic moves, surveillance moves, and quiet abandonment all make it worse.',
    labels: [],
    items: [
      { q: 'The share-one round has gone quiet: three weeks running, nobody has anything, and the meeting moves on a little faster each time.',
        opts: ['Retire the round; it did its job during launch', 'Seed it: narrate one of your own uses again, misses included, and ask one person in advance to bring one', 'Make sharing mandatory: one use per person per week'],
        answer: 1, why: 'Rituals restart the way they started: with you going first. A pre-asked volunteer breaks the silence without force; a mandate turns sharing into a tax and empties the round of anything true.' },
      { q: 'A team member\'s learning hour keeps vanishing into deadline work. She hasn\'t touched it in a month and hasn\'t mentioned it.',
        opts: ['Let it slide; the deadlines are real and she\'s an adult', 'Ask her to find time for it once things calm down', 'Treat the hour as a budget you defend: put it back on her calendar and protect it like a client meeting'],
        answer: 2, why: 'A perk yields to workload every time; a budget survives it. If the hour quietly dies in month three, you announced to the whole team that the learning was decoration.' },
      { q: 'Someone catches the AI inventing a policy detail before it reaches a customer. It\'s the third caught miss this month, and a senior leader asks you whether AI is becoming a problem.',
        opts: ['Quietly scale back AI use before something actually ships', 'Celebrate the catch publicly and show the leader the miss log: three catches means the checks are working', 'Stop reporting misses upward so the program keeps its support'],
        answer: 1, why: 'Three caught misses is verification working in public, and the log is your proof. Hiding misses restarts secret use, and scaling back punishes the team for doing exactly what you asked.' },
      { q: 'You need to show adoption progress upward, and a dashboard of per-person AI usage counts would take an afternoon to build.',
        opts: ['Build it; what gets measured gets managed', 'Hold reporting until the numbers improve on their own', 'Report team-level stories instead: uses shared, misses caught, hours returned. Never rank individuals'],
        answer: 2, why: 'A per-person leaderboard converts a learning norm into surveillance, and the safety you spent three months building dies in a week. Stories carry the same evidence without the fear.' }
    ]
  });

  /* ---------- INTERACTIVE: private permission-talk builder (Section 03) ---------- */
  var ptb = $('#ptBuild');
  if (ptb) {
    var pUse = $('#ptUse'), pLimit = $('#ptLimit'), pGray = $('#ptGray'),
        pBtn = $('#ptOutline'), pStatus = $('#ptStatus'), pOut = $('#ptOut');
    var ptReady = function () {
      var ok = pUse.value.trim().length >= 5 && pLimit.value.trim().length >= 5 && pGray.value.trim().length >= 5;
      pBtn.disabled = !ok;
      pStatus.textContent = ok ? 'Ready, build it' : 'Fill in all three';
      return ok;
    };
    [pUse, pLimit, pGray].forEach(function (el) { el.addEventListener('input', ptReady); });
    pBtn.addEventListener('click', function () {
      if (!ptReady()) return;
      var esc = function (t) { return t.replace(/</g, '&lt;'); };
      pOut.innerHTML = '<span class="tag">My permission talk · private</span>' +
        '<div class="plan__out-grid">' +
        '<div class="row"><b>The opener</b><span>"I want to be explicit about AI on this team, because I\'d rather you hear it from me than guess." Then the three parts below, in your own words.</span></div>' +
        '<div class="row"><b>Encouraged</b><span>' + esc(pUse.value.trim()) + '. Name it this specifically out loud, check included, and watch who exhales.</span></div>' +
        '<div class="row"><b>Never</b><span>' + esc(pLimit.value.trim()) + '. Said as plainly as the encouragement, with the traffic light behind it: red data about people never goes in, whatever the tool.</span></div>' +
        '<div class="row"><b>The gray zone</b><span>' + esc(pGray.value.trim()) + '. Answer it before they ask, then name who to bring the next unclear case to, and promise out loud that asking is applauded.</span></div>' +
        '<div class="row"><b>The move</b><span>Five minutes of your next team meeting, in your voice. Then say it again in a month, and again for every new hire; a norm heard once is a rumor.</span></div>' +
        '</div>';
      pOut.hidden = false;
      pOut.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'nearest' });
    });
  }

  /* ---------- INTERACTIVE: The Adoption Lab (Section 05) ---------- */
  var lab = $('#adoptLab');
  if (lab) {
    var SLOTS = [
      { key: 'Your own visibility', opts: [
        { t: 'Use AI privately and let your results speak for themselves.', pts: 1, coach: 'Invisible use models nothing, and it quietly teaches the team that AI is something you keep to yourself. You just became your own permission gap.' },
        { t: 'Mention in the team meeting that you\'ve been using AI and you like it.', pts: 2, coach: 'Better than silence, and still nothing to copy. Endorsement without demonstration reads as pressure; one narrated use with the fix included would land ten times harder.' },
        { t: 'Narrate one real use in the team meeting: the prompt, the draft, and the two things you fixed.', pts: 3, coach: 'Ninety seconds of narrated use beats a month of encouragement. The team saw the tool, the standard, and the check, all attached to somebody they already trust.' }]},
      { key: 'The permission move', opts: [
        { t: 'Say nothing formal; the team is smart and will work out what\'s OK.', pts: 1, coach: 'Silence splits the team in half: some read it as prohibition and abstain, some improvise their own rules in the dark. Both halves are guessing at you, and both are guessing wrong.' },
        { t: 'Send one clear announcement: the encouraged list, the never list, and who to ask.', pts: 2, coach: 'The right words, said once. A single announcement fades in about a week; permission becomes real when it survives repetition and shows up again in 1:1s.' },
        { t: 'Give the permission talk in the meeting, then revisit it in every 1:1: what did you try, where were you unsure.', pts: 3, coach: 'Permission with follow-through. The 1:1 echo is what turns a policy statement into a norm people actually trust when it counts.' }]},
      { key: 'The rituals', opts: [
        { t: 'No new rituals; the calendar is full and adoption should happen organically.', pts: 1, coach: 'Organic adoption reliably produces two power users and a lot of silence. A norm with no home on the calendar lives nowhere, and month three erases it completely.' },
        { t: 'Add a share-one round to the team meeting when there\'s time for it.', pts: 2, coach: '"When there\'s time" means three times a quarter. The round works at a weekly cadence, and it needs its partner: the miss log that makes imperfect use safe to show.' },
        { t: 'A weekly share-one round plus a no-blame miss log, reviewed together monthly.', pts: 3, coach: 'Two small rituals, zero new meetings, both halves covered: wins spread through the round, and the log makes catching errors something the team is proud of.' }]},
      { key: 'The skeptic', opts: [
        { t: 'Leave them alone; they\'ll come around when they see everyone else\'s results.', pts: 1, coach: 'Unattended skepticism hardens into identity, and the quiet doubters gather behind it. Day 90: a team politely split into camps that no longer argue out loud.' },
        { t: 'Set the expectation directly: everyone on this team uses AI now, including them.', pts: 2, coach: 'A mandate buys you compliance theater: the tool open in a tab, the mind unchanged. The skeptic\'s doubt is actually a skill in disguise, and a mandate never finds it.' },
        { t: 'Pair them with the enthusiast on one real task, and ask them both to report what worked and what didn\'t.', pts: 3, coach: 'The pairing move: the enthusiast brings speed, the skeptic brings standards, and the task makes it real. Skeptics who test things honestly tend to become the team\'s best verifiers.' }]}
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
          statusEl.textContent = ready ? 'Ready, run the ninety days' :
            'Choose ' + picks.filter(function (p) { return p === null; }).length + ' more move(s)';
          outEl.hidden = true;
        });
        d.appendChild(b);
      });
      slotsEl.appendChild(d);
    });
    var REACTIONS = {
      strong: 'Day 90: five of six use AI weekly, and the sixth, your skeptic, wrote the team\'s verification checklist. The share-one round surfaced a use you never would have thought of, the miss log has nine entries and zero drama, and your permission talk gets quoted back to you in 1:1s. Adoption looks like habit now, and it started the day you narrated one imperfect draft.',
      mid: 'Day 90: usage is up, and it\'s lopsided. Two people run ahead, three dabble when reminded, one is waiting you out. The rules technically exist, and nobody is sure they\'re real, because the follow-through faded when the quarter got busy. The distance between this team and whole-team practice is exactly the moves you softened.',
      weak: 'Day 90: two power users, quiet resentment, and a team that still isn\'t sure what\'s allowed. AI shows up in secret drafts and hallway disclaimers. Nothing failed loudly; adoption just never became normal, because nobody could see you do it, nobody heard the rules, and nobody found a safe place to try.'
    };
    runBtn.addEventListener('click', function () {
      var score = picks.reduce(function (t, p, i) { return t + SLOTS[i].opts[p].pts; }, 0); // 4..12
      var pct = Math.round((score / 12) * 100);
      var tier = score >= 11 ? 'strong' : score >= 8 ? 'mid' : 'weak';
      var head = tier === 'strong' ? 'Whole-team practice. You made your use visible, the rules explicit, and trying safe.'
               : tier === 'mid' ? 'Two speeds. Real moves, undermined by the follow-through you skipped.'
               : 'A quiet stall. The tools were there all along; the leadership behavior wasn\'t.';
      var coach = picks.map(function (p, i) { return '<div><b>' + SLOTS[i].key + ':</b> ' + SLOTS[i].opts[p].coach + '</div>'; }).join('');
      outEl.innerHTML = '<span class="tag">Day 90 · ' + score + ' / 12</span>' +
        '<div class="lab__meter"><span style="width:0"></span></div>' +
        '<p style="margin:0;color:#fff;font-weight:500">' + head + '</p>' +
        '<div class="sample">' + REACTIONS[tier] + '</div>' +
        '<div class="lab__coach">' + coach + '</div>' +
        (tier !== 'strong' ? '<p class="why" style="margin-top:1rem"><b>Try again:</b> strengthen your weakest move and rerun the ninety days. Watch what changes for the three people in the middle.</p>'
                           : '<p class="why" style="margin-top:1rem"><b>Now the real thing:</b> the group drill in Go deeper finds which of these four choices your actual team is living today.</p>');
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

  /* ---------- INTERACTIVE: Adoption Plan capstone ---------- */
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
      narrate: { name: 'Narrate one real use in the next team meeting', move: 'Four sentences: the task, the prompt, what you fixed, and what you checked it against. Pick something real and slightly imperfect; the miss is the credibility.' },
      talk: { name: 'Run the permission talk', move: 'Five minutes, your voice: the encouraged list with checks attached, the never list starting from the traffic light, and who to ask when it\'s unclear. Repeat it in a month.' },
      oneone: { name: 'Add the 1:1 question', move: 'Two minutes in every 1:1: what did you try with AI this week, and what did it get wrong? Ask it every week for a quarter before you judge it.' },
      misslog: { name: 'Start the no-blame miss log', move: 'Open a shared list and log the first miss yourself, catch included. No names on the miss, full credit on the catch, reviewed together monthly.' }
    };
    var NOT = {
      secret: 'Using AI secretly while my team guesses the rules. Counter-move: every AI use I\'d rather hide is one I either narrate out loud or stop; my visibility is the policy.',
      leaderboard: 'Ranking individuals on AI usage. Counter-move: adoption reports stay team-level and story-shaped: uses shared, misses caught, hours returned. Nobody gets ranked.',
      unmeasured: 'Letting month three go unmeasured. Counter-move: a week-ten calendar note to re-seed the round, defend the learning hour, and review the miss log as a team.'
    };
    var WHEN = { tomorrow: 'tomorrow', threedays: 'within the next 3 days', week: 'within 7 days' };
    buildBtn.addEventListener('click', function () {
      if (!planReady()) return;
      var who = whoIn.value.trim();
      var p = PRACTICE[pick.practice];
      var rows = '' +
        '<div class="row"><b>My team</b><span>' + who.replace(/</g, '&lt;') + '</span></div>' +
        '<div class="row"><b>The first move</b><span>' + p.name + '. ' + p.move + '</span></div>' +
        '<div class="row"><b>What I will NOT do</b><span>' + NOT[pick.not] + '</span></div>' +
        '<div class="row"><b>The date</b><span>The first move happens ' + WHEN[pick.when] + '. Small and dated beats grand and someday.</span></div>' +
        '<div class="row"><b>The cadence</b><span>Whatever move goes first, the 1:1 question and the share-one round run weekly for a full quarter before I judge them.</span></div>' +
        '<div class="row"><b>The evidence</b><span>At day 30, one line: who tried something new, what did the team catch before it shipped, and where did the recovered hours go?</span></div>';
      outEl2.innerHTML = '<span class="tag">My adoption plan</span>' +
        '<div class="plan__out-grid">' + rows + '</div>' +
        '<div class="lab__runrow" style="margin-top:1.25rem">' +
        '<button class="btn" id="planCopy">Copy my plan</button>' +
        '<span class="quiz__progress" id="planCopied" style="color:rgba(255,255,255,.6)">Put the first move on your calendar now</span></div>';
      outEl2.hidden = false;
      $('#planCopy').addEventListener('click', function () {
        var text = 'MY ADOPTION PLAN (Leading AI Adoption, Vanderbilt)\n' +
          'My team: ' + who + '\n' +
          'First move: ' + p.name + '. ' + p.move + '\n' +
          'I will NOT: ' + NOT[pick.not] + '\n' +
          'The date: first move ' + WHEN[pick.when] + '.\n' +
          'Cadence: the 1:1 question and the share-one round run weekly for a quarter.\n' +
          'Evidence: at day 30, one line on who tried something new, what the team caught, and where the hours went.';
        (navigator.clipboard ? navigator.clipboard.writeText(text) : Promise.reject()).then(function () {
          $('#planCopied').textContent = 'Copied. Paste it somewhere you\'ll see before your next team meeting.';
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
      { q: 'Gallup\'s workplace research points at two things that predict frequent AI use on a team better than anything else. Which pair?',
        opts: ['A manager who visibly uses AI, and AI integrated into real workflows', 'Tool licenses and a mandatory training', 'Younger employees and better models', 'A written policy page and an all-hands announcement'],
        correct: 0, why: 'Behavior and integration. Licenses, memos, and hype barely move usage; the manager opening a laptop and the work itself carrying AI are what move it.' },
      { q: 'When you narrate your own AI use to the team, the most important thing to model is...',
        opts: ['The speed: how much time it saved', 'The check: what you verified and what you fixed before it shipped', 'The most advanced tool available', 'A flawless result with no misses'],
        correct: 1, why: 'Teams copy what they see. Model speed and they\'ll skip verification; model the check and the fix, misses included, and you\'ve taught the habit that keeps AI use safe.' },
      { q: 'Why does saying nothing about AI rules fail as a policy?',
        opts: ['Employees ignore policies either way', 'Silence splits the team: half read it as prohibition, half as a free-for-all, and everyone guesses', 'Because regulators require a written policy', 'It doesn\'t fail; smart teams infer the rules'],
        correct: 1, why: 'Silence is a policy you didn\'t choose. The permission talk replaces both wrong guesses with an encouraged list, a never list, and a named person to ask.' },
      { q: 'Which of these is a working AI norm rather than a memo?',
        opts: ['A norms page on the team wiki', 'An enthusiastic launch announcement', 'A two-minute 1:1 question asked every week, plus a no-blame miss log', 'A quarterly reminder email'],
        correct: 2, why: 'Norms are behaviors on a schedule. The 1:1 question and the miss log live inside rituals the team already runs, which is why they survive the busy season.' },
      { q: 'Your team has one open skeptic. The move this course recommends is...',
        opts: ['Wait; they\'ll come around when they see results', 'Require them to use AI like everyone else', 'Pair them with the enthusiast on one real task and let their doubts become verification skill', 'Keep them away from AI-touched work'],
        correct: 2, why: 'The pairing move turns doubt into a job. The skeptic\'s standards become the team\'s checks, and skeptics who test things honestly usually become the best verifiers.' },
      { q: 'Usage dips in month three. What sustains adoption past the novelty cliff?',
        opts: ['A per-person usage leaderboard to create urgency', 'Protected learning time, celebrated catches, and rituals kept on the agenda', 'A new tool to bring the excitement back', 'Pausing the miss log so AI looks more reliable'],
        correct: 1, why: 'The dip responds to structure: defend the hour, re-seed the round, praise the catch, and report stories. Leaderboards and hidden misses trade a normal dip for a broken norm.' }
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
      var msg = pct >= 80 ? 'The method is loaded. Your team meets the new version of you this week.' :
                pct >= 50 ? 'Solid. Revisit the sections you missed before your first move.' :
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
