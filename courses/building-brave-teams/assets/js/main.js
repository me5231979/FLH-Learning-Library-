/* =====================================================================
   BUILDING BRAVE TEAMS, classroom deck interactions
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
    // excluded margin, reveal them directly
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

  /* ---------- INTERACTIVE: Edmondson 7-item survey (Section 02) ---------- */
  var psWrap = $('#psSurvey');
  if (psWrap) {
    // Edmondson (1999). Items marked reverse are scored 6 − rating.
    var PS_ITEMS = [
      { t: 'If you make a mistake on this team, it is often held against you.', reverse: true },
      { t: 'Members of this team are able to bring up problems and tough issues.', reverse: false },
      { t: 'People on this team sometimes reject others for being different.', reverse: true },
      { t: 'It is safe to take a risk on this team.', reverse: false },
      { t: 'It is difficult to ask other members of this team for help.', reverse: true },
      { t: 'No one on this team would deliberately act in a way that undermines my efforts.', reverse: false },
      { t: 'Working with members of this team, my unique skills and talents are valued and utilized.', reverse: false }
    ];
    var PS_BANDS = [
      { min: 28, label: 'Working safety',
        text: 'Your team clears the bar on most items: risk is affordable here. The work now is protecting it, safety erodes one bad response to bad news at a time, and pairing it with equally high standards.' },
      { min: 18, label: 'Mixed signals',
        text: 'Some risks are affordable on your team; others aren’t, and everyone has quietly mapped which is which. Your lowest item is the rung to build: it names the exact risk your team is still pricing too high.' },
      { min: 7, label: 'Running on silence',
        text: 'Most interpersonal risks feel expensive on this team, which means you’re hearing agreement, not truth. Start at Inclusion: names, invitations, and a leader who goes first on "I was wrong."' }
    ];
    var psAnswers = new Array(PS_ITEMS.length);
    var psCount = $('#psCount'), psOut = $('#psOut');
    PS_ITEMS.forEach(function (item, i) {
      var row = document.createElement('div');
      row.className = 'braving__row';
      var dots = '';
      for (var v = 1; v <= 5; v++) {
        dots += '<button type="button" class="braving__dot" data-i="' + i + '" data-v="' + v + '" aria-label="Rate item ' + (i + 1) + ': ' + v + ' of 5">' + v + '</button>';
      }
      row.innerHTML = '<div class="braving__label"><b>Item ' + (i + 1) + '</b><p>' + item.t + '</p></div>' +
        '<div class="braving__scale" role="group" aria-label="1 = strongly disagree, 5 = strongly agree">' + dots + '</div>';
      psWrap.appendChild(row);
    });
    var psUpdate = function () {
      var answered = psAnswers.filter(function (v) { return v; }).length;
      psCount.textContent = answered + ' of ' + PS_ITEMS.length + ' answered · 1 = strongly disagree, 5 = strongly agree';
      if (answered < PS_ITEMS.length) { psOut.hidden = true; return; }
      var total = 0, lowest = 0, lowestScore = 6;
      psAnswers.forEach(function (v, i) {
        var s = PS_ITEMS[i].reverse ? 6 - v : v;
        total += s;
        if (s < lowestScore) { lowestScore = s; lowest = i; }
      });
      var band = PS_BANDS.find(function (b) { return total >= b.min; });
      psOut.hidden = false;
      psOut.innerHTML = '<span class="tag">' + band.label + ' · ' + total + ' / 35</span>' +
        '<p style="margin:.75rem 0 0;color:rgba(255,255,255,.88)">' + band.text + '</p>' +
        '<p class="why" style="margin:.75rem 0 0"><b>Your lowest item:</b> “' + PS_ITEMS[lowest].t + '” That item is your team’s work, bring it (not your total) to the table discussion.</p>';
    };
    psWrap.addEventListener('click', function (e) {
      var b = e.target.closest('.braving__dot');
      if (!b) return;
      var i = +b.getAttribute('data-i'), v = +b.getAttribute('data-v');
      psAnswers[i] = v;
      $$('.braving__dot[data-i="' + i + '"]', psWrap).forEach(function (d) {
        d.classList.toggle('on', +d.getAttribute('data-v') <= v);
      });
      psUpdate();
    });
    psUpdate();
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

  /* Safety, or something else? (Section 01) */
  makeTrainer({
    root: '#mythMatch', q: '#mtQ', options: '#mtOptions', feedback: '#mtFeedback',
    progress: '#mtProgress', next: '#mtNext', result: '#mtResult',
    progressWord: 'Snapshot', goodColor: 'var(--vu-oak)',
    resultColor: 'var(--ink-soft, #555)', passAt: 4,
    passMsg: 'You can tell the construct from its impostors. That eye is what keeps a safety effort from becoming a niceness campaign.',
    failMsg: 'Close. The test: is interpersonal RISK affordable here? Comfort without candor is niceness; forgiveness without standards is a lowered bar. Safety makes the hard thing sayable, with the bar still high.',
    labels: ['Psychological safety', 'Niceness in disguise', 'Lowered standards'],
    items: [
      { q: 'The team argues hard about the proposal in the meeting, pointed questions, open disagreement, then commits to the decision. Nobody’s standing suffers for having dissented.',
        answer: 0, why: 'Safety: risk was taken, out loud, before the decision, and it cost no one. Conflict about ideas plus commitment afterward is the signature.' },
      { q: 'Everyone sees the flaw in the plan. Nobody mentions it, because the author worked so hard and it would be unkind to embarrass them.',
        answer: 1, why: 'Niceness in disguise: comfort is being protected at the cost of candor. The plan ships flawed, and everyone learns the flaw was known.' },
      { q: '"Mistakes are no big deal here." Deadlines slip, quality dips, and there’s no post-mortem, raising either would feel like breaking the vibe.',
        answer: 2, why: 'Lowered standards: forgiveness without accountability. Edmondson’s target is both dials high, safe to err AND expected to learn from it.' },
      { q: 'A new analyst tells the VP, in front of the whole room, "I don’t understand this model." The VP walks through it, and thanks them for asking.',
        answer: 0, why: 'Safety, specifically Learner safety: looking ignorant was affordable, and the response, the part everyone was watching, made it more affordable next time.' },
      { q: 'Team norm: feedback is positives-only, because criticism hurts morale. Reviews are glowing; the same problems recur every quarter.',
        answer: 1, why: 'Niceness in disguise: a rule against candor wearing safety’s name badge. Real safety makes critique survivable, not forbidden.' }
    ]
  });

  /* ---------- INTERACTIVE: Johari window builder (Section 04) ---------- */
  var jhGrid = $('#jhGrid');
  if (jhGrid) {
    // The standard 56 Johari adjectives (Luft & Ingham)
    var ADJ = ['able', 'accepting', 'adaptable', 'bold', 'brave', 'calm', 'caring', 'cheerful',
      'clever', 'complex', 'confident', 'dependable', 'dignified', 'empathetic', 'energetic',
      'extroverted', 'friendly', 'giving', 'happy', 'helpful', 'idealistic', 'independent',
      'ingenious', 'intelligent', 'introverted', 'kind', 'knowledgeable', 'logical', 'loving',
      'mature', 'modest', 'nervous', 'observant', 'organized', 'patient', 'powerful', 'proud',
      'quiet', 'reflective', 'relaxed', 'religious', 'responsive', 'searching', 'self-assertive',
      'self-conscious', 'sensible', 'sentimental', 'shy', 'silly', 'spontaneous', 'sympathetic',
      'tense', 'trustworthy', 'warm', 'wise', 'witty'];
    var jhOpen = [], jhHidden = [];
    var jhCountEl = $('#jhCount'), jhBuild = $('#jhBuild'), jhStatus = $('#jhStatus'), jhOut = $('#jhOut');
    ADJ.forEach(function (word) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'adj';
      b.textContent = word;
      b.setAttribute('aria-label', word + ': not selected');
      b.addEventListener('click', function () {
        var state = b.getAttribute('data-state');
        if (!state) {
          if (jhOpen.length >= 6) {
            jhStatus.textContent = 'Six claimed is the max \u2014 tap one off to claim another. The limit is the exercise.';
            return;
          }
          jhOpen.push(word);
          b.setAttribute('data-state', 'open');
          b.setAttribute('aria-label', word + ': claimed for my Open pane');
        } else if (state === 'open') {
          jhOpen.splice(jhOpen.indexOf(word), 1);
          if (jhHidden.length >= 3) {
            b.removeAttribute('data-state');
            b.setAttribute('aria-label', word + ': not selected');
          } else {
            jhHidden.push(word);
            b.setAttribute('data-state', 'hidden');
            b.setAttribute('aria-label', word + ': true of me, held back in my Hidden pane');
          }
        } else {
          jhHidden.splice(jhHidden.indexOf(word), 1);
          b.removeAttribute('data-state');
          b.setAttribute('aria-label', word + ': not selected');
        }
        jhUpdate();
      });
      jhGrid.appendChild(b);
    });
    function jhUpdate() {
      jhCountEl.textContent = 'Open: ' + jhOpen.length + ' of 5\u20136 claimed \u00b7 Hidden: ' + jhHidden.length + ' of 3 held back';
      var ok = jhOpen.length >= 5;
      jhBuild.disabled = !ok;
      jhStatus.textContent = ok ? 'Ready, build my window' : 'Claim at least 5 words first';
      jhOut.hidden = true;
    }
    jhBuild.addEventListener('click', function () {
      if (jhOpen.length < 5) return;
      var hiddenHtml = jhHidden.length
        ? '<p class="jwin__words">' + jhHidden.join(' \u00b7 ') + '</p><p>True of you, withheld for now \u2014 and holding them is legitimate. Moving any one of them to Open is disclosure, always yours to pace.</p>'
        : '<p>Empty this round, and that is a real answer too. If a true word came to mind that you would not volunteer, that was this pane working.</p>';
      jhOut.innerHTML = '<span class="tag">My Johari window \u00b7 opening state</span>' +
        '<div class="jwin jwin--out">' +
        '<span class="jwin__corner" aria-hidden="true"></span>' +
        '<span class="jwin__col">Known to self</span>' +
        '<span class="jwin__col">Not known to self</span>' +
        '<span class="jwin__row">Known to others</span>' +
        '<div class="jwin__pane jwin__pane--open"><h4>Open area</h4><p class="jwin__words">' + jhOpen.join(' \u00b7 ') + '</p><p>Your claim, made. In the room, teammate stickies that match these words confirm the pane.</p></div>' +
        '<div class="jwin__pane"><h4>Blind spot</h4><p>Only feedback fills this pane \u2014 no amount of reflection can. Send your claimed words to two colleagues and ask each for two words back from the same list; whatever returns that you did not claim lands here.</p></div>' +
        '<span class="jwin__row">Not known to others</span>' +
        '<div class="jwin__pane"><h4>Hidden area</h4>' + hiddenHtml + '</div>' +
        '<div class="jwin__pane"><h4>Unknown</h4><p>Leave it open. This pane shrinks through new challenges and shared experience \u2014 the crisis that reveals the calm commander \u2014 not through the exercise.</p></div>' +
        '</div>' +
        '<div class="lab__runrow" style="margin-top:1.25rem">' +
        '<button class="btn" id="jhCopy">Copy my window</button>' +
        '<span class="quiz__progress" id="jhCopied" style="color:rgba(255,255,255,.6)">Bring it to the session, or run the two-colleague version this week</span></div>';
      jhOut.hidden = false;
      $('#jhCopy').addEventListener('click', function () {
        var text = 'MY JOHARI WINDOW \u2014 OPENING STATE (Building Brave Teams, Vanderbilt)\n' +
          'OPEN (claimed): ' + jhOpen.join(', ') + '\n' +
          'HIDDEN (held back \u2014 keep private): ' + (jhHidden.length ? jhHidden.join(', ') : 'none this round') + '\n' +
          'BLIND: ask two colleagues \u2014 \u201cFrom the standard Johari list, which two words describe me? No commentary needed.\u201d Whatever returns that I did not claim goes here.\n' +
          'UNKNOWN: leave it open; time and challenge shrink it.';
        (navigator.clipboard ? navigator.clipboard.writeText(text) : Promise.reject()).then(function () {
          $('#jhCopied').textContent = 'Copied. The Hidden line is for your eyes \u2014 share the Open line freely.';
        }, function () {
          $('#jhCopied').textContent = 'Select the window text above and copy it manually.';
        });
      });
      jhOut.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'nearest' });
    });
    jhUpdate();
  }

  /* Sort the sticky (Section 04) */
  makeTrainer({
    root: '#stickySort', q: '#ssQ', options: '#ssOptions', feedback: '#ssFeedback',
    progress: '#ssProgress', next: '#ssNext', result: '#ssResult',
    progressWord: 'Sticky', goodColor: 'var(--vu-gold-flat)',
    resultColor: 'rgba(255,255,255,.85)', passAt: 4,
    passMsg: 'You can run the mapping. In the room, do it silently and privately, the sorting is where the self-awareness happens.',
    failMsg: 'Close. The rules: they wrote it and you’d claim it → Open. They wrote it, you wouldn’t have → Blind. You know it, you didn’t share it → Hidden. Nobody knows yet → Unknown.',
    labels: ['Open (Arena)', 'Blind spot', 'Hidden (Façade)', 'Unknown'],
    items: [
      { q: 'A teammate’s sticky says "organized", one of the five words Jordan chose for themselves.',
        answer: 0, why: 'Open: known to Jordan, now confirmed known to others. Matches between your claim and their stickies are the Arena.' },
      { q: 'Two stickies say "witty." Jordan has never once thought of themselves as funny.',
        answer: 1, why: 'Blind spot: others see it; Jordan doesn’t. Only feedback could have surfaced it, no amount of self-reflection finds the pane you can’t see into.' },
      { q: 'Jordan is quietly "searching", actively rethinking their career, but chose not to pick that word, and no sticky mentions it.',
        answer: 2, why: 'Hidden: known to self, withheld from others. It stays Hidden until Jordan chooses disclosure, and that choice is always Jordan’s to make.' },
      { q: 'A sticky says "tense." Jordan is startled, then remembers three meetings this month where their jaw ached afterward.',
        answer: 1, why: 'Blind spot, being recognized in real time. The startle-then-recall reaction is exactly what Blind feedback feels like when it’s accurate.' },
      { q: 'Six months later, in a genuine crisis, Jordan turns out to be a calm, decisive incident commander. Nobody, including Jordan, had ever seen it.',
        answer: 3, why: 'Unknown: known to no one until a new situation surfaced it. This pane shrinks through time and challenge, not through the exercise.' }
    ]
  });

  /* Expand or contract? (Section 05) */
  makeTrainer({
    root: '#exMatch', q: '#exQ', options: '#exOptions', feedback: '#exFeedback',
    progress: '#exProgress', next: '#exNext', result: '#exResult',
    progressWord: 'Move', goodColor: 'var(--vu-oak)',
    resultColor: 'var(--ink-soft, #555)', passAt: 6,
    passMsg: 'You see the transactions now. The next meeting you sit in will look different, watch for the contract moves that sound harmless.',
    failMsg: 'Close. The test for every move: does it make interpersonal risk cheaper or more expensive for the people watching? The audience, not the target, is where safety is won or lost.',
    labels: ['Expands safety', 'Contracts safety'],
    items: [
      { q: 'The meeting opens with the leader inviting the newest person in the room, by name, to give their read first.',
        answer: 0, why: 'Expands, Inclusion. Belonging is granted before performance, and the invitation tells everyone junior voices go first here, not last.' },
      { q: '"As we all know…" before making a point.',
        answer: 1, why: 'Contracts, Learner. Three words that make every question expensive: anyone who didn’t know now can’t ask without admitting they’re behind.' },
      { q: 'The most senior person in the room says "I don’t know, what am I missing?" and then actually waits.',
        answer: 0, why: 'Expands, Learner. Normalized fallibility from the top makes not-knowing affordable for everyone below. The waiting is the proof it was real.' },
      { q: 'A visible eye-roll when someone asks a question that was "covered in the doc."',
        answer: 1, why: 'Contracts, Learner. The question cost one person; the eye-roll taxed everyone watching. Next meeting has fewer questions and the same confusion.' },
      { q: 'Presenting the plan upward as "Maria’s framing, which held up when we pressure-tested it."',
        answer: 0, why: 'Expands, Contributor. Credit traveled with the idea, publicly, upward. Contribution just became a good investment on this team.' },
      { q: 'Quietly redoing a teammate’s work overnight and presenting the fixed version without telling them.',
        answer: 1, why: 'Contracts, Contributor. The message received: your work isn’t trusted and you won’t even hear about it. Ownership stops being offered.' },
      { q: '"Push back on this, I mean it. Steel-man the case against before we commit."',
        answer: 0, why: 'Expands, Challenger. Dissent is explicitly invited and structured. Paired with a non-punishing response, this is the top rung being built.' },
      { q: 'The debate ends the moment the highest-paid person states a preference; the room reorganizes around it.',
        answer: 1, why: 'Contracts, Challenger. HiPPO decision-making: rank settled what evidence should have. Everyone logged that challenging costs more than it pays.' }
    ]
  });

  /* Fix the feedback (Section 06) */
  makeTrainer({
    root: '#sbiSpot', q: '#sbQ', options: '#sbOptions', feedback: '#sbFeedback',
    progress: '#sbProgress', next: '#sbNext', result: '#sbResult',
    progressWord: 'Attempt', goodColor: 'var(--vu-oak)',
    resultColor: 'var(--ink-soft, #555)', passAt: 4,
    passMsg: 'Your ear is calibrated. Now the harder rep: say one of these out loud, about something real, to a person. That’s the rehearsal.',
    failMsg: 'Close. The checklist: a specific Situation ("in yesterday’s meeting"), camera-visible Behavior (not a verdict), an Impact owned with "I," and an Ask that opens a conversation.',
    labels: ['No situation anchor', 'Judgment instead of behavior', 'No impact named', 'No ask at the end'],
    items: [
      { q: '"You’re always so dismissive in meetings."',
        answer: 1, why: '"Dismissive" is a verdict, not a behavior, no camera ever recorded "dismissive." And "always" turns one moment into a character trial. Name the interruption, the phone, the turned back.' },
      { q: '"In yesterday’s review, you interrupted Priya twice while she presented the numbers." …and that’s the whole message.',
        answer: 2, why: 'Situation and behavior are clean, but why does it matter? Without impact ("she didn’t speak again; I’m worried we lost her read"), it’s surveillance, not feedback.' },
      { q: '"Sometimes, in general, people’s ideas kind of get cut off around here, you know?"',
        answer: 0, why: 'No anchor: no meeting, no moment, no name, the receiver can’t locate a single thing to change. Vagueness feels safer to say and lands as noise.' },
      { q: '"In Tuesday’s standup, when you took the budget question offline, I left unsure whether a decision had been made, and I’ve been blocked since." …then the subject changes.',
        answer: 3, why: 'Perfect S, B, and I, then the door closes. Without "can we talk about how to close those loops?", the receiver has been informed, not invited. The Ask is what makes it a conversation.' },
      { q: '"You clearly don’t respect the team’s time."',
        answer: 1, why: 'A motive verdict, "clearly" plus a mind-read. Nobody accepts a diagnosis of their own intent. The observable version: "the last three standups started 10+ minutes late, and…"' }
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


  /* ---------- INTERACTIVE: Golden Circle builder (Why section) ---------- */
  var gcEl = $('#circleBuild');
  if (gcEl) {
    var gcWhy = $('#gcWhy'), gcHow = $('#gcHow'), gcWhat = $('#gcWhat'),
        gcBtn = $('#gcBuild'), gcStatus = $('#gcStatus'), gcOut = $('#gcOut');
    var gcReady = function () {
      var ok = gcWhy.value.trim().length >= 8 && gcHow.value.trim().length >= 8 && gcWhat.value.trim().length >= 8;
      gcBtn.disabled = !ok;
      gcStatus.textContent = ok ? 'Ready, build it' : 'Fill in all three rings';
      return ok;
    };
    [gcWhy, gcHow, gcWhat].forEach(function (i) { i.addEventListener('input', gcReady); });
    gcBtn.addEventListener('click', function () {
      if (!gcReady()) return;
      var w = gcWhy.value.trim(), h = gcHow.value.trim(), t = gcWhat.value.trim();
      var esc = function (x) { return x.replace(/</g, '&lt;'); };
      gcOut.innerHTML = '<span class="tag">My Golden Circle, inside-out</span>' +
        '<div class="gcring" role="img" aria-label="Your Golden Circle: why at the center, how in the middle ring, what on the outside">' +
        '<div class="gcring__ring" data-gc="what"><span class="gcring__tag">What</span><span class="gcring__text">' + esc(t) + '</span></div>' +
        '<div class="gcring__ring" data-gc="how"><span class="gcring__tag">How</span><span class="gcring__text">' + esc(h) + '</span></div>' +
        '<div class="gcring__ring" data-gc="why"><span class="gcring__tag">Why</span><span class="gcring__text">' + esc(w) + '</span></div>' +
        '</div>' +
        '<p class="why" style="margin:.75rem 0 0;text-align:center">Read it inside-out, out loud. If the why would survive a hard week, it\u2019s real; if not, sharpen it until there\u2019s a person in it.</p>' +
        '<div class="lab__runrow" style="margin-top:1.25rem">' +
        '<button class="btn" id="gcCopy">Copy my circle</button>' +
        '<span class="quiz__progress" id="gcCopied" style="color:rgba(255,255,255,.6)">The WHY ring returns at the commitment card</span></div>';
      gcOut.hidden = false;
      $('#gcCopy').addEventListener('click', function () {
        var text = 'MY GOLDEN CIRCLE (Building Brave Teams, Vanderbilt)\n' +
          'WHY: ' + w + '\nHOW: ' + h + '\nWHAT: ' + t + '\n' +
          'Read inside-out. The why fuels the commitment card.';
        (navigator.clipboard ? navigator.clipboard.writeText(text) : Promise.reject()).then(function () {
          $('#gcCopied').textContent = 'Copied. Keep it where day nine can find it.';
        }, function () {
          $('#gcCopied').textContent = 'Select the card text above and copy it manually.';
        });
      });
      gcOut.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'nearest' });
    });
  }

  /* ---------- INTERACTIVE: mission alignment builder (Chancellor section) ---------- */
  var maEl = $('#missionAlign');
  if (maEl) {
    var maPick = { focus: null, stage: null };
    var maLine = $('#maLine'), maBtn = $('#maBuild'), maStatus = $('#maStatus'), maOut = $('#maOut');
    var MA_FOCUS = {
      core: 'Exceptional core operations \u2014 speed, agility, and scale that secure talent, resources, and reputation.',
      bold: 'Bold strategic initiatives \u2014 bets that extend the reach and impact of education and research.',
      industry: 'Industry leadership \u2014 modeling the essential research university and stimulating industry change.'
    };
    var MA_STAGE = {
      inclusion: 'Inclusion \u2014 the newest voices join it early, by name.',
      learner: 'Learner \u2014 fast work that surfaces its mistakes instead of hiding them.',
      contributor: 'Contributor \u2014 real ownership, publicly credited.',
      challenger: 'Challenger \u2014 the bet can be questioned before it ships.'
    };
    var maReady = function () {
      var ok = maPick.focus && maPick.stage && maLine.value.trim().length >= 8;
      maBtn.disabled = !ok;
      maStatus.textContent = ok ? 'Ready, build it' : 'Fill in all three parts';
      return ok;
    };
    maLine.addEventListener('input', maReady);
    [['#maFocus', 'focus', 'data-focus'], ['#maStage', 'stage', 'data-stage']].forEach(function (cfg) {
      var group = $(cfg[0]);
      $$('.opt', group).forEach(function (b) {
        b.addEventListener('click', function () {
          maPick[cfg[1]] = b.getAttribute(cfg[2]);
          $$('.opt', group).forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
          maOut.hidden = true;
          maReady();
        });
      });
    });
    maBtn.addEventListener('click', function () {
      if (!maReady()) return;
      var line = maLine.value.trim();
      maOut.innerHTML = '<span class="tag">My share of the vision</span>' +
        '<div class="plan__out-grid">' +
        '<div class="row"><b>Area of focus</b><span>' + MA_FOCUS[maPick.focus] + '</span></div>' +
        '<div class="row"><b>The rung it needs</b><span>' + MA_STAGE[maPick.stage] + '</span></div>' +
        '<div class="row"><b>How we advance it</b><span>' + line.replace(/</g, '&lt;') + '</span></div>' +
        '<div class="row"><b>The through-line</b><span>The commitment card you build at the end is this alignment, converted into behavior \u2014 carry the rung forward.</span></div>' +
        '</div>' +
        '<div class="lab__runrow" style="margin-top:1.25rem">' +
        '<button class="btn" id="maCopy">Copy my alignment card</button>' +
        '<span class="quiz__progress" id="maCopied" style="color:rgba(255,255,255,.6)">Bring the rung to your commitment card</span></div>';
      maOut.hidden = false;
      $('#maCopy').addEventListener('click', function () {
        var text = 'MY SHARE OF THE VISION (Building Brave Teams, Vanderbilt)\n' +
          'Area of focus: ' + MA_FOCUS[maPick.focus] + '\n' +
          'The rung it needs: ' + MA_STAGE[maPick.stage] + '\n' +
          'How we advance it: ' + line + '\n' +
          'Through-line: the commitment card converts this alignment into behavior.';
        (navigator.clipboard ? navigator.clipboard.writeText(text) : Promise.reject()).then(function () {
          $('#maCopied').textContent = 'Copied. It pairs with your commitment card.';
        }, function () {
          $('#maCopied').textContent = 'Select the card text above and copy it manually.';
        });
      });
      maOut.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'nearest' });
    });
  }

  /* ---------- INTERACTIVE: Brave Commitment capstone ---------- */
  var planEl = $('#commitPlan');
  if (planEl) {
    var pick = { ask: null, note: null, stage: null };
    var startIn = $('#planStart'), stopIn = $('#planStop'),
        buildBtn = $('#planBuild'), statusEl2 = $('#planStatus'), outEl2 = $('#planOut');
    function planReady() {
      var ok = startIn.value.trim().length >= 8 && stopIn.value.trim().length >= 8 &&
               pick.ask && pick.note && pick.stage;
      buildBtn.disabled = !ok;
      statusEl2.textContent = ok ? 'Ready, build it' : 'Fill in all five parts';
      return ok;
    }
    startIn.addEventListener('input', planReady);
    stopIn.addEventListener('input', planReady);
    [['#planAsk', 'ask', 'data-ask'], ['#planNote', 'note', 'data-note'], ['#planStage', 'stage', 'data-stage']].forEach(function (cfg) {
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
    var ASK = {
      missing: '“What am I missing?”, then count to ten before you speak again. The silence is the invitation.',
      easier: '“What would make it easier to speak up here?”, and write down whatever comes back, visibly.',
      notsaying: '“What are we not saying?”, ask it at the decision point, before the decision, not after.',
      shutdown: '“Where did I shut a conversation down this week?”, the bravest of the four; thank whoever answers.'
    };
    var NOTE = {
      thanks: 'A thank-you for their candor: name the specific moment they said the hard thing, and what it made possible.',
      blind: 'A blind-spot acknowledgment: “You told me something I couldn’t see. You were right, and here’s what I’m doing about it.”',
      invite: 'An invitation to disagree: “I want your real read on [decision], especially where you think I’m wrong.”'
    };
    var STAGE = {
      inclusion: 'Inclusion, belonging before performance. Your tell that it’s working: the newest voice speaks early, unprompted.',
      learner: 'Learner: questions and mistakes made affordable. Your tell: someone says “I don’t know” and the room doesn’t flinch.',
      contributor: 'Contributor, real work, credited. Your tell: ideas travel upward with their author’s name still attached.',
      challenger: 'Challenger, dissent thanked, publicly. Your tell: the plan changes because someone below you pushed back.'
    };
    buildBtn.addEventListener('click', function () {
      if (!planReady()) return;
      var start = startIn.value.trim(), stop = stopIn.value.trim();
      var rows = '' +
        '<div class="row"><b>Start</b><span>' + start.replace(/</g, '&lt;') + '</span></div>' +
        '<div class="row"><b>Stop</b><span>' + stop.replace(/</g, '&lt;') + '</span></div>' +
        '<div class="row"><b>The question</b><span>' + ASK[pick.ask] + '</span></div>' +
        '<div class="row"><b>Tomorrow’s note</b><span>' + NOTE[pick.note] + '</span></div>' +
        '<div class="row"><b>The rung</b><span>' + STAGE[pick.stage] + '</span></div>' +
        '<div class="row"><b>The window</b><span>14 days. The question gets asked at the next team meeting; the note goes out by end of day tomorrow.</span></div>' +
        '<div class="row"><b>The witness</b><span>Share this card with one colleague today. A commitment with a witness survives; a private one evaporates.</span></div>';
      outEl2.innerHTML = '<span class="tag">My brave commitment</span>' +
        '<div class="plan__out-grid">' + rows + '</div>' +
        '<div class="lab__runrow" style="margin-top:1.25rem">' +
        '<button class="btn" id="planCopy">Copy my commitment card</button>' +
        '<span class="quiz__progress" id="planCopied" style="color:rgba(255,255,255,.6)">Photograph it, post it, and tell one person</span></div>';
      outEl2.hidden = false;
      $('#planCopy').addEventListener('click', function () {
        var text = 'MY BRAVE COMMITMENT (Building Brave Teams, Vanderbilt)\n' +
          'Start: ' + start + '\n' +
          'Stop: ' + stop + '\n' +
          'The question my team will hear: ' + ASK[pick.ask] + '\n' +
          'Tomorrow’s note: ' + NOTE[pick.note] + '\n' +
          'The rung I’m building: ' + STAGE[pick.stage] + '\n' +
          'The window: 14 days. Question at the next meeting; note by end of day tomorrow.\n' +
          'The witness: shared with one colleague today.';
        (navigator.clipboard ? navigator.clipboard.writeText(text) : Promise.reject()).then(function () {
          $('#planCopied').textContent = 'Copied. Paste it somewhere your future self will trip over it.';
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
      { q: 'Psychological safety is best defined as…',
        opts: ['A team where everyone is nice and conflict is rare', 'The shared belief that the team is safe for interpersonal risk-taking', 'A management style that avoids giving hard feedback', 'Agreement to keep all discussions positive'],
        correct: 1, why: 'Edmondson’s construct: a shared belief, about risk, held by a team. Not niceness, not comfort, not consensus.' },
      { q: 'Your team asks questions freely and does solid work, but nobody ever challenges how things are done, especially not upward. On Clark’s ladder, the ceiling is…',
        opts: ['Inclusion', 'Learner', 'Contributor', 'Challenger'],
        correct: 3, why: 'Learner and Contributor are working; the missing rung is Challenger, safe dissent about the status quo, in the room, before the decision.' },
      { q: 'Edmondson’s higher-performing nursing units reported MORE medication errors because…',
        opts: ['They actually made more errors', 'They felt safe enough to report the errors they made', 'Reporting was mandatory only on those units', 'Their patients were sicker'],
        correct: 1, why: 'The reporting rate differed, not the error rate. Safe teams surface problems while they’re small, which is why they perform better.' },
      { q: 'In the Johari Window, feedback from teammates shrinks which pane?',
        opts: ['Hidden', 'Open', 'Blind spot', 'Unknown'],
        correct: 2, why: 'Feedback shrinks the Blind spot; disclosure shrinks Hidden. Those are the only two moves that grow the Open quadrant.' },
      { q: '"You were unprofessional in that meeting." As feedback, the core defect is…',
        opts: ['It’s too short', 'A judgment instead of an observable behavior', 'It names the wrong meeting', 'It should have been an email'],
        correct: 1, why: '"Unprofessional" is a verdict no camera could record. SBI wants the behavior: what was said or done, in which moment, with what impact.' },
      { q: 'Which commitment actually survives the two weeks after a workshop?',
        opts: ['"I’ll be more open going forward"', '"I’ll work on psychological safety with my team"', 'One specific start, one stop, one question, dated, shared with a witness', 'Rereading the slides next month'],
        correct: 2, why: 'Specific, dated, witnessed. Vague intentions evaporate on the Ebbinghaus curve; a card with a deadline and a witness is behavior change with a paper trail.' }
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
      var msg = pct >= 80 ? 'You have the constructs and the moves. Build the commitment card, that’s where this becomes real.' :
                pct >= 50 ? 'Solid. Revisit the sections you missed before your first brave conversation.' :
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
