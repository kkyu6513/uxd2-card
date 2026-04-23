  /* ── 팀 배포 파일 생성 ── */
  document.getElementById('sb-deploy-btn').addEventListener('click', () => {
    const url = localStorage.getItem('sb_url') || _SB_URL;
    const key = localStorage.getItem('sb_key') || _SB_KEY;
    if (!url || !key) { showToast('먼저 설정을 저장해주세요'); return; }

    document.getElementById('sb-modal').classList.remove('open');
    document.getElementById('sb-test-result').style.display = 'none';
    document.getElementById('link-modal').classList.remove('open');
    document.getElementById('toast').classList.remove('show');
    document.getElementById('toast').textContent = '';

    let src = document.documentElement.outerHTML;
    src = src.replace(/const _SB_URL = '[^']*'/, `const _SB_URL = '${url}'`);
    src = src.replace(/const _SB_KEY = '[^']*'/, `const _SB_KEY = '${key}'`);
    src = src.replace(/(<meta id="__card-snap__" data-snap=")[^"]*(")/,  '$1$2');
    src = src.replace(
      '</style>',
      '#cfg-btn, #clear-btn, #save-btn { display:none !important; }\n  </style>'
    );

    const fname = 'UXD2_AI활동기록카드.html';
    const blob = new Blob([src], { type: 'text/html;charset=utf-8' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = fname; a.click();
    showToast('팀 배포 파일 생성 완료 ✓');
  });

  /* ── SHARE LINK ── */
  async function shareLink({ showModal = true } = {}) {
    // 뷰어 모드: 현재 URL을 그대로 공유 (이미 해시에 카드 ID가 포함되어 있음)
    if (_isViewerMode) {
      const currentUrl = location.href;
      try { await navigator.clipboard.writeText(currentUrl); } catch {}
      if (showModal) showLinkModal(currentUrl, '');
      else showToast('링크 복사 완료 ✓');
      return currentUrl;
    }
    const snap = collectSnapData();
    const btn   = document.getElementById('share-link-btn');
    if (btn)   { btn.disabled = true;  btn.textContent = '생성 중...'; }
    showToast('링크 생성 중...');
    try {
      const id  = await sbUpload(snap);
      const url = `${location.origin}${location.pathname}#${id}`;
      try { await navigator.clipboard.writeText(url); } catch {}
      if (showModal) showLinkModal(url, '');
      else showToast('링크 복사 완료 ✓');
      return url;
    } catch(e) {
      showToast('링크 생성 실패: ' + e.message);
      if (e.message.includes('설정')) openSbModal();
      return null;
    } finally {
      if (btn)   { btn.disabled = false; btn.textContent = '🔗 링크 공유'; }
    }
  }

