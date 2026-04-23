  /* ── LINK MODAL ── */
  function showLinkModal(url) {
    if (_isViewerMode) return;
    const urlEl = document.getElementById('link-modal-url');
    if (urlEl) urlEl.textContent = url;
    document.getElementById('link-modal').classList.add('open');
  }

  document.getElementById('link-modal-close').addEventListener('click', () => {
    document.getElementById('link-modal').classList.remove('open');
  });
  document.getElementById('link-modal').addEventListener('click', e => {
    if (e.target === document.getElementById('link-modal'))
      document.getElementById('link-modal').classList.remove('open');
  });
  document.getElementById('link-copy-btn').addEventListener('click', async () => {
    const url = document.getElementById('link-modal-url').textContent;
    try {
      await navigator.clipboard.writeText(url);
      showToast('링크 복사 완료 ✓ 구글챗에 붙여넣기 하세요!');
    } catch {
      showToast('복사 실패 — 링크를 직접 선택해 복사해주세요');
    }
  });
  /* ── SHARE LINK CORE ── */

  // ── 스냅 수집 (ID·클래스 기반, 인덱스 무관) ──
  function collectSnapData() {
    const snap = {
      stage:      document.getElementById('stage-select')?.value || '',
      task:       document.getElementById('task-input')?.value || '',
      date:       document.getElementById('date-input')?.value || '',
      goalDirect: document.getElementById('goal-direct')?.value || '',
      goal:       document.getElementById('goal-input-text')?.value || '',
      problem:    document.getElementById('problem-input')?.value || '',
      problemDirect: document.getElementById('problem-direct')?.value || '',
      goalEmoji:  document.getElementById('emoji-btn')?.classList.contains('placeholder') ? '' : (document.getElementById('emoji-btn')?.textContent || ''),
      editName:   document.getElementById('edited-name')?.value || '',
      editEmail:  document.getElementById('edited-email')?.innerText.trim() || '',
      editTool:   document.getElementById('edited-tool')?.innerText.trim() || '',
      driveUrls: [
        document.getElementById('drive-material')?.value || '',
        document.getElementById('drive-mid')?.value || '',
        document.getElementById('drive-final')?.value || '',
        document.getElementById('drive-prompt')?.value || '',
      ],
      driveNames: [
        document.getElementById('drive-material-name')?.value || '',
        document.getElementById('drive-mid-name')?.value || '',
        document.getElementById('drive-final-name')?.value || '',
        document.getElementById('drive-prompt-name')?.value || '',
      ],
      driveProcesses: [
        document.getElementById('drive-material-process')?.value || '',
        document.getElementById('drive-mid-process')?.value || '',
        document.getElementById('drive-final-process')?.value || '',
        document.getElementById('drive-prompt-process')?.value || '',
      ],
      // 도구 / WF
      toolList:   toolList,
      toolActive: Array.from(toolActive),
      wfRows:     wfRows,
      // 이미지
      images: images,
      // QA
      qaData: (() => {
        const d = {};
        QA_KEYS.forEach(k => {
          const row = document.querySelector(`.qa-row[data-key="${k}"]`);
          const yActive = row?.querySelector('.qa-y')?.classList.contains('active');
          const nActive = row?.querySelector('.qa-n')?.classList.contains('active');
          d[k] = { val: yActive ? 'y' : nActive ? 'n' : '', steps: qaStepsMap[k] || [] };
        });
        return d;
      })(),
      qaRecommend: document.getElementById('qa-recommend')?.value || '',
      // 인사이트
      effBad:  document.getElementById('aix-direct')?.value || '',
      effGood: document.getElementById('aio-direct')?.value || '',
      aixChips: Array.from(aixSelected),
      aioChips: Array.from(aioSelected),
      qaRecommendFill: document.getElementById('qa-recommend')?.value || '',
      refInput:    document.getElementById('ref-input')?.value || '',
      discoveryInput: document.getElementById('discovery-input')?.value || '',
      goodPt:  document.getElementById('good-direct')?.value || '',
      badPt:   document.getElementById('bad-direct')?.value || '',
      goodChips: Array.from(goodSelected),
      badChips:  Array.from(badSelected),
    };
    return snap;
  }


  /* ── Supabase upload / fetch ── */
  async function sbUpload(snap) {
    const url = localStorage.getItem('sb_url') || _SB_URL;
    const key = localStorage.getItem('sb_key') || _SB_KEY;
    if (!url || !key) throw new Error('Supabase 설정이 필요합니다');
    const id = 'card_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
    const res = await fetch(`${url}/rest/v1/cards`, {
      method: 'POST',
      headers: {
        'apikey': key, 'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json', 'Prefer': 'return=minimal'
      },
      body: JSON.stringify({ id, data: JSON.stringify(snap) })
    });
    if (!res.ok) { const e = await res.text(); throw new Error(e || res.status); }
    return id;
  }

  async function sbFetch(id) {
    const url = localStorage.getItem('sb_url') || _SB_URL;
    const key = localStorage.getItem('sb_key') || _SB_KEY;
    if (!url || !key) throw new Error('Supabase 설정이 필요합니다');
    const res = await fetch(`${url}/rest/v1/cards?id=eq.${id}&select=data`, {
      headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
    });
    if (!res.ok) throw new Error('카드를 불러오지 못했습니다');
    const rows = await res.json();
    if (!rows.length) throw new Error('카드를 찾을 수 없습니다');
    return JSON.parse(rows[0].data);
  }

