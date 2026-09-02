/* =====================================================================
   COACHING FOR PERFORMANCE — classroom deck interactions
   (vanilla JS, no dependencies)
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
    // excluded margin — reveal them directly
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

  /* ---------- Hero video: 3-clip montage with graceful fallback ---------- */
  var heroVideo = $('#heroVideo');
  if (heroVideo) {
    var killVideo = function () { if (heroVideo) { heroVideo.remove(); heroVideo = null; } };
    if (reduce) {
      killVideo();
    } else {
      var playlist = [];
      try { playlist = JSON.parse(heroVideo.getAttribute('data-playlist') || '[]'); } catch (e) {}
      if (!playlist.length) {
        killVideo();
      } else {
        var clip = 0, failures = 0;
        var playClip = function (i) {
          if (!heroVideo) return;
          clip = ((i % playlist.length) + playlist.length) % playlist.length;
          heroVideo.src = playlist[clip];
          var p = heroVideo.play && heroVideo.play();
          if (p && p.catch) p.catch(function () { /* autoplay blocked; canvas remains */ });
        };
        heroVideo.addEventListener('ended', function () { failures = 0; playClip(clip + 1); });
        heroVideo.addEventListener('error', function () {
          failures++;
          if (failures >= playlist.length) { killVideo(); }
          else { playClip(clip + 1); }
        });
        playClip(0);
      }
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

  /* ---------- INTERACTIVE: coaching ratio meter (Section 01) ---------- */
  var ratio = $('#ratio');
  if (ratio) {
    var rSlider = $('#ratioSlider'), rOut = $('#ratioReadout'), rVal = $('#ratioVal');
    var rSamples = [
      'Full fix-it mode. Completely normal: you were promoted for having answers, and answers are what you’ve been giving. Today is about adding the other gear.',
      'One in five. Your team gets a coach on their calmest week. The busiest weeks, when growth matters most, they get a dispatcher.',
      'Two in five. You coach when there’s time and direct when there’s pressure, which means capability gets built only in the slow weeks.',
      'Three in five. A real coaching habit is forming. The next win is consistency: coaching on the deadline weeks, not just the quiet ones.',
      'Four in five. Strong. Today sharpens the craft: cleaner questions, a tighter structure, and a plan for the conversations you’re not having yet.',
      'Five for five. Either you’re the manager Project Oxygen was describing, or the slider is being generous. Either way, steal the question bank.'
    ];
    var updRatio = function () {
      var v = +rSlider.value;
      rOut.textContent = rSamples[v];
      rVal.textContent = v + ' of 5 were coaching';
    };
    rSlider.addEventListener('input', updRatio);
    updRatio();
  }

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

  /* Catch the style (Section 02) */
  makeTrainer({
    root: '#styleSpot', q: '#styleQ', options: '#styleOptions', feedback: '#styleFeedback',
    progress: '#styleProgress', next: '#styleNext', result: '#styleResult',
    progressWord: 'Line', goodColor: 'var(--vu-gold-flat)',
    resultColor: 'rgba(255,255,255,.85)', passAt: 4,
    passMsg: 'You can hear the styles. Now the harder rep: hearing them in your own sentences, mid-meeting.',
    failMsg: 'Close. The tells: an answer means directing, taking the work back means pacesetting, a genuine question means coaching.',
    labels: ['Directing', 'Pacesetting', 'Coaching'],
    items: [
      { q: '“Just move the deadline to Friday and tell the client it was a scoping issue.”',
        answer: 0, why: 'A complete answer, handed over. Directing: fast, clean, and zero capability built.' },
      { q: '“You know what, forget it, I’ll just write the summary myself tonight.”',
        answer: 1, why: 'Pacesetting: the work ships and the person learns that struggling means losing the assignment.' },
      { q: '“What does a good outcome look like to you here?”',
        answer: 2, why: 'An open question aimed at their thinking. Coaching, and notice it’s also the GROW Goal question.' },
      { q: '“Walk me through what you’ve already tried.”',
        answer: 2, why: 'Coaching again: it explores their reality instead of jumping to your answer. GROW’s R stage in the wild.' },
      { q: '“Here’s the deck I made for this exact situation last year. Just adapt it.”',
        answer: 1, why: 'Pacesetting in a helpful costume: your artifact becomes their ceiling. A coach would ask what THEY’D put in it first.' }
    ]
  });

  /* The converter (Section 04) */
  makeTrainer({
    root: '#qConvert', q: '#qcQ', options: '#qcOptions', feedback: '#qcFeedback',
    progress: '#qcProgress', next: '#qcNext', result: '#qcResult',
    progressWord: 'Line', goodColor: 'var(--vu-gold-flat)',
    resultColor: 'rgba(255,255,255,.85)', passAt: 4,
    passMsg: 'Your ear is calibrated. The three tests: open, clean of your answer, aimed at their thinking.',
    failMsg: 'Close. Watch for smuggled advice: if the question contains your solution, it’s not a question yet.',
    labels: [],
    items: [
      { q: 'The manager said: “Don’t you think you should just talk to them directly?”',
        opts: ['“What’s one way you could approach this?”', '“So are you going to talk to them or not?”', '“Wouldn’t a quick face-to-face solve this?”'],
        answer: 0, why: 'Open, clean, theirs. The other two are the same advice with more pressure applied.' },
      { q: 'The manager said: “You need to manage your time better.”',
        opts: ['“Have you tried time-blocking your calendar?”', '“What’s getting in the way of the schedule you want?”', '“Why are you always behind?”'],
        answer: 1, why: '“What’s getting in the way” explores their reality. Option A is your solution in disguise; option C is an accusation with a question mark.' },
      { q: 'The manager said: “Have you tried delegating more?”',
        opts: ['“Who on the team is underused right now, honestly?”', '“What’s on your plate that someone else could grow into?”', '“Delegating would free you up, right?”'],
        answer: 1, why: 'It opens THEIR thinking about the whole plate. Option A narrows to your framing; option C just asks them to agree with you.' },
      { q: 'The manager said: “This proposal is too long, cut it in half.”',
        opts: ['“What would the three-sentence version of this say?”', '“Do you really need all twelve pages?”', '“Can you shorten it by Friday?”'],
        answer: 0, why: 'It hands them the editing lens instead of the edit. The others are the same instruction with worse manners.' },
      { q: 'The manager said: “Just escalate it to facilities, that’s what they’re for.”',
        opts: ['“Shouldn’t facilities be handling this?”', '“Have you already emailed facilities?”', '“What options do you see, and which feels right to you?”'],
        answer: 2, why: 'Options and ownership in one breath. The other two check on your answer instead of finding theirs.' }
    ]
  });

  /* Past, future, or advice? (Section 05) */
  makeTrainer({
    root: '#ffSort', q: '#ffQ', options: '#ffOptions', feedback: '#ffFeedback',
    progress: '#ffProgress', next: '#ffNext', result: '#ffResult',
    progressWord: 'Line', goodColor: 'var(--vu-oak)',
    resultColor: 'var(--ink-soft, #555)', passAt: 4,
    passMsg: 'Sharp ear. In the triad exercise, you’re now the one who can keep everyone honest.',
    failMsg: 'Close. The test is the timeline: feedforward lives entirely in next time. Any visit to last week breaks it.',
    labels: ['Feedback about the past', 'Feedforward', 'Advice in disguise'],
    items: [
      { q: '“Next time, you could open the meeting with the decision you need from the group.”',
        answer: 1, why: 'Future-focused, concrete, and about next time. Textbook feedforward.' },
      { q: '“In Tuesday’s meeting you let the discussion wander for twenty minutes.”',
        answer: 0, why: 'A trip to Tuesday. It might be true and useful, but it’s feedback, and it invites defense.' },
      { q: '“You should really use my agenda template, it fixed this for me.”',
        answer: 2, why: 'It points forward, but it’s your solution being installed, not a suggestion they can weigh. Feedforward offers; it doesn’t prescribe.' },
      { q: '“One idea: try asking the quietest person for their view before opening the floor.”',
        answer: 1, why: 'An offer about the future, theirs to take or leave. This is the move.' },
      { q: '“Honestly, the last three retros ran long because you didn’t timebox.”',
        answer: 0, why: 'Three trips to the past and a diagnosis. Whatever follows now lands on raised shields.' }
    ]
  });

  /* Match the model (Section 06) */
  makeTrainer({
    root: '#modelMatch', q: '#mmQ', options: '#mmOptions', feedback: '#mmFeedback',
    progress: '#mmProgress', next: '#mmNext', result: '#mmResult',
    progressWord: 'Coachee', goodColor: 'var(--vu-gold-flat)',
    resultColor: 'rgba(255,255,255,.85)', passAt: 3,
    passMsg: 'You’re choosing structure on purpose now. That’s the whole skill; the models are just vocabulary.',
    failMsg: 'Close. The tells: everyday topic → GROW. Ongoing relationship needing ground rules → CLEAR. Stuck in problem-analysis → OSKAR.',
    labels: ['GROW', 'CLEAR', 'OSKAR'],
    items: [
      { q: 'A solid performer wants to talk through whether to apply for an open team-lead role.',
        answer: 0, why: 'A classic one-off coaching conversation with real options. GROW handles it end to end.' },
      { q: 'You’re starting monthly development sessions with a new direct report and want to set expectations for how they’ll work.',
        answer: 1, why: 'The distinctive need is the up-front agreement and the review cycle. That’s CLEAR’s Contract and Review.' },
      { q: 'A team member has spent three one-on-ones analyzing why the vendor relationship is broken, and is no closer to acting.',
        answer: 2, why: 'Stuck in problem-analysis. OSKAR’s scaling flips them to what’s already working: “you’re at a 4; what’s keeping it from being a 2?”' },
      { q: 'Someone brings you a scheduling conflict between two projects and wants to think through what to do this week.',
        answer: 0, why: 'Everyday topic, single conversation, multiple workable answers. GROW is the default for a reason.' }
    ]
  });

  /* ---------- INTERACTIVE: the GROW simulator (Coach Jordan) ---------- */
  var growSim = $('#growSim');
  if (growSim) {
    var STAGES = [
      { name: 'G · Goal',
        coachee: '“Honestly? I’m drowning. Everything on my plate feels urgent and I don’t even know where to start.”',
        opts: [
          { t: '“Start with the Henderson report. It’s the most visible thing you own.”', pts: 1,
            reply: '“Okay… I guess. What should I do after that?”',
            note: 'You answered, so now every next step is also yours to answer. The problem just became your problem.' },
          { t: '“Is this about workload?”', pts: 2,
            reply: '“Sort of. Maybe. I don’t know.”',
            note: 'Closed question, one-word energy. True, but the conversation didn’t move.' },
          { t: '“If the next half hour were really useful, what would we walk out of here with?”', pts: 3,
            reply: 'Jordan pauses, then sits back. “…A way to decide what actually matters this quarter. That’s what I need.”',
            note: 'A goal, named by them, in their words. The conversation now has a destination they own.' }
        ]},
      /* From Reality on, Jordan's opening line is an array indexed by the points of the previous pick:
         [after a directive line (compliant, passive), after a closed question (flat), after an open question (thinking)]. */
      { name: 'R · Reality',
        coachee: [
          '“Okay. The Henderson report. So… do I drop the other stuff, or just do it after? Whatever you think.”',
          '“I mean, yeah, it’s workload. The requests never stop. Three teams think I work for them.” Jordan checks the time.',
          '“Okay, so, what actually matters this quarter. Honest answer: I don’t know, because the requests never stop. Three teams think I work for them.”'
        ],
        opts: [
          { t: '“You’re overcommitted. That’s the reality, plain and simple.”', pts: 1,
            reply: '“I mean… maybe? It’s more complicated than that.”',
            note: 'That was your diagnosis, not their discovery. Verdicts about reality get contested, even correct ones.' },
          { t: '“What’s actually on your plate right now, and which pieces are driving the urgency?”', pts: 3,
            reply: 'Jordan starts listing, then stops. “Wait. Two of these aren’t even due this month. Huh.”',
            note: 'They looked at their own reality and found something. That’s what the R stage is for.' },
          { t: '“Have you tried making a list?”', pts: 2,
            reply: '“…Yes. I have a list. The list is the problem.”',
            note: 'Advice wearing a question mark, and slightly beneath their capability. Notice the temperature drop.' }
        ]},
      { name: 'O · Options',
        coachee: [
          '“Right. Overcommitted. So… what do you want me to cut?”',
          '“The list is still the list. I guess I need to push back on some of this. Somehow.”',
          'Jordan is still looking at the list. “Two of these can wait. So it’s the other four. I need to push back somewhere, I just don’t know where yet.”'
        ],
        opts: [
          { t: '“Here’s what I’d do: tell the ops team you’re out until Q3.”', pts: 1,
            reply: '“Oh. Okay, if you think that’s best, I can do that.”',
            note: 'They’ll comply, and if it goes badly it was YOUR plan. Compliance isn’t commitment.' },
          { t: '“What could you do? …And what else? …And what else?”', pts: 3,
            reply: 'By the third “what else,” Jordan is writing. “Okay, that’s four options, and honestly the last one is the best one.”',
            note: 'The fourth option is usually better than the first. The only way to reach it is to keep asking.' },
          { t: '“Would delegating the reporting piece to Sam work?”', pts: 2,
            reply: '“Maybe? Sam’s pretty busy too though.”',
            note: 'One option, yours, framed for a yes or no. It shrank the option space instead of growing it.' }
        ]},
      { name: 'W · Will',
        coachee: [
          '“Okay. I’ll tell ops I’m out until Q3. Do you want me to copy you on that, or…?”',
          '“Maybe Sam, if Sam has time. So… I guess I’ll see how it goes.”',
          'Jordan taps the fourth option. “This one. If I take the priority list to my leads, the rest sorts itself out. I think I know what to do about this quarter.”'
        ],
        opts: [
          { t: '“Great, so we’re agreed: do the top three and drop the rest.”', pts: 1,
            reply: '“…Sure. Agreed.”',
            note: 'You closed the deal on their behalf. Watch how quietly ownership just changed hands.' },
          { t: '“So… do you feel better about things?”', pts: 2,
            reply: '“Yeah, this helped, thanks!” Jordan leaves. Nothing was decided.',
            note: 'A pleasant ending is not a commitment. Feelings improved; the calendar didn’t.' },
          { t: '“What will you do first, by when? And 1 to 10, how committed are you?”', pts: 3,
            reply: '“I’ll draft the priority list tonight and take it to my leads tomorrow. Commitment? Nine.”',
            note: 'Specific action, a date, and a number. Under 8 you’d keep coaching; a 9 means the plan is truly theirs.' }
        ]}
    ];
    var gsStage = 0, gsScore = 0, gsLocked = false;
    var gsLast = 3;            // points of the previous pick; selects Jordan's next opening line
    var gsLog = [], gsPending = [];   // the transcript so far, and the exchange still on screen
    var gsStageEl = $('#growStage'), gsCoachee = $('#growCoachee'), gsOpts = $('#growOptions'),
        gsFb = $('#growFeedback'), gsNext = $('#growNext'), gsRes = $('#growResult'), gsLogEl = $('#growLog');
    var gsNav = $('#growSim .quiz__nav');
    var gsSolo = growSim.hasAttribute('data-solo');   // self-paced edition: no partner in the room
    function gsOpening(S) {
      if (!Array.isArray(S.coachee)) return S.coachee;
      return S.coachee[Math.max(0, Math.min(S.coachee.length - 1, gsLast - 1))];
    }
    function gsDrawLog() {
      if (!gsLogEl) return;
      gsLogEl.innerHTML = gsLog.map(function (l) {
        return '<p class="' + (l.you ? 'you' : 'them') + '"><b>' + (l.you ? 'You' : 'Jordan') + ':</b> ' + l.text + '</p>';
      }).join('');
      gsLogEl.hidden = gsLog.length === 0;
    }
    function gsRender() {
      gsLocked = false;
      var S = STAGES[gsStage];
      var opening = gsOpening(S);
      gsStageEl.textContent = 'Stage ' + (gsStage + 1) + ' of 4 · ' + S.name;
      gsCoachee.innerHTML = '<b>Jordan:</b> ' + opening;
      gsPending = [{ text: opening }];
      gsFb.textContent = '';
      gsNext.style.visibility = 'hidden';
      gsNext.textContent = gsStage === STAGES.length - 1 ? 'See how the conversation went' : 'Continue the conversation';
      gsOpts.innerHTML = '';
      S.opts.forEach(function (o, i) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'opt';
        b.innerHTML = '<span class="mark">' + String.fromCharCode(65 + i) + '</span><span>' + o.t + '</span>';
        b.addEventListener('click', function () {
          if (gsLocked) return; gsLocked = true;
          gsScore += o.pts;
          gsLast = o.pts;
          gsPending.push({ you: true, text: o.t }, { text: o.reply });
          var best = S.opts.reduce(function (m, x) { return x.pts > m.pts ? x : m; }, S.opts[0]);
          $$('.opt', gsOpts).forEach(function (x, xi) {
            x.setAttribute('disabled', 'true');
            if (S.opts[xi] === best) x.classList.add('correct');
          });
          if (o !== best) b.classList.add('wrong');
          gsCoachee.innerHTML = '<b>Jordan:</b> ' + o.reply;
          gsFb.textContent = (o.pts === 3 ? '✓ ' : o.pts === 2 ? '△ ' : '✗ ') + o.note;
          gsFb.style.color = o.pts === 3 ? 'var(--vu-oak)' : o.pts === 2 ? '#946E24' : '#c76b5a';
          gsNext.style.visibility = 'visible';
        });
        gsOpts.appendChild(b);
      });
    }
    gsNext.addEventListener('click', function () {
      gsLog = gsLog.concat(gsPending); gsPending = [];
      gsDrawLog();
      gsStage++;
      if (gsStage >= STAGES.length) {
        gsNav.style.display = 'none';
        gsStageEl.textContent = ''; gsCoachee.innerHTML = ''; gsOpts.innerHTML = ''; gsFb.textContent = '';
        var pct = Math.round((gsScore / 12) * 100);
        var tier = gsScore >= 11 ? 'strong' : gsScore >= 8 ? 'mid' : 'weak';
        var head = tier === 'strong' ? 'Jordan left owning a plan they built. That’s a coaching conversation.'
                 : tier === 'mid' ? 'A mixed session: some discovery, some directing. Jordan has next steps, but how many are really theirs?'
                 : 'Jordan left with your plan and your problem-ownership. Congratulations: their workload is now on your desk too.';
        var nudge = gsSolo
          ? '<b>Now the real thing:</b> your next 1:1 is this conversation with a human, and humans improvise.'
          : '<b>Now the real thing:</b> the pair roleplay below runs this exact conversation with a human, and humans improvise.';
        gsRes.hidden = false;
        gsRes.innerHTML = '<div class="quiz__score gold-text">' + gsScore + ' / 12</div>' +
          '<p style="margin-top:.75rem;color:var(--ink-soft,#555)">' + head + '</p>' +
          '<p class="why" style="margin-top:.75rem">' + (tier === 'strong'
            ? nudge
            : '<b>Run it again:</b> this time, pick the option that keeps the thinking on Jordan’s side of the table.') + '</p>' +
          '<button type="button" class="btn btn--ghost" id="growRetry" style="margin-top:1rem">Coach Jordan again</button>';
        $('#growRetry').addEventListener('click', function () {
          gsStage = 0; gsScore = 0; gsLast = 3; gsLog = []; gsPending = []; gsRes.hidden = true;
          gsDrawLog();
          gsNav.style.display = '';
          gsRender();
        });
      } else gsRender();
    });
    gsRender();
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

  /* ---------- INTERACTIVE: My Coaching Plan capstone ---------- */
  var planEl = $('#coachPlan');
  if (planEl) {
    var pick = { model: null, trap: null, when: null };
    var whoIn = $('#planWho'), buildBtn = $('#planBuild'), statusEl2 = $('#planStatus'), outEl2 = $('#planOut');
    function planReady() {
      var ok = whoIn.value.trim().length >= 8 && pick.model && pick.trap && pick.when;
      buildBtn.disabled = !ok;
      statusEl2.textContent = ok ? 'Ready, build it' : 'Fill in all four parts';
      return ok;
    }
    whoIn.addEventListener('input', planReady);
    [['#planModel', 'model', 'data-model'], ['#planTrap', 'trap', 'data-trap'], ['#planWhen', 'when', 'data-when']].forEach(function (cfg) {
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
    var MODEL = {
      grow: { name: 'GROW', opener: '“What would make this conversation most useful to you?”',
        map: 'Goal, then Reality, then at least four Options (“what else?” three times), then Will: what, by when, commitment 1 to 10.' },
      clear: { name: 'CLEAR', opener: '“Before we dive in: what do you want from these conversations, and what do you want from me in them?”',
        map: 'Contract the ground rules first, Listen longer than feels natural, Explore before solving, agree Actions, and book the Review.' },
      oskar: { name: 'OSKAR', opener: '“If this were completely sorted, what would that look like? And where are you now, 1 to 10?”',
        map: 'Outcome first, Scale it, dig for the Know-how already working, Affirm it and agree Action, then Review next session.' }
    };
    var TRAP = {
      advice: 'You jump in with the answer. Counter-move: when you feel it rising, write it down instead of saying it. If it still matters at the end, offer it as one option among theirs.',
      leading: 'Your questions smuggle advice. Counter-move: before asking, run the test: does this question contain my solution? If yes, trade it for “what could you do?”',
      silence: 'You fill the silence. Counter-move: after every question, count six seconds in your head. The silence is them thinking; interrupting it buys the problem back.'
    };
    var WHEN = { tomorrow: 'tomorrow', threedays: 'within the next 3 days', week: 'within 7 days' };
    buildBtn.addEventListener('click', function () {
      if (!planReady()) return;
      var who = whoIn.value.trim();
      var m = MODEL[pick.model];
      var rows = '' +
        '<div class="row"><b>The conversation</b><span>' + who.replace(/</g, '&lt;') + '</span></div>' +
        '<div class="row"><b>My model</b><span>' + m.name + '. ' + m.map + '</span></div>' +
        '<div class="row"><b>My opening question</b><span class="plan__prompt">' + m.opener + '</span></div>' +
        '<div class="row"><b>My trap &amp; counter-move</b><span>' + TRAP[pick.trap] + '</span></div>' +
        '<div class="row"><b>What I will NOT do</b><span>Give advice uninvited, solve it for them, interrupt the silence, or talk more than they do.</span></div>' +
        '<div class="row"><b>The commitment</b><span>I will run this conversation ' + WHEN[pick.when] + ', and I will tell one colleague which model I’m using.</span></div>';
      outEl2.innerHTML = '<span class="tag">My coaching plan</span>' +
        '<div class="plan__out-grid">' + rows + '</div>' +
        '<div class="lab__runrow" style="margin-top:1.25rem">' +
        '<button class="btn" id="planCopy">Copy my plan</button>' +
        '<span class="quiz__progress" id="planCopied" style="color:rgba(255,255,255,.6)">Book the calendar slot while it’s open</span></div>';
      outEl2.hidden = false;
      $('#planCopy').addEventListener('click', function () {
        var text = 'MY COACHING PLAN (Coaching for Performance, Vanderbilt)\n' +
          'The conversation: ' + who + '\n' +
          'Model: ' + m.name + '. ' + m.map + '\n' +
          'Opening question: ' + m.opener + '\n' +
          'Trap & counter-move: ' + TRAP[pick.trap] + '\n' +
          'I will NOT: give advice uninvited, solve it for them, interrupt the silence, or talk more than they do.\n' +
          'Commitment: ' + WHEN[pick.when] + '. Tell one colleague which model I’m using.';
        (navigator.clipboard ? navigator.clipboard.writeText(text) : Promise.reject()).then(function () {
          $('#planCopied').textContent = 'Copied. Paste it into notes or email, then send the invite.';
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
      { q: 'Google’s Project Oxygen found the #1 behavior of its best managers was…',
        opts: ['Deep technical expertise', 'Being a good coach', 'Making decisions fastest', 'Working the longest hours'],
        correct: 1, why: 'Coaching topped the list, ahead of technical skill and decisiveness. Growing people beat directing work.' },
      { q: 'In GROW, the "what else?" question belongs to which stage, and why does it matter?',
        opts: ['Goal, to widen the topic', 'Options, because the fourth idea usually beats the first', 'Reality, to gather more facts', 'Will, to add backup plans'],
        correct: 1, why: 'Options is where breadth lives. Stopping at the first idea is the most common way GROW gets rushed.' },
      { q: 'Which of these is a powerful question, by the ICF’s tests?',
        opts: ['"Have you tried talking to them?"', '"Don’t you think a schedule would help?"', '"What matters most to you in how this turns out?"', '"Did you finish the draft?"'],
        correct: 2, why: 'Open, clean of the asker’s answer, aimed at their thinking. The others are advice or status checks in disguise.' },
      { q: 'In Goldsmith’s Feedforward, the receiver of suggestions may respond only with…',
        opts: ['A brief explanation of context', '"Thank you"', 'One counter-argument', 'A rating of each idea'],
        correct: 1, why: 'Two words, no defense, no explaining. That rule is what makes honest suggestions safe to give.' },
      { q: 'A coachee has analyzed a problem for weeks and can’t start acting. Best-fit structure?',
        opts: ['GROW', 'CLEAR', 'OSKAR', 'More analysis'],
        correct: 2, why: 'OSKAR’s solution-focus and scaling ("you’re at a 4; what’s already working?") is built for exactly this stuckness.' },
      { q: 'Your team’s payroll deadline is in two hours and a new hire doesn’t know the process. You should…',
        opts: ['Run a GROW conversation about it', 'Ask "what options do you see?"', 'Direct: show them the steps now, coach another day', 'Send them the policy library link'],
        correct: 2, why: 'Emergency, compliance, novice: three signals for directing. Situational coaching means matching the mode to the moment.' }
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
      var msg = pct >= 80 ? 'You have the toolkit. Jordan was practice; your real coachee is waiting.' :
                pct >= 50 ? 'Solid start. Revisit the sections you missed before your conversation.' :
                            'Worth another pass through the deck before the real thing.';
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
