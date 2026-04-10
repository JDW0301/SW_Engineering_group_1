// ─── Mock Data ───────────────────────────────────────────────
export const MOCK_STORES = [
  { id: 1, name: "패션스토어 루미", category: "의류", phone: "02-1234-5678", address: "서울시 강남구 역삼동 123-4", desc: "트렌디한 의류 전문 스토어", image: null, operatingHours: "평일 09:00 ~ 18:00", banner: null },
  { id: 2, name: "맛있는 빵집", category: "음식", phone: "02-9876-5432", address: "서울시 마포구 합정동 56-7", desc: "수제 빵과 디저트", image: null, operatingHours: "매일 08:00 ~ 22:00", banner: null },
  { id: 3, name: "테크존 전자", category: "전자기기", phone: "031-555-1234", address: "경기도 성남시 분당구 정자동 89", desc: "가전/IT 기기 전문", image: null, operatingHours: "평일 10:00 ~ 19:00", banner: null },
  { id: 4, name: "그린라이프 마트", category: "생활용품", phone: "02-333-4444", address: "서울시 송파구 잠실동 200", desc: "친환경 생활용품 전문", image: null, operatingHours: "매일 10:00 ~ 21:00", banner: null },
  { id: 5, name: "북카페 서랍", category: "기타", phone: "02-777-8888", address: "서울시 종로구 삼청동 33", desc: "책과 커피가 있는 공간", image: null, operatingHours: "화~일 11:00 ~ 20:00", banner: null },
];

export const MOCK_ORDERS = [
  // 패션스토어 루미 (storeId: 1) — 10건
  { id: 101, storeId: 1, storeName: "패션스토어 루미", orderNumber: "ORD-2026-001", productName: "린넨 셔츠", quantity: 2, totalPrice: 89000, orderedAt: "2026-03-05", customerName: "서재철", phone: "010-1234-5678" },
  { id: 102, storeId: 1, storeName: "패션스토어 루미", orderNumber: "ORD-2026-003", productName: "데님 팬츠", quantity: 1, totalPrice: 65000, orderedAt: "2026-03-10", customerName: "서재철", phone: "010-1234-5678" },
  { id: 103, storeId: 1, storeName: "패션스토어 루미", orderNumber: "ORD-2026-007", productName: "오버핏 후드", quantity: 1, totalPrice: 52000, orderedAt: "2026-03-15", customerName: "서재철", phone: "010-1234-5678" },
  { id: 104, storeId: 1, storeName: "패션스토어 루미", orderNumber: "ORD-2026-010", productName: "코튼 카디건", quantity: 1, totalPrice: 78000, orderedAt: "2026-03-18", customerName: "서재철", phone: "010-1234-5678" },
  { id: 105, storeId: 1, storeName: "패션스토어 루미", orderNumber: "ORD-2026-013", productName: "스트라이프 티셔츠", quantity: 3, totalPrice: 87000, orderedAt: "2026-03-22", customerName: "서재철", phone: "010-1234-5678" },
  { id: 106, storeId: 1, storeName: "패션스토어 루미", orderNumber: "ORD-2026-017", productName: "캐시미어 머플러", quantity: 1, totalPrice: 45000, orderedAt: "2026-03-25", customerName: "서재철", phone: "010-1234-5678" },
  { id: 107, storeId: 1, storeName: "패션스토어 루미", orderNumber: "ORD-2026-020", productName: "와이드 슬랙스", quantity: 2, totalPrice: 118000, orderedAt: "2026-03-28", customerName: "서재철", phone: "010-1234-5678" },
  { id: 108, storeId: 1, storeName: "패션스토어 루미", orderNumber: "ORD-2026-023", productName: "리넨 반팔", quantity: 1, totalPrice: 39000, orderedAt: "2026-04-01", customerName: "서재철", phone: "010-1234-5678" },
  { id: 109, storeId: 1, storeName: "패션스토어 루미", orderNumber: "ORD-2026-026", productName: "니트 베스트", quantity: 1, totalPrice: 55000, orderedAt: "2026-04-05", customerName: "서재철", phone: "010-1234-5678" },
  { id: 110, storeId: 1, storeName: "패션스토어 루미", orderNumber: "ORD-2026-029", productName: "봄 자켓", quantity: 1, totalPrice: 132000, orderedAt: "2026-04-08", customerName: "서재철", phone: "010-1234-5678" },

  // 맛있는 빵집 (storeId: 2) — 7건
  { id: 201, storeId: 2, storeName: "맛있는 빵집", orderNumber: "ORD-2026-002", productName: "크루아상 세트", quantity: 1, totalPrice: 15000, orderedAt: "2026-03-07", customerName: "서재철", phone: "010-1234-5678" },
  { id: 202, storeId: 2, storeName: "맛있는 빵집", orderNumber: "ORD-2026-006", productName: "소금빵 6개입", quantity: 2, totalPrice: 24000, orderedAt: "2026-03-12", customerName: "서재철", phone: "010-1234-5678" },
  { id: 203, storeId: 2, storeName: "맛있는 빵집", orderNumber: "ORD-2026-011", productName: "바게트 + 잼 세트", quantity: 1, totalPrice: 18000, orderedAt: "2026-03-19", customerName: "서재철", phone: "010-1234-5678" },
  { id: 204, storeId: 2, storeName: "맛있는 빵집", orderNumber: "ORD-2026-015", productName: "딸기 생크림 케이크", quantity: 1, totalPrice: 38000, orderedAt: "2026-03-24", customerName: "서재철", phone: "010-1234-5678" },
  { id: 205, storeId: 2, storeName: "맛있는 빵집", orderNumber: "ORD-2026-019", productName: "마카롱 세트 (12개)", quantity: 1, totalPrice: 28000, orderedAt: "2026-03-27", customerName: "서재철", phone: "010-1234-5678" },
  { id: 206, storeId: 2, storeName: "맛있는 빵집", orderNumber: "ORD-2026-024", productName: "앙버터 스콘", quantity: 4, totalPrice: 20000, orderedAt: "2026-04-02", customerName: "서재철", phone: "010-1234-5678" },
  { id: 207, storeId: 2, storeName: "맛있는 빵집", orderNumber: "ORD-2026-028", productName: "티라미수 2호", quantity: 1, totalPrice: 35000, orderedAt: "2026-04-07", customerName: "서재철", phone: "010-1234-5678" },

  // 테크존 전자 (storeId: 3) — 6건
  { id: 301, storeId: 3, storeName: "테크존 전자", orderNumber: "ORD-2026-004", productName: "무선 이어폰", quantity: 1, totalPrice: 129000, orderedAt: "2026-03-08", customerName: "서재철", phone: "010-1234-5678" },
  { id: 302, storeId: 3, storeName: "테크존 전자", orderNumber: "ORD-2026-009", productName: "USB-C 허브", quantity: 1, totalPrice: 45000, orderedAt: "2026-03-16", customerName: "서재철", phone: "010-1234-5678" },
  { id: 303, storeId: 3, storeName: "테크존 전자", orderNumber: "ORD-2026-014", productName: "기계식 키보드", quantity: 1, totalPrice: 89000, orderedAt: "2026-03-23", customerName: "서재철", phone: "010-1234-5678" },
  { id: 304, storeId: 3, storeName: "테크존 전자", orderNumber: "ORD-2026-018", productName: "27인치 모니터", quantity: 1, totalPrice: 350000, orderedAt: "2026-03-26", customerName: "서재철", phone: "010-1234-5678" },
  { id: 305, storeId: 3, storeName: "테크존 전자", orderNumber: "ORD-2026-022", productName: "무선 마우스", quantity: 2, totalPrice: 58000, orderedAt: "2026-04-01", customerName: "서재철", phone: "010-1234-5678" },
  { id: 306, storeId: 3, storeName: "테크존 전자", orderNumber: "ORD-2026-027", productName: "웹캠 HD", quantity: 1, totalPrice: 67000, orderedAt: "2026-04-06", customerName: "서재철", phone: "010-1234-5678" },

  // 그린라이프 마트 (storeId: 4) — 4건
  { id: 401, storeId: 4, storeName: "그린라이프 마트", orderNumber: "ORD-2026-005", productName: "대나무 칫솔 세트", quantity: 2, totalPrice: 12000, orderedAt: "2026-03-11", customerName: "서재철", phone: "010-1234-5678" },
  { id: 402, storeId: 4, storeName: "그린라이프 마트", orderNumber: "ORD-2026-012", productName: "친환경 세제 리필", quantity: 3, totalPrice: 27000, orderedAt: "2026-03-20", customerName: "서재철", phone: "010-1234-5678" },
  { id: 403, storeId: 4, storeName: "그린라이프 마트", orderNumber: "ORD-2026-021", productName: "스테인리스 빨대 세트", quantity: 1, totalPrice: 15000, orderedAt: "2026-03-30", customerName: "서재철", phone: "010-1234-5678" },
  { id: 404, storeId: 4, storeName: "그린라이프 마트", orderNumber: "ORD-2026-025", productName: "에코백 (내추럴)", quantity: 2, totalPrice: 22000, orderedAt: "2026-04-04", customerName: "서재철", phone: "010-1234-5678" },

  // 북카페 서랍 (storeId: 5) — 3건
  { id: 501, storeId: 5, storeName: "북카페 서랍", orderNumber: "ORD-2026-008", productName: "원두 블렌드 200g", quantity: 2, totalPrice: 26000, orderedAt: "2026-03-14", customerName: "서재철", phone: "010-1234-5678" },
  { id: 502, storeId: 5, storeName: "북카페 서랍", orderNumber: "ORD-2026-016", productName: "드립백 세트 (10개입)", quantity: 1, totalPrice: 18000, orderedAt: "2026-03-25", customerName: "서재철", phone: "010-1234-5678" },
  { id: 503, storeId: 5, storeName: "북카페 서랍", orderNumber: "ORD-2026-030", productName: "텀블러 350ml", quantity: 1, totalPrice: 32000, orderedAt: "2026-04-09", customerName: "서재철", phone: "010-1234-5678" },
];

export const MOCK_INQUIRIES = [
  // 패션스토어 루미
  { id: 1, storeId: 1, storeName: "패션스토어 루미", type: "상담", status: "IN_PROGRESS", title: "린넨 셔츠 사이즈 교환", orderId: 101, createdAt: "2026-03-06 14:30", lastMessageAt: "2026-04-08 10:15", messages: [
    { id: 1, sender: "customer", content: "안녕하세요, 린넨 셔츠 M사이즈로 주문했는데 L로 교환 가능한가요?", time: "2026-03-06 14:30" },
    { id: 2, sender: "operator", content: "안녕하세요! 네, 교환 가능합니다. 택배 회수 접수 도와드릴까요?", time: "2026-03-06 15:00" },
    { id: 3, sender: "customer", content: "네 부탁드립니다!", time: "2026-03-06 15:05" },
    { id: 4, sender: "operator", content: "접수 완료되었습니다. 내일 중으로 택배 기사님이 방문하실 예정이에요.", time: "2026-04-08 10:15" },
  ]},
  { id: 2, storeId: 1, storeName: "패션스토어 루미", type: "상담", status: "RESOLVED", title: "데님 팬츠 색상 문의", orderId: 102, createdAt: "2026-03-11 10:00", lastMessageAt: "2026-03-11 11:20", messages: [
    { id: 1, sender: "customer", content: "데님 팬츠 실물 색상이 사진이랑 차이 있나요?", time: "2026-03-11 10:00" },
    { id: 2, sender: "operator", content: "약간의 차이가 있을 수 있으나 모니터 설정에 따른 차이입니다. 실물은 조금 더 진한 인디고 톤이에요.", time: "2026-03-11 11:20" },
  ]},
  { id: 3, storeId: 1, storeName: "패션스토어 루미", type: "문의", status: "RESOLVED", title: "오버핏 후드 재입고 문의", orderId: 103, createdAt: "2026-03-16 09:30", lastMessageAt: "2026-03-16 14:00", messages: [
    { id: 1, sender: "customer", content: "오버핏 후드 블랙 L사이즈 재입고 예정 있나요?", time: "2026-03-16 09:30" },
    { id: 2, sender: "operator", content: "다음 주 화요일에 재입고 예정입니다! 입고 알림 등록해드릴까요?", time: "2026-03-16 14:00" },
  ]},
  { id: 4, storeId: 1, storeName: "패션스토어 루미", type: "상담", status: "IN_PROGRESS", title: "코튼 카디건 올 풀림 문제", orderId: 104, createdAt: "2026-03-20 16:45", lastMessageAt: "2026-04-07 09:00", messages: [
    { id: 1, sender: "customer", content: "코튼 카디건 한 번 입었는데 올이 풀리기 시작했어요.", time: "2026-03-20 16:45" },
    { id: 2, sender: "operator", content: "사진 첨부해주시면 확인 후 교환/환불 안내드리겠습니다.", time: "2026-03-20 17:30" },
    { id: 3, sender: "customer", content: "사진 보내드립니다. 소매 부분이 많이 풀렸어요.", time: "2026-03-21 10:00" },
    { id: 4, sender: "operator", content: "확인했습니다. 불량으로 판단되어 무료 교환 처리 도와드리겠습니다.", time: "2026-04-07 09:00" },
  ]},
  { id: 5, storeId: 1, storeName: "패션스토어 루미", type: "상담", status: "RESOLVED", title: "스트라이프 티셔츠 배송 지연", orderId: 105, createdAt: "2026-03-24 11:00", lastMessageAt: "2026-03-25 09:30", messages: [
    { id: 1, sender: "customer", content: "3일 전 주문했는데 아직 발송 안 된 것 같아요.", time: "2026-03-24 11:00" },
    { id: 2, sender: "operator", content: "확인해보니 물량 폭주로 하루 지연되었습니다. 오늘 중 발송될 예정이에요. 죄송합니다!", time: "2026-03-24 14:00" },
    { id: 3, sender: "customer", content: "알겠습니다, 감사합니다.", time: "2026-03-25 09:30" },
  ]},
  { id: 6, storeId: 1, storeName: "패션스토어 루미", type: "문의", status: "IN_PROGRESS", title: "봄 자켓 소재 정보 요청", orderId: 110, createdAt: "2026-04-08 15:00", lastMessageAt: "2026-04-08 15:00", messages: [
    { id: 1, sender: "customer", content: "봄 자켓 소재가 무엇인지, 세탁기 사용 가능한지 궁금합니다.", time: "2026-04-08 15:00" },
  ]},

  // 맛있는 빵집
  { id: 7, storeId: 2, storeName: "맛있는 빵집", type: "문의", status: "RESOLVED", title: "크루아상 유통기한 문의", orderId: 201, createdAt: "2026-03-08 09:00", lastMessageAt: "2026-03-08 11:30", messages: [
    { id: 1, sender: "customer", content: "크루아상 세트 유통기한이 어떻게 되나요?", time: "2026-03-08 09:00" },
    { id: 2, sender: "operator", content: "상온 보관 시 3일, 냉장 보관 시 7일입니다!", time: "2026-03-08 11:30" },
  ]},
  { id: 8, storeId: 2, storeName: "맛있는 빵집", type: "상담", status: "RESOLVED", title: "소금빵 알레르기 성분 확인", orderId: 202, createdAt: "2026-03-13 14:00", lastMessageAt: "2026-03-13 15:30", messages: [
    { id: 1, sender: "customer", content: "소금빵에 견과류 성분이 들어가나요? 알레르기가 있어서요.", time: "2026-03-13 14:00" },
    { id: 2, sender: "operator", content: "소금빵에는 견과류가 들어가지 않습니다. 다만 같은 공장에서 견과류 제품을 생산하고 있어 미량 포함 가능성은 있습니다.", time: "2026-03-13 15:30" },
  ]},
  { id: 9, storeId: 2, storeName: "맛있는 빵집", type: "상담", status: "IN_PROGRESS", title: "딸기 케이크 배송 파손", orderId: 204, createdAt: "2026-03-25 10:00", lastMessageAt: "2026-04-06 16:00", messages: [
    { id: 1, sender: "customer", content: "딸기 케이크 받았는데 배송 중 파손이 있었어요. 사진 보내드립니다.", time: "2026-03-25 10:00" },
    { id: 2, sender: "operator", content: "정말 죄송합니다. 확인 후 재발송 또는 환불 처리 안내드리겠습니다.", time: "2026-03-25 11:00" },
    { id: 3, sender: "customer", content: "재발송 부탁드립니다.", time: "2026-03-25 11:30" },
    { id: 4, sender: "operator", content: "내일 오전 중 재발송 진행하겠습니다.", time: "2026-04-06 16:00" },
  ]},
  { id: 10, storeId: 2, storeName: "맛있는 빵집", type: "문의", status: "RESOLVED", title: "티라미수 주문 수량 변경", orderId: 207, createdAt: "2026-04-07 08:30", lastMessageAt: "2026-04-07 10:00", messages: [
    { id: 1, sender: "customer", content: "티라미수 1개 추가 주문 가능할까요?", time: "2026-04-07 08:30" },
    { id: 2, sender: "operator", content: "이미 제조에 들어가서 추가 주문은 별도로 넣어주셔야 합니다. 죄송합니다!", time: "2026-04-07 10:00" },
  ]},

  // 테크존 전자
  { id: 11, storeId: 3, storeName: "테크존 전자", type: "상담", status: "IN_PROGRESS", title: "무선 이어폰 블루투스 끊김", orderId: 301, createdAt: "2026-03-10 16:00", lastMessageAt: "2026-04-08 16:00", messages: [
    { id: 1, sender: "customer", content: "이어폰 블루투스 연결이 자꾸 끊겨요. 불량인 것 같은데 확인 부탁드립니다.", time: "2026-03-10 16:00" },
    { id: 2, sender: "operator", content: "펌웨어 업데이트를 먼저 시도해보시겠어요? 설정 > 기기정보 > 업데이트에서 가능합니다.", time: "2026-03-10 17:00" },
    { id: 3, sender: "customer", content: "업데이트 해봤는데 여전히 끊깁니다.", time: "2026-04-08 16:00" },
  ]},
  { id: 12, storeId: 3, storeName: "테크존 전자", type: "상담", status: "RESOLVED", title: "USB-C 허브 호환성 문의", orderId: 302, createdAt: "2026-03-17 11:00", lastMessageAt: "2026-03-17 13:00", messages: [
    { id: 1, sender: "customer", content: "이 허브가 맥북 M3 호환 되나요?", time: "2026-03-17 11:00" },
    { id: 2, sender: "operator", content: "네, M1/M2/M3 전 모델 호환됩니다!", time: "2026-03-17 13:00" },
  ]},
  { id: 13, storeId: 3, storeName: "테크존 전자", type: "상담", status: "RESOLVED", title: "키보드 키캡 파손 교환", orderId: 303, createdAt: "2026-03-24 15:00", lastMessageAt: "2026-03-26 10:00", messages: [
    { id: 1, sender: "customer", content: "키보드 수령했는데 스페이스바 키캡이 깨져있습니다.", time: "2026-03-24 15:00" },
    { id: 2, sender: "operator", content: "배송 과정 파손으로 보입니다. 키캡만 별도 발송해드리겠습니다.", time: "2026-03-24 16:00" },
    { id: 3, sender: "customer", content: "감사합니다.", time: "2026-03-26 10:00" },
  ]},
  { id: 14, storeId: 3, storeName: "테크존 전자", type: "문의", status: "IN_PROGRESS", title: "모니터 데드픽셀 문의", orderId: 304, createdAt: "2026-03-28 09:00", lastMessageAt: "2026-03-28 09:00", messages: [
    { id: 1, sender: "customer", content: "모니터 우측 하단에 데드픽셀이 2개 보입니다. 교환 가능한가요?", time: "2026-03-28 09:00" },
  ]},

  // 그린라이프 마트
  { id: 15, storeId: 4, storeName: "그린라이프 마트", type: "문의", status: "RESOLVED", title: "대나무 칫솔 경도 문의", orderId: 401, createdAt: "2026-03-12 10:00", lastMessageAt: "2026-03-12 11:00", messages: [
    { id: 1, sender: "customer", content: "칫솔모가 부드러운 편인가요? 잇몸이 약해서요.", time: "2026-03-12 10:00" },
    { id: 2, sender: "operator", content: "소프트 모입니다. 잇몸이 약하신 분도 편하게 사용 가능해요!", time: "2026-03-12 11:00" },
  ]},
  { id: 16, storeId: 4, storeName: "그린라이프 마트", type: "상담", status: "IN_PROGRESS", title: "친환경 세제 성분 문의", orderId: 402, createdAt: "2026-03-21 14:00", lastMessageAt: "2026-04-05 10:00", messages: [
    { id: 1, sender: "customer", content: "세제 성분표를 확인하고 싶습니다. 아이가 있어서 안전한지 궁금해요.", time: "2026-03-21 14:00" },
    { id: 2, sender: "operator", content: "성분표 이미지 첨부해드립니다. 모든 성분이 EWG 1등급입니다.", time: "2026-03-21 15:00" },
    { id: 3, sender: "customer", content: "감사합니다. 그런데 피부 테스트 인증도 있나요?", time: "2026-04-05 10:00" },
  ]},
  { id: 17, storeId: 4, storeName: "그린라이프 마트", type: "문의", status: "RESOLVED", title: "에코백 색상 교환", orderId: 404, createdAt: "2026-04-05 11:00", lastMessageAt: "2026-04-05 14:00", messages: [
    { id: 1, sender: "customer", content: "내추럴 색상을 주문했는데 차콜로 바꿀 수 있을까요?", time: "2026-04-05 11:00" },
    { id: 2, sender: "operator", content: "아직 발송 전이라 변경 가능합니다. 차콜로 변경 처리해드렸습니다!", time: "2026-04-05 14:00" },
  ]},

  // 북카페 서랍
  { id: 18, storeId: 5, storeName: "북카페 서랍", type: "문의", status: "RESOLVED", title: "원두 분쇄도 문의", orderId: 501, createdAt: "2026-03-15 09:00", lastMessageAt: "2026-03-15 10:30", messages: [
    { id: 1, sender: "customer", content: "원두 구매 시 분쇄해서 보내주실 수 있나요? 핸드드립용이요.", time: "2026-03-15 09:00" },
    { id: 2, sender: "operator", content: "네, 주문 시 요청사항에 '핸드드립용 분쇄'라고 적어주시면 맞춰 드립니다!", time: "2026-03-15 10:30" },
  ]},
  { id: 19, storeId: 5, storeName: "북카페 서랍", type: "상담", status: "IN_PROGRESS", title: "텀블러 보온 성능 문의", orderId: 503, createdAt: "2026-04-09 08:00", lastMessageAt: "2026-04-09 08:00", messages: [
    { id: 1, sender: "customer", content: "텀블러 보온이 몇 시간 정도 유지되나요?", time: "2026-04-09 08:00" },
  ]},
];

export const MOCK_FAQ = [
  { id: 1, question: "배송은 얼마나 걸리나요?", answer: "주문 확인 후 1~3 영업일 내 발송되며, 발송 후 1~2일 내 수령 가능합니다." },
  { id: 2, question: "교환/반품은 어떻게 하나요?", answer: "수령 후 7일 이내 고객센터로 문의해주시면 교환/반품 접수가 가능합니다." },
  { id: 3, question: "결제 수단은 무엇이 있나요?", answer: "신용카드, 계좌이체, 간편결제(카카오페이, 네이버페이)를 지원합니다." },
  { id: 4, question: "회원 등급 혜택이 있나요?", answer: "현재 별도 등급 혜택은 없으며, 추후 업데이트 예정입니다." },
  { id: 5, question: "영업시간 외 문의는 어떻게 하나요?", answer: "챗봇을 통해 24시간 기본 문의가 가능하며, 상담사 연결은 영업시간 내 가능합니다." },
];

export const MOCK_BOARD_POSTS = [
  // 패션스토어 루미 (storeId: 1)
  { id: 1, storeId: 1, title: "사이즈 표 문의드립니다", author: "서**", date: "2026-03-06", status: "완료", isSecret: false, content: "린넨 셔츠 정사이즈인가요?", answer: "네, 정사이즈입니다. 평소 사이즈로 주문해주세요!" },
  { id: 2, storeId: 1, title: "비밀글 입니다.", author: "김**", date: "2026-03-10", status: "대기", isSecret: true, content: "", answer: "" },
  { id: 3, storeId: 1, title: "세탁 방법 알려주세요", author: "이**", date: "2026-03-15", status: "완료", isSecret: false, content: "린넨 소재 세탁은 어떻게 하나요?", answer: "찬물 손세탁 또는 울/섬세 코스로 세탁해주세요." },
  { id: 4, storeId: 1, title: "오버핏 후드 기장이 궁금해요", author: "박**", date: "2026-03-18", status: "완료", isSecret: false, content: "175cm인데 후드 기장이 어느 정도인가요?", answer: "175cm 기준 엉덩이 중간 정도 내려옵니다." },
  { id: 5, storeId: 1, title: "스트라이프 티 색상 종류", author: "최**", date: "2026-03-22", status: "완료", isSecret: false, content: "스트라이프 티셔츠 다른 색상도 있나요?", answer: "현재 네이비/화이트, 블랙/화이트 두 가지입니다." },
  { id: 6, storeId: 1, title: "비밀글 입니다.", author: "정**", date: "2026-03-28", status: "완료", isSecret: true, content: "", answer: "" },
  { id: 7, storeId: 1, title: "봄 자켓 모델 착용샷 요청", author: "서**", date: "2026-04-08", status: "대기", isSecret: false, content: "봄 자켓 실제 착용 사진 올려주실 수 있나요?", answer: "" },

  // 맛있는 빵집 (storeId: 2)
  { id: 8, storeId: 2, title: "빵 포장 방법 문의", author: "서**", date: "2026-03-09", status: "완료", isSecret: false, content: "선물용으로 포장 가능한가요?", answer: "네, 주문 시 선물포장 옵션을 선택해주세요. 추가 2,000원입니다." },
  { id: 9, storeId: 2, title: "마카롱 맛 종류 알려주세요", author: "한**", date: "2026-03-27", status: "완료", isSecret: false, content: "12개 세트에 어떤 맛이 포함되나요?", answer: "바닐라, 초코, 딸기, 얼그레이, 피스타치오, 망고 각 2개씩 구성됩니다." },
  { id: 10, storeId: 2, title: "비밀글 입니다.", author: "유**", date: "2026-04-02", status: "대기", isSecret: true, content: "", answer: "" },

  // 테크존 전자 (storeId: 3)
  { id: 11, storeId: 3, title: "키보드 소음 수준 문의", author: "서**", date: "2026-03-23", status: "완료", isSecret: false, content: "적축인데 사무실에서 쓸만한 소음인가요?", answer: "적축은 비교적 조용한 편입니다. 일반 사무실에서 무리 없이 사용 가능합니다." },
  { id: 12, storeId: 3, title: "모니터 VESA 마운트 호환", author: "강**", date: "2026-03-26", status: "완료", isSecret: false, content: "75x75 VESA 마운트 지원하나요?", answer: "네, 75x75 및 100x100 두 가지 모두 지원합니다." },

  // 그린라이프 마트 (storeId: 4)
  { id: 13, storeId: 4, title: "세제 향 종류 문의", author: "서**", date: "2026-03-20", status: "완료", isSecret: false, content: "친환경 세제 무향도 있나요?", answer: "네, 무향/라벤더/유칼립투스 세 가지 향이 있습니다." },
  { id: 14, storeId: 4, title: "빨대 세척솔 포함 여부", author: "윤**", date: "2026-03-30", status: "완료", isSecret: false, content: "스테인리스 빨대에 세척솔이 포함되어 있나요?", answer: "네, 세척솔 2개가 기본 포함입니다." },

  // 북카페 서랍 (storeId: 5)
  { id: 15, storeId: 5, title: "원두 원산지 문의", author: "서**", date: "2026-03-14", status: "완료", isSecret: false, content: "블렌드 원두 원산지가 어디인가요?", answer: "에티오피아 예가체프와 콜롬비아 수프리모 블렌드입니다." },
  { id: 16, storeId: 5, title: "텀블러 식기세척기 사용 가능?", author: "임**", date: "2026-04-09", status: "대기", isSecret: false, content: "텀블러를 식기세척기에 넣어도 되나요?", answer: "" },
];
