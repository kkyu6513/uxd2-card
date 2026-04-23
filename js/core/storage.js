  /* ── TOAST ── */
  const toast = document.getElementById('toast');
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2200);
  }

  /* ── SAVE (localStorage) ── */
  const SAVE_KEY = 'ai_activity_card_v3';
  // 구버전 데이터 자동 삭제
  localStorage.removeItem('ai_activity_card_v2');
  localStorage.removeItem('ai_activity_card_v1');

  function collectData() {
    const data = {};
    document.querySelectorAll('input[type="text"], input[type="date"], input[type="url"], textarea').forEach((el, i) => {
      data[`field_${i}`] = el.value;
    });
    data.stage = document.getElementById('stage-select').value;
    data.flow  = Array.from(document.querySelectorAll('.flow-input')).map(i => i.value);
    data.images = images;
    data.toolList   = toolList;
    data.toolActive = Array.from(toolActive);
    return data;
  }

  function applyData(data) {
    if (!data) return;
    const fields = document.querySelectorAll('input[type="text"], input[type="date"], input[type="url"], textarea');
    fields.forEach((el, i) => { if (data[`field_${i}`] !== undefined) el.value = data[`field_${i}`]; });
    if (data.stage) document.getElementById('stage-select').value = data.stage;
    if (data.flow) document.querySelectorAll('.flow-input').forEach((inp, i) => { if (data.flow[i] !== undefined) inp.value = data.flow[i]; });
    if (data.images) { images = data.images; syncImageUI(); }
    if (data.toolList)   { toolList = data.toolList; }
    if (data.toolActive) { toolActive = new Set(data.toolActive); }
    renderTools();
    document.querySelectorAll('textarea').forEach(ta => { ta.style.height = 'auto'; ta.style.height = ta.scrollHeight + 'px'; });
  }


  /* ── NOTION 연동 ── */
  const NOTION_TOKEN = 'ntn_W4308959883bfgYxnTLxNgYfWTTGc1WAsOI4ZWIHrV95cs';
  const NOTION_DB_ID = '344100d5828b8003a234e330e3bf128a';
  const NOTION_PROXY = 'https://notion-proxy-three.vercel.app';

  function getFormValues() {
    const name    = document.getElementById('edited-name')?.value?.trim() || '';
    const email   = document.getElementById('edited-email').value.trim();
    const tool    = document.getElementById('edited-tool').value.trim();
    const stage   = document.getElementById('stage-select').value;
    const task    = document.getElementById('task-input') ?
                    document.getElementById('task-input').value.trim() : '';
    const date    = document.querySelector('input[type="date"]').value;
    const goal    = document.querySelectorAll('input[type="text"]')[0]?.value.trim() || '';

    const flowInputs = document.querySelectorAll('.flow-input');
    const flow = {
      input:    flowInputs[0]?.value.trim() || '',
      prompt:   flowInputs[1]?.value.trim() || '',
      ai:       flowInputs[2]?.value.trim() || '',
      review:   flowInputs[3]?.value.trim() || '',
      output:   flowInputs[4]?.value.trim() || '',
    };

    const drives = {
      material:   document.getElementById('drive-material')?.value.trim() || '',
      mid:        document.getElementById('drive-mid')?.value.trim() || '',
      final:      document.getElementById('drive-final')?.value.trim() || '',
      promptLink: document.getElementById('drive-prompt')?.value.trim() || '',
      materialName: document.getElementById('drive-material-name')?.value.trim() || '',
      midName:      document.getElementById('drive-mid-name')?.value.trim() || '',
      finalName:    document.getElementById('drive-final-name')?.value.trim() || '',
      promptName:   document.getElementById('drive-prompt-name')?.value.trim() || '',
    };

    const taPrompt  = document.getElementById('ta-prompt')?.value.trim() || '';
    const taQuality = document.getElementById('ta-quality')?.value.trim() || '';

    const aixDirect = document.getElementById('aix-direct')?.value.trim() || '';
    const aioDirect = document.getElementById('aio-direct')?.value.trim() || '';
    const aixChipTexts = Array.from(aixSelected).map(i => AIX_ITEMS[i]).join(', ');
    const aioChipTexts = Array.from(aioSelected).map(i => AIO_ITEMS[i]).join(', ');
    const effBad  = [aixChipTexts, aixDirect].filter(Boolean).join(' / ');
    const effGood = [aioChipTexts, aioDirect].filter(Boolean).join(' / ');

    const goodPt   = document.getElementById('good-direct')?.value.trim() || '';
    const badPt    = document.getElementById('bad-direct')?.value.trim() || '';
    const goodChipTexts = Array.from(goodSelected).map(i => GOOD_ITEMS[i]).join(', ');
    const badChipTexts  = Array.from(badSelected).map(i => BAD_ITEMS[i]).join(', ');

    const refLink  = document.querySelectorAll('input[type="text"]');
    // 도움링크, 한마디는 인사이트 섹션 text input
    const insInputs = document.querySelectorAll('.sec:last-of-type input[type="text"]');
    const refUrl   = insInputs[0]?.value.trim() || '';
    const oneliner = insInputs[1]?.value.trim() || '';

    const activeTools = Array.from(toolActive).join(', ');

    return { name, email, tool, stage, task, date, goal, flow, drives,
             taPrompt, taQuality, effBad, effGood,
             goodPt: [goodChipTexts, goodPt].filter(Boolean).join(' / '),
             badPt: [badChipTexts, badPt].filter(Boolean).join(' / '),
             refUrl, oneliner, activeTools };
  }

  function buildNotionPayload(v) {
    // 값이 있을 때만 속성 포함 (이름 제외 전부 비필수)
    const props = {
      '이름': { title: [{ text: { content: v.name || '(미입력)' } }] }
    };
    const addText = (key, val) => { if (val) props[key] = { rich_text: [{ text: { content: val } }] }; };
    const addUrl  = (key, val) => { if (val) props[key] = { url: val }; };
    const addDate = (key, val) => { if (val) props[key] = { date: { start: val } }; };
    const addSel  = (key, val) => { if (val) props[key] = { select: { name: val } }; };

    addDate('활동일',          v.date);
    addSel ('단계',            v.stage);
    addText('소재명',          v.task);
    addText('이메일',          v.email);
    addText('주력도구',        v.tool);
    addText('메타포목표',      v.goal);
    addText('선정도구',        v.activeTools);
    addText('Flow_입력',       v.flow.input);
    addText('Flow_프롬프트',   v.flow.prompt);
    addText('Flow_AI처리',     v.flow.ai);
    addText('Flow_검토수정',   v.flow.review);
    addText('Flow_산출물',     v.flow.output);
    addText('최종프롬프트',    v.taPrompt);
    addText('품질검증',        v.taQuality);
    addText('효율_X',          v.effBad);
    addText('효율_O',          v.effGood);
    addText('Good_Point',      v.goodPt);
    addText('Bad_Point',       v.badPt);
    addText('참고링크',        v.refUrl);
    addText('한마디',          v.oneliner);
    addUrl ('드라이브_소재',       v.drives.material);
    addUrl ('드라이브_중간결과',   v.drives.mid);
    addUrl ('드라이브_최종결과',   v.drives.final);
    addUrl ('드라이브_프롬프트',   v.drives.promptLink);

    return { parent: { database_id: NOTION_DB_ID }, properties: props };
  }

  
  /* ── NOTION DB 자동 초기화 ── */
  const NOTION_DB_SCHEMA = {
    '활동일':           { date: {} },
    '단계':             { select: { options: [
                            { name: '관리단계',      color: 'gray' },
                            { name: '분석단계',      color: 'blue' },
                            { name: '설계단계',      color: 'green' },
                            { name: '테스트단계',    color: 'yellow' },
                            { name: '배포및완료단계', color: 'red' },
                          ]}},
    '소재명':           { rich_text: {} },
    '이메일':           { email: {} },
    '주력도구':         { rich_text: {} },
    '메타포목표':       { rich_text: {} },
    '선정도구':         { rich_text: {} },
    'Flow_입력':        { rich_text: {} },
    'Flow_프롬프트':    { rich_text: {} },
    'Flow_AI처리':      { rich_text: {} },
    'Flow_검토수정':    { rich_text: {} },
    'Flow_산출물':      { rich_text: {} },
    '최종프롬프트':     { rich_text: {} },
    '품질검증':         { rich_text: {} },
    '효율_X':           { rich_text: {} },
    '효율_O':           { rich_text: {} },
    'Good_Point':       { rich_text: {} },
    'Bad_Point':        { rich_text: {} },
    '참고링크':         { rich_text: {} },
    '한마디':           { rich_text: {} },
    '드라이브_소재':        { url: {} },
    '드라이브_중간결과':    { url: {} },
    '드라이브_최종결과':    { url: {} },
    '드라이브_프롬프트':    { url: {} },
  };

  async function initNotionDB() {
    showToast('Notion DB 컬럼 생성 중...');
    try {
      const res = await fetch(`https://notion-proxy-rosy.vercel.app/api/proxy?path=v1/databases/${NOTION_DB_ID}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${NOTION_TOKEN}`,
          'Content-Type': 'application/json',
          'Notion-Version': '2022-06-28',
        },
        body: JSON.stringify({ properties: NOTION_DB_SCHEMA })
      });
      const data = await res.json();
      if (res.ok) {
        showToast('DB 컬럼 생성 완료 ✓');
      } else {
        showToast('오류: ' + (data.message || res.status));
        console.error(data);
      }
    } catch(e) {
      showToast('연결 오류: ' + e.message);
    }
  }

  async function saveToNotion() {
    const v = getFormValues();
    if (!v.name) { showToast('이름을 입력해주세요'); return; }

    showToast('Notion에 저장 중...');

    const payload = buildNotionPayload(v);

    try {
      const res = await fetch('https://notion-proxy-rosy.vercel.app/api/proxy?path=v1/pages', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${NOTION_TOKEN}`,
          'Content-Type': 'application/json',
          'Notion-Version': '2022-06-28',
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        showToast('Notion 저장 완료 ✓');
        console.log('Notion 저장:', data.url);
      } else {
        const err = await res.json();
        console.error('Notion 오류:', err);
        showToast('Notion 저장 실패: ' + (err.message || res.status));
      }
    } catch(e) {
      console.error(e);
      showToast('Notion 연결 오류');
    }
  }

  document.getElementById('save-btn').addEventListener('click', async () => {
    // 로컬 저장
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(collectData())); } catch(e) {}
    // Notion 저장
    await saveToNotion();
    // 링크 자동 생성 (모달 없이, 배너 업데이트)
    shareLink({ showModal: false });
  });

  /* ── CLEAR ── */
  document.getElementById('clear-btn').addEventListener('click', () => {
    if (!confirm('작성된 내용을 모두 초기화할까요?')) return;
    document.querySelectorAll('input[type="text"], input[type="date"], input[type="url"], textarea').forEach(el => el.value = '');
    document.getElementById('stage-select').value = '';
    document.querySelectorAll('.flow-input').forEach(i => i.value = '');
    // contenteditable 필드 초기화
    ['edited-email','edited-tool','goal-input'].forEach(id => {
      const el = document.getElementById(id); if (el) el.innerText = '';
    });
    // 드라이브 링크 초기화
    ['material','mid','final','prompt'].forEach(k => {
      ['drive-'+k, 'drive-'+k+'-name', 'drive-'+k+'-process'].forEach(id => {
        const el = document.getElementById(id); if (el) el.value = '';
      });
      updateDriveRow(k);
    });
    const goalDirect = document.getElementById('goal-direct'); if (goalDirect) goalDirect.value = '';
    const goalTxt = document.getElementById('goal-input-text'); if (goalTxt) { goalTxt.removeAttribute('readonly'); goalTxt.value = ''; }
    const problemDirect = document.getElementById('problem-direct'); if (problemDirect) problemDirect.value = '';
    const prob = document.getElementById('problem-input'); if (prob) { prob.removeAttribute('readonly'); prob.value = ''; }
    const nameSelEl = document.getElementById('edited-name'); if (nameSelEl) nameSelEl.value = '';
    const dateEl = document.getElementById('date-input');
    if (dateEl) {
      const today = new Date();
      const y = today.getFullYear();
      const m = String(today.getMonth() + 1).padStart(2, '0');
      const d = String(today.getDate()).padStart(2, '0');
      dateEl.value = `${y}-${m}-${d}`;
    }
    // 이모지 초기화
    const emojiBtn = document.getElementById('emoji-btn'); if (emojiBtn) { emojiBtn.textContent = '선택'; emojiBtn.classList.add('placeholder'); }
    images = []; syncImageUI();
    toolList = [...DEFAULT_TOOLS]; toolActive = new Set(); toolMemos = {};
    wfRows = [];
    goodSelected = new Set(); badSelected = new Set();
    aixSelected = new Set(); aioSelected = new Set();
    if (_goodDD) { _goodDD.renderTags(); }
    if (_badDD)  { _badDD.renderTags(); }
    if (_aixDD)  { _aixDD.renderTags(); }
    if (_aioDD)  { _aioDD.renderTags(); }
    document.getElementById('good-direct-box').style.display = 'none';
    document.getElementById('bad-direct-box').style.display = 'none';
    document.getElementById('aix-direct-box').style.display = 'none';
    document.getElementById('aio-direct-box').style.display = 'none';
    renderTools(); renderWorkflow();
    localStorage.removeItem(SAVE_KEY);
    sessionStorage.removeItem(AUTO_SAVE_KEY);
    showToast('초기화되었습니다');
    setTimeout(() => location.reload(), 800);
  });

