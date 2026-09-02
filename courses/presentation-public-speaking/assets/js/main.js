/* =====================================================================
   PRESENTATION & PUBLIC SPEAKING — classroom deck
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

  /* ---------- Generic scenario trainer (used six times) ---------- */
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
    passMsg: 'You called the research. The pattern in every number: what separates memorable presenters isn\'t nerve. It\'s structure and presence, and both are learnable.',
    failMsg: 'Most rooms miss these, and that\'s the point: the folklore about public speaking (it\'s all fear, it\'s all charisma) doesn\'t survive contact with the data.',
    labels: [],
    items: [
      { q: 'The myth says public speaking is America\'s #1 fear. In the 2024 Chapman Survey of American Fears (85 fears measured), where did it actually rank?',
        opts: ['1st, the myth is true', '22nd, top quartile', '59th, behind sharks'],
        answer: 2, why: '59th of 85, at 29 percent, a few points below fear of sharks. Corrupt officials, illness, and financial ruin all towered over it. If fear isn\'t the real barrier, something else is — that\'s today.' },
      { q: 'Coqual asked 268 senior executives what signals leadership readiness. What share pointed to gravitas — confidence, decisiveness, grace under fire — as the core of executive presence?',
        opts: ['67%', '35%', '12%'],
        answer: 0, why: '67 percent named gravitas, 28 percent communication, and only 5 percent appearance. And communication is how the room SEES your gravitas — which makes presenting a leadership skill, not a stage skill.' },
      { q: 'In the same research, how much of what it takes to get promoted did executives attribute to executive presence overall?',
        opts: ['About 5%', 'About 26%', 'More than half'],
        answer: 1, why: 'Roughly a quarter of the promotion decision, by executives\' own account, rides on presence — not the work itself, but how credibly you carry and communicate it.' },
      { q: 'Deloitte asked 200 CFOs the most-valued quality when picking the NEXT CFO. What share chose "good communication skills — explaining results in clear, simple terms"?',
        opts: ['39%, the single top answer', '15%, mid-list', '4%, near the bottom'],
        answer: 0, why: '39 percent — the top answer, ahead of every technical competency. Financial expertise didn\'t crack the top three. The people who decide careers keep saying the same thing.' }
    ]
  });

  /* Spot the pillar (Section 02) */
  makeTrainer({
    root: '#pillarSpot', q: '#psQ', options: '#psOptions', feedback: '#psFeedback',
    progress: '#psProgress', next: '#psNext', result: '#psResult',
    progressWord: 'Scene', goodColor: 'var(--vu-gold-flat)',
    resultColor: 'rgba(255,255,255,.85)', passAt: 4,
    passMsg: 'You can read presence in the wild. Now the honest rep: which pillar is YOUR growth edge? Write it down; the capstone will use it.',
    failMsg: 'Close. The tells: composure and conviction under pressure → gravitas. How the message lands (clarity, command, reading the room) → communication. Polish and signal management → appearance.',
    labels: ['Gravitas', 'Communication', 'Appearance'],
    items: [
      { q: 'Mid-presentation, the CFO challenges a director\'s numbers. The director pauses, says "you\'re right to push on that," walks through the assumption calmly, and holds the room.',
        answer: 0, why: 'Grace under fire: composure plus command of the material when challenged. This is the gravitas 67 percent of executives said signals leadership readiness.' },
      { q: 'A manager presents a complex reorg in three crisp minutes: one idea per beat, no jargon, and the room can repeat the plan back afterward.',
        answer: 1, why: 'Clarity, concision, command of the room: communication — the pillar that makes gravitas visible to others.' },
      { q: 'A brilliant analyst presents breakthrough findings, but reads every slide verbatim in a monotone, back to the audience half the time. The work is superb; the room checks their phones.',
        answer: 1, why: 'A communication failure, not a content one. Anderson\'s line applies: they had the idea; the delivery buried it. That gap is exactly what today trains.' },
      { q: 'A senior leader shows up to a board presentation rumpled and visibly unprepared-looking, and spends the first five minutes fighting that first impression despite knowing the material cold.',
        answer: 2, why: 'Appearance: the smallest pillar (5 percent) but a real filter. Hewlett found blunders here are costly precisely because they distract from the other two pillars.' },
      { q: 'When the demo crashes live, the presenter shrugs, smiles, narrates the backup plan without apology, and the room\'s confidence in her goes UP.',
        answer: 0, why: 'Gravitas again: the crash was the test, the composure was the answer. AMA\'s principle applies — "no one cares about your mistake but you," unless you teach them to.' }
    ]
  });

  /* Topic or Big Idea (Section 03) */
  makeTrainer({
    root: '#topicJudge', q: '#tjQ', options: '#tjOptions', feedback: '#tjFeedback',
    progress: '#tjProgress', next: '#tjNext', result: '#tjResult',
    progressWord: 'Sentence', goodColor: 'var(--vu-gold-flat)',
    resultColor: 'rgba(255,255,255,.85)', passAt: 4,
    passMsg: 'You can hear the difference. Now draft your own below — point of view plus stakes, one sentence.',
    failMsg: 'Close. Duarte\'s test: a Big Idea states YOUR point of view and what\'s AT STAKE, in one sentence. A topic is just a subject; two ideas fused is a fog.',
    labels: ['A topic, no point of view', 'A Big Idea', 'Two ideas fused, pick one'],
    items: [
      { q: '"Our Q3 results."',
        answer: 0, why: 'A subject line, not an argument. It commits to nothing, so the audience can\'t disagree — or care. What ABOUT the results?' },
      { q: '"We should double down on enterprise accounts, because SMB churn just outpaced our new-logo growth."',
        answer: 1, why: 'Point of view (double down on enterprise) plus stakes (churn is outrunning growth). One sentence, and the whole deck now has a job: prove it.' },
      { q: '"An update on the onboarding program."',
        answer: 0, why: 'A topic in a trench coat. "Update" is the tell: updates inform, Big Ideas move. What should the room DO about onboarding?' },
      { q: '"We need to modernize our data platform, and also our hiring process is broken and needs a full redesign."',
        answer: 2, why: 'Two real ideas, one talk, zero focus. Duarte\'s discipline: one idea per talk. Pick the one this audience can act on; the other gets its own meeting.' },
      { q: '"Move new-hire onboarding to a hybrid model now — our all-virtual approach is costing us 20 percent of new hires in their first 90 days."',
        answer: 1, why: 'A stance a reasonable person could oppose, stakes with a number attached. Notice how it makes you want the evidence — that pull is what a Big Idea does.' }
    ]
  });

  /* Tag the beat (Section 04 — Sparkline) */
  makeTrainer({
    root: '#beatTag', q: '#btQ', options: '#btOptions', feedback: '#btFeedback',
    progress: '#btProgress', next: '#btNext', result: '#btResult',
    progressWord: 'Beat', goodColor: 'var(--vu-oak)',
    resultColor: 'var(--ink-soft, #555)', passAt: 4,
    passMsg: 'You can read the shape. That alternation — reality, vision, reality, bigger vision — is the tension-and-release engine under MLK\'s Dream speech and every great product launch.',
    failMsg: 'Close. The tells: "What Is" describes today\'s reality (usually with pain). "What Could Be" paints the future. "New Bliss" is the final picture of the world once the room says yes.',
    labels: ['What Is', 'What Could Be', 'New Bliss'],
    items: [
      { q: '"Today, a new hire waits eleven days for system access, and their manager burns a week chasing tickets."',
        answer: 0, why: 'What Is: the status quo, with the pain made concrete. The sharper this beat, the more the room leans toward the alternative.' },
      { q: '"Imagine a first day where the laptop is live, the calendar is loaded, and the new hire ships something real by Friday."',
        answer: 1, why: 'What Could Be: the vision beat. Duarte\'s insight is that great talks ALTERNATE — you don\'t climb straight to the vision; you traverse the gap repeatedly.' },
      { q: '"But here\'s the honest obstacle: our provisioning process still runs through three separate approval queues."',
        answer: 0, why: 'Back to What Is — and that return is deliberate. Acknowledging the obstacle after the vision builds credibility and tension at the same time.' },
      { q: '"Now picture every team in the division onboarding this way — we stop losing one in five new hires in their first 90 days."',
        answer: 1, why: 'What Could Be again, bigger this time. Each alternation raises the stakes and widens the gap the audience wants closed.' },
      { q: '"A year from now, onboarding is the reason people accept our offers — candidates tell recruiters they heard about the first week. That\'s where this vote takes us."',
        answer: 2, why: 'New Bliss: the closing image of the world after the room says yes. Sparklines END here — the future state, not a recap slide.' }
    ]
  });

  /* Fix the delivery (Section 06) */
  makeTrainer({
    root: '#deliveryFix', q: '#dfQ', options: '#dfOptions', feedback: '#dfFeedback',
    progress: '#dfProgress', next: '#dfNext', result: '#dfResult',
    progressWord: 'Moment', goodColor: 'var(--vu-oak)',
    resultColor: 'var(--ink-soft, #555)', passAt: 4,
    passMsg: 'Your coaching ear works. The live round is next — where you\'ll hear these same notes aimed at you, which is how they become yours.',
    failMsg: 'Close. The through-line from Anderson, Gallo, and the AMA: be conversational, cut the bullet walls, vary the voice, never over-apologize, and rehearse out loud — not in your head.',
    labels: [],
    items: [
      { q: 'A presenter opens: "Sorry, I know this deck is long, and I\'m not the best speaker, so bear with me…" What\'s the fix?',
        opts: ['Apologize once more, then begin', 'Cut every apology; open with the Big Idea sentence instead', 'Speed up to make the deck feel shorter'],
        answer: 1, why: 'AMA\'s principle: no one cares about your shortcomings but you — until you announce them. The opening line is too valuable to spend on an apology; spend it on the idea.' },
      { q: 'Slide 4 has 34 bullet points. The presenter reads each one aloud. The fix?',
        opts: ['Read faster', 'Smaller font, fit more per slide', 'One idea per slide: an image or a single line, with the detail moved to a handout'],
        answer: 2, why: 'Gallo\'s hardest rule: never use bullet points — a slide people read is a slide they don\'t listen through. You are the presentation; the slide is the backdrop.' },
      { q: 'A speaker delivers a genuinely strong idea in one flat, unbroken monotone. Which fix comes FIRST?',
        opts: ['Modulate: change pace and volume at the moments that matter, and pause before the key line', 'Add a joke at the start', 'Add animation to the slides'],
        answer: 0, why: 'Gallo: vary the delivery, since the voice is the highlighter. A pause before the ask does more than any slide transition ever will.' },
      { q: 'A manager rehearses by silently re-reading slides the night before, then stumbles live. What does the research-backed prep look like?',
        opts: ['Re-read the slides twice more', 'Rehearse OUT LOUD, timed, at least once in front of one honest human', 'Memorize the script word for word'],
        answer: 1, why: 'Anderson and Gallo agree: out loud, on your feet, timed. Reading is not rehearsal — and full memorization makes most speakers sound canned; know the beats, not the script.' },
      { q: 'A presenter delivers a formal, podium-locked TED-style oration to six executives around a table. The fix?',
        opts: ['Bigger gestures to fill the room', 'Make it conversational: sit forward, talk WITH the table, treat it as a briefing, not a performance', 'Ask for a bigger room'],
        answer: 1, why: 'Anderson\'s first key is conversational connection, and it scales DOWN: match the register to the room. Six executives want a sharp peer, not a keynote.' }
    ]
  });

  /* Judge the bridge (Section 07) */
  makeTrainer({
    root: '#bridgeJudge', q: '#bjQ', options: '#bjOptions', feedback: '#bjFeedback',
    progress: '#bjProgress', next: '#bjNext', result: '#bjResult',
    progressWord: 'Question', goodColor: 'var(--vu-oak)',
    resultColor: 'var(--ink-soft, #555)', passAt: 4,
    passMsg: 'You can hear the bridge: acknowledge, answer directly, return to the Big Idea. The rapid-fire drill makes it reflex.',
    failMsg: 'Close. The bridge has three beats: acknowledge the question honestly, answer it directly (or say what you\'ll find out and by when), then return to your Big Idea. Dodging and dumping both lose the room.',
    labels: [],
    items: [
      { q: 'Executive: "What\'s this going to cost us?" Which response is the bridge?',
        opts: ['"Great question, let me circle back to the roadmap for context first…"', '"Fully loaded, about $340K in year one — and the churn it stops is costing us roughly twice that annually, which is the case for moving now."', '"Cost is really hard to estimate at this stage."'],
        answer: 1, why: 'Direct number, then straight back to the Big Idea. Option A is a dodge wearing a compliment; option C is an answer-shaped shrug. Executives forgive hard numbers; they don\'t forgive evasion.' },
      { q: '"Why hasn\'t this been done already?" The composed response?',
        opts: ['"Honestly? Because it wasn\'t anyone\'s clear priority until the Q3 churn data — which is exactly what changed, and why the timing is now."', '"That\'s not really my department."', '"There were… various organizational factors."'],
        answer: 0, why: 'Acknowledge the uncomfortable truth, then bridge to the stakes. Naming the real reason without blaming anyone reads as gravitas; vagueness reads as cover.' },
      { q: 'A question you genuinely can\'t answer: "What\'s the vendor\'s exposure if the integration fails?" Best move?',
        opts: ['Improvise a plausible-sounding answer', '"I don\'t want to guess on that. I\'ll have the contractual answer to you by Thursday — and it doesn\'t change the core economics I\'ve shown."', 'Ask them what they think it is'],
        answer: 1, why: 'The honest deferral WITH a deadline, then the return. AMA\'s Q&A discipline: a confident "I\'ll find out by X" builds more credibility than a fluent guess that dies in the follow-up.' },
      { q: 'A hostile framing: "Isn\'t this just last year\'s failed initiative with a new name?" The bridge?',
        opts: ['"No. Next question."', '"With respect, that\'s unfair."', '"It shares the goal — and it fixes the two things that killed it: no executive owner, no phased rollout. Both are different this time; here\'s how."'],
        answer: 2, why: 'It concedes what\'s true in the challenge, answers the substance, and turns the comparison into evidence FOR the plan. Composure plus candor disarms hostility better than defense.' },
      { q: 'Three questions in, you\'re deep in a tangent about server architecture, far from your ask. What does a skilled presenter do?',
        opts: ['Follow the tangent wherever it goes; the audience is in charge', 'Answer crisply, then: "and the reason this matters for today\'s decision is…" — returning to the Big Idea', 'Promise to cover it later and move on without answering'],
        answer: 1, why: 'The return is the whole point of the bridge. Every answer is a chance to re-land the Big Idea; presenters who only answer eventually give a different talk than the one they planned.' }
    ]
  });

  /* ---------- INTERACTIVE: Big Idea drafter (private) ---------- */
  var bi = $('#bigIdea');
  if (bi) {
    var biView = $('#biView'), biStake = $('#biStake'),
        biBtn = $('#biBuild'), biStatus = $('#biStatus'), biOut = $('#biOut');
    var biReady = function () {
      var ok = biView.value.trim().length >= 8 && biStake.value.trim().length >= 8;
      biBtn.disabled = !ok;
      biStatus.textContent = ok ? 'Ready, assemble it' : 'Fill in both halves';
      return ok;
    };
    [biView, biStake].forEach(function (el) { el.addEventListener('input', biReady); });
    biBtn.addEventListener('click', function () {
      if (!biReady()) return;
      var esc = function (t) { return t.replace(/</g, '&lt;'); };
      var view = biView.value.trim().replace(/[.。]+$/, '');
      var stake = biStake.value.trim().replace(/[.。]+$/, '');
      biOut.innerHTML = '<span class="tag">My Big Idea · private, nothing is saved</span>' +
        '<p style="margin:.75rem 0 0;font-family:var(--font-serif);font-size:1.25rem;color:#fff">&ldquo;' + esc(view) + ' — because ' + esc(stake) + '.&rdquo;</p>' +
        '<div class="plan__out-grid" style="margin-top:1rem">' +
        '<div class="row"><b>Test 1 · One idea?</b><span>If there\'s an "and also" hiding in it, split it. One talk, one idea.</span></div>' +
        '<div class="row"><b>Test 2 · A stance?</b><span>Could a reasonable colleague disagree? If nobody could oppose it, it\'s a topic, not a point of view.</span></div>' +
        '<div class="row"><b>Test 3 · Real stakes?</b><span>Does the "because" name what\'s lost or won? A number makes it twice as strong.</span></div>' +
        '<div class="row"><b>The move</b><span>Say it out loud once, now. If it takes two breaths, cut it. This sentence is your opening line\'s raw material.</span></div>' +
        '</div>';
      biOut.hidden = false;
      biOut.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'nearest' });
    });
  }

  /* ---------- INTERACTIVE: SCQA Build Lab ---------- */
  var lab = $('#scqaLab');
  if (lab) {
    var SLOTS = [
      { key: 'Situation', opts: [
        { t: '"Let me start with some history. In 2019, our first ticketing system…"', pts: 1, coach: 'History lesson, not situation. The Situation is the shortest possible shared ground — what the room already agrees is true today.' },
        { t: '"As you know, support volume has grown a lot lately."', pts: 2, coach: 'Right instinct, but "a lot" and "lately" are fog. Executives trust specifics.' },
        { t: '"Support tickets are up 40 percent year over year, while the team headcount has stayed flat."', pts: 3, coach: 'Two verifiable facts the room already accepts. You\'ve bought credibility in one sentence, which is the Situation\'s whole job.' }]},
      { key: 'Complication', opts: [
        { t: '"And there are honestly a number of challenges I could walk through…"', pts: 1, coach: 'A menu of unnamed problems is not a complication; it\'s a warning that this meeting will be long.' },
        { t: '"The team is burning out and response times are slipping."', pts: 2, coach: 'Real, but still soft. What breaks, and when? The Complication is the change that makes the status quo untenable.' },
        { t: '"At this trajectory we blow our enterprise SLAs in Q3 — and two of our top ten accounts renew that quarter."', pts: 3, coach: 'A deadline and named stakes. NOW the executive\'s question is forming on its own — which is exactly what a Complication is for.' }]},
      { key: 'Question', opts: [
        { t: '"So… there\'s a lot to think about."', pts: 1, coach: 'The tension you built just leaked out. The Question crystallizes the decision, or the Answer lands on nothing.' },
        { t: '"So what are our options?"', pts: 2, coach: 'Close, but "options" invites a brainstorm. Frame the question the ANSWER is built to answer.' },
        { t: '"So how do we protect those renewals without doubling headcount?"', pts: 3, coach: 'The exact question your recommendation answers, with the constraint built in. The room is now asking it with you.' }]},
      { key: 'Answer', opts: [
        { t: '"We\'ll present a full analysis of possible directions at a follow-up session."', pts: 1, coach: 'The anti-answer. You built the tension and then scheduled another meeting inside it.' },
        { t: '"We recommend investing in support automation."', pts: 2, coach: 'A direction, not a decision. What, how much, by when? Executives fund specifics.' },
        { t: '"Deflect the top five ticket types with automation by June: $120K, one quarter to implement, and it absorbs the volume growth without a single new hire."', pts: 3, coach: 'Lead with the answer, Minto-style: specific, costed, dated. Everything after this slide is just support for a decision the room can already see.' }]}
    ];
    var picks = [null, null, null, null];
    var slotsEl = $('#labSlots'), runBtn = $('#labRun'), statusEl = $('#labStatus'), outEl = $('#labOutcome');
    // Branching: slots open one at a time, and every slot after the first carries a
    // situation set by the learner's first move, so that move stays in the room.
    var BRANCH = { 1: ["You are thirty seconds in and still in 2019. The CFO checks the clock. The COO is scrolling. Nobody in the room has heard a fact about today yet. Your next sentence has to give them a reason to keep listening. What makes now different from every other quarter?", "The room nods along, loosely. \"A lot\" and \"lately\" landed as mood, not as facts. Nobody is arguing, but nobody is leaning in either. The CFO is waiting for a number. Now you need the thing that turns a vague trend into a problem. Put a clock on it.", "Two facts, one sentence, and the room is with you. The CFO makes a note. Nobody asks what you mean. You have credibility and about three sentences of attention left. Now they need the change that makes the current setup untenable. What breaks, and when?"], 2: ["You have spent most of your four sentences on backstory. Whatever complication you just named arrived late, without shared ground under it. The COO leans back. The room is trying to work out why this meeting exists. Your next sentence has to hand them the decision, plainly.", "The room accepts that support is under strain, in a general sort of way. Your complication had to do double duty, filling in facts the opening left out. Attention is holding, barely. Now the tension needs a point. The room wants to know what it is being asked.", "Situation and complication have done their work. The CFO's pen is moving. The room can feel a decision forming and is waiting for you to name it. Whatever you say next becomes the frame for your answer. Make it the question your recommendation is built to answer."], 3: ["Ninety seconds in, and the COO has already interrupted once to ask what this is about. The history lesson spent the room's patience, and every part since has been recovering lost ground. You get one more sentence. Whatever it is, it has to be something they can decide.", "The room is polite and slightly tired. Your opening was soft, and every part since has carried a little of that fog. The CFO glances at the deck, looking for the number. There is still a decision to be had here, if you state it clearly enough.", "Your opening bought trust, and you have spent it well. The room is asking your question with you. The CFO is looking straight at you, ready to fund something or kill it. This is the moment SCQA was built for. Say the answer, and make it decidable."] };
    var CARRY = ["The history lesson spent the room's patience before your first real fact, and every later part had to pay it back.", "A soft opening left the room without a shared fact, so every later part carried a little of that fog.", "Two accepted facts up front bought the room's trust, and every later part could build on solid ground."];
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
          statusEl.textContent = ready ? 'Ready, brief them' :
            'Choose ' + picks.filter(function (p) { return p === null; }).length + ' more part(s)';
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
      strong: 'The CFO nods before you reach slide two: "Clear. If automation covers the top five types, what\'s the risk on type six?" — a REAL question, about the substance. You\'ve been promoted from presenter to advisor, and you\'re four sentences in.',
      mid: 'Polite attention, some phone glances. At the end: "Can you send the deck? We\'ll discuss and get back to you." The pieces were there, but the fog in your weakest parts made the room work to find the decision — and rooms don\'t do your work for you.',
      weak: 'Ninety seconds in, the COO interrupts: "Sorry — what are you asking us for?" The room never found the question, so the answer had nowhere to land. This is what unstructured content does to even a good idea in an executive setting.'
    };
    runBtn.addEventListener('click', function () {
      var score = picks.reduce(function (t, p, i) { return t + SLOTS[i].opts[p].pts; }, 0); // 4..12
      var pct = Math.round((score / 12) * 100);
      var tier = score >= 11 ? 'strong' : score >= 8 ? 'mid' : 'weak';
      var head = tier === 'strong' ? 'The room got it in four sentences. That\'s SCQA doing its job: scarce executive attention, respected.'
               : tier === 'mid' ? 'Partially landed. The structure was visible, but the soft parts cost you the decision in the room.'
               : 'It didn\'t land — the room never found the question your answer was built for.';
      var coach = picks.map(function (p, i) { return '<div><b>' + SLOTS[i].key + ':</b> ' + SLOTS[i].opts[p].coach + '</div>'; }).join('');
      outEl.innerHTML = '<span class="tag">How the exec room reacts · ' + score + ' / 12</span>' +
        '<div class="lab__meter"><span style="width:0"></span></div>' +
        '<p style="margin:0;color:#fff;font-weight:500">' + head + '</p>' +
        '<div class="sample">' + REACTIONS[tier] + '</div>' +
        (CARRY[picks[0]] ? '<p class="lab__carry"><b>What your first move set in motion:</b> ' + CARRY[picks[0]] + '</p>' : '') +
        '<div class="lab__coach">' + coach + '</div>' +
        (tier !== 'strong' ? '<p class="why" style="margin-top:1rem"><b>Try again:</b> upgrade your weakest part and re-brief. Watch the room change.</p>'
                           : '<p class="why" style="margin-top:1rem"><b>Now the real thing:</b> the storyboard drill in Go deeper runs YOUR Big Idea through this structure.</p>');
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

  /* ---------- INTERACTIVE: Presentation Rebuild capstone ---------- */
  var planEl = $('#rebuildPlan');
  if (planEl) {
    var pick = { structure: null, cut: null, when: null };
    var whatIn = $('#planWhat'), ideaIn = $('#planIdea'), openIn = $('#planOpen'),
        buildBtn = $('#planBuild'), statusEl2 = $('#planStatus'), outEl2 = $('#planOut');
    function planReady() {
      var ok = whatIn.value.trim().length >= 8 && ideaIn.value.trim().length >= 12 &&
               openIn.value.trim().length >= 12 && pick.structure && pick.cut && pick.when;
      buildBtn.disabled = !ok;
      statusEl2.textContent = ok ? 'Ready, build it' : 'Fill in all six parts';
      return ok;
    }
    [whatIn, ideaIn, openIn].forEach(function (el) { el.addEventListener('input', planReady); });
    [['#planStructure', 'structure', 'data-structure'], ['#planCut', 'cut', 'data-cut'], ['#planWhen', 'when', 'data-when']].forEach(function (cfg) {
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
    var STRUCTURE = {
      sparkline: { name: 'Duarte\'s Sparkline', move: 'Storyboard the beats before touching slides: What Is (today\'s pain) → What Could Be (the vision) → back and forth, raising stakes each pass → end on New Bliss, the world after they say yes.' },
      scqa: { name: 'SCQA / Pyramid Principle', move: 'Lead with the answer. Situation (facts the room accepts) → Complication (what makes now untenable) → Question → your Answer, specific, costed, dated — then support it top-down.' }
    };
    var CUT = {
      bullets: 'The bullet-wall slide. Replacement: one line or one image per slide; the detail moves to a leave-behind handout.',
      apology: 'The apologetic opener ("sorry, I know this is long…"). Replacement: your literal opening line below, delivered cold.',
      warmup: 'The ten-slide warm-up before the point. Replacement: the answer or the vision within the first ninety seconds.'
    };
    var WHEN = { week: 'within 7 days', twoweeks: 'within 2 weeks', month: 'within the month' };
    buildBtn.addEventListener('click', function () {
      if (!planReady()) return;
      var esc = function (t) { return t.replace(/</g, '&lt;'); };
      var what = whatIn.value.trim(), idea = ideaIn.value.trim(), open = openIn.value.trim();
      var s = STRUCTURE[pick.structure];
      var rows = '' +
        '<div class="row"><b>The presentation</b><span>' + esc(what) + '</span></div>' +
        '<div class="row"><b>My Big Idea</b><span>&ldquo;' + esc(idea) + '&rdquo;</span></div>' +
        '<div class="row"><b>Structure</b><span>' + s.name + '. ' + s.move + '</span></div>' +
        '<div class="row"><b>My literal opening line</b><span>&ldquo;' + esc(open) + '&rdquo; — say it out loud once before you leave this page.</span></div>' +
        '<div class="row"><b>What I will CUT</b><span>' + CUT[pick.cut] + '</span></div>' +
        '<div class="row"><b>The talk happens</b><span>' + WHEN[pick.when].charAt(0).toUpperCase() + WHEN[pick.when].slice(1) + '. Rehearse out loud, timed, at least once with one honest human before it.</span></div>' +
        '<div class="row"><b>The evidence</b><span>Afterward, write one line: did anyone react to the opening? Did the structure hold under questions? That line is the measure.</span></div>';
      outEl2.innerHTML = '<span class="tag">My presentation rebuild</span>' +
        '<div class="plan__out-grid">' + rows + '</div>' +
        '<div class="lab__runrow" style="margin-top:1.25rem">' +
        '<button class="btn" id="planCopy">Copy my rebuild card</button>' +
        '<span class="quiz__progress" id="planCopied" style="color:rgba(255,255,255,.6)">Put a rehearsal block on your calendar now</span></div>';
      outEl2.hidden = false;
      $('#planCopy').addEventListener('click', function () {
        var text = 'MY PRESENTATION REBUILD (Presentation & Public Speaking, Vanderbilt)\n' +
          'The presentation: ' + what + '\n' +
          'Big Idea: "' + idea + '"\n' +
          'Structure: ' + s.name + '. ' + s.move + '\n' +
          'Opening line: "' + open + '"\n' +
          'Cutting: ' + CUT[pick.cut] + '\n' +
          'The talk: ' + WHEN[pick.when] + '. Rehearse out loud, timed, once with one honest human.\n' +
          'Evidence: one line afterward — did the opening land, did the structure hold?';
        (navigator.clipboard ? navigator.clipboard.writeText(text) : Promise.reject()).then(function () {
          $('#planCopied').textContent = 'Copied. Paste it into the deck\'s first speaker note.';
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
      { q: 'The Coqual/Hewlett executive presence research found the three pillars weigh in as…',
        opts: ['Equal thirds', 'Gravitas 67%, communication 28%, appearance 5%', 'Appearance first, everything else after', 'Communication 90%, the rest noise'],
        correct: 1, why: 'Gravitas dominates, communication makes it visible, appearance mostly filters. And presentations are where the first two meet the room.' },
      { q: 'Duarte\'s Big Idea™ must contain…',
        opts: ['A topic and an agenda', 'Your point of view AND what\'s at stake, in one sentence', 'Three supporting points', 'A memorable joke'],
        correct: 1, why: 'A stance someone could oppose, plus the cost of inaction. "Our Q3 results" is a topic; a Big Idea gives the whole talk a job.' },
      { q: 'The shape of Duarte\'s Presentation Sparkline™ is…',
        opts: ['A steady climb to the conclusion', 'Alternating "What Is" and "What Could Be," ending in New Bliss', 'Problem, then solution, then Q&A', 'Chronological: past, present, future'],
        correct: 1, why: 'Tension and release, traversing the gap repeatedly — the structure she traces through MLK\'s Dream speech and the great product launches.' },
      { q: 'Minto\'s SCQA exists because executive attention is scarce. Its signature move is…',
        opts: ['Building suspense before the reveal', 'Leading with the Answer, then supporting it top-down', 'Opening with a personal story', 'Saving the recommendation for the follow-up'],
        correct: 1, why: 'Situation, Complication, Question — then the Answer stated first for a leadership room. Suspense is for keynotes; executives want the bottom line up front.' },
      { q: 'Anderson\'s and Gallo\'s delivery research converges on…',
        opts: ['Memorize the script word for word', 'Conversational tone, no bullet walls, vary the voice, rehearse out loud', 'Louder is always better', 'More slides, less talking'],
        correct: 1, why: 'Be a person talking to people: conversational register, one idea per slide, vocal modulation as the highlighter, and out-loud timed rehearsal.' },
      { q: 'The tough-question bridge, from AMA\'s executive speaking curriculum, runs…',
        opts: ['Deflect → redirect → move on', 'Acknowledge → answer directly → return to your Big Idea', 'Answer → apologize → concede', 'Repeat the question until time runs out'],
        correct: 1, why: 'Meet the question honestly, answer it (or commit to a date you will), then bring the room back to the idea. Every question is a chance to re-land the ask.' }
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
      var msg = pct >= 80 ? 'The toolkit is loaded. The presentation you named in the capstone is where it becomes real.' :
                pct >= 50 ? 'Solid. Revisit the sections you missed before you rebuild your deck.' :
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

  /* ---------- INTERACTIVE: exemplar compare (after the Big Idea drafter) ---------- */
  function mountExemplar(cfg) {
    var root = $(cfg.root), out = $(cfg.out), btn = $(cfg.btn);
    if (!root || !out || !btn) return;
    var remove = function () { var old = $('#' + cfg.id); if (old) old.parentNode.removeChild(old); };
    // choice chips (where the builder has them) hide the old result; drop the old comparison too
    $$('.plan__chips .opt', root).forEach(function (b) { b.addEventListener('click', remove); });
    // registered after the builder's own handler, so the learner's result renders first
    btn.addEventListener('click', function () {
      remove();
      if (out.hidden) return;
      var box = document.createElement('div');
      box.className = 'exemplar';
      box.id = cfg.id;
      var model = cfg.rows.map(function (r) {
        return '<div class="row"><b>' + r[0] + '</b><span>' + r[1] + '</span></div>';
      }).join('');
      var items = cfg.rubric.map(function (r, i) {
        var qid = cfg.id + 'Q' + i;
        return '<div class="exemplar__item">' +
          '<p class="exemplar__q" id="' + qid + '">' + r.q + '</p>' +
          '<div class="exemplar__toggle" role="group" aria-labelledby="' + qid + '">' +
          '<button type="button" class="opt" data-val="yes" aria-pressed="false"><span class="mark" aria-hidden="true">Y</span><span>Yes</span></button>' +
          '<button type="button" class="opt" data-val="no" aria-pressed="false"><span class="mark" aria-hidden="true">N</span><span>Not yet</span></button>' +
          '</div>' +
          '<p class="exemplar__nudge" hidden><b>To fix it:</b> ' + r.nudge + '</p>' +
          '</div>';
      }).join('');
      box.innerHTML = '<span class="tag">Compare with a model answer</span>' +
        '<p class="exemplar__intro">' + cfg.intro + '</p>' +
        (cfg.quote ? '<p class="exemplar__quote">' + cfg.quote + '</p>' : '') +
        '<div class="exemplar__model">' + model + '</div>' +
        '<p class="exemplar__head">Now score your own</p>' +
        '<div class="exemplar__rubric">' + items + '</div>' +
        '<p class="exemplar__tally" aria-live="polite">Answer all three to see your score.</p>';
      out.parentNode.insertBefore(box, out.nextSibling);
      var answers = cfg.rubric.map(function () { return null; });
      var tally = $('.exemplar__tally', box);
      $$('.exemplar__item', box).forEach(function (item, i) {
        var nudge = $('.exemplar__nudge', item);
        $$('.opt', item).forEach(function (b) {
          b.addEventListener('click', function () {
            var yes = b.getAttribute('data-val') === 'yes';
            answers[i] = yes;
            $$('.opt', item).forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
            nudge.hidden = yes;
            var done = answers.filter(function (a) { return a !== null; }).length;
            var score = answers.filter(function (a) { return a === true; }).length;
            tally.innerHTML = 'You scored ' + score + ' of ' + answers.length + (done < answers.length ? ' so far.' : '.') +
              (done === answers.length ? '<span class="exemplar__next">' + (score === answers.length ? cfg.strong : cfg.retry) + '</span>' : '');
          });
        });
      });
    });
  }
  mountExemplar({
    root: '#bigIdea', out: '#biOut', btn: '#biBuild', id: 'biExemplar',
    intro: 'Here is one strong Big Idea, built from the same two halves. Read it next to yours, then score your own draft.',
    quote: '&ldquo;We should give every new hire a named peer guide for their first 30 days, because the people who leave in year one tell us in exit interviews that nobody was assigned to them.&rdquo;',
    rows: [
      ['Point of view', 'We should give every new hire a named peer guide for their first 30 days. A manager could argue against it, which is what makes it a stance.'],
      ['What is at stake', 'The people who leave in year one say in exit interviews that nobody was assigned to them. The room loses people it already paid to hire.'],
      ['Why it works', 'One idea, one verb that asks for a decision, and a cost the audience already feels. You could repeat it after one hearing.']
    ],
    rubric: [
      { q: 'Does it state a point of view, not a topic?', nudge: 'Add a verb that asks for a decision, such as should, stop, move, or fund. If nobody could disagree, it is still a topic.' },
      { q: 'Does it say what is at stake for this audience?', nudge: 'Name what this room loses if it does nothing: time, money, people, or trust. A number makes it stronger.' },
      { q: 'Could someone repeat it after hearing it once?', nudge: 'Cut it until it fits in one breath. Drop the second clause or the qualifier.' }
    ],
    strong: 'All three. This sentence is your opening line. Say it out loud once before you move on.',
    retry: 'Fix each Not yet line above, rebuild your Big Idea, and score it again.'
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
