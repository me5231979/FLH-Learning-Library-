/* =====================================================================
   AI FOR COACHING & FEEDBACK, classroom deck
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

  /* Prep or outsource? (Section 01) */
  makeTrainer({
    root: '#prepJudge', q: '#pjQ', options: '#pjOptions', feedback: '#pjFeedback',
    progress: '#pjProgress', next: '#pjNext', result: '#pjResult',
    progressWord: 'Move', goodColor: 'var(--vu-oak)',
    resultColor: 'var(--ink-soft, #555)', passAt: 4,
    passMsg: 'You can hear the line. Prep sharpens you; outsourcing replaces you; and the data rule outranks both.',
    failMsg: 'Close. The tells: prep leaves you MORE present in the room. Outsourcing puts something between you and the person. And names plus performance content in unapproved tools is over the data line, whatever the benefit.',
    labels: ['AI as prep, working well', 'Outsourcing the human moment', 'Over the data line'],
    items: [
      { q: 'Before a tough conversation, a manager rehearses with AI: "here\'s the situation, de-identified; play the other person and push back on me."',
        answer: 0, why: 'The classic prep move. You arrive calmer, having heard the pushback once already, and nobody\'s data went anywhere.' },
      { q: 'A manager pastes a direct report\'s self-review, name included, into a free public chatbot to draft the response.',
        answer: 2, why: 'A name plus performance content in an unapproved tool is red-light data about a person. No drafting convenience survives that trade.' },
      { q: 'AI writes the annual review from the ratings alone; the manager signs and sends it without reading it through.',
        answer: 1, why: 'A signature with nobody home. The person on the other end is reading what they\'ll assume is your considered judgment, and it isn\'t anyone\'s.' },
      { q: 'A manager turns their own rough bullet notes about a project miss into an SBI-structured draft, then rewrites it in their own voice.',
        answer: 0, why: 'Your observations in, structure out, your voice restored. The draft made you more prepared without making you less present.' },
      { q: 'During the 1:1 itself, the manager glances at AI-suggested empathy lines on a second screen.',
        answer: 1, why: 'The conversation is the product, and people can tell when your attention is split. Prep ends when the door closes.' }
    ]
  });

  /* Signal or surveillance? (Section 03) */
  makeTrainer({
    root: '#signalSort', q: '#snQ', options: '#snOptions', feedback: '#snFeedback',
    progress: '#snProgress', next: '#snNext', result: '#snResult',
    progressWord: 'Use', goodColor: 'var(--vu-oak)',
    resultColor: 'var(--ink-soft, #555)', passAt: 4,
    passMsg: 'The boundary is installed: aggregate and your own notes are radar; individuals who haven\'t asked are off limits.',
    failMsg: 'Close. The two-question test sorts every case: is it aggregate (or your own notes, de-identified), and would you tell the team you do it?',
    labels: ['Fair game: aggregate or your own notes', 'De-identify first, then fine', 'Surveillance, don\'t'],
    items: [
      { q: 'Summarize the team\'s engagement survey comment themes (anonymized by the platform) and draft three discussion questions for the next staff meeting.',
        answer: 0, why: 'Platform-anonymized aggregate, turned into conversation. This is exactly what engagement data is for.' },
      { q: 'Paste your running 1:1 notes, names included, into an approved tool to find the topics that keep recurring.',
        answer: 1, why: 'Your own notes are the right instinct, and the names add nothing: swap in roles first. The pattern survives de-identification; the risk doesn\'t.' },
      { q: 'Run sentiment analysis on one quiet employee\'s messages to see whether they\'re disengaging.',
        answer: 2, why: 'Individual, unasked, and secret. It fails the out-loud test long before it fails any policy, and if they found out, the trust you were trying to protect is gone.' },
      { q: 'Ask AI which coaching questions fit a development goal one of your reports chose, described by role only.',
        answer: 0, why: 'A craft question with no personal data in it. This is the cheapest, safest prep upgrade in the whole course.' },
      { q: 'Feed individual survey responses into AI to work out who wrote the critical one.',
        answer: 2, why: 'This one act ends honest surveys on your team forever. Anonymity is the deal; hunting authors breaks the instrument and the trust at once.' }
    ]
  });

  /* ---------- INTERACTIVE: The Feedback Prep Lab (Section 02) ---------- */
  var lab = $('#fbLab');
  if (lab) {
    var SLOTS = [
      { key: 'What you feed it', opts: [
        { t: 'Their name, role, and your full 1:1 note history, into whichever tool writes best.', pts: 1, coach: 'Names plus performance history in an unapproved tool crosses the data line before the drafting even starts. De-identify first, approved tools only; the quality of the draft never justifies the input.' },
        { t: 'De-identified bullets, but only from the two bad weeks.', pts: 2, coach: 'Safe input, skewed sample. A draft built only from the bad weeks reads like a case for the prosecution, and the person will hear that even through polite wording.' },
        { t: 'De-identified, behavior-focused notes from your own observation, the good weeks and the bad ones.', pts: 3, coach: 'Roles not names, behavior not character, the whole picture. This input produces a draft you can actually stand behind.' }]},
      { key: 'What you ask for', opts: [
        { t: '"Tell me if this person deserves a low rating."', pts: 1, coach: 'You just asked AI to make the judgment that is your job. It will answer confidently, from half the picture, and the confidence is the danger.' },
        { t: '"Make this feedback sound nicer."', pts: 2, coach: 'Tone-polish without structure keeps the fog and adds sugar. Nice fog is still fog; the person leaves unsure what actually needs to change.' },
        { t: '"Structure these observations as Situation, Behavior, Impact, and flag anything that reads as character judgment rather than behavior."', pts: 3, coach: 'Structure plus a self-check: the draft comes back organized AND audited for the classic feedback failure. This is the prompt worth keeping.' }]},
      { key: 'What you do with the draft', opts: [
        { t: 'Send it. It reads well.', pts: 1, coach: '"Reads well" is what AI does; being true and being yours are your jobs. An unverified example or borrowed voice will surface in the room at the worst moment.' },
        { t: 'Tweak a few words and send it.', pts: 2, coach: 'Closer, but the check is still missing: is every example accurate? Is the wording something you\'d say out loud? The rewrite pass is where the draft becomes feedback.' },
        { t: 'Verify every example against what happened, rewrite it in your voice, cut anything you wouldn\'t say to their face.', pts: 3, coach: 'The full pass: verified, owned, sayable. The draft did the structuring; you did the judgment. That division of labor is the whole course.' }]},
      { key: 'The conversation itself', opts: [
        { t: 'Email the write-up; the document speaks for itself.', pts: 1, coach: 'Documents don\'t hear context, answer questions, or repair anything. Feedback that matters gets a conversation; the write-up is the record, never the delivery.' },
        { t: 'Read the draft aloud in the 1:1, top to bottom.', pts: 2, coach: 'At least it\'s live, but reading AT someone forecloses the conversation. They have information you don\'t; a script leaves it no way in.' },
        { t: 'Notes closed: you know the message; say it plainly, then listen, and let their side change your view if the facts do.', pts: 3, coach: 'The prep made you clear; presence makes you credible. And a manager who updates on new facts teaches the team that feedback is a conversation, not a verdict.' }]}
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
          statusEl.textContent = ready ? 'Ready, run the 1:1' :
            'Choose ' + picks.filter(function (p) { return p === null; }).length + ' more step(s)';
          outEl.hidden = true;
        });
        d.appendChild(b);
      });
      slotsEl.appendChild(d);
    });
    var REACTIONS = {
      strong: 'Thursday, ten minutes in: they add context you didn\'t have, the missed handoffs turn out to have a fixable cause, and you leave with a plan and a stronger relationship. The notes stayed de-identified, the draft stayed a draft, and the person felt talked with, never processed.',
      mid: 'Thursday: the feedback is clearer than it would have been unprepped, but it still lands a little like a form letter, and when they push back with new facts you catch yourself defending the draft. Better than winging it; the rewrite pass and the listening plan would have finished the job.',
      weak: 'Thursday goes badly. An example was wrong (nobody verified it), the wording wasn\'t yours (they noticed), and if identifying details went into an unapproved tool, that problem now outlives the conversation entirely. This is how trust in you AND in the tools gets spent at the same time.'
    };
    runBtn.addEventListener('click', function () {
      var score = picks.reduce(function (t, p, i) { return t + SLOTS[i].opts[p].pts; }, 0); // 4..12
      var pct = Math.round((score / 12) * 100);
      var tier = score >= 11 ? 'strong' : score >= 8 ? 'mid' : 'weak';
      var head = tier === 'strong' ? 'A prepared, human conversation. The structure carried the facts; you carried the relationship.'
               : tier === 'mid' ? 'Half a prep. The strong steps helped, and the soft ones let the conversation drift back into fog.'
               : 'The prep backfired. Somewhere the human part got outsourced or the data line got crossed, and the conversation paid for it.';
      var coach = picks.map(function (p, i) { return '<div><b>' + SLOTS[i].key + ':</b> ' + SLOTS[i].opts[p].coach + '</div>'; }).join('');
      outEl.innerHTML = '<span class="tag">How Thursday goes · ' + score + ' / 12</span>' +
        '<div class="lab__meter"><span style="width:0"></span></div>' +
        '<p style="margin:0;color:#fff;font-weight:500">' + head + '</p>' +
        '<div class="sample">' + REACTIONS[tier] + '</div>' +
        '<div class="lab__coach">' + coach + '</div>' +
        (tier !== 'strong' ? '<p class="why" style="margin-top:1rem"><b>Try again:</b> upgrade your weakest step and rerun the 1:1. Watch what changes in the room.</p>'
                           : '<p class="why" style="margin-top:1rem"><b>Now the real thing:</b> the capstone points this prep at a conversation you actually owe someone.</p>');
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

  /* ---------- INTERACTIVE: 1:1 Prep Card capstone ---------- */
  var planEl = $('#prepPlan');
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
      rehearse: { name: 'The rehearsal', move: 'De-identify the situation, ask AI to play the other side and push back hard, and run the conversation twice before it counts once.' },
      sbi: { name: 'The SBI draft', move: 'Your own de-identified observations in, Situation-Behavior-Impact out, with character judgments flagged. Then the rewrite pass: verified, in your voice, sayable to their face.' },
      notes: { name: 'The notes mine', move: 'Your running 1:1 notes, roles swapped for names, into an approved tool: what keeps recurring, what have you committed to and not done, what have they asked for more than once?' },
      themes: { name: 'The themes move', move: 'The platform-anonymized survey themes into three genuine discussion questions for the team, and one for this conversation.' }
    };
    var NOT = {
      names: 'Putting names or identifying details into any unapproved tool. Counter-move: de-identify before anything touches a tool, and stay in approved VU lanes; the pattern survives, the risk doesn\'t.',
      unread: 'Delivering an AI draft I haven\'t verified and rewritten. Counter-move: no draft leaves my hands until every example is checked and every line is something I\'d say out loud.',
      screen: 'Managing the conversation from a screen. Counter-move: prep ends when the door closes; notes shut, eyes up, and their side of the story gets to change mine.'
    };
    var WHEN = { next: 'before your next 1:1', threedays: 'within the next 3 days', week: 'within 7 days' };
    buildBtn.addEventListener('click', function () {
      if (!planReady()) return;
      var who = whoIn.value.trim();
      var p = PRACTICE[pick.practice];
      var rows = '' +
        '<div class="row"><b>The conversation</b><span>' + who.replace(/</g, '&lt;') + '</span></div>' +
        '<div class="row"><b>The prep move</b><span>' + p.name + '. ' + p.move + '</span></div>' +
        '<div class="row"><b>What I will NOT do</b><span>' + NOT[pick.not] + '</span></div>' +
        '<div class="row"><b>The prep window</b><span>The prep runs ' + WHEN[pick.when] + ', and the conversation follows it, human all the way through.</span></div>' +
        '<div class="row"><b>The privacy rule</b><span>De-identified, approved VU tools only, behavior not character. Everything on this card survives being said out loud to the team.</span></div>' +
        '<div class="row"><b>The evidence</b><span>Afterward, one line: what did the prep change about how you listened? That line tells you whether to keep the habit.</span></div>';
      outEl2.innerHTML = '<span class="tag">My 1:1 prep card</span>' +
        '<div class="plan__out-grid">' + rows + '</div>' +
        '<div class="lab__runrow" style="margin-top:1.25rem">' +
        '<button class="btn" id="planCopy">Copy my card</button>' +
        '<span class="quiz__progress" id="planCopied" style="color:rgba(255,255,255,.6)">Put the prep on your calendar now</span></div>';
      outEl2.hidden = false;
      $('#planCopy').addEventListener('click', function () {
        var text = 'MY 1:1 PREP CARD (AI for Coaching & Feedback, Vanderbilt)\n' +
          'The conversation: ' + who + '\n' +
          'Prep move: ' + p.name + '. ' + p.move + '\n' +
          'I will NOT: ' + NOT[pick.not] + '\n' +
          'Prep window: ' + WHEN[pick.when] + '.\n' +
          'Privacy rule: de-identified, approved VU tools only, behavior not character.\n' +
          'Evidence: one line afterward on what the prep changed about how I listened.';
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
      { q: 'The prep-not-outsource line: which of these stays yours, always?',
        opts: ['Structuring rough notes into a first draft', 'The conversation itself, and the relationship it runs on', 'Rehearsing against pushback', 'Generating coaching questions'],
        correct: 1, why: 'AI can prepare all three of the others well. The conversation is the product, and people can tell who\'s actually in it.' },
      { q: 'Before your notes about a person touch any tool, the two rules are…',
        opts: ['Work fast and delete the chat after', 'De-identify (roles, never names) and use approved VU tools only', 'Use the most capable model available', 'Summarize instead of pasting'],
        correct: 1, why: 'De-identification plus approved lanes. The pattern you\'re looking for survives both; the risk doesn\'t.' },
      { q: 'In SBI, the Behavior line contains…',
        opts: ['Your honest read of their attitude', 'What they probably intended', 'What you observed, described so a camera would agree', 'A performance rating'],
        correct: 2, why: 'Camera-true observation is what makes feedback discussable instead of defensible. Ask AI to flag anything that reads as character; that\'s the prompt\'s best clause.' },
      { q: 'Which of these is on the right side of the signal-surveillance boundary?',
        opts: ['Sentiment-scanning one quiet employee\'s messages', 'Working out who wrote the critical survey comment', 'Turning anonymized team survey themes into discussion questions', 'Tracking one person\'s tone across months of chats'],
        correct: 2, why: 'Aggregate, anonymized, and aimed at a conversation. The other three are individual, unasked, and secret: surveillance in coaching clothes.' }
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
      var msg = pct >= 75 ? 'The habit is loaded. The conversation you named is where it becomes real.' :
                pct >= 50 ? 'Solid. Revisit the section you missed before your prep session.' :
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
