  /* ── GOOD / BAD POINT 드롭다운 셀렉터 ── */
  const GOOD_GROUPS = [
    { title: '생산성 향상', items: [
      '반복 작업 시간이 대폭 단축되었다',
      '초안 작성 생산성이 크게 향상되었다',
      '프로토타입 제작 속도가 빨라졌다',
      '회의록/보고서 정리가 자동화되었다',
      '새로운 도구의 학습 곡선이 줄었다',
      '수작업 대비 처리량이 크게 늘어났다',
      '템플릿 기반 문서 생성이 빨라졌다',
      '반복 업무를 자동화하여 핵심 업무에 집중할 수 있었다',
      '병렬 작업이 가능해져 일정이 단축되었다',
      '검색·수집에 소요되는 시간이 줄었다',
    ]},
    { title: '품질 개선', items: [
      '프롬프트 개선으로 결과 품질이 높아졌다',
      '문서 표준화와 일관성을 확보했다',
      '기존 방식 대비 완성도가 향상되었다',
      '커뮤니케이션 자료 품질이 개선되었다',
      '반복 검증으로 오류를 줄일 수 있었다',
      '맞춤법·문법 오류가 자동 교정되었다',
      '논리적 구조의 글을 빠르게 작성할 수 있었다',
      '다국어 번역 품질이 향상되었다',
      '산출물의 전문성이 높아졌다',
      '이전 결과물 대비 피드백이 긍정적이었다',
    ]},
    { title: '분석·리서치', items: [
      '다양한 관점/대안을 빠르게 확보했다',
      '데이터 분석 속도가 향상되었다',
      '리서치 범위를 넓힐 수 있었다',
      '벤치마크 자료 수집이 효율적이었다',
      '데이터 시각화 작업 효율이 증가했다',
      '대량 데이터에서 패턴을 빠르게 발견했다',
      '경쟁사·트렌드 분석이 체계적으로 정리되었다',
      '정성 데이터를 정량적으로 분류할 수 있었다',
      '사용자 피드백을 효율적으로 코딩·분류했다',
      'VOC 데이터에서 핵심 인사이트를 도출했다',
    ]},
    { title: '기획·설계', items: [
      '복잡한 정보를 체계적으로 구조화할 수 있었다',
      '아이디어 발산 단계에서 효과적이었다',
      '사용자 시나리오를 다양하게 도출했다',
      '복잡한 요구사항 정리에 유용했다',
      '팀 내 지식 공유에 도움이 되었다',
      'IA/플로우차트 초안을 빠르게 작성했다',
      '기능 명세서 작성 시간이 단축되었다',
      '페르소나 설정이 구체화되었다',
      '디자인 시스템 정리에 활용할 수 있었다',
      'PRD/기획서 초안 작성이 수월해졌다',
    ]},
  ];
  const BAD_GROUPS = [
    { title: '품질 문제', items: [
      'AI 결과물에서 사실 오류가 발견되었다',
      '기대 대비 결과물 품질이 미달이었다',
      '편향된 관점의 결과물이 생성되었다',
      '출력 형식이 요청과 맞지 않았다',
      '기존 작업물과 톤앤매너가 일치하지 않았다',
      '같은 프롬프트인데 매번 다른 결과가 나왔다',
      '출처·근거가 불분명한 내용이 포함되었다',
      '핵심 요점이 누락되거나 엉뚱한 방향으로 생성되었다',
      '한국어 표현이 부자연스러운 부분이 있었다',
      '숫자·통계 데이터의 정확성이 떨어졌다',
    ]},
    { title: '효율 저하', items: [
      '맥락 이해 부족으로 재작업이 발생했다',
      '프롬프트 작성 자체에 시간이 많이 소요되었다',
      '반복 수정에도 원하는 결과에 도달하지 못했다',
      '최신/실시간 데이터 반영이 불가했다',
      '학습에 투입한 시간 대비 효과가 불확실했다',
      '결과물 검증에 오히려 더 많은 시간이 들었다',
      '도구 전환 과정에서 작업 흐름이 끊겼다',
      'AI 없이 직접 했으면 더 빨랐을 것 같다',
      '입력 데이터 정리에 예상보다 시간이 소요되었다',
      '여러 도구를 병행하면서 혼란이 생겼다',
    ]},
    { title: '기술적 한계', items: [
      '도메인 전문 용어 처리가 미흡했다',
      '창의적/감성적 결과물에 한계가 있었다',
      '긴 문서 처리 시 내용 누락이 발생했다',
      '복잡한 로직이나 조건 처리에 한계가 있었다',
      'UX 맥락이나 뉘앙스를 이해하지 못했다',
      '이미지·시각 자료 생성 품질이 부족했다',
      '컨텍스트 길이 제한으로 작업이 분할되었다',
      '표·차트 등 정형 데이터 처리가 미흡했다',
      '멀티모달 작업 간 연계가 매끄럽지 않았다',
      '코드 생성 시 디버깅에 추가 시간이 필요했다',
    ]},
    { title: '운영·리스크', items: [
      '데이터 보안/민감정보 처리가 우려되었다',
      'AI 의존도가 높아지는 것이 걱정된다',
      '검증 없이 사용할 경우 오류가 전파될 수 있다',
      '팀원 간 AI 활용 수준 편차가 있다',
      '도구 간 결과물 호환성에 문제가 있었다',
      'AI 사용 기준·가이드라인이 불명확하다',
      '저작권·라이선스 관련 리스크가 우려된다',
      '비용 대비 효과를 측정하기 어렵다',
      '장애·서비스 중단 시 대체 수단이 없었다',
      '팀 내 AI 윤리 기준이 정립되지 않았다',
    ]},
  ];

  // 전체 flat 배열 (인덱스 기반 저장용)
  const GOOD_ITEMS = GOOD_GROUPS.flatMap(g => g.items);
  const BAD_ITEMS  = BAD_GROUPS.flatMap(g => g.items);
  window._GOOD_ITEMS = GOOD_ITEMS;
  window._BAD_ITEMS  = BAD_ITEMS;

  let goodSelected = new Set();
  let badSelected = new Set();

  function buildInsDropdown(panelId, triggerId, tagsId, directId, groups, allItems, selectedSet) {
    const panel = document.getElementById(panelId);
    const trigger = document.getElementById(triggerId);
    const tagsWrap = document.getElementById(tagsId);
    const directTa = document.getElementById(directId);
    if (!panel || !trigger) return;

    // 임시 체크 상태 (패널 열릴 때 selectedSet 복사)
    let tempChecked = new Set(selectedSet);

    // 패널 렌더링
    function renderPanel() {
      panel.innerHTML = '';
      tempChecked = new Set(selectedSet);

      // 직접 작성하기
      const direct = document.createElement('div');
      direct.className = 'ins-dd-direct';
      direct.textContent = '✏️ 직접 작성하기';
      direct.addEventListener('click', () => {
        const boxId = directId.replace('direct', 'direct-box');
        const box = document.getElementById(boxId);
        if (box) box.style.display = '';
        panel.classList.remove('open');
        if (directTa) setTimeout(() => directTa.focus(), 50);
      });
      panel.appendChild(direct);

      // 그룹별 아코디언
      groups.forEach(group => {
        const groupEl = document.createElement('div');
        groupEl.className = 'ins-dd-group';

        const titleEl = document.createElement('div');
        titleEl.className = 'ins-dd-group-title';
        titleEl.textContent = group.title;
        titleEl.addEventListener('click', () => {
          titleEl.classList.toggle('open');
          itemsEl.classList.toggle('open');
        });

        const itemsEl = document.createElement('div');
        itemsEl.className = 'ins-dd-group-items';

        group.items.forEach(text => {
          const idx = allItems.indexOf(text);
          const item = document.createElement('div');
          item.className = 'ins-dd-item';

          const cb = document.createElement('input');
          cb.type = 'checkbox';
          cb.checked = tempChecked.has(idx);
          cb.addEventListener('change', () => {
            if (cb.checked) tempChecked.add(idx);
            else tempChecked.delete(idx);
          });

          const lbl = document.createElement('label');
          lbl.textContent = text;
          lbl.addEventListener('click', () => {
            cb.checked = !cb.checked;
            if (cb.checked) tempChecked.add(idx);
            else tempChecked.delete(idx);
          });

          item.append(cb, lbl);
          itemsEl.appendChild(item);
        });

        groupEl.append(titleEl, itemsEl);
        panel.appendChild(groupEl);
      });

      // 하단 확인 버튼
      const footer = document.createElement('div');
      footer.className = 'ins-dd-footer';
      const confirmBtn = document.createElement('button');
      confirmBtn.type = 'button';
      confirmBtn.className = 'ins-dd-confirm';
      confirmBtn.textContent = '확인';
      confirmBtn.addEventListener('click', () => {
        // tempChecked → selectedSet 반영
        selectedSet.clear();
        tempChecked.forEach(i => selectedSet.add(i));
        renderTags();
        panel.classList.remove('open');
      });
      footer.appendChild(confirmBtn);
      panel.appendChild(footer);
    }

    // 인덱스 → 그룹 타이틀 매핑
    function getGroupTitle(idx) {
      let offset = 0;
      for (const g of groups) {
        if (idx < offset + g.items.length) return g.title;
        offset += g.items.length;
      }
      return '';
    }

    // 태그 렌더링 — 직접작성 박스는 HTML에 고정, 선택 항목만 동적 렌더
    function renderTags() {
      if (!tagsWrap) return;
      // 직접작성 박스 보존, 나머지 동적 박스 제거
      tagsWrap.querySelectorAll('.ins-tag-box:not(.ins-direct-box)').forEach(el => el.remove());

      if (selectedSet.size === 0) return;

      const grouped = {};
      selectedSet.forEach(i => {
        const title = getGroupTitle(i);
        if (!grouped[title]) grouped[title] = [];
        grouped[title].push(i);
      });

      Object.entries(grouped).forEach(([title, indices]) => {
        const box = document.createElement('div');
        box.className = 'ins-tag-box';

        const titleEl = document.createElement('div');
        titleEl.className = 'ins-tag-box-title';
        titleEl.textContent = title;
        box.appendChild(titleEl);

        const list = document.createElement('div');
        list.className = 'ins-tag-box-list';
        indices.forEach(i => {
          const item = document.createElement('div');
          item.className = 'ins-tag-box-item';
          item.innerHTML = `<span>${allItems[i]}</span><span class="ins-tag-del" data-idx="${i}">✕</span>`;
          item.querySelector('.ins-tag-del').addEventListener('click', () => {
            selectedSet.delete(i);
            renderTags();
          });
          list.appendChild(item);
        });

        box.appendChild(list);
        tagsWrap.appendChild(box);
      });
    }

    // 트리거 클릭
    trigger.addEventListener('click', e => {
      e.stopPropagation();
      document.querySelectorAll('.ins-dd-panel.open').forEach(p => { if (p !== panel) p.classList.remove('open'); });
      renderPanel();
      panel.classList.toggle('open');
    });

    renderTags();
    return { renderPanel, renderTags };
  }

  // 외부 클릭 시 패널 닫기
  document.addEventListener('click', () => {
    document.querySelectorAll('.ins-dd-panel.open').forEach(p => p.classList.remove('open'));
  });
  document.querySelectorAll('.ins-dd-panel').forEach(p => p.addEventListener('click', e => e.stopPropagation()));

  const _goodDD = buildInsDropdown('good-dd-panel', 'good-dd-trigger', 'good-tags', 'good-direct', GOOD_GROUPS, GOOD_ITEMS, goodSelected);
  const _badDD  = buildInsDropdown('bad-dd-panel', 'bad-dd-trigger', 'bad-tags', 'bad-direct', BAD_GROUPS, BAD_ITEMS, badSelected);

  // ── AI X / AI O 항목 데이터 ──
  const AIX_GROUPS = [
    { title: '시간 낭비', items: [
      '수작업으로 3시간 이상 소요됐을 것이다',
      '반복 작업에 많은 시간을 소비했을 것이다',
      '자료 검색·수집에 하루 이상 걸렸을 것이다',
      '초안 작성부터 완성까지 오래 걸렸을 것이다',
      '회의록/문서 정리에 별도 시간이 필요했을 것이다',
      '여러 문서를 일일이 비교·대조해야 했을 것이다',
      '데이터 입력·정리에 반나절 이상 걸렸을 것이다',
      '같은 작업을 여러 번 반복했을 것이다',
      '포맷 통일 작업에만 상당한 시간이 들었을 것이다',
      '마감 일정을 맞추기 어려웠을 것이다',
    ]},
    { title: '품질 저하', items: [
      '수동 작업으로 오류가 발생했을 것이다',
      '문서 일관성이 떨어졌을 것이다',
      '다양한 관점을 확보하기 어려웠을 것이다',
      '분석 깊이가 얕았을 것이다',
      '산출물 완성도가 낮았을 것이다',
      '오탈자나 문법 오류가 많았을 것이다',
      '논리적 허점을 발견하지 못했을 것이다',
      '번역·다국어 처리 품질이 낮았을 것이다',
      '데이터 해석에 주관적 편향이 생겼을 것이다',
      '최종 결과물 수정 횟수가 많았을 것이다',
    ]},
    { title: '업무 비효율', items: [
      '단순 반복 업무에 리소스가 집중됐을 것이다',
      '팀원 간 업무 분배가 비효율적이었을 것이다',
      '커뮤니케이션 자료 준비에 시간이 걸렸을 것이다',
      '데이터 가공·정제에 수동 작업이 필요했을 것이다',
      '프로토타입 제작이 지연됐을 것이다',
      '같은 질문에 반복적으로 답변해야 했을 것이다',
      '산출물 표준화가 이루어지지 않았을 것이다',
      '수동 보고서 작성으로 핵심 분석에 집중 못 했을 것이다',
      '이해관계자별 맞춤 자료 제작이 부담이었을 것이다',
      '부서 간 문서 형식이 제각각이었을 것이다',
    ]},
    { title: '기회 손실', items: [
      '새로운 접근법을 시도하지 못했을 것이다',
      '리서치 범위가 제한적이었을 것이다',
      '빠른 의사결정을 위한 데이터가 부족했을 것이다',
      '벤치마크 분석이 충분하지 않았을 것이다',
      '핵심 업무에 집중할 시간이 부족했을 것이다',
      '경쟁사 동향 파악이 느렸을 것이다',
      '사용자 니즈를 깊이 분석하지 못했을 것이다',
      '혁신적 아이디어를 탐색할 여유가 없었을 것이다',
      '팀원 역량 개발에 투자할 시간이 없었을 것이다',
      '전략적 사고보다 실무 처리에 매몰됐을 것이다',
    ]},
  ];
  const AIO_GROUPS = [
    { title: '시간 단축', items: [
      '작업 시간이 50% 이상 단축되었다',
      '초안을 몇 분 만에 완성할 수 있었다',
      '자료 검색·수집 시간이 크게 줄었다',
      '반복 작업을 자동화하여 시간을 절약했다',
      '문서 정리·요약이 빠르게 처리되었다',
      '여러 문서를 동시에 비교·분석할 수 있었다',
      '데이터 정리·변환이 즉시 완료되었다',
      '보고서 포맷팅 시간이 대폭 줄었다',
      '다국어 번역이 실시간으로 처리되었다',
      '일정 내 작업 완료가 수월해졌다',
    ]},
    { title: '품질 향상', items: [
      '다양한 관점과 대안을 확보했다',
      '문서 일관성과 표준화가 개선되었다',
      '데이터 기반 의사결정이 가능해졌다',
      '산출물 완성도가 높아졌다',
      '오류 검증이 체계적으로 이루어졌다',
      '논리적 구조의 문서를 작성할 수 있었다',
      '맞춤법·문법이 자동 교정되었다',
      '전문적인 톤앤매너로 작성할 수 있었다',
      '피드백 반영 속도가 빨라졌다',
      '최종 산출물의 수정 횟수가 줄었다',
    ]},
    { title: '생산성 증가', items: [
      '핵심 업무에 집중할 수 있었다',
      '병렬 작업으로 처리량이 늘었다',
      '커뮤니케이션 자료를 빠르게 준비했다',
      '프로토타입을 신속하게 제작했다',
      '팀 전체 생산성이 향상되었다',
      '이해관계자별 맞춤 자료를 빠르게 제작했다',
      '반복 질문 응대를 자동화할 수 있었다',
      '산출물 표준 템플릿을 빠르게 생성했다',
      '팀원 간 업무 인수인계가 수월해졌다',
      '동시 다발적 요청에 유연하게 대응했다',
    ]},
    { title: '역량 확장', items: [
      '새로운 분석 방법을 시도할 수 있었다',
      '도메인 지식을 빠르게 습득했다',
      '리서치 범위를 넓힐 수 있었다',
      '창의적 아이디어를 다양하게 발산했다',
      '전문 영역 외 작업도 수행할 수 있었다',
      '경쟁사·트렌드 분석 역량이 강화되었다',
      '사용자 관점에서 깊이 있는 분석이 가능해졌다',
      '데이터 시각화 역량이 향상되었다',
      'AI 도구 활용 노하우가 축적되었다',
      '팀 전체의 AI 리터러시가 성장했다',
    ]},
  ];

  const AIX_ITEMS = AIX_GROUPS.flatMap(g => g.items);
  const AIO_ITEMS = AIO_GROUPS.flatMap(g => g.items);
  window._AIX_ITEMS = AIX_ITEMS;
  window._AIO_ITEMS = AIO_ITEMS;
  let aixSelected = new Set();
  let aioSelected = new Set();

  const _aixDD = buildInsDropdown('aix-dd-panel', 'aix-dd-trigger', 'aix-tags', 'aix-direct', AIX_GROUPS, AIX_ITEMS, aixSelected);
  const _aioDD = buildInsDropdown('aio-dd-panel', 'aio-dd-trigger', 'aio-tags', 'aio-direct', AIO_GROUPS, AIO_ITEMS, aioSelected);

  // 직접작성 닫기 버튼
  document.getElementById('good-direct-close')?.addEventListener('click', () => {
    document.getElementById('good-direct').value = '';
    document.getElementById('good-direct-box').style.display = 'none';
  });
  document.getElementById('bad-direct-close')?.addEventListener('click', () => {
    document.getElementById('bad-direct').value = '';
    document.getElementById('bad-direct-box').style.display = 'none';
  });
  document.getElementById('aix-direct-close')?.addEventListener('click', () => {
    document.getElementById('aix-direct').value = '';
    document.getElementById('aix-direct-box').style.display = 'none';
  });
  document.getElementById('aio-direct-close')?.addEventListener('click', () => {
    document.getElementById('aio-direct').value = '';
    document.getElementById('aio-direct-box').style.display = 'none';
  });
