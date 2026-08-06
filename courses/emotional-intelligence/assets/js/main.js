/* =====================================================================
   EMOTIONAL INTELLIGENCE & INTERPERSONAL SKILLS — classroom deck
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

  /* Guess the number (Section 01) */
  makeTrainer({
    root: '#statGuess', q: '#sgQ', options: '#sgOptions', feedback: '#sgFeedback',
    progress: '#sgProgress', next: '#sgNext', result: '#sgResult',
    progressWord: 'Finding', goodColor: 'var(--vu-oak)',
    resultColor: 'var(--ink-soft, #555)', passAt: 3,
    passMsg: 'You called the research. The pattern in every number: this skill is bigger than its reputation.',
    failMsg: 'Most rooms miss these, and that IS the finding: we systematically underestimate the "soft" skill the data says matters most.',
    labels: [],
    items: [
      { q: 'Tasha Eurich\'s research: what share of people BELIEVE they\'re self-aware, versus the share who actually are?',
        opts: ['95% believe it; 10 to 15% actually are', '60% believe it; 40% actually are', '75% believe it; half actually are'],
        answer: 0, why: 'The self-awareness gap is a canyon: 95 percent believe, 10 to 15 percent demonstrate it. Which means the odds say everyone in this room has a blind spot in play.' },
      { q: 'DDI\'s leadership research: leaders who master empathy perform how much higher in coaching, engaging others, and decision-making?',
        opts: ['About 10% higher', 'More than 40% higher', 'About the same, empathy is neutral'],
        answer: 1, why: 'More than 40 percent higher. Empathy isn\'t a personality garnish; it\'s a measured performance multiplier.' },
      { q: 'McKinsey\'s wage analysis of 10.2 million job postings: how does pay for hard skills (like Python) compare to soft skills (like communication)?',
        opts: ['Roughly equal', 'Hard skills pay about 30% more', 'Hard skills pay more than double'],
        answer: 2, why: 'More than double ($79k vs $40k mean returns), even as demand for social-emotional skills grows about 26 percent. The market underprices what it says it wants; people who build it anyway get the arbitrage.' },
      { q: 'SHRM\'s national survey: what ranked as the single largest driver of job satisfaction, above pay and job security?',
        opts: ['Career advancement opportunities', 'Respectful treatment of all employees', 'Flexible schedules'],
        answer: 1, why: 'Respect beat money. And respect is delivered or destroyed in exactly the interpersonal moments this session trains.' }
    ]
  });

  /* Name the domain (Section 02) */
  makeTrainer({
    root: '#domainSpot', q: '#dsQ', options: '#dsOptions', feedback: '#dsFeedback',
    progress: '#dsProgress', next: '#dsNext', result: '#dsResult',
    progressWord: 'Scene', goodColor: 'var(--vu-gold-flat)',
    resultColor: 'rgba(255,255,255,.85)', passAt: 4,
    passMsg: 'You can see the model in the wild. Now the harder rep: seeing it in your own last meeting.',
    failMsg: 'Close. The tells: noticing your own state → self-awareness. Steering your reaction → self-management. Reading others → social awareness. Moving the relationship → relationship management.',
    labels: ['Self-awareness', 'Self-management', 'Social awareness', 'Relationship management'],
    items: [
      { q: 'Mid-meeting, a director notices their jaw is tight and their replies are getting clipped, and thinks: "I\'m still irritated from the last call."',
        answer: 0, why: 'Catching your own state as it happens, and naming its source: self-awareness, the foundation domain.' },
      { q: 'Having noticed it, the director takes a slow breath and deliberately asks a question instead of firing back the correction that was loaded.',
        answer: 1, why: 'The pause, the chosen response over the reflex: self-management. Notice it could only happen AFTER the noticing.' },
      { q: 'A team lead senses the new analyst has gone quiet since the reorg was mentioned, though the analyst has said nothing about it.',
        answer: 2, why: 'Reading an unspoken state from tone and behavior: social awareness. The data was there; the lead was receiving.' },
      { q: 'After the meeting, that lead stops by: "I noticed you got quiet when the reorg came up. Want to talk it through?"',
        answer: 3, why: 'Turning what was read into connection and trust: relationship management, where the first three domains pay off.' },
      { q: 'A manager keeps a running note of which meetings leave them drained versus energized, hunting the pattern.',
        answer: 0, why: 'Systematic self-observation: self-awareness again, and exactly the kind of practice Eurich found the genuinely self-aware actually do.' }
    ]
  });

  /* Upgrade the label (Section 04) */
  makeTrainer({
    root: '#labelUp', q: '#luQ', options: '#luOptions', feedback: '#luFeedback',
    progress: '#luProgress', next: '#luNext', result: '#luResult',
    progressWord: 'Moment', goodColor: 'var(--vu-gold-flat)',
    resultColor: 'rgba(255,255,255,.85)', passAt: 4,
    passMsg: 'High granularity. Precise labels carry instructions; you\'re reading them.',
    failMsg: 'Close. The test: the right label names the specific feeling AND points at its cause, which is what tells you the next move.',
    labels: [],
    items: [
      { q: 'Your project got reassigned in a meeting you weren\'t invited to. You tell a friend you\'re "stressed." What\'s the precise label?',
        opts: ['Busy, there\'s just a lot on', 'Blindsided, and disrespected that it happened without me', 'Tired, it\'s been a long week'],
        answer: 1, why: '"Blindsided and disrespected" names the injury and points at the fix: a conversation about process and inclusion. "Stressed" points at nothing.' },
      { q: 'A colleague got public credit for analysis you did. You\'d say you\'re "annoyed." Upgrade it.',
        opts: ['Unappreciated, and wary of collaborating with them again', 'Angry at everything today', 'Fine, honestly, it\'s not a big deal'],
        answer: 0, why: '"Unappreciated and wary" tells you what\'s at stake (recognition, trust) and what to protect next time. "Fine" is the label that guarantees a repeat.' },
      { q: 'Your proposal got tough questions from leadership and you can\'t stop replaying it. "Bad day" is the vague label. The precise one?',
        opts: ['Embarrassed, and worried it damaged my credibility', 'Furious at the panel', 'Bored of presenting'],
        answer: 0, why: '"Embarrassed and worried about credibility" is checkable (did it, actually?) and actionable (follow up with the toughest questioner). The vague label just replays the tape.' },
      { q: 'A teammate keeps missing handoffs and tonight\'s is late again. You notice you\'re "irritated." Go one level deeper.',
        opts: ['Hungry, probably', 'Resentful that I keep absorbing the slack, and anxious about Friday\'s deadline', 'Confused about the project goals'],
        answer: 1, why: 'Resentment about absorbed slack plus deadline anxiety points straight at the NVC conversation in the next section. Irritation just simmers.' },
      { q: 'You\'re about to give your first big presentation and describe yourself as "nervous." The upgrade that actually helps?',
        opts: ['Terrified, full stop', 'Excited AND nervous, my body is ready even if my head is loud', 'Numb, feeling nothing'],
        answer: 1, why: 'Mixed labels are high granularity: naming the excitement alongside the nerves reframes arousal as readiness, which performance research consistently favors.' }
    ]
  });

  /* Rate the reply (Section 05) */
  makeTrainer({
    root: '#replyRate', q: '#rrQ', options: '#rrOptions', feedback: '#rrFeedback',
    progress: '#rrProgress', next: '#rrNext', result: '#rrResult',
    progressWord: 'Moment', goodColor: 'var(--vu-oak)',
    resultColor: 'var(--ink-soft, #555)', passAt: 4,
    passMsg: 'Your ear is calibrated. In the triad drill, you\'ll find doing it is harder than hearing it; that gap is the practice.',
    failMsg: 'Close. The tells of real listening: it paraphrases, clarifies, or reflects emotion. The imposters give advice, tell their own story, or judge.',
    labels: [],
    items: [
      { q: 'Colleague: "I\'m drowning in this migration project and nobody upstairs seems to care." Which reply is listening?',
        opts: ['"You should really talk to your director about resourcing."', '"So the workload\'s crushing and what makes it worse is feeling invisible. Is that right?"', '"Oh I know, my migration last year was even worse, let me tell you…"'],
        answer: 1, why: 'Paraphrase plus reflected emotion, ending in a check. Option A is advice (nobody asked), option C makes it about you.' },
      { q: 'Direct report: "I don\'t think the new process is working, but maybe it\'s just me." The listening reply?',
        opts: ['"It\'s not just you, that process is a mess."', '"It\'s definitely just you, everyone else is fine."', '"Say more about what\'s not working; what are you running into?"'],
        answer: 2, why: 'A clarifying question that opens the door. Both other options pass judgment before understanding, in opposite directions.' },
      { q: 'Peer: "Honestly, I\'m thinking about applying for the team-lead opening, but I keep talking myself out of it." Listening?',
        opts: ['"You\'d be great, definitely apply, want me to talk to the director?"', '"What\'s the talking-out voice saying?"', '"That job\'s a headache, trust me, you don\'t want it."'],
        answer: 1, why: 'The question invites them to explore their own hesitation. The cheerleading and the warning both end the exploration; they\'re verdicts wearing kindness.' },
      { q: 'Team member, voice tight: "Fine. We\'ll just do it your way, like always." Which reply is listening?',
        opts: ['"Great, glad that\'s settled."', '"It sounds like you feel steamrolled, and I don\'t want that. What am I missing about your approach?"', '"Don\'t take that tone; we agreed as a team."'],
        answer: 1, why: 'It reflects the unspoken emotion and reopens the question with a genuine ask. Options A and C hear the words and miss the message entirely.' },
      { q: 'Colleague finishes a long, tangled story about a conflict with a vendor and stops, looking at you. The best FIRST move?',
        opts: ['A three-second pause, then: "let me make sure I followed; the breach of trust was when they re-quoted after agreeing?"', 'Immediately: "here\'s what I\'d do."', '"Wow. Anyway, did you see the email about parking?"'],
        answer: 0, why: 'The pause plus a paraphrase-check. The silence right after someone finishes is where listening is won or lost, and it\'s the hardest three seconds in the skill.' }
    ]
  });

  /* Judge the opener (Section 07) */
  makeTrainer({
    root: '#candorJudge', q: '#cjQ', options: '#cjOptions', feedback: '#cjFeedback',
    progress: '#cjProgress', next: '#cjNext', result: '#cjResult',
    progressWord: 'Opener', goodColor: 'var(--vu-oak)',
    resultColor: 'var(--ink-soft, #555)', passAt: 4,
    passMsg: 'You can hear the target quadrant: direct about the work, unmistakably on the same team. Now draft your own in the group activity.',
    failMsg: 'Close. The tells: candor with care names the shared goal, addresses the WORK, and ends in a real question. Harshness attacks the person; avoidance never lands the point.',
    labels: ['Candor with care', 'Harsh, care is missing', 'Avoidance dressed as kindness'],
    items: [
      { q: '"We both want this launch to land, so I need to be straight: the current approach is putting the date at risk. Can I walk you through what I\'m seeing?"',
        answer: 0, why: 'Shared goal named, concern aimed at the work, real invitation at the end. This is Edmondson\'s candor with care, whole.' },
      { q: '"I don\'t know how to say this nicely: your plan isn\'t working and everyone can see it but you."',
        answer: 1, why: '"Everyone but you" attacks the person and recruits a phantom audience. The candor is real; the care never showed up, so neither will the learning.' },
      { q: '"Hey, amazing work as always! Just tiny thought, no big deal at all, maybe someday we could possibly revisit some of the approach stuff? Totally fine if not!"',
        answer: 2, why: 'So padded the message never lands. Edmondson\'s point exactly: this "niceness" isn\'t safety, it\'s the withholding of information someone needs to learn.' },
      { q: '"The integration tests have failed three days straight. I think the approach needs to change, and I might be missing context. What\'s your read?"',
        answer: 0, why: 'Camera-true observation, owned interpretation, genuine question. Direct AND respectful; notice it borrowed the NVC observation move.' },
      { q: '"Sure, the approach is fine, I guess. Whatever you think is best."',
        answer: 2, why: 'Withheld candor with a side of resignation. The project inherits the unspoken problem, and Aristotle\'s finding predicts exactly this team\'s ceiling.' }
    ]
  });

  /* ---------- INTERACTIVE: Johari mapper (private) ---------- */
  var joh = $('#johariMap');
  if (joh) {
    var jOpen = $('#johOpen'), jHidden = $('#johHidden'), jBlind = $('#johBlind'),
        jBtn = $('#johBuild'), jStatus = $('#johStatus'), jOut = $('#johOut');
    var johReady = function () {
      var ok = jOpen.value.trim().length >= 5 && jHidden.value.trim().length >= 5 && jBlind.value.trim().length >= 5;
      jBtn.disabled = !ok;
      jStatus.textContent = ok ? 'Ready, map it' : 'Fill in all three';
      return ok;
    };
    [jOpen, jHidden, jBlind].forEach(function (el) { el.addEventListener('input', johReady); });
    jBtn.addEventListener('click', function () {
      if (!johReady()) return;
      var esc = function (t) { return t.replace(/</g, '&lt;'); };
      jOut.innerHTML = '<span class="tag">My Johari window · private</span>' +
        '<div class="plan__out-grid">' +
        '<div class="row"><b>Open (you + others see it)</b><span>' + esc(jOpen.value.trim()) + '</span></div>' +
        '<div class="row"><b>Hidden (only you know)</b><span>' + esc(jHidden.value.trim()) + ' — shared selectively, this builds trust; that\'s the disclosure lever.</span></div>' +
        '<div class="row"><b>Blind (they see, you suspect)</b><span>' + esc(jBlind.value.trim()) + ' — you\'ve heard this more than once, which Eurich\'s research says is the signal worth sitting with.</span></div>' +
        '<div class="row"><b>Unknown (no one yet)</b><span>Opens through new challenges and honest reflection. The quadrant stretch assignments live in.</span></div>' +
        '<div class="row"><b>The move</b><span>Ask one trusted colleague this week: "What\'s one thing I do that gets in my own way?" Then only say thank you.</span></div>' +
        '</div>';
      jOut.hidden = false;
      jOut.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'nearest' });
    });
  }

  /* ---------- INTERACTIVE: NVC Reframe Lab ---------- */
  var lab = $('#nvcLab');
  if (lab) {
    var SLOTS = [
      { key: 'Observation', opts: [
        { t: '"You never tell me what\'s going on."', pts: 1, coach: '"Never" is a verdict, not an observation. A camera has no opinion about "never."' },
        { t: '"Communication on this project has been bad."', pts: 2, coach: '"Bad" is still a judgment wearing a lab coat. Whose standard? Says who?' },
        { t: '"I haven\'t gotten a status update on this project in two weeks."', pts: 3, coach: 'A camera would agree. Nothing to dispute means nothing to defend.' }]},
      { key: 'Feeling', opts: [
        { t: '"I feel like you don\'t respect my time."', pts: 1, coach: '"I feel like you…" is a diagnosis of them, not a feeling of yours. Classic faux feeling.' },
        { t: '"I feel ignored."', pts: 2, coach: 'Closer, but "ignored" still assigns them a motive. What\'s the feeling under it?' },
        { t: '"I\'m feeling anxious, because I can\'t see where things stand."', pts: 3, coach: 'An owned emotion with its cause. Nobody can argue with your anxiety; they can only hear it.' }]},
      { key: 'Need', opts: [
        { t: '"I need you to be a better communicator."', pts: 1, coach: 'That\'s a character renovation request, not a need. It puts them on trial.' },
        { t: '"I need more updates."', pts: 2, coach: 'Getting there, but "more" is fog. What does the need actually serve?' },
        { t: '"I need visibility into the timeline so I can plan my own team\'s work."', pts: 3, coach: 'A universal, legitimate need with its reason attached. Needs framed this way recruit help instead of resistance.' }]},
      { key: 'Request', opts: [
        { t: '"So keep me in the loop from now on, okay?"', pts: 1, coach: 'Vague and edged: a demand in casual clothes. What would "in the loop" even mean by Friday?' },
        { t: '"Could you update me more often?"', pts: 2, coach: 'Polite but unmeasurable. "More often" will mean different things to each of you by next week.' },
        { t: '"Would you be willing to do a ten-minute check-in every Friday?"', pts: 3, coach: 'Specific, scheduled, and genuinely declinable, which is what makes it a request instead of a demand.' }]}
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
          statusEl.textContent = ready ? 'Ready, say it' :
            'Choose ' + picks.filter(function (p) { return p === null; }).length + ' more part(s)';
          outEl.hidden = true;
        });
        d.appendChild(b);
      });
      slotsEl.appendChild(d);
    });
    var REACTIONS = {
      strong: '"Oh. I honestly didn\'t realize it had been two weeks. Friday check-ins work; I\'ll send the invite." They\'re solving with you, and notice: nobody had to lose.',
      mid: '"Okay… I mean, I can try to communicate more, I guess." Partial movement, mild defensiveness. The vague parts of your message left them guessing at what would actually help.',
      weak: '"Wow. I\'ve literally been slammed covering for two people, but sure, I\'m the problem." Full defense mode: the judgments in your message gave them a verdict to fight instead of a need to meet.'
    };
    runBtn.addEventListener('click', function () {
      var score = picks.reduce(function (t, p, i) { return t + SLOTS[i].opts[p].pts; }, 0); // 4..12
      var pct = Math.round((score / 12) * 100);
      var tier = score >= 11 ? 'strong' : score >= 8 ? 'mid' : 'weak';
      var head = tier === 'strong' ? 'Connection. Same honesty as the accusation, none of the ammunition.'
               : tier === 'mid' ? 'Half landed. The judgment-flavored parts still gave them something to defend against.'
               : 'It landed as an attack, because parts of it were one. Accusations get defenses, not Fridays.';
      var coach = picks.map(function (p, i) { return '<div><b>' + SLOTS[i].key + ':</b> ' + SLOTS[i].opts[p].coach + '</div>'; }).join('');
      outEl.innerHTML = '<span class="tag">How it lands · ' + score + ' / 12</span>' +
        '<div class="lab__meter"><span style="width:0"></span></div>' +
        '<p style="margin:0;color:#fff;font-weight:500">' + head + '</p>' +
        '<div class="sample">' + REACTIONS[tier] + '</div>' +
        '<div class="lab__coach">' + coach + '</div>' +
        (tier !== 'strong' ? '<p class="why" style="margin-top:1rem"><b>Try again:</b> upgrade your weakest part and say it again. Watch the reply change.</p>'
                           : '<p class="why" style="margin-top:1rem"><b>Now the real thing:</b> the pair drill in Go deeper converts two fresh accusations, out loud.</p>');
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

  /* ---------- INTERACTIVE: EI Commitment Card capstone ---------- */
  var planEl = $('#eqPlan');
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
      listen: { name: 'The listening habit', move: 'In your next conversation with them: one paraphrase ("so what I\'m hearing is…"), one clarifying question, zero advice. Count three seconds of silence before you respond.' },
      nvc: { name: 'The NVC reframe', move: 'Write the accusation you\'re tempted to make, then rebuild it: camera-true observation, owned feeling, the need underneath, one specific and declinable request.' },
      candor: { name: 'Candor with care', move: 'Open with the shared goal, name the concern as an observation about the work, and end with a genuine question: "what\'s your read?"' },
      label: { name: 'Name it to tame it', move: 'When the spike hits in their presence: label it silently and precisely ("defensive, because that landed as criticism"), one breath, then choose the reply.' }
    };
    var NOT = {
      interrupt: 'Interrupting and finishing their sentences. Counter-move: hands still, eyes on them, three seconds of silence after they stop.',
      advise: 'Unsolicited advice. Counter-move: write the fix down instead of saying it; offer it only if they ask, as one option.',
      avoid: 'Avoiding the conversation entirely. Counter-move: the calendar invite goes out the moment you finish this card.'
    };
    var WHEN = { tomorrow: 'tomorrow', threedays: 'within the next 3 days', week: 'within 7 days' };
    buildBtn.addEventListener('click', function () {
      if (!planReady()) return;
      var who = whoIn.value.trim();
      var p = PRACTICE[pick.practice];
      var rows = '' +
        '<div class="row"><b>The relationship</b><span>' + who.replace(/</g, '&lt;') + '</span></div>' +
        '<div class="row"><b>My practice</b><span>' + p.name + '. ' + p.move + '</span></div>' +
        '<div class="row"><b>What I will NOT do</b><span>' + NOT[pick.not] + '</span></div>' +
        '<div class="row"><b>The first rep</b><span>' + WHEN[pick.when].charAt(0).toUpperCase() + WHEN[pick.when].slice(1) + ', in a real interaction, not a rehearsal.</span></div>' +
        '<div class="row"><b>The evidence</b><span>Afterward, write one line: what went differently from how this conversation usually goes. That line is the measure.</span></div>' +
        '<div class="row"><b>The blind-spot move</b><span>This week, ask one trusted colleague: "What\'s one thing I do that gets in my own way?" Reply only with thank you.</span></div>';
      outEl2.innerHTML = '<span class="tag">My EI commitment card</span>' +
        '<div class="plan__out-grid">' + rows + '</div>' +
        '<div class="lab__runrow" style="margin-top:1.25rem">' +
        '<button class="btn" id="planCopy">Copy my card</button>' +
        '<span class="quiz__progress" id="planCopied" style="color:rgba(255,255,255,.6)">Put the first rep on your calendar now</span></div>';
      outEl2.hidden = false;
      $('#planCopy').addEventListener('click', function () {
        var text = 'MY EI COMMITMENT CARD (Emotional Intelligence, Vanderbilt)\n' +
          'The relationship: ' + who + '\n' +
          'Practice: ' + p.name + '. ' + p.move + '\n' +
          'I will NOT: ' + NOT[pick.not] + '\n' +
          'First rep: ' + WHEN[pick.when] + '.\n' +
          'Evidence: one line afterward on what went differently.\n' +
          'Blind-spot move: ask a trusted colleague what I do that gets in my own way; reply only thank you.';
        (navigator.clipboard ? navigator.clipboard.writeText(text) : Promise.reject()).then(function () {
          $('#planCopied').textContent = 'Copied. Paste it somewhere you\'ll see before the first rep.';
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
      { q: 'Goleman\'s four EI domains, in their working order, are…',
        opts: ['Perceive, use, understand, manage', 'Self-awareness, self-management, social awareness, relationship management', 'Listen, label, reframe, commit', 'Open, blind, hidden, unknown'],
        correct: 1, why: 'Notice yourself, steer yourself, read the room, move the relationship. The sequence matters: each stands on the last.' },
      { q: 'The Mayer-Salovey model matters because it…',
        opts: ['Replaced Goleman\'s model', 'Is the peer-reviewed ability model that made EI measurable science', 'Is a personality test', 'Only applies to executives'],
        correct: 1, why: 'Perceiving, using, understanding, managing emotion: the research foundation beneath the applied leadership language.' },
      { q: 'In the Johari Window, your Blind quadrant shrinks only through…',
        opts: ['Seniority', 'More introspection', 'Feedback from others', 'Time'],
        correct: 2, why: 'By definition, introspection can\'t see it. Eurich\'s one question ("what do I do that gets in my own way?") is the tool.' },
      { q: 'The UCLA affect-labeling research found that naming an emotion…',
        opts: ['Makes it stronger', 'Reduces amygdala reactivity and engages deliberate thinking', 'Eliminates the feeling completely', 'Only works out loud'],
        correct: 1, why: 'Volume down, not off: the label engages the prefrontal cortex and calms the alarm enough to choose a response.' },
      { q: 'In NVC, which of these is a camera-true observation?',
        opts: ['"You never communicate"', '"Communication has been bad lately"', '"I haven\'t received a status update in two weeks"', '"You clearly don\'t value my time"'],
        correct: 2, why: 'A camera would agree, so there\'s nothing to defend against. The other three are verdicts in varying disguises.' },
      { q: 'Edmondson is explicit: psychological safety is NOT…',
        opts: ['Measurable', 'The same as being nice', 'Related to team performance', 'Something leaders influence'],
        correct: 1, why: 'It\'s a climate where candor is safe so people can learn. Niceness that withholds the hard truth is the opposite of it.' }
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
      var msg = pct >= 80 ? 'The concepts are loaded. The relationship you named is where they become real.' :
                pct >= 50 ? 'Solid. Revisit the sections you missed before your first rep.' :
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
