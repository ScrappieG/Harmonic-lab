(function () {
  if (document.getElementById('articuleet-host')) return;

  // ===== DETECT PROBLEM PAGE =====
  var path = window.location.pathname;
  var match = path.match(/^\/problems\/([^/]+)/);
  if (!match) return;

  // ===== CONFIG =====
  var DASHBOARD_URL = 'https://articuleet.com/dashboard';

  // ===== AUTH STATE =====
  var authedUser = null;

  // ===== GET PROBLEM NAME =====
  function slugToTitle(slug) {
    return slug.split('-').map(function (word) {
      return word.charAt(0).toUpperCase() + word.slice(1);
    }).join(' ');
  }

  // Ret problem name
  function getProblemName() {
    var selectors = [
      '[data-cy="question-title"]',
      '.text-title-large',
      'div[class*="title"] a',
      'div[data-track-load="description_content"] h4',
    ];
    for (var i = 0; i < selectors.length; i++) {
      var el = document.querySelector(selectors[i]);
      if (el && el.textContent.trim()) {
        return el.textContent.trim().replace(/^\d+\.\s*/, '');
      }
    }
    return slugToTitle(match[1]);
  }

  var problemName = getProblemName();

  function retryName() {
    var name = getProblemName();
    if (name !== slugToTitle(match[1])) {
      problemName = name;
      injectName();
    }
  }
  setTimeout(retryName, 1500);
  setTimeout(retryName, 3000);

  // ===== SETUP =====
  var fontLink = document.createElement('link');
  fontLink.rel = 'stylesheet';
  fontLink.href = 'https://fonts.googleapis.com/css2?family=Chivo+Mono:wght@400;600&family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Hedvig+Letters+Serif:opsz@12..24&display=swap';
  document.head.appendChild(fontLink);

  var host = document.createElement('div');
  host.id = 'articuleet-host';
  host.style.cssText = 'position:fixed; bottom:20px; right:20px; z-index:2147483647;';
  document.body.appendChild(host);

  var userClosed = false;

  chrome.runtime.onMessage.addListener(function (msg) {
    if (msg.action === 'toggle') {
      if (host.style.display === 'none') {
        userClosed = false;
        host.style.display = '';
      } else {
        var isRecording = currentSection && sec[currentSection] && sec[currentSection].recording;
        if (!isRecording) {
          userClosed = true;
          host.style.display = 'none';
        }
      }
    }
  });

  var shadow = host.attachShadow({ mode: 'open' });

  var shadowFont = document.createElement('link');
  shadowFont.rel = 'stylesheet';
  shadowFont.href = 'https://fonts.googleapis.com/css2?family=Chivo+Mono:wght@400;600&family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Hedvig+Letters+Serif:opsz@12..24&display=swap';
  shadow.appendChild(shadowFont);

  var cssLink = document.createElement('link');
  cssLink.rel = 'stylesheet';
  cssLink.href = chrome.runtime.getURL('widget.css');
  shadow.appendChild(cssLink);

  var root = document.createElement('div');
  root.className = 'widget-root';
  root.innerHTML = WIDGET_HTML;
  shadow.appendChild(root);

  // ===== INJECT PROBLEM NAME =====
  function injectName() {
    root.querySelectorAll('.problem-name').forEach(function (el) {
      el.textContent = problemName;
    });
    root.querySelectorAll('.progress-line').forEach(function (el) {
      el.innerHTML = '<strong>In Progress: ' + problemName + '</strong>';
    });
    root.querySelectorAll('.complete-sub').forEach(function (el) {
      el.textContent = problemName + ' — Full Walkthrough';
    });
  }
  injectName();

  // ===== INJECT USER INFO =====
  function injectUser(user) {
    var initial = user.email ? user.email.charAt(0).toUpperCase() : '?';
    root.querySelectorAll('.avatar').forEach(function (el) {
      el.textContent = initial;
    });
    root.querySelectorAll('.user-info .name').forEach(function (el) {
      el.textContent = user.email.split('@')[0];
    });
    root.querySelectorAll('.user-info .email').forEach(function (el) {
      el.textContent = user.email;
    });
  }

  // ===== OBSERVE SPA NAVIGATION =====
  var lastPath = path;
  var observer = new MutationObserver(function () {
    var newPath = window.location.pathname;
    if (newPath !== lastPath) {
      lastPath = newPath;
      var newMatch = newPath.match(/^\/problems\/([^/]+)/);
      if (newMatch) {
        problemName = slugToTitle(newMatch[1]);
        injectName();
        setTimeout(retryName, 1500);
        if (!userClosed) {
          host.style.display = '';
        }
      } else {
        host.style.display = 'none';
      }
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });

  // ===== SCREENS =====
  var screens = {
    login:    root.querySelector('#screen-login'),
    start:    root.querySelector('#screen-start'),
    sec1:     root.querySelector('#screen-section-1'),
    sec2:     root.querySelector('#screen-section-2'),
    sec3:     root.querySelector('#screen-section-3'),
    sec4:     root.querySelector('#screen-section-4'),
    sec5:     root.querySelector('#screen-section-5'),
    complete: root.querySelector('#screen-complete'),
    mini:     root.querySelector('#screen-minimized'),
  };

  var flow = ['sec1', 'sec2', 'sec3', 'sec4', 'sec5', 'complete'];
  var sectionKeys = ['sec1', 'sec2', 'sec3', 'sec4', 'sec5'];
  var sectionNames = {
    sec1: 'Problem Clarification',
    sec2: 'High Level Approach',
    sec3: 'Implementation',
    sec4: 'Testing & Edge Cases',
    sec5: 'Complexity & Tradeoffs',
  };

  var lastScreen = 'login';
  var currentSection = null;
  var micStream = null;

  // ===== PER-SECTION STATE =====
  var sec = {};
  sectionKeys.forEach(function (key) {
    sec[key] = {
      seconds: 0,
      interval: null,
      recorder: null,
      chunks: [],
      paused: false,
      recording: false,
      blob: null,
      skipped: false,
    };
  });

  // ===== CLOSE BUTTON VISIBILITY =====
  function updateCloseButtons() {
    var isRecording = currentSection && sec[currentSection] && sec[currentSection].recording;
    root.querySelectorAll('.close-btn').forEach(function (btn) {
      btn.style.display = isRecording ? 'none' : '';
    });
  }

  // ===== SHOW/HIDE SECTION UI =====
  function showActions(key) {
    var screen = screens[key];
    var actions = screen.querySelector('.section-actions');
    var controls = screen.querySelector('.controls');
    var complete = screen.querySelector('.complete-section-wrap');
    if (actions) actions.classList.remove('hidden');
    if (controls) controls.classList.add('hidden');
    if (complete) complete.classList.add('hidden');
  }

  function showControls(key) {
    var screen = screens[key];
    var actions = screen.querySelector('.section-actions');
    var controls = screen.querySelector('.controls');
    var complete = screen.querySelector('.complete-section-wrap');
    if (actions) actions.classList.add('hidden');
    if (controls) controls.classList.remove('hidden');
    if (complete) complete.classList.remove('hidden');
  }

  // ===== SHOW SCREEN (with auth gate) =====
  function show(key) {
    if (!authedUser && key !== 'login') {
      key = 'login';
    }

    if (key !== 'mini') lastScreen = key;
    Object.values(screens).forEach(function (s) { s.classList.remove('active'); });
    screens[key].classList.add('active');

    if (sectionKeys.indexOf(key) !== -1) {
      if (sec[key].recording) {
        showControls(key);
      } else {
        showActions(key);
      }
    }

    if (key === 'mini' && currentSection) syncMini();
    updateCloseButtons();
  }

  // ===== ADVANCE TO NEXT =====
  function advanceTo(key) {
    var i = flow.indexOf(key);
    if (i === -1 || i >= flow.length - 1) return;
    var next = flow[i + 1];
    if (next === 'complete') {
      updateComplete();
      releaseMic();
    }
    show(next);
  }

  // ===== TIMER =====
  function fmt(s) {
    return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
  }

  function updateTimer(key) {
    var str = fmt(sec[key].seconds);
    var el = screens[key] ? screens[key].querySelector('.section-timer') : null;
    if (el) el.textContent = str;
    if (key === currentSection) {
      var mini = root.querySelector('.mini-timer');
      if (mini) mini.textContent = str;
    }
  }

  function tickStart(key) {
    var s = sec[key];
    if (s.interval) return;
    s.interval = setInterval(function () {
      s.seconds++;
      updateTimer(key);
    }, 1000);
  }

  function tickStop(key) {
    var s = sec[key];
    if (s.interval) {
      clearInterval(s.interval);
      s.interval = null;
    }
  }

  // ===== MICROPHONE =====
  function getMic() {
    if (micStream) return Promise.resolve(micStream);
    return navigator.mediaDevices.getUserMedia({ audio: true }).then(function (s) {
      micStream = s;
      return s;
    });
  }

  function releaseMic() {
    if (micStream) {
      micStream.getTracks().forEach(function (t) { t.stop(); });
      micStream = null;
    }
  }

  // ===== RECORDING =====
  function startRec(key) {
    return getMic().then(function (stream) {
      var s = sec[key];
      s.chunks = [];
      s.recorder = new MediaRecorder(stream);
      s.recorder.ondataavailable = function (e) {
        if (e.data.size > 0) s.chunks.push(e.data);
      };
      s.recorder.start(1000);
      s.recording = true;
      s.paused = false;
      s.skipped = false;
      currentSection = key;
      tickStart(key);
      showControls(key);
      refreshUI(key);
      updateCloseButtons();
    });
  }

  function stopRec(key) {
    return new Promise(function (resolve) {
      var s = sec[key];
      if (!s.recorder || s.recorder.state === 'inactive') {
        s.recording = false;
        tickStop(key);
        refreshUI(key);
        releaseMic();
        updateCloseButtons();
        resolve();
        return;
      }
      s.recorder.addEventListener('stop', function () {
        if (s.chunks.length > 0) {
          s.blob = new Blob(s.chunks, { type: 'audio/webm' });
          console.log('[articuLeet] Saved ' + key + ': ' + Math.round(s.blob.size / 1024) + 'KB');
        }
        s.chunks = [];
        s.recorder = null;
        s.recording = false;
        s.paused = false;
        tickStop(key);
        refreshUI(key);
        releaseMic();
        updateCloseButtons();
        resolve();
      }, { once: true });
      s.recorder.stop();
    });
  }

  function pauseRec(key) {
    var s = sec[key];
    if (!s.recorder || !s.recording) return;
    if (s.paused) {
      s.recorder.resume();
      s.paused = false;
      tickStart(key);
    } else {
      s.recorder.pause();
      s.paused = true;
      tickStop(key);
    }
    refreshUI(key);
  }

  function restartRec(key) {
    var s = sec[key];
    if (s.recorder && s.recorder.state !== 'inactive') {
      s.recorder.ondataavailable = null;
      s.recorder.stop();
    }
    tickStop(key);
    s.seconds = 0;
    s.chunks = [];
    s.recorder = null;
    s.blob = null;
    s.recording = false;
    s.paused = false;
    updateTimer(key);
    refreshUI(key);
    return startRec(key);
  }

  function resetSection(key) {
    var s = sec[key];
    tickStop(key);
    if (s.recorder && s.recorder.state !== 'inactive') {
      s.recorder.ondataavailable = null;
      s.recorder.stop();
    }
    s.seconds = 0;
    s.interval = null;
    s.recorder = null;
    s.chunks = [];
    s.paused = false;
    s.recording = false;
    s.blob = null;
    s.skipped = false;
    updateTimer(key);
    refreshUI(key);
    showActions(key);
  }

  // ===== UI UPDATES =====
  function refreshUI(key) {
    var s = sec[key];
    var screen = screens[key];
    if (screen) {
      var dot = screen.querySelector('.stop-btn');
      var pause = screen.querySelector('.pause-btn');
      if (dot) {
        dot.classList.toggle('is-active', s.recording && !s.paused);
        dot.classList.toggle('is-paused', s.recording && s.paused);
        dot.classList.toggle('is-stopped', !s.recording);
      }
      if (pause) {
        pause.textContent = s.paused ? '▶' : '⏸';
      }
    }
    if (key === currentSection) syncMini();
  }

  function syncMini() {
    if (!currentSection) return;
    var s = sec[currentSection];
    var miniDot = screens.mini.querySelector('.stop-btn');
    var miniPause = screens.mini.querySelector('.pause-btn');
    var miniTimer = root.querySelector('.mini-timer');
    if (miniDot) {
      miniDot.classList.toggle('is-active', s.recording && !s.paused);
      miniDot.classList.toggle('is-paused', s.recording && s.paused);
      miniDot.classList.toggle('is-stopped', !s.recording);
    }
    if (miniPause) miniPause.textContent = s.paused ? '▶' : '⏸';
    if (miniTimer) miniTimer.textContent = fmt(s.seconds);
  }

  // ===== FEEDBACK =====
  function updateFeedback(data) {
    function renderDots(id, score, max) {
      var el = root.querySelector('#' + id);
      if (!el) return;
      var html = '';
      for (var i = 1; i <= max; i++) {
        html += i <= score
          ? '<span class="dot-filled"></span>'
          : '<span class="dot-empty"></span>';
      }
      el.innerHTML = html;
    }

    var comm = data.Communication || 0;
    var ps   = data.Ps || 0;
    var code = data.code || 0;

    renderDots('fb-communication', comm, 4);
    renderDots('fb-ps', ps, 4);
    renderDots('fb-code', code, 4);

    var overall = Math.round((comm + ps + code) / 3);
    renderDots('fb-overall', overall, 4);

    var badge = root.querySelector('#fb-pass-fail');
    if (badge) {
      if (data.Pass === true) {
        badge.textContent = 'PASS';
        badge.className = 'pass-fail-badge pass';
      } else if (data.Pass === false) {
        badge.textContent = 'FAIL';
        badge.className = 'pass-fail-badge fail';
      } else {
        badge.textContent = '—';
        badge.className = 'pass-fail-badge';
      }
    }

    var takeaway = root.querySelector('#fb-takeaway');
    if (takeaway) {
      takeaway.textContent = data.overall_takeaway || '';
    }
  }

  function resetFeedback() {
    ['fb-communication', 'fb-ps', 'fb-code', 'fb-overall'].forEach(function (id) {
      var el = root.querySelector('#' + id);
      if (el) {
        el.innerHTML =
          '<span class="dot-empty"></span>' +
          '<span class="dot-empty"></span>' +
          '<span class="dot-empty"></span>' +
          '<span class="dot-empty"></span>';
      }
    });
    var badge = root.querySelector('#fb-pass-fail');
    if (badge) {
      badge.textContent = '—';
      badge.className = 'pass-fail-badge';
    }
    var takeaway = root.querySelector('#fb-takeaway');
    if (takeaway) takeaway.textContent = '';
  }

  // ===== AUTH (local only — no backend needed) =====
  function getAuthToken() {
    return new Promise(function (resolve, reject) {
      chrome.storage.local.get('access_token', function (result) {
        if (result.access_token) {
          resolve(result.access_token);
        } else {
          reject(new Error('No auth token'));
        }
      });
    });
  }

  // Decode the JWT payload to get user info without calling backend
  function decodeJwtPayload(token) {
    try {
      var base64 = token.split('.')[1];
      var json = atob(base64.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(json);
    } catch (e) {
      return null;
    }
  }

  function validateTokenLocally(token) {
    var payload = decodeJwtPayload(token);
    if (!payload) return null;

    // Check if token is expired
    var now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) return null;

    return {
      id: payload.sub || '',
      email: payload.email || '',
    };
  }

  function onAuthSuccess(user) {
    authedUser = user;
    injectUser(user);
    show('start');
    console.log('[articuLeet] Signed in as ' + user.email);
  }

  function onAuthFail() {
    authedUser = null;
    chrome.storage.local.remove('access_token');
    show('login');
  }

  function checkAuth() {
    getAuthToken()
      .then(function (token) {
        var user = validateTokenLocally(token);
        if (user) {
          onAuthSuccess(user);
        } else {
          onAuthFail();
        }
      })
      .catch(function () {
        onAuthFail();
      });
  }

  // Listen for token arriving from website after OAuth
  chrome.storage.onChanged.addListener(function (changes, area) {
    if (area === 'local' && changes.access_token && changes.access_token.newValue) {
      var user = validateTokenLocally(changes.access_token.newValue);
      if (user) {
        onAuthSuccess(user);
      } else {
        onAuthFail();
      }
    }
  });

  // ===== DOWNLOAD RECORDINGS (testing only) =====
  function downloadRecordings() {
    sectionKeys.forEach(function (key) {
      var s = sec[key];
      if (!s.blob) return;

      var url = URL.createObjectURL(s.blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = problemName.replace(/\s+/g, '-').toLowerCase() + '_' + key + '.webm';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setTimeout(function () {
        URL.revokeObjectURL(url);
      }, 1000);
    });

    console.log('[articuLeet] Downloaded all recorded sections');
  }

  // ===== COMPLETE (mock feedback — no backend) =====
  function updateComplete() {
    var total = 0;
    var done = 0;
    sectionKeys.forEach(function (key) {
      total += sec[key].seconds;
      if (sec[key].blob) done++;
    });

    var totalEl = root.querySelector('.total-time');
    if (totalEl) totalEl.textContent = fmt(total);

    var progEl = root.querySelector('.progress-indicator');
    if (progEl) {
      progEl.textContent = sectionKeys.map(function (k) {
        return sec[k].blob ? '●' : '○';
      }).join(' ');
    }

    var secText = root.querySelector('.sections-text');
    if (secText) secText.textContent = done + '/5 Sections';

    var timesEl = root.querySelector('.section-times');
    if (timesEl) {
      timesEl.innerHTML = sectionKeys.map(function (key) {
        var s = sec[key];
        var status = s.blob ? 'recorded' : 'skipped';
        var label = s.blob ? fmt(s.seconds) : 'Skipped';
        return '<div class="section-time-row">' +
          '<span>' + sectionNames[key] + '</span>' +
          '<span class="mono ' + status + '">' + label + '</span>' +
          '</div>';
      }).join('');
    }

    // Mock feedback — replace with real API call when backend is deployed
    console.log('[articuLeet] Session complete (' + done + '/5 sections, ' + fmt(total) + ' total)');
    console.log('[articuLeet] Backend not connected — showing mock feedback');

    updateFeedback({
      Communication: 3,
      Communication_reason: 'Clear explanation of constraints and edge cases.',
      Ps: 3,
      Ps_reason: 'Chose optimal hashmap approach quickly.',
      code: 2,
      code_reason: 'Minor variable naming issues.',
      Pass: true,
      overall_takeaway: 'Solid walkthrough — tighten up variable naming and narrate edge-case handling earlier.'
    });
  }

  function resetAll() {
    sectionKeys.forEach(function (key) {
      resetSection(key);
    });
    releaseMic();
    currentSection = null;
    resetFeedback();
    updateCloseButtons();
  }

  // ===== WIRE UP SECTION BUTTONS =====
  sectionKeys.forEach(function (key, index) {
    var screen = screens[key];

    screen.querySelector('.start-sec-btn').addEventListener('click', function () {
      startRec(key);
    });

    screen.querySelector('.skip-btn').addEventListener('click', function () {
      sec[key].skipped = true;
      advanceTo(key);
    });

    screen.querySelector('.stop-btn').addEventListener('click', function () {
      if (sec[key].recording) {
        stopRec(key);
      } else {
        startRec(key);
      }
    });

    screen.querySelector('.pause-btn').addEventListener('click', function () {
      pauseRec(key);
    });

    screen.querySelector('.restart-btn').addEventListener('click', function () {
      restartRec(key);
    });

    screen.querySelector('.next-btn').addEventListener('click', function () {
      if (sec[key].recording) {
        stopRec(key).then(function () { advanceTo(key); });
      } else {
        advanceTo(key);
      }
    });

    var redoBtn = screen.querySelector('.redo-btn');
    if (redoBtn && index > 0) {
      redoBtn.addEventListener('click', function () {
        var prevKey = sectionKeys[index - 1];
        resetSection(prevKey);
        show(prevKey);
      });
    }
  });

  // ===== MINI BAR =====
  var mini = screens.mini;

  mini.querySelector('.stop-btn').addEventListener('click', function () {
    if (!currentSection) return;
    if (sec[currentSection].recording) {
      stopRec(currentSection);
    } else {
      startRec(currentSection);
    }
  });

  mini.querySelector('.pause-btn').addEventListener('click', function () {
    if (currentSection) pauseRec(currentSection);
  });

  mini.querySelector('.restart-btn').addEventListener('click', function () {
    if (currentSection) restartRec(currentSection);
  });

    // ===== DOWNLOAD RECORDINGS (testing only) =====
    function downloadRecordings() {
      sectionKeys.forEach(function (key) {
        var s = sec[key];
        if (!s.blob) return;
  
        var url = URL.createObjectURL(s.blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = problemName.replace(/\s+/g, '-').toLowerCase() + '_' + key + '.webm';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
  
        // Clean up the object URL after a short delay
        setTimeout(function () {
          URL.revokeObjectURL(url);
        }, 1000);
      });
  
      console.log('[articuLeet] Downloaded all recorded sections');
    }

  // ===== NAV BUTTONS =====
  root.querySelector('#btn-start-recording').addEventListener('click', function () {
    show('sec1');
  });

  root.querySelector('#btn-new-session').addEventListener('click', function () {
    resetAll();
    show('start');
  });

  root.querySelector('#btn-download-recordings').addEventListener('click', function () {
    downloadRecordings();
  });

  root.querySelector('#btn-expand-mini').addEventListener('click', function () {
    show(lastScreen);
  });

  root.querySelectorAll('.expand-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var current = Object.entries(screens).find(function (pair) {
        return pair[1].classList.contains('active');
      });
      if (current) lastScreen = current[0];
      show('mini');
    });
  });

  root.querySelectorAll('.close-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var isRecording = currentSection && sec[currentSection] && sec[currentSection].recording;
      if (!isRecording) {
        userClosed = true;
        host.style.display = 'none';
      }
    });
  });

  // ===== LOGIN BUTTON =====
  root.querySelector('#btn-google-signin').addEventListener('click', function () {
    window.open('https://articuleet.com/auth/extension', '_blank');
  });

  // ===== DASHBOARD BUTTONS =====
  root.querySelectorAll('.btn-outline').forEach(function (btn) {
    if (btn.textContent.trim() === 'View Dashboard' || btn.textContent.trim() === 'View Full Analysis') {
      btn.addEventListener('click', function () {
        window.open(DASHBOARD_URL, '_blank');
      });
    }
  });

  // ===== DOWNLOAD BUTTON =====
  root.querySelector('#btn-download-recordings').addEventListener('click', function () {
    downloadRecordings();
  });

  // ===== INIT =====
  updateCloseButtons();
  checkAuth();
})();