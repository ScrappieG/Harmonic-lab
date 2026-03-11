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
    <button class="btn-primary" id="btn-start-recording">Begin →</button>
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
<div id="screen-section-1" class="screen" data-section="sec1">
  <header class="header">
    <h1 class="logo">articu<b>L</b>eet</h1>
    <div class="header-btns">
      <button class="icon-btn expand-btn">⤢</button>
      <button class="icon-btn close-btn">✕</button>
    </div>
  </header>
  <hr class="divider">
  <section class="content">
    <p class="progress-line">In Progress: Two Sum</p>
    <p class="section-line"><strong>Section 1:</strong> Problem Clarification &amp; Questions</p>
    <div class="dots">
      <span class="dot active"></span>
      <span class="dot"></span>
      <span class="dot"></span>
      <span class="dot"></span>
      <span class="dot"></span>
    </div>
    <hr class="divider-light">
    <p class="instruction">Clarify inputs/outputs, edge cases, constraints. Ask questions aloud.</p>
    <div class="section-actions">
      <button class="btn-primary start-sec-btn">Start Recording →</button>
      <div class="row-center">
        <button class="btn-outline-subtle skip-btn">Skip Section →</button>
      </div>
    </div>
    <div class="controls hidden">
      <div class="rec-group">
        <button class="icon-btn rec-dot stop-btn">⏺</button>
        <span class="timer section-timer">00:00</span>
      </div>
      <div class="transport">
        <button class="icon-btn pause-btn">⏸</button>
        <button class="icon-btn restart-btn">↻</button>
      </div>
      <button class="icon-btn help-btn">?</button>
    </div>
    <div class="hidden complete-section-wrap">
      <button class="btn-complete-section next-btn">Complete Section →</button>
    </div>
  </section>
  <hr class="divider">
  <footer class="user-footer">
    <div class="avatar">H</div>
    <div class="user-info"><span class="name">Harmon</span><span class="email">m@example.com</span></div>
  </footer>
</div>

<!-- SECTION 2 -->
<div id="screen-section-2" class="screen" data-section="sec2">
  <header class="header">
    <h1 class="logo">articu<b>L</b>eet</h1>
    <div class="header-btns">
      <button class="icon-btn expand-btn">⤢</button>
      <button class="icon-btn close-btn">✕</button>
    </div>
  </header>
  <hr class="divider">
  <section class="content">
    <p class="progress-line">In Progress: Two Sum</p>
    <p class="section-line"><strong>Section 2:</strong> High Level Approach</p>
    <div class="dots">
      <span class="dot done"></span>
      <span class="dot active"></span>
      <span class="dot"></span>
      <span class="dot"></span>
      <span class="dot"></span>
    </div>
    <hr class="divider-light">
    <p class="instruction">Describe your approach at a high level. What data structures or patterns will you use?</p>
    <div class="section-actions">
      <button class="btn-primary start-sec-btn">Start Recording →</button>
      <div class="row-center gap-12">
        <button class="btn-outline-subtle redo-btn">← Redo Last</button>
        <button class="btn-outline-subtle skip-btn">Skip Section →</button>
      </div>
    </div>
    <div class="controls hidden">
      <div class="rec-group">
        <button class="icon-btn rec-dot stop-btn">⏺</button>
        <span class="timer section-timer">00:00</span>
      </div>
      <div class="transport">
        <button class="icon-btn pause-btn">⏸</button>
        <button class="icon-btn restart-btn">↻</button>
      </div>
      <button class="icon-btn help-btn">?</button>
    </div>
    <div class="hidden complete-section-wrap">
      <button class="btn-complete-section next-btn">Complete Section →</button>
    </div>
  </section>
  <hr class="divider">
  <footer class="user-footer">
    <div class="avatar">H</div>
    <div class="user-info"><span class="name">Harmon</span><span class="email">m@example.com</span></div>
  </footer>
</div>

<!-- SECTION 3 -->
<div id="screen-section-3" class="screen" data-section="sec3">
  <header class="header">
    <h1 class="logo">articu<b>L</b>eet</h1>
    <div class="header-btns">
      <button class="icon-btn expand-btn">⤢</button>
      <button class="icon-btn close-btn">✕</button>
    </div>
  </header>
  <hr class="divider">
  <section class="content">
    <p class="progress-line">In Progress: Two Sum</p>
    <p class="section-line"><strong>Section 3:</strong> Implementation</p>
    <div class="dots">
      <span class="dot done"></span>
      <span class="dot done"></span>
      <span class="dot active"></span>
      <span class="dot"></span>
      <span class="dot"></span>
    </div>
    <hr class="divider-light">
    <p class="instruction">Talk through your code as you write it. Explain each decision and logic step aloud.</p>
    <div class="section-actions">
      <button class="btn-primary start-sec-btn">Start Recording →</button>
      <div class="row-center gap-12">
        <button class="btn-outline-subtle redo-btn">← Redo Last</button>
        <button class="btn-outline-subtle skip-btn">Skip Section →</button>
      </div>
    </div>
    <div class="controls hidden">
      <div class="rec-group">
        <button class="icon-btn rec-dot stop-btn">⏺</button>
        <span class="timer section-timer">00:00</span>
      </div>
      <div class="transport">
        <button class="icon-btn pause-btn">⏸</button>
        <button class="icon-btn restart-btn">↻</button>
      </div>
      <button class="icon-btn help-btn">?</button>
    </div>
    <div class="hidden complete-section-wrap">
      <button class="btn-complete-section next-btn">Complete Section →</button>
    </div>
  </section>
  <hr class="divider">
  <footer class="user-footer">
    <div class="avatar">H</div>
    <div class="user-info"><span class="name">Harmon</span><span class="email">m@example.com</span></div>
  </footer>
</div>

<!-- SECTION 4 -->
<div id="screen-section-4" class="screen" data-section="sec4">
  <header class="header">
    <h1 class="logo">articu<b>L</b>eet</h1>
    <div class="header-btns">
      <button class="icon-btn expand-btn">⤢</button>
      <button class="icon-btn close-btn">✕</button>
    </div>
  </header>
  <hr class="divider">
  <section class="content">
    <p class="progress-line">In Progress: Two Sum</p>
    <p class="section-line"><strong>Section 4:</strong> Testing &amp; Edge Cases</p>
    <div class="dots">
      <span class="dot done"></span>
      <span class="dot done"></span>
      <span class="dot done"></span>
      <span class="dot active"></span>
      <span class="dot"></span>
    </div>
    <hr class="divider-light">
    <p class="instruction">Walk through test cases. Trace your code with examples. Consider edge cases.</p>
    <div class="section-actions">
      <button class="btn-primary start-sec-btn">Start Recording →</button>
      <div class="row-center gap-12">
        <button class="btn-outline-subtle redo-btn">← Redo Last</button>
        <button class="btn-outline-subtle skip-btn">Skip Section →</button>
      </div>
    </div>
    <div class="controls hidden">
      <div class="rec-group">
        <button class="icon-btn rec-dot stop-btn">⏺</button>
        <span class="timer section-timer">00:00</span>
      </div>
      <div class="transport">
        <button class="icon-btn pause-btn">⏸</button>
        <button class="icon-btn restart-btn">↻</button>
      </div>
      <button class="icon-btn help-btn">?</button>
    </div>
    <div class="hidden complete-section-wrap">
      <button class="btn-complete-section next-btn">Complete Section →</button>
    </div>
  </section>
  <hr class="divider">
  <footer class="user-footer">
    <div class="avatar">H</div>
    <div class="user-info"><span class="name">Harmon</span><span class="email">m@example.com</span></div>
  </footer>
</div>

<!-- SECTION 5 -->
<div id="screen-section-5" class="screen" data-section="sec5">
  <header class="header">
    <h1 class="logo">articu<b>L</b>eet</h1>
    <div class="header-btns">
      <button class="icon-btn expand-btn">⤢</button>
      <button class="icon-btn close-btn">✕</button>
    </div>
  </header>
  <hr class="divider">
  <section class="content">
    <p class="progress-line">In Progress: Two Sum</p>
    <p class="section-line"><strong>Section 5:</strong> Complexity &amp; Tradeoffs</p>
    <div class="dots">
      <span class="dot done"></span>
      <span class="dot done"></span>
      <span class="dot done"></span>
      <span class="dot done"></span>
      <span class="dot active"></span>
    </div>
    <hr class="divider-light">
    <p class="instruction">Time O(?), Space O(?). Why? Brute force vs. optimal. Discuss tradeoffs.</p>
    <div class="section-actions">
      <button class="btn-primary start-sec-btn">Start Recording →</button>
      <div class="row-center gap-12">
        <button class="btn-outline-subtle redo-btn">← Redo Last</button>
        <button class="btn-outline-subtle skip-btn">Skip Section →</button>
      </div>
    </div>
    <div class="controls hidden">
      <div class="rec-group">
        <button class="icon-btn rec-dot stop-btn">⏺</button>
        <span class="timer section-timer">00:00</span>
      </div>
      <div class="transport">
        <button class="icon-btn pause-btn">⏸</button>
        <button class="icon-btn restart-btn">↻</button>
      </div>
      <button class="icon-btn help-btn">?</button>
    </div>
    <div class="hidden complete-section-wrap">
      <button class="btn-complete-section next-btn">Finish Session →</button>
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
    <p class="complete-sub">Two Sum — Full Walkthrough</p>
    <hr class="divider-light">
    <p class="summary-line"><span class="label-upper">Progress</span> <span class="progress-indicator">○ ○ ○ ○ ○</span> <span class="sections-text">0/5 Sections</span></p>
    <p class="summary-line"><span class="label-upper">Time</span> <span class="mono total-time">00:00</span></p>
    <hr class="divider-light">
    <p class="section-times-heading">Section Times</p>
    <div class="section-times"></div>
    <hr class="divider-light">

    <!-- Pass / Fail badge -->
    <div class="pass-fail-wrap">
      <span class="pass-fail-badge" id="fb-pass-fail">—</span>
    </div>

    <p class="feedback-heading">Quick Feedback</p>
    <div class="feedback">
      <div class="fb-row">
        <span>Communication</span>
        <span class="rating-dots" id="fb-communication">
          <span class="dot-empty"></span><span class="dot-empty"></span><span class="dot-empty"></span><span class="dot-empty"></span>
        </span>
      </div>
      <div class="fb-row">
        <span>Problem Solving</span>
        <span class="rating-dots" id="fb-ps">
          <span class="dot-empty"></span><span class="dot-empty"></span><span class="dot-empty"></span><span class="dot-empty"></span>
        </span>
      </div>
      <div class="fb-row">
        <span>Code</span>
        <span class="rating-dots" id="fb-code">
          <span class="dot-empty"></span><span class="dot-empty"></span><span class="dot-empty"></span><span class="dot-empty"></span>
        </span>
      </div>
      <div class="fb-row fb-row-overall">
        <span>Overall</span>
        <span class="rating-dots" id="fb-overall">
          <span class="dot-empty"></span><span class="dot-empty"></span><span class="dot-empty"></span><span class="dot-empty"></span>
        </span>
      </div>
    </div>

    <!-- Overall takeaway -->
    <p class="overall-takeaway" id="fb-takeaway"></p>

    <div class="row-center gap-12" style="margin-top:16px">
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
      <button class="icon-btn rec-dot stop-btn">⏺</button>
      <span class="timer mini-timer">00:00</span>
      <span class="mini-sep"></span>
      <button class="icon-btn pause-btn">⏸</button>
      <button class="icon-btn restart-btn">↻</button>
    </div>
    <button class="icon-btn" id="btn-expand-mini">▼</button>
    <button class="icon-btn close-btn">✕</button>
  </div>
</div>

`;