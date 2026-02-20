// Separated for readability — just a string export
const WIDGET_HTML = `

<!-- START -->
<div id="screen-start" class="screen active">
  <header class="header">
    <h1 class="logo">articu<b>L</b>eet</h1>
    <div class="header-btns">
      <button class="icon-btn expand-btn">⤢</button>
      <button class="icon-btn close-btn">✕</button>
    </div>
  </header>
  <hr class="divider">
  <section class="content">
    <p class="session-label"><em>Start Session for:</em><br><strong class="problem-name">Two Sum</strong></p>
    <button class="btn-primary" id="btn-start-recording">START RECORDING ▶</button>
    <div class="row-center gap-12">
      <button class="btn-outline">View Dashboard</button>
      <button class="icon-btn help-btn">?</button>
    </div>
  </section>
  <hr class="divider">
  <footer class="user-footer">
    <div class="avatar">H</div>
    <div class="user-info"><span class="name">Harmon</span><span class="email">m@example.com</span></div>
  </footer>
</div>

<!-- SECTION 1 -->
<div id="screen-section-1" class="screen">
  <header class="header">
    <h1 class="logo">articu<b>L</b>eet</h1>
    <div class="header-btns">
      <button class="icon-btn expand-btn">⤢</button>
      <button class="icon-btn close-btn">✕</button>
    </div>
  </header>
  <hr class="divider">
  <section class="content">
    <p class="progress-line"><strong>In Progress: Two Sum</strong></p>
    <p class="section-line"><strong>Section 1:</strong> Problem Clarification &amp; Questions</p>
    <div class="dots">
      <span class="dot active"></span>
      <span class="dot"></span>
      <span class="dot"></span>
      <span class="dot"></span>
      <span class="dot"></span>
    </div>
    <hr class="divider-light">
    <p class="instruction"><strong>Verbalize:</strong> Clarify inputs/outputs, edge cases, constraints. Ask questions aloud.</p>
    <div class="controls">
      <div class="rec-group"><button class="icon-btn rec-dot">⏺</button><span class="timer">02:24</span></div>
      <div class="transport"><button class="icon-btn">⏸</button><button class="icon-btn">↻</button><button class="icon-btn btn-next">⏭</button></div>
      <button class="icon-btn help-btn">?</button>
    </div>
  </section>
  <hr class="divider">
  <footer class="user-footer">
    <div class="avatar">H</div>
    <div class="user-info"><span class="name">Harmon</span><span class="email">m@example.com</span></div>
  </footer>
</div>

<!-- SECTION 2 -->
<div id="screen-section-2" class="screen">
  <header class="header">
    <h1 class="logo">articu<b>L</b>eet</h1>
    <div class="header-btns">
      <button class="icon-btn expand-btn">⤢</button>
      <button class="icon-btn close-btn">✕</button>
    </div>
  </header>
  <hr class="divider">
  <section class="content">
    <p class="progress-line"><strong>In Progress: Two Sum</strong></p>
    <p class="section-line"><strong>Section 2:</strong> High Level Approach</p>
    <div class="dots">
      <span class="dot done"></span>
      <span class="dot active"></span>
      <span class="dot"></span>
      <span class="dot"></span>
      <span class="dot"></span>
    </div>
    <hr class="divider-light">
    <p class="instruction"><strong>Verbalize:</strong> Describe your approach at a high level. What data structures or patterns will you use?</p>
    <div class="controls">
      <div class="rec-group"><button class="icon-btn rec-dot">⏺</button><span class="timer">05:47</span></div>
      <div class="transport"><button class="icon-btn">⏸</button><button class="icon-btn">↻</button><button class="icon-btn btn-next">⏭</button></div>
      <button class="icon-btn help-btn">?</button>
    </div>
  </section>
  <hr class="divider">
  <footer class="user-footer">
    <div class="avatar">H</div>
    <div class="user-info"><span class="name">Harmon</span><span class="email">m@example.com</span></div>
  </footer>
</div>

<!-- SECTION 3 -->
<div id="screen-section-3" class="screen">
  <header class="header">
    <h1 class="logo">articu<b>L</b>eet</h1>
    <div class="header-btns">
      <button class="icon-btn expand-btn">⤢</button>
      <button class="icon-btn close-btn">✕</button>
    </div>
  </header>
  <hr class="divider">
  <section class="content">
    <p class="progress-line"><strong>In Progress: Two Sum</strong></p>
    <p class="section-line"><strong>Section 3:</strong> Implementation</p>
    <div class="dots">
      <span class="dot done"></span>
      <span class="dot done"></span>
      <span class="dot active"></span>
      <span class="dot"></span>
      <span class="dot"></span>
    </div>
    <hr class="divider-light">
    <p class="instruction"><strong>Verbalize:</strong> Talk through your code as you write it. Explain each decision and logic step aloud.</p>
    <div class="controls">
      <div class="rec-group"><button class="icon-btn rec-dot">⏺</button><span class="timer">10:12</span></div>
      <div class="transport"><button class="icon-btn">⏸</button><button class="icon-btn">↻</button><button class="icon-btn btn-next">⏭</button></div>
      <button class="icon-btn help-btn">?</button>
    </div>
  </section>
  <hr class="divider">
  <footer class="user-footer">
    <div class="avatar">H</div>
    <div class="user-info"><span class="name">Harmon</span><span class="email">m@example.com</span></div>
  </footer>
</div>

<!-- SECTION 4 -->
<div id="screen-section-4" class="screen">
  <header class="header">
    <h1 class="logo">articu<b>L</b>eet</h1>
    <div class="header-btns">
      <button class="icon-btn expand-btn">⤢</button>
      <button class="icon-btn close-btn">✕</button>
    </div>
  </header>
  <hr class="divider">
  <section class="content">
    <p class="progress-line"><strong>In Progress: Two Sum</strong></p>
    <p class="section-line"><strong>Section 4:</strong> Testing &amp; Edge Cases</p>
    <div class="dots">
      <span class="dot done"></span>
      <span class="dot done"></span>
      <span class="dot done"></span>
      <span class="dot active"></span>
      <span class="dot"></span>
    </div>
    <hr class="divider-light">
    <p class="instruction"><strong>Verbalize:</strong> Walk through test cases. Trace your code with examples. Consider edge cases.</p>
    <div class="controls">
      <div class="rec-group"><button class="icon-btn rec-dot">⏺</button><span class="timer">13:05</span></div>
      <div class="transport"><button class="icon-btn">⏸</button><button class="icon-btn">↻</button><button class="icon-btn btn-next">⏭</button></div>
      <button class="icon-btn help-btn">?</button>
    </div>
  </section>
  <hr class="divider">
  <footer class="user-footer">
    <div class="avatar">H</div>
    <div class="user-info"><span class="name">Harmon</span><span class="email">m@example.com</span></div>
  </footer>
</div>

<!-- SECTION 5 -->
<div id="screen-section-5" class="screen">
  <header class="header">
    <h1 class="logo">articu<b>L</b>eet</h1>
    <div class="header-btns">
      <button class="icon-btn expand-btn">⤢</button>
      <button class="icon-btn close-btn">✕</button>
    </div>
  </header>
  <hr class="divider">
  <section class="content">
    <p class="progress-line"><strong>In Progress: Two Sum</strong></p>
    <p class="section-line"><strong>Section 5:</strong> Complexity &amp; Tradeoffs</p>
    <div class="dots">
      <span class="dot done"></span>
      <span class="dot done"></span>
      <span class="dot done"></span>
      <span class="dot done"></span>
      <span class="dot active"></span>
    </div>
    <hr class="divider-light">
    <p class="instruction"><strong>Verbalize:</strong> Time O(?), Space O(?). Why? Brute force vs. optimal. Discuss tradeoffs.</p>
    <div class="controls">
      <div class="rec-group"><button class="icon-btn rec-dot" id="btn-stop">⏺</button><span class="timer">15:35</span></div>
      <div class="transport"><button class="icon-btn">⏸</button><button class="icon-btn">↻</button><button class="icon-btn btn-next">⏭</button></div>
      <button class="icon-btn help-btn">?</button>
    </div>
  </section>
  <hr class="divider">
  <footer class="user-footer">
    <div class="avatar">H</div>
    <div class="user-info"><span class="name">Harmon</span><span class="email">m@example.com</span></div>
  </footer>
</div>

<!-- COMPLETE -->
<div id="screen-complete" class="screen">
  <header class="header">
    <h1 class="logo">articu<b>L</b>eet</h1>
    <div class="header-btns">
      <button class="icon-btn expand-btn">⤢</button>
      <button class="icon-btn close-btn">✕</button>
    </div>
  </header>
  <hr class="divider">
  <section class="content">
    <div class="row-center gap-8"><span class="complete-title">Session Complete!</span><span class="check-icon">☑</span></div>
    <p class="complete-sub">Two Sum - Full Walkthrough</p>
    <hr class="divider-light">
    <p><strong>Progress:</strong> ●●●●● (All Sections)</p>
    <p style="margin-bottom:10px"><strong>Time:</strong> 30:14</p>
    <p class="feedback-heading"><strong>Quick Feedback:</strong></p>
    <div class="feedback">
      <div class="fb-row"><span>Problem Clarification:</span><span class="stars">★★★☆☆</span></div>
      <div class="fb-row"><span>High Level Approach:</span><span class="stars">★★★★☆</span></div>
      <div class="fb-row"><span>Implementation:</span><span class="stars">★★☆☆☆</span></div>
      <div class="fb-row"><span>Testing &amp; Edge Cases:</span><span class="stars">★★★✦☆</span></div>
      <div class="fb-row"><span>Complexity &amp; Tradeoffs:</span><span class="stars">★★★★★</span></div>
    </div>
    <div class="row-center gap-12" style="margin-top:14px">
      <button class="btn-outline">View Full Analysis</button>
      <button class="btn-outline" id="btn-new-session">New Session</button>
    </div>
  </section>
  <hr class="divider">
  <footer class="user-footer">
    <div class="avatar">H</div>
    <div class="user-info"><span class="name">Harmon</span><span class="email">m@example.com</span></div>
  </footer>
</div>

<!-- MINI -->
<div id="screen-minimized" class="screen">
  <div class="mini-bar">
    <span class="logo-mini">articu<b>L</b>eet</span>
    <div class="mini-controls">
      <button class="icon-btn rec-dot">⏺</button>
      <span class="timer mini-timer">13:33</span>
      <span class="mini-sep"></span>
      <button class="icon-btn">⏸</button>
      <button class="icon-btn">↻</button>
      <button class="icon-btn">⏭</button>
    </div>
    <button class="icon-btn" id="btn-expand-mini">▼</button>
    <button class="icon-btn close-btn">✕</button>
  </div>
</div>

`;