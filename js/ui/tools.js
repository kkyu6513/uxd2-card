  /* ── TOOL SYSTEM ── */
  const DEFAULT_TOOLS = ['Perplexity','Claude','Gemini','Figma','Make','Stitch','Claude Cowork','Claude Code','VS Code'];
  let toolList = [...DEFAULT_TOOLS];
  window._getToolList = () => toolList;
  window._addToToolList = (t) => { if (!toolList.includes(t)) toolList.push(t); };
  let toolActive = new Set();
  let _isViewerMode = false;

  // Supabase 연결 정보 (팀 배포 파일 생성 시 자동 삽입)
  const _SB_URL = 'https://lcfuclnopswjogidbsix.supabase.co';
  const _SB_KEY = 'sb_publishable_UhPSyhqgUNMM6G-IHL2x2g_eoMMULsk';

  const badgeGrid    = document.getElementById('tool-badge-grid');
  const addInput     = document.getElementById('add-tool-input');
  const addBtn       = document.getElementById('add-tool-btn');

  function renderTools() {
    badgeGrid.innerHTML = '';
    toolList.forEach(name => {
      const badge = document.createElement('span');
      const count = wfRows.filter(r => r.tool === name).length;
      badge.className = 'tool-badge' + (toolActive.has(name) ? ' active' : '');

      const label = document.createTextNode(name);

      // 사용 횟수 표시 (1 이상일 때)
      const countEl = document.createElement('span');
      countEl.className = 'badge-count';
      countEl.textContent = count;
      if (count === 0) countEl.style.display = 'none';

      const del = document.createElement('span');
      del.className = 'badge-del';
      del.textContent = '✕';
      del.title = '도구 삭제';

      del.addEventListener('click', e => {
        e.stopPropagation();
        toolList = toolList.filter(t => t !== name);
        wfRows = wfRows.filter(r => r.tool !== name);
        renderWorkflow();
      });

      badge.addEventListener('click', () => {
        if (toolActive.has(name)) {
          // 비활성화 → 해당 도구 wfRow 전부 제거
          wfRows = wfRows.filter(r => r.tool !== name);
        } else {
          // 활성화 → wfRow 자동 추가
          wfRows.push({ tool: name, intent: '', action: '', time: '', prompt: '' });
        }
        renderWorkflow();
      });

      badge.append(label, countEl, del);
      badgeGrid.appendChild(badge);
    });
    // + 추가 버튼 항상 마지막에
    badgeGrid.appendChild(addBtn);
  }

  /* ── 선정도구 ↔ WF 강제 동기화 ── */
  function syncToolsWithWf() {
    // toolActive = wfRows에 존재하는 도구 집합으로 강제 동기화
    const wfToolSet = new Set(wfRows.map(r => r.tool).filter(Boolean));
    toolActive = wfToolSet;
    renderTools();
  }


  function addTool() {
    const val = addInput.value.trim();
    if (!val) return;
    if (!toolList.includes(val)) toolList.push(val);
    addInput.value = '';
    document.getElementById('add-tool-popup').classList.add('hidden');
    renderTools();
    renderWorkflow();
  }

  addBtn.addEventListener('click', () => {
    const popup = document.getElementById('add-tool-popup');
    popup.classList.remove('hidden');
    addInput.focus();
  });

  document.getElementById('add-tool-save').addEventListener('click', addTool);
  document.getElementById('add-tool-cancel').addEventListener('click', () => {
    addInput.value = '';
    document.getElementById('add-tool-popup').classList.add('hidden');
  });
  addInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') addTool();
    if (e.key === 'Escape') {
      addInput.value = '';
      document.getElementById('add-tool-popup').classList.add('hidden');
    }
  });

