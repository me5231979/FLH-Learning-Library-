/* =====================================================================
   AI BASICS, classroom deck
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
    // excluded margin; reveal them directly
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
  /* scoped to .wrap so the facilitator notes rail on the manifesto slide is left alone */
  $$('.manifesto .wrap p').forEach(function (p) {
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


  /* Is that AI? (Section 01) */
  makeTrainer({
    root: '#isAI', q: '#iaQ', options: '#iaOptions', feedback: '#iaFeedback',
    progress: '#iaProgress', next: '#iaNext', result: '#iaResult',
    progressWord: 'Everyday thing', goodColor: 'var(--vu-oak)',
    resultColor: 'var(--ink-soft, #555)', passAt: 4,
    passMsg: 'See? You have been using AI for years. Today you just learn to use it on purpose.',
    failMsg: 'The test is simple: did the program LEARN from examples, or was every step written out by a person? Learned = AI.',
    labels: ['Yes, that\'s AI', 'No, that\'s a regular program'],
    items: [
      { q: 'Your phone suggests the next word while you type a text message.',
        answer: 0, why: 'That\'s AI. It learned from millions of sentences which word usually comes next. Today\'s chat tools are this same idea, grown up.' },
      { q: 'Your email quietly moves junk mail to the spam folder.',
        answer: 0, why: 'AI. Nobody wrote a rule for every possible junk email; the filter learned what spam looks like from millions of examples.' },
      { q: 'A calculator adds 456 + 789.',
        answer: 1, why: 'Not AI. Every step is a fixed rule a person wrote. It never learned anything and it never guesses. That\'s the difference.' },
      { q: 'Your maps app reroutes you around a traffic jam.',
        answer: 0, why: 'AI. It learned traffic patterns from millions of drives and predicts which road is fastest right now.' },
      { q: 'Netflix or YouTube suggests something you end up loving.',
        answer: 0, why: 'AI. It noticed patterns in what you (and people like you) watched. You\'ve been AI\'s customer for years without the name tag.' }
    ]
  });

  /* Pick the next move (Section 02) */
  makeTrainer({
    root: '#followUp', q: '#fuQ', options: '#fuOptions', feedback: '#fuFeedback',
    progress: '#fuProgress', next: '#fuNext', result: '#fuResult',
    progressWord: 'Moment', goodColor: 'var(--vu-gold-flat)',
    resultColor: 'rgba(255,255,255,.85)', passAt: 4,
    passMsg: 'That\'s the whole skill: ask, look, add one detail, ask again. Like giving directions to a helpful new assistant.',
    failMsg: 'The pattern to remember: don\'t give up, and don\'t settle. Tell it what was wrong or what\'s missing, and it fixes its own draft.',
    labels: [],
    items: [
      { q: 'You asked for "an email to my team" and got something stiff and formal. Your next move?',
        opts: ['Give up, write it yourself', 'Type: "Make it warmer and shorter, we\'re a friendly team"', 'Send the stiff version anyway'],
        answer: 1, why: 'Just tell it, in plain words, like you would a person. It rewrites instantly and doesn\'t mind the feedback.' },
      { q: 'The answer is good but way too long. Next move?',
        opts: ['"Cut this to five sentences"', 'Delete words yourself for ten minutes', 'Ask a completely new question'],
        answer: 0, why: 'One sentence gets you the short version. Shorter, longer, simpler, friendlier: it reshapes on request.' },
      { q: 'You asked for meeting ideas and got generic ones. Next move?',
        opts: ['Accept it, AI is just generic', 'Add the details it was missing: "This is for a 6-person finance team meeting about year-end close"', 'Ask the same question again, word for word'],
        answer: 1, why: 'Generic answers usually mean a generic question. The more it knows about your situation, the better the answer gets.' },
      { q: 'It gave you a date for a campus event that doesn\'t sound right. Next move?',
        opts: ['Trust it, computers don\'t make mistakes', 'Check the real calendar before repeating it', 'Ask the AI if it\'s sure'],
        answer: 1, why: 'AI can be confidently wrong: it sounds certain even when guessing. Anything important (dates, numbers, names) gets checked at the source. Asking "are you sure?" is not checking.' },
      { q: 'The first answer is honestly... pretty good. Next move?',
        opts: ['Perfect means done, copy and send', 'Read it once with your own eyes, fix what only you would know, then use it', 'Ask for ten more versions just in case'],
        answer: 1, why: 'AI writes the draft; you stay the editor. Your name goes on it, so your eyes go over it. That partnership is the whole model.' }
    ]
  });

  /* Green, yellow, red (Section 03) */
  makeTrainer({
    root: '#lightJudge', q: '#ljQ', options: '#ljOptions', feedback: '#ljFeedback',
    progress: '#ljProgress', next: '#ljNext', result: '#ljResult',
    progressWord: 'Situation', goodColor: 'var(--vu-oak)',
    resultColor: 'var(--ink-soft, #555)', passAt: 4,
    passMsg: 'You\'ve got the traffic light. Three seconds of "which color is this?" before you paste is the safest habit in this course.',
    failMsg: 'The rule: public or generic → green. Internal work stuff → yellow, Vanderbilt-approved tools only. Private information about people → red, keep it out.',
    labels: ['🟢 Green: go ahead', '🟡 Yellow: approved VU tools only', '🔴 Red: keep it out of AI'],
    items: [
      { q: 'Asking AI to explain what "FERPA" means, in plain English.',
        answer: 0, why: 'Green. It\'s a public term; there\'s nothing private in the question. Asking AI to explain things is one of its best uses.' },
      { q: 'Pasting a draft of an internal team announcement so AI can tidy it up.',
        answer: 1, why: 'Yellow. Internal work content belongs only in Vanderbilt-approved tools (like Copilot signed in with your VU account), never a random free website.' },
      { q: 'Pasting a student\'s name, grades, and situation to ask for advice.',
        answer: 2, why: 'Red. Private information about real people, whether students, patients, or employees, never goes into an AI tool. Describe the situation with no names and no identifying details, or skip AI for this one.' },
      { q: 'Asking for ten icebreaker ideas for a staff meeting.',
        answer: 0, why: 'Green. Generic and harmless: exactly the kind of chore AI eats for breakfast.' },
      { q: 'Pasting a colleague\'s performance review to "make it sound better."',
        answer: 2, why: 'Red. It\'s private information about a person. The wording help is tempting; the confidentiality is non-negotiable. Rewrite it with the situation genericized, or ask HR for language.' }
    ]
  });

  /* Match the superpower (Section 04) */
  makeTrainer({
    root: '#superPower', q: '#spQ', options: '#spOptions', feedback: '#spFeedback',
    progress: '#spProgress', next: '#spNext', result: '#spResult',
    progressWord: 'Chore', goodColor: 'var(--vu-gold-flat)',
    resultColor: 'rgba(255,255,255,.85)', passAt: 4,
    passMsg: 'Five superpowers, and you can now spot which chore each one eats. One of these becomes your first task, two slides from here.',
    failMsg: 'The five to remember: Draft it (first versions), Summarize it (long → short), Brainstorm it (ideas fast), Explain it (jargon → plain), Rewrite it (same words, different tone).',
    labels: ['Draft it', 'Summarize it', 'Brainstorm it', 'Explain it', 'Rewrite it'],
    items: [
      { q: 'A 14-page policy PDF landed in your inbox and you have four minutes before the meeting.',
        answer: 1, why: 'Summarize it: "give me the five things a staff member actually needs to know from this." Long-to-short is AI\'s favorite trick.' },
      { q: 'You\'ve been staring at a blank email to a difficult vendor for twenty minutes.',
        answer: 0, why: 'Draft it. The blank page is the enemy; a draft you can fix beats an empty screen you can\'t. AI never gets writer\'s block.' },
      { q: 'You need a name and theme for the new mentoring program by Friday.',
        answer: 2, why: 'Brainstorm it: "give me 15 name ideas, from safe to bold." You stay the judge; it just fills the table with options.' },
      { q: 'IT sent instructions full of words like "SSO" and "MFA enrollment" and you\'re lost.',
        answer: 3, why: 'Explain it: "explain this like I\'m not technical." No embarrassment, infinite patience, plain English on demand.' },
      { q: 'Your announcement is accurate but reads like a legal notice, and it\'s going to students.',
        answer: 4, why: 'Rewrite it: "same information, friendlier and half as long." Same facts, new voice, ten seconds.' }
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


  /* ---------- INTERACTIVE: first prompt builder (Section 05) ---------- */
  var fp = $('#firstPrompt');
  if (fp) {
    var fpPick = { task: null, format: null };
    var fpDetail = $('#fpDetail'), fpBtn = $('#fpBuild'), fpStatus = $('#fpStatus'), fpOut = $('#fpOut');
    var TASKS = {
      email: 'Write a first draft of an email',
      summary: 'Summarize the text I paste below into the key points',
      ideas: 'Give me 10 ideas',
      explain: 'Explain, in plain non-technical English,'
    };
    var FORMATS = {
      short: 'Keep it short: a few sentences at most.',
      bullets: 'Give it to me as a bulleted list.',
      steps: 'Walk me through it step by step.'
    };
    function fpReady() {
      var ok = fpPick.task && fpPick.format && fpDetail.value.trim().length >= 8;
      fpBtn.disabled = !ok;
      fpStatus.textContent = ok ? 'Ready, build it' : 'Pick a job, add your details, pick a shape';
      return ok;
    }
    fpDetail.addEventListener('input', fpReady);
    [['#fpTask', 'task', 'data-task'], ['#fpFormat', 'format', 'data-format']].forEach(function (cfg) {
      var group = $(cfg[0]);
      $$('.opt', group).forEach(function (b) {
        b.addEventListener('click', function () {
          fpPick[cfg[1]] = b.getAttribute(cfg[2]);
          $$('.opt', group).forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
          fpOut.hidden = true;
          fpReady();
        });
      });
    });
    fpBtn.addEventListener('click', function () {
      if (!fpReady()) return;
      var esc = function (t) { return t.replace(/</g, '&lt;'); };
      var promptText = TASKS[fpPick.task] + ' ' + fpDetail.value.trim().replace(/[.]+$/, '') + '. ' + FORMATS[fpPick.format];
      fpOut.innerHTML = '<span class="tag">Your first prompt · copy it, then go try it</span>' +
        '<p style="margin:.75rem 0 0;font-family:var(--font-serif);font-size:1.15rem;color:#fff">&ldquo;' + esc(promptText) + '&rdquo;</p>' +
        '<div class="lab__runrow" style="margin-top:1.1rem">' +
        '<button class="btn" id="fpCopy">Copy my prompt</button>' +
        '<span class="quiz__progress" id="fpCopied" style="color:rgba(255,255,255,.6)">Then paste it into a Vanderbilt-approved AI tool</span></div>' +
        '<p class="why" style="margin-top:1rem"><b>Then the two-step:</b> read the answer, add one detail it was missing, and ask again. That second ask is where it gets good.</p>';
      fpOut.hidden = false;
      $('#fpCopy').addEventListener('click', function () {
        (navigator.clipboard ? navigator.clipboard.writeText(promptText) : Promise.reject()).then(function () {
          $('#fpCopied').textContent = 'Copied. Paste it into the tool and press enter.';
        }, function () {
          $('#fpCopied').textContent = 'Select the prompt text above and copy it manually.';
        });
      });
      fpOut.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'nearest' });
    });
  }

  /* ---------- INTERACTIVE: My First Try capstone ---------- */
  var planEl = $('#firstTry');
  if (planEl) {
    var pick = { power: null, when: null };
    var taskIn = $('#planTask'), buildBtn = $('#planBuild'), statusEl2 = $('#planStatus'), outEl2 = $('#planOut');
    function planReady() {
      var ok = taskIn.value.trim().length >= 8 && pick.power && pick.when;
      buildBtn.disabled = !ok;
      statusEl2.textContent = ok ? 'Ready, build it' : 'Fill in all three parts';
      return ok;
    }
    taskIn.addEventListener('input', planReady);
    [['#planPower', 'power', 'data-power'], ['#planWhen', 'when', 'data-when']].forEach(function (cfg) {
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
    var POWER = {
      draft: 'Draft it. Ask for a first version, then make it yours',
      summarize: 'Summarize it. Paste the long thing (yellow rule: approved tool) and ask for the short version',
      brainstorm: 'Brainstorm it. Ask for 10 ideas and keep the two good ones',
      explain: 'Explain it. Ask for plain English with no jargon',
      rewrite: 'Rewrite it. Same facts, better tone or length'
    };
    var WHEN = { today: 'today, before the day ends', tomorrow: 'tomorrow morning, first thing', week: 'this week, on a day you pick right now' };
    buildBtn.addEventListener('click', function () {
      if (!planReady()) return;
      var task = taskIn.value.trim();
      var rows = '' +
        '<div class="row"><b>My task</b><span>' + task.replace(/</g, '&lt;') + '</span></div>' +
        '<div class="row"><b>The superpower</b><span>' + POWER[pick.power] + '.</span></div>' +
        '<div class="row"><b>When</b><span>' + WHEN[pick.when].charAt(0).toUpperCase() + WHEN[pick.when].slice(1) + '.</span></div>' +
        '<div class="row"><b>The two-step</b><span>Read the first answer, add one detail it was missing, ask again.</span></div>' +
        '<div class="row"><b>The safety check</b><span>Three seconds before you paste anything: green, yellow, or red? And check any fact that matters before you use it.</span></div>';
      outEl2.innerHTML = '<span class="tag">My first try</span>' +
        '<div class="plan__out-grid">' + rows + '</div>' +
        '<div class="lab__runrow" style="margin-top:1.25rem">' +
        '<button class="btn" id="planCopy">Copy my card</button>' +
        '<span class="quiz__progress" id="planCopied" style="color:rgba(255,255,255,.6)">Put it somewhere you\'ll see it</span></div>';
      outEl2.hidden = false;
      $('#planCopy').addEventListener('click', function () {
        var text = 'MY FIRST TRY (Start Smarter, Vanderbilt)\n' +
          'Task: ' + task + '\n' +
          'Superpower: ' + POWER[pick.power] + '\n' +
          'When: ' + WHEN[pick.when] + '\n' +
          'The two-step: read the answer, add one missing detail, ask again.\n' +
          'Safety: green/yellow/red check before pasting; verify facts that matter.';
        (navigator.clipboard ? navigator.clipboard.writeText(text) : Promise.reject()).then(function () {
          $('#planCopied').textContent = 'Copied. See you on the other side of your first try.';
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
      { q: 'In one sentence: what is AI?',
        opts: ['A robot that thinks like a human', 'A computer program that learned from millions of examples, so it can predict and generate useful answers', 'A search engine with better manners', 'Magic'],
        correct: 1, why: 'Learned from examples is the key. It explains why it\'s so capable, and why it can still be confidently wrong.' },
      { q: 'How do you use an AI chat tool?',
        opts: ['You need to learn some code first', 'Type what you need in plain English, like texting a capable assistant, then refine', 'Fill out a special form', 'Speak only in keywords'],
        correct: 1, why: 'Plain English, full sentences, details welcome. Then the two-step: add what it was missing and ask again.' },
      { q: 'The answer looks perfect and includes a statistic you\'ll repeat in a meeting. What do you do?',
        opts: ['Use it, it sounds confident', 'Check the statistic at the source first, because AI can be confidently wrong', 'Ask the AI if it\'s sure', 'Add "probably" when you say it'],
        correct: 1, why: 'Confident tone is not evidence. Facts, dates, numbers, and names get checked before your name goes on them.' },
      { q: 'Which of these should NEVER go into an AI tool?',
        opts: ['A question about a public policy', 'Your draft of a generic announcement', 'A student\'s name and grades', 'A request for meeting icebreakers'],
        correct: 2, why: 'Red light: private information about real people stays out. When in doubt, describe the situation with no names, or don\'t.' },
      { q: 'What\'s the smartest FIRST task to give AI?',
        opts: ['A final decision about a person', 'A real but low-stakes chore: a draft, a summary, ten ideas', 'Your most sensitive project', 'Nothing, watching others is enough'],
        correct: 1, why: 'Start where mistakes are cheap and the time savings are real. Confidence comes from reps, and the first rep is this week.' }
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
      var msg = pct >= 80 ? 'You\'re ready. Your first try is waiting on the next slide.' :
                pct >= 50 ? 'Solid. Skim the section you missed, then go do your first try.' :
                            'Worth one more pass through the deck (it\'s short), then try again.';
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
    checkHint();
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

  // "scroll for more" indicator: shows when the active screen has more below the fold
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

  // in-page anchor links (nav, buttons) jump the horizontal deck
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
