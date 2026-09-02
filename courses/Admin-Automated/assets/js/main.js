/* =====================================================================
   ADMIN, AUTOMATED, classroom deck
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
    root: '#rtGuess', q: '#rtQ', options: '#rtOptions', feedback: '#rtFeedback',
    progress: '#rtProgress', next: '#rtNext', result: '#rtResult',
    progressWord: 'Finding', goodColor: 'var(--vu-oak)',
    resultColor: 'var(--ink-soft, #555)', passAt: 3,
    passMsg: 'You called the research. The pattern in the numbers: the payoff is real, the trap is real, and the difference between them is whether anyone designed the system.',
    failMsg: 'Most rooms miss these, and that is useful: we underestimate how much of the week repeats, and we overestimate how well saved time protects itself.',
    labels: [],
    items: [
      { q: 'Gallup asks working AI users what actually pays off. What share report clear productivity gains when they point AI at repetitive tasks?',
        opts: ['About a quarter', 'About half', 'Around 77 percent'],
        answer: 2, why: 'Around 77 percent, the strongest result Gallup measures for any everyday AI use. Repetitive admin is the highest-payoff place to start, which is why this course starts there.' },
      { q: 'Now tally an ordinary admin-heavy week: reports, scheduling, inbox. How much of it is work being repeated the same way it was done last week?',
        opts: ['Almost none, every week is different', 'Roughly a third', 'Essentially all of it'],
        answer: 1, why: 'Roughly a third is what repeat audits typically turn up: the same messages, the same tables, the same requests wearing new dates. Your own number arrives in the next section.' },
      { q: 'Leadership Circle\'s warning about AI time savings: what usually happens to the hour you save?',
        opts: ['It compounds into deep work automatically', 'It quietly evaporates into meetings and more email', 'It shows up as a shorter workday'],
        answer: 1, why: 'It evaporates. Saved time that nobody names gets refilled by the calendar within weeks, which is why this course ends with banking the hours, out loud.' },
      { q: 'Among people who already use AI often at work, where does automating repetitive tasks rank as a use case?',
        opts: ['A niche habit for technical staff', 'Somewhere in the middle of the pack', 'The single highest-payoff use case'],
        answer: 2, why: 'Top of the list. Frequent users converge on the same discovery: the fastest real gains sit in the repetitive layer, the work this session teaches you to find and hand off.' }
    ]
  });

  /* Judge the template (Section 03) */
  makeTrainer({
    root: '#tplJudge', q: '#tjQ', options: '#tjOptions', feedback: '#tjFeedback',
    progress: '#tjProgress', next: '#tjNext', result: '#tjResult',
    progressWord: 'Template', goodColor: 'var(--vu-oak)',
    resultColor: 'var(--ink-soft, #555)', passAt: 4,
    passMsg: 'Your template ear works: slots where things change, voice where it counts, and nothing specific left behind. Now build one for real in the group drill below.',
    failMsg: 'Close. The tells: a good template brackets everything that changes, a baked-in one still carries somebody\'s name or date, and a generic one says nothing you would actually send.',
    labels: ['Reusable with slots', 'Specifics baked in', 'Too generic to help'],
    items: [
      { q: '"Hi [NAME], thanks for reaching out about [TOPIC]. The short answer is [ANSWER]. The full policy is at [LINK], and I\'m happy to talk it through on [DAY]."',
        answer: 0, why: 'Every changeable part is a bracketed slot, and the sentences still sound like a person wrote them. Save it; this is the skeleton working.' },
      { q: '"Hi Marcus, thanks for reaching out about the March travel reimbursement. The short answer is yes, the deadline moved to the 15th."',
        answer: 1, why: 'Marcus, March, and the 15th are leftovers, and one of them will ship to the wrong person next month. Names and dates are slots, never leftovers.' },
      { q: '"Dear colleague, thank you for your message. We will respond as appropriate at the earliest opportunity."',
        answer: 2, why: 'It commits to nothing and answers nothing, so you would rewrite it every time. A template that always needs a rewrite is just the repeat tax with a new invoice.' },
      { q: '"Status update for [MONTH]: enrollment [NUMBER], budget [ON TRACK / WATCH, one line why], next milestone [DATE]. Flag for leadership: [ONE SENTENCE, OR DELETE THIS ROW]."',
        answer: 0, why: 'A report skeleton with slots, plus a rule for the judgment row. The structure repeats every month; the thinking stays fresh and stays yours.' },
      { q: '"Team, quick reminder that the quarterly report is due Friday the 12th to Dana in the finance office, same as last quarter."',
        answer: 1, why: '"Same as last quarter" makes it feel reusable, and Dana plus Friday the 12th are baked in. The quarter this stops being true, the template ships it anyway.' }
    ]
  });

  /* Triage the inbox (Section 04) */
  makeTrainer({
    root: '#triSort', q: '#tsQ', options: '#tsOptions', feedback: '#tsFeedback',
    progress: '#tsProgress', next: '#tsNext', result: '#tsResult',
    progressWord: 'Item', goodColor: 'var(--vu-oak)',
    resultColor: 'var(--ink-soft, #555)', passAt: 4,
    passMsg: 'You sort like the system: deadlines first, real asks second, and the noise swept by rules. Now go count how much of your own inbox is pile three.',
    failMsg: 'Close. The sorting question, asked in order: does this need me today, this week, or at all? A real same-day deadline is rare, and pile three is bigger than it looks.',
    labels: ['Needs me today', 'Needs me this week', 'Does not need me'],
    items: [
      { q: 'Your director asks for two numbers for a budget meeting that starts at 3 pm today.',
        answer: 0, why: 'A real deadline inside the day with your name on it: pile one, handled before anything else gets to make noise.' },
      { q: 'A vendor newsletter announces the vendor\'s own upcoming webinar.',
        answer: 2, why: 'No decision, no deadline, nothing addressed to you personally. Classic pile three: a sweep rule files this on arrival and you never see it.' },
      { q: 'A colleague asks the policy question you have answered the same way a dozen times.',
        answer: 1, why: 'A real ask with no same-day clock, and it is exactly what your saved reply is for: AI drafts from the template, you read it, one minute total.' },
      { q: 'An automated notification confirms that last night\'s scheduled data backup completed.',
        answer: 2, why: 'A machine telling you a machine worked. Pile three, swept by rule; your weekly scan of the swept folder is the safety net.' },
      { q: 'A 14-reply thread about next month\'s event where you are copied, and buried in reply nine someone asks whether your team can staff a table.',
        answer: 1, why: 'A real ask with a soft deadline hiding in volume. Let AI summarize the thread and draft the reply from your template; you read it before it sends.' }
    ]
  });

  /* Keep, shrink, or retire (Section 06) */
  makeTrainer({
    root: '#ksrSort', q: '#ksQ', options: '#ksOptions', feedback: '#ksFeedback',
    progress: '#ksProgress', next: '#ksNext', result: '#ksResult',
    progressWord: 'Obligation', goodColor: 'var(--vu-oak)',
    resultColor: 'var(--ink-soft, #555)', passAt: 4,
    passMsg: 'You can hear the difference between work that earns its slot and work that just keeps it. Take the same ear to your own recurring list in the group drill.',
    failMsg: 'Close. The tells: judgment and relationships get kept, mechanical volume gets shrunk with templates and rules, and anything with no visible audience earns a one-cycle test.',
    labels: ['Keep it', 'Shrink it', 'Test-retire it'],
    items: [
      { q: 'The weekly one-on-one with your manager.',
        answer: 0, why: 'High-judgment relationship time is what the recovered hours are FOR. The audit exists to protect this kind of work, never to touch it.' },
      { q: 'The monthly activity report that no recipient has replied to, referenced, or asked about in three years.',
        answer: 2, why: 'The report nobody reads, the audit\'s signature find. With your manager in the loop, skip one cycle and watch who notices. Restart is one email away.' },
      { q: 'The hour-long weekly status meeting where most updates could be read in two minutes.',
        answer: 1, why: 'Shrink: the updates become a templated message sent before the meeting, and the meeting drops to 25 minutes for the two items that need actual discussion.' },
      { q: 'The daily scan of a shared inbox where most messages are automated confirmations.',
        answer: 1, why: 'Shrink it with routing: sweep rules file the confirmations on arrival, and the daily scan becomes a five-minute pass over what is left.' },
      { q: 'The quarterly compliance attestation that university policy requires.',
        answer: 0, why: 'Required is required. Template its cover note if you like, and never test-retire an obligation someone else\'s policy owns; the test is for work whose audience is in doubt.' }
    ]
  });

  /* ---------- INTERACTIVE: private recurrence inventory (Section 02) ---------- */
  var rab = $('#raBuild');
  if (rab) {
    var raMsg = $('#raMsg'), raReport = $('#raReport'), raAsk = $('#raAsk'),
        raBtn = $('#raRank'), raStatus = $('#raStatus'), raOut = $('#raOut');
    var raReady = function () {
      var ok = raMsg.value.trim().length >= 5 && raReport.value.trim().length >= 5 && raAsk.value.trim().length >= 5;
      raBtn.disabled = !ok;
      raStatus.textContent = ok ? 'Ready, rank them' : 'Fill in all three';
      return ok;
    };
    [raMsg, raReport, raAsk].forEach(function (el) { el.addEventListener('input', raReady); });
    raBtn.addEventListener('click', function () {
      if (!raReady()) return;
      var esc = function (t) { return t.replace(/</g, '&lt;'); };
      raOut.innerHTML = '<span class="tag">My top three automation candidates · private</span>' +
        '<div class="plan__out-grid">' +
        '<div class="row"><b>1 · The message</b><span>' + esc(raMsg.value.trim()) + '. Highest frequency, lowest risk: template it this week from three past examples, de-identified, with slots for every name and date.</span></div>' +
        '<div class="row"><b>2 · The request</b><span>' + esc(raAsk.value.trim()) + '. A saved reply with slots answers it in one minute; keep the link or policy detail as a slot too, so the reply never goes stale.</span></div>' +
        '<div class="row"><b>3 · The report</b><span>' + esc(raReport.value.trim()) + '. Template the skeleton now; next cycle, let AI write the first pass from your inputs, and keep the judgment rows yours.</span></div>' +
        '<div class="row"><b>The ranking rule</b><span>Frequency times sameness: the more often it repeats and the more identical each repeat, the higher the payoff. And the traffic light runs the whole time: strip people\'s details before any example reaches AI.</span></div>' +
        '<div class="row"><b>The move</b><span>Carry candidate 1 into section 03; it becomes your first template, and the capstone puts a date on the build.</span></div>' +
        '</div>';
      raOut.hidden = false;
      raOut.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'nearest' });
    });
  }

  /* ---------- INTERACTIVE: The Automation Lab (Section 05) ---------- */
  var lab = $('#autoLab');
  if (lab) {
    var SLOTS = [
      { key: 'Gather the inputs', opts: [
        { t: 'Email each program lead individually, wait, chase, and rebuild the summary table by hand like every month.', pts: 1, coach: 'Three days of the month go to chasing and retyping. This is mechanical volume with zero judgment in it, the exact work the audit exists to hand off.' },
        { t: 'Send every lead your new templated request form so the inputs arrive in the same shape.', pts: 2, coach: 'The template fixes the shape and still leaves you assembling by hand. A good first step; the AI first pass over the returned forms is the hour you are still leaving on the table.' },
        { t: 'Templated request goes out; AI drafts the combined summary from the returns; you check the numbers against the source files.', pts: 3, coach: 'Template plus AI first pass plus your check against source. The gather step now costs an hour, and the numbers still have a human who owns them.' }]},
      { key: 'Write the report', opts: [
        { t: 'Write it from scratch; leadership can tell when a report is templated.', pts: 1, coach: 'What leadership can actually tell is when a report is wrong or late. Scratch writing spends your judgment hours re-inventing a structure that has not changed in a year.' },
        { t: 'Paste the inputs into AI, ask for a report, and lightly tidy whatever comes back.', pts: 2, coach: 'Without your template the structure and voice drift every month, and "lightly tidy" quietly becomes a full rewrite. The skeleton is what makes the first pass usable.' },
        { t: 'AI fills your report template from the gathered inputs; you write the two judgment paragraphs, risks and recommendations, yourself.', pts: 3, coach: 'The skeleton repeats, the thinking stays yours. This is template plus first pass working exactly as designed.' }]},
      { key: 'Send it', opts: [
        { t: 'Schedule auto-send for the first Friday of the month; the process is solid now.', pts: 1, coach: 'Auto-send is how last month\'s numbers ship under this month\'s date with your name on the send line. Nothing leaves without your eyes; that rule keeps no exceptions.' },
        { t: 'Skim the subject line and first paragraph, then send; the template has been right for months.', pts: 2, coach: 'The skim is how the leftover slot sneaks through, and "it has been right for months" is exactly when it happens. Read the parts that change: the numbers and the names.' },
        { t: 'Read the draft top to bottom, check the two numbers that change monthly, then send it yourself.', pts: 3, coach: 'Read-then-send with a spot check on what changes. Five minutes, and it is the whole difference between automation and abdication.' }]},
      { key: 'The calendar around it', opts: [
        { t: 'Accept every meeting request as it arrives; declining feels rude.', pts: 1, coach: 'The time the automation saved has nowhere to live, so the calendar absorbs it within two weeks. This is the evaporation trap running exactly on schedule.' },
        { t: 'Decline meetings ad hoc during report week, whenever you feel overwhelmed.', pts: 2, coach: 'Ad hoc defense fails on the busy weeks, which are the only weeks that matter. Rules decide once; willpower has to win every single day.' },
        { t: 'Standing rules: 25 and 50 minute defaults, two protected focus blocks, and a saved decline template for the collisions.', pts: 3, coach: 'The recovered hours now have a named, defended home, and declining costs nothing because the words are already written.' }]}
    ];
    var picks = [null, null, null, null];
    var slotsEl = $('#labSlots'), runBtn = $('#labRun'), statusEl = $('#labStatus'), outEl = $('#labOutcome');
    // Branching: slots open one at a time, and every slot after the first carries a
    // situation set by the learner's first move, so that move stays in the room.
    var BRANCH = { 1: ["Day three of the month. The last program lead finally replied, and the summary table is rebuilt by hand. You are behind before the writing starts, and leadership expects the report by end of week. The inputs are in front of you, uneven and late. How does the report get written?", "Day two of the month. The templated forms came back in the same shape, which is new. You still spent a morning assembling them into one summary by hand. The inputs are clean and in front of you, and the writing starts now. How does the report get written?", "Day one, before lunch. The forms came back in one shape. AI drafted the combined summary, and you checked the numbers against source. The gather step cost an hour. The inputs are clean, checked, and in front of you, with the month barely started. How does the report get written?"], 2: ["The draft is done, late and tired. It is day four, and the numbers in it came from a table you rebuilt under pressure. Leadership has already asked once where the report is. The send button is right there. How does it go out?", "The draft is done on day three. The templated inputs made it faster, though every number still passed through your hands once, by keyboard. The report looks like last month's, which is the point. The send button is right there. How does it go out?", "The draft is done on day two. The numbers in it were checked against source before the writing began. That check makes the send feel safe. It is the first time this report has been ready early. The send button is right there. How does it go out?"], 3: ["Month two starts, and the chase starts with it. Three days went to gathering again, so no time came back at all. Meanwhile meeting requests keep arriving, and each one lands on a week that already has no room. The calendar is filling on its own. What is the rule?", "Month two. The template saved you a day of chasing, and that day has already been claimed. Two meeting requests arrived the same afternoon it opened up, and both are waiting for an answer. The saved time is real, and it has no address yet. What is the rule?", "Month two. The gather step took an hour instead of three days. A quiet afternoon has appeared on your calendar. It is the first one in a year. Two meeting requests are already pointed at it. The recovered time is real and has no home yet. What is the rule?"] };
    var CARRY = ["Chasing inputs by hand ate three days, so nothing downstream had any time to save.", "The template fixed the shape of the inputs and left the assembling, and its hour, on you.", "Template, AI first pass, and your check turned three days of gathering into one owned hour."];
    var slotEls = [];
    function openSlots() {
      var open = 0;
      while (open < SLOTS.length && picks[open] !== null) open++;
      slotEls.forEach(function (el, k) {
        el.hidden = k > open;
        var sit = $('[data-situation]', el);
        if (sit) sit.textContent = (picks[0] !== null && BRANCH[k]) ? BRANCH[k][picks[0]] : '';
      });
    }
    SLOTS.forEach(function (slot, si) {
      var d = document.createElement('div');
      d.className = 'slot';
      d.innerHTML = '<h3>' + (si + 1) + ' · ' + slot.key + '</h3>' + (BRANCH[si] ? '<p class="slot__situation" data-situation aria-live="polite"></p>' : '');
      slot.opts.forEach(function (o, oi) {
        var b = document.createElement('button');
        b.className = 'opt'; b.type = 'button'; b.setAttribute('aria-pressed', 'false');
        b.innerHTML = '<span class="mark">' + String.fromCharCode(65 + oi) + '</span><span>' + o.t + '</span>';
        b.addEventListener('click', function () {
          picks[si] = oi;
          $$('.opt', d).forEach(function (x, xi) { x.setAttribute('aria-pressed', String(xi === oi)); });
          for (var k = si + 1; k < SLOTS.length; k++) {
            picks[k] = null;
            $$('.opt', slotEls[k]).forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
          }
          openSlots();
          var ready = picks.every(function (p) { return p !== null; });
          runBtn.disabled = !ready;
          statusEl.textContent = ready ? 'Ready, run two months' :
            'Choose ' + picks.filter(function (p) { return p === null; }).length + ' more step(s)';
          outEl.hidden = true;
          if (slotEls[si + 1] && !slotEls[si + 1].hidden) {
            slotEls[si + 1].scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'nearest' });
          }
        });
        d.appendChild(b);
      });
      slotEls.push(d);
      slotsEl.appendChild(d);
    });
    openSlots();
    var REACTIONS = {
      strong: 'Month two: the report went out on day two instead of day five, correct, and in your voice. The quiet afternoon reappeared, and because two focus blocks were waiting for it, it went to the backlog project instead of back into the inbox. Your program leads noticed exactly one change: you stopped chasing them.',
      mid: 'Month two: faster, mostly. But one stale number slipped out in month one, or a focus block got surrendered to a meeting, and now you re-check everything by hand, so half the saved time is already gone. The steps you designed held; the steps running on good intentions are where the month leaked.',
      weak: 'Month two: the auto-sent draft went out with last month\'s enrollment numbers under this month\'s date, and your director caught it before you did. The template took the blame for the send you never read, the calendar swallowed whatever time was left, and "I tried automating it and it backfired" is now the story you tell.'
    };
    runBtn.addEventListener('click', function () {
      var score = picks.reduce(function (t, p, i) { return t + SLOTS[i].opts[p].pts; }, 0); // 4..12
      var pct = Math.round((score / 12) * 100);
      var tier = score >= 11 ? 'strong' : score >= 8 ? 'mid' : 'weak';
      var head = tier === 'strong' ? 'A real system. The repeats went to templates and rules, and every send still gets your eyes.'
               : tier === 'mid' ? 'Half a system. The templates are earning; the soft spots are the send and the calendar, and soft spots leak.'
               : 'Speed without accountability. Fast drafts plus an unread send plus an undefended calendar is how automation gets a bad name.';
      var coach = picks.map(function (p, i) { return '<div><b>' + SLOTS[i].key + ':</b> ' + SLOTS[i].opts[p].coach + '</div>'; }).join('');
      outEl.innerHTML = '<span class="tag">Two months in · ' + score + ' / 12</span>' +
        '<div class="lab__meter"><span style="width:0"></span></div>' +
        '<p style="margin:0;color:#fff;font-weight:500">' + head + '</p>' +
        '<div class="sample">' + REACTIONS[tier] + '</div>' +
        (CARRY[picks[0]] ? '<p class="lab__carry"><b>What your first move set in motion:</b> ' + CARRY[picks[0]] + '</p>' : '') +
        '<div class="lab__coach">' + coach + '</div>' +
        (tier !== 'strong' ? '<p class="why" style="margin-top:1rem"><b>Try again:</b> strengthen your weakest step and rerun the two months. Watch what changes.</p>'
                           : '<p class="why" style="margin-top:1rem"><b>Now the real thing:</b> the pair drill in Go deeper runs this same design on YOUR task.</p>');
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

  /* ---------- INTERACTIVE: Automation Card capstone ---------- */
  var planEl = $('#acPlan');
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
      template: { name: 'Template it from three past examples', move: 'Pull three past versions, strip every name and date, ask AI for the reusable skeleton with slots, and edit it until it sounds like you. Save it where your fingers will find it.' },
      triage: { name: 'Set up the three triage piles', move: 'Needs me today, needs me this week, does not need me. Write the sweep rules for pile three, let AI summarize and draft for pile two, and read everything before it sends.' },
      calendar: { name: 'Add two calendar rules', move: 'Default meetings to 25 and 50 minutes, put two named focus blocks on next week, and save the two-sentence decline template before the first collision arrives.' },
      retire: { name: 'Test-retire one recurring item', move: 'With your manager in the loop, skip one cycle of the report or meeting you suspect nobody needs, and watch who notices. Restart stays one email away.' }
    };
    var NOT = {
      autosend: 'Auto-send anything. Counter-move: read-then-send is the standing rule; every message and report gets your eyes before it carries your name, especially in the months when the template has been right for a while.',
      name: 'Leave a name baked in a template. Counter-move: before saving any template, hunt it for names, dates, and numbers; everything specific becomes a [SLOT], and people\'s details never reach unapproved tools.',
      evaporate: 'Let the saved hour evaporate unnamed. Counter-move: the moment the automation lands, name what the recovered time is for, out loud, and give it a calendar home before the meetings find it.'
    };
    var WHEN = { tomorrow: 'tomorrow', threedays: 'within the next 3 days', week: 'within 7 days' };
    buildBtn.addEventListener('click', function () {
      if (!planReady()) return;
      var who = whoIn.value.trim();
      var p = PRACTICE[pick.practice];
      var rows = '' +
        '<div class="row"><b>The task</b><span>' + who.replace(/</g, '&lt;') + '</span></div>' +
        '<div class="row"><b>The move</b><span>' + p.name + '. ' + p.move + '</span></div>' +
        '<div class="row"><b>What I will NOT do</b><span>' + NOT[pick.not] + '</span></div>' +
        '<div class="row"><b>The first move</b><span>The 20-minute build session, ' + WHEN[pick.when] + ': quiet time, three past examples, one saved template or rule at the end of it.</span></div>' +
        '<div class="row"><b>The bank</b><span>Name what the recovered time is for and put it on the calendar the same day. Unnamed hours evaporate; banked hours compound.</span></div>' +
        '<div class="row"><b>The evidence</b><span>After two weeks, one line: what does the task cost now, and what did the banked hours actually buy? That line decides what you automate next.</span></div>';
      outEl2.innerHTML = '<span class="tag">My automation card</span>' +
        '<div class="plan__out-grid">' + rows + '</div>' +
        '<div class="lab__runrow" style="margin-top:1.25rem">' +
        '<button class="btn" id="planCopy">Copy my card</button>' +
        '<span class="quiz__progress" id="planCopied" style="color:rgba(255,255,255,.6)">Put the build session on the calendar now</span></div>';
      outEl2.hidden = false;
      $('#planCopy').addEventListener('click', function () {
        var text = 'MY AUTOMATION CARD (Admin, Automated, Vanderbilt)\n' +
          'The task: ' + who + '\n' +
          'The move: ' + p.name + '. ' + p.move + '\n' +
          'I will NOT: ' + NOT[pick.not] + '\n' +
          'First move: the 20-minute build session ' + WHEN[pick.when] + '.\n' +
          'The bank: name what the recovered time is for and give it a calendar home.\n' +
          'Evidence: after two weeks, one line on what the task costs now and what the hours bought.';
        (navigator.clipboard ? navigator.clipboard.writeText(text) : Promise.reject()).then(function () {
          $('#planCopied').textContent = 'Copied. Paste it somewhere you\'ll see before the build session.';
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
      { q: 'Gallup\'s workplace AI research points at one use case as the highest payoff. Which one?',
        opts: ['Writing creative content from scratch', 'Automating repetitive tasks', 'Replacing meetings with chatbots', 'Advanced data analysis for specialists'],
        correct: 1, why: 'Automating repetitive admin: around 77 percent of users report clear productivity gains there, the strongest result Gallup measures for any everyday use.' },
      { q: 'The Repeat Audit\'s rule of thumb: what marks a task as an automation candidate?',
        opts: ['It takes more than an hour to do', 'You have done it more than twice the same way', 'It involves a computer at any point', 'You dislike doing it'],
        correct: 1, why: 'More than twice the same way is the tell, and frequency times sameness is the payoff math. Disliking a task is a reason to audit it, never proof it repeats.' },
      { q: 'A saved email template still contains "Hi Marcus" and "the March deadline." What does template hygiene say?',
        opts: ['Fine; Marcus probably will not mind', 'Names and dates must become slots before the template is saved', 'Templates should never include a greeting', 'Add more specifics so it feels personal'],
        correct: 1, why: 'Specifics are slots, never leftovers. The leftover name is the classic template accident: last month\'s details shipping under this month\'s date, to the wrong person.' },
      { q: 'In the three-pile triage system, what does AI do and what do you do?',
        opts: ['AI reads, drafts, and sends; you monitor the results', 'AI sorts, summarizes, and drafts; you read and decide before anything sends', 'You do the sorting; AI makes the decisions', 'AI handles the whole inbox on alternating days'],
        correct: 1, why: 'Rules sort, AI drafts, you decide. Nothing leaves without your eyes: the system saves your reading and typing time, never your accountability.' },
      { q: 'The Automation Lab\'s hardest lesson lives at the send step. Why is auto-send off the table?',
        opts: ['Auto-send is technically difficult to set up', 'Recipients can always tell a scheduled send', 'A wrong draft, like last month\'s numbers, ships under your name with nobody reading it', 'University policy bans scheduled email'],
        correct: 2, why: 'The auto-sent draft with stale numbers is the signature automation failure. Read-then-send costs five minutes and is the whole difference between automation and abdication.' },
      { q: 'You suspect a monthly report has no readers. The safe way to find out?',
        opts: ['Stop producing it, quietly and permanently', 'Keep producing it forever, just in case', 'With your manager in the loop, skip one cycle and watch who notices', 'Send it half-finished and see if anyone comments'],
        correct: 2, why: 'Test retirement: one skipped cycle, manager aware, restart one email away. Some recurring work should simply stop, and this is how you find out at zero cost.' }
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
                pct >= 50 ? 'Solid. Revisit the sections you missed before the build session.' :
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

  /* ---------- INTERACTIVE: Inbox Triage card sort (Section 02) ---------- */
  var itRoot = $('#inboxTriage');
  if (itRoot) {
    var IT_PILES = [
      { key: 'template', label: 'Template it' },
      { key: 'route', label: 'Route it' },
      { key: 'retire', label: 'Retire it' },
      { key: 'keep', label: 'Keep it' }
    ];
    var IT_ITEMS = [
      { from: 'A colleague in another department', subj: 'Reimbursement question, again',
        prev: 'Sorry, I know you have told me before: how do I get reimbursed for conference travel?',
        answer: 'template', why: 'You have answered this the same way a dozen times. That is Tell 3, the echo, and a saved reply with slots answers it in one minute.' },
      { from: 'A vendor mailing list', subj: 'Webinar next Thursday',
        prev: 'Join us for a look at what is new this quarter.',
        answer: 'route', why: 'No decision, no deadline, nothing addressed to you. A sweep rule files it on arrival and you never see it.' },
      { from: 'Your own recurring reminder', subj: 'Send the monthly activity report',
        prev: 'Due Friday. Nobody has replied to, referenced, or asked about it in three years.',
        answer: 'retire', why: 'Three years without a reply is the audit\'s signature find. With your manager in the loop, skip one cycle and watch who notices.' },
      { from: 'A program lead', subj: 'My numbers for the monthly report',
        prev: 'Here are this month\'s figures, in a slightly different layout from last time.',
        answer: 'template', why: 'Inputs arriving in a new shape every month are Tell 2, the rebuild. A templated request form makes them arrive the same way, so the table stops being rebuilt by hand.' },
      { from: 'Your manager', subj: 'Quick word about a team member',
        prev: 'Can we find ten minutes? Something came up that I would rather talk through in person.',
        answer: 'keep', why: 'Judgment, a relationship, and private details about a person. No template, no rule, no AI summary: the traffic light is red, and this is what the recovered hours are for.' },
      { from: 'An automated system notice', subj: 'Backup completed',
        prev: 'Last night\'s scheduled backup finished with no errors.',
        answer: 'route', why: 'A machine telling you a machine worked. A rule sweeps it, and your weekly scan of the swept folder catches the rare miss.' },
      { from: 'A calendar reminder', subj: 'Weekly sync for the spring project',
        prev: 'Automatic reminder. The project wrapped up months ago, and nobody has attended since.',
        answer: 'retire', why: 'A standing obligation with no audience left. Cancel the series with your manager aware; restart stays one email away.' },
      { from: 'A long thread you are copied on', subj: 'Re: Re: Re: Spring event logistics',
        prev: 'Fourteen replies so far, and nobody has asked you anything.',
        answer: 'route', why: 'Copied, never asked. A rule files the threads you are only copied on, and AI can summarize the one you want to skim.' }
    ];
    var itList = $('#itList'), itCheck = $('#itCheck'), itStatus = $('#itStatus'), itOut = $('#itOut');
    var itPicks = [], itLocked = false;
    function itLabel(key) {
      for (var i = 0; i < IT_PILES.length; i++) { if (IT_PILES[i].key === key) return IT_PILES[i].label; }
      return '';
    }
    function itCount() { return itPicks.filter(function (p) { return p !== null; }).length; }
    function itStatusUpdate() {
      var n = itCount(), all = n === IT_ITEMS.length;
      itCheck.disabled = !all;
      itStatus.textContent = n + ' of ' + IT_ITEMS.length + ' sorted' + (all ? ', check it' : '');
    }
    function itRender() {
      itLocked = false;
      itPicks = IT_ITEMS.map(function () { return null; });
      itList.innerHTML = '';
      itOut.hidden = true;
      IT_ITEMS.forEach(function (item, i) {
        var card = document.createElement('div');
        card.className = 'triage__card';
        card.setAttribute('role', 'listitem');
        card.innerHTML = '<div class="triage__msg"><span class="triage__from">From: ' + item.from + '</span>' +
          '<b class="triage__subj">' + item.subj + '</b><p class="triage__prev">' + item.prev + '</p></div>' +
          '<div class="triage__piles" role="group" aria-label="Pile for: ' + item.subj + '"></div>' +
          '<p class="triage__note" hidden></p>';
        var piles = $('.triage__piles', card);
        IT_PILES.forEach(function (pile, pi) {
          var b = document.createElement('button');
          b.type = 'button'; b.className = 'opt';
          b.setAttribute('aria-pressed', 'false');
          b.setAttribute('data-pile', pile.key);
          b.innerHTML = '<span class="mark">' + String.fromCharCode(65 + pi) + '</span><span>' + pile.label + '</span>';
          b.addEventListener('click', function () {
            if (itLocked) return;
            itPicks[i] = pile.key;
            $$('.opt', piles).forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
            itStatusUpdate();
          });
          piles.appendChild(b);
        });
        itList.appendChild(card);
      });
      itStatusUpdate();
    }
    itCheck.addEventListener('click', function () {
      if (itLocked || itCount() < IT_ITEMS.length) return;
      itLocked = true;
      var score = 0, misses = [];
      $$('.triage__card', itList).forEach(function (card, i) {
        var item = IT_ITEMS[i], pick = itPicks[i], right = pick === item.answer, label = itLabel(item.answer);
        if (right) score++;
        $$('.opt', card).forEach(function (o) {
          o.setAttribute('disabled', 'true');
          var k = o.getAttribute('data-pile');
          if (k === item.answer) o.classList.add('correct');
          else if (k === pick) o.classList.add('wrong');
        });
        card.classList.add(right ? 'is-right' : 'is-wrong');
        var note = $('.triage__note', card);
        note.innerHTML = (right ? '✓ <b>' + label + '.</b> ' : '✗ <b>Really: ' + label + '.</b> ') + item.why;
        note.hidden = false;
        if (!right) misses.push('<div><b>' + item.subj + ':</b> ' + label + '. ' + item.why + '</div>');
      });
      var total = IT_ITEMS.length;
      var pct = Math.round((score / total) * 100);
      var tier = score === total ? 'strong' : score >= 6 ? 'mid' : 'weak';
      var head = tier === 'strong' ? 'Eight of eight. You can call the move on sight, which is the whole point of the first move.'
               : tier === 'mid' ? 'Nearly there. The misses below are the calls that cost you the most, because each one comes back next week.'
               : 'Worth a second pass. The moves are still blurring together; the note on each card says which tell you missed.';
      var close = tier === 'strong' ? 'Seven of these eight items arrive again next week wearing a fresh date. Each one now has a move waiting: a template, a rule, or a retirement. That is the repeat tax turning into time you get to keep.'
                : tier === 'mid' ? 'Every miss is a repeat you would keep paying for by hand: the echo answered again, the notice read again, the report nobody needs sent again. Sort it once, correctly, and the repeat tax stops charging you for it every week.'
                : 'The repeat tax lives in exactly these calls. Each item you sorted by hand today comes back next week, and the week after. Read the notes, then run it again; the sorting gets instant with practice, and instant is what makes it pay.';
      itOut.innerHTML = '<span class="tag">Inbox Triage · ' + score + ' of ' + total + '</span>' +
        '<div class="lab__meter"><span style="width:0"></span></div>' +
        '<p style="margin:0;color:#fff;font-weight:500">' + head + '</p>' +
        (misses.length ? '<div class="lab__coach">' + misses.join('') + '</div>' : '') +
        '<div class="sample">' + close + '</div>' +
        '<p class="why" style="margin-top:1rem"><b>Now the real thing:</b> open your own inbox and give the last eight messages the same four moves. Everything in your template pile belongs in the inventory above.</p>' +
        '<button class="btn btn--ghost" id="itRetry" type="button" style="margin-top:1rem">Run it again</button>';
      itOut.hidden = false;
      itCheck.disabled = true;
      itStatus.textContent = score + ' of ' + total + ' right';
      $('#itRetry').addEventListener('click', function () {
        itRender();
        itList.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'nearest' });
      });
      requestAnimationFrame(function () {
        var bar = $('.lab__meter span', itOut);
        if (bar) requestAnimationFrame(function () { bar.style.width = pct + '%'; });
      });
      itOut.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'nearest' });
    });
    itRender();
  }

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
    // Space activates a focused button, link, or summary; it only turns the page otherwise
    if (e.key === ' ' && ['BUTTON', 'A', 'SUMMARY'].indexOf(document.activeElement.tagName) > -1) return;
    // Space on a focused button activates the button (option picks, checks, retries), never the deck
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
