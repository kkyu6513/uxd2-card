  /* ── ⚙ SUPABASE 설정 모달 ── */
  document.getElementById('cfg-btn')?.addEventListener('click', () => {
    const modal = document.getElementById('sb-modal');
    const dot   = document.getElementById('sb-status-dot');
    const txt   = document.getElementById('sb-status-txt');
    const urlEl = document.getElementById('sb-url-input');
    const keyEl = document.getElementById('sb-key-input');
    const url   = localStorage.getItem('sb_url') || _SB_URL;
    const key   = localStorage.getItem('sb_key') || _SB_KEY;
    if (urlEl) urlEl.value = url || '';
    if (keyEl) keyEl.value = key || '';
    // Anthropic Key 로드
    const anthropicKeyEl = document.getElementById('anthropic-key-input');
    if (anthropicKeyEl) anthropicKeyEl.value = localStorage.getItem('anthropic_key') || '';
    const hasAnthropicKey = !!localStorage.getItem('anthropic_key');
    const hasSbConfig = !!(url && key);
    if (dot) dot.className = 'sb-status-dot' + (hasSbConfig ? ' ok' : '');
    if (txt) {
      const parts = [];
      if (hasSbConfig) parts.push('Supabase ✓');
      else parts.push('Supabase 미설정');
      if (hasAnthropicKey) parts.push('Gemini ✓');
      else parts.push('Gemini Key 미입력');
      txt.textContent = parts.join('  |  ');
    }
    if (modal) modal.classList.add('open');
  });

  document.getElementById('sb-modal-close')?.addEventListener('click', () => {
    document.getElementById('sb-modal')?.classList.remove('open');
  });

  document.getElementById('sb-modal')?.addEventListener('click', e => {
    if (e.target === document.getElementById('sb-modal'))
      document.getElementById('sb-modal').classList.remove('open');
  });

  document.getElementById('sb-test-btn')?.addEventListener('click', async () => {
    const url = document.getElementById('sb-url-input')?.value.trim();
    const key = document.getElementById('sb-key-input')?.value.trim();
    const resultEl = document.getElementById('sb-test-result');
    const btn = document.getElementById('sb-test-btn');
    if (!url || !key) { showToast('URL과 Key를 모두 입력해주세요'); return; }
    btn.disabled = true; btn.textContent = '테스트 중...';
    if (resultEl) resultEl.style.display = 'none';
    try {
      const r = await fetch(`${url}/rest/v1/cards?limit=1`, {
        headers: { apikey: key, Authorization: `Bearer ${key}` }
      });
      const ok = r.ok || r.status === 200;
      if (resultEl) {
        resultEl.style.display = 'block';
        resultEl.style.color = ok ? '#4caf50' : '#e53935';
        resultEl.textContent = ok ? '✅ 연결 성공! Supabase와 정상 연결됩니다.' : `❌ 연결 실패 (${r.status})`;
      }
      const dot = document.getElementById('sb-status-dot');
      const txt = document.getElementById('sb-status-txt');
      if (dot) dot.className = 'sb-status-dot' + (ok ? ' ok' : ' err');
      if (txt) txt.textContent = ok ? '연결 테스트 성공' : '연결 실패 — URL과 Key를 확인해주세요';
    } catch(e) {
      if (resultEl) {
        resultEl.style.display = 'block';
        resultEl.style.color = '#e53935';
        resultEl.textContent = '❌ 연결 오류: ' + e.message;
      }
    } finally {
      btn.disabled = false; btn.textContent = '🔍 연결 테스트';
    }
  });

  document.getElementById('sb-save-btn')?.addEventListener('click', () => {
    const url = document.getElementById('sb-url-input')?.value.trim();
    const key = document.getElementById('sb-key-input')?.value.trim();
    if (!url || !key) { showToast('URL과 Key를 모두 입력해주세요'); return; }
    localStorage.setItem('sb_url', url);
    localStorage.setItem('sb_key', key);
    // Anthropic Key 저장
    const anthropicKey = document.getElementById('anthropic-key-input')?.value.trim();
    if (anthropicKey) localStorage.setItem('anthropic_key', anthropicKey);
    else localStorage.removeItem('anthropic_key');
    const dot = document.getElementById('sb-status-dot');
    const txt = document.getElementById('sb-status-txt');
    if (dot) dot.className = 'sb-status-dot ok';
    if (txt) txt.textContent = '설정 저장 완료 ✓';
    showToast('설정 저장 완료 ✓');
    setTimeout(() => document.getElementById('sb-modal')?.classList.remove('open'), 800);
  });

  document.getElementById('share-link-btn').addEventListener('click', () => {
    const name = document.getElementById('edited-name')?.innerText.trim();
    if (!name) {
      alert('Edited by 이름을 입력해주세요.');
      document.getElementById('edited-name')?.focus();
      return;
    }
    shareLink({ showModal: true });
  });
