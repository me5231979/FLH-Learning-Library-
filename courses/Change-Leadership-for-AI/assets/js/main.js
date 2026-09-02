/* =====================================================================
   CHANGE LEADERSHIP FOR AI, classroom deck
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
    root: '#gapGuess', q: '#ggQ', options: '#ggOptions', feedback: '#ggFeedback',
    progress: '#ggProgress', next: '#ggNext', result: '#ggResult',
    progressWord: 'Finding', goodColor: 'var(--vu-oak)',
    resultColor: 'var(--ink-soft, #555)', passAt: 3,
    passMsg: 'You called the research. The pattern in every number: the technology arrived everywhere, and the leadership to carry people through it stayed rare.',
    failMsg: 'Most rooms miss these, and that IS the finding: we keep treating AI change as a technology problem while the data keeps saying it is a leadership one.',
    labels: [],
    items: [
      { q: 'Accenture studied how leaders handle AI across organizations. What share lead AI investments effectively?',
        opts: ['Around 18 percent', 'Around 45 percent', 'Around 70 percent'],
        answer: 0, why: 'Around 18 percent. Fewer than one leader in five, and access to the technology is roughly equal. Whatever separates them, it is not the tools.' },
      { q: 'Gallup asked employees whether their organization has communicated a clear plan for using AI. Roughly how many say yes?',
        opts: ['About 15 percent', 'About 40 percent', 'About 65 percent'],
        answer: 0, why: 'Around 15 percent in Gallup\'s workplace research. For most employees, the AI plan is silence, and silence gets filled with the scariest available story.' },
      { q: 'Gallup also tracks trust. What share of U.S. employees strongly agree they trust the leadership of their organization?',
        opts: ['Around a quarter', 'Around half', 'Around three in four'],
        answer: 0, why: 'Under a quarter. Every AI announcement you make lands on that baseline, which is why checkable honesty beats polished reassurance every time.' },
      { q: 'And what does Accenture find actually separates the leaders whose AI change works?',
        opts: ['Deeper technical fluency with the tools', 'Curiosity, courage, and connection', 'Bigger AI budgets'],
        answer: 1, why: 'Curiosity, courage, and connection: human capabilities, all three learnable, and all three practiced in this session. Tool fluency helps; it just is not the differentiator.' }
    ]
  });

  /* Judge the opening line (Section 02) */
  makeTrainer({
    root: '#lineJudge', q: '#ljQ', options: '#ljOptions', feedback: '#ljFeedback',
    progress: '#ljProgress', next: '#ljNext', result: '#ljResult',
    progressWord: 'Line', goodColor: 'var(--vu-gold-flat)',
    resultColor: 'rgba(255,255,255,.85)', passAt: 4,
    passMsg: 'Your ear works: you can hear the difference between honesty, happy talk, and a threat wearing a smile. Now draft your own line in the pair drill below.',
    failMsg: 'Close. The tells: honest lines name the fear and give scope in checkable parts. Happy talk promises feelings. Threat lines talk about efficiency while the room hears headcount.',
    labels: ['Names it honestly', 'Dodges with happy talk', 'Lands as a threat'],
    items: [
      { q: '"We\'re bringing in an AI tool for first drafts. Some of you are wondering what this means for your job, so let\'s talk about that directly, starting with what I know and what I don\'t."',
        answer: 0, why: 'The fear is named before it names itself, and the honest frame follows. This manager just took the unsaid question off the table and put it in the room.' },
      { q: '"Great news, everyone: AI is going to make all our lives easier! Nothing to worry about here, this is purely a positive."',
        answer: 1, why: '"Nothing to worry about" is a promise nobody can keep, and the room knows it. Happy talk confirms the fear is unspeakable, which makes it grow.' },
      { q: '"This tool should let us produce the same output with fewer hours, so I need everyone proficient on it fast."',
        answer: 2, why: '"Same output, fewer hours" lands on a team as "fewer of us." Whatever was meant, fear does the interpreting, and this line never answered where the saved hours go.' },
      { q: '"Leadership wants every team exploring AI this quarter, so keep an eye out for opportunities."',
        answer: 1, why: 'A dodge in a different costume: nothing named, nothing scoped, nobody answered. The unsaid question stays unsaid, and six months of quiet resistance start here.' },
      { q: '"I\'ll be straight with you: this changes parts of how we work, I don\'t know all of it yet, and here\'s what I can promise: any news about this team\'s roles, you hear from me first, with the team in the room."',
        answer: 0, why: 'Honest scope with a promise the manager can actually keep. Notice what is missing: no false certainty, no hype, and nothing the team cannot verify later.' }
    ]
  });

  /* Read the room (Section 03) */
  makeTrainer({
    root: '#roomRead', q: '#rrQ', options: '#rrOptions', feedback: '#rrFeedback',
    progress: '#rrProgress', next: '#rrNext', result: '#rrResult',
    progressWord: 'Moment', goodColor: 'var(--vu-oak)',
    resultColor: 'var(--ink-soft, #555)', passAt: 4,
    passMsg: 'You build safety on instinct: normalize the miss, go to the quiet ones, and put your own fumbles on the table first.',
    failMsg: 'Close. The compass: safety grows when misses become the team\'s lesson, when quiet people get a private channel, and when the leader\'s own fumbles go first. It shrinks under blame, pressure, and performance.',
    labels: [],
    items: [
      { q: 'In the pilot kickoff, your most junior analyst admits the AI gave them a wrong figure and they nearly sent it out. The room goes quiet.',
        opts: ['Thank them, then tell your own recent AI miss and what it taught you', 'Move past it quickly to spare them embarrassment', 'Remind everyone to double-check AI output more carefully'],
        answer: 0, why: 'The first public miss decides everything. Thanked and matched with your own story, it becomes the team\'s lesson; hurried past or turned into a warning, it becomes the last miss anyone admits.' },
      { q: 'Two enthusiasts now dominate every AI conversation, and three of your steadiest people have stopped talking in meetings.',
        opts: ['Let it ride; enthusiasm is contagious', 'Open your next 1:1s with the quiet three and ask what they\'re seeing', 'Ask the enthusiasts to coach the others'],
        answer: 1, why: 'The quiet ones are the real vote, and they will not vote in a meeting the enthusiasts own. The 1:1 is where you find out whether this change is landing or just loud.' },
      { q: 'You tried the tool on your own weekly summary and it mangled it. Nobody saw it happen.',
        opts: ['Keep it to yourself; leaders showing fumbles undermines confidence', 'Tell the story at the next team meeting, with what you\'ll try differently', 'Privately warn your team the tool is unreliable'],
        answer: 1, why: 'A leader\'s fumble, told plainly, is the cheapest psychological safety on the market. It says trying and missing is what we do here, and only you can say it first.' },
      { q: 'A team member says: "I\'d rather keep doing it my way. The AI thing isn\'t for me."',
        opts: ['Require the tool; consistency matters', 'Ask what specifically feels off, then shape a low-stakes experiment they design', 'Quietly route AI work around them'],
        answer: 1, why: 'Resistance is information. Under "not for me" there is usually a specific worry, and an experiment they design converts a spectator into a participant without force.' },
      { q: 'The pilot\'s first month produced two visible wins and one embarrassing miss a stakeholder noticed.',
        opts: ['Celebrate the wins and let the miss fade quietly', 'Debrief the miss with the whole team, no blame, same energy as the wins', 'Tighten approvals so nothing leaves without your sign-off'],
        answer: 1, why: 'The miss handled in the open is worth more than both wins. Buried, it teaches concealment; over-controlled, it teaches fear; debriefed, it teaches the process.' }
    ]
  });

  /* The long-arc move (Section 06) */
  makeTrainer({
    root: '#arcMove', q: '#amQ', options: '#amOptions', feedback: '#amFeedback',
    progress: '#amProgress', next: '#amNext', result: '#amResult',
    progressWord: 'Moment', goodColor: 'var(--vu-oak)',
    resultColor: 'var(--ink-soft, #555)', passAt: 4,
    passMsg: 'You hold. Revisit on purpose, hear the silence, tell the truth early, and answer the job question as patiently the fifth time as the first.',
    failMsg: 'Close. The long-arc compass: quiet is a signal to investigate, decisions need revisit dates, wins travel with their open questions, and the job question gets a fresh answer every time it returns.',
    labels: [],
    items: [
      { q: 'Month three: usage numbers look fine, and your two most careful people have gone quiet in meetings since the rollout began.',
        opts: ['The numbers say it\'s working; move on', 'Open 1:1s with the fear question and listen without defending anything', 'Praise the quiet ones publicly to draw them out'],
        answer: 1, why: 'Green dashboard plus quiet meetings is the compliance-theater signature. The 1:1 fear question is the instrument that can still hear what the dashboard cannot.' },
      { q: 'Month four: the team treats the new workflow as settled, and a capability update just changed what the tool can do.',
        opts: ['Leave it settled; stability is precious', 'Reopen the ethics conversation: your lines were drawn for the old capabilities', 'Wait for something to go wrong before revisiting'],
        answer: 1, why: 'The ethics container stays open on purpose. Lines drawn for last quarter\'s capabilities are quietly wrong by this one, and the revisit cadence exists for exactly this moment.' },
      { q: 'Month five: a director asks for a success story, and everything in you wants to declare victory.',
        opts: ['Declare it; momentum matters', 'Share the wins and the open questions in the same breath, and name what you\'re still watching', 'Hold everything back until the picture is perfect'],
        answer: 1, why: 'Courage as a habit: the true thing, said early, including upward. Declared victories end the change work while it is still half done, and your team hears the declaration too.' },
      { q: 'Month six: someone asks the job question again. You answered it thoroughly back in week two.',
        opts: ['Point them to the earlier answer', 'Answer it fresh and fully, as if it were the first time', 'Ask why trust is still an issue after all this time'],
        answer: 1, why: 'Fear does not file your previous answers. The re-ask means the question still lives, and the patient fresh answer is the highest-leverage minute of month six.' },
      { q: 'Reviewing your rollout metrics, you realize you have been tracking logins and usage and nothing else.',
        opts: ['Usage is the metric that matters; keep it simple', 'Add the trust signals: who speaks in meetings, what surfaces in 1:1s, whether misses reach you in the open', 'Stop measuring; metrics make people nervous'],
        answer: 1, why: 'Usage measures compliance and trust measures change. Both countable, and only the pair can tell adoption apart from the performance of adoption.' }
    ]
  });

  /* ---------- INTERACTIVE: private conversation-plan builder (Section 04) ---------- */
  var cpm = $('#convoPlan');
  if (cpm) {
    var cChange = $('#cpChange'), cFear = $('#cpFear'), cAsk = $('#cpAsk'),
        cBtn = $('#cpBuild'), cStatus = $('#cpStatus'), cOut = $('#cpOut');
    var cpReady = function () {
      var ok = cChange.value.trim().length >= 5 && cFear.value.trim().length >= 5 && cAsk.value.trim().length >= 5;
      cBtn.disabled = !ok;
      cStatus.textContent = ok ? 'Ready, build it' : 'Fill in all three';
      return ok;
    };
    [cChange, cFear, cAsk].forEach(function (el) { el.addEventListener('input', cpReady); });
    cBtn.addEventListener('click', function () {
      if (!cpReady()) return;
      var esc = function (t) { return t.replace(/</g, '&lt;'); };
      var fearTxt = esc(cFear.value.trim());
      cOut.innerHTML = '<span class="tag">My conversation plan · private</span>' +
        '<div class="plan__out-grid">' +
        '<div class="row"><b>The change</b><span>' + esc(cChange.value.trim()) + '</span></div>' +
        '<div class="row"><b>The naming line</b><span>"Some of you are wondering about this: ' + fearTxt + '. That\'s a reasonable thing to wonder, so let\'s talk about it directly." Say it first, before the features, before the timeline.</span></div>' +
        '<div class="row"><b>The honest frame</b><span>Three parts, out loud: what is changing, what is not, and what you don\'t know yet. If the fear you named touches roles, add the promise you can keep: any role news comes from you first, with the team in the room.</span></div>' +
        '<div class="row"><b>The invitation</b><span>"You know this work better than anyone, so you\'re designing how this lands: what we try first, what we protect, and what we refuse." Questions count as contributions, especially skeptical ones.</span></div>' +
        '<div class="row"><b>The first ethics agenda</b><span>Item one: ' + esc(cAsk.value.trim()) + ' Item two: where is AI fine for our work, where is it not, and why. Floor: the traffic light, with red, private information about people, never on the table. Date the output and book the revisit.</span></div>' +
        '</div>';
      cOut.hidden = false;
      cOut.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'nearest' });
    });
  }

  /* ---------- INTERACTIVE: The Change Lab (Section 05) ---------- */
  var lab = $('#changeLab');
  if (lab) {
    var SLOTS = [
      { key: 'The announcement (day one)', opts: [
        { t: 'Forward the leadership memo with a note: "See below, this starts Monday."', pts: 1, coach: 'The unsaid question just got the whole weekend to grow, alone, in six heads. A forwarded memo tells the team the change is being done to them, and that you are its messenger rather than its leader.' },
        { t: 'Present the change at the team meeting: features, benefits, timeline, then questions.', pts: 2, coach: 'Better, and still a technology story. The fear is not on the slide, so it stays under the table, and "any questions?" gets the silence it always gets. The question that matters never comes up in a room that has not been made safe for it.' },
        { t: 'Open by naming it: what changes, what does not, what you don\'t know yet, and the job question addressed before anyone asks.', pts: 3, coach: 'Name and frame, in the first five minutes. The room can stop threat-assessing and start listening, because the scariest topic is already on the table with honest edges around it.' }]},
      { key: 'Week two: "Just tell me straight: is this how my job goes away?"', opts: [
        { t: '"No, no, nothing like that. Nobody is losing their job over a drafting tool."', pts: 1, coach: 'False certainty. You cannot know that, the team knows you cannot know it, and the first change of any size will spend the credibility this answer borrowed. Comfort now, paid for with trust later.' },
        { t: '"Honestly? I don\'t know."', pts: 2, coach: 'Honest, and only half the answer. Bare uncertainty leaves the person alone with the fear you just confirmed. The missing half is what you promise: how change will be handled, and from whom they will hear it.' },
        { t: 'Both parts: "What I know: tasks change first, and no role decision exists. What I promise: any role news, you hear from me first, and the saved hours go to the backlog we keep skipping."', pts: 3, coach: 'The honest two-part answer: known facts, then keepable promises, then the saved-hours question answered before it is asked. Every claim in it is checkable, which is what makes it believable.' }]},
      { key: 'Month two: a team member\'s AI-drafted analysis had a bad number, and a stakeholder caught it', opts: [
        { t: 'Handle it privately with the person and quietly start re-checking their work.', pts: 1, coach: 'The quiet burial. The person learns that misses are shameful, the team learns it through the grapevine, and every future miss goes underground, where it can grow until a stakeholder finds it for you.' },
        { t: 'Add a verification step to the process and announce the new rule.', pts: 2, coach: 'The right mechanics with the wrong lesson. The process improves, and the person is still wearing the miss alone while the team reads the new rule as quiet blame. Half the fix is the debrief you skipped.' },
        { t: 'Run a no-blame debrief with everyone: what the process let through, what changes, and thanks to the person for the lesson.', pts: 3, coach: 'The miss becomes the team\'s property and the process gets the scrutiny. The person who fumbled publicly and got thanked is now proof that experimenting here is safe, which is worth more than the fix itself.' }]},
      { key: 'Month four: usage is drifting, and half the team has quietly gone back to the old way', opts: [
        { t: 'Declare the rollout complete and report the win upward.', pts: 1, coach: 'Declared victory over quiet dread. The dashboard stays green, the real work moves underground, and the next change you announce starts from a team that watched you not notice.' },
        { t: 'Send a reminder that using the tool is the expectation now.', pts: 2, coach: 'Enforcement buys compliance, and compliance is what you will get: logins without belief. The drift had a reason, and the memo did not ask what it was.' },
        { t: 'Name the drift out loud, ask what the tool is failing at, and let the team redesign what isn\'t working.', pts: 3, coach: 'Revisit and re-invite. The drift was data, the team knows the answer, and ownership of iteration two is what converts a rollout into their way of working.' }]}
    ];
    var picks = [null, null, null, null];
    var slotsEl = $('#labSlots'), runBtn = $('#labRun'), statusEl = $('#labStatus'), outEl = $('#labOutcome');
    // Branching: slots open one at a time, and every slot after the first carries a
    // situation set by the learner's first move, so that move stays in the room.
    var BRANCH = { 1: ["Week two. The memo went out Friday, and the weekend did its work. Monday was quiet in the wrong way. Now your most worried team member closes your door. They ask it straight: is this how my job goes away? They are watching your face. What do you say?", "Week two. The team meeting covered the features and the timeline, and the questions slot got silence. Since then the enthusiasts have been trying the tool, and the rest have been quiet. Now your most worried team member closes your door. They ask it straight: is this how my job goes away? What do you say?", "Week two. You named the job question on day one, with honest edges around what you did not know. It bought some quiet, not an ending. Now your most worried team member closes your door. They ask it straight: is this how my job goes away? What do you say?"], 2: ["Month two. A team member's AI-drafted analysis carried a bad number, and a stakeholder caught it, not you. The team already half expects the tool to be blamed, or them. Nobody has said the word mistake out loud since the memo. The person is waiting to hear from you. What happens next?", "Month two. A team member's AI-drafted analysis carried a bad number, and a stakeholder caught it, not you. The rollout meeting sold benefits, so this is the first sign that the tool can be wrong. The team is watching how a miss gets treated. What happens next?", "Month two. A team member's AI-drafted analysis carried a bad number, and a stakeholder caught it, not you. The team heard you promise honesty on day one. This is the first real test of it. The person who drafted it is embarrassed and waiting. What happens next?"], 3: ["Month four. Usage is drifting, and half the team has quietly gone back to the old way. Nobody told you. You found it in the numbers. The forwarded memo set the tone, and it never got replaced: this is something done to them. The dashboard still looks fine from above. What do you do?", "Month four. Usage is drifting, and half the team has quietly gone back to the old way. The enthusiasts are still in. The watchful three never said why they left, because the room never asked them to. The dashboard still looks fine from above. What do you do?", "Month four. Usage is drifting, and half the team has quietly gone back to the old way. The difference is that they will tell you why, if asked. Day one bought that much: the team still expects honesty from you and offers it back. The dashboard looks fine from above. What do you do?"] };
    var CARRY = ["A forwarded memo cast you as messenger, and the team filled the silence with dread.", "A benefits presentation kept the fear under the table, where it quietly steered the team.", "Naming the job question on day one made honesty the team's expectation, and their habit."];
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
          statusEl.textContent = ready ? 'Ready, run the six months' :
            'Choose ' + picks.filter(function (p) { return p === null; }).length + ' more moment(s)';
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
      strong: 'Month six: the team runs the tool their own way and keeps improving it. Misses surface in the open, the ethics page is on version three because they keep updating it, and when last week\'s capability update landed, two people brought it to you with a plan. The change belongs to them now, which was the goal all along.',
      mid: 'Month six: the dashboard looks fine. In the room, the questions have stopped, your two most careful people do their real work the old way after hours, and nobody has mentioned the tool\'s last mistake to you. You have compliance. Trust is still deciding, and it is not leaning your way.',
      weak: 'Month six: the rollout is officially complete, the dashboard is green, and the team has built a quiet parallel process to avoid the tool. The job question never got a real answer, so the team answered it themselves, with dread. The next change you announce starts from here, and it will cost double.'
    };
    runBtn.addEventListener('click', function () {
      var score = picks.reduce(function (t, p, i) { return t + SLOTS[i].opts[p].pts; }, 0); // 4..12
      var pct = Math.round((score / 12) * 100);
      var tier = score >= 11 ? 'strong' : score >= 8 ? 'mid' : 'weak';
      var head = tier === 'strong' ? 'A held container. You named the fear, framed honestly, folded the fumble into the team\'s learning, and met the drift with an invitation.'
               : tier === 'mid' ? 'Half a container. Some moments were held and some were dodged, and the dodged ones are quietly deciding the outcome.'
               : 'Compliance theater over quiet dread. The rollout looks fine from above, and the team stopped telling you the truth somewhere around month two.';
      var coach = picks.map(function (p, i) { return '<div><b>' + SLOTS[i].key + ':</b> ' + SLOTS[i].opts[p].coach + '</div>'; }).join('');
      outEl.innerHTML = '<span class="tag">Six months in · ' + score + ' / 12</span>' +
        '<div class="lab__meter"><span style="width:0"></span></div>' +
        '<p style="margin:0;color:#fff;font-weight:500">' + head + '</p>' +
        '<div class="sample">' + REACTIONS[tier] + '</div>' +
        (CARRY[picks[0]] ? '<p class="lab__carry"><b>What your first move set in motion:</b> ' + CARRY[picks[0]] + '</p>' : '') +
        '<div class="lab__coach">' + coach + '</div>' +
        (tier !== 'strong' ? '<p class="why" style="margin-top:1rem"><b>Try again:</b> strengthen your weakest moment and rerun the six months. Watch what changes at month six.</p>'
                           : '<p class="why" style="margin-top:1rem"><b>Now the real thing:</b> the pair drill in Go deeper finds the moment YOU would most likely fumble, before it arrives.</p>');
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

  /* ---------- INTERACTIVE: Change Card capstone ---------- */
  var planEl = $('#clPlan');
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
      naming: { name: 'The naming conversation, whole team', move: 'Open with the fear before it says itself: what is changing, what is not, what you don\'t know yet. Then stop talking and let the room answer; the silence after a naming line is where the real conversation starts.' },
      jobq: { name: 'The honest job answer, next team meeting', move: 'Both parts, out loud: what you know (tasks change first, and no role decision has been made) and what you promise (any role news comes from you first, and the saved hours have a named destination).' },
      ethics: { name: 'The team ethics session', move: 'One hour, hosted by you: where AI is fine for our work, where it is not, and why. Start from the traffic light as the floor, treat disagreement as material, write down what the team decides, and date the revisit.' },
      oneone: { name: 'The fear question, next 1:1', move: 'Ask it plainly: what about this change worries you that you wouldn\'t say in the team meeting? Then listen without defending anything. The answer is your best data about how the change is really landing.' }
    };
    var NOT = {
      promise: 'Promising that nothing will change. Counter-move: promise how change will be handled instead: with the team in the room, visibly, and with the job question answered honestly every single time it comes back.',
      silence: 'Letting enthusiasm silence the anxious. Counter-move: the quiet ones decide whether this sticks, so track who has stopped speaking in meetings and open the next 1:1s with the fear question.',
      outsource: 'Outsourcing the ethics conversation to a policy document. Counter-move: policy sets the floor; your team\'s hosted conversation decides what it means here. Keep it open, dated, and revisited as capabilities shift.'
    };
    var WHEN = { tomorrow: 'tomorrow', threedays: 'within the next 3 days', week: 'within 7 days' };
    buildBtn.addEventListener('click', function () {
      if (!planReady()) return;
      var who = whoIn.value.trim();
      var p = PRACTICE[pick.practice];
      var rows = '' +
        '<div class="row"><b>The change</b><span>' + who.replace(/</g, '&lt;') + '</span></div>' +
        '<div class="row"><b>The first move</b><span>' + p.name + ', ' + WHEN[pick.when] + '. ' + p.move + '</span></div>' +
        '<div class="row"><b>What I will NOT do</b><span>' + NOT[pick.not] + '</span></div>' +
        '<div class="row"><b>The long arc</b><span>Put a revisit on the calendar for 30 days out: what\'s working, what isn\'t, what the tool can do now that it couldn\'t. And re-answer the job question when it comes back, because it will.</span></div>' +
        '<div class="row"><b>The measure</b><span>Trust alongside usage: who speaks in meetings, what surfaces in 1:1s, and whether misses reach you in the open. Green dashboards with quiet meetings mean trouble, not success.</span></div>';
      outEl2.innerHTML = '<span class="tag">My change card</span>' +
        '<div class="plan__out-grid">' + rows + '</div>' +
        '<div class="lab__runrow" style="margin-top:1.25rem">' +
        '<button class="btn" id="planCopy">Copy my card</button>' +
        '<span class="quiz__progress" id="planCopied" style="color:rgba(255,255,255,.6)">Put the conversation on the calendar now</span></div>';
      outEl2.hidden = false;
      $('#planCopy').addEventListener('click', function () {
        var text = 'MY CHANGE CARD (Change Leadership for AI, Vanderbilt)\n' +
          'The change: ' + who + '\n' +
          'First move: ' + p.name + ', ' + WHEN[pick.when] + '.\n' +
          'I will NOT: ' + NOT[pick.not] + '\n' +
          'The long arc: 30-day revisit on the calendar; re-answer the job question every time it returns.\n' +
          'The measure: trust alongside usage: who speaks, what surfaces in 1:1s, whether misses reach me in the open.';
        (navigator.clipboard ? navigator.clipboard.writeText(text) : Promise.reject()).then(function () {
          $('#planCopied').textContent = 'Copied. Paste it somewhere you\'ll see before the conversation.';
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
      { q: 'Accenture finds only around 18 percent of leaders lead AI investments effectively. What separates them?',
        opts: ['Deeper technical fluency with AI tools', 'Curiosity, courage, and connection', 'Larger AI budgets and earlier adoption', 'Dedicated AI staff on their teams'],
        correct: 1, why: 'The differentiators are human capabilities: curiosity as the stance, courage to say true things early, and connection close enough to hear the fear. All three are learnable.' },
      { q: 'Your team is about to hear about an AI change. The strongest opening is...',
        opts: ['Lead with the features and the productivity upside', 'Name the fear directly, then give the honest frame: what changes, what doesn\'t, what you don\'t know yet', 'Keep it brief and upbeat so nobody worries', 'Wait until every detail is certain before saying anything'],
        correct: 1, why: 'Say the fear out loud before it says itself, then frame with honest scope. Upbeat vagueness and waiting both leave the unsaid question to grow in the dark.' },
      { q: 'What actually decides whether AI change sticks on a team?',
        opts: ['The energy of the enthusiasts', 'The quality of the AI tool', 'Whether the anxious quiet ones feel safe to try and to miss', 'The number of training sessions offered'],
        correct: 2, why: 'The enthusiasts were always coming along. The change is decided by the watchful and the worried, and what they are watching is what happens to the first person who fumbles.' },
      { q: 'The team ethics conversation works when...',
        opts: ['A policy document is circulated for everyone to read', 'The manager hosts it, disagreement is treated as material, and real ambiguities are escalated to policy owners', 'It happens once, at kickoff, and gets filed', 'Only the people excited about AI attend'],
        correct: 1, why: 'Hosted, mined for disagreement, sorted between local calls and policy-owner calls, and kept open as capabilities shift. A circulated PDF teaches the team that ethics is someone else\'s job.' },
      { q: 'Someone asks point blank: "Is this how my job goes away?" The honest answer...',
        opts: ['Reassures them that nothing will change', 'Deflects: that\'s a leadership question, not mine', 'Redirects to how much time the tool will save', 'Has two parts: what you know, and what you promise about how change will be handled'],
        correct: 3, why: 'What you know (tasks change first, no role decision made) plus what you promise (role news from you first, saved hours with a named destination). Every claim checkable; nothing promised that you can\'t keep.' },
      { q: 'Six months in, the best evidence the change is healthy is...',
        opts: ['A green usage dashboard', 'Nobody mentions the tool anymore', 'Questions, pushback, and misses still reach you in the open, alongside solid usage', 'The enthusiasts are still enthusiastic'],
        correct: 2, why: 'Trust is the metric that separates adoption from the performance of adoption. A healthy change stays noisy in the right way: misses surface, questions keep coming, and the quiet signals stay loud.' }
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
      var msg = pct >= 80 ? 'The method is loaded. The conversation you planned is where it becomes real.' :
                pct >= 50 ? 'Solid. Revisit the sections you missed before the naming conversation.' :
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

  /* ---------- INTERACTIVE: Choose the next line (branching dialogue) ----------
     Shared engine (house rule: the same engine lives in every deck course).
     turns[0].line is a string; later turns' line (and any option's reply) may be
     an array of three strings indexed by the PREVIOUS turn's chosen option. */
  function makeDialogue(cfg) {
    var root = $(cfg.root);
    if (!root) return;
    var logEl = $(cfg.log, root), optEl = $(cfg.options, root), fbEl = $(cfg.feedback, root),
        progEl = $(cfg.progress, root), nextBtn = $(cfg.next, root), resEl = $(cfg.result, root),
        nudgeEl = $(cfg.nudge, root), askEl = $(cfg.ask, root), navEl = $('.quiz__nav', root);
    var turn = 0, picks = [], locked = false;
    var branch = function () { return turn > 0 ? picks[turn - 1] : 0; };
    var byBranch = function (v) { return Array.isArray(v) ? v[branch()] : v; };
    var esc = function (t) { return String(t).replace(/</g, '&lt;'); };
    var stage = function (t) { return esc(t).replace(/\(([^)]+)\)/g, '<i class="dialogue__stage">($1)</i>'); };
    function addLine(who, text, you) {
      var d = document.createElement('div');
      d.className = 'dialogue__line' + (you ? ' dialogue__line--you' : '');
      d.innerHTML = '<span class="dialogue__who">' + who + '</span><p>' + stage(text) + '</p>';
      logEl.appendChild(d);
    }
    function render() {
      locked = false;
      var T = cfg.turns[turn];
      progEl.textContent = 'Turn ' + (turn + 1) + ' of ' + cfg.turns.length + ' · your move';
      addLine(cfg.them, byBranch(T.line), false);
      fbEl.textContent = '';
      nextBtn.style.visibility = 'hidden';
      nextBtn.textContent = turn === cfg.turns.length - 1 ? 'See how it ended' : 'Next turn';
      optEl.innerHTML = '';
      T.opts.forEach(function (o, i) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'opt';
        b.setAttribute('aria-pressed', 'false');
        b.innerHTML = '<span class="mark">' + String.fromCharCode(65 + i) + '</span><span>' + o.t + '</span>';
        b.addEventListener('click', function () {
          if (locked) return; locked = true;
          $$('.opt', optEl).forEach(function (x, xi) {
            x.setAttribute('disabled', 'true');
            x.setAttribute('aria-pressed', String(xi === i));
          });
          addLine(cfg.you, o.t, true);
          addLine(cfg.them, byBranch(o.reply), false);
          picks.push(i);
          var g = cfg.grades[o.pts];
          fbEl.textContent = g.word + ' ' + o.note;
          fbEl.style.color = g.color;
          nextBtn.style.visibility = 'visible';
          nextBtn.focus();
        });
        optEl.appendChild(b);
      });
    }
    function showResult() {
      var score = picks.reduce(function (t, p, i) { return t + cfg.turns[i].opts[p].pts; }, 0); // 3..9
      var max = cfg.turns.length * 3;
      var pct = Math.round((score / max) * 100);
      var tier = score >= max - 1 ? 'strong' : score >= max - 3 ? 'mid' : 'weak';
      var coach = picks.map(function (p, i) {
        return '<div><b>Turn ' + (i + 1) + ':</b> ' + cfg.turns[i].opts[p].note + '</div>';
      }).join('');
      navEl.style.display = 'none';
      optEl.innerHTML = '';
      fbEl.textContent = '';
      if (askEl) askEl.hidden = true;
      progEl.textContent = 'The conversation ends';
      resEl.innerHTML = '<span class="tag">How it ended · ' + score + ' / ' + max + '</span>' +
        '<div class="lab__meter"><span style="width:0"></span></div>' +
        '<p style="margin:0;color:#fff;font-weight:500">' + cfg.endings[tier].head + '</p>' +
        '<div class="sample">' + cfg.endings[tier].text + '</div>' +
        '<div class="lab__coach">' + coach + '</div>' +
        '<button class="btn btn--ghost" type="button" data-retry style="margin-top:1.25rem">Run it again</button>';
      resEl.hidden = false;
      if (nudgeEl) nudgeEl.hidden = false;
      $('[data-retry]', resEl).addEventListener('click', function () {
        turn = 0; picks = [];
        logEl.innerHTML = '';
        resEl.hidden = true;
        if (nudgeEl) nudgeEl.hidden = true;
        if (askEl) askEl.hidden = false;
        navEl.style.display = '';
        render();
        var first = $('.opt', optEl); if (first) first.focus();
      });
      requestAnimationFrame(function () {
        var bar = $('.lab__meter span', resEl);
        if (bar) requestAnimationFrame(function () { bar.style.width = pct + '%'; });
      });
      resEl.focus();
    }
    nextBtn.addEventListener('click', function () {
      turn++;
      if (turn >= cfg.turns.length) { showResult(); return; }
      render();
      var first = $('.opt', optEl); if (first) first.focus();
    });
    render();
  }

  /* Name the fear (Section 02): the job question, asked in a 1:1 */
  makeDialogue({
    root: '#fearDialogue', log: '#fdLog', options: '#fdOptions', feedback: '#fdFeedback',
    progress: '#fdProgress', next: '#fdNext', result: '#fdResult', nudge: '#fdNudge', ask: '#fdAsk',
    them: 'Coordinator', you: 'You',
    grades: {
      3: { word: '✓ Strong move.', color: 'var(--vu-gold-flat)' },
      2: { word: '~ Half a move.', color: 'rgba(255,255,255,.85)' },
      1: { word: '✗ Costly move.', color: '#c76b5a' }
    },
    turns: [
      { line: 'Can I ask you something straight? This AI drafting thing. Is this how my job goes away? I’ve been doing these reports for twelve years.',
        opts: [
          { t: 'No. Absolutely not. Nobody is losing their job over a drafting tool. You have nothing to worry about.', pts: 1,
            reply: 'You can’t actually know that, though. Can you?',
            note: 'False certainty. You cannot know it, they know you cannot know it, and the first change of any size will spend the credibility this answer borrowed.' },
          { t: 'That’s a fair question, and I’d rather you ask it than carry it. What I know: the drafting part of the reports changes first, and there is no role decision on the table. What I don’t know yet: what the job looks like in a year. What I can promise: any role news, you hear from me first.', pts: 3,
            reply: '(A pause.) Okay. That’s more than anyone else has said.',
            note: 'Named, then framed with both parts: what you know, what you do not, and a promise you can keep. Every claim is checkable, which is what makes it believable.' },
          { t: 'That’s really a leadership question. I’ll find out what the plan is and get back to you.', pts: 2,
            reply: 'Sure. That’s what they said at my last place, right before the reorg.',
            note: 'Honest about your limits, and still a dodge. You confirmed the fear and answered nothing, and now the coordinator is alone with it.' }
        ]},
      { line: [
          'And when it does save time? Same output, fewer hours. I’ve seen that math before.',
          'Then here’s the real question. If the tool saves me ten hours a week, what are those hours for?',
          'Fine. But when it starts saving time, someone upstairs is going to notice. What then?'
        ],
        opts: [
          { t: 'Those hours have a name: the backlog we keep skipping and the intake follow-ups nobody gets to. And I want you in the room deciding what goes first, because you know this work better than anyone.', pts: 3,
            reply: [
              'Huh. The follow-ups. Nobody has touched those in a year. (A beat.) Okay. I’d want to be in that room.',
              'The follow-ups. Yeah. I’ve been saying that for two years.',
              'In the room. Okay. I’ll believe it when the invite shows up, but okay.'
            ],
            note: 'The saved-hours question, answered before fear answered it, plus an invitation into the design. Hours with a name do not get quietly cut.' },
          { t: 'Honestly? I don’t know yet. I’ll be straight with you when I do.', pts: 2,
            reply: [
              'That’s at least honest. (They do not look reassured.)',
              'Okay. I appreciate that. (A long pause.)',
              'Right.'
            ],
            note: 'Honest, and only half. Bare uncertainty leaves them alone with the fear you just confirmed. The missing half is where the hours go and what you promise.' },
          { t: 'Think of it as freeing you up for higher-value work. This is going to make your life easier.', pts: 1,
            reply: [
              '“Higher-value work.” That’s what the email said too.',
              'Easier. Sure. (The openness from a moment ago is gone.)',
              'That’s the line from the town hall.'
            ],
            note: 'Happy talk. “Higher-value work” has nothing checkable in it, and a twelve-year coordinator has heard it before. Fear did the interpreting.' }
        ]},
      { line: [
          'One more thing. If a role decision does come, ever. Do I hear it from you, or from an email?',
          'Then the one thing I need to know. If a role decision comes, do I hear it from you, or from an email?',
          'Okay. Last question, and then I’ll drop it. If a role decision comes, do I hear it from you, or from an email?'
        ],
        opts: [
          { t: 'From me, first, in person, with the team in the room. And I’m not answering this once. I’ll ask how it’s landing at every 1:1, and you can ask me this question as many times as you need.', pts: 3,
            reply: [
              'Okay. (They breathe out.) I’ll hold you to the 1:1 part.',
              'Okay. That helps. I might ask again next month.',
              'Okay. That’s the first thing today I actually believe.'
            ],
            note: 'A promise you can keep, and the fourth move, Hold, said out loud. Fear does not file your previous answers, so you told them the question stays open.' },
          { t: 'From me. I’ll make sure of it.', pts: 2,
            reply: ['Okay. Good.', 'Okay.', 'Okay. I guess we’ll see.'],
            note: 'The right promise, and it is checkable. What is missing is the hold: the question will come back, and you have not said it is welcome.' },
          { t: 'Let’s not get ahead of ourselves. There’s no decision, so there’s nothing to hear.', pts: 1,
            reply: ['There it is. (They close their notebook.)', 'Right. Sorry I asked.', 'Sure. Never mind.'],
            note: 'A deflection dressed as calm. They asked for one promise you could keep, and you gave them a reason to stop asking.' }
        ]}
    ],
    endings: {
      strong: { head: 'The container held. Nothing you said needs taking back.',
        text: 'You named the fear, framed it with both parts, put a name on the saved hours, invited them into the design, and kept the question open. The coordinator left with something checkable, which is the only reassurance that survives the next announcement.' },
      mid: { head: 'Half a container. Some truth, and one dodge.',
        text: 'One turn was a bare “I don’t know,” a deflection, or a promise without a hold. The coordinator heard some truth and is still deciding whether to believe it. The question will come back. Answer it fresh, both parts.' },
      weak: { head: 'Compliance over trust. They nodded, and that was all.',
        text: 'False certainty, happy talk, or a deflection at each turn, and a twelve-year coordinator has heard every one of them before. They will now make sure there are no saved hours, and the next change you announce starts from here.' }
    }
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
