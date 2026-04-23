  /* ── QA Y/N ── */
  function syncQaStepSelect() {
    QA_KEYS.forEach(key => {
      const sel = document.getElementById(`qa-${key}-step-sel`);
      if (!sel) return;
      sel.innerHTML = '<option value="">+ 스텝 추가</option>';
      wfRows.forEach((row, i) => {
        if (!qaStepsMap[key].find(s => s.idx === i)) {
          const opt = document.createElement('option');
          opt.value = i;
          opt.textContent = `STEP.${i+1}${row.tool ? ' — ' + row.tool : ''}`;
          sel.appendChild(opt);
        }
      });
    });
  }

  function renderQaStepRows(key) {
    const wrap = document.getElementById(`qa-${key}-rows`);
    if (!wrap) return;
    wrap.innerHTML = '';
    qaStepsMap[key].forEach((item, pos) => {
      const wfRow = wfRows[item.idx];
      if (!wfRow) return;
      const div = document.createElement('div');
      div.className = 'qa-step-row';
      const badge = document.createElement('div');
      badge.className = 'qa-step-badge';
      badge.innerHTML = `STEP.${item.idx+1}${wfRow.tool ? `<span class="tool-name">${wfRow.tool}</span>` : ''}`;
      const inp = document.createElement('div');
      inp.className = 'qa-step-row-input';
      inp.setAttribute('data-placeholder', '내용을 입력해주세요 ↗');
      inp.textContent = item.content || '';
      inp.addEventListener('click', () => {
        const fakeTA = document.createElement('textarea');
        fakeTA.value = item.content || '';
        Object.defineProperty(fakeTA, 'value', {
          get: () => item.content || '',
          set: (v) => { item.content = v; inp.textContent = v; }
        });
        openTextModal(fakeTA, `STEP.${item.idx+1} 문제 내용`);
      });
      const del = document.createElement('button');
      del.className = 'qa-step-badge-del wf-del';
      del.style.cssText = 'flex-shrink:0;';
      del.textContent = '✕';
      del.addEventListener('click', () => {
        qaStepsMap[key].splice(pos, 1);
        renderQaStepRows(key);
        syncQaStepSelect();
      });
      div.append(badge, inp, del);
      wrap.appendChild(div);
    });
  }

  QA_KEYS.forEach(key => {
    document.getElementById(`qa-${key}-step-sel`)?.addEventListener('change', function() {
      const idx = parseInt(this.value);
      if (!isNaN(idx)) {
        qaStepsMap[key].push({ idx, content: '' });
        renderQaStepRows(key);
        syncQaStepSelect();
      }
      this.value = '';
    });
  });

  function updateQaToolBadge() {}
  function renderQaFormatBadges() { renderQaStepRows('format'); }
  function renderQaBiasBadges()   { renderQaStepRows('bias'); }

  document.querySelectorAll('.qa-y, .qa-n').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.key;
      const row = btn.closest('.qa-row');
      const isY = btn.classList.contains('qa-y');
      const detail = document.getElementById('qa-detail-' + key);
      const yBtn = row.querySelector('.qa-y');
      const nBtn = row.querySelector('.qa-n');
      const wasActive = btn.classList.contains('active');

      row.classList.remove('is-y', 'is-n');
      yBtn.classList.remove('active');
      nBtn.classList.remove('active');

      if (!wasActive) {
        btn.classList.add('active');
        row.classList.add(isY ? 'is-y' : 'is-n');
        if (!isY && detail) {
          detail.classList.remove('hidden');
          if (QA_KEYS.includes(key)) { syncQaStepSelect(); renderQaStepRows(key); }
        }
        else if (detail) detail.classList.add('hidden');
      } else {
        if (detail) detail.classList.add('hidden');
      }
    });
  });
