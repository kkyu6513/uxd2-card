  /* ── AI WORK FLOW ── */
  let wfRows = [];
  const QA_KEYS = ['accuracy','completeness','usability','format','bias','prompt'];
  let qaStepsMap = {}; // { key: [{idx, content}] }
  QA_KEYS.forEach(k => { qaStepsMap[k] = []; });

  function getToolOptions(selected) {
    const opts = ['선택', ...toolList];
    return opts.map(t =>
      `<option value="${t === '선택' ? '' : t}" ${selected === t ? 'selected' : ''}>${t}</option>`
    ).join('');
  }

  function renderWorkflow() {
    const list = document.getElementById('wf-list');
    const drawBtn = document.getElementById('wf-draw-btn');
    const imgBtn = document.getElementById('wf-img-btn');
    const totalWrap = document.getElementById('wf-total');
    if (!list) return;
    list.innerHTML = '';

    if (wfRows.length === 0) {
      if (_isViewerMode) {
        list.innerHTML = `<div class="wf-empty" style="color:#e53935;font-weight:600;">사용자가 AI WORK FLOW를 작성하지 않았습니다.</div>`;
        if (drawBtn) drawBtn.style.display = 'none';
        if (imgBtn)  { imgBtn.style.display = 'none'; imgBtn.classList.add('wf-empty-viewer'); }
      } else {
        list.innerHTML = `<div class="wf-empty">선정 도구에서 사용한 AI 도구를 선택하면 자동으로 워크플로우가 생성됩니다.</div>`;
        if (drawBtn) drawBtn.style.display = 'none';
        if (imgBtn)  { imgBtn.style.display = 'none'; imgBtn.classList.remove('wf-empty-viewer'); }
      }
      if (totalWrap) totalWrap.style.display = 'none';
      syncToolsWithWf();
      syncQaStepSelect();
      return;
    }

    if (drawBtn) drawBtn.style.display = '';
    wfRows.forEach((row, i) => {
      const div = document.createElement('div');
      div.className = 'wf-row';

      // 버튼 라벨 생성 — 자식 요소 없이 순수 텍스트만 사용 (클릭 차단 방지)
      const hasData = row.intent || row.action || row.prompt;
      const btnLabel = hasData
        ? ((row.intent || '').substring(0, 30) + (row.intent && row.intent.length > 30 ? '…' : '') || (row.action || '').substring(0, 30))
        : (_isViewerMode ? '사용자가 입력하지 않음' : '클릭하여 입력');
      const btnExtraClass = (!hasData && _isViewerMode) ? ' wf-detail-empty-viewer' : '';
      const timePlaceholder = _isViewerMode && !row.time ? '미입력' : '분';
      const timeStyle = _isViewerMode && !row.time ? 'color:#e53935;font-size:11px;font-style:italic;' : '';

      // 텍스트 이스케이프
      const escLabel = String(btnLabel).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

      div.innerHTML = `
        <div class="wf-step">STEP.${i + 1}</div>
        <select class="wf-tool" data-idx="${i}">${getToolOptions(row.tool)}</select>
        <button type="button" class="wf-detail-btn${hasData ? ' has-data' : ''}${btnExtraClass}" data-idx="${i}">${escLabel}</button>
        <input class="wf-time${_isViewerMode && !row.time ? ' viewer-empty-time' : ''}" type="number" data-idx="${i}" placeholder="${timePlaceholder}" value="${row.time || ''}" min="0" max="999" style="${timeStyle}">
        <div class="wf-row-actions">
          <button type="button" class="wf-row-add" data-idx="${i}" title="하위에 스텝 추가">+</button>
          <button type="button" class="wf-row-del" data-idx="${i}" title="이 스텝 삭제">✕</button>
        </div>
      `;

      // 내용 입력 버튼 — click 핸들러 (편집 모드 주경로)
      const detailBtn = div.querySelector('.wf-detail-btn');
      if (detailBtn) {
        detailBtn.addEventListener('click', (ev) => {
          ev.preventDefault();
          ev.stopPropagation();
          openWfModal(+detailBtn.dataset.idx);
        });
      }
      // 뷰어 모드 — 행 전체를 커서 pointer로 표시 (실제 클릭 처리는 #wf-list 위임에서 담당)
      if (_isViewerMode) {
        div.style.cursor = 'pointer';
      }
      // 도구 변경 — syncToolsWithWf가 자동 동기화
      div.querySelector('.wf-tool').addEventListener('change', e => {
        wfRows[+e.target.dataset.idx].tool = e.target.value;
        renderWorkflow();
      });
      // 시간 변경
      div.querySelector('.wf-time').addEventListener('input', e => {
        wfRows[+e.target.dataset.idx].time = e.target.value;
        updateWfTotal();
      });
      // 추가 버튼 — 현재 행 하위에 새 행 삽입
      div.querySelector('.wf-row-add').addEventListener('click', e => {
        const idx = +e.currentTarget.dataset.idx;
        wfRows.splice(idx + 1, 0, { tool: '', intent: '', action: '', time: '', prompt: '' });
        renderWorkflow();
      });
      // 삭제 버튼 — syncToolsWithWf가 자동 동기화
      div.querySelector('.wf-row-del').addEventListener('click', e => {
        const idx = +e.currentTarget.dataset.idx;
        wfRows.splice(idx, 1);
        renderWorkflow();
      });
      list.appendChild(div);
    });
    updateWfTotal();
    syncToolsWithWf();
    syncQaStepSelect();
  }

  // WF 이벤트 위임 (renderWorkflow 재호출 후에도 유지)
  // 편집 모드: wf-detail-btn 클릭 → 모달
  // 뷰어 모드: wf-row 어디를 클릭해도 → 모달 (select/input의 pointer-events:none로 빈 영역 클릭 무반응 문제 해결)
  document.getElementById('wf-list')?.addEventListener('click', e => {
    // 1) wf-detail-btn 직접 클릭 — 편집/뷰어 공통 주경로
    const btn = e.target.closest('.wf-detail-btn');
    if (btn) {
      openWfModal(+btn.dataset.idx);
      return;
    }
    // 2) 뷰어 모드 전용 — 행 어디를 클릭해도 모달 열기
    if (_isViewerMode) {
      // 삭제/추가 버튼은 제외(뷰어에선 숨김이지만 안전망)
      if (e.target.closest('.wf-row-add, .wf-row-del')) return;
      const row = e.target.closest('.wf-row');
      if (!row) return;
      const list = document.getElementById('wf-list');
      const rows = Array.from(list.querySelectorAll('.wf-row'));
      const idx = rows.indexOf(row);
      if (idx >= 0 && wfRows[idx]) openWfModal(idx);
    }
  });

  /* ── WF 상세 입력 모달 ── */
  let _wfModalIdx = null;

  function openWfModal(idx) {
    _wfModalIdx = idx;
    const row = wfRows[idx];
    document.getElementById('wf-modal-title').textContent = `STEP.${idx + 1} ${_isViewerMode ? '상세 보기' : '상세 입력'}`;
    const intentEl = document.getElementById('wf-modal-intent');
    const actionEl = document.getElementById('wf-modal-action');
    const promptEl = document.getElementById('wf-modal-prompt');
    if (intentEl) { intentEl.value = row.intent || ''; intentEl.readOnly = _isViewerMode; }
    if (actionEl) { actionEl.value = row.action || ''; actionEl.readOnly = _isViewerMode; }
    if (promptEl) { promptEl.value = row.prompt || ''; promptEl.readOnly = _isViewerMode; }
    const cancelBtnEl  = document.getElementById('wf-modal-cancel-btn');
    const saveBtnEl2   = document.getElementById('wf-modal-save-btn');
    const confirmBtnEl = document.getElementById('wf-modal-confirm-btn');
    if (cancelBtnEl)  cancelBtnEl.style.display  = _isViewerMode ? 'none' : '';
    if (saveBtnEl2)   saveBtnEl2.style.display   = _isViewerMode ? 'none' : '';
    if (confirmBtnEl) confirmBtnEl.style.display  = _isViewerMode ? '' : 'none';
    // WF URL 링크 처리
    const promptVal = row.prompt || '';
    if (promptEl && _isViewerMode && promptVal) {
      const urlRegex = /https?:\/\/[^\s]+/g;
      const hasUrl = urlRegex.test(promptVal);
      if (hasUrl) {
        promptEl.style.color = '#3a78d4';
        promptEl.style.cursor = 'pointer';
        promptEl.addEventListener('click', () => {
          const urls = promptVal.match(/https?:\/\/[^\s]+/g);
          if (urls && urls[0]) window.open(urls[0], '_blank');
        }, { once: true });
      }
    }
    const overlay = document.getElementById('wf-modal-overlay');
    overlay.style.display = 'flex';
    // 팝업 포커싱 — 페이지 최상단으로 스크롤 + body 스크롤 잠금 + 첫 필드/확인 버튼 포커스
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.body.style.overflow = 'hidden';
    setTimeout(() => {
      if (_isViewerMode) {
        // 뷰어: 확인 버튼에 포커스
        document.getElementById('wf-modal-confirm-btn')?.focus();
      } else {
        // 편집: INTENT 필드에 포커스
        intentEl?.focus();
      }
    }, 80);
  }

  function closeWfModal() {
    document.getElementById('wf-modal-overlay').style.display = 'none';
    document.body.style.overflow = '';
    _wfModalIdx = null;
  }

  function saveWfModal() {
    if (_wfModalIdx === null) return;
    wfRows[_wfModalIdx].intent = document.getElementById('wf-modal-intent').value.trim();
    wfRows[_wfModalIdx].action = document.getElementById('wf-modal-action').value.trim();
    wfRows[_wfModalIdx].prompt = document.getElementById('wf-modal-prompt').value.trim();
    renderWorkflow();
    closeWfModal();
  }

  // 모달 배경 클릭으로 닫기
  document.getElementById('wf-modal-overlay')?.addEventListener('click', e => {
    if (e.target === document.getElementById('wf-modal-overlay')) closeWfModal();
  });
  // ESC 키로 닫기
  document.getElementById('wf-modal-overlay')?.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeWfModal();
  });

  function updateWfTotal() {
    const totalWrap = document.getElementById('wf-total');
    const totalVal  = document.getElementById('wf-total-value');
    if (!totalWrap || !totalVal) return;
    const sum = wfRows.reduce((acc, r) => acc + (parseInt(r.time) || 0), 0);
    if (sum > 0 || wfRows.length > 0) {
      totalWrap.style.display = '';
      totalVal.textContent = sum + '분';
    } else {
      totalWrap.style.display = 'none';
    }
  }

  document.getElementById('wf-add-btn')?.addEventListener('click', () => {
    wfRows.push({ tool: '', intent: '', action: '', time: '', prompt: '' });
    renderWorkflow();
  });

  /* ── FLOW DRAW ── */
  document.getElementById('wf-draw-btn')?.addEventListener('click', async () => {
    const filled = wfRows.filter(r => r.intent || r.action || r.tool);
    if (!filled.length) { showToast('스텝 내용을 먼저 입력해주세요'); return; }

    const modal    = document.getElementById('flow-modal');
    const genEl    = document.getElementById('flow-generating');
    const resultEl = document.getElementById('flow-result');
    const drawBtn  = document.getElementById('wf-draw-btn');

    modal.classList.add('open');
    genEl.style.display = '';
    resultEl.style.display = 'none';
    drawBtn.disabled = true;

    const stepsText = wfRows.map((r, i) =>
      `STEP.${i+1} | 도구: ${r.tool || '미선택'} | 의도: ${r.intent || '-'} | 활동: ${r.action || '-'}`
    ).join('\n');

    try {
      genEl.style.display = 'none';
      resultEl.style.display = '';
      const svgStr = generateFlowSVG(wfRows);
      resultEl.innerHTML = svgStr;
      document.getElementById('flow-modal-footer').style.display = '';
      // 저장된 SVG를 이미지 버튼에 연결
      const imgBtn = document.getElementById('wf-img-btn');
      if (imgBtn) {
        imgBtn._svgStr = svgStr;
        imgBtn.style.display = 'block';
      }
    } catch(e) {
      genEl.style.display = 'none';
      resultEl.style.display = '';
      resultEl.innerHTML = `<p style="color:#e53935;text-align:center;padding:20px">오류: ${e.message}</p>`;
    } finally {
      drawBtn.disabled = false;
    }
  });

  function generateFlowSVG(rows) {
    const n = rows.length;
    const W = 640;
    const pad = 20;

    // ── Summary Flow ──
    const ROW_MAX = 4; // 한 줄 최대 스텝 수
    const rows_sum = Math.ceil(n / ROW_MAX);
    const sumRowH = 80;
    const sumH = rows_sum * sumRowH + (rows_sum - 1) * 10 + 20;
    const sumY = 44;
    let sumItems = '';

    for (let i = 0; i < n; i++) {
      const rowIdx = Math.floor(i / ROW_MAX);
      const colIdx = i % ROW_MAX;
      const colCount = Math.min(ROW_MAX, n - rowIdx * ROW_MAX);
      const bW = Math.floor((W - pad * 2 - (colCount - 1) * 24) / colCount);
      const bH = 52;
      const rx = pad + colIdx * (bW + 24);
      const ry = sumY + rowIdx * (sumRowH + 10);
      const cx = rx + bW / 2;
      const cy = ry + bH / 2;
      const tool = rows[i].tool || `STEP ${i+1}`;

      sumItems += `
        <rect x="${rx}" y="${ry}" width="${bW}" height="${bH}" rx="10"
          fill="#eef1ff" stroke="#4f6ef7" stroke-width="1"/>
        <circle cx="${rx + 16}" cy="${cy}" r="11" fill="#4f6ef7"/>
        <text x="${rx + 16}" y="${cy + 4}" text-anchor="middle"
          font-size="10" font-weight="700" fill="#fff" font-family="sans-serif">${i+1}</text>
        <text x="${rx + 33}" y="${cy - 6}" font-size="9" fill="#888"
          font-family="sans-serif">STEP.${i+1}</text>
        <text x="${rx + 33}" y="${cy + 9}" font-size="12" font-weight="600"
          fill="#222" font-family="sans-serif">${tool.length > 10 ? tool.slice(0,10)+'…' : tool}</text>`;

      // 같은 줄 다음 스텝으로 화살표
      const isLastInRow = (colIdx === ROW_MAX - 1) || (i === n - 1);
      const isLastOverall = i === n - 1;
      if (!isLastOverall && !isLastInRow) {
        const ax = rx + bW + 2;
        const ay = ry + bH / 2;
        sumItems += `<line x1="${ax}" y1="${ay}" x2="${ax+20}" y2="${ay}"
          stroke="#4f6ef7" stroke-width="1.5" stroke-dasharray="3 2"/>
        <polygon points="${ax+20},${ay-4} ${ax+26},${ay} ${ax+20},${ay+4}" fill="#4f6ef7"/>`;
      }
      // 줄바꿈 L자 화살표 (마지막 열 → 다음 줄 첫 번째)
      if (!isLastOverall && isLastInRow) {
        const nextRowIdx = rowIdx + 1;
        const nextColCount = Math.min(ROW_MAX, n - nextRowIdx * ROW_MAX);
        const nextBW = Math.floor((W - pad * 2 - (nextColCount - 1) * 24) / nextColCount);
        const fromX = rx + bW;
        const fromY = ry + bH / 2;
        const toX = pad;
        const toY = ry + sumRowH + 10 + bH / 2;
        const midY = ry + Math.round((bH + sumRowH + 10) / 2);
        sumItems += `<path d="M${fromX} ${fromY} L${fromX + 12} ${fromY} L${fromX + 12} ${midY} L${toX - 12} ${midY} L${toX - 12} ${toY} L${toX} ${toY}"
          fill="none" stroke="#4f6ef7" stroke-width="1.5" stroke-dasharray="3 2"/>
        <polygon points="${toX},${toY-4} ${toX+6},${toY} ${toX},${toY+4}" fill="#4f6ef7"/>`;
      }
    }

    // ── Detail Flow ──
    const detailStartY = sumY + sumH + 40;
    const cardH = 90;
    const gap = 36;
    let detailItems = '';
    let totalDetailH = 0;
    for (let i = 0; i < n; i++) {
      const y = detailStartY + i * (cardH + gap);
      const r = rows[i];
      const tool = r.tool || '미선택';
      const intent = r.intent || '-';
      const action = r.action || '-';
      const truncate = (s, max) => s.length > max ? s.slice(0, max) + '…' : s;

      detailItems += `
        <rect x="${pad}" y="${y}" width="${W}" height="${cardH}" rx="12"
          fill="#fff" stroke="#e8eaed" stroke-width="1"/>
        <circle cx="${pad + 28}" cy="${y + cardH/2}" r="18" fill="#4f6ef7"/>
        <text x="${pad + 28}" y="${y + cardH/2 - 5}" text-anchor="middle"
          font-size="8" fill="#c7d0ff" font-family="sans-serif" font-weight="600">STEP</text>
        <text x="${pad + 28}" y="${y + cardH/2 + 9}" text-anchor="middle"
          font-size="13" font-weight="700" fill="#fff" font-family="sans-serif">${i+1}</text>
        <text x="${pad + 60}" y="${y + cardH/2 - 8}" font-size="9" fill="#aaa"
          font-family="sans-serif">TOOL</text>
        <text x="${pad + 60}" y="${y + cardH/2 + 10}" font-size="14" font-weight="700"
          fill="#222" font-family="sans-serif">${truncate(tool, 12)}</text>
        <line x1="${pad + 155}" y1="${y + 16}" x2="${pad + 155}" y2="${y + cardH - 16}"
          stroke="#f0f0f0" stroke-width="1"/>
        <text x="${pad + 170}" y="${y + cardH/2 - 8}" font-size="9" fill="#aaa"
          font-family="sans-serif">의도 INTENT</text>
        <text x="${pad + 170}" y="${y + cardH/2 + 10}" font-size="12" fill="#333"
          font-family="sans-serif">${truncate(intent, 22)}</text>
        <line x1="${pad + 390}" y1="${y + 16}" x2="${pad + 390}" y2="${y + cardH - 16}"
          stroke="#f0f0f0" stroke-width="1"/>
        <text x="${pad + 405}" y="${y + cardH/2 - 8}" font-size="9" fill="#aaa"
          font-family="sans-serif">활동</text>
        <text x="${pad + 405}" y="${y + cardH/2 + 10}" font-size="12" fill="#333"
          font-family="sans-serif">${truncate(action, 20)}</text>`;

      if (i < n - 1) {
        const ax = pad + W / 2;
        const ay = y + cardH + 4;
        detailItems += `<line x1="${ax}" y1="${ay}" x2="${ax}" y2="${ay + gap - 8}"
          stroke="#4f6ef7" stroke-width="1.5" stroke-dasharray="3 2"/>
        <polygon points="${ax-5},${ay+gap-10} ${ax},${ay+gap-4} ${ax+5},${ay+gap-10}"
          fill="#4f6ef7"/>`;
      }
      totalDetailH = y + cardH - detailStartY;
    }

    const totalH = detailStartY + totalDetailH + 40;

    return `<svg width="100%" viewBox="0 0 680 ${totalH}" xmlns="http://www.w3.org/2000/svg">
      <rect width="680" height="${totalH}" fill="#f8f9fa" rx="12"/>
      <text x="${pad}" y="26" font-size="10" font-weight="600" fill="#aaa"
        font-family="sans-serif" letter-spacing="1">SUMMARY FLOW</text>
      ${sumItems}
      <line x1="${pad}" y1="${detailStartY - 20}" x2="${W + pad}" y2="${detailStartY - 20}"
        stroke="#ececec" stroke-width="1"/>
      <text x="${pad}" y="${detailStartY - 6}" font-size="10" font-weight="600" fill="#aaa"
        font-family="sans-serif" letter-spacing="1">DETAIL FLOW</text>
      ${detailItems}
    </svg>`;
  }

  document.getElementById('flow-modal-close')?.addEventListener('click', () => {
    document.getElementById('flow-modal').classList.remove('open');
  });
  document.getElementById('flow-modal')?.addEventListener('click', e => {
    if (e.target === document.getElementById('flow-modal'))
      document.getElementById('flow-modal').classList.remove('open');
  });

  document.getElementById('flow-img-save-btn')?.addEventListener('click', () => {
    const btn = document.getElementById('flow-img-save-btn');
    const svgEl = document.querySelector('#flow-result svg');
    if (!svgEl) return;
    try {
      const svgData = new XMLSerializer().serializeToString(svgEl);
      const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'workflow_infographic.svg';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      showToast('SVG 이미지 저장 완료 ✓');
    } catch(e) {
      showToast('저장 실패: ' + e.message);
    }
  });

  document.getElementById('flow-save-btn')?.addEventListener('click', () => {
    document.getElementById('flow-modal').classList.remove('open');
  });

  document.getElementById('wf-img-btn')?.addEventListener('click', () => {
    const btn = document.getElementById('wf-img-btn');
    const svgStr = btn._svgStr || (wfRows.length ? generateFlowSVG(wfRows) : null);
    if (!svgStr) return;
    const genEl    = document.getElementById('flow-generating');
    const resultEl = document.getElementById('flow-result');
    const footerEl = document.getElementById('flow-modal-footer');
    // 로딩 상태 강제 숨김, 결과 표시
    if (genEl)    { genEl.style.display = 'none'; }
    if (resultEl) { resultEl.style.display = 'block'; resultEl.innerHTML = svgStr; }
    if (footerEl) { footerEl.style.display = ''; }
    document.getElementById('flow-modal').classList.add('open');
  });
