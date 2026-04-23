  /* ── AUTO SAVE (디바운스 1.5초) ── */
  const AUTO_SAVE_KEY = 'ai_card_autosave_v3';
  localStorage.removeItem('ai_card_autosave');
  let _autoSaveTimer = null;
  let _autoSaveIndicator = null;

  function showAutoSaveIndicator(state) {
    if (!_autoSaveIndicator) {
      _autoSaveIndicator = document.createElement('div');
      _autoSaveIndicator.id = 'auto-save-indicator';
      _autoSaveIndicator.style.cssText = `
        position: fixed; bottom: 72px; right: 18px; z-index: 9999;
        font-family: 'Pretendard', sans-serif; font-size: 12px; font-weight: 500;
        padding: 6px 12px; border-radius: 20px; transition: opacity .3s;
        pointer-events: none; opacity: 0;
      `;
      document.body.appendChild(_autoSaveIndicator);
    }
    if (state === 'saving') {
      _autoSaveIndicator.textContent = '💾 저장 중...';
      _autoSaveIndicator.style.background = '#f0f0f0';
      _autoSaveIndicator.style.color = '#888';
      _autoSaveIndicator.style.opacity = '1';
    } else {
      _autoSaveIndicator.textContent = '✓ 자동 저장됨';
      _autoSaveIndicator.style.background = '#f0f7e6';
      _autoSaveIndicator.style.color = '#3e8c4e';
      _autoSaveIndicator.style.opacity = '1';
      setTimeout(() => { _autoSaveIndicator.style.opacity = '0'; }, 2000);
    }
  }

  function triggerAutoSave() {
    if (_isViewerMode) return;
    clearTimeout(_autoSaveTimer);
    showAutoSaveIndicator('saving');
    _autoSaveTimer = setTimeout(() => {
      try {
        const snap = collectSnapData();
        sessionStorage.setItem(AUTO_SAVE_KEY, JSON.stringify(snap));
        showAutoSaveIndicator('saved');
      } catch(e) {
        console.warn('[AutoSave] 실패:', e);
      }
    }, 1500);
  }

  function attachAutoSaveListeners() {
    // 일반 input, textarea, select
    document.querySelectorAll('input, textarea, select').forEach(el => {
      el.addEventListener('input', triggerAutoSave);
      el.addEventListener('change', triggerAutoSave);
    });
    // contenteditable div
    document.querySelectorAll('[contenteditable="true"]').forEach(el => {
      el.addEventListener('input', triggerAutoSave);
    });
    // wf-input 클릭 후 팝업에서 확인 → 이미 input 이벤트 발생
  }
