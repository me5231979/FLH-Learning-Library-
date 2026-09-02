/* =====================================================================
   NUMBERS, FASTER (data and analysis with AI), classroom deck
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
    passMsg: 'You called the research. The pattern across the numbers: the payoff on data work is large, it compounds with frequent use, and almost nobody is collecting it yet.',
    failMsg: 'Most rooms miss at least one, and the miss is the point: the payoff on data work is bigger than people assume, and the number of colleagues already collecting it is smaller. You are earlier than you think.',
    labels: [],
    items: [
      { q: 'Gallup asked employees who use AI on data and analysis work whether it clearly improves their productivity. How many say yes?',
        opts: ['About a quarter', 'About half', 'About three quarters'],
        answer: 2, why: 'About three quarters. Data and analysis work is one of the clearest payoff stories in Gallup\'s workplace AI research: when people put AI on their numbers, most of them feel the difference immediately.' },
      { q: 'Who reports the bigger payoff from AI on data work: people who use it occasionally, or people who use it often?',
        opts: ['Occasional users; the novelty does the work', 'About the same either way', 'Frequent users, by a wide margin'],
        answer: 2, why: 'Frequent users, and the gap between them and the dabblers is one of the widest Gallup measures. The payoff compounds with practice, which is why this session teaches a loop you run weekly rather than a trick you try once.' },
      { q: 'Where does data and analysis work rank among AI use cases by the payoff employees report?',
        opts: ['Near the bottom', 'Middle of the pack', 'Near the very top'],
        answer: 2, why: 'Near the top. Consolidating, analyzing, and summarizing information beats most of the flashier use cases people expect to win. The unglamorous spreadsheet is where the hours are.' },
      { q: 'And how is most everyday spreadsheet and report work still being done?',
        opts: ['Mostly with AI already', 'Roughly half and half', 'Mostly by hand'],
        answer: 2, why: 'Mostly by hand. Regular AI use is still the exception in most roles, so the highest-payoff use case is also one of the least used. That gap is your opening.' }
    ]
  });

  /* Green, yellow, or red (Section 02) */
  makeTrainer({
    root: '#lightSort', q: '#lsQ', options: '#lsOptions', feedback: '#lsFeedback',
    progress: '#lsProgress', next: '#lsNext', result: '#lsResult',
    progressWord: 'Dataset', goodColor: 'var(--vu-gold-flat)',
    resultColor: 'rgba(255,255,255,.85)', passAt: 4,
    passMsg: 'Your light works on files, not just questions. Keep the reflex: read the columns, call the color, and only then think about uploading.',
    failMsg: 'Close. The tells: public and about no one is green; internal with no individuals is yellow, approved VU tools only; anything that identifies a person, including one name in a comment field, is red. Never.',
    labels: ['Green', 'Yellow', 'Red'],
    items: [
      { q: 'Published IPEDS enrollment statistics, downloaded from the federal website.',
        answer: 0, why: 'Green. Published, public, and about institutions rather than identifiable people. Any tool may see it.' },
      { q: 'Your department\'s internal budget-by-unit spreadsheet: dollar amounts and unit names, no people anywhere in it.',
        answer: 1, why: 'Yellow. Internal work data with no individuals in it belongs in approved VU tools only: ChatGPT EDU, Amplify, Copilot. Nowhere else.' },
      { q: 'A staff salary sheet, one row per person, names attached.',
        answer: 2, why: 'Red. Salary tied to a name is private information about people, and the light says never. No deadline and no technique in this course changes that answer.' },
      { q: 'Student survey comments about parking. Two of the comments mention classmates by name.',
        answer: 2, why: 'Red, even though it is "just text." A name in a free-text field makes the whole file people data. Strip or redact those comments in a copy first; the de-identified copy can then ride the yellow lane.' },
      { q: 'Monthly help-desk ticket counts by category, exported with names and IDs already stripped.',
        answer: 1, why: 'Yellow. De-identified internal data is exactly what the yellow lane is for: approved VU tools only, and the analysis can begin.' }
    ]
  });

  /* Catch the error (Section 04) */
  makeTrainer({
    root: '#errSpot', q: '#esQ', options: '#esOptions', feedback: '#esFeedback',
    progress: '#esProgress', next: '#esNext', result: '#esResult',
    progressWord: 'Output', goodColor: 'var(--vu-oak)',
    resultColor: 'var(--ink-soft, #555)', passAt: 4,
    passMsg: 'You caught what the checks are built to catch: broken totals, impossible rates, and claims past the edge of the data. Bring that eye to your own month-end.',
    failMsg: 'Close. The three checks map to the three failures: the recompute catches broken math, the totals-and-counts check catches dropped or padded data, and the row trace catches inventions. Run all three and nothing here gets past you.',
    labels: ['Let it into the report', 'Stop it: the math breaks', 'Stop it: it is not in the data'],
    items: [
      { q: 'The AI reports "Total tickets this year: 4,210." The twelve monthly counts in the same reply add up to 3,884.',
        answer: 1, why: 'The parts disagree with the whole, and the whole is the number your director would have quoted. One recompute caught it in under a minute; that is the ritual paying rent.' },
      { q: 'The summary names "Facilities upkeep" as the top request category. Your sheet\'s category column holds Password, Hardware, Access, and Software. Nothing else.',
        answer: 2, why: 'A category the file never contained is a hallucination wearing a label. The row trace kills it instantly: ask which rows produced it and watch the claim dissolve.' },
      { q: '"Requests peaked in September at 61, roughly double the monthly average of 32." You recompute: September is 61, and the mean of the twelve months is 32.4.',
        answer: 0, why: 'It checks out, so it travels. Notice what earned the trust: your recompute, never the confidence of the sentence.' },
      { q: '"Same-day resolution improved to 108 percent of requests."',
        answer: 1, why: 'You cannot resolve more requests than arrived. Impossible percentages are the easiest catch in the game, and they still make it into real documents every week.' },
      { q: '"December was the quietest month for requests." Your export runs January through November; December has not happened yet.',
        answer: 2, why: 'A month the file does not contain is a claim about nothing: the model padded the story past the data\'s edge. The row-count check catches this whole family of errors.' }
    ]
  });

  /* Judge the finding (Section 06) */
  makeTrainer({
    root: '#findJudge', q: '#fjQ', options: '#fjOptions', feedback: '#fjFeedback',
    progress: '#fjProgress', next: '#fjNext', result: '#fjResult',
    progressWord: 'Narration', goodColor: 'var(--vu-oak)',
    resultColor: 'var(--ink-soft, #555)', passAt: 4,
    passMsg: 'Your ear is calibrated: one number with a so-what, no fog, and nothing claimed past the rows. Now write yours in the drill below.',
    failMsg: 'Close. The tells: a plain finding carries one number and a reason to care; fog carries jargon or every number at once; and anything that assigns blame or motive has gone past what the data shows.',
    labels: ['Plain and actionable', 'Fog: jargon or number soup', 'Past what the data shows'],
    items: [
      { q: '"Help-desk tickets rose 18 percent this quarter, almost entirely password resets after the login change. A self-service reset link would remove most of the surge."',
        answer: 0, why: 'Two sentences: the change with its number, then the so-what. A director can act on this without ever opening the spreadsheet.' },
      { q: '"Utilization of the ticketing modality trended upward across the temporal window, reflecting multifactorial demand-side dynamics."',
        answer: 1, why: 'Nobody can repeat this in a hallway, which means it cannot travel. Jargon reads as smart to the writer and as fog to every reader.' },
      { q: '"Tickets were 214 in July, 232 in August, 267 in September, 201 in October, 244 in November, and 229 in December."',
        answer: 1, why: 'Every number, no finding. Number soup hands the analysis back to the reader, which is the work they were hoping you had done.' },
      { q: '"Enrollment dipped 4 percent this term, which proves the new marketing campaign is failing and the budget should move."',
        answer: 2, why: 'The dip is data; "proves the campaign is failing" is a story the data has not told. The moment a finding assigns blame, it has left the spreadsheet and started spending your credibility.' },
      { q: '"Overtime spend finished 12 percent under budget, with two of the five clinics driving all of the savings. Worth asking those two what changed."',
        answer: 0, why: 'A number, the shape behind it, and a next step that stays inside what the data shows. This is the two-sentence finding doing its job.' }
    ]
  });

  /* ---------- INTERACTIVE: private Data Loop starter (Section 03) ---------- */
  var dlm = $('#dlMap');
  if (dlm) {
    var dData = $('#dlData'), dGrind = $('#dlGrind'), dWish = $('#dlWish'),
        dBtn = $('#dlBuild'), dStatus = $('#dlStatus'), dOut = $('#dlOut');
    var dlReady = function () {
      var ok = dData.value.trim().length >= 5 && dGrind.value.trim().length >= 5 && dWish.value.trim().length >= 5;
      dBtn.disabled = !ok;
      dStatus.textContent = ok ? 'Ready, build it' : 'Fill in all three';
      return ok;
    };
    [dData, dGrind, dWish].forEach(function (el) { el.addEventListener('input', dlReady); });
    dBtn.addEventListener('click', function () {
      if (!dlReady()) return;
      var esc = function (t) { return t.replace(/</g, '&lt;'); };
      dOut.innerHTML = '<span class="tag">My Data Loop starter · private</span>' +
        '<div class="plan__out-grid">' +
        '<div class="row"><b>The dataset</b><span>' + esc(dData.value.trim()) + '. First call the light on it: if people are in the rows, de-identify a copy before anything else.</span></div>' +
        '<div class="row"><b>The describe line</b><span>Your first message starts with the column story: what this sheet holds, the period it covers, where it comes from, and its quirks. The AI can only be as right as that paragraph.</span></div>' +
        '<div class="row"><b>The first ask</b><span>' + esc(dGrind.value.trim()) + '. That grind question is rung one; ask it alone, and check the answer before climbing.</span></div>' +
        '<div class="row"><b>The wish rung</b><span>' + esc(dWish.value.trim()) + '. This is why the loop pays: the question you never had time for is usually one rung past the grind.</span></div>' +
        '<div class="row"><b>The move</b><span>Hold onto this starter. Section 04 gives you the check ritual, the lab runs all four steps on a practice sheet, and the capstone puts a date on your first real run.</span></div>' +
        '</div>';
      dOut.hidden = false;
      dOut.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'nearest' });
    });
  }

  /* ---------- INTERACTIVE: The Analysis Lab (Section 05) ---------- */
  var lab = $('#analysisLab');
  if (lab) {
    var SLOTS = [
      { key: 'Prepare the file (the light)', opts: [
        { t: 'Upload the sheet as-is, names and IDs included; the deadline is Friday and it is just enrollment data.', pts: 1, coach: 'Names and IDs on enrollment records make this a red file: private information about people. The deadline changes nothing; the light outranks the loop, and this upload is the one mistake in the month that cannot be revised.' },
        { t: 'Skip the file entirely; retype a few totals into the chat and work from those.', pts: 2, coach: 'Safe, and most of the value stayed on the table: the AI cannot find patterns in rows it never saw. De-identification exists exactly so you can hand over the shape of the data without the people in it.' },
        { t: 'Copy the sheet, delete the name and ID columns, and upload the clean copy to an approved VU tool.', pts: 3, coach: 'The five-minute ritual: copy, strip, scan the free text, upload to ChatGPT EDU or a sibling. Red turned yellow, and the whole toolkit is now yours to use.' }]},
      { key: 'Ask (the ladder)', opts: [
        { t: 'Paste it in with "analyze this data and tell me everything interesting."', pts: 1, coach: 'Told nothing about the columns, the AI guesses, and dump-everything prompts return a wall of plausible mush with no single claim you can check. Speed without a checkable answer is noise, faster.' },
        { t: 'One long prompt asking for the summary, all trends, all outliers, and recommendations at once.', pts: 2, coach: 'Better than "everything interesting," and still a wall: ten claims arrive together and none is easy to verify alone. The ladder exists so each answer gets checked before the next question builds on it.' },
        { t: 'Describe the columns, period, and source first, then climb: summarize, compare to last term, find the outlier month.', pts: 3, coach: 'The Data Loop\'s first half, verbatim. Each rung returns one checkable answer, and the describe paragraph means the AI analyzed your actual sheet instead of its guess about it.' }]},
      { key: 'Check (the ritual)', opts: [
        { t: 'Believe it; the tables are beautifully formatted and the numbers sound right.', pts: 1, coach: 'Formatting is the one thing AI always gets right, which is exactly why it cannot be the test. "Sounds right" is how a hallucinated total gets four weeks of momentum.' },
        { t: 'Redo the entire analysis by hand, to be certain.', pts: 2, coach: 'Certain, and self-defeating: a check that costs what the work did means the AI bought you nothing. Verification has a budget; the targeted ritual spends minutes where the full redo spends the afternoon.' },
        { t: 'Recompute the one number leadership will quote, check the row count against the file, and trace the surprise to its rows.', pts: 3, coach: 'The ritual, exactly: one recompute, one totals-and-counts check, one row trace. Minutes of checking, and every number that travels now has a source behind it.' }]},
      { key: 'Tell (the finding)', opts: [
        { t: 'Paste the AI\'s full reply into the report; it wrote more than you ever would have.', pts: 1, coach: 'Nobody upstairs reads a wall of generated text, and any uncaught error inside it becomes your error the moment you hit send. Volume is not a finding.' },
        { t: 'Trim the reply to its three best paragraphs and forward those.', pts: 2, coach: 'Shorter, still secondhand: the reader gets prose about numbers instead of a finding they can act on, and the recommendation buried in it is the AI\'s, wearing your signature.' },
        { t: 'Write the two-sentence finding yourself, attach the one chart from your brief, and add your own recommendation.', pts: 3, coach: 'The change with its number, why it matters, one chart with a takeaway line, and a recommendation that is actually yours. This is the version leadership reads and remembers.' }]}
    ];
    var picks = [null, null, null, null];
    var slotsEl = $('#labSlots'), runBtn = $('#labRun'), statusEl = $('#labStatus'), outEl = $('#labOutcome');
    // Branching: slots open one at a time, and every slot after the first carries a
    // situation set by the learner's first move, so that move stays in the room.
    var BRANCH = { 1: ["The upload finishes. The full sheet sits in the chat window, names and IDs included. The tool is one your unit never approved. The clock says Wednesday. You have not told the AI anything about the columns yet. The prompt box is empty and waiting for your first question.", "You have retyped six totals into the chat, one per line. No file went anywhere, and no columns exist for the AI to read. The deadline has not moved. Whatever you ask next, the tool can only work from those six numbers. Choose how you ask.", "The clean copy is uploaded: twelve months, program names, monthly counts, no people in it. It took five minutes. The tool is an approved one, and the whole sheet is now in front of it. Friday is still Friday. Time to decide how you ask for the analysis."], 2: ["The reply arrives, and it looks good: tidy tables, a headline number, a surprise dip in March. Somewhere in that same chat history sit the student names and IDs you uploaded. That part cannot be undone. The numbers can still be checked. Decide how much checking you do.", "The reply comes back thin. Six totals gave the AI six totals, so it summarized them and guessed at the rest. There is a headline number and a trend it says it sees. Nothing in the reply touched your actual rows. Decide what checking looks like now.", "The answers come back one rung at a time. A summary, then a comparison to last term, then one outlier month. Each one is short and points at something you can find in the file. Leadership will quote the headline number by Friday. Decide how you check it before it travels."], 3: ["The report is nearly ready and the checks are done, whatever they were. One thing has not changed. A file of student names and IDs still sits in an unapproved tool's history. Someone will ask about it. What reaches leadership by Friday is the last thing in your control.", "It is Thursday. The analysis was safe, and it was shallow. The AI never saw the rows, so the pattern took longer to find by hand. You have a finding now, most of it yours. Leadership expects the story tomorrow. Decide what you send.", "It is Thursday afternoon and the work is done early. A safe file, a ladder of short answers, a checked headline number. The loop bought you the afternoon. Leadership will get the story a day ahead. What they read, and remember, depends on how you tell it."] };
    var CARRY = ["The file went up with names and IDs, so the privacy conversation outlasts everything else this month, and it cannot be rerun.", "You kept the people out of the tool, and you kept most of the data out too; the AI worked from six numbers.", "The clean copy in an approved tool turned red to yellow, and every later step had the whole sheet to work with."];
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
          statusEl.textContent = ready ? 'Ready, run the month' :
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
      strong: 'Week four: the month-end that used to eat an afternoon now takes forty minutes, and leadership actually read it: two sentences, one chart, a recommendation with your name on it. When someone challenged the headline number in the meeting, you said "I recomputed it against the export," and the conversation moved on. The loop is quietly becoming how your unit does numbers.',
      mid: 'Week four: faster, technically. But one figure nobody recomputed turned out to be wrong, the correction email went to the same list as the report, and now someone upstairs quietly re-checks everything you send. The hours the AI saved are being spent buying back trust in your numbers.',
      weak: 'Week four: the report shipped fast and fell apart faster. A number that matched nothing in the file reached leadership, the walk-back took a week, and "let\'s just go back to doing it by hand" is now the official position. The tool took the blame for the missing checks.'
    };
    runBtn.addEventListener('click', function () {
      var score = picks.reduce(function (t, p, i) { return t + SLOTS[i].opts[p].pts; }, 0); // 4..12
      var pct = Math.round((score / 12) * 100);
      var tier = score >= 11 ? 'strong' : score >= 8 ? 'mid' : 'weak';
      var head = tier === 'strong' ? 'A real Data Loop run. Safe file in, ladder up, checks with teeth, and a telling a busy reader can act on.'
               : tier === 'mid' ? 'Half a loop. The speed arrived; some of the checking stayed home, and week four is where that bill comes due.'
               : 'A fast route to a wrong number. Speed with no describe, no checks, and no telling is how AI failures reach leadership.';
      var ferpa = picks[0] === 0 ? '<div class="sample" style="border-color:rgba(179,64,46,.6)">And the heavier outcome, whatever else went right: the file with student names and IDs is now sitting in an unapproved tool\'s history. The conversation with the privacy office runs longer than every hour this report ever cost, and it is the one part of the month you cannot rerun.</div>' : '';
      var coach = picks.map(function (p, i) { return '<div><b>' + SLOTS[i].key + ':</b> ' + SLOTS[i].opts[p].coach + '</div>'; }).join('');
      outEl.innerHTML = '<span class="tag">Four weeks in · ' + score + ' / 12</span>' +
        '<div class="lab__meter"><span style="width:0"></span></div>' +
        '<p style="margin:0;color:#fff;font-weight:500">' + head + '</p>' +
        '<div class="sample">' + REACTIONS[tier] + '</div>' + ferpa +
        (CARRY[picks[0]] ? '<p class="lab__carry"><b>What your first move set in motion:</b> ' + CARRY[picks[0]] + '</p>' : '') +
        '<div class="lab__coach">' + coach + '</div>' +
        (tier !== 'strong' ? '<p class="why" style="margin-top:1rem"><b>Try again:</b> strengthen your weakest step and rerun the month. Watch week four change.</p>'
                           : '<p class="why" style="margin-top:1rem"><b>Now the real thing:</b> the pair drill in Go deeper walks YOUR dataset through these same four steps.</p>');
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

  /* ---------- INTERACTIVE: Data Loop Card capstone ---------- */
  var planEl = $('#dlPlan');
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
      describe: { name: 'Describe it and get the summary', move: 'Open with the column story: what each column holds, the period, the source, the quirks. Then the first rung: what does a typical month look like? Recompute one number before you believe the reply.' },
      compare: { name: 'Build one comparison', move: 'Describe the sheet, then ask for this period against last in a table you can scan. Recompute one cell of the comparison by hand before it goes anywhere.' },
      chart: { name: 'Chart one trend, with a chart brief', move: 'Hand the AI the comparison, the audience, and the takeaway line you want printed under the chart. Verify the two numbers the chart hangs on before anyone sees it.' },
      deid: { name: 'De-identify it first', move: 'It is people data, so the loop waits: copy the file, delete the name and ID columns, read the free-text fields, and aggregate to counts where counts will do. Then the yellow lane opens: approved VU tools only.' }
    };
    var NOT = {
      paste: 'Pasting people data into unapproved tools. Counter-move: call the light before every upload, and when a file is red, de-identify a copy or keep it out entirely. The light outranks the deadline.',
      unchecked: 'Shipping an AI number without recomputing one by hand. Counter-move: before any figure enters a document, recompute the one that will be quoted and check the totals. Minutes now beats a retraction later.',
      recommend: 'Letting the AI write the recommendation. Counter-move: let it narrate the pattern, then write the "so we should" sentence yourself. Your name goes on the line that commits your unit.'
    };
    var WHEN = { tomorrow: 'tomorrow', threedays: 'within the next 3 days', week: 'within 7 days' };
    buildBtn.addEventListener('click', function () {
      if (!planReady()) return;
      var who = whoIn.value.trim();
      var p = PRACTICE[pick.practice];
      var rows = '' +
        '<div class="row"><b>The dataset</b><span>' + who.replace(/</g, '&lt;') + '</span></div>' +
        '<div class="row"><b>The first move</b><span>' + p.name + '. ' + p.move + '</span></div>' +
        '<div class="row"><b>What I will NOT do</b><span>' + NOT[pick.not] + '</span></div>' +
        '<div class="row"><b>The first run</b><span>The Data Loop on this dataset, ' + WHEN[pick.when] + ': twenty minutes, describe to tell, checks included.</span></div>' +
        '<div class="row"><b>The check ritual</b><span>Every run: recompute the number that will be quoted, check totals and row counts, and trace any surprise back to its rows before believing it.</span></div>' +
        '<div class="row"><b>The metric</b><span>Minutes from question to answer, this run against what the same answer used to cost by hand. Write both numbers down.</span></div>' +
        '<div class="row"><b>The evidence</b><span>After one week, one line: what did the loop find that the by-hand version would have missed, and what did the checks catch?</span></div>';
      outEl2.innerHTML = '<span class="tag">My Data Loop card</span>' +
        '<div class="plan__out-grid">' + rows + '</div>' +
        '<div class="lab__runrow" style="margin-top:1.25rem">' +
        '<button class="btn" id="planCopy">Copy my card</button>' +
        '<span class="quiz__progress" id="planCopied" style="color:rgba(255,255,255,.6)">Put the first run on the calendar now</span></div>';
      outEl2.hidden = false;
      $('#planCopy').addEventListener('click', function () {
        var text = 'MY DATA LOOP CARD (Numbers, Faster, Vanderbilt)\n' +
          'The dataset: ' + who + '\n' +
          'First move: ' + p.name + '. ' + p.move + '\n' +
          'I will NOT: ' + NOT[pick.not] + '\n' +
          'First run: ' + WHEN[pick.when] + ', twenty minutes, describe to tell.\n' +
          'Check ritual: recompute the quoted number, check totals and counts, trace surprises to rows.\n' +
          'Metric: minutes to answer, this run vs by hand.\n' +
          'Evidence: after one week, what the loop found and what the checks caught.';
        (navigator.clipboard ? navigator.clipboard.writeText(text) : Promise.reject()).then(function () {
          $('#planCopied').textContent = 'Copied. Paste it somewhere you\'ll see before the first run.';
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
      { q: 'In Gallup\'s workplace AI research, data and analysis work stands out because…',
        opts: ['It is the one use case AI cannot help with', 'It is high payoff and still mostly done by hand', 'Only trained analysts see any benefit from it', 'The gains go mostly to occasional users'],
        correct: 1, why: 'About three quarters of employees who use AI on data work report clear productivity gains, the gains concentrate in frequent users, and most staff still do this work manually. High payoff, low adoption: that is the opening.' },
      { q: 'A survey export includes a free-text comment column, and two comments mention students by name. Under the traffic light, the file is…',
        opts: ['Green, survey data is generic', 'Yellow, it is internal work', 'Red until those names are stripped from a copy', 'Whichever color the deadline requires'],
        correct: 2, why: 'One name in a comment field makes the whole file people data: red, never in unapproved tools. De-identify a copy and the yellow lane opens, approved VU tools only.' },
      { q: 'The Data Loop\'s first move, before any question, is…',
        opts: ['Paste the file and ask for everything interesting', 'Describe the data: columns, period, source, quirks', 'Ask for the chart first', 'Ask the AI to double-check itself'],
        correct: 1, why: 'Describe, then ask. The AI can only be as right as the column story you give it, and that thirty-second paragraph is the cheapest quality upgrade in the whole loop.' },
      { q: 'Before an AI-produced figure goes into a report, the check ritual asks for…',
        opts: ['Nothing, if the formatting looks professional', 'Redoing the full analysis by hand', 'One recompute, a totals-and-counts check, and a row trace on surprises', 'Asking the AI whether it is sure'],
        correct: 2, why: 'Three targeted moves, minutes each. A full redo means the AI bought you nothing, "looks professional" is how wrong numbers travel, and models cheerfully confirm their own inventions.' },
      { q: 'In the Analysis Lab, the month-end runs that fall apart by week four share one root cause:',
        opts: ['Using AI on the numbers at all', 'Asking the sheet too few questions', 'Missing design around the AI: red files, mush prompts, believed output', 'Making the final report too short'],
        correct: 2, why: 'The lab never punishes using AI; it punishes the missing steps around it. The strong run is the loop verbatim: safe file in, ladder up, ritual run, two sentences out.' },
      { q: 'When AI helps you tell the data story, the one piece that stays yours is…',
        opts: ['The recommendation your unit should act on', 'The chart draft', 'The summary of the quarter', 'The table formatting'],
        correct: 0, why: 'AI narrates patterns; it owns nothing. The "so we should" sentence carries your name, your context, and your accountability, which is why it is never delegated.' }
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
      var msg = pct >= 80 ? 'The loop is loaded. The dataset you named is where it becomes real.' :
                pct >= 50 ? 'Solid. Revisit the sections you missed before your first run.' :
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

  /* ---------- INTERACTIVE: Recompute drill (Section 04) ---------- */
  var rcRoot = $('#recompute');
  if (rcRoot) {
    // Rows come from assets/data/program-enrollment-sample.csv (fictional).
    var RC_ROUNDS = [
      { label: 'Round 1 of 2 · Data Skills Bootcamp',
        rule: 'The AI read eight rows of the practice sheet and wrote three sentences. Add the enrolled column yourself before you call the first one.',
        caption: 'Data Skills Bootcamp, eight monthly cohorts (practice sheet, fictional)',
        cols: ['Month', 'Enrolled', 'Waitlist', 'Completed'],
        rows: [['Aug 2025', 48, 3, 41], ['Sep 2025', 52, 5, 45], ['Oct 2025', 55, 4, 47], ['Nov 2025', 50, 2, 44],
               ['Jan 2026', 46, 0, 38], ['Feb 2026', 60, 74, 49], ['Mar 2026', 58, 6, 50], ['Apr 2026', 52, 2, 45]],
        sumCol: 1, sumName: 'Enrolled',
        claims: [
          { ai: 'Across the eight cohorts, 412 people enrolled in Data Skills Bootcamp.', ok: false, input: true, said: 412,
            right: 'The rows add to 421 and the AI said 412. Nine seats off, on the number your director would have quoted. Any arithmetic the model did itself gets redone.',
            wrong: 'The rows add to 421. The AI said 412, and it said it in the same calm tone it uses when it is right. Confidence is not a check. Any arithmetic the model did itself gets redone.' },
          { ai: 'The largest cohort was February 2026, with 60 enrolled.', ok: true,
            right: 'February is 60 and no other month reaches it. A claim that survives the rows is allowed to travel.',
            wrong: 'Scan the enrolled column: February is 60, and nothing else gets there. This one was right. The check exists to sort the numbers, not to reject all of them.' },
          { ai: 'Waitlist demand was steady at about 12 a month.', ok: false,
            right: 'The mean is right and the sentence is wrong. Seven months sit between 0 and 6, and February sits at 74. That is one cohort with a line out the door, and the average hid it.',
            wrong: 'The arithmetic holds: 96 waitlisted over eight months is 12 a month. Now read the rows. Seven of them sit between 0 and 6, and February is 74. An average is a claim about the middle, and these rows have no middle.' }
        ] },
      { label: 'Round 2 of 2 · Leadership Foundations',
        rule: 'Round two, and the rule this time is the one to keep: recompute before you repeat. Nothing the model added up goes into your memo until you have added it too.',
        caption: 'Leadership Foundations, eight monthly cohorts (practice sheet, fictional)',
        cols: ['Month', 'Enrolled', 'Completed', 'Cost center'],
        rows: [['Aug 2025', 22, 20, 'CC-4410'], ['Sep 2025', 30, 26, 'CC-4470'], ['Oct 2025', 31, 27, 'CC-4470'], ['Nov 2025', 28, 25, 'CC-4470'],
               ['Jan 2026', 18, 15, 'CC-4470'], ['Feb 2026', 36, 31, 'CC-4470'], ['Mar 2026', 34, 30, 'CC-4470'], ['Apr 2026', 29, 26, 'CC-4470']],
        sumCol: 1, sumName: 'Enrolled',
        claims: [
          { ai: 'Leadership Foundations enrolled 282 people across the eight cohorts.', ok: false, input: true, said: 282,
            right: 'The rows add to 228. The AI said 282: the same digits in a different order, which is exactly the kind of error that reads as right. You recomputed before you repeated.',
            wrong: 'The rows add to 228, not 282. Two digits swapped, and the sentence still sounded fine. Recompute before you repeat, every time.' },
          { ai: 'The program\'s cost center changed in September 2025, from CC-4410 to CC-4470.', ok: true,
            right: 'August reads CC-4410, and September onward reads CC-4470. The rows back the claim, so it can travel.',
            wrong: 'Read the cost center column: CC-4410 in August, CC-4470 from September on. The claim matches the rows. Letting a verified number through is part of the ritual too.' },
          { ai: 'Enrollment held steady at about 29 a month.', ok: false,
            right: 'The average is 28.5 and the rows run from 18 to 36. The range is the finding, and the average erased it.',
            wrong: 'The mean of 28.5 is real. So is the range: January at 18, February at 36, twice as many. "Held steady" averages away the one thing a reader would want to know.' }
        ] }
    ];
    var rcRound = 0, rcVerdicts = [], rcGraded = false;
    var rcLabel = $('#rcRound'), rcRule = $('#rcRule'), rcTable = $('#rcTable'), rcClaims = $('#rcClaims'),
        rcCheck = $('#rcCheck'), rcStatus = $('#rcStatus'), rcOut = $('#rcOut');
    function rcSum(R) { return R.rows.reduce(function (t, r) { return t + r[R.sumCol]; }, 0); }
    function rcReady() {
      var R = RC_ROUNDS[rcRound];
      var missing = R.claims.filter(function (c, i) { return !rcVerdicts[i]; }).length;
      var num = $('#rcNum');
      var needNum = num && num.value.trim() === '';
      var ok = missing === 0 && !needNum;
      rcCheck.disabled = !ok || rcGraded;
      if (rcGraded) return ok;
      rcStatus.textContent = ok ? 'Ready, check it' :
        missing > 0 ? 'Call ' + missing + ' more claim(s)' + (needNum ? ' and enter your total' : '') : 'Enter your total';
      return ok;
    }
    function rcRender() {
      var R = RC_ROUNDS[rcRound];
      rcVerdicts = R.claims.map(function () { return null; });
      rcGraded = false;
      rcOut.hidden = true; rcOut.innerHTML = '';
      rcLabel.textContent = R.label;
      rcRule.textContent = R.rule;
      var head = R.cols.map(function (c, i) {
        return '<th scope="col"' + (i > 0 && typeof R.rows[0][i] === 'number' ? ' class="num"' : '') + '>' + c + '</th>';
      }).join('');
      var body = R.rows.map(function (r) {
        return '<tr>' + r.map(function (v, i) {
          if (i === 0) return '<th scope="row">' + v + '</th>';
          return '<td' + (typeof v === 'number' ? ' class="num"' : '') + '>' + v + '</td>';
        }).join('') + '</tr>';
      }).join('');
      rcTable.innerHTML = '<div class="rctable-wrap"><table class="rctable"><caption>' + R.caption + '</caption>' +
        '<thead><tr>' + head + '</tr></thead><tbody>' + body + '</tbody></table></div>';
      rcClaims.innerHTML = '';
      R.claims.forEach(function (c, i) {
        var d = document.createElement('div');
        d.className = 'rcclaim';
        d.innerHTML = '<p class="rcclaim__ai"><span class="tag">AI says</span>' + c.ai + '</p>' +
          '<div class="rcclaim__btns" role="group" aria-label="Claim ' + (i + 1) + ' verdict">' +
          '<button type="button" class="opt" aria-pressed="false" data-v="match"><span class="mark" aria-hidden="true">✓</span><span>Matches the rows</span></button>' +
          '<button type="button" class="opt" aria-pressed="false" data-v="no"><span class="mark" aria-hidden="true">✗</span><span>Does not match</span></button></div>' +
          (c.input ? '<label class="rcclaim__label" for="rcNum">Add the ' + R.sumName.toLowerCase() + ' column yourself. Your total:</label>' +
            '<input type="number" id="rcNum" inputmode="numeric" min="0" step="1" autocomplete="off">' : '') +
          '<p class="rcclaim__verdict" aria-live="polite"></p>';
        $$('.opt', d).forEach(function (b) {
          b.addEventListener('click', function () {
            if (rcGraded) return;
            rcVerdicts[i] = b.getAttribute('data-v');
            $$('.opt', d).forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
            rcReady();
          });
        });
        var num = $('#rcNum', d);
        if (num) num.addEventListener('input', rcReady);
        rcClaims.appendChild(d);
      });
      rcReady();
    }
    rcCheck.addEventListener('click', function () {
      if (!rcReady()) return;
      var R = RC_ROUNDS[rcRound];
      var total = rcSum(R);
      var num = $('#rcNum');
      var typed = num ? parseInt(num.value, 10) : NaN;
      var typedOk = typed === total;
      var called = 0;
      var coach = '';
      $$('.rcclaim', rcClaims).forEach(function (d, i) {
        var c = R.claims[i];
        var want = c.ok ? 'match' : 'no';
        var right = rcVerdicts[i] === want;
        if (right) called++;
        d.classList.add(right ? 'is-right' : 'is-wrong');
        $$('.opt', d).forEach(function (b) {
          b.setAttribute('disabled', 'true');
          if (b.getAttribute('data-v') === want) b.classList.add('correct');
          else if (b.getAttribute('aria-pressed') === 'true') b.classList.add('wrong');
        });
        $('.rcclaim__verdict', d).textContent = right ? '✓ Called right' : '✗ Called wrong: the rows say "' + (c.ok ? 'matches' : 'does not match') + '"';
        coach += '<div><b>Claim ' + (i + 1) + ':</b> ' + (right ? c.right : c.wrong) + '</div>';
      });
      if (num) num.setAttribute('disabled', 'true');
      rcGraded = true;
      rcCheck.disabled = true;
      rcStatus.textContent = 'Checked';
      var wrongClaim = R.claims.filter(function (c) { return c.input; })[0];
      var working = R.sumName + ', row by row: ' + R.rows.map(function (r) { return r[R.sumCol]; }).join(' + ') +
        ' = <b>' + total + '</b>. The AI said ' + wrongClaim.said + '.';
      var recomp = isNaN(typed) ? 'You left the total blank. The adding is the drill.' :
        typedOk ? 'Your recompute: <b>' + typed + '</b>. Matches the rows.' :
        'Your recompute: <b>' + typed + '</b>. The rows add to ' + total + '; run the column once more, one row at a time.';
      var clean = called === R.claims.length && typedOk;
      var headline = clean ? 'Clean run. Every claim called, and the total recomputed by your own hand.' :
        called + ' of ' + R.claims.length + ' claims called right' + (typedOk ? ', and your recompute matches.' : ', and the recompute needs another pass.');
      var last = rcRound === RC_ROUNDS.length - 1;
      rcOut.innerHTML = '<span class="tag">' + R.label + ' · ' + called + ' / ' + R.claims.length + ' called' + (typedOk ? ' · recompute matches' : '') + '</span>' +
        '<p style="margin:.75rem 0 0;color:#fff;font-weight:500">' + headline + '</p>' +
        '<div class="recompute__work">' + working + '<br>' + recomp + '</div>' +
        '<div class="lab__coach">' + coach + '</div>' +
        (last ? '<p class="why" style="margin-top:1rem"><b>Now the real thing:</b> open the practice sheet or your own de-identified export, ask an approved tool for one total, and add the column yourself before that number goes anywhere.</p>'
              : '<p class="why" style="margin-top:1rem"><b>Round two</b> brings a different program and a different wrong figure. Keep the rule: recompute before you repeat.</p>') +
        '<div class="lab__runrow">' +
        (last ? '' : '<button type="button" class="btn" id="rcNext">Round two</button>') +
        '<button type="button" class="btn btn--ghost" id="rcRetry">Run it again</button></div>';
      rcOut.hidden = false;
      var nextB = $('#rcNext');
      if (nextB) nextB.addEventListener('click', function () {
        rcRound++; rcRender();
        rcLabel.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'nearest' });
      });
      $('#rcRetry').addEventListener('click', function () {
        rcRound = 0; rcRender();
        rcLabel.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'nearest' });
      });
      rcOut.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'nearest' });
    });
    rcRender();
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
