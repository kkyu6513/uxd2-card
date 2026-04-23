  /* ── MULTI IMAGE ── */
  const imgInput    = document.getElementById('img-input');
  const imgZoneEl   = document.getElementById('img-zone');
  const imgGridWrap = document.getElementById('img-grid-wrap');
  const imgGridEl   = document.getElementById('img-grid');
  const imgCountEl  = document.getElementById('img-count');
  const imgMoreEl   = document.getElementById('img-more');
  let images = [];
  // 뷰어 모드 — syncImageUI() 호출 전에 outerHTML의 이미지를 미리 복원
  (function() {
    const existingImgs = document.querySelectorAll('#img-grid .img-thumb img');
    if (existingImgs.length > 0) {
      images = Array.from(existingImgs).map(img => ({ src: img.src, name: img.alt || 'image' }));
    }
  })();

  function syncImageUI() {
    imgCountEl.textContent = images.length ? `(${images.length}개)` : '';
    if (images.length === 0) {
      imgZoneEl.style.display  = '';
      imgGridWrap.style.display = 'none';
    } else {
      imgZoneEl.style.display  = 'none';
      imgGridWrap.style.display = '';
    }
    imgGridEl.innerHTML = '';
    images.forEach((img, i) => {
      const wrap = document.createElement('div');
      wrap.className = 'img-thumb';

      // 이미지 래퍼
      const imgWrap = document.createElement('div');
      imgWrap.className = 'img-thumb-img-wrap';

      const im = document.createElement('img');
      im.src = img.src;
      im.alt = img.name;
      im.style.cursor = 'zoom-in';
      im.addEventListener('click', e => {
        e.stopPropagation();
        e.preventDefault();
        const lb = document.getElementById('lightbox');
        const lbI = document.getElementById('lb-img');
        lbI.src = img.src;
        lb.style.display = 'flex';
        lb.classList.add('open');
      });

      const del = document.createElement('button');
      del.className = 'thumb-del';
      del.innerHTML = '&#x2715;';
      del.title = '삭제';
      del.addEventListener('click', e => {
        e.stopPropagation();
        images.splice(i, 1);
        syncImageUI();
      });

      imgWrap.append(im, del);

      // 캡션 입력
      const caption = document.createElement('textarea');
      caption.className = 'img-caption';
      caption.placeholder = '캡션 입력 (예: WBS 1차 결과 / 만족도 70%)';
      caption.rows = 2;
      caption.value = img.caption || '';
      caption.addEventListener('input', () => {
        images[i].caption = caption.value;
      });

      wrap.append(imgWrap, caption);
      imgGridEl.appendChild(wrap);
    });
  }

  // 이미지 압축 (max 900px, JPEG 0.65) — URL 해시 크기 최소화
  function compressImage(dataUrl) {
    return new Promise(resolve => {
      const img = new Image();
      img.onload = () => {
        const MAX = 900;
        const ratio = Math.min(MAX / img.width, MAX / img.height, 1);
        const w = Math.round(img.width * ratio);
        const h = Math.round(img.height * ratio);
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', 0.65));
      };
      img.onerror = () => resolve(dataUrl); // 압축 실패 시 원본 사용
      img.src = dataUrl;
    });
  }

  function loadFiles(fileList) {
    Array.from(fileList).forEach(file => {
      if (!file.type.startsWith('image/')) return;
      const r = new FileReader();
      r.onload = async ev => {
        const compressed = await compressImage(ev.target.result);
        images.push({ src: compressed, name: file.name, caption: '' });
        syncImageUI();
      };
      r.readAsDataURL(file);
    });
  }

  // file input change
  imgInput.addEventListener('change', e => { loadFiles(e.target.files); imgInput.value = ''; });

  // 드롭존 클릭
  imgZoneEl.addEventListener('click', () => imgInput.click());
  imgMoreEl.addEventListener('click', () => imgInput.click());

  // 드래그앤드롭 — 드롭존
  imgZoneEl.addEventListener('dragover',  e => { e.preventDefault(); imgZoneEl.classList.add('drag-over'); });
  imgZoneEl.addEventListener('dragleave', () => imgZoneEl.classList.remove('drag-over'));
  imgZoneEl.addEventListener('drop', e => {
    e.preventDefault(); imgZoneEl.classList.remove('drag-over');
    loadFiles(e.dataTransfer.files);
  });

  // 드래그앤드롭 — 그리드(추가 모드)
  imgGridWrap.addEventListener('dragover',  e => { e.preventDefault(); imgMoreEl.style.borderColor = '#555'; });
  imgGridWrap.addEventListener('dragleave', () => { imgMoreEl.style.borderColor = ''; });
  imgGridWrap.addEventListener('drop', e => {
    e.preventDefault(); imgMoreEl.style.borderColor = '';
    loadFiles(e.dataTransfer.files);
  });

  syncImageUI();

  /* ── AUTO RESIZE TEXTAREA ── */
  document.querySelectorAll('textarea').forEach(ta => {
    ta.addEventListener('input', function() {
      this.style.height = 'auto';
      this.style.height = this.scrollHeight + 'px';
    });
  });
