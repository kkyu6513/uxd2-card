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

  /* ── AI Work Flow → 스텝 카드 리스트 렌더링 ── */
  function renderViewerWfList() {
    const wfList = document.querySelector('.wf-list');
    if (!wfList || !wfRows || wfRows.length === 0) return;

    const container = document.createElement('div');
    container.className = 'viewer-wf-list';

    wfRows.forEach((row, i) => {
      const card = document.createElement('div');
      card.className = 'viewer-wf-card';

      // [Step.N] 헤더
      const hd = document.createElement('div');
      hd.className = 'viewer-wf-card-head';
      hd.textContent = `Step.${i + 1}`;
      card.appendChild(hd);

      // 4개 항목
      const fields = [
        { label: '작성도구',       value: row.tool   },
        { label: 'INTENT(의도)',   value: row.intent },
        { label: '활동',           value: row.action },
        { label: 'GOOD 프롬프트', value: row.prompt },
      ];

      fields.forEach(({ label, value }) => {
        const item = document.createElement('div');
        item.className = 'viewer-wf-item';

        const lbl = document.createElement('span');
        lbl.className = 'viewer-wf-label';
        lbl.textContent = label;

        const val = document.createElement('span');
        val.className = 'viewer-wf-value' + (value ? '' : ' empty');
        val.textContent = value || '—';

        item.appendChild(lbl);
        item.appendChild(val);
        card.appendChild(item);
      });

      container.appendChild(card);
    });

    // 기존 wf-list 숨기고 교체
    wfList.style.setProperty('display', 'none', 'important');
    wfList.parentNode.insertBefore(container, wfList);
  }

  /* ── 인사이트 → 리스트 렌더링 ── */
  function renderViewerInsightList() {
    const INS_BOXES = [
      { tagsId: 'aix-tags',  directId: 'aix-direct',  label: 'AI X — 비효율' },
      { tagsId: 'aio-tags',  directId: 'aio-direct',  label: 'AI O — 효율'   },
      { tagsId: 'good-tags', directId: 'good-direct', label: 'Good Point'    },
      { tagsId: 'bad-tags',  directId: 'bad-direct',  label: 'Bad Point'     },
    ];

    INS_BOXES.forEach(({ tagsId, directId, label }) => {
      const tagsEl  = document.getElementById(tagsId);
      const directEl = document.getElementById(directId);
      if (!tagsEl) return;

      const insBox = tagsEl.closest('.ins-box');
      if (!insBox) return;

      // 선택된 항목 텍스트 수집
      const items = [];
      tagsEl.querySelectorAll('.ins-tag-box:not(.ins-direct-box) .ins-tag-box-item span:first-child').forEach(el => {
        const txt = el.textContent.trim();
        if (txt) items.push(txt);
      });

      // 직접 입력 텍스트
      const directText = (directEl?.value || '').trim();

      // 새 카드 생성
      const card = document.createElement('div');
      card.className = 'viewer-ins-card';

      const hd = document.createElement('div');
      hd.className = 'viewer-ins-head';
      hd.textContent = label;
      card.appendChild(hd);

      const body = document.createElement('div');
      body.className = 'viewer-ins-body';

      if (items.length === 0 && !directText) {
        const empty = document.createElement('div');
        empty.className = 'viewer-ins-item empty';
        empty.textContent = '사용자가 입력하지 않음';
        body.appendChild(empty);
      } else {
        items.forEach(txt => {
          const item = document.createElement('div');
          item.className = 'viewer-ins-item';
          item.textContent = txt;
          body.appendChild(item);
        });
        if (directText) {
          const item = document.createElement('div');
          item.className = 'viewer-ins-item direct';
          item.textContent = directText;
          body.appendChild(item);
        }
      }

      card.appendChild(body);

      // insBox 숨기고 card로 교체
      insBox.style.setProperty('display', 'none', 'important');
      insBox.parentNode.insertBefore(card, insBox);
    });
  }

  /* ── 품질 검증 QA → 리스트 렌더링 ── */
  function renderViewerQaList() {
    const qaList = document.getElementById('qa-list');
    if (!qaList) return;

    const QA_META = {
      accuracy:     { cat: '정확성',       q: 'AI 산출물의 내용이 사실에 부합하는가' },
      completeness: { cat: '완성도',       q: '요청한 결과물이 누락 없이 완성되었는가' },
      usability:    { cat: '활용 가능성', q: '실무에 바로 적용 가능한 수준인가' },
      format:       { cat: '형식 적합성', q: '요청한 형식·구조와 일치하는가' },
      bias:         { cat: '편향·오류 검토', q: '편향되거나 잘못된 내용은 없는가' },
      prompt:       { cat: '프롬프트 최적화', q: '더 나은 결과를 위한 개선 시도를 했는가' },
    };

    const container = document.createElement('div');
    container.className = 'viewer-qa-list';

    QA_KEYS.forEach(key => {
      const meta = QA_META[key];
      const rowEl = qaList.querySelector(`.qa-row[data-key="${key}"]`);
      if (!meta || !rowEl) return;

      const isY = rowEl.classList.contains('is-y');
      const isN = rowEl.classList.contains('is-n');
      const ynText = isY ? 'Y' : isN ? 'N' : '—';
      const ynClass = isY ? 'yn-y' : isN ? 'yn-n' : 'yn-none';

      const card = document.createElement('div');
      card.className = 'viewer-qa-card';

      // [카테고리명] 헤더
      const hd = document.createElement('div');
      hd.className = 'viewer-qa-head';
      hd.textContent = meta.cat;
      card.appendChild(hd);

      // 질문 항목
      const qItem = document.createElement('div');
      qItem.className = 'viewer-qa-item';
      const qText = document.createElement('span');
      qText.className = 'viewer-qa-q';
      qText.textContent = meta.q;
      const ynBadge = document.createElement('span');
      ynBadge.className = `viewer-qa-yn ${ynClass}`;
      ynBadge.textContent = ynText;
      qItem.appendChild(qText);
      qItem.appendChild(ynBadge);
      card.appendChild(qItem);

      // 스텝 항목
      const steps = qaStepsMap[key] || [];
      steps.forEach(({ idx, content }) => {
        const wfRow = wfRows[idx];
        if (!wfRow) return;
        const stepItem = document.createElement('div');
        stepItem.className = 'viewer-qa-item viewer-qa-step';
        const stepLabel = document.createElement('span');
        stepLabel.className = 'viewer-qa-step-label';
        stepLabel.textContent = `STEP.${idx + 1}${wfRow.tool ? ' — ' + wfRow.tool : ''}`;
        const stepContent = document.createElement('span');
        stepContent.className = 'viewer-qa-step-content' + (content ? '' : ' empty');
        stepContent.textContent = content || '—';
        stepItem.appendChild(stepLabel);
        stepItem.appendChild(stepContent);
        card.appendChild(stepItem);
      });

      container.appendChild(card);
    });

    qaList.style.setProperty('display', 'none', 'important');
    qaList.parentNode.insertBefore(container, qaList);
  }

  /* ── 활동일 / 작성자 / 이메일 → 텍스트 div 교체 ── */
  function renderViewerDateAuthor() {
    const row = document.querySelector('.date-author-row');
    if (!row) return;

    const dateEl  = document.getElementById('date-input');
    const nameEl  = document.getElementById('edited-name');
    const emailEl = document.getElementById('edited-email');

    // 날짜 포맷: "2026-04-23" → "2026. 04. 23."
    function fmtDate(val) {
      if (!val) return '';
      const [y, m, d] = val.split('-');
      return y && m && d ? `${y}. ${m}. ${d}.` : val;
    }

    const dateVal  = fmtDate(dateEl?.value || '');
    const nameVal  = nameEl?.options[nameEl.selectedIndex]?.text || '';
    const emailVal = (emailEl?.innerText || '').trim();

    // 기존 요소 강제 숨기기 (캘린더 아이콘 포함)
    [dateEl, nameEl, emailEl].forEach(el => {
      if (!el) return;
      el.style.setProperty('display', 'none', 'important');
      el.setAttribute('hidden', '');
    });

    // 데이터를 슬래시로 구분해 한 줄로 표시
    const wrap = document.createElement('div');
    wrap.className = 'viewer-date-author-wrap';

    [dateVal, nameVal, emailVal].forEach((value, i) => {
      if (i > 0) {
        const sep = document.createElement('span');
        sep.className = 'viewer-date-author-sep';
        sep.textContent = '/';
        wrap.appendChild(sep);
      }
      const val = document.createElement('span');
      val.className = 'viewer-date-author-value' + (value ? '' : ' empty');
      val.textContent = value || '—';
      wrap.appendChild(val);
    });

    row.appendChild(wrap);
  }

  /* ── 결과물 드라이브 섹션 → 구조형 리스트로 변환 ── */
  function renderViewerDriveList() {
    const DRIVE_KEYS = [
      { key: 'material', label: '소스' },
      { key: 'mid',      label: '중간 결과' },
      { key: 'final',    label: '최종 결과' },
      { key: 'prompt',   label: '프롬프트' },
    ];
    const EMPTY = '—';

    // 기존 테이블 숨기고 새 컨테이너 삽입
    const table = document.querySelector('.drive-table');
    if (!table) return;
    const field = table.closest('.field');
    if (!field) return;

    const container = document.createElement('div');
    container.className = 'viewer-drive-list';

    DRIVE_KEYS.forEach(({ key, label }) => {
      const url     = (document.getElementById('drive-' + key)?.value || '').trim();
      const title   = (document.getElementById('drive-' + key + '-name')?.value || '').trim();
      const process = (document.getElementById('drive-' + key + '-process')?.value || '').trim();

      const card = document.createElement('div');
      card.className = 'viewer-drive-card';

      // 헤더 — [소스] 형태
      const hd = document.createElement('div');
      hd.className = 'viewer-drive-card-head';
      hd.textContent = label;
      card.appendChild(hd);

      // 3개 행: 타이틀 / URL / 가공여부
      const rows = [
        { label: '타이틀',  value: title,   isLink: false },
        { label: 'URL',     value: url,     isLink: !!url },
        { label: '가공여부', value: process, isLink: false },
      ];
      rows.forEach(({ label: rl, value, isLink }) => {
        const row = document.createElement('div');
        row.className = 'viewer-drive-row';

        const lbl = document.createElement('span');
        lbl.className = 'viewer-drive-row-label';
        lbl.textContent = rl;

        const val = document.createElement('span');
        val.className = 'viewer-drive-row-value' + (value ? '' : ' empty');
        if (isLink && value) {
          const a = document.createElement('a');
          a.href = value; a.target = '_blank'; a.rel = 'noopener';
          a.textContent = value;
          val.appendChild(a);
        } else {
          val.textContent = value || EMPTY;
        }

        row.appendChild(lbl);
        row.appendChild(val);
        card.appendChild(row);
      });

      container.appendChild(card);
    });

    table.style.display = 'none';
    field.appendChild(container);
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
