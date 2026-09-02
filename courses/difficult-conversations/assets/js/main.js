/* =====================================================================
   NAVIGATING DIFFICULT CONVERSATIONS — classroom deck interactions
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

  /* ---------- INTERACTIVE: avoidance meter (Section 01) ---------- */
  var avoid = $('#avoid');
  if (avoid) {
    var aSlider = $('#avoidSlider'), aOut = $('#avoidReadout'), aVal = $('#avoidVal');
    var aSamples = [
      { max: 16, label: 'A few days', text: 'Still fresh. The facts are recent, the feelings are small, and the conversation is as cheap as it will ever be. This is the moment to have it.' },
      { max: 46, label: 'A couple of weeks', text: 'You’re rehearsing it in the shower. The other person still has no idea, which means they’ve had zero chances to fix it.' },
      { max: 86, label: 'A couple of months', text: 'The behavior is now a pattern, and your silence has been quietly telling them it’s fine. The talk got bigger while you waited.' },
      { max: 121, label: 'The better part of a year', text: 'It’s compounding. Trust is leaking, the team has noticed, and what was one piece of feedback is now a history lesson. Still worth having, today more than tomorrow.' }
    ];
    var updAvoid = function () {
      var v = +aSlider.value;
      var s = aSamples.find(function (x) { return v < x.max; }) || aSamples[aSamples.length - 1];
      aOut.textContent = s.text;
      aVal.textContent = s.label;
    };
    aSlider.addEventListener('input', updAvoid);
    updAvoid();
  }

  /* ---------- INTERACTIVE: anatomy highlighters (SBI + STATE) ---------- */
  function bindAnatomy(rootSel, colors) {
    var root = $(rootSel);
    if (!root) return;
    $$('.pkey button', root).forEach(function (btn) {
      var part = btn.getAttribute('data-target');
      function set(on) {
        $$('.ppart[data-part="' + part + '"]', root).forEach(function (span) {
          span.classList.toggle('on', on);
          span.style.background = on ? colors[part] : '';
        });
        btn.classList.toggle('active', on);
      }
      btn.addEventListener('mouseenter', function () { set(true); });
      btn.addEventListener('mouseleave', function () { if (!btn.dataset.stick) set(false); });
      btn.addEventListener('focus', function () { set(true); });
      btn.addEventListener('blur', function () { if (!btn.dataset.stick) set(false); });
      btn.addEventListener('click', function () {
        var stick = btn.dataset.stick === '1';
        btn.dataset.stick = stick ? '' : '1';
        set(!stick);
      });
    });
  }
  bindAnatomy('#sbiAnatomy', { situation: '#B3C9CD', behavior: '#CFAE70', impact: '#8BA18E' });
  bindAnatomy('#stateAnatomy', { share: '#B3C9CD', tell: '#8BA18E', tentative: '#ECB748', ask: '#CFAE70', encourage: '#B49248' });

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

  /* ---------- Generic scenario trainer (used twice) ---------- */
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
      nextBtn.textContent = idx === cfg.items.length - 1 ? 'See result' : nextBtn.getAttribute('data-label') || 'Next';
      optEl.innerHTML = '';
      cfg.labels.forEach(function (label, i) {
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

  /* Name that conversation (Section 02) */
  makeTrainer({
    root: '#threeTrainer', q: '#threeQ', options: '#threeOptions', feedback: '#threeFeedback',
    progress: '#threeProgress', next: '#threeNext', result: '#threeResult',
    progressWord: 'Line', goodColor: 'var(--vu-gold-flat)',
    resultColor: 'rgba(255,255,255,.85)', passAt: 4,
    passMsg: 'You can hear the layers. In the room, respond to the conversation that’s actually running, not just the words.',
    failMsg: 'Close. The tells: facts and blame → What Happened. Emotion words, said or leaked → Feelings. “What does this say about me?” → Identity.',
    labels: ['What Happened', 'Feelings', 'Identity'],
    items: [
      { q: '“You said the report would be done Tuesday. It arrived Thursday, and you never flagged the slip.”',
        answer: 0, why: 'Dates, commitments, who-did-what. This is the What Happened conversation: the battle over the record.' },
      { q: '“Honestly, I’m frustrated, and a little hurt that I found out from the client instead of from you.”',
        answer: 1, why: 'Named emotion, owned by the speaker. That’s the Feelings conversation, out loud instead of leaking.' },
      { q: '“If I bring this up, am I being a micromanager? Maybe I’m the problem.”',
        answer: 2, why: 'The quiet self-talk about what this says about YOU. Identity is the conversation that powers avoidance.' },
      { q: '“I stayed late three nights for this launch and nobody so much as said thanks.”',
        answer: 1, why: 'It sounds like a report of facts, but listen: it’s hurt wearing a fact costume. Feelings, unnamed, leak like this.' },
      { q: '“I double-checked the email thread. The 15th was the date we all agreed to.”',
        answer: 0, why: 'Back to the record: evidence, dates, proof. What Happened again, and notice how it invites a counter-exhibit.' }
    ]
  });

  /* Sort the quadrant (Section 06) */
  makeTrainer({
    root: '#candorSort', q: '#candorQ', options: '#candorOptions', feedback: '#candorFeedback',
    progress: '#candorProgress', next: '#candorNext', result: '#candorResult',
    progressWord: 'Scenario', goodColor: 'var(--vu-gold-flat)',
    resultColor: 'rgba(255,255,255,.85)', passAt: 3,
    passMsg: 'You can read the grid. Now the harder rep: catching your own feedback drifting out of the candor quadrant.',
    failMsg: 'Close. The axes are the test: did they show they care about the person? Did they actually say the hard thing? Score each axis and the quadrant names itself.',
    labels: ['Radical Candor', 'Ruinous Empathy', 'Obnoxious Aggression', 'Manipulative Insincerity'],
    items: [
      { q: 'A manager has watched a direct report miss deadlines for three months and said nothing, “to keep the peace.”',
        answer: 1, why: 'Plenty of care, zero challenge: Ruinous Empathy. The peace being kept is the manager’s, not the employee’s.' },
      { q: '“This report is sloppy. I expected a lot more from you.” Posted in the team’s public Slack channel.',
        answer: 2, why: 'Challenge without care, delivered in public: Obnoxious Aggression. The content may even be true; the delivery guarantees it won’t be heard.' },
      { q: 'A manager tells a peer “Great presentation!” in the meeting, then critiques it to others as soon as the room empties.',
        answer: 3, why: 'No care, no direct challenge, just performance: Manipulative Insincerity. Nothing kills trust faster.' },
      { q: '“I want you to succeed here, which is why I need to tell you: the client caught three errors in the deck. Let’s figure out a review step together.”',
        answer: 0, why: 'Care stated, challenge delivered, future built together: Radical Candor. Notice it isn’t soft; it’s specific AND kind.' }
    ]
  });

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

  /* ---------- INTERACTIVE: Feedback Lab (SBI builder, graded) ---------- */
  var lab = $('#feedbackLab');
  if (lab) {
    var SLOTS = [
      { key: 'Situation', opts: [
        { t: '“You always do this.”', pts: 1, coach: '“Always” is an accusation about forever. It invites them to find one counter-example and dismiss everything.' },
        { t: '“Lately, in meetings,”', pts: 2, coach: 'Closer, but “lately” is fog. A specific time and place makes it a fact instead of a feeling.' },
        { t: '“In our last two Monday planning meetings,”', pts: 3, coach: 'Anchored in time and place. Nothing to argue with yet, which is exactly the point.' }]},
      { key: 'Behavior', opts: [
        { t: '“you clearly don’t care about the team’s time,”', pts: 1, coach: 'That’s mind-reading their motive. You can observe actions; you can only guess at intent, and your guess will be contested.' },
        { t: '“you weren’t prepared,”', pts: 2, coach: '“Unprepared” is a conclusion. What did a camera see? Describe that instead.' },
        { t: '“your project status doc hadn’t been updated, so we planned around old numbers,”', pts: 3, coach: 'Observable and checkable. They can’t dispute it, so they don’t have to defend it.' }]},
      { key: 'Impact', opts: [
        { t: '“and it’s really unprofessional.”', pts: 1, coach: 'A verdict on their character, not an impact. Verdicts get appealed; impacts get fixed.' },
        { t: '“and it slows the whole team down.”', pts: 2, coach: 'True but generic. Sharpen it with what actually happened because of it.' },
        { t: '“and the team spent twenty minutes re-planning, so two people missed the client call.”', pts: 3, coach: 'Concrete cost, no verdict attached. Now the problem is the problem, not them.' }]}
    ];
    var picks = [null, null, null];
    var slotsEl = $('#labSlots'), runBtn = $('#labRun'), statusEl = $('#labStatus'), outEl = $('#labOutcome');
    // Branching: slots open one at a time, and every slot after the first carries a
    // situation set by the learner's first move, so that move stays in the room.
    var BRANCH = { 1: ["You open with \"You always do this.\" Their shoulders go up before you finish the sentence. They are already searching for the one time it was not true. Whatever you say next lands on someone who has started defending. Choose what you name as the behavior.", "You open with \"Lately, in meetings.\" They nod slowly, waiting. Nothing to argue with yet, and nothing to hold onto either. Which meetings, and when, is still fog. They are listening, half on guard. Choose what you name as the behavior.", "You open with \"In our last two Monday planning meetings.\" They know exactly which meetings you mean. No verdict has been passed, so there is nothing to push back on yet. They are listening, and the room is still calm. Choose what you name as the behavior."], 2: ["Whatever you named, it arrived after \"always.\" They are half listening and half building a case. The Thursday they stayed late, the week they covered for someone. The actual problem is still fighting for space in the conversation. Say what it cost, and see if it gets heard.", "Whatever you named, it came wrapped in \"lately.\" They are not fighting, but they are not sure what you mean either. The fog gave them room to shrug. Now comes the cost. What you say here decides whether they fix something or wait you out.", "The time and place were plain, and they are still with you. Nothing so far gave them anything to defend. The conversation is about the work, and it can stay that way. Now say what it cost. This is where it stays about the work, or stops."] };
    var CARRY = ["\"You always\" put them on trial before the behavior was named, so every part after it landed on a defense.", "\"Lately\" gave them nothing to argue with and nothing to picture, so the deflection had room to grow.", "Two named meetings gave them a fact instead of a feeling, so the rest landed on someone still listening."];
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
          statusEl.textContent = ready ? 'Ready, deliver it' :
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
      strong: '“Oh. I didn’t realize the doc was stale going into those meetings. That’s on me. Can we add a Friday reminder? I’ll have it current before Monday.” They’re solving, not defending.',
      mid: '“I mean… okay, I guess I could be more on top of it. It’s been a crazy month for everyone though.” Partial ownership, plus a deflection. You’ll be having this talk again.',
      weak: '“Wow. So I don’t care about the team now? I stayed until seven on Thursday, but sure.” They’re defending their character, because that’s what you attacked. The actual problem never came up.'
    };
    runBtn.addEventListener('click', function () {
      var score = picks.reduce(function (t, p, i) { return t + SLOTS[i].opts[p].pts; }, 0); // 3..9
      var pct = Math.round((score / 9) * 100);
      var tier = score >= 8 ? 'strong' : score >= 6 ? 'mid' : 'weak';
      var head = tier === 'strong' ? 'It landed. Specific, fair, and about the work, so the reply is about the work too.'
               : tier === 'mid' ? 'Half landed. Vague pieces give them room to deflect, and they took it.'
               : 'It landed as an attack. When feedback judges character, people defend character.';
      var coach = picks.map(function (p, i) { return '<div><b>' + SLOTS[i].key + ':</b> ' + SLOTS[i].opts[p].coach + '</div>'; }).join('');
      outEl.innerHTML = '<span class="tag">How it lands · ' + score + ' / 9</span>' +
        '<div class="lab__meter"><span style="width:0"></span></div>' +
        '<p style="margin:0;color:#fff;font-weight:500">' + head + '</p>' +
        '<div class="sample">' + REACTIONS[tier] + '</div>' +
        (CARRY[picks[0]] ? '<p class="lab__carry"><b>What your first move set in motion:</b> ' + CARRY[picks[0]] + '</p>' : '') +
        '<div class="lab__coach">' + coach + '</div>' +
        (tier !== 'strong' ? '<p class="why" style="margin-top:1rem"><b>Try again:</b> upgrade your weakest part and re-deliver. Watch the reaction change.</p>'
                           : '<p class="why" style="margin-top:1rem"><b>Now the real thing:</b> apply the same three-part structure to the conversation you named in Section 01.</p>');
      outEl.hidden = false;
      requestAnimationFrame(function () {
        var bar = $('.lab__meter span', outEl);
        if (bar) requestAnimationFrame(function () { bar.style.width = pct + '%'; });
      });
      outEl.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'nearest' });
    });
  }

  /* ---------- INTERACTIVE: BRAVING self-scorecard ---------- */
  var braving = $('#braving');
  if (braving) {
    var ROWS = [
      { k: 'Boundaries', d: 'I’m clear about what’s okay and not okay, and I ask instead of assuming.',
        fix: 'Practice one clear, kind “no” this week, and honor the next boundary someone sets with you.' },
      { k: 'Reliability', d: 'I do what I say I’ll do, repeatedly, and I don’t overpromise.',
        fix: 'Shrink one commitment today to a size you will definitely keep. Reliability is built in small, boring reps.' },
      { k: 'Accountability', d: 'I own my mistakes, apologize, and make amends, without being asked.',
        fix: 'Own one miss out loud this week, before anyone raises it. It buys you the right to ask the same of others.' },
      { k: 'Vault', d: 'What’s shared with me in confidence stays with me, including other people’s stories.',
        fix: 'Catch yourself before the next “don’t tell anyone, but…” Even harmless leaks teach people you leak.' },
      { k: 'Integrity', d: 'I choose courage over comfort and practice my values, not just profess them.',
        fix: 'Pick the next uncomfortable-but-right call and make it visibly. One is worth a hundred posters.' },
      { k: 'Nonjudgment', d: 'People can ask me for help, or admit a struggle, without being judged for it.',
        fix: 'Ask someone for help this week. Letting people help you is what makes it safe for them to ask.' },
      { k: 'Generosity', d: 'I assume the most generous interpretation of others’ words and actions first.',
        fix: 'Next time you’re wronged, write the generous version of why before the damning one. Then check.' }
    ];
    var scores = ROWS.map(function () { return null; });
    var outEl3 = $('#bravingOut');
    ROWS.forEach(function (row, ri) {
      var d = document.createElement('div');
      d.className = 'braving__row';
      d.innerHTML = '<div class="braving__label"><b>' + row.k + '</b><p>' + row.d + '</p></div>';
      var scale = document.createElement('div');
      scale.className = 'braving__scale';
      scale.setAttribute('role', 'group');
      scale.setAttribute('aria-label', row.k + ', rate 1 low to 5 high');
      for (var v = 1; v <= 5; v++) {
        (function (val) {
          var b = document.createElement('button');
          b.className = 'braving__dot';
          b.type = 'button';
          b.textContent = val;
          b.setAttribute('aria-label', row.k + ': ' + val + ' of 5');
          b.setAttribute('aria-pressed', 'false');
          b.addEventListener('click', function () {
            scores[ri] = val;
            $$('.braving__dot', scale).forEach(function (x, xi) {
              x.classList.toggle('on', xi < val);
              x.setAttribute('aria-pressed', String(xi + 1 === val));
            });
            if (scores.every(function (s) { return s !== null; })) {
              var min = Math.min.apply(null, scores);
              var lows = ROWS.filter(function (r, i) { return scores[i] === min; });
              var pick = lows[0];
              outEl3.innerHTML = '<span class="tag">Your growth edge · private</span>' +
                '<p style="margin:.5rem 0 0;color:#fff;font-weight:500">Lowest score: <b>' +
                lows.map(function (l) { return l.k; }).join(' & ') + '</b> (' + min + '/5)</p>' +
                '<div class="sample">' + pick.fix + '</div>' +
                '<p class="why" style="margin-top:1rem"><b>Carry it forward:</b> this behavior is probably why your hardest conversation feels risky. Strengthening it lowers the stakes before you say a word.</p>';
              outEl3.hidden = false;
            }
          });
          scale.appendChild(b);
        })(v);
      }
      d.appendChild(scale);
      braving.appendChild(d);
    });
  }

  /* ---------- INTERACTIVE: My Conversation Plan capstone ---------- */
  var planEl = $('#convoPlan');
  if (planEl) {
    var pick = { loud: null, drift: null, when: null };
    var whoIn = $('#planWho'), buildBtn = $('#planBuild'), statusEl2 = $('#planStatus'), outEl2 = $('#planOut');
    function planReady() {
      var ok = whoIn.value.trim().length >= 8 && pick.loud && pick.drift && pick.when;
      buildBtn.disabled = !ok;
      statusEl2.textContent = ok ? 'Ready, build it' : 'Fill in all four parts';
      return ok;
    }
    whoIn.addEventListener('input', planReady);
    [['#planLoud', 'loud', 'data-loud'], ['#planDrift', 'drift', 'data-drift'], ['#planWhen', 'when', 'data-when']].forEach(function (cfg) {
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
    var LOUD = {
      what: 'You disagree on the facts, so start from the third story: “I think we see this differently, and I want to understand your version.” Bring the record; hold it lightly.',
      feel: 'There’s emotion in the room, so name yours once, plainly: “I’ll be honest, this has been frustrating me.” Named feelings inform; leaked feelings poison.',
      identity: 'The loud voice is about you, not them. Answer it before you walk in: raising a problem doesn’t make you a bad manager. Avoiding one does.'
    };
    var DRIFT = {
      soft: 'Your risk is Ruinous Empathy: sanding the message down until it disappears. Counter-move: write the one sentence that must survive, and say it in the first minute.',
      hard: 'Your risk is Obnoxious Aggression: winning the exchange and losing the person. Counter-move: state your care out loud first, and end every point with a genuine question.',
      avoid: 'Your risk is the meeting never happening. Counter-move: send the calendar invite the moment you finish this plan. Scheduled beats brave.'
    };
    var WHEN = { tomorrow: 'tomorrow', threedays: 'within the next 3 days', week: 'within 7 days' };
    buildBtn.addEventListener('click', function () {
      if (!planReady()) return;
      var who = whoIn.value.trim();
      var opener = '“I want to talk about [the topic], because I want [the outcome you both want]. Here’s what I’ve noticed: in [situation], [the behavior a camera would see], and the impact was [the concrete cost]. I might not have the full picture. How do you see it?”';
      var contrast = '“I don’t mean [the conclusion they might jump to]. I do mean [your one-sentence message].”';
      var rows = '' +
        '<div class="row"><b>The conversation</b><span>' + who.replace(/</g, '&lt;') + '</span></div>' +
        '<div class="row"><b>My opener</b><span class="plan__prompt">' + opener + '</span></div>' +
        '<div class="row"><b>My inner voice</b><span>' + LOUD[pick.loud] + '</span></div>' +
        '<div class="row"><b>My drift &amp; counter-move</b><span>' + DRIFT[pick.drift] + '</span></div>' +
        '<div class="row"><b>If it gets heated</b><span class="plan__prompt">' + contrast + '</span></div>' +
        '<div class="row"><b>The commitment</b><span>I will have this conversation ' + WHEN[pick.when] + ', scheduled and private, and I will tell one colleague I’m doing it.</span></div>';
      outEl2.innerHTML = '<span class="tag">My conversation plan</span>' +
        '<div class="plan__out-grid">' + rows + '</div>' +
        '<div class="lab__runrow" style="margin-top:1.25rem">' +
        '<button class="btn" id="planCopy">Copy my plan</button>' +
        '<span class="quiz__progress" id="planCopied" style="color:rgba(255,255,255,.6)">Fill in the brackets tonight, while it’s fresh</span></div>';
      outEl2.hidden = false;
      $('#planCopy').addEventListener('click', function () {
        var text = 'MY CONVERSATION PLAN (Navigating Difficult Conversations, Vanderbilt)\n' +
          'The conversation: ' + who + '\n' +
          'Opener: ' + opener + '\n' +
          'Inner voice: ' + LOUD[pick.loud] + '\n' +
          'Drift & counter-move: ' + DRIFT[pick.drift] + '\n' +
          'If it gets heated: ' + contrast + '\n' +
          'Commitment: ' + WHEN[pick.when] + ', scheduled and private. Tell one colleague.';
        (navigator.clipboard ? navigator.clipboard.writeText(text) : Promise.reject()).then(function () {
          $('#planCopied').textContent = 'Copied. Paste it into notes or email, then send the calendar invite.';
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
      { q: 'The Three Conversations model says every difficult exchange contains…',
        opts: ['Facts, opinions, and lies', 'A What Happened, a Feelings, and an Identity conversation', 'A winner, a loser, and a witness', 'A past, a present, and a future'],
        correct: 1, why: 'Stone, Patton & Heen: the facts battle, the emotions under it, and the quiet "what does this say about me."' },
      { q: 'Which of these is a Behavior statement, as SBI defines it?',
        opts: ['"You’re careless with details"', '"The report went out with last quarter’s numbers in the summary table"', '"You obviously don’t take this seriously"', '"You need a better attitude"'],
        correct: 1, why: 'The camera test: SBI behavior is what was observably done, with no verdict or mind-read attached.' },
      { q: 'STATE says to open a candid conversation by…',
        opts: ['Stating your conclusion firmly so there’s no confusion', 'Sharing the facts first, then your story, tentatively', 'Asking how their weekend was to soften them up', 'Putting it in writing to avoid the face-to-face'],
        correct: 1, why: 'Facts are the least controversial start. Your interpretation follows, owned as a story, not a verdict.' },
      { q: 'In BRAVING, the Vault is…',
        opts: ['Keeping confidences, including other people’s stories', 'Saving feedback for the annual review', 'Locking decisions once they’re made', 'Your emergency fund of goodwill'],
        correct: 0, why: 'What’s shared with you stays with you. Every leak, even a small one, teaches people you leak.' },
      { q: 'Praising someone in the meeting, then criticizing them once they leave, is…',
        opts: ['Ruinous Empathy', 'Radical Candor', 'Manipulative Insincerity', 'Obnoxious Aggression'],
        correct: 2, why: 'Neither care nor direct challenge, just performance. Kim Scott calls it the fastest trust-killer on the grid.' },
      { q: 'They snap: "So I’m terrible at my job?" The recovery move is…',
        opts: ['Retract it: "forget I said anything"', 'A contrast statement: "I don’t mean that. I do mean these two deadlines slipped."', 'Double down: "your words, not mine"', 'End the meeting immediately'],
        correct: 1, why: 'Contrast kills the wrong conclusion and keeps the real message. Safety restored, standard intact.' }
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
      var msg = pct >= 80 ? 'You have the toolkit. The only thing left is the conversation itself.' :
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

  /* When it goes sideways (Section 08): a direct report reacts to SBI feedback */
  makeDialogue({
    root: '#sidewaysDialogue', log: '#sdLog', options: '#sdOptions', feedback: '#sdFeedback',
    progress: '#sdProgress', next: '#sdNext', result: '#sdResult', nudge: '#sdNudge', ask: '#sdAsk',
    them: 'Direct report', you: 'You',
    grades: {
      3: { word: '✓ Strong move.', color: 'var(--vu-gold-flat)' },
      2: { word: '~ Half a move.', color: 'rgba(255,255,255,.85)' },
      1: { word: '✗ Costly move.', color: '#c76b5a' }
    },
    turns: [
      { line: 'So you’re saying I’m bad at my job? I’ve been here past six every night this month.',
        opts: [
          { t: 'Nobody said that. But if you’d sent the updates, we wouldn’t be having this talk.', pts: 1,
            reply: 'Right. So it is about me. Do you want to know what else I’ve been carrying, or is this just about the doc?',
            note: '“If you’d sent the updates” is blame wearing a fact costume. They heard the verdict, not the fact, and now they are defending their character.' },
          { t: 'No. I don’t think you’re bad at your job. I do think the last three Monday updates didn’t go out, and I want to understand why. What was going on?', pts: 3,
            reply: '(Silence. They look at the table.)',
            note: 'A contrast statement, then a real question. You killed the wrong conclusion, kept the message, and asked about intent instead of guessing it. The silence is processing. Count to six.' },
          { t: 'No, no, sorry, I didn’t mean it like that. The updates aren’t a huge deal, I just noticed.', pts: 2,
            reply: 'Okay. Good. Because honestly I thought this was going somewhere else.',
            note: 'You restored safety by taking the message back. That is Ruinous Empathy: they heard “not a huge deal,” and the missed updates just became weather.' }
        ]},
      { line: [
          'Look, the doc obviously matters to you. But I’m the one covering the intake queue, and nobody asked how that was going.',
          '(You count to six. Then, quietly:) I didn’t realize it had been three weeks. The queue eats the mornings, and the update just slides.',
          'Honestly, it’s just the month. Two launches plus the intake queue, and the update doc is the first thing that drops. It’ll settle.'
        ],
        opts: [
          { t: 'So what I’m hearing is that the update is the first thing to drop when the week gets heavy. What else should I know?', pts: 3,
            reply: [
              'Yeah. That’s it, actually. It’s not that I don’t care about the doc.',
              'Yeah. I kept thinking I’d catch up on Friday, and Friday never came.',
              'Yeah. And I probably should have said something instead of letting it go.'
            ],
            note: 'Paraphrase before you reply, then one real follow-up. You proved you heard it before you answered it, and the defending stopped.' },
          { t: 'Okay. Let’s fix it: block fifteen minutes every Monday at nine for the update. Problem solved.', pts: 2,
            reply: [
              'Fine. Monday at nine. (Arms crossed.)',
              'Okay. I can do that.',
              'Sure, I can try. It’s more that the queue is unpredictable, but okay.'
            ],
            note: 'A plan before a paraphrase. The fix is reasonable, but it is yours, and they had not finished talking. Question 3 gets built together, not delivered.' },
          { t: 'Everyone’s busy. The rest of the team gets their updates in.', pts: 1,
            reply: [
              'The rest of the team isn’t covering intake. But sure, I’ll be more like them.',
              '(Silence again, longer this time.) Okay.',
              'Right. Okay. Never mind, then.'
            ],
            note: 'Countering before acknowledging, with a comparison on top. You are back in the What Happened battle, and their identity is the stake.' }
        ]},
      { line: [
          'Honestly? The intake queue doubled in August, and I didn’t say anything because I figured I should handle it. Sending the update felt like admitting I couldn’t.',
          'Sure. Monday at nine. Fine.',
          'Then maybe give the queue to someone on the rest of the team.'
        ],
        opts: [
          { t: 'That makes sense from where you sit. I’d rather hear that early than find out from the doc. What would make the update easy enough to send even in a heavy week?', pts: 3,
            reply: [
              'Three bullets instead of the full doc. And if I flag the queue on a Monday, you’ll actually hear it?',
              'Um. Okay. Maybe three bullets instead of the whole doc? I could do that.',
              'I don’t know. Three bullets, maybe. If that’s enough.'
            ],
            note: 'Acknowledge before you counter, then build the plan together. Whoever writes the plan owns it, and notice who proposed the fix.' },
          { t: 'Okay. Send it every Monday from now on, and let me know if the queue gets bad again.', pts: 2,
            reply: ['Okay. I’ll try.', 'Fine. Monday.', 'Fine.'],
            note: 'A clear standard, and still your plan alone. They will comply at best, and “let me know” hands the next hard conversation back to them.' },
          { t: 'Well, we all have a lot on our plates. I need the updates. Let’s leave it there.', pts: 1,
            reply: ['Sure. (They pick up their laptop.)', 'Right.', 'Got it. (They are already at the door.)'],
            note: 'You closed the conversation on your terms and lost the answer you were about to get. The problem is still there, and now so is the wall.' }
        ]}
    ],
    endings: {
      strong: { head: 'It held. Safety came back and the message survived.',
        text: 'You killed the wrong conclusion, kept the real one, listened before you answered, and let them write the fix. The update goes out Monday, and the queue problem, which you did not know about ten minutes ago, is on the table too.' },
      mid: { head: 'Half held. The message survived, but one turn went one-sided.',
        text: 'Either you took the message back to end the discomfort, or you delivered a plan instead of building one. Expect the Monday update for two weeks. Then watch for the slide, because the reason for it never came up.' },
      weak: { head: 'It went sideways and stayed there.',
        text: 'Each turn met defensiveness with a verdict or a retreat, so you were both defending identities and nobody was solving anything. The update is still missing, and next time they will bring a lawyer’s answer.' }
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
