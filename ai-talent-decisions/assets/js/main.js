/* =====================================================================
   AI FOR TALENT DECISIONS, classroom deck
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

  /* Draft, call, or keep it out? (Section 01) */
  makeTrainer({
    root: '#taskSort', q: '#tsQ', options: '#tsOptions', feedback: '#tsFeedback',
    progress: '#tsProgress', next: '#tsNext', result: '#tsResult',
    progressWord: 'Task', goodColor: 'var(--vu-oak)',
    resultColor: 'var(--ink-soft, #555)', passAt: 4,
    passMsg: 'The line is installed: instruments drafted, verdicts human, identifying data out of unapproved tools.',
    failMsg: 'Close. The tells: rubrics, questions, and profiles are instruments, draft away. Hire, promote, rate: human calls. And resumes, reviews, or names in unapproved tools: never, whatever the task.',
    labels: ['AI drafts the instrument', 'A human makes the call', 'Keep it out of the tools'],
    items: [
      { q: 'Turning the job description into a bank of structured interview questions with anchored scoring guides.',
        answer: 0, why: 'The classic instrument draft, and the highest-value one: structured interviews with anchors are among the best-validated selection methods there are.' },
      { q: 'Deciding which of the two finalists gets the offer.',
        answer: 1, why: 'The verdict itself. Every instrument in this course exists to make this call better informed and more consistent; none of them get to make it.' },
      { q: 'Pasting the shortlist\'s resumes, names and all, into a public chatbot to compare them.',
        answer: 2, why: 'Identifying candidate data in an unapproved tool is red-light, full stop. And a chatbot comparison is a verdict in disguise, so this one fails on both sides of the line at once.' },
      { q: 'Drafting a succession profile for a key role: the capabilities, experiences, and readiness criteria it requires.',
        answer: 0, why: 'A profile describes the role, so it drafts safely from the JD and the role\'s real outcomes. The moment it starts naming or scoring candidates, it stops being an instrument.' },
      { q: 'Asking AI who on the team is promotion-ready, based on their performance reviews.',
        answer: 2, why: 'Reviews are red-light data, and "who is ready" is a verdict. Two line-crossings in one prompt; the drafting version of this is a readiness rubric, with no names in it.' }
    ]
  });

  /* Useful and safe? (Section 03) */
  makeTrainer({
    root: '#gapSort', q: '#gsQ', options: '#gsOptions', feedback: '#gsFeedback',
    progress: '#gsProgress', next: '#gsNext', result: '#gsResult',
    progressWord: 'Move', goodColor: 'var(--vu-oak)',
    resultColor: 'var(--ink-soft, #555)', passAt: 4,
    passMsg: 'You can run skills work on the right side of the line: de-identified maps, drafts verified by the people themselves, decisions human.',
    failMsg: 'Close. The tells: role-level and de-identified work is safe in approved tools. Names attached to scores need stripping first. And inference about a person, or auto-decisions, is never the move.',
    labels: ['Useful, and safe as described', 'Useful, after de-identifying', 'Not this way'],
    items: [
      { q: 'In an approved tool, draft a skill taxonomy for the team from its five job descriptions.',
        answer: 0, why: 'Role documents, approved lane, no people in the prompt. This is the cheap first step of every skills map.' },
      { q: 'Paste the team roster, names beside self-reported skill levels, into an approved tool to build the matrix.',
        answer: 1, why: 'Right map, wrong columns: swap names for roles before it goes in. The gap analysis works identically, and nobody\'s ratings ride along with their name.' },
      { q: 'Ask a public chatbot to infer one teammate\'s skills from their LinkedIn and internal documents.',
        answer: 2, why: 'Profiling an individual, in an unapproved tool, without their involvement. If you want to know someone\'s skills, the reliable instrument is asking them.' },
      { q: 'Compare the de-identified skills map against next year\'s goals and draft grow-borrow-hire moves for each gap.',
        answer: 0, why: 'This is the payoff move: aggregate map, strategic question, human-owned plan. AI drafts the gap list; the development conversations stay one to one.' },
      { q: 'Let AI auto-assign people to projects from inferred skill scores, no human review.',
        answer: 2, why: 'Inference treated as fact, plus a decision about people made by a system. Matching suggestions can be a draft; assignments are a call someone with a name makes.' }
    ]
  });

  /* ---------- INTERACTIVE: The Rubric Lab (Section 02) ---------- */
  var lab = $('#rubricLab');
  if (lab) {
    var SLOTS = [
      { key: 'The source', opts: [
        { t: 'Gut feel. You know talent when you see it.', pts: 1, coach: 'Everyone believes their gut, and the research on unstructured judgment is brutal: it\'s inconsistent, biased toward similarity, and impossible to defend when challenged. The gut gets a vote later; it doesn\'t get to write the rubric.' },
        { t: 'Copy a 9-box template from the internet as-is.', pts: 2, coach: 'A borrowed rubric fits the average organization, which is nobody. Templates make fine scaffolding; the criteria still have to come from your roles\' actual outcomes.' },
        { t: 'Start from the role\'s real outcomes and the JD; ask AI to propose criteria, then cut what you can\'t observe.', pts: 3, coach: 'Grounded in the actual work, drafted fast, filtered by observability. This is the instrument pattern working exactly as designed.' }]},
      { key: 'The criteria', opts: [
        { t: '"Culture fit" and "executive presence."', pts: 1, coach: 'The two most famous bias magnets in talent review: vague enough that similarity sneaks in dressed as a standard. If it can\'t be observed, it can\'t be a criterion.' },
        { t: '"Strong performer" and "high potential," left undefined.', pts: 2, coach: 'The classic 9-box failure: labels doing the work of definitions. Every rater fills the blank differently, and the loudest filler wins the meeting.' },
        { t: 'Observable behaviors with examples: "delivered the full project scope with minimal escalation; grew a peer\'s capability this year."', pts: 3, coach: 'Criteria a camera could check. Disagreements now happen about evidence, which is what a talent review is supposed to be.' }]},
      { key: 'The anchors', opts: [
        { t: 'Score 1 to 10 by feel.', pts: 1, coach: 'Ten unanchored points is false precision: a 7 means nothing except "I liked it more than a 6." Fewer levels with concrete anchors beat more levels with none, every time.' },
        { t: 'Three levels, one adjective each: developing, solid, exceptional.', pts: 2, coach: 'The shape is right and the anchors are still adjectives. "Exceptional" needs an example attached, or every rater\'s exceptional is different.' },
        { t: 'Each level anchored with a concrete example a stranger could recognize; AI drafts the anchors, you verify them against real work.', pts: 3, coach: 'Anchors sharp enough to hand to a new rater. AI drafted them in minutes; your verification against real work is what made them true.' }]},
      { key: 'The scoring', opts: [
        { t: 'AI reads the performance reviews and fills in the 9-box.', pts: 1, coach: 'Reviews are red-light data, and the placement is a verdict about a person. This single choice converts your careful instrument into an unaccountable decision-maker.' },
        { t: 'You fill the grid alone in one sitting.', pts: 2, coach: 'At least a human made the calls, but one rater\'s solo pass keeps every one of that rater\'s blind spots. The rubric deserves more than one set of eyes.' },
        { t: 'Each rater scores independently against the anchors; differences get discussed, not averaged away; the grid lives in approved systems.', pts: 3, coach: 'Independent scoring surfaces real disagreement, and the discussion of differences is where calibration actually happens. The grid stays in governed systems because it\'s about people.' }]}
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
          statusEl.textContent = ready ? 'Ready, run the review' :
            'Choose ' + picks.filter(function (p) { return p === null; }).length + ' more step(s)';
          outEl.hidden = true;
        });
        d.appendChild(b);
      });
      slotsEl.appendChild(d);
    });
    var REACTIONS = {
      strong: 'The talent review runs differently: placements come with evidence, two raters catch a star the old process kept missing, and when someone asks "why that box," the answer is anchors and examples instead of seniority and silence. The grid is finally a development tool, and HR can stand behind every cell of it.',
      mid: 'The review is better than last year, and the soft spots show: the undefined labels turn two placements into debates about adjectives, and the solo scoring means one person\'s blind spots are now official. The instrument is half built; the calibration meeting pays for the missing half.',
      weak: 'The review looks rigorous and isn\'t. Vague criteria let the usual patterns through, the grid can\'t explain a single placement under challenge, and if AI touched the scoring, you now own a decision nobody can account for. This is how talent processes end up in front of HR, or worse.'
    };
    runBtn.addEventListener('click', function () {
      var score = picks.reduce(function (t, p, i) { return t + SLOTS[i].opts[p].pts; }, 0); // 4..12
      var pct = Math.round((score / 12) * 100);
      var tier = score >= 11 ? 'strong' : score >= 8 ? 'mid' : 'weak';
      var head = tier === 'strong' ? 'An instrument worth trusting. Grounded criteria, real anchors, human scoring.'
               : tier === 'mid' ? 'Half an instrument. The structure is there; the definitions and the scoring discipline are where it leaks.'
               : 'A verdict machine wearing a rubric\'s clothes. Vague criteria plus delegated scoring is the exact failure this course exists to prevent.';
      var coach = picks.map(function (p, i) { return '<div><b>' + SLOTS[i].key + ':</b> ' + SLOTS[i].opts[p].coach + '</div>'; }).join('');
      outEl.innerHTML = '<span class="tag">The talent review · ' + score + ' / 12</span>' +
        '<div class="lab__meter"><span style="width:0"></span></div>' +
        '<p style="margin:0;color:#fff;font-weight:500">' + head + '</p>' +
        '<div class="sample">' + REACTIONS[tier] + '</div>' +
        '<div class="lab__coach">' + coach + '</div>' +
        (tier !== 'strong' ? '<p class="why" style="margin-top:1rem"><b>Try again:</b> strengthen your weakest step and rerun the review. Watch what becomes defensible.</p>'
                           : '<p class="why" style="margin-top:1rem"><b>Now the real thing:</b> the anchor-writing drill in Go deeper builds the muscle on a criterion you actually use.</p>');
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

  /* ---------- INTERACTIVE: Talent Toolkit Card capstone ---------- */
  var planEl = $('#ttPlan');
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
      interview: { name: 'The interview kit', move: 'JD into an approved tool: five competencies, two behavioral questions each, three-level anchored scoring. Then the human passes: cut the unobservable, verify the anchors, flag the bias magnets, and take it to HR if it touches candidates.' },
      ninebox: { name: 'The 9-box rubric', move: 'Criteria from the roles\' real outcomes, observable behaviors only, anchors a stranger could apply, and independent scoring with discussed differences. AI drafts and stress-tests; it never touches a placement.' },
      skillsmap: { name: 'The skills map', move: 'Taxonomy from the team\'s JDs, self-ratings from the people (they\'re the source of truth), the de-identified map against next year\'s goals, and grow-borrow-hire moves per gap.' },
      succession: { name: 'The succession profile', move: 'The capabilities, experiences, and readiness criteria one key role requires, drafted from the JD and real outcomes. Profile only; names, scoring, and the succession call stay entirely human.' }
    };
    var NOT = {
      rank: 'Letting AI score, rank, or shortlist people. Counter-move: instruments only; the moment a draft starts ordering humans, it has become a verdict and it stops.',
      paste: 'Putting resumes, reviews, or names into unapproved tools. Counter-move: red-light data stays in governed systems; de-identify before anything else touches a tool, and loop in HR for anything candidate-facing.',
      vague: 'Keeping criteria I can\'t observe. Counter-move: every criterion gets the camera test and every level gets an anchor; "culture fit" and "polish" get rewritten or cut.'
    };
    var WHEN = { tomorrow: 'tomorrow', threedays: 'within the next 3 days', week: 'within 7 days' };
    buildBtn.addEventListener('click', function () {
      if (!planReady()) return;
      var who = whoIn.value.trim();
      var p = PRACTICE[pick.practice];
      var rows = '' +
        '<div class="row"><b>The talent work</b><span>' + who.replace(/</g, '&lt;') + '</span></div>' +
        '<div class="row"><b>The first instrument</b><span>' + p.name + '. ' + p.move + '</span></div>' +
        '<div class="row"><b>What I will NOT do</b><span>' + NOT[pick.not] + '</span></div>' +
        '<div class="row"><b>The build session</b><span>45 minutes, ' + WHEN[pick.when] + ', in an approved tool, with the human passes done before anyone else sees it.</span></div>' +
        '<div class="row"><b>The standard</b><span>The instrument is ready when a stranger could score with it, and every criterion survives the camera test.</span></div>' +
        '<div class="row"><b>The evidence</b><span>After the next talent decision: could you answer "why?" with anchors and examples? That answer is the measure.</span></div>';
      outEl2.innerHTML = '<span class="tag">My talent toolkit card</span>' +
        '<div class="plan__out-grid">' + rows + '</div>' +
        '<div class="lab__runrow" style="margin-top:1.25rem">' +
        '<button class="btn" id="planCopy">Copy my card</button>' +
        '<span class="quiz__progress" id="planCopied" style="color:rgba(255,255,255,.6)">Put the build session on the calendar now</span></div>';
      outEl2.hidden = false;
      $('#planCopy').addEventListener('click', function () {
        var text = 'MY TALENT TOOLKIT CARD (AI for Talent Decisions, Vanderbilt)\n' +
          'The talent work: ' + who + '\n' +
          'First instrument: ' + p.name + '. ' + p.move + '\n' +
          'I will NOT: ' + NOT[pick.not] + '\n' +
          'Build session: 45 minutes, ' + WHEN[pick.when] + ', approved tools only.\n' +
          'Standard: a stranger could score with it; every criterion passes the camera test.\n' +
          'Evidence: after the next decision, can I answer "why?" with anchors and examples?';
        (navigator.clipboard ? navigator.clipboard.writeText(text) : Promise.reject()).then(function () {
          $('#planCopied').textContent = 'Copied. Paste it somewhere you\'ll see before the build.';
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
      { q: 'The line this course draws: AI drafts instruments, and…',
        opts: ['Verifies its own drafts', 'Every verdict about a person stays human', 'Makes small decisions to save time', 'Ranks candidates when the pool is large'],
        correct: 1, why: 'Hire, promote, rate, succeed: human calls, every time. Instruments make those calls consistent; they never make them.' },
      { q: 'Resumes, performance reviews, and anything with a name are…',
        opts: ['Fine in any tool if you delete the chat', 'Yellow-light data', 'Red-light data: never in unapproved tools', 'Public information'],
        correct: 2, why: 'Identifying information about people is red. Talent work happens in governed, approved systems, with HR in the loop for anything candidate-facing.' },
      { q: 'What turns a 9-box from politics into an instrument?',
        opts: ['A more senior facilitator', 'Observable criteria, concrete anchors, and independent scoring', 'Letting AI fill it consistently', 'More boxes'],
        correct: 1, why: 'Anchored, observable, independently scored. AI helps draft and stress-test all of that; the placements stay human.' },
      { q: 'Skills inference from documents is…',
        opts: ['A draft the person verifies; they\'re the source of truth on their own skills', 'Reliable enough to auto-assign projects', 'A fair basis for promotion decisions', 'Only wrong if the model is old'],
        correct: 0, why: 'Inference guesses; people know. The map gets their corrections, and decisions built on unverified inference are verdicts on hearsay.' }
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
      var msg = pct >= 75 ? 'The line is loaded. The instrument you named is where it becomes real.' :
                pct >= 50 ? 'Solid. Revisit the section you missed before the build session.' :
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
