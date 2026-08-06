/* =====================================================================
   HIRING & TALENT DECISIONS WITH AI, classroom deck
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
    root: '#gnGame', q: '#gnQ', options: '#gnOptions', feedback: '#gnFeedback',
    progress: '#gnProgress', next: '#gnNext', result: '#gnResult',
    progressWord: 'Finding', goodColor: 'var(--vu-oak)',
    resultColor: 'var(--ink-soft, #555)', passAt: 3,
    passMsg: 'You called the landscape: the tools are already inside hiring, the failures are documented, and the regulators have arrived. That is exactly why the line in this course sits where it does.',
    failMsg: 'Most rooms miss a few, and the pattern IS the finding: AI reached hiring faster than the guardrails did, which makes managers who know the line the scarce resource.',
    labels: [],
    items: [
      { q: 'SHRM has surveyed AI in the workplace for years. Roughly what share of organizations report using AI for HR work, with recruiting the most common use?',
        opts: ['Around 1 in 20', 'Around 1 in 4', 'Around 3 in 4'],
        answer: 1, why: 'Around one in four in recent SHRM surveys, and climbing every year, with recruiting leading the way. The tools are already inside hiring; the open question is whether anyone has drawn the line.' },
      { q: 'In 2018, Amazon scrapped an experimental AI resume-screening tool. What had the model learned to do?',
        opts: ['Prefer longer resumes over shorter ones', 'Downgrade resumes that included the word "women\'s"', 'Recommend only internal candidates'],
        answer: 1, why: 'Trained on a decade of its own hiring history, it learned that history\'s bias and penalized resumes mentioning "women\'s," as in a women\'s chess club. One of the best-resourced engineering teams on earth could not audit the bias out, so they shut it down.' },
      { q: 'New York City now regulates automated employment decision tools. What does its law require before an employer can use one on candidates?',
        opts: ['Nothing yet; the law covers only video interviews', 'An independent bias audit, published, plus notice to candidates', 'A city license for the software vendor'],
        answer: 1, why: 'An independent bias audit and candidate notice. Regulators are moving exactly here: automated decisions about people carry legal weight, and more jurisdictions are following the same path.' },
      { q: 'The Stanford AI Index tracks AI rules across US agencies. Over the years it has counted them, the number of AI-related regulations has...',
        opts: ['Fallen as the early panic faded', 'Held roughly flat', 'Risen sharply, year over year'],
        answer: 2, why: 'Risen sharply, year over year. The Index\'s responsible AI chapter reads like a weather report for this exact storm: decisions about people are where the scrutiny lands first.' }
    ]
  });

  /* Over the line? (Section 02) */
  makeTrainer({
    root: '#olGame', q: '#olQ', options: '#olOptions', feedback: '#olFeedback',
    progress: '#olProgress', next: '#olNext', result: '#olResult',
    progressWord: 'Case', goodColor: 'var(--vu-gold-flat)',
    resultColor: 'rgba(255,255,255,.85)', passAt: 4,
    passMsg: 'The line is installed. Notice what survived your sorting: every use that builds the process, and none that touch a person.',
    failMsg: 'Close. The one-breath test: could a specific person be identified from what you are about to paste? If yes, red, always. Process artifacts with nobody in them are where AI belongs.',
    labels: ['Red: never', 'Yellow: approved VU tools only', 'Green: go'],
    items: [
      { q: 'A hiring platform add-on offers to score and rank your applicant pool overnight. You would only use it as a first pass.',
        answer: 0, why: 'A first pass IS the screen. Ranking people is an automated employment decision: unauditable, regulated, and never AI\'s call, in any tool, at any pile size.' },
      { q: 'Paste the three finalists\' resumes into a chatbot and ask it to compare their strengths.',
        answer: 0, why: 'Resumes are private information about people: red, and finalists most of all. The legitimate version of this need is the rubric you built before you met them; comparing against it is your job.' },
      { q: 'Your notes from this morning\'s interview are a mess. Ask AI to clean them up and pull out the highlights.',
        answer: 0, why: 'Interview notes about a named candidate are red, however messy. The green twin of this urge: have AI improve your note TEMPLATE before interview day, while nobody is in it.' },
      { q: 'Polish the offer letter template, no names or personal details anywhere in it, using ChatGPT EDU.',
        answer: 1, why: 'A nameless template is internal process work: yellow, and ChatGPT EDU is on the approved list. The moment a person\'s details enter the text, the color changes to red.' },
      { q: 'Ask AI to draft five behavioral interview questions for a financial analyst role, working from the public job posting.',
        answer: 2, why: 'A public posting and a generic role: green, go. This is the right side of the line earning its keep, and section 04 turns it into a full method.' }
    ]
  });

  /* Fix the posting (Section 03) */
  makeTrainer({
    root: '#fpGame', q: '#fpQ', options: '#fpOptions', feedback: '#fpFeedback',
    progress: '#fpProgress', next: '#fpNext', result: '#fpResult',
    progressWord: 'Line', goodColor: 'var(--vu-oak)',
    resultColor: 'var(--ink-soft, #555)', passAt: 4,
    passMsg: 'Your requirement audit is calibrated. Run it on your next real posting before it ships: AI drafts the rewrite, and you can now judge the draft.',
    failMsg: 'Close. The audit question for every line: does this describe the work, or the person we are picturing? Work survives the audit; pictures are where the pool quietly shrinks.',
    labels: ['Proxy requirement', 'Jargon wall', 'Degree inflation', 'Genuinely fine'],
    items: [
      { q: '"Bachelor\'s degree required," on a coordinator role where every listed duty is a learnable, demonstrable skill.',
        answer: 2, why: 'Degree inflation: the degree stands in for skills the posting never names. It screens out experienced people who took a different route, and the duties say the role never needed it.' },
      { q: '"Must be a digital native who lives and breathes social."',
        answer: 0, why: '"Digital native" is an age proxy wearing a hoodie. Name the actual skill, say two years running multi-channel campaigns, and the pool widens while the legal exposure disappears.' },
      { q: '"Seeking a self-starting rockstar to leverage synergies across our evolving stack."',
        answer: 1, why: 'A jargon wall: four buzzwords, zero information about the work. Strong candidates outside your bubble read a line like this and conclude the team cannot describe its own job.' },
      { q: '"Experience administering payroll for 100 or more employees, in Workday or a similar system."',
        answer: 3, why: 'Genuinely fine: a real task, a real scale, and "or a similar system" keeps the tool name from becoming its own filter. This is what a requirement looks like after the audit.' },
      { q: '"Native English speaker required."',
        answer: 0, why: 'A national-origin proxy, and legally hazardous. The real requirement is professional fluency, which people from anywhere can have. Post the need; drop the proxy.' }
    ]
  });

  /* Spot the bias door (Section 06) */
  makeTrainer({
    root: '#sbGame', q: '#sbQ', options: '#sbOptions', feedback: '#sbFeedback',
    progress: '#sbProgress', next: '#sbNext', result: '#sbResult',
    progressWord: 'Setup', goodColor: 'var(--vu-oak)',
    resultColor: 'var(--ink-soft, #555)', passAt: 4,
    passMsg: 'You can hear the doors opening now. The guardrails are yours to run: diverse review, same evidence, why before rank, and HR for anything automated.',
    failMsg: 'Close. The doors share one shape: an undefined standard that a gut feeling can quietly fill. Every guardrail works the same way, by forcing definition before judgment.',
    labels: [],
    items: [
      { q: 'You ask AI for leadership interview questions. Every question that comes back assumes leadership means taking charge and commanding the room.',
        opts: ['The draft inherited a stereotype; this role\'s leadership might look like quiet coordination', 'The questions are unusable because AI wrote them', 'Nothing to catch; taking charge is what leadership is'],
        answer: 0, why: 'AI drafts inherit the patterns of everything written before them, stereotypes included. The guardrail is diverse review: a colleague who leads differently will spot it in one read.' },
      { q: 'A rubric anchor reads: "5 = polished, confident, commands the room."',
        opts: ['It encodes one culture\'s communication style instead of the job\'s real demands', 'It is fine because it applies to every candidate equally', 'Anchors should never mention communication at all'],
        answer: 0, why: 'One yardstick for everyone is only fair if the yardstick measures the job. Unless commanding rooms is the actual work, this anchor scores style, and style tracks culture.' },
      { q: 'An interviewer probes one candidate\'s six-month resume gap at length, then waves an identical gap past for another candidate.',
        opts: ['A same-evidence failure: identical facts got different scrutiny', 'Good instinct; interviewers should follow their curiosity', 'A problem only if the two final scores end up different'],
        answer: 0, why: 'The same-evidence test: identical facts get identical scrutiny, whoever they belong to. Structured interviews exist so that curiosity has to apply evenly.' },
      { q: 'The panel finishes the interviews, ranks the candidates by overall impression, then writes up the reasons for the ranking.',
        opts: ['Reasons written after ranking defend the gut instead of informing the decision', 'Ranking is fine as long as reasons get written eventually', 'The error was letting the panel rank at all'],
        answer: 0, why: 'Why before rank. Reasons composed afterward are advocacy for a decision already made; scores and evidence recorded first, against the rubric, is where fairness lives. Humans ranking is fine; the sequence was the failure.' },
      { q: 'The debrief on a finalist is one sentence: "great culture fit." Everyone nods.',
        opts: ['The fit laundromat: "reminds me of us" wearing a professional word', 'A strong signal that deserves heavy weighting', 'Fine as long as HR is in the room when it\'s said'],
        answer: 0, why: 'Undefined fit launders similarity into a criterion. Defined as specific observable behaviors, values in action with evidence, it can be assessed honestly; as a vibe, it rebuilds the team you already have.' }
    ]
  });

  /* ---------- INTERACTIVE: private structure plan builder (Section 04) ---------- */
  var spb = $('#structPlan');
  if (spb) {
    var sRole = $('#spRole'), sTasks = $('#spTasks'), sProbe = $('#spProbe'),
        sBtn = $('#spBuild'), sStatus = $('#spStatus'), sOut = $('#spOut');
    var spReady = function () {
      var ok = sRole.value.trim().length >= 5 && sTasks.value.trim().length >= 5 && sProbe.value.trim().length >= 5;
      sBtn.disabled = !ok;
      sStatus.textContent = ok ? 'Ready, build it' : 'Fill in all three';
      return ok;
    };
    [sRole, sTasks, sProbe].forEach(function (el) { el.addEventListener('input', spReady); });
    sBtn.addEventListener('click', function () {
      if (!spReady()) return;
      var esc = function (t) { return t.replace(/</g, '&lt;'); };
      sOut.innerHTML = '<span class="tag">My structure plan · private</span>' +
        '<div class="plan__out-grid">' +
        '<div class="row"><b>The role</b><span>' + esc(sRole.value.trim()) + '</span></div>' +
        '<div class="row"><b>The question seeds</b><span>' + esc(sTasks.value.trim()) + '. Each task becomes a behavioral question: "Tell me about a time you did this," with a follow-up probing the candidate\'s specific part in it. Same questions, same order, every candidate.</span></div>' +
        '<div class="row"><b>The probe, anchored</b><span>' + esc(sProbe.value.trim()) + '. Write its anchors now, while no face is attached: what concrete evidence makes an answer a 2, and what makes it a 5?</span></div>' +
        '<div class="row"><b>The rubric skeleton</b><span>One row per task plus one for the probe, each with 1-to-5 anchors a stranger could apply. Draft the anchors with AI in an approved VU tool, then pressure-test: would two raters score the same answer the same way?</span></div>' +
        '<div class="row"><b>The rule</b><span>All of it is built before the first application is read, then frozen. That timing is what keeps the help fair, and green.</span></div>' +
        '</div>';
      sOut.hidden = false;
      sOut.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'nearest' });
    });
  }

  /* ---------- INTERACTIVE: The Hiring Lab (Section 05) ---------- */
  var lab = $('#hireLab');
  if (lab) {
    var SLOTS = [
      { key: 'The posting', opts: [
        { t: 'Recycle the posting from three years ago; it filled the role last time.', pts: 1, coach: 'The recycled post carries the old degree line, the old proxies, and the old jargon, so it refills the pool you had. The gap on your team may not even match what it asks for anymore.' },
        { t: 'Ask AI to punch it up so the role sounds more exciting.', pts: 2, coach: 'Livelier jargon is still jargon. Excitement was never the filter problem; the requirements were. Punching up a proxy just markets the narrow door harder.' },
        { t: 'Run the team skills map, then have AI audit the posting: proxies out, degree line challenged, plain-language pass.', pts: 3, coach: 'The post now names the real gap and drops the accidental filters. Wider pool, same rigor, and every requirement traces to a task the role performs.' }]},
      { key: 'The screen', opts: [
        { t: 'Paste the resumes into a chatbot and ask for a shortlist of the strongest five.', pts: 0, red: true, coach: 'Private information about dozens of people went into a tool, and an unauditable system just screened them. This is the one choice in the lab that nothing downstream can repair.' },
        { t: 'Skim the pile yourself and shortlist whoever feels strong.', pts: 1, coach: 'Legal and human, and entirely unstructured: a feel-based skim pattern-matches toward familiar resumes, which is how teams clone themselves one hire at a time.' },
        { t: 'Screen every application against the rubric\'s must-haves, noting evidence, then run structured phone screens.', pts: 3, coach: 'The rubric you built before candidates now does its first job: every applicant measured against the role, evidence written down, and the shortlist defensible to anyone who asks.' }]},
      { key: 'The interviews', opts: [
        { t: 'Let each interviewer have a natural conversation and form an impression.', pts: 1, coach: 'Vibe conversations measure confidence and chemistry, and they measure them differently for every candidate. Nothing that comes out of them can be compared.' },
        { t: 'Use a shared question list; everyone scores each candidate 1 to 10 by feel.', pts: 2, coach: 'Same questions is half the structure. Without anchors, a 7 from one interviewer and a 7 from another describe two different candidates; the numbers look rigorous and compare nothing.' },
        { t: 'Same questions in the same order, scored against the pre-built anchors, evidence noted per answer.', pts: 3, coach: 'Comparable evidence, candidate by candidate, question by question. This is the structure dividend paying out, and every anchor was written before a single face was attached.' }]},
      { key: 'The decision', opts: [
        { t: 'Go with the candidate who felt right; you have run plenty of hires.', pts: 1, coach: '"Felt right" is where every bias this course named gets its vote. Years of experience make the feeling stronger, and no more auditable.' },
        { t: 'Average the rubric scores and let the highest number win automatically.', pts: 2, coach: 'Better than gut, and now the arithmetic is making the call: an automated verdict wearing a spreadsheet. Scores inform; a debrief catches what the numbers hide; a human decides.' },
        { t: 'Rubric scores on the table, a debrief where interviewers defend scores with evidence, and you make the call and own it.', pts: 3, coach: 'Evidence argued in the open, the same-evidence test available to run, and a named human accountable for the outcome. This decision can be explained to anyone, including the candidates who didn\'t get it.' }]}
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
          statusEl.textContent = ready ? 'Ready, run the hire' :
            'Choose ' + picks.filter(function (p) { return p === null; }).length + ' more moment(s)';
          outEl.hidden = true;
        });
        d.appendChild(b);
      });
      slotsEl.appendChild(d);
    });
    var REACTIONS = {
      violation: 'The offer went out, and it doesn\'t matter. Candidate materials sat in an unapproved tool, and an unauditable system shaped who made the shortlist: a privacy violation nobody can undo and a screen nobody can defend. When a candidate, a colleague, or a regulator asks how the pool was narrowed, there is no good answer, and every careful step you took afterward inherits the problem.',
      strong: 'The defensible hire. The audited posting pulled applicants from places the old one never reached, the rubric screened them against the job instead of against each other, the interviews produced evidence you could lay side by side, and the debrief caught the one score a gut read would have inflated. You can explain this decision to anyone who asks, including the people who didn\'t get the offer.',
      mid: 'A decent hire you cannot defend. The structured pieces worked; the soft spots decided. Somewhere between the feel-based moments and the missing anchors, the process leaned on impressions, and when someone asks why this candidate over that one, the honest answer is a feeling with a memory attached. Next search, the weak moment is the one to fix first.',
      weak: 'The gut hire. The recycled post refilled the familiar pool, the interviews measured confidence, and the decision went to whoever felt right, which means the team just hired the person most like itself. The skills gap that opened this requisition is still open; next year\'s posting will be for the same thing.'
    };
    runBtn.addEventListener('click', function () {
      var violated = picks.some(function (p, i) { return SLOTS[i].opts[p].red; });
      var score = picks.reduce(function (t, p, i) { return t + SLOTS[i].opts[p].pts; }, 0); // 0..12
      var pct = Math.round((score / 12) * 100);
      var tier = violated ? 'violation' : score >= 11 ? 'strong' : score >= 8 ? 'mid' : 'weak';
      var head = tier === 'violation' ? 'Stop. The red line broke, and the rest of the design stopped mattering.'
               : tier === 'strong' ? 'A defensible hire from a wider pool. The structure did the comparing; a human made the call.'
               : tier === 'mid' ? 'Half a process. The structured moments held; the soft moments are where the decision actually happened.'
               : 'A gut hire wearing a process\'s clothes. Familiar pool, vibe evidence, unowned reasoning.';
      var coach = picks.map(function (p, i) { return '<div><b>' + SLOTS[i].key + ':</b> ' + SLOTS[i].opts[p].coach + '</div>'; }).join('');
      outEl.innerHTML = '<span class="tag">The hire, reviewed · ' + score + ' / 12</span>' +
        '<div class="lab__meter"><span style="width:0"></span></div>' +
        '<p style="margin:0;color:#fff;font-weight:500">' + head + '</p>' +
        '<div class="sample">' + REACTIONS[tier] + '</div>' +
        '<div class="lab__coach">' + coach + '</div>' +
        (tier !== 'strong' ? '<p class="why" style="margin-top:1rem"><b>Try again:</b> change your weakest moment and run the hire again. Watch what becomes defensible.</p>'
                           : '<p class="why" style="margin-top:1rem"><b>Now the real thing:</b> the pair drill in Go deeper finds the weak moment in YOUR last real hire.</p>');
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

  /* ---------- INTERACTIVE: Structure Card capstone ---------- */
  var planEl = $('#tdPlan');
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
      audit: { name: 'Audit the posting with AI', move: 'Before it ships, every requirement answers the audit question: does this describe the work? Proxies and jargon go, the degree line defends itself or leaves, and AI drafts the plain-language rewrite for you to judge.' },
      rubric: { name: 'Build the rubric before reading a single application', move: 'Questions from the role\'s real tasks, 1-to-5 anchors a stranger could apply, drafted with AI in an approved VU tool and pressure-tested for ambiguity. Then it freezes, and every candidate meets the same yardstick.' },
      skillsmap: { name: 'Run the team skills map', move: 'What the team can do, what the work ahead needs, and the gap between them, structured with AI from role-level detail only. The posting gets written to the gap, and growing someone from inside gets its fair look first.' },
      out: { name: 'Take the resume pile out of any AI tool, today', move: 'If candidate materials have crept into a chatbot anywhere on the team, they come out now: delete the conversations, say why in plain terms, and hand the team the green-side uses that replace the shortcut.' }
    };
    var NOT = {
      paste: 'Put candidate materials in any AI tool. Holding move: before every paste, one question: could a specific person be identified from this? If yes, it never goes in, whatever the deadline.',
      rank: 'Let AI rank, score, or screen people. Holding move: AI builds the postings, questions, rubrics, and maps; every read of an actual candidate is done by a human with the rubric open.',
      norubric: 'Score candidates without a pre-built rubric. Holding move: no interviews get scheduled until the rubric is frozen. If candidates arrive first, stop and build it before anyone is read.'
    };
    var WHEN = { tomorrow: 'tomorrow', threedays: 'within the next 3 days', week: 'within 7 days' };
    buildBtn.addEventListener('click', function () {
      if (!planReady()) return;
      var who = whoIn.value.trim();
      var p = PRACTICE[pick.practice];
      var rows = '' +
        '<div class="row"><b>The decision</b><span>' + who.replace(/</g, '&lt;') + '</span></div>' +
        '<div class="row"><b>The first move</b><span>' + p.name + '. ' + p.move + '</span></div>' +
        '<div class="row"><b>What I will NOT do</b><span>' + NOT[pick.not] + '</span></div>' +
        '<div class="row"><b>The date</b><span>The first move happens ' + WHEN[pick.when] + '. Thirty minutes, an approved tool, and no person anywhere in the prompt.</span></div>' +
        '<div class="row"><b>The line, standing</b><span>Candidate materials never enter an AI tool, and no tool ranks, scores, or screens a person. The process is AI\'s to help build; the verdict is mine.</span></div>';
      outEl2.innerHTML = '<span class="tag">My hiring structure card</span>' +
        '<div class="plan__out-grid">' + rows + '</div>' +
        '<div class="lab__runrow" style="margin-top:1.25rem">' +
        '<button class="btn" id="planCopy">Copy my card</button>' +
        '<span class="quiz__progress" id="planCopied" style="color:rgba(255,255,255,.6)">Put the first move on your calendar now</span></div>';
      outEl2.hidden = false;
      $('#planCopy').addEventListener('click', function () {
        var text = 'MY HIRING STRUCTURE CARD (Hiring & Talent Decisions with AI, Vanderbilt)\n' +
          'The decision: ' + who + '\n' +
          'First move: ' + p.name + '. ' + p.move + '\n' +
          'I will NOT: ' + NOT[pick.not] + '\n' +
          'When: ' + WHEN[pick.when] + '.\n' +
          'The line: candidate materials never enter an AI tool, and no tool ranks, scores, or screens a person. The process is AI\'s to help build; the verdict is mine.';
        (navigator.clipboard ? navigator.clipboard.writeText(text) : Promise.reject()).then(function () {
          $('#planCopied').textContent = 'Copied. Paste it somewhere you\'ll see before the search starts.';
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
      { q: 'A pile of applications, a deadline, and a chatbot that could shortlist them in seconds. What does this course say?',
        opts: ['Acceptable if you review the shortlist carefully', 'Never: candidate materials are red data, and an AI shortlist is an unauditable automated screen', 'Acceptable for the first cut, with humans after', 'Acceptable inside approved VU tools only'],
        correct: 1, why: 'Both rules break at once: the paste violates the red light, and the ranking is an automated employment decision. Approved tools change nothing here; the red rule is about the data and the decision, and it outranks everything.' },
      { q: 'Which of these sits on the yellow side of the line, approved VU tools only?',
        opts: ['Summarizing your reference-call notes', 'Comparing two finalists\' resumes side by side', 'Polishing the offer letter template with no names in it', 'Asking AI which candidate seems strongest'],
        correct: 2, why: 'A nameless template is internal process work: yellow, in approved tools. The other three all put identifiable people into the tool, which is red however the request is worded.' },
      { q: 'A requirement audit on a job posting hunts for...',
        opts: ['Typos and formatting slips', 'Lines that describe the person being pictured rather than the work: proxies, jargon, inflated degrees', 'Ways to make the posting sound more exciting', 'Places to add requirements the last posting missed'],
        correct: 1, why: 'Proxies, jargon walls, and degree inflation shrink the pool for reasons unrelated to the job. The audit asks of every line: does this describe the work? AI drafts the rewrite; you make the call.' },
      { q: 'The scoring rubric gets built...',
        opts: ['After the interviews, once you know what mattered', 'Before any application is read, then frozen', 'Only for senior roles', 'Separately by each interviewer'],
        correct: 1, why: 'Before candidates, always. Structure built after you have met people bends toward the one you already like, and the early timing is also what keeps AI\'s help fair and green: a rubric written before candidates contains no candidate.' },
      { q: 'In the Hiring Lab, the defensible decision came from...',
        opts: ['Averaging the scores and letting the highest number win', 'Whoever the team felt right about', 'Rubric scores plus a debrief where interviewers defend them with evidence, and a human making the call', 'Deferring to the most experienced interviewer'],
        correct: 2, why: 'Scores inform, evidence gets argued in the open, and a named person decides and owns it. Auto-deciding by average hands the verdict to arithmetic, which is the machine-verdict problem in a spreadsheet.' },
      { q: 'The same-evidence test asks...',
        opts: ['Whether every candidate met the same interviewer', 'Whether identical facts received identical scrutiny, whoever they belonged to', 'Whether AI and the humans reached the same ranking', 'Whether all the evidence came from resumes'],
        correct: 1, why: 'One yardstick, evenly applied: a gap probed on one resume gets probed on every resume, and a credential that impresses on one gets the same weight on all. It is the cheapest bias check in the room.' }
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
      var msg = pct >= 80 ? 'The line and the method are both loaded. The role you named is where they become real.' :
                pct >= 50 ? 'Solid. Revisit the sections you missed before your next search opens.' :
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
