  /* ── 뷰어 모드: 빈 필드 "사용자가 입력하지 않음" 표시 ── */
  function applyViewerEmptyState() {
    const EMPTY_MSG = '사용자가 입력하지 않음';

    // Fill-All 모드 아티팩트 정리 — 공유 시점엔 뷰어 전용 메시지가 우선
    // (자동채우기 실행 후 비어 있던 필드에 남아 있을 수 있는 "⚠ AI가 채우지 못함" 플레이스홀더 + 노란 강조 클래스 제거)
    document.querySelectorAll('.ai-fill-empty').forEach(el => {
      el.classList.remove('ai-fill-empty');
      if (el._origPlaceholder !== undefined) {
        try { el.placeholder = el._origPlaceholder; } catch(_) {}
        delete el._origPlaceholder;
      }
    });

    // 일반 input[type=text], input[type=date], textarea
    document.querySelectorAll(
      'input[type="text"]:not(#add-tool-input):not(.wf-tool), input[type="date"], textarea:not(.img-caption)'
    ).forEach(el => {
      if (!el.value.trim()) {
        el.placeholder = EMPTY_MSG;
        el.style.color = '#bbb';
        el.classList.add('viewer-empty');
      }
    });

    // contenteditable div (이메일, 도구 등)
    document.querySelectorAll('[contenteditable="true"]').forEach(el => {
      if (!el.innerText.trim()) {
        el.setAttribute('data-placeholder', EMPTY_MSG);
        el.classList.add('viewer-empty');
      }
    });

    // 이모지 버튼 (선택 안 했을 때)
    const emojiBtn = document.getElementById('emoji-btn');
    if (emojiBtn && emojiBtn.classList.contains('placeholder')) {
      emojiBtn.textContent = EMPTY_MSG;
      emojiBtn.style.fontSize = '11px';
      emojiBtn.style.color = '#bbb';
      emojiBtn.style.width = 'auto';
      emojiBtn.style.padding = '0 10px';
    }

    // 콤보박스 인풋 (목표/문제)
    ['goal-input-text', 'problem-input'].forEach(id => {
      const el = document.getElementById(id);
      if (el && !el.value.trim()) el.placeholder = EMPTY_MSG;
    });

    // 인사이트 드롭다운: 선택 항목 없고 직접 작성도 없으면 안내
    [
      { tagsId: 'good-tags', directId: 'good-direct', selected: goodSelected },
      { tagsId: 'bad-tags',  directId: 'bad-direct',  selected: badSelected },
      { tagsId: 'aix-tags',  directId: 'aix-direct',  selected: aixSelected },
      { tagsId: 'aio-tags',  directId: 'aio-direct',  selected: aioSelected },
    ].forEach(({ tagsId, directId, selected }) => {
      const tagsWrap = document.getElementById(tagsId);
      const directEl = document.getElementById(directId);
      const isEmpty = selected.size === 0 && (!directEl || !directEl.value.trim());
      if (tagsWrap && isEmpty) {
        const msg = document.createElement('div');
        msg.className = 'viewer-empty-msg';
        msg.textContent = EMPTY_MSG;
        tagsWrap.appendChild(msg);
      }
    });

    // QA 항목: Y/N 미선택 시 안내
    QA_KEYS.forEach(key => {
      const row = document.querySelector(`.qa-row[data-key="${key}"]`);
      if (!row) return;
      const isY = row.classList.contains('is-y');
      const isN = row.classList.contains('is-n');
      if (!isY && !isN) {
        const label = row.querySelector('.qa-check-text');
        if (label) {
          const msg = document.createElement('span');
          msg.className = 'viewer-empty-msg';
          msg.style.marginLeft = '8px';
          msg.textContent = `(${EMPTY_MSG})`;
          label.appendChild(msg);
        }
      }
    });
  }

  function expandViewerComboFields() {
    const FIELD_LABELS = { 'goal-input-text': '목표', 'problem-input': '문제정의' };
    ['goal-input-text', 'problem-input'].forEach(id => {
      const input = document.getElementById(id);
      if (!input) return;
      const wrap = input.closest('.combo-wrap');
      if (!wrap) return;

      // 각 필드 앞에 서브라벨 삽입
      const lbl = document.createElement('div');
      lbl.className = 'viewer-field-sublabel';
      lbl.textContent = FIELD_LABELS[id] || '';
      wrap.parentNode.insertBefore(lbl, wrap);

      const div = document.createElement('div');
      div.className = 'viewer-combo-text';
      div.textContent = input.value || '';
      input.style.display = 'none';
      wrap.appendChild(div);
    });

    // 소재명(task-input) — 화이트 + 줄바꿈 표시 div로 교체
    const taskInput = document.getElementById('task-input');
    if (taskInput) {
      const div = document.createElement('div');
      div.className = 'viewer-task-display';
      div.textContent = taskInput.value || '';
      taskInput.style.display = 'none';
      taskInput.parentNode.insertBefore(div, taskInput);
    }
  }

  function applySnapData(snap) {
    if (!snap) return;
    const se = id => document.getElementById(id);
    if (snap.stage)        { const el = se('stage-select'); if (el) el.value = snap.stage; }
    if (snap.task)         { const el = se('task-input');   if (el) el.value = snap.task; }
    if (snap.date)         { const el = se('date-input');   if (el) el.value = snap.date; }
    if (snap.goal)         { const el = se('goal-input-text'); if (el) el.value = snap.goal; }
    if (snap.goalDirect)   { const el = se('goal-direct');     if (el) { el.value = snap.goalDirect; el.style.display = ''; } }
    if (snap.problem)      { const el = se('problem-input');   if (el) el.value = snap.problem; }
    if (snap.problemDirect){ const el = se('problem-direct');  if (el) { el.value = snap.problemDirect; el.style.display = ''; } }
    if (snap.editName) {
      const el = se('edited-name');
      if (el) {
        const opts = Array.from(el.options || []).map(o => o.value);
        if (!opts.includes(snap.editName)) {
          const opt = document.createElement('option');
          opt.value = snap.editName; opt.textContent = snap.editName;
          el.appendChild(opt);
        }
        el.value = snap.editName;
      }
    }
    if (snap.editEmail)    { const el = se('edited-email'); if (el) el.innerText = snap.editEmail; }
    if (snap.goalEmoji) {
      const btn = se('emoji-btn');
      if (btn) { btn.textContent = snap.goalEmoji; btn.classList.remove('placeholder'); }
    }
    // 드라이브 링크 복원
    const driveKeys = ['material', 'mid', 'final', 'prompt'];
    driveKeys.forEach((k, i) => {
      const urlVal  = snap.driveUrls?.[i]     || '';
      const nameVal = snap.driveNames?.[i]    || '';
      const procVal = snap.driveProcesses?.[i] || '';
      const hidUrl  = se('drive-' + k);
      const hidName = se('drive-' + k + '-name');
      const hidProc = se('drive-' + k + '-process');
      if (hidUrl)  hidUrl.value  = urlVal;
      if (hidName) hidName.value = nameVal;
      if (hidProc) hidProc.value = procVal;
      // 항상 호출 — 빈 상태에서도 뷰어 모드면 "사용자가 입력하지 않음" + 등록 버튼 숨김 로직이 실행되도록
      updateDriveRow(k);
    });
    // 이미지 복원
    if (snap.images) { images = snap.images; syncImageUI(); }
    // 도구 복원
    if (snap.toolList)   { toolList = snap.toolList; }
    if (snap.toolActive) { toolActive = new Set(snap.toolActive); }
    if (snap.wfRows)     { wfRows = snap.wfRows; }
    renderTools(); renderWorkflow();
    // QA 복원
    if (snap.qaData) {
      Object.entries(snap.qaData).forEach(([key, val]) => {
        if (!val) return;
        // Y/N 버튼 복원
        if (val.val) {
          const btn = document.querySelector(`.qa-${val.val}[data-key="${key}"]`);
          if (btn) btn.click();
        }
        // steps 복원
        if (val.steps && val.steps.length > 0) {
          qaStepsMap[key] = val.steps;
          renderQaStepRows(key);
        }
      });
    }
    if (snap.qaRecommend)    { const el = se('qa-recommend');    if (el) el.value = snap.qaRecommend; }
    if (snap.refInput)       { const el = se('ref-input');       if (el) el.value = snap.refInput; }
    if (snap.discoveryInput) { const el = se('discovery-input'); if (el) el.value = snap.discoveryInput; }
    // 인사이트
    // 인사이트 chips 복원 — Set 내부 참조 유지 (.clear + .add 방식)
    if (snap.aixChips)  { aixSelected.clear();  snap.aixChips.forEach(i => aixSelected.add(i));  if (_aixDD)  _aixDD.renderTags(); }
    if (snap.aioChips)  { aioSelected.clear();  snap.aioChips.forEach(i => aioSelected.add(i));  if (_aioDD)  _aioDD.renderTags(); }
    if (snap.goodChips) { goodSelected.clear(); snap.goodChips.forEach(i => goodSelected.add(i)); if (_goodDD) _goodDD.renderTags(); }
    if (snap.badChips)  { badSelected.clear();  snap.badChips.forEach(i => badSelected.add(i));  if (_badDD)  _badDD.renderTags(); }
    // 직접 작성 복원
    if (snap.effBad)  { const el = document.getElementById('aix-direct');  if (el) { el.value = snap.effBad;  const box = document.getElementById('aix-direct-box');  if (box) box.style.display = ''; } }
    if (snap.effGood) { const el = document.getElementById('aio-direct');  if (el) { el.value = snap.effGood; const box = document.getElementById('aio-direct-box');  if (box) box.style.display = ''; } }
    if (snap.goodPt)  { const el = document.getElementById('good-direct'); if (el) { el.value = snap.goodPt;  const box = document.getElementById('good-direct-box'); if (box) box.style.display = ''; } }
    if (snap.badPt)   { const el = document.getElementById('bad-direct');  if (el) { el.value = snap.badPt;   const box = document.getElementById('bad-direct-box');  if (box) box.style.display = ''; } }
  }
