  /* ══════════════════════════════════════
     ✨ AI 자동 채우기
  ══════════════════════════════════════ */
  (function() {
    const overlay   = document.getElementById('ai-fill-overlay');
    const closeBtn  = document.getElementById('ai-fill-close');
    const cancelBtn = document.getElementById('ai-fill-cancel');
    const runBtn    = document.getElementById('ai-fill-run');
    const ta        = document.getElementById('ai-fill-ta');
    const progress  = document.getElementById('ai-fill-progress');
    const progressTxt = document.getElementById('ai-fill-progress-txt');
    const result    = document.getElementById('ai-fill-result');
    const openBtn   = document.getElementById('ai-fill-btn');

    function openModal() {
      // body 스크롤 잠금
      document.body.style.overflow = 'hidden';
      overlay.classList.add('open');
      overlay.scrollTop = 0;
      // PC: 화면 최상단으로 스크롤
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    function closeModal() { overlay.classList.remove('open'); result.classList.remove('show','error'); result.textContent = ''; document.body.style.overflow = ''; }

    if (openBtn)   openBtn.addEventListener('click', openModal);

    // 모바일 키보드 올라올 때 팝업 상단 유지
    if (ta) {
      ta.addEventListener('focus', () => {
        setTimeout(() => { overlay.scrollTop = 0; }, 80);
      });
    }
    if (closeBtn)  closeBtn.addEventListener('click', closeModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
    overlay?.addEventListener('click', e => { if (e.target === overlay) closeModal(); });

    runBtn?.addEventListener('click', async () => {
      const text = ta.value.trim();
      if (!text) { showToast('내용을 입력해주세요'); return; }

      runBtn.disabled = true;
      result.classList.remove('show', 'error');
      progress.classList.add('show');
      progressTxt.textContent = 'AI가 내용을 분석하고 있어요...';

      try {
        const stages   = ['관리단계','분석단계','설계단계','테스트단계','배포및완료단계'];
        const _tl = window._getToolList ? window._getToolList() : ['Perplexity','Claude','Gemini','Figma','Make','Stitch','Claude Cowork','Claude Code','VS Code'];
        const tools = _tl.join(', ');
        // 프롬프트 토큰 한도(llama-3.1-8b-instant 요청당 6000 토큰) 대응 — 샘플을 더 축소
        const goalSamples    = (window._GOAL_OPTIONS||[]).filter(o=>o.label).slice(0,3).map(o=>o.label).join('\n');
        const problemSamples = (window._PROBLEM_OPTIONS||[]).filter(o=>o.label).slice(0,3).map(o=>o.label).join('\n');
        const goodSamples    = (window._GOOD_ITEMS||[]).slice(0,3).join('\n');
        const badSamples     = (window._BAD_ITEMS||[]).slice(0,3).join('\n');
        const aixSamples     = (window._AIX_ITEMS||[]).slice(0,2).join('\n');
        const aioSamples     = (window._AIO_ITEMS||[]).slice(0,2).join('\n');

        const today = new Date().toISOString().slice(0,10);
        const emailEl = document.getElementById('edited-email');
        const nameEl  = document.getElementById('edited-name');
        const userEmailHint = (emailEl && emailEl.innerText && emailEl.innerText.trim())
          ? emailEl.innerText.trim()
          : ((typeof window !== 'undefined' && window._USER_EMAIL) ? window._USER_EMAIL : 'kkyu6513@gmail.com');
        const userNameHint  = (nameEl && nameEl.value && nameEl.value.trim()) ? nameEl.value.trim() : '카즈시너';
        const prompt = `활동을 아래 JSON으로만 반환. 설명·코드블록 금지. "" 또는 [] 금지(모든 필드 채움).

규칙:
- stage: 관리/분석/설계/테스트/배포및완료단계 중 하나
- tools: 활동에 실제 등장한 도구만. 후보[${tools}]는 표기 정규화용(추측 금지). 카드 시스템 용어(Gemini proxy 등)는 도구 아님
- wfRows (매우 중요):
  ★ 활동 텍스트에 "[도구명]" 블록(예: "[Claude]\\n- INTENT: …\\n- 활동: …\\n- Good 프롬프트: …\\n- 소요시간(분): …")이 있으면 **해당 블록 원문 그대로 추출**해서 각 행으로 만들 것. 변조·요약·재생성 금지. 블록 개수만큼 그대로 행 생성.
  ★ 구조화 블록이 없을 때만 유추해 3행 이상(조사→설계→구현→검증) 생성.
  ★ 실제 사용자 작업만, 시스템 동작 기술 금지.
- goal vs problem (매우 중요 — 절대 같은 값 금지):
  ★ goal = 이번 활동으로 **달성하려는 것(To-Be)**. 성취 목적 한 줄.
  ★ problem = 활동 시작 **전에 겪고 있던 어려움·비효율(As-Is)**. 왜 이 활동이 필요했는가.
  ★ goal과 problem은 **의미상 반대되는 쌍**이므로 서로 다른 문장이어야 함. 둘이 동일하거나 task 값과 동일하면 오답.
  ★ 활동 텍스트에 "목표:" 또는 "문제정의:" 줄이 명시되어 있으면 각 줄의 **원문 그대로 추출**. "직접:" 접두어가 있으면 그 접두어를 떼고 본문만.
  ❌ 나쁜 예: task="자동채우기 개선", goal="자동채우기 개선", problem="자동채우기 개선" (세 필드 동일)
  ✅ 좋은 예: task="자동채우기 개선", goal="모든 필드를 빠짐없이 채운다", problem="자동채우기 결과에 빈 필드가 대량 발생해 기록 신뢰성이 떨어진다"
- Direct(good/bad/aix/aio): 2~3문장
- driveLinks url 없어도 name 유추
- 샘플 값 그대로 복사 금지, 패턴만 참고

활동:
${text}

예시:
{"stage":"설계단계","emoji":"🛠","task":"자동채우기 개선","date":"${today}","editName":"${userNameHint}","editEmail":"${userEmailHint}","goal":"설계 대안을 비교해 근거 정리","problem":"자동채우기 빈 필드로 기록 신뢰성 저하","tools":["Claude"],"wfRows":[{"tool":"Claude","intent":"구조 파악","action":"파이프라인 추적","time":15,"prompt":"구조 분석"},{"tool":"Claude","intent":"설계","action":"프롬프트 작성","time":25,"prompt":"프롬프트 설계"},{"tool":"Claude","intent":"검증","action":"반영 및 구문 검사","time":15,"prompt":"구문 검증"}],"goodChipTexts":["반복 작업 시간 단축"],"badChipTexts":["반복 수정에도 결과 미도달"],"goodDirect":"파이프라인 빠르게 파악, 최소 침습으로 구현. DOM 흐름 유지로 회귀 리스크 낮음.","badDirect":"LLM이 JSON 예시를 규칙보다 강하게 모방해 예시·규칙 동기화가 필수.","aixDirect":"AI 없으면 6천줄 HTML 수동 매핑에 하루 이상. 저장/복원 비대칭 뷰어 버그 리스크 큼.","aioDirect":"조사15+설계25+검증15=55분 안에 대형 리팩터 완료, 80%+ 단축.","qaYN":{"accuracy":"Y","completeness":"Y","usability":"Y","format":"Y","bias":"Y","prompt":"Y"},"qaResult":"전 항목 Y. 사용자 검토 필요.","qaRecommend":"stage-select에 계획·구현 옵션 추가","discovery":"Fill-All 강제는 JSON 예시 샘플 채움이 가장 효과적","refInput":"Claude Cowork 대화 세션","driveLinks":{"material":{"name":"참고 미등록","url":"","process":"원본"},"mid":{"name":"중간 미등록","url":"","process":"원본"},"final":{"name":"ai_activity_card_v2_14.html","url":"","process":"원본"},"prompt":{"name":"프롬프트 본문","url":"","process":"가공"}}}

참고:
[목표]${goalSamples}
[문제]${problemSamples}
[Good]${goodSamples}
[Bad]${badSamples}
[AIX]${aixSamples}
[AIO]${aioSamples}`;

        progressTxt.textContent = 'AI가 내용을 분석하고 있어요...';

        // Supabase Edge Function 프록시를 통해 Gemini 호출
        const sbAnonKey = localStorage.getItem('sb_key') || _SB_KEY;
        const res = await fetch(
          'https://lcfuclnopswjogidbsix.supabase.co/functions/v1/gemini-proxy',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${sbAnonKey}`,
              'apikey': sbAnonKey
            },
            body: JSON.stringify({ prompt })
          }
        );

        if (!res.ok) {
          const errText = await res.text().catch(() => '');
          // Groq 한도 에러 타입별 사용자 친화 메시지
          if (/rate[_\s]*limit/i.test(errText)) {
            // 분당 토큰 제한(TPM) — 약 60초 대기 권고
            throw new Error('⏱ 분당 요청 한도 초과 (Groq llama 무료 티어 6,000 TPM). 60초 후 다시 시도해주세요. 내용을 더 짧게 줄이면 재시도 간격을 좁힐 수 있습니다.');
          }
          if (/request[_\s]*too[_\s]*large/i.test(errText) || /context[_\s]*length/i.test(errText)) {
            throw new Error('📏 단일 요청이 토큰 한도를 초과했습니다. 붙여넣은 활동 내용을 절반 이하로 줄이거나 핵심만 요약해서 다시 시도해주세요.');
          }
          throw new Error('프록시 오류 ' + res.status + (errText ? ': ' + errText.slice(0,120) : ''));
        }
        const data = await res.json();
        if (data.error) throw new Error('Gemini 오류: ' + data.error);
        const raw = data.text || '';

        // JSON 파싱
        const jsonMatch = raw.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error('응답 파싱 실패');
        const filled = JSON.parse(jsonMatch[0]);

        progressTxt.textContent = '카드에 적용 중...';
        console.log('[AI Fill] 반환 데이터:', JSON.stringify({tools: filled.tools, goodDirect: filled.goodDirect, badDirect: filled.badDirect, discovery: filled.discovery, qaRecommend: filled.qaRecommend}, null, 2));

        // ── 필드 적용 ──
        const se = id => document.getElementById(id);

        // 단계
        if (filled.stage) {
          const el = se('stage-select');
          if (el) el.value = filled.stage;
        }

        // 소재명
        if (filled.task) {
          const el = se('task-input');
          if (el) el.value = filled.task;
        }

        // 목표 — 콤보 박스 input에 직접 값 설정 (direct textarea는 강제로 숨김·초기화)
        {
          let goalVal = (filled.goal || filled.goalDirect || '').toString().trim();
          // 방어 로직 — task와 동일하면 Llama가 성의 없이 복사한 것. 공란 처리.
          const taskForCheck = (filled.task || '').toString().trim();
          if (goalVal && goalVal === taskForCheck) {
            console.warn('[AI Fill] goal이 task와 동일 — 규칙 위반으로 간주하고 공란 처리:', goalVal);
            goalVal = '';
          }
          const input = se('goal-input-text');
          const dirEl = se('goal-direct');
          if (input) {
            input.value = goalVal;
            delete input.dataset.direct;
            input.placeholder = '🎯 목표 선택 또는 직접 입력';
            input.setAttribute('value', goalVal);
          }
          if (dirEl) {
            dirEl.value = '';
            dirEl.style.display = 'none';
            dirEl.setAttribute('style', 'display:none;');
          }
          console.log('[AI Fill] goal 적용:', goalVal, '| input.value=', input?.value);
        }

        // 문제 — 콤보 박스 input에 직접 값 설정 (direct textarea는 강제로 숨김·초기화)
        {
          let probVal = (filled.problem || filled.problemDirect || '').toString().trim();
          // 방어 로직 — goal 또는 task와 동일하면 Llama가 규칙을 어긴 것. 공란 처리하고 사용자가 직접 입력하도록.
          const goalForCheck = (filled.goal || filled.goalDirect || '').toString().trim();
          const taskForCheck = (filled.task || '').toString().trim();
          if (probVal && (probVal === goalForCheck || probVal === taskForCheck)) {
            console.warn('[AI Fill] problem이 goal 또는 task와 동일 — 규칙 위반으로 간주하고 공란 처리:', probVal);
            probVal = '';
          }
          const input = se('problem-input');
          const dirEl = se('problem-direct');
          if (input) {
            input.value = probVal;
            delete input.dataset.direct;
            input.placeholder = '⚡ 문제 선택 또는 직접 입력';
            input.setAttribute('value', probVal);
          }
          if (dirEl) {
            dirEl.value = '';
            dirEl.style.display = 'none';
            dirEl.setAttribute('style', 'display:none;');
          }
          console.log('[AI Fill] problem 적용:', probVal, '| input.value=', input?.value);
        }

        // 선정 도구 — toolActive에 추가 후 renderTools
        // 도구명 fuzzy 매핑 (AI가 반환한 이름 → toolList 정확한 이름으로 변환)
        function matchTool(name) {
          if (!name) return '';
          const list = window._getToolList ? window._getToolList() : ['Perplexity','Claude','Gemini','Figma','Make','Stitch','Claude Cowork','Claude Code','VS Code'];
          const n = name.toLowerCase().replace(/[ \-_]/g, '');
          const found = list.find(t => t.toLowerCase().replace(/[ \-_]/g, '') === n);
          if (found) return found;
          const partial = list.find(t => n.includes(t.toLowerCase().replace(/[ \-_]/g, '')) || t.toLowerCase().replace(/[ \-_]/g, '').includes(n));
          if (partial) return partial;
          // 없으면 toolList에 추가
          if (window._addToToolList) window._addToToolList(name);
          return name;
        }

        if (filled.tools && filled.tools.length > 0) {
          filled.tools.forEach(t => {
            const matched = matchTool(t);
            if (window._addToToolList) window._addToToolList(matched);
          });
          if (filled.wfRows && filled.wfRows.length > 0) {
            wfRows = filled.wfRows.map(r => ({
              tool: matchTool(r.tool),
              intent: r.intent || '',
              action: r.action || '',
              time: String(r.time || '').replace(/[^0-9]/g, '') || '',
              prompt: r.prompt || ''
            }));
            toolActive = new Set(wfRows.map(r => r.tool).filter(Boolean));
          } else {
            toolActive = new Set(filled.tools.map(matchTool));
          }
          renderTools(); renderWorkflow();
          // 드롭다운 동기화 딜레이
          setTimeout(() => { renderTools(); renderWorkflow(); syncToolsWithWf(); }, 100);
        } else if (filled.wfRows && filled.wfRows.length > 0) {
          wfRows = filled.wfRows.map(r => ({
            tool: matchTool(r.tool),
            intent: r.intent || '',
            action: r.action || '',
            time: String(r.time || '').replace(/[^0-9]/g, '') || '',
            prompt: r.prompt || ''
          }));
          wfRows.forEach(r => { if (r.tool && window._addToToolList) window._addToToolList(r.tool); });
          toolActive = new Set(wfRows.map(r => r.tool).filter(Boolean));
          renderTools(); renderWorkflow();
          setTimeout(() => { renderTools(); renderWorkflow(); syncToolsWithWf(); }, 100);
        }

        // 이모지 — 버튼 텍스트 설정 + placeholder 클래스 제거
        if (filled.emoji) {
          const btn = se('emoji-btn');
          if (btn) {
            const em = String(filled.emoji).trim();
            if (em) { btn.textContent = em.slice(0, 4); btn.classList.remove('placeholder'); }
          }
        }

        // 활동일
        if (filled.date) {
          const el = se('date-input');
          if (el) el.value = filled.date;
        } else {
          const el = se('date-input');
          if (el && !el.value) el.value = new Date().toISOString().slice(0,10);
        }

        // 작성자
        if (filled.editName) {
          const el = se('edited-name');
          if (el) {
            const opts = Array.from(el.options || []).map(o => o.value);
            if (opts.includes(filled.editName)) el.value = filled.editName;
            else {
              // 옵션에 없으면 새 옵션 추가 후 선택
              const opt = document.createElement('option');
              opt.value = filled.editName; opt.textContent = filled.editName;
              el.appendChild(opt); el.value = filled.editName;
            }
          }
        }

        // 이메일
        if (filled.editEmail) {
          const el = se('edited-email');
          if (el) el.innerText = filled.editEmail;
        }

        // 도움받은 글/영상 레퍼런스
        if (filled.refInput) {
          const el = se('ref-input');
          if (el) el.value = filled.refInput;
        }

        // 드라이브 링크 4종 (material / mid / final / prompt)
        if (filled.driveLinks && typeof filled.driveLinks === 'object') {
          ['material','mid','final','prompt'].forEach(k => {
            const row = filled.driveLinks[k];
            if (!row || typeof row !== 'object') return;
            const hidUrl  = se('drive-' + k);
            const hidName = se('drive-' + k + '-name');
            const hidProc = se('drive-' + k + '-process');
            if (hidUrl)  hidUrl.value  = row.url  || '';
            if (hidName) hidName.value = row.name || '';
            if (hidProc) hidProc.value = row.process || '';
            if ((row.url || row.name) && typeof updateDriveRow === 'function') {
              try { updateDriveRow(k); } catch(_) {}
            }
          });
        }

        // QA Y/N — 자동 세팅 복구 (Fill-All 모드: AI 판정 반영)
        if (filled.qaYN && typeof filled.qaYN === 'object') {
          Object.entries(filled.qaYN).forEach(([key, val]) => {
            if (!val) return;
            const v = String(val).trim().toUpperCase();
            if (v !== 'Y' && v !== 'N') return;
            const btn = document.querySelector(`.qa-${v.toLowerCase()}[data-key="${key}"]`);
            if (btn) btn.click();
          });
          console.log('[AI Fill] QA Y/N 자동 적용:', filled.qaYN);
        } else {
          console.log('[AI Fill] QA Y/N 응답 없음 (사용자 수동 체크 필요)');
        }

        // Good Point — fuzzy matching
        if (filled.goodChipTexts && filled.goodChipTexts.length > 0) {
          goodSelected.clear();
          const goodItems = window._GOOD_ITEMS || [];
          filled.goodChipTexts.forEach(txt => {
            if (!txt) return;
            // 정확히 일치
            let idx = goodItems.indexOf(txt);
            // 부분 일치
            if (idx === -1) idx = goodItems.findIndex(item => item.includes(txt) || txt.includes(item));
            if (idx !== -1) goodSelected.add(idx);
          });
          if (_goodDD) _goodDD.renderTags();
        }
        // goodDirect — 항상 직접 작성으로 표시
        const goodDirectVal = (filled.goodDirect || '').trim();
        if (goodDirectVal) {
          const el = se('good-direct');
          if (el) el.value = goodDirectVal;
          const box = se('good-direct-box');
          if (box) box.style.display = '';
        }

        // Bad Point — fuzzy matching
        if (filled.badChipTexts && filled.badChipTexts.length > 0) {
          badSelected.clear();
          const badItems = window._BAD_ITEMS || [];
          filled.badChipTexts.forEach(txt => {
            if (!txt) return;
            // 정확히 일치
            let idx = badItems.indexOf(txt);
            // 부분 일치
            if (idx === -1) idx = badItems.findIndex(item => item.includes(txt) || txt.includes(item));
            if (idx !== -1) badSelected.add(idx);
          });
          if (_badDD) _badDD.renderTags();
        }
        // badDirect — 항상 직접 작성으로 표시
        const badDirectVal = (filled.badDirect || '').trim();
        if (badDirectVal) {
          const el = se('bad-direct');
          if (el) el.value = badDirectVal;
          const box = se('bad-direct-box');
          if (box) box.style.display = '';
        }

        // AI X / AI O 직접 작성
        if (filled.aixDirect) {
          const el = se('aix-direct');
          if (el) { el.value = filled.aixDirect; }
          const box = se('aix-direct-box');
          if (box) box.style.display = '';
        }
        if (filled.aioDirect) {
          const el = se('aio-direct');
          if (el) { el.value = filled.aioDirect; }
          const box = se('aio-direct-box');
          if (box) box.style.display = '';
        }

        // 보완 권장
        const qaRecommendVal = (filled.qaRecommend || '').trim();
        if (qaRecommendVal) {
          const el = se('qa-recommend');
          if (el) el.value = qaRecommendVal;
        }
        // 새로 알게 된 사실
        const discoveryVal = (filled.discovery || '').trim();
        console.log('[AI Fill] discovery 값:', discoveryVal);
        if (discoveryVal) {
          const el = se('discovery-input');
          console.log('[AI Fill] discovery-input 엘리먼트:', el);
          if (el) el.value = discoveryVal;
        }

        // ── 빈 필드 감지 (Fill-All 모드) ──
        // Fill-All 원칙 하에선 모든 필드가 채워져야 정상. 빈 필드가 남으면 AI가 규칙을 어긴 것.
        const emptyFields = [];
        const checkEmpty = (label, id, val) => {
          const el = se(id);
          const v = (val !== undefined ? val : (el?.value || '')).toString().trim();
          if (!v) {
            emptyFields.push({ label, id });
            if (el) {
              el.classList.add('ai-fill-empty');
              if (!el.placeholder || !el.placeholder.includes('AI가 채우지 못함')) {
                el._origPlaceholder = el.placeholder;
                el.placeholder = '⚠ AI가 채우지 못함 — 직접 보완';
              }
            }
          }
        };
        checkEmpty('소재명 (Task)',        'task-input');
        checkEmpty('활동일',               'date-input');
        checkEmpty('목표',                 'goal-input-text');
        checkEmpty('문제 정의',            'problem-input');
        checkEmpty('Good Point (직접 작성)', 'good-direct');
        checkEmpty('Bad Point (직접 작성)',  'bad-direct');
        checkEmpty('AI X (직접 작성)',      'aix-direct');
        checkEmpty('AI O (직접 작성)',      'aio-direct');
        checkEmpty('보완 권장',            'qa-recommend');
        checkEmpty('새로 알게 된 사실',     'discovery-input');
        checkEmpty('레퍼런스',             'ref-input');

        const qaUnchecked = QA_KEYS.filter(key => {
          const row = document.querySelector(`.qa-row[data-key="${key}"]`);
          return row && !row.classList.contains('is-y') && !row.classList.contains('is-n');
        });

        // 완료
        progress.classList.remove('show');
        result.classList.add('show');
        let resultHtml = '✅ Fill-All 모드로 카드가 채워졌습니다!<br><span style="color:#888;font-size:12px;">AI가 유추한 값이 포함되어 있을 수 있으니 내용을 검토·수정해주세요.</span>';
        if (emptyFields.length > 0) {
          resultHtml += `<div style="margin-top:10px;padding:10px;background:#fff8e1;border-left:3px solid #f0a020;border-radius:6px;text-align:left;font-size:12px;color:#7a5a00;">`
            + `<strong>⚠ AI가 규칙 위반: 비어 있는 필드</strong><br>`
            + emptyFields.map(f => `• ${f.label}`).join('<br>')
            + `<br><br>다시 실행하거나 직접 보완해주세요.`
            + `</div>`;
        }
        if (qaUnchecked.length > 0) {
          resultHtml += `<div style="margin-top:8px;padding:10px;background:#e8f1fc;border-left:3px solid #3a78d4;border-radius:6px;text-align:left;font-size:12px;color:#1a4a8a;">`
            + `<strong>ℹ QA Y/N 일부가 세팅되지 않았습니다.</strong> AI의 판단이 적용되어 있으니 실제 검토 기준과 다를 수 있습니다 — 필요 시 직접 재체크하세요.`
            + `</div>`;
        }
        result.innerHTML = resultHtml;

        console.log('[AI Fill] 빈 필드:', emptyFields.map(f => f.label));
        console.log('[AI Fill] 미체크 QA:', qaUnchecked);

        setTimeout(() => {
          closeModal();

          // ── 1차 Alert: 비어 있는 필드 안내 (있을 때만) ──
          if (emptyFields.length > 0) {
            let firstMsg = '⚠ AI가 채우지 못한 항목 (' + emptyFields.length + '개)\n';
            firstMsg += '────────────────────────\n';
            firstMsg += emptyFields.map((f, i) => (i + 1) + '. ' + f.label).join('\n');
            firstMsg += '\n────────────────────────\n';
            firstMsg += '\n이 항목은 활동 내용에서 AI가 근거를 찾지 못해';
            firstMsg += '\n유추에 실패한 필드입니다.';
            firstMsg += '\n\n해당 필드는 직접 입력해 주세요.';
            alert(firstMsg);
          }

          // ── 2차 Alert: 유추값 재검증 필요 안내 (항상 표시) ──
          let secondMsg = '🔍 필히 재검증해 주세요\n';
          secondMsg += '────────────────────────\n';
          secondMsg += '자동 채우기로 입력된 값 중 상당수는';
          secondMsg += '\n활동 기록을 바탕으로 AI가 유추한 내용입니다.';
          secondMsg += '\n\n[재검토 필요 영역]';
          secondMsg += '\n• 단계 / 목표 / 문제정의';
          secondMsg += '\n• Work Flow의 INTENT · 활동 · 소요시간';
          secondMsg += '\n• QA 체크리스트 Y/N 판정';
          secondMsg += '\n• 인사이트 (잘된점·아쉬운점·AI X/O)';
          secondMsg += '\n• 드라이브 링크 이름/URL';
          secondMsg += '\n\n반드시 본인이 내용을 검토·수정한 뒤';
          secondMsg += '\n저장해 주세요.';
          alert(secondMsg);

          // 토스트는 마지막에 한 번만
          if (emptyFields.length > 0) {
            showToast('✨ 완료! ' + emptyFields.length + '개 필드는 직접 보완 + 전체 재검토 필요');
          } else {
            showToast('✨ 자동 채우기 완료 — 전체 내용을 재검토해 주세요');
          }
        }, 1800);

      } catch(e) {
        progress.classList.remove('show');
        result.classList.add('show', 'error');
        result.textContent = '❌ 오류가 발생했습니다: ' + e.message;
        console.error('[AI Fill]', e);
      } finally {
        runBtn.disabled = false;
      }
    });
  })();


  /* ══════════════════════════════════════
     ✨ AI 자동채우기 — 단계별 동적 프롬프트 빌더
     (단계 선택 시 해당 단계의 목표/문제 선택지를 프롬프트에 주입)
  ══════════════════════════════════════ */
  (function() {
    const promptEl = document.getElementById('ai-fill-prompt-text');
    const stageSel = document.getElementById('stage-select');
    if (!promptEl || !stageSel) return;

    // 단계 value → GOAL_OPTIONS / PROBLEM_OPTIONS 의 group 라벨
    const STAGE_GROUP_MAP = {
      '관리단계':       '🗂 관리',
      '분석단계':       '🔍 분석',
      '설계단계':       '✏️ 설계',
      '테스트단계':     '🧪 테스트',
      '배포및완료단계': '🚀 배포 & 완료',
      // stage-select에 없지만 옵션 데이터에는 존재 (향후 확장 대비)
      '계획단계':       '📋 계획',
      '구현단계':       '⚙️ 구현'
    };
    const STAGE_DISPLAY = {
      '관리단계':       '관리',
      '분석단계':       '분석',
      '설계단계':       '설계',
      '테스트단계':     '테스트',
      '배포및완료단계': '배포및완료',
      '계획단계':       '계획',
      '구현단계':       '구현'
    };

    function getLabelsForGroup(options, groupName) {
      const out = [];
      let inGroup = false;
      for (const item of options || []) {
        if (item.group !== undefined) { inGroup = (item.group === groupName); continue; }
        if (inGroup && item.label) out.push(item.label);
      }
      return out;
    }

    function buildPrompt(stage) {
      const goalOpts    = window._GOAL_OPTIONS    || [];
      const problemOpts = window._PROBLEM_OPTIONS || [];
      const groupName   = STAGE_GROUP_MAP[stage] || '';
      const stageLabel  = STAGE_DISPLAY[stage] || '(계획/관리/분석/설계/구현/테스트/배포 중 택1)';

      let goalSection, problemSection;
      if (groupName) {
        const goalLabels    = getLabelsForGroup(goalOpts,    groupName);
        const problemLabels = getLabelsForGroup(problemOpts, groupName);
        goalSection =
          '📌 [' + stageLabel + '] 단계 목표 선택지 (해당되는 문장을 "그대로" 복사. 없으면 "직접: <한 줄>")\n' +
          (goalLabels.length ? goalLabels.map(l => '  • ' + l).join('\n') : '  (목록 없음)');
        problemSection =
          '📌 [' + stageLabel + '] 단계 문제 선택지 (동일 규칙)\n' +
          (problemLabels.length ? problemLabels.map(l => '  • ' + l).join('\n') : '  (목록 없음)');
      } else {
        goalSection    = '※ 단계를 먼저 선택하면 해당 단계의 목표/문제 선택지가 자동으로 주입됩니다.';
        problemSection = '';
      }

      const lines = [
        '지금까지 이 대화창에서 너와 대화한 모든 내용을 "AI 활동기록 카드"에 자동으로 채울 수 있게 요약해줘.',
        '반드시 아래 형식·규칙을 그대로 지키고, 모든 항목을 채워. 값이 없으면 "(없음)", 추정이면 끝에 "[추정]" 태그.',
        '',
        '⚠ 길이 제약 (카드 백엔드가 Groq llama 6000 토큰 한도 사용):',
        '• 전체 응답은 반드시 한글 2,000자 이내로 압축.',
        '• 각 항목은 한 줄 원칙. 여러 문장이 필요해도 핵심만 짧게.',
        '• Work Flow는 스텝당 INTENT/활동/Good 프롬프트/시간 각 1줄 이내. 활동은 쉼표로 병렬 나열 가능.',
        '• 인사이트·잘된점·아쉬운점도 각 1~2문장 이내. 장황한 서술 금지.',
        '• Good 프롬프트만은 원문 그대로 복사(길이 제약 예외).',
        '',
        '━━ 1. 기본정보 ━━',
        '이모지(1글자):',
        'Task / 소재명:',
        '단계: ' + stageLabel,
        '활동일(YYYY-MM-DD):',
        '작성자:',
        '이메일:',
        '',
        '━━ 2. 목표 · 문제정의 ━━',
        goalSection,
        problemSection,
        '',
        '목표:',
        '문제정의:',
        '',
        '━━ 3. 사용한 AI 도구 ━━',
        '도구(쉼표 구분):',
        '',
        '━━ 4. AI WORK FLOW ━━',
        '반드시 아래처럼 [도구이름] 로 시작하는 블록으로, 사용한 도구 수만큼 반복:',
        '',
        '[도구이름]',
        '- INTENT(의도):',
        '- 활동:',
        '- Good 프롬프트(실제 사용한 문장 그대로 복사, 요약 금지):',
        '- 소요시간(분):',
        '',
        '총 소요시간(분):',
        '',
        '━━ 5. QA 체크리스트 (각 항목 Y/N + N이면 사유 한 줄) ━━',
        '- 정확성 (내용이 사실에 부합):',
        '- 완성도 (누락 없이 완성):',
        '- 활용 가능성 (실무에 바로 적용 가능):',
        '- 형식 적합성 (요청 형식·구조와 일치):',
        '- 편향·오류 검토 (편향/오류 없음):',
        '- 프롬프트 최적화 (개선 시도 진행):',
        '',
        '━━ 6. 보완 권장 (한 줄) ━━',
        '',
        '━━ 7. 인사이트 ━━',
        '- AI 미사용 시 예상 비효율:',
        '- AI 활용으로 얻은 효율 (정량·정성):',
        '- 잘 된 점:',
        '- 아쉬운 점:',
        '- 새로 알게 된 한마디:',
        '',
        '━━ 8. 레퍼런스 · 저장 ━━',
        '- 도움받은 글/영상 (제목 · URL):',
        '- 결과물 저장 기본 경로:',
        '- 구글 드라이브 링크 (타이틀 / URL / 원본·가공):',
        '',
        '━━ 9. 산출물 이미지 힌트 (있을 때만) ━━',
        '- 파일명 힌트:',
        '- 이미지 캡션:',
        '',
        '━━ 규칙 ━━',
        '• 모든 항목을 반드시 채운다. 비울 경우 "(없음)" 또는 "[추정]".',
        '• 시간은 분 단위 숫자만 (예: 45).',
        '• Good 프롬프트는 실제 사용한 원문 그대로. 요약/재작성 금지.',
        '• AI WORK FLOW는 반드시 [대괄호] 블록으로 도구를 구분 (카드 파서 규칙).',
        '• 목표/문제는 위 사전 선택지에 있으면 "그대로" 복사. 없을 때만 "직접: …".'
      ];
      return lines.filter(l => l !== null && l !== undefined).join('\n');
    }

    function refresh() {
      promptEl.textContent = buildPrompt(stageSel.value);
    }

    // 단계 변경 시 프롬프트 갱신
    stageSel.addEventListener('change', refresh);
    // 초기 1회 렌더
    refresh();

    // 외부에서도 호출 가능하도록 노출 (디버깅/확장용)
    window._rebuildAutoFillPrompt = refresh;
    window._buildAutoFillPrompt   = buildPrompt;
  })();

