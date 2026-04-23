  /* ── 뷰어 모드 인사이트 상세 팝업 ── */
  (function() {
    const overlay = document.getElementById('ins-view-overlay');
    const titleEl = document.getElementById('ins-view-title');
    const body    = document.getElementById('ins-view-body');
    const closeBtn = document.getElementById('ins-view-close');

    function closeModal() { overlay.classList.remove('open'); }
    closeBtn?.addEventListener('click', closeModal);
    overlay?.addEventListener('click', e => { if (e.target === overlay) closeModal(); });

    function openInsView(title, chips, items, directText, directLabel) {
      titleEl.textContent = title;
      body.innerHTML = '';

      const hasChips  = chips && chips.size > 0;
      const hasDirect = directText && directText.trim();

      if (!hasChips && !hasDirect) {
        const msg = document.createElement('div');
        msg.className = 'ins-view-empty';
        msg.textContent = '사용자가 입력하지 않음';
        body.appendChild(msg);
        overlay.classList.add('open');
        return;
      }

      // 그룹별 칩 렌더링
      if (hasChips) {
        // 그룹 묶기
        const grouped = {};
        chips.forEach(i => {
          let offset = 0;
          let groupTitle = '기타';
          for (const g of items.groups) {
            if (i < offset + g.items.length) { groupTitle = g.title; break; }
            offset += g.items.length;
          }
          if (!grouped[groupTitle]) grouped[groupTitle] = [];
          grouped[groupTitle].push(items.all[i]);
        });

        Object.entries(grouped).forEach(([gTitle, list]) => {
          const group = document.createElement('div');
          group.className = 'ins-view-group';
          const gt = document.createElement('div');
          gt.className = 'ins-view-group-title';
          gt.textContent = gTitle;
          group.appendChild(gt);
          list.forEach(text => {
            const item = document.createElement('div');
            item.className = 'ins-view-item';
            item.textContent = text;
            group.appendChild(item);
          });
          body.appendChild(group);
        });
      }

      // 직접 작성
      if (hasDirect) {
        const group = document.createElement('div');
        group.className = 'ins-view-group';
        const gt = document.createElement('div');
        gt.className = 'ins-view-group-title';
        gt.textContent = directLabel || '직접 작성';
        group.appendChild(gt);
        const item = document.createElement('div');
        item.className = 'ins-view-item direct';
        item.textContent = directText.trim();
        group.appendChild(item);
        body.appendChild(group);
      }

      overlay.classList.add('open');
    }

    // 뷰어 모드에서 ins-box 클릭 이벤트 등록
    window._registerInsViewClick = function() {
      if (!_isViewerMode) return;

      const configs = [
        { boxId: 'aix-tags',  title: 'AI X — 비효율', selected: () => aixSelected,  groups: AIX_GROUPS, all: () => AIX_ITEMS, directId: 'aix-direct',  directLabel: '직접 작성' },
        { boxId: 'aio-tags',  title: 'AI O — 효율',   selected: () => aioSelected,  groups: AIO_GROUPS, all: () => AIO_ITEMS, directId: 'aio-direct',  directLabel: '직접 작성' },
        { boxId: 'good-tags', title: 'Good Point',    selected: () => goodSelected, groups: GOOD_GROUPS, all: () => GOOD_ITEMS, directId: 'good-direct', directLabel: '직접 작성' },
        { boxId: 'bad-tags',  title: 'Bad Point',     selected: () => badSelected,  groups: BAD_GROUPS, all: () => BAD_ITEMS,  directId: 'bad-direct',  directLabel: '직접 작성' },
      ];

    };
  })();


  /* ── 뷰어 모드 필드 상세보기 클릭 등록 ── */
  window._registerViewerFieldClicks = function() {
    if (!_isViewerMode) return;

    // 공통 상세 팝업 헬퍼 (텍스트 모달 재활용)
    function showReadModal(title, value) {
      const emptyMsg = '사용자가 입력하지 않음';
      // fake textarea
      const fake = { value: value || '', placeholder: emptyMsg };
      textModalTitle.textContent = title;
      textModalTa.value = fake.value;
      textModalTa.placeholder = fake.value ? '' : emptyMsg;
      textModalTa.readOnly = true;
      textModal.classList.add('open');
    }

    // 1. 소재명
    const taskEl = document.getElementById('task-input');
    if (taskEl) {
      taskEl.style.cursor = 'pointer';
      taskEl.addEventListener('click', () => {
        showReadModal('소재명', taskEl.value);
      });
    }

    // 2. 목표
    const goalEl  = document.getElementById('goal-input-text');
    const goalDir = document.getElementById('goal-direct');
    if (goalEl) {
      goalEl.style.cursor = 'pointer';
      goalEl.addEventListener('click', () => {
        const val = goalEl.dataset.direct === 'true'
          ? (goalDir?.value || '')
          : goalEl.value;
        showReadModal('목표', val);
      });
    }
    if (goalDir) {
      goalDir.style.cursor = 'pointer';
      goalDir.addEventListener('click', () => showReadModal('목표', goalDir.value));
    }

    // 3. 문제 정의
    const probEl  = document.getElementById('problem-input');
    const probDir = document.getElementById('problem-direct');
    if (probEl) {
      probEl.style.cursor = 'pointer';
      probEl.addEventListener('click', () => {
        const val = probEl.dataset.direct === 'true'
          ? (probDir?.value || '')
          : probEl.value;
        showReadModal('문제 정의', val);
      });
    }
    if (probDir) {
      probDir.style.cursor = 'pointer';
      probDir.addEventListener('click', () => showReadModal('문제 정의', probDir.value));
    }

    // 4. 새로 알게 된 사실 (discovery-input)
    const discEl = document.getElementById('discovery-input');
    if (discEl) {
      discEl.style.cursor = 'pointer';
      discEl.addEventListener('click', () => showReadModal('새로 알게 된 사실', discEl.value));
    }
  };
