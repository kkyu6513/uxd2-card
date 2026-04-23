  /* ── 활동일 오늘 날짜 자동 입력 ── */
  (function() {
    const dateEl = document.getElementById('date-input');
    if (dateEl && !dateEl.value) {
      const today = new Date();
      const y = today.getFullYear();
      const m = String(today.getMonth() + 1).padStart(2, '0');
      const d = String(today.getDate()).padStart(2, '0');
      dateEl.value = `${y}-${m}-${d}`;
    }
  })();

  /* ── TEXT EXPAND MODAL ── */
  const textModal      = document.getElementById('text-modal');
  const textModalTitle = document.getElementById('text-modal-title');
  const textModalTa    = document.getElementById('text-modal-ta');
  const textModalClose = document.getElementById('text-modal-close');
  let   currentExpandTa = null;

  function openTextModal(sourceTa, title) {
    currentExpandTa = sourceTa;
    textModalTitle.textContent = title;
    textModalTa.value = sourceTa.value;
    textModalTa.placeholder = sourceTa.placeholder;
    textModalTa.readOnly = _isViewerMode;
    textModal.classList.add('open');
    setTimeout(() => textModalTa.focus(), 50);
  }

  function closeTextModal() {
    if (currentExpandTa) {
      currentExpandTa.value = textModalTa.value;
      // input 이벤트 발생시켜 wfRows 등 리스너에 저장
      currentExpandTa.dispatchEvent(new Event('input', { bubbles: true }));
    }
    textModal.classList.remove('open');
    currentExpandTa = null;
  }

  textModalClose.addEventListener('click', closeTextModal);
  document.getElementById('text-modal-confirm').addEventListener('click', closeTextModal);
  textModal.addEventListener('click', e => { if (e.target === textModal) closeTextModal(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && textModal.classList.contains('open')) closeTextModal();
  });

  // 모달 textarea 입력 시 원본에도 실시간 반영
  textModalTa.addEventListener('input', () => {
    if (currentExpandTa) currentExpandTa.value = textModalTa.value;
  });

  // 확장 가능 textarea 클릭 연결
  const expandMap = [
    { id: 'ta-prompt',  title: '최종 결과물 추출을 위한 프롬프트' },
    { id: 'ta-quality', title: '품질 검증 활동 기록' },
  ];
  expandMap.forEach(({ id, title }) => {
    const ta = document.getElementById(id);
    if (!ta) return;
    ta.addEventListener('click', () => openTextModal(ta, title));
  });

  /* ── LIGHTBOX ── */
  const lightbox = document.getElementById('lightbox');
  const lbImg    = document.getElementById('lb-img');
  const lbClose  = document.getElementById('lb-close');
  function openLB(src) { lbImg.src = src; lightbox.classList.add('open'); }
  function closeLB() {
    lightbox.classList.remove('open');
    lightbox.style.display = 'none';
  }
  lbClose.addEventListener('click', closeLB);
  lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLB(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      closeLB();
      if (document.getElementById('text-modal').classList.contains('open'))
        document.getElementById('text-modal').classList.remove('open');
    }
  });
