(function () {
  if (document.getElementById('articuleet-host')) return;

  // ===== SETUP =====
  var fontLink = document.createElement('link');
  fontLink.rel = 'stylesheet';
  fontLink.href = 'https://fonts.googleapis.com/css2?family=Chivo+Mono:wght@400;600&family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Hedvig+Letters+Serif:opsz@12..24&display=swap';
  document.head.appendChild(fontLink);

  var host = document.createElement('div');
  host.id = 'articuleet-host';
  host.style.cssText = 'position:fixed; bottom:20px; right:20px; z-index:2147483647;';
  document.body.appendChild(host);

  chrome.runtime.onMessage.addListener(function (msg) {
    if (msg.action === 'toggle') {
      host.style.display = host.style.display === 'none' ? '' : 'none';
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

  // ===== SCREENS =====
  var screens = {
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

  var lastScreen = 'start';
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
    };
  });

  // ===== SHOW SCREEN =====
  function show(key) {
    if (key !== 'mini') lastScreen = key;
    Object.values(screens).forEach(function (s) { s.classList.remove('active'); });
    screens[key].classList.add('active');
    if (key === 'mini' && currentSection) syncMini();
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
      currentSection = key;
      tickStart(key);
      refreshUI(key);
    });
  }

  function stopRec(key) {
    return new Promise(function (resolve) {
      var s = sec[key];
      if (!s.recorder || s.recorder.state === 'inactive') {
        s.recording = false;
        tickStop(key);
        refreshUI(key);
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
        return '<div class="section-time-row">' +
          '<span>' + sectionNames[key] + '</span>' +
          '<span class="mono ' + status + '">' + fmt(s.seconds) + '</span>' +
          '</div>';
      }).join('');
    }
  }

  function resetAll() {
    sectionKeys.forEach(function (key) {
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
      updateTimer(key);
      refreshUI(key);
    });
    releaseMic();
    currentSection = null;
  }

  // ===== WIRE UP SECTION BUTTONS =====
  sectionKeys.forEach(function (key) {
    var screen = screens[key];

    // Stop / Record toggle (red dot)
    screen.querySelector('.stop-btn').addEventListener('click', function () {
      if (sec[key].recording) {
        stopRec(key);
      } else {
        startRec(key);
      }
    });

    // Pause / Resume
    screen.querySelector('.pause-btn').addEventListener('click', function () {
      pauseRec(key);
    });

    // Restart section
    screen.querySelector('.restart-btn').addEventListener('click', function () {
      restartRec(key);
    });

    // Next section
    screen.querySelector('.next-btn').addEventListener('click', function () {
      var advance = function () {
        var i = flow.indexOf(key);
        if (i === -1 || i >= flow.length - 1) return;
        var next = flow[i + 1];
        show(next);
        if (sectionKeys.indexOf(next) !== -1) {
          startRec(next);
        } else if (next === 'complete') {
          updateComplete();
          releaseMic();
        }
      };
      if (sec[key].recording) {
        stopRec(key).then(advance);
      } else {
        advance();
      }
    });
  });

  // ===== MINI BAR BUTTONS =====
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

  mini.querySelector('.next-btn').addEventListener('click', function () {
    if (!currentSection) return;
    var key = currentSection;
    var advance = function () {
      var i = flow.indexOf(key);
      if (i === -1 || i >= flow.length - 1) return;
      var next = flow[i + 1];
      show(next);
      if (sectionKeys.indexOf(next) !== -1) {
        startRec(next);
      } else if (next === 'complete') {
        updateComplete();
        releaseMic();
      }
    };
    if (sec[key].recording) {
      stopRec(key).then(advance);
    } else {
      advance();
    }
  });

  // ===== NAV BUTTONS =====
  root.querySelector('#btn-start-recording').addEventListener('click', function () {
    show('sec1');
    startRec('sec1');
  });

  root.querySelector('#btn-new-session').addEventListener('click', function () {
    resetAll();
    show('start');
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
      host.style.display = 'none';
    });
  });
})();