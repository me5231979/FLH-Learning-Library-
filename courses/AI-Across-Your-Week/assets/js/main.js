/* =====================================================================
   AI ACROSS YOUR WEEK, classroom deck
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
    root: '#bgGuess', q: '#bgQ', options: '#bgOptions', feedback: '#bgFeedback',
    progress: '#bgProgress', next: '#bgNext', result: '#bgResult',
    progressWord: 'Finding', goodColor: 'var(--vu-oak)',
    resultColor: 'var(--ink-soft, #555)', passAt: 3,
    passMsg: 'You called the research. The thread through every finding: the gains follow range and rhythm, and the plateau at one or two uses is exactly the habit this session breaks.',
    failMsg: 'Most rooms miss these, and that IS the finding: we assume the win comes from getting really good at one use, while the data keeps pointing at breadth.',
    labels: [],
    items: [
      { q: 'Gallup compares people who use AI for seven or more distinct tasks with people who use it for one or two. How much more likely are the seven-plus users to report real productivity gains?',
        opts: ['About the same', 'About 25 percent more likely', 'Roughly twice as likely'],
        answer: 2, why: 'Roughly twice as likely. The doubling comes from breadth: assists spread across many tasks compound into hours, while one trick saves minutes in one corner of the week.' },
      { q: 'Among employees who use AI at work, where does the biggest group actually sit?',
        opts: ['Parked at one or two uses', 'Spread evenly across every range', 'Mostly at seven-plus already'],
        answer: 0, why: 'Parked at one or two. Most people find a trick that works, an email draft or a summary, and stop. The plateau is the norm, which is why breaking it is worth a whole course.' },
      { q: 'Gallup also compares frequent users, daily or weekly, with occasional ones. What does that comparison show?',
        opts: ['The gap is barely measurable', 'Frequent users report gains far more often', 'Occasional users report more gains, less burnout'],
        answer: 1, why: 'Frequent users report gains far more often. Frequency and breadth travel together: a habit that runs across the week keeps its skills warm, while an occasional trick stays a novelty.' },
      { q: 'And where do the reported productivity gains concentrate?',
        opts: ['Among specialists who master one deep use', 'Among broad, habitual users across many tasks', 'Evenly across everyone who has tried AI once'],
        answer: 1, why: 'Among the broad, habitual users. The gains cluster where AI shows up in many places, regularly, which makes the multiplier a calendar question rather than a talent question.' }
    ]
  });

  /* Match the method (Section 03) */
  makeTrainer({
    root: '#mmMatch', q: '#mmQ', options: '#mmOptions', feedback: '#mmFeedback',
    progress: '#mmProgress', next: '#mmNext', result: '#mmResult',
    progressWord: 'Block', goodColor: 'var(--vu-oak)',
    resultColor: 'var(--ink-soft, #555)', passAt: 4,
    passMsg: 'You can sight-read a week. Verb first, method second: that reflex is most of the Week Map. Now aim it at your own inventory.',
    failMsg: 'Close. The tell is always the verb: writing takes drafts, asking takes answers, capturing a meeting takes minutes, explaining data takes numbers, choosing takes decisions.',
    labels: [],
    items: [
      { q: 'Monday starts with a status update to your director, written fresh every week from your project notes.',
        opts: ['Answers', 'First Drafts', 'Slides'],
        answer: 1, why: 'The verb is writing, so the drafts method: AI writes the first pass from your notes, you rewrite the judgment lines and check every claim before it goes.' },
      { q: 'Tuesday afternoon disappears into working out what the new travel policy actually allows before you book a site visit.',
        opts: ['Ideas', 'Answers', 'Decisions'],
        answer: 1, why: 'The verb is asking, so the answers method: ask, anchor the answer to the actual policy page, check before you book. The topic is travel; the verb is a question.' },
      { q: 'The Wednesday team meeting produces decisions that nobody can remember by Friday.',
        opts: ['First Drafts', 'Numbers', 'Minutes'],
        answer: 2, why: 'The verb is capturing, so the minutes method: decisions, owners, and deadlines pulled into a record and checked against your own notes before it ships to the team.' },
      { q: 'The enrollment spreadsheet lands Thursday morning and you need to know what changed before the 2 pm call.',
        opts: ['Numbers', 'Slides', 'Answers'],
        answer: 0, why: 'The verb is explaining data, so the numbers method: the export becomes a plain-language read of what moved and why, spot-checked against the source file before you repeat it.' },
      { q: 'Three vendor tabs have been open for two weeks while you circle the choice for the fall event.',
        opts: ['Ideas', 'Decisions', 'First Drafts'],
        answer: 1, why: 'The verb is choosing, so the decisions method: options, criteria, and tradeoffs laid out so you can finally weigh them. The call stays yours; the paperwork stops being the obstacle.' }
    ]
  });

  /* Build the chain (Section 04) */
  makeTrainer({
    root: '#bcChain', q: '#bcQ', options: '#bcOptions', feedback: '#bcFeedback',
    progress: '#bcProgress', next: '#bcNext', result: '#bcResult',
    progressWord: 'Task', goodColor: 'var(--vu-oak)',
    resultColor: 'var(--ink-soft, #555)', passAt: 4,
    passMsg: 'You can hear a stack now: two verbs in one task, chained in order, each link checked. Your heaviest block almost certainly hides one.',
    failMsg: 'Close. Find the two verbs in the task and put them in the order the work flows: capture before writing, explain before presenting, research before choosing.',
    labels: [],
    items: [
      { q: 'The monthly all-staff meeting ends, and the same-day follow-up email has to carry every decision and owner accurately.',
        opts: ['Minutes into First Drafts', 'Numbers into Slides', 'Answers into Ideas'],
        answer: 0, why: 'Capture, then write: minutes make the record, you check it against your notes, and the checked record feeds the follow-up draft. The check in the middle is what keeps the email honest.' },
      { q: 'The quarterly review deck is due, and the data lives in a messy export that has to become three clear trends.',
        opts: ['Ideas into Decisions', 'Numbers into Slides', 'Minutes into First Drafts'],
        answer: 1, why: 'Explain, then present: numbers turn the export into a checked read of what moved, and the checked read becomes the slide brief. Spot-check the figures before they climb into the deck.' },
      { q: 'Your director wants a recommendation on switching survey platforms by Friday, with the reasoning on paper.',
        opts: ['Answers into Decisions', 'Slides into Minutes', 'Numbers into First Drafts'],
        answer: 0, why: 'Research, then choose: the answers method gathers sourced, verified facts, and the decisions method turns them into a brief with criteria and tradeoffs. Verify the facts before they become the case.' },
      { q: 'The team retreat needs a fresh agenda, and the best ideas from the brainstorm have to reach the invite as a draft plan.',
        opts: ['Numbers into Slides', 'Ideas into First Drafts', 'Answers into Minutes'],
        answer: 1, why: 'Invent, then write: ideas generate the volume, your judgment picks the survivors, and drafts turn the survivors into the plan. The judgment pass between the links is the check.' },
      { q: 'Registration numbers arrived overnight, and the steering committee wants a one-page brief with a go or no-go recommendation.',
        opts: ['Minutes into Slides', 'Ideas into Answers', 'Numbers into Decisions'],
        answer: 2, why: 'Explain, then choose: numbers make the overnight data legible, and decisions frame the go or no-go with criteria. Check the figures first; a wrong number in a recommendation travels fastest of all.' }
    ]
  });

  /* Judge the bank (Section 06) */
  makeTrainer({
    root: '#jbBank', q: '#jbQ', options: '#jbOptions', feedback: '#jbFeedback',
    progress: '#jbProgress', next: '#jbNext', result: '#jbResult',
    progressWord: 'Account', goodColor: 'var(--vu-oak)',
    resultColor: 'var(--ink-soft, #555)', passAt: 4,
    passMsg: 'Your ear is calibrated: a real bank has a name, a calendar block, and a witness. Now go write yours before the week does it for you.',
    failMsg: 'Close. The tells: banked time has a named destination someone can see. Evaporated time has no story at all. Busywork has a story that, read twice, bought nothing.',
    labels: ['Banked visibly', 'Evaporated', 'Refilled with busywork'],
    items: [
      { q: 'The minutes method saves a coordinator three hours a week. She blocks Friday 9 to 12 on the shared calendar as "assessment project," and her manager can see it.',
        answer: 0, why: 'A named destination, a visible block, a witness. This gain will survive the calendar\'s pull, and the Friday block is now evidence the practice works.' },
      { q: 'The team\'s reporting got noticeably faster this month. Somehow every calendar is exactly as full as before, and nobody can say where the saved time went.',
        answer: 1, why: 'Evaporation, textbook: no name, no block, no story. The time was real and the calendar reabsorbed it so smoothly that the gain left no trace, which is the default ending this section exists to prevent.' },
      { q: 'The hours saved on drafting became a new weekly meeting to discuss how the AI pilots are going.',
        answer: 2, why: 'The time got a destination, and the destination is busywork about the tool itself. A recurring meeting is the calendar\'s favorite way to eat a gain while looking productive.' },
      { q: 'With drafting time down, he now answers every email within ten minutes and runs three extra polish passes on the newsletter.',
        answer: 2, why: 'Faster response and shinier polish feel like wins, and neither was ever the goal. Saved time refilled with lower-value versions of the same work is busywork wearing a productivity costume.' },
      { q: 'In her one-on-one, the analyst says it plainly: the two hours from the numbers method go to the data-cleanup backlog, and the project plan shows the line.',
        answer: 0, why: 'Named out loud, attached to real work, and reported where it counts. The one-line report is the third part of the bank, and it is what lets a personal gain become a team practice.' }
    ]
  });

  /* ---------- INTERACTIVE: private week inventory (Section 02) ---------- */
  var wkInv = $('#wkInv');
  if (wkInv) {
    var iHeavy = $('#wiHeavy'), iRepeat = $('#wiRepeat'), iPostpone = $('#wiPostpone'),
        iBtn = $('#wiBuild'), iStatus = $('#wiStatus'), iOut = $('#wiOut');
    var invReady = function () {
      var ok = iHeavy.value.trim().length >= 5 && iRepeat.value.trim().length >= 5 && iPostpone.value.trim().length >= 5;
      iBtn.disabled = !ok;
      iStatus.textContent = ok ? 'Ready, read it back' : 'Fill in all three';
      return ok;
    };
    [iHeavy, iRepeat, iPostpone].forEach(function (el) { el.addEventListener('input', invReady); });
    iBtn.addEventListener('click', function () {
      if (!invReady()) return;
      var esc = function (t) { return t.replace(/</g, '&lt;'); };
      iOut.innerHTML = '<span class="tag">My week, read back · private</span>' +
        '<div class="plan__out-grid">' +
        '<div class="row"><b>The heaviest block</b><span>' + esc(iHeavy.value.trim()) + '. Your stack candidate: heavy blocks usually hold two verbs, and chaining two methods here is where the biggest hours come back.</span></div>' +
        '<div class="row"><b>The most repetitive block</b><span>' + esc(iRepeat.value.trim()) + '. Your first match: repetition means a method will fit on the first try, so this is the assist to run this week for a quick, visible win.</span></div>' +
        '<div class="row"><b>The block you always postpone</b><span>' + esc(iPostpone.value.trim()) + '. Your bank: when the other two start saving hours, this is where the reclaimed time goes, by name, on the calendar.</span></div>' +
        '<div class="row"><b>What the inventory says</b><span>Three blocks, three different jobs on the map: one to stack, one to match first, one to fund. That is a Week Map in miniature.</span></div>' +
        '<div class="row"><b>The move</b><span>Hold onto these three. Section 03 matches the methods, section 04 builds the stack, and the capstone puts a date on the calendar pass.</span></div>' +
        '</div>';
      iOut.hidden = false;
      iOut.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'nearest' });
    });
  }

  /* ---------- INTERACTIVE: The Week Lab (Section 05) ---------- */
  var lab = $('#weekLab');
  if (lab) {
    var SLOTS = [
      { key: 'The Monday enrollment report', opts: [
        { t: 'Build it by hand like always; the numbers feel too important to hand to a tool.', pts: 1, coach: 'The verb here is explaining data, and the numbers method exists for exactly this export. Manual means the morning is gone and the week starts already behind.' },
        { t: 'AI summarizes the export and drafts the report; it reads clean, so it goes straight out.', pts: 2, coach: 'Right stack, missing check. "Reads clean" is what AI output always does, including the version with last month\'s figure in it. One unchecked Monday feeds a wrong number to everyone downstream.' },
        { t: 'AI summarizes the export and drafts the report; she checks the three headline figures against the source file, then sends.', pts: 3, coach: 'Numbers into drafts with the check between the links. The morning becomes 25 minutes, and the check is three minutes of tracing figures, which is what keeps the whole week trustworthy.' }]},
      { key: 'The Wednesday team meeting', opts: [
        { t: 'No notes again; whoever remembers a decision owns it, apparently.', pts: 1, coach: 'The meeting produces decisions and the decisions evaporate by Friday, so the meeting effectively runs twice. This block is the easiest match on the whole map, and it is sitting unclaimed.' },
        { t: 'AI drafts minutes from the recording and they go out to the team unread.', pts: 2, coach: 'Minutes claim what was decided and who owns it, and an unread draft can misassign both. Unverified minutes do not record the meeting; they quietly rewrite it.' },
        { t: 'AI drafts minutes from the recording; she checks decisions and owners against her own jottings and sends within the hour.', pts: 3, coach: 'The minutes method as designed: fast capture, a two-minute check against her own notes, and a record the team actually trusts. The same-day send is what makes the habit stick.' }]},
      { key: 'The Thursday committee deck', opts: [
        { t: 'From scratch in the deck tool, late into Wednesday night.', pts: 1, coach: 'The slides method starts with a brief, and the brief could start from Monday\'s checked numbers. From scratch means the week\'s hardest thinking happens at its most tired hour.' },
        { t: 'AI turns Monday\'s numbers into a slide outline; she ships the outline as slides, as-is.', pts: 2, coach: 'The stack is right and the last link lost its human. An outline is not a deck for a committee: the recommendation slide is judgment work, and shipping it unedited hands your call to autocomplete.' },
        { t: 'AI turns Monday\'s checked numbers into a slide brief; she builds five slides from it and writes the recommendation slide herself.', pts: 3, coach: 'Numbers into slides, with the judgment kept where it belongs. The checked Monday figures ride the chain safely because the first verify already happened, and Wednesday night gets returned to her.' }]},
      { key: 'The daily inbox', opts: [
        { t: 'Read everything in arrival order; the inbox is the job now.', pts: 1, coach: 'The repetitive half of this inbox is the same five questions in rotation, which is template work AI drafts well. Reading everything in order spends focus hours on autopilot work.' },
        { t: 'AI drafts replies to the routine messages from her templates; she reads each one before it sends.', pts: 3, coach: 'Drafts at the volume, a human read on every send. The reply is still hers, it just costs seconds instead of minutes, and the freed half hour a day is the quietest big win on the map.' },
        { t: 'AI auto-replies to anything that looks routine; she spot-checks on Fridays.', pts: 2, coach: 'A sent reply speaks for her, and "looks routine" is exactly the filter that misses the message that mattered. By the Friday spot-check, a wrong reply has had four days to do its work.' }]}
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
            'Choose ' + picks.filter(function (p) { return p === null; }).length + ' more block(s)';
          outEl.hidden = true;
        });
        d.appendChild(b);
      });
      slotsEl.appendChild(d);
    });
    var REACTIONS = {
      strong: 'Week four: about six hours a week are coming back, and they have names. Monday costs 25 minutes, the minutes ship before lunch, the deck starts Thursday morning from a checked brief, and the inbox takes 40 minutes instead of the morning. The bank line in her one-on-one is one sentence long, and her manager repeats it in the next staff meeting.',
      mid: 'Week four: faster, and strangely no lighter. A wrong figure rode the chain in week three, from an unchecked link into something people read, and the cleanup ate the savings. The rest of the reclaimed time was never named, so the calendar absorbed it without a receipt. The methods worked; the design around them leaked.',
      weak: 'Week four: the week looks exactly like week one, plus one incident. An unchecked output reached people who mattered, the old habits came back "until things settle," and the story forming is "we tried the AI thing." The tools took the blame for choices the design made.'
    };
    runBtn.addEventListener('click', function () {
      var score = picks.reduce(function (t, p, i) { return t + SLOTS[i].opts[p].pts; }, 0); // 4..12
      var pct = Math.round((score / 12) * 100);
      var tier = score >= 11 ? 'strong' : score >= 8 ? 'mid' : 'weak';
      var head = tier === 'strong' ? 'A seven-plus week. Methods on the volume, checks on every link, and the saved hours have somewhere to land.'
               : tier === 'mid' ? 'Half a practice. The methods are placed, and the soft checks and the unnamed hours are where week three finds you.'
               : 'A week that stayed heavy. Assists without checks and savings without names give back everything they gain.';
      var coach = picks.map(function (p, i) { return '<div><b>' + SLOTS[i].key + ':</b> ' + SLOTS[i].opts[p].coach + '</div>'; }).join('');
      outEl.innerHTML = '<span class="tag">Four weeks in · ' + score + ' / 12</span>' +
        '<div class="lab__meter"><span style="width:0"></span></div>' +
        '<p style="margin:0;color:#fff;font-weight:500">' + head + '</p>' +
        '<div class="sample">' + REACTIONS[tier] + '</div>' +
        '<div class="lab__coach">' + coach + '</div>' +
        (tier !== 'strong' ? '<p class="why" style="margin-top:1rem"><b>Try again:</b> strengthen your weakest block and rerun the month. Watch the week-four story change.</p>'
                           : '<p class="why" style="margin-top:1rem"><b>Now the real thing:</b> the drill in Go deeper translates the coordinator\'s week into yours.</p>');
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

  /* ---------- INTERACTIVE: Week Map capstone ---------- */
  var planEl = $('#wkPlan');
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
      minutes: { name: 'Minutes into drafts', move: 'The next recurring meeting gets recorded; AI drafts the minutes, you check decisions and owners against your own notes, and the checked minutes feed the follow-up draft, read before it sends.' },
      numbers: { name: 'Numbers into slides', move: 'The next data drop goes through the numbers method first: a plain-language read, spot-checked against the source. The checked read becomes the slide brief, and you keep the recommendation slide.' },
      answers: { name: 'Answers into a decision brief', move: 'The open question you have been circling gets the answers treatment: sourced, anchored, verified. The verified answers become a one-page brief with criteria and tradeoffs, and the call stays yours.' },
      inventory: { name: 'Inventory first, then choose', move: 'Run the full inventory before committing: last week\'s calendar and sent folder, five to eight blocks, honest hours on each. The stack will pick itself; the heaviest block almost always holds two verbs.' }
    };
    var NOT = {
      evaporate: 'Letting saved time evaporate unnamed. Counter-move: before the first assist runs, create the bank block on the calendar, named for its destination, and report one line a month on what the time bought.',
      nochecks: 'Running a chain without checks. Counter-move: no link feeds the next until its output is verified against a source, and the check you are most tempted to skip is the one you write down.',
      reddata: 'Putting people data in unapproved tools while moving fast. Counter-move: the traffic light rides every assist; red data never enters unapproved tools, whatever the deadline says, and the light outranks the map.'
    };
    var WHEN = { tomorrow: 'tomorrow', threedays: 'within the next 3 days', week: 'within 7 days' };
    buildBtn.addEventListener('click', function () {
      if (!planReady()) return;
      var who = whoIn.value.trim();
      var p = PRACTICE[pick.practice];
      var rows = '' +
        '<div class="row"><b>The five blocks</b><span>' + who.replace(/</g, '&lt;') + '</span></div>' +
        '<div class="row"><b>The first stack</b><span>' + p.name + '. ' + p.move + '</span></div>' +
        '<div class="row"><b>What I will NOT do</b><span>' + NOT[pick.not] + '</span></div>' +
        '<div class="row"><b>The first move</b><span>The 30-minute calendar pass, ' + WHEN[pick.when] + ': next week\'s calendar open, each assist placed on its block with its method and its check in the appointment notes.</span></div>' +
        '<div class="row"><b>The bank</b><span>Where the reclaimed hours go, named before they arrive: the backlog project, the deep-work block, or leaving on time. It becomes a visible calendar block in week one.</span></div>' +
        '<div class="row"><b>The evidence</b><span>After two weeks, one line: how many assists ran, what they saved, and what the banked time bought. That line decides which method\'s course you take next.</span></div>';
      outEl2.innerHTML = '<span class="tag">My Week Map</span>' +
        '<div class="plan__out-grid">' + rows + '</div>' +
        '<div class="lab__runrow" style="margin-top:1.25rem">' +
        '<button class="btn" id="planCopy">Copy my map</button>' +
        '<span class="quiz__progress" id="planCopied" style="color:rgba(255,255,255,.6)">Put the calendar pass on the calendar now</span></div>';
      outEl2.hidden = false;
      $('#planCopy').addEventListener('click', function () {
        var text = 'MY WEEK MAP (AI Across Your Week, Vanderbilt)\n' +
          'The five blocks: ' + who + '\n' +
          'First stack: ' + p.name + '. ' + p.move + '\n' +
          'I will NOT: ' + NOT[pick.not] + '\n' +
          'First move: the 30-minute calendar pass ' + WHEN[pick.when] + '.\n' +
          'The bank: reclaimed hours go to ____ (name it before the week starts).\n' +
          'Evidence: after two weeks, one line on what ran, what it saved, and what the bank bought.';
        (navigator.clipboard ? navigator.clipboard.writeText(text) : Promise.reject()).then(function () {
          $('#planCopied').textContent = 'Copied. Paste it somewhere you\'ll see before the calendar pass.';
        }, function () {
          $('#planCopied').textContent = 'Select the map text above and copy it manually.';
        });
      });
      outEl2.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'nearest' });
    });
  }

  /* ---------- INTERACTIVE: scored recap quiz ---------- */
  var recap = $('#recap');
  if (recap) {
    var QUESTIONS = [
      { q: 'In Gallup\'s workplace AI research, who is roughly twice as likely to report real productivity gains?',
        opts: ['People using the newest, most capable model', 'People who use AI for seven or more distinct tasks, versus one or two', 'People who took the most AI training courses', 'People in technical roles'],
        correct: 1, why: 'Breadth is the multiplier: seven-plus distinct uses roughly doubles the odds of real gains over one or two. Range beats mastery of a single trick, which is the whole case for a Week Map.' },
      { q: 'The Week Map\'s first step, the inventory, asks you to write down...',
        opts: ['Every task you did last month, exhaustively', 'The colleagues who slow your week down', 'Your week\'s recurring blocks with an honest hour cost, kept to roles and workflows', 'The AI tools you would like to try'],
        correct: 2, why: 'Recurring blocks, honest hours, and no people\'s names. The inventory is the surface everything else runs on, and the traffic light applies from the first line you write.' },
      { q: 'The matching rule for pairing a block with a CHART method is...',
        opts: ['Match the block\'s verb: what you are doing, whatever the topic', 'Match the block\'s topic: budget blocks take the numbers method', 'Always start with the method you know best', 'Use the newest method on the biggest block'],
        correct: 0, why: 'Verbs match; topics mislead. A budget block might be writing, presenting, or explaining, and each verb takes a different method.' },
      { q: 'The meeting ends and the same-day follow-up email has to carry the decisions accurately. The stack is...',
        opts: ['Numbers into slides', 'Minutes into first drafts', 'Ideas into decisions', 'Answers into minutes'],
        correct: 1, why: 'Capture, then write: minutes make the checked record, and the record feeds the draft. The order follows the flow of the work, and the check sits between the links.' },
      { q: 'What sets the trustworthiness of a two-method chain?',
        opts: ['The quality of the AI model on each link', 'The total time the chain saves', 'Its weakest verify: the softest check between links', 'How many links the chain has'],
        correct: 2, why: 'The weakest verify sets the ceiling. An error that slips one link rides the rest looking more polished at every step, so every link keeps its own check, especially the one you are tempted to skip.' },
      { q: 'The minutes method starts saving you two hours a week. The research on recovered time says those hours will...',
        opts: ['Stay free; saved time takes care of itself', 'Automatically flow into your most important work', 'Refill with meetings and busywork unless you name and bank them visibly', 'Only matter if they exceed five hours'],
        correct: 2, why: 'Recovered time evaporates by default. The bank is the counter-move: name the destination, block it on the calendar, and report one line on what the time bought.' }
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
      var msg = pct >= 80 ? 'The method is loaded. The calendar pass is where it becomes real.' :
                pct >= 50 ? 'Solid. Revisit the sections you missed before the calendar pass.' :
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
