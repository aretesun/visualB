export const ko = {
  // 카드
  card: {
    placeholder: "무엇을 원하세요?",
    addImage: "이미지 추가",
    changeImage: "이미지 변경",
  },

  // 버튼
  button: {
    delete: "삭제",
    edit: "편집",
    save: "저장",
    close: "닫기",
  },

  // 툴바
  toolbar: {
    title: "Visual Board",
    sharedTitle: "공유된 보드",
    refreshBackground: "배경 새로고침",
    share: "공유하기",
  },

  // 설정 메뉴
  settings: {
    title: "설정",
    backup: "백업하기",
    restore: "복원하기",
    boards: "공간 관리",
    language: "언어 설정",
    korean: "한국어",
    english: "English",
  },

  // 링크 메뉴
  links: {
    developerNotes: "개발자 노트",
    github: "GitHub",
  },

  // 이미지 소스 드롭다운
  imageSource: {
    uploadFile: "파일 업로드",
    generateAI: "AI로 생성",
    addByUrl: "URL로 추가",
  },

  // 공유 모달
  shareModal: {
    title: "비전보드 공유하기",
    asImage: "이미지로 저장",
    asImageDesc: "현재 화면을 PNG 이미지로 다운로드",
    asLink: "링크로 공유",
    asLinkDesc: "1일간 유효한 공유 링크 생성",
    asFile: "파일로 내보내기",
    asFileDesc: "JSON 파일로 저장 (추후 제공)",
  },

  // URL 입력 모달
  urlModal: {
    title: "이미지 URL 입력",
    placeholder: "이미지 URL을 입력하세요",
    add: "추가",
    cancel: "취소",
    tip: "팁: 이미지를 마우스 우클릭 > '이미지 주소 복사'로 URL을 가져올 수 있습니다.",
  },

  // 토스트 메시지
  toast: {
    maxCards: "너무 꿈이 많아요. 오래된 기억은 지워주세요.",
    imageGenerating: "이미지를 생성하는 중...",
    imageDownloaded: "이미지가 다운로드되었습니다! 🎉",
    imageFailed: "이미지 다운로드 중 오류가 발생했습니다",
    captureError: "화면 캡처에 실패했습니다",
    linkCopied: "링크 복사 완료! (1일간 유효)",
    linkFailed: "링크 생성 중 오류가 발생했습니다",
    linkGenerating: "🔗 링크 생성 중...",
    backupSuccess: "백업이 완료되었습니다!",
    backupFailed: "백업에 실패했습니다",
    restoreSuccess: "복원이 완료되었습니다!",
    restoreFailed: "복원에 실패했습니다",
    noBackup: "백업 파일이 없습니다",
    sharedBoardLoaded: "🎉 공유된 비전보드를 불러왔습니다!",
    sharedBoardFailed: "⚠️ 공유된 비전보드를 불러오는데 실패했습니다",
    cardDuplicated: "카드가 복제되었습니다",
  },

  // 공유 보기 모드
  sharedView: {
    notice: "공유된 비전보드 보기 (위치 조정 가능, 저장 안 됨)",
    backToMyBoard: "내 보드로 돌아가기",
  },

  // 개발자 노트
  developerNotes: {
    title: "개발자 노트",
    features: "주요 기능",
    cardMove: "카드 이동: 카드를 드래그하여 자유롭게 배치",
    cardResize: "크기 조절: 카드 모서리/변을 드래그하여 크기 조절",
    imageAdjust: "이미지 조정: 자물쇠 아이콘 클릭 후 이미지 위치 조정",
    backgroundChange: "배경 변경: 좌측 상단 새로고침 버튼으로 배경 변경",
    buyMeCoffee: "☕ 커피 한 잔 사주기",
    madeWith: "Made with ❤️ by vision team",
  },

  boards: {
    title: "공간 관리",
    create: "생성",
    open: "열기",
    active: "현재",
    defaultName: "내 보드",
    namePlaceholder: "공간 이름",
    newPlaceholder: "새 공간 이름",
    updatedAt: "업데이트",
  },

  // 카드 템플릿
  templates: {
    title: "템플릿 선택",
    recent: "최근",
    items: {
      note: {
        label: "메모",
        description: "빈 텍스트 카드",
        defaultText: "",
      },
      checklist: {
        label: "체크리스트",
        description: "할 일 목록",
        defaultText: "- [ ] 할 일 1\n- [ ] 할 일 2\n- [ ] 할 일 3",
      },
      goal: {
        label: "목표",
        description: "목표와 실행 계획",
        defaultText: "[[goal]]\n\n[[reason]]\n\n[[firstStep]]\n",
      },
      retro: {
        label: "회고",
        description: "Keep / Problem / Try",
        defaultText: "[[keep]]\n\n[[problem]]\n\n[[try]]\n",
      },
      project: {
        label: "프로젝트",
        description: "일정과 진행 상태 관리",
        defaultText: "[[projectName]]\n\n[[deadlineDate]]\n\n[[planning]]\n\n[[design]]\n\n[[development]]\n",
      },
    },
    sections: {
      goal: {
        goal: "목표",
        reason: "이유",
        firstStep: "첫 행동",
      },
      retro: {
        keep: "Keep",
        problem: "Problem",
        try: "Try",
      },
      project: {
        name: "프로젝트 이름",
        deadlineDate: "마감일 (날짜)",
        planning: "기획",
        design: "디자인",
        development: "개발",
      },
    },
  },

  // 스티커 팔레트
  stickerPalette: {
    title: "스티커",
    open: "스티커 팔레트 열기",
    empty: "아직 스티커가 없습니다",
    addHint: "+ 버튼을 눌러 추가하세요",
    add: "스티커 추가",
    addTitle: "스티커 추가",
    addButton: "추가",
    nameLabel: "이름 (선택사항)",
    namePlaceholder: "스티커 이름",
    urlLabel: "이미지 URL",
    fileLabel: "또는 파일 업로드",
    chooseFile: "파일 선택",
  },
};

export type Translations = typeof ko;
