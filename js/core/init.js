  /* ── 진입/새로고침 시 항상 데이터 초기화 (뷰어 모드 제외) ── */
  if (!location.hash) {
    localStorage.removeItem(SAVE_KEY);
    sessionStorage.removeItem(AUTO_SAVE_KEY);
  }

  // 자동저장 리스너 연결
  setTimeout(attachAutoSaveListeners, 500);

  // URL 해시 ID로 Supabase에서 카드 복원 (뷰어 모드)
  (function() {
    const hash = location.hash.slice(1);
    if (!hash) return;

    _isViewerMode = true;
    document.body.classList.add('viewer');
    // 뷰어 모드에서도 '링크 공유' 버튼은 유지 (작성/설정/초기화/자동채우기만 숨김)
    ['save-btn','clear-btn','cfg-btn','ai-fill-btn'].forEach(id => {
      const el = document.getElementById(id); if (el) el.style.display = 'none';
    });
    const shareBtnKeep = document.getElementById('share-link-btn');
    if (shareBtnKeep) shareBtnKeep.style.display = '';

    (async () => {
      try {
        const snap = await sbFetch(hash);
        applySnapData(snap);
        // 뷰어 모드: 빈 필드에 "사용자가 입력하지 않음" 표시
        setTimeout(() => {
          expandViewerComboFields();
          applyViewerEmptyState();
          if (window._registerInsViewClick) window._registerInsViewClick();
          if (window._registerViewerFieldClicks) window._registerViewerFieldClicks();
        }, 150);
      } catch(e) {
        console.error('[UXD2] 뷰어 복원 오류:', e);
        showToast('카드 로딩 실패: ' + e.message);
      }
    })();
  })();

  syncImageUI();

  /* ── 동적 타이틀 업데이트 ── */
  function updatePageTitle() {
    const name = document.getElementById('edited-name')?.value?.trim() || '';
    const date = document.getElementById('date-input')?.value || '';
    const base = 'AI 리터러시 활동기록카드';
    let title = base;
    if (name || date) {
      const parts = [];
      if (name) parts.push(name);
      if (date) {
        // yyyy-mm-dd → yy.mm.dd 형식으로
        const d = date.replace(/^20(\d{2})-(\d{2})-(\d{2})$/, '$1$2$3');
        parts.push(d);
      }
      title = base + ' - ' + parts.join(' - ');
    }
    document.title = title;
  }

  // 작성자 변경 시
  document.getElementById('edited-name')?.addEventListener('change', updatePageTitle);

  // 날짜 변경 시
  document.getElementById('date-input')?.addEventListener('change', updatePageTitle);
  document.getElementById('date-input')?.addEventListener('input', updatePageTitle);

  // 초기 실행 (날짜 자동입력 후)
  setTimeout(updatePageTitle, 200);

  /* ── DARK MODE TOGGLE ── */
  (function() {
    const btn = document.getElementById('dark-toggle');
    if (!btn) return;
    function syncIcon() {
      btn.textContent = document.documentElement.classList.contains('dark') ? '☀ LIGHT' : '☽ DARK';
    }
    syncIcon();
    btn.addEventListener('click', () => {
      document.documentElement.classList.toggle('dark');
      localStorage.setItem('dark_mode', document.documentElement.classList.contains('dark') ? '1' : '0');
      syncIcon();
    });
  })();