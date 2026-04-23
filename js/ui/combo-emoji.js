(function() {

  function initCombo(inputId, dropdownId, options) {
    const input = document.getElementById(inputId);
    const dropdown = document.getElementById(dropdownId);
    if (!input || !dropdown) return;
    dropdown.innerHTML = ''; // 중복 방지: 기존 내용 초기화

    const directMap = { 'goal-input-text': 'goal-direct', 'problem-input': 'problem-direct' };
    const directId = directMap[inputId];
    const directEl = directId ? document.getElementById(directId) : null;

    // 직접 작성하기
    const directOpt = document.createElement('div');
    directOpt.className = 'combo-option combo-direct-item';
    directOpt.style.paddingLeft = '14px';
    directOpt.style.fontWeight = '600';
    directOpt.style.color = '#3a78d4';
    directOpt.style.borderBottom = '1px solid #eee';
    directOpt.textContent = '✏️ 직접 작성하기';
    directOpt.addEventListener('mousedown', (e) => {
      e.preventDefault();
      input.value = '';
      input.placeholder = '항목을 선택했습니다 (아래에 직접 작성)';
      input.dataset.direct = 'true';
      dropdown.classList.remove('open');
      if (directEl) { directEl.style.display = 'block'; directEl.focus(); }
    });
    dropdown.appendChild(directOpt);

    // 그룹별 아코디언 렌더링
    let currentItemsContainer = null;

    options.forEach((item) => {
      if (item.group) {
        const groupEl = document.createElement('div');
        groupEl.className = 'combo-group';

        const hd = document.createElement('div');
        hd.className = 'combo-group-header';
        hd.textContent = item.group;

        const itemsEl = document.createElement('div');
        itemsEl.className = 'combo-group-items';

        hd.addEventListener('mousedown', (e) => {
          e.preventDefault();
          e.stopPropagation();
          hd.classList.toggle('open');
          itemsEl.classList.toggle('open');
        });

        groupEl.append(hd, itemsEl);
        dropdown.appendChild(groupEl);
        currentItemsContainer = itemsEl;
      } else if (currentItemsContainer) {
        const div = document.createElement('div');
        div.className = 'combo-option';
        div.textContent = item.label;
        div.addEventListener('mousedown', (e) => {
          e.preventDefault();
          input.value = item.label;
          input.dataset.direct = '';
          input.placeholder = inputId === 'goal-input-text' ? '🎯 목표 선택 또는 직접 입력' : '⚡ 문제 선택 또는 직접 입력';
          dropdown.classList.remove('open');
          if (directEl) directEl.style.display = 'none';
        });
        currentItemsContainer.appendChild(div);
      }
    });

    // 포커스 시 드롭다운 열기
    input.addEventListener('focus', () => {
      const guide = document.getElementById('gp-guide');
      if (guide) guide.style.display = 'block';
      filterCombo(input, dropdown);
      dropdown.classList.add('open');
    });

    // 드롭다운 내부 클릭 시 포커스 유지 (blur 방지)
    dropdown.addEventListener('mousedown', (e) => {
      e.preventDefault();
    });

    // 타이핑 시 필터링
    input.addEventListener('input', () => {
      if (input.dataset.direct === 'true') return;
      filterCombo(input, dropdown);
      dropdown.classList.add('open');
    });

    // 포커스 아웃 시 닫기
    input.addEventListener('blur', () => {
      setTimeout(() => dropdown.classList.remove('open'), 200);
    });
  }

  function filterCombo(input, dropdown) {
    const q = input.value.trim().toLowerCase();
    // 검색어 없으면 모든 옵션 표시, 그룹 접힌 상태 유지
    if (!q) {
      dropdown.querySelectorAll('.combo-option').forEach(opt => opt.classList.remove('hidden'));
      dropdown.querySelectorAll('.combo-group').forEach(g => g.style.display = '');
      return;
    }
    // 검색어 있으면 필터링 + 매칭 그룹 자동 펼침
    dropdown.querySelectorAll('.combo-group').forEach(group => {
      const header = group.querySelector('.combo-group-header');
      const items = group.querySelector('.combo-group-items');
      let hasVisible = false;
      group.querySelectorAll('.combo-option').forEach(opt => {
        const match = opt.textContent.toLowerCase().includes(q);
        opt.classList.toggle('hidden', !match);
        if (match) hasVisible = true;
      });
      group.style.display = hasVisible ? '' : 'none';
      if (hasVisible && items) { items.classList.add('open'); header?.classList.add('open'); }
    });
  }

  initCombo('goal-input-text', 'goal-dropdown', GOAL_OPTIONS);
  initCombo('problem-input', 'problem-dropdown', PROBLEM_OPTIONS);

  // 전역 노출 — AI 자동 채우기에서 접근 가능하도록
  window._GOAL_OPTIONS    = GOAL_OPTIONS;
  window._PROBLEM_OPTIONS = PROBLEM_OPTIONS;

    const CATS = [
      // 🎯 활동·목표·도구 (65개)
      ['🎯','🚀','💡','🔥','⚡','🌟','🏆','🎪','🧩','🔬','🎨','🛠','📐','🌱','💎','🦋','🎭','🧭','🔑','🌊','🏔','🎶','📡','🤖','🧲','🔭','⚗️','🧬','⚙️','🔮','🧱','🏗','🎓','🏅','🥇','🥈','🥉','🏁','🎖','📦','🧰','🪛','🔧','🔩','⛏','🪚','🗜','🧪','🔎','🔍','💻','🖥','⌨️','🖱','🖨','📱','📲','🔋','💾','💿','📀','🧮','🪄','🎲','♟️'],
      // 😊 감정·사람·제스처 (65개)
      ['😊','😎','🤩','🥳','😤','🤔','🧠','👊','✊','🙌','👏','💪','🫶','👁','🫀','🫁','👀','🤝','🙏','👆','☝️','🫵','🎉','🎊','💯','✨','🌈','❤️','🔴','🟠','🟡','🟢','😃','😁','😆','😅','🤣','🥰','😍','🤗','🤭','🤫','🤥','😶','😑','😬','🙄','😏','😌','😴','🤯','🥵','🥶','😱','😨','😰','😥','🫡','🫠','🤓','🥸','🤠','👋','🖐','✋','🤚','🤙'],
      // 🐱 동물 (65개)
      ['🐉','🦁','🦊','🐺','🦅','🐬','🐯','🦋','🦎','🦑','🦈','🦏','🐘','🦒','🦓','🦬','🐂','🐎','🦌','🦫','🦦','🦥','🐻','🦔','🐧','🦆','🦉','🦚','🦜','🐠','🐙','🦀','🐱','🐶','🐭','🐹','🐰','🐸','🐵','🐔','🐧','🐦','🐤','🦇','🐺','🐗','🐴','🦄','🐝','🪲','🐛','🦗','🕷','🦂','🐢','🐍','🦖','🦕','🐊','🐋','🐳','🐟','🐡','🦐','🦞'],
      // 🌿 자연·식물·장소 (65개)
      ['🌿','🌲','🌳','🌴','🌵','🌾','🍀','🌺','🌸','🌼','🌻','🌹','🍁','🍂','🍃','☘️','🌱','🎋','🎍','🍄','🌊','🏔','🌋','🏜','🏕','⛰️','🗻','🌄','🌅','🌇','🏠','🏢','🏗','🏭','🏫','🏛','⛪','🕌','🗽','🗼','🌉','🎢','🎡','🎠','⛲','🏖','🏝','🌎','🌍','🌏','🗺','🧭','🏞','🌐','🛣','🛤','✈️','🚀','🛸','🚁','🛳','🚂','🚌','🚗','🚲'],
      // ⚡ 날씨·자연현상·기호 (65개)
      ['⚡','🔥','💧','🌪','❄️','🌊','☄️','🌙','☀️','🌤','⛅','🌦','🌧','⛈','🌩','🌨','🌬','🌫','🌈','🌂','☂️','⛱','💥','🌟','✨','💫','⭐','🌠','🎇','🎆','🌌','♻️','⚠️','🚫','⭕','❌','❓','❗','✅','☑️','➕','➖','➗','✖️','💲','💱','©️','®️','™️','🔰','♾️','🔄','🔃','🔀','🔁','🔂','▶️','⏸','⏹','⏺','⏩','⏪','⏫','⏬','🔼'],
      // 💡 사무·문서·비즈니스 (65개)
      ['💡','📌','📍','🗺','🧭','📊','📈','📉','🗒','📋','📁','🗂','📂','📅','📆','🗓','📇','📒','📓','📔','📕','📗','📘','📙','📚','📖','🔖','🏷','💰','💳','🔐','🔒','✏️','📝','🖊','🖋','✒️','📎','🖇','📏','📐','✂️','🗃','🗄','🗑','📤','📥','📧','📨','📩','📬','📮','🏧','💹','🪪','🎫','🎟','🧾','💼','📰','🗞','📑','🔏','🔓','📣'],
    ];

    // 검색 키워드 매핑
    const EMOJI_KEYWORDS = {
      '🎯':'목표 타겟 target', '🚀':'로켓 시작 launch', '💡':'아이디어 전구 idea', '🔥':'불 열정 fire hot', '⚡':'번개 빠른 전기 fast',
      '🌟':'별 스타 star', '🏆':'트로피 우승 trophy', '🧩':'퍼즐 puzzle', '🔬':'현미경 연구 research', '🎨':'팔레트 디자인 art design',
      '🛠':'도구 공구 tool', '📐':'설계 자 ruler', '🌱':'새싹 성장 growth', '💎':'다이아 보석 diamond', '🧭':'나침반 방향 compass',
      '🔑':'열쇠 key', '🤖':'로봇 AI robot', '⚙️':'톱니 설정 gear setting', '🏗':'건설 build', '🧬':'DNA 유전자',
      '🎓':'졸업 교육 education', '🏅':'메달 medal', '🏁':'체크 깃발 flag finish', '📦':'상자 패키지 package box', '🧰':'공구함 toolkit',
      '💻':'노트북 컴퓨터 laptop computer', '🖥':'모니터 desktop', '📱':'스마트폰 mobile phone', '🔋':'배터리 battery', '💾':'저장 save floppy',
      '🧮':'주판 계산 calculate', '🪄':'마법 magic wand', '🎲':'주사위 랜덤 dice random', '🔎':'돋보기 검색 search magnify',
      '😊':'웃음 행복 smile happy', '😎':'멋진 cool', '🤩':'감동 amazing', '🤔':'생각 고민 think', '🧠':'뇌 두뇌 brain',
      '💪':'힘 강한 strong', '🤝':'협력 악수 handshake', '🙏':'감사 기도 pray thanks', '🎉':'축하 party', '✨':'반짝 sparkle',
      '❤️':'하트 사랑 heart love', '💯':'백점 완벽 perfect', '🌈':'무지개 rainbow',
      '😃':'기쁨 joy', '🥰':'사랑스러움 lovely', '🤗':'포옹 hug', '🤫':'비밀 secret', '🤯':'충격 mind blown',
      '😱':'놀람 shocked', '🫡':'경례 salute', '🤓':'공부 nerd', '🤠':'카우보이 cowboy', '👋':'인사 wave hello',
      '🦁':'사자 lion', '🦊':'여우 fox', '🐺':'늑대 wolf', '🦅':'독수리 eagle', '🐬':'돌고래 dolphin',
      '🐱':'고양이 cat', '🐶':'강아지 dog', '🐰':'토끼 rabbit', '🐸':'개구리 frog', '🦄':'유니콘 unicorn',
      '🐝':'벌 꿀벌 bee', '🐢':'거북이 turtle', '🐍':'뱀 snake', '🦖':'공룡 dinosaur', '🐋':'고래 whale',
      '🌿':'잎 자연 leaf nature', '🌸':'벚꽃 cherry', '🌹':'장미 rose', '🍀':'클로버 행운 luck clover',
      '🏠':'집 house home', '🏢':'빌딩 건물 office building', '🏫':'학교 school', '🏛':'국회 정부 government',
      '🌎':'지구 세계 earth world', '✈️':'비행기 airplane travel', '🚗':'자동차 car', '🚲':'자전거 bicycle',
      '☀️':'해 태양 sun', '🌙':'달 moon', '❄️':'눈 snow', '💧':'물 water',
      '♻️':'재활용 recycle', '⚠️':'경고 warning', '✅':'확인 완료 check done', '❌':'취소 삭제 cancel delete',
      '❓':'질문 물음표 question', '❗':'느낌표 중요 important', '🔄':'반복 새로고침 refresh repeat',
      '📊':'차트 그래프 chart', '📈':'상승 증가 up', '📉':'하락 감소 down', '📋':'클립보드 목록 clipboard list',
      '📁':'폴더 folder', '📅':'달력 calendar', '📚':'책 book', '💰':'돈 money', '🔒':'잠금 보안 lock security',
      '✏️':'연필 pencil write', '📝':'메모 노트 memo note', '📎':'클립 clip attach', '✂️':'가위 scissors cut',
      '📧':'이메일 email', '💼':'서류가방 briefcase business', '📰':'뉴스 신문 news', '📣':'확성기 megaphone announce',
      '🧾':'영수증 receipt', '🎫':'티켓 ticket', '🪪':'신분증 ID card',
    };

    let currentCat = 0;
    const btn     = document.getElementById('emoji-btn');
    const picker  = document.getElementById('emoji-picker');
    const grid    = document.getElementById('ep-grid');
    const tabs    = document.querySelectorAll('.ep-tab');
    const searchInput = document.getElementById('ep-search');
    if (!btn || !picker || !grid) return;

    function renderGrid(emojis) {
      grid.innerHTML = '';
      emojis.forEach(e => {
        const b = document.createElement('button');
        b.type = 'button'; b.textContent = e;
        b.addEventListener('click', ev => {
          ev.stopPropagation();
          btn.textContent = e;
          btn.classList.remove('placeholder');
          picker.classList.remove('open');
          if (searchInput) searchInput.value = '';
        });
        grid.appendChild(b);
      });
    }

    function renderCat(cat) {
      renderGrid(CATS[cat]);
    }

    function searchEmojis(query) {
      if (!query) { renderCat(currentCat); return; }
      const q = query.toLowerCase();
      const all = CATS.flat();
      const filtered = all.filter(e => {
        if (e.includes(q)) return true;
        const kw = EMOJI_KEYWORDS[e];
        return kw && kw.toLowerCase().includes(q);
      });
      renderGrid(filtered.length ? filtered : all);
    }

    renderCat(0);
    btn.classList.add('placeholder');

    tabs.forEach(tab => {
      tab.addEventListener('click', e => {
        e.stopPropagation();
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        currentCat = +tab.dataset.cat;
        if (searchInput) searchInput.value = '';
        renderCat(currentCat);
      });
    });

    // 검색 입력
    if (searchInput) {
      searchInput.addEventListener('input', () => searchEmojis(searchInput.value.trim()));
      searchInput.addEventListener('click', e => e.stopPropagation());
    }

    btn.addEventListener('click', e => {
      e.stopPropagation();
      picker.classList.toggle('open');
      if (picker.classList.contains('open') && searchInput) {
        setTimeout(() => searchInput.focus(), 50);
      }
    });

    document.addEventListener('click', () => picker.classList.remove('open'));
})();