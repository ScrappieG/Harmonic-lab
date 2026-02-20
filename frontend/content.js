(function () {
  if (document.getElementById('articuleet-host')) return;

  // Font
  const fontLink = document.createElement('link');
  fontLink.rel = 'stylesheet';
  fontLink.href = 'https://fonts.googleapis.com/css2?family=Hedvig+Letters+Serif:opsz@12..24&display=swap';
  document.head.appendChild(fontLink);

  // Host
  const host = document.createElement('div');
  host.id = 'articuleet-host';
  host.style.cssText = 'position:fixed; bottom:20px; right:20px; z-index:2147483647;';
  document.body.appendChild(host);

  // Toggle listener
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.action === 'toggle') {
      host.style.display = host.style.display === 'none' ? '' : 'none';
    }
  });

  // Shadow DOM
  const shadow = host.attachShadow({ mode: 'open' });

  // Font inside shadow
  const shadowFont = document.createElement('link');
  shadowFont.rel = 'stylesheet';
  shadowFont.href = 'https://fonts.googleapis.com/css2?family=Hedvig+Letters+Serif:opsz@12..24&display=swap';
  shadow.appendChild(shadowFont);

  // CSS
  const cssLink = document.createElement('link');
  cssLink.rel = 'stylesheet';
  cssLink.href = chrome.runtime.getURL('widget.css');
  shadow.appendChild(cssLink);

  // Build widget
  const root = document.createElement('div');
  root.className = 'widget-root';
  root.innerHTML = WIDGET_HTML;
  shadow.appendChild(root);

  // Screen logic
  const screens = {
    start:    root.querySelector('#screen-start'),
    sec1:     root.querySelector('#screen-section-1'),
    sec2:     root.querySelector('#screen-section-2'),
    sec3:     root.querySelector('#screen-section-3'),
    sec4:     root.querySelector('#screen-section-4'),
    sec5:     root.querySelector('#screen-section-5'),
    complete: root.querySelector('#screen-complete'),
    mini:     root.querySelector('#screen-minimized'),
  };

  const flow = ['sec1', 'sec2', 'sec3', 'sec4', 'sec5', 'complete'];
  let lastScreen = 'start';

  function show(key) {
    if (key !== 'mini') lastScreen = key;
    Object.values(screens).forEach(s => s.classList.remove('active'));
    screens[key].classList.add('active');
  }

  root.querySelector('#btn-start-recording').addEventListener('click', () => show('sec1'));
  root.querySelector('#btn-stop').addEventListener('click', () => show('complete'));
  root.querySelector('#btn-new-session').addEventListener('click', () => show('start'));
  root.querySelector('#btn-expand-mini').addEventListener('click', () => show(lastScreen));

  root.querySelectorAll('.btn-next').forEach(btn => {
    btn.addEventListener('click', () => {
      const current = Object.entries(screens).find(([, el]) => el.classList.contains('active'));
      if (!current) return;
      const i = flow.indexOf(current[0]);
      if (i !== -1 && i < flow.length - 1) show(flow[i + 1]);
    });
  });

  root.querySelectorAll('.expand-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const current = Object.entries(screens).find(([, el]) => el.classList.contains('active'));
      if (current) lastScreen = current[0];
      show('mini');
    });
  });

  root.querySelectorAll('.close-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      host.style.display = 'none';
    });
  });
})();