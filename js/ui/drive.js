  /* -- 드라이브 링크 미리보기 -- */
  const DRIVE_ROOT = 'https://drive.google.com/drive/folders/0AHMKavhEL0eeUk9PVA';

  function getDriveUrl(val) {
    if (!val) return '';
    return val.startsWith('http') ? val : '';
  }

  /* ── 드라이브 링크 등록 모달 ── */
  let _driveModalTarget = null; // 현재 편집 중인 key (material/mid/final/prompt)
  const DRIVE_LABELS = { material: '소스', mid: '중간 결과', final: '최종 결과', prompt: '프롬프트' };

  function openDriveModal(key) {
    _driveModalTarget = key;
    document.getElementById('drive-modal-title').textContent = DRIVE_LABELS[key] + (_isViewerMode ? ' 링크 보기' : ' 링크 등록');
    document.getElementById('drive-modal-url-input').value     = document.getElementById('drive-' + key)?.value || '';
    document.getElementById('drive-modal-name-input').value    = document.getElementById('drive-' + key + '-name')?.value || '';
    document.getElementById('drive-modal-process-input').value = document.getElementById('drive-' + key + '-process')?.value || '';
    // 뷰어 모드 버튼 전환
    const cancelBtn  = document.getElementById('drive-modal-cancel-btn');
    const saveBtn    = document.getElementById('drive-modal-save-btn');
    const confirmBtn = document.getElementById('drive-modal-confirm-btn');
    if (cancelBtn)  cancelBtn.style.display  = _isViewerMode ? 'none' : '';
    if (saveBtn)    saveBtn.style.display    = _isViewerMode ? 'none' : '';
    if (confirmBtn) confirmBtn.style.display = _isViewerMode ? '' : 'none';
    // 뷰어 모드 입력 필드 비활성화
    const urlInput     = document.getElementById('drive-modal-url-input');
    const nameInput    = document.getElementById('drive-modal-name-input');
    const processInput = document.getElementById('drive-modal-process-input');
    if (urlInput)     urlInput.readOnly     = _isViewerMode;
    if (nameInput)    nameInput.readOnly    = _isViewerMode;
    if (processInput) processInput.disabled = _isViewerMode;
    const overlay = document.getElementById('drive-modal-overlay');
    overlay.style.display = 'flex';
    setTimeout(() => {
      overlay.scrollIntoView({ behavior: 'smooth', block: 'center' });
      if (!_isViewerMode) document.getElementById('drive-modal-name-input')?.focus();
    }, 50);
  }

  function closeDriveModal(e) {
    if (e && e.target !== document.getElementById('drive-modal-overlay')) return;
    document.getElementById('drive-modal-overlay').style.display = 'none';
    _driveModalTarget = null;
  }

  function saveDriveModal() {
    const key     = _driveModalTarget;
    const url     = document.getElementById('drive-modal-url-input').value.trim();
    const name    = document.getElementById('drive-modal-name-input').value.trim();
    const process = document.getElementById('drive-modal-process-input').value;
    if (!url) { document.getElementById('drive-modal-url-input').focus(); return; }

    // hidden 필드에 저장
    document.getElementById('drive-' + key).value             = url;
    document.getElementById('drive-' + key + '-name').value   = name;
    document.getElementById('drive-' + key + '-process').value = process;

    // 등록 완료 UI 업데이트
    updateDriveRow(key);
    document.getElementById('drive-modal-overlay').style.display = 'none';
    _driveModalTarget = null;
  }

  function updateDriveRow(key) {
    const url     = document.getElementById('drive-' + key)?.value || '';
    const name    = document.getElementById('drive-' + key + '-name')?.value || '';
    const process = document.getElementById('drive-' + key + '-process')?.value || '';

    const linkEl    = document.getElementById('drive-reg-link-' + key);
    const emptyEl   = document.getElementById('dt-empty-' + key);
    const processEl = document.getElementById('drive-reg-process-' + key);
    const regBtn    = document.getElementById('drive-reg-btn-' + key);
    const editBtn   = document.getElementById('drive-reg-edit-' + key);

    if (!url) {
      if (_isViewerMode) {
        // 뷰어 모드: 등록 버튼 숨기고 빈 값 표시
        if (linkEl)    { linkEl.style.display = 'none'; }
        if (emptyEl)   {
          emptyEl.style.color = '#e53935'; emptyEl.style.fontStyle = 'italic'; emptyEl.style.fontSize = '12px';
          emptyEl.textContent = '사용자가 입력하지 않음'; emptyEl.style.display = '';
          emptyEl.style.cursor = 'pointer'; emptyEl.title = '클릭하여 등록';
          emptyEl.onclick = () => openDriveModal(key);
        }
        if (processEl) { processEl.textContent = '사용자 미선택'; processEl.style.color = '#e53935'; processEl.style.fontStyle = 'italic'; processEl.style.fontSize = '12px'; processEl.style.display = ''; }
        if (regBtn)    regBtn.style.display = 'none';
        if (editBtn)   editBtn.style.display = 'none';
      } else {
        if (linkEl)    { linkEl.style.display = 'none'; linkEl.href = '#'; linkEl.textContent = ''; }
        if (emptyEl)   { emptyEl.style.color = ''; emptyEl.style.fontStyle = ''; emptyEl.textContent = '—'; emptyEl.style.display = ''; }
        if (processEl) processEl.textContent = '';
        if (regBtn)    regBtn.style.display = '';
        if (editBtn)   editBtn.style.display = 'none';
      }
      return;
    }
    // url 있을 때
    if (linkEl)    {
      linkEl.href = url; linkEl.textContent = name || url; linkEl.style.display = '';
    }
    // 뷰어 모드에서 타이틀 셀 클릭 시 수정 모달 호출
    if (linkEl) {
      linkEl.onclick = (e) => { e.preventDefault(); openDriveModal(key); };
      linkEl.title = '클릭하여 수정';
      linkEl.style.cursor = 'pointer';
    }
    if (emptyEl)   emptyEl.style.display = 'none';
    if (processEl) {
      processEl.textContent = process || (_isViewerMode ? '사용자 미선택' : '');
      processEl.style.color = (!process && _isViewerMode) ? '#e53935' : '';
      processEl.style.fontStyle = (!process && _isViewerMode) ? 'italic' : '';
      processEl.style.fontSize = (!process && _isViewerMode) ? '12px' : '';
      processEl.style.display = '';
    }
    if (regBtn)    regBtn.style.display = 'none';
    if (editBtn)   editBtn.style.display = _isViewerMode ? 'none' : '';
  }

  // 엔터키로 저장
  document.getElementById('drive-modal-overlay')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') saveDriveModal();
    if (e.key === 'Escape') { document.getElementById('drive-modal-overlay').style.display = 'none'; _driveModalTarget = null; }
  });

  renderTools();
  renderWorkflow();
