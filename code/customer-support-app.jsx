import { useState, useEffect, useRef } from "react";
import {
  MessageSquare, Bot, Search, ChevronRight, ChevronLeft, ChevronDown, ChevronUp,
  Settings, LogOut, Home, ShoppingBag, BarChart3, FileText, Send, Image,
  Plus, X, Check, Clock, AlertCircle, User, Store, Package, Filter, RefreshCw,
  ArrowRight, Star, Phone, Mail, MapPin, Upload, Trash2, Eye, Edit3,
  MessageCircle, HelpCircle, Lock, Unlock, ArrowLeft, Menu, Bell, Clipboard
} from "lucide-react";

// ─── Mock Data ───────────────────────────────────────────────
const MOCK_STORES = [
  { id: 1, name: "패션스토어 루미", category: "의류", phone: "02-1234-5678", address: "서울시 강남구 역삼동 123-4", desc: "트렌디한 의류 전문 스토어", image: null, operatingHours: "평일 09:00 ~ 18:00", banner: null },
  { id: 2, name: "맛있는 빵집", category: "음식", phone: "02-9876-5432", address: "서울시 마포구 합정동 56-7", desc: "수제 빵과 디저트", image: null, operatingHours: "매일 08:00 ~ 22:00", banner: null },
  { id: 3, name: "테크존 전자", category: "전자기기", phone: "031-555-1234", address: "경기도 성남시 분당구 정자동 89", desc: "가전/IT 기기 전문", image: null, operatingHours: "평일 10:00 ~ 19:00", banner: null },
  { id: 4, name: "그린라이프 마트", category: "생활용품", phone: "02-333-4444", address: "서울시 송파구 잠실동 200", desc: "친환경 생활용품 전문", image: null, operatingHours: "매일 10:00 ~ 21:00", banner: null },
  { id: 5, name: "북카페 서랍", category: "기타", phone: "02-777-8888", address: "서울시 종로구 삼청동 33", desc: "책과 커피가 있는 공간", image: null, operatingHours: "화~일 11:00 ~ 20:00", banner: null },
];

const MOCK_ORDERS = [
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

const MOCK_INQUIRIES = [
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

const MOCK_FAQ = [
  { id: 1, question: "배송은 얼마나 걸리나요?", answer: "주문 확인 후 1~3 영업일 내 발송되며, 발송 후 1~2일 내 수령 가능합니다." },
  { id: 2, question: "교환/반품은 어떻게 하나요?", answer: "수령 후 7일 이내 고객센터로 문의해주시면 교환/반품 접수가 가능합니다." },
  { id: 3, question: "결제 수단은 무엇이 있나요?", answer: "신용카드, 계좌이체, 간편결제(카카오페이, 네이버페이)를 지원합니다." },
  { id: 4, question: "회원 등급 혜택이 있나요?", answer: "현재 별도 등급 혜택은 없으며, 추후 업데이트 예정입니다." },
  { id: 5, question: "영업시간 외 문의는 어떻게 하나요?", answer: "챗봇을 통해 24시간 기본 문의가 가능하며, 상담사 연결은 영업시간 내 가능합니다." },
];

const MOCK_BOARD_POSTS = [
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

// ─── Helper Components ───────────────────────────────────────
const StatusBadge = ({ status }) => {
  const colors = {
    OPEN: "bg-blue-100 text-blue-700", IN_PROGRESS: "bg-yellow-100 text-yellow-700",
    WAITING: "bg-purple-100 text-purple-700", ON_HOLD: "bg-gray-100 text-gray-600",
    RESOLVED: "bg-green-100 text-green-700", "완료": "bg-green-100 text-green-700",
    "대기": "bg-yellow-100 text-yellow-700", "진행 중": "bg-blue-100 text-blue-700",
    "종료": "bg-gray-100 text-gray-600",
  };
  const labels = { OPEN: "신규", IN_PROGRESS: "진행 중", WAITING: "대기", ON_HOLD: "보류", RESOLVED: "해결" };
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[status] || "bg-gray-100 text-gray-600"}`}>{labels[status] || status}</span>;
};

const Avatar = ({ name, size = "w-8 h-8", bg = "bg-indigo-100 text-indigo-600" }) => (
  <div className={`${size} ${bg} rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0`}>
    {name?.[0] || "?"}
  </div>
);

const TabButton = ({ active, onClick, children, icon: Icon }) => (
  <button onClick={onClick} className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${active ? "border-indigo-500 text-indigo-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}>
    {Icon && <Icon size={16} />}{children}
  </button>
);

const Card = ({ children, className = "", onClick }) => (
  <div onClick={onClick} className={`bg-white rounded-xl border border-gray-200 shadow-sm ${onClick ? "cursor-pointer hover:shadow-md hover:border-indigo-200 transition-all" : ""} ${className}`}>
    {children}
  </div>
);

const Input = ({ label, ...props }) => (
  <div className="flex flex-col gap-1">
    {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
    <input className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400" {...props} />
  </div>
);

const Button = ({ children, variant = "primary", size = "md", className = "", ...props }) => {
  const base = "rounded-lg font-medium transition-colors flex items-center justify-center gap-1.5";
  const variants = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800",
    secondary: "bg-gray-100 text-gray-700 hover:bg-gray-200",
    outline: "border border-gray-300 text-gray-700 hover:bg-gray-50",
    danger: "bg-red-500 text-white hover:bg-red-600",
    ghost: "text-gray-600 hover:bg-gray-100",
  };
  const sizes = { sm: "px-3 py-1.5 text-xs", md: "px-4 py-2 text-sm", lg: "px-6 py-3 text-base" };
  return <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>{children}</button>;
};

// ─── AI Summary Generator ────────────────────────────────────
const generateAISummary = (inquiry) => {
  if (!inquiry.messages || inquiry.messages.length === 0) return "대화 내용 없음";
  const lastMsg = inquiry.messages[inquiry.messages.length - 1];
  const firstMsg = inquiry.messages[0];
  const msgCount = inquiry.messages.length;
  const customerMsgs = inquiry.messages.filter(m => m.sender === "customer");
  const operatorMsgs = inquiry.messages.filter(m => m.sender === "operator");

  // Extract key phrases from customer messages
  const keywords = customerMsgs.map(m => m.content).join(" ");

  // Generate contextual summary based on conversation state
  if (inquiry.status === "RESOLVED") {
    if (operatorMsgs.length > 0) {
      const lastOp = operatorMsgs[operatorMsgs.length - 1].content;
      const truncated = lastOp.length > 30 ? lastOp.slice(0, 30) + "..." : lastOp;
      return `[해결] ${truncated} (${msgCount}건 대화)`;
    }
    return `[해결] 고객 문의 처리 완료 (${msgCount}건 대화)`;
  }

  if (msgCount === 1) {
    const truncated = firstMsg.content.length > 35 ? firstMsg.content.slice(0, 35) + "..." : firstMsg.content;
    return `[대기중] 고객: "${truncated}"`;
  }

  if (lastMsg.sender === "customer") {
    const truncated = lastMsg.content.length > 30 ? lastMsg.content.slice(0, 30) + "..." : lastMsg.content;
    return `[고객 응답 대기] "${truncated}" (${msgCount}건)`;
  }

  if (lastMsg.sender === "operator") {
    const truncated = lastMsg.content.length > 30 ? lastMsg.content.slice(0, 30) + "..." : lastMsg.content;
    return `[상담사 응답 완료] "${truncated}" (${msgCount}건)`;
  }

  return `진행 중 대화 ${msgCount}건`;
};

// ─── Login Page ──────────────────────────────────────────────
const LoginPage = ({ onLogin, onGoRegister }) => {
  const [isOperator, setIsOperator] = useState(false);
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center"><MessageSquare size={22} className="text-white" /></div>
            <h1 className="text-2xl font-bold text-gray-900">HelpDesk</h1>
          </div>
          <p className="text-gray-500 text-sm">소규모 판매자를 위한 고객지원 플랫폼</p>
        </div>
        <Card className="p-6">
          <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
            <button onClick={() => setIsOperator(false)} className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${!isOperator ? "bg-white shadow text-indigo-600" : "text-gray-500"}`}>이용자 로그인</button>
            <button onClick={() => setIsOperator(true)} className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${isOperator ? "bg-white shadow text-indigo-600" : "text-gray-500"}`}>관리자 로그인</button>
          </div>
          <div className="space-y-4">
            <Input label="아이디" placeholder="아이디를 입력하세요" value={loginId} onChange={e => setLoginId(e.target.value)} />
            <Input label="비밀번호" type="password" placeholder="비밀번호를 입력하세요" value={password} onChange={e => setPassword(e.target.value)} />
            <Button className="w-full" size="lg" onClick={() => onLogin(isOperator ? "operator" : "customer")}>로그인</Button>
          </div>
          <div className="mt-4 text-center">
            <button onClick={() => onGoRegister(isOperator ? "operator" : "customer")} className="text-sm text-indigo-600 hover:underline">
              {isOperator ? "관리자 회원가입" : "회원가입"}
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};

// ─── Register Page ───────────────────────────────────────────
const RegisterPage = ({ type, onBack, onRegister }) => {
  const [form, setForm] = useState(type === "operator" ? { storeName: "", category: "의류", name: "", loginId: "", password: "", phone: "" } : { name: "", loginId: "", password: "", phone: "" });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="p-6">
          <button onClick={onBack} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"><ArrowLeft size={16} /> 돌아가기</button>
          <h2 className="text-xl font-bold mb-6">{type === "operator" ? "관리자 회원가입" : "이용자 회원가입"}</h2>
          <div className="space-y-4">
            {type === "operator" ? (<>
              <Input label="스토어명" value={form.storeName} onChange={e => set("storeName", e.target.value)} placeholder="스토어 이름" />
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">카테고리</label>
                <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm" value={form.category} onChange={e => set("category", e.target.value)}>
                  <option>의류</option><option>음식</option><option>전자기기</option><option>생활용품</option><option>기타</option>
                </select>
              </div>
              <Input label="대표자명" value={form.name} onChange={e => set("name", e.target.value)} placeholder="이름" />
              <Input label="아이디" value={form.loginId} onChange={e => set("loginId", e.target.value)} placeholder="아이디" />
              <Input label="비밀번호" type="password" value={form.password} onChange={e => set("password", e.target.value)} placeholder="비밀번호" />
              <Input label="전화번호" value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="010-0000-0000" />
            </>) : (<>
              <Input label="이름" value={form.name} onChange={e => set("name", e.target.value)} placeholder="이름" />
              <Input label="아이디" value={form.loginId} onChange={e => set("loginId", e.target.value)} placeholder="아이디" />
              <Input label="비밀번호" type="password" value={form.password} onChange={e => set("password", e.target.value)} placeholder="비밀번호" />
              <Input label="전화번호" value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="010-0000-0000" />
            </>)}
            <Button className="w-full" size="lg" onClick={onRegister}>가입하기</Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

// ─── Customer App ────────────────────────────────────────────
const CustomerApp = ({ onLogout }) => {
  const [page, setPage] = useState("main");
  const [selectedStore, setSelectedStore] = useState(null);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [storeTab, setStoreTab] = useState("chatbot");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [inquiries, setInquiries] = useState(MOCK_INQUIRIES);
  const [boardPosts] = useState(MOCK_BOARD_POSTS);
  const [chatbotHistory, setChatbotHistory] = useState([]);

  const openStore = (store, tab = "chatbot") => { setSelectedStore(store); setStoreTab(tab); setPage("store"); };
  const openInquiry = (inq) => { setSelectedInquiry(inq); setPage("inquiryDetail"); };

  // ─ Nav ─
  const Nav = () => (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="max-w-4xl mx-auto px-4 flex items-center justify-between h-14">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => { setPage("main"); setShowSearch(false); }}>
          <MessageSquare size={20} className="text-indigo-600" /><span className="font-bold text-gray-900">HelpDesk</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => { setShowSearch(!showSearch); if (page !== "search") setPage("search"); }} className="p-2 hover:bg-gray-100 rounded-lg"><Search size={18} /></button>
          <button onClick={() => setPage("settings")} className="p-2 hover:bg-gray-100 rounded-lg"><Settings size={18} /></button>
          <button onClick={onLogout} className="p-2 hover:bg-gray-100 rounded-lg text-red-500"><LogOut size={18} /></button>
        </div>
      </div>
    </div>
  );

  // ─ Main ─
  const MainPage = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-1">안녕하세요, 재철님</h2>
        <p className="text-sm text-gray-500">무엇을 도와드릴까요?</p>
      </div>

      {/* 최근 주문 */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-800">최근 주문</h3>
          <button onClick={() => setPage("orders")} className="text-xs text-indigo-600 flex items-center gap-0.5">주문 목록 <ChevronRight size={14} /></button>
        </div>
        <div className="space-y-2">
          {[...MOCK_ORDERS].sort((a, b) => b.orderedAt.localeCompare(a.orderedAt)).slice(0, 5).map(o => (
            <Card key={o.id} className="p-3 flex items-center justify-between" onClick={() => { const s = MOCK_STORES.find(s => s.id === o.storeId); if (s) { setSelectedOrder(o); openStore(s, "consult"); } }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center"><Package size={18} className="text-indigo-500" /></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{o.productName}</p>
                  <p className="text-xs text-gray-500">{o.storeName} · {o.orderedAt}</p>
                </div>
              </div>
              <span className="text-sm font-semibold text-gray-700">{o.totalPrice.toLocaleString()}원</span>
            </Card>
          ))}
        </div>
      </section>

      {/* 주문 스토어 */}
      <section>
        <h3 className="font-semibold text-gray-800 mb-3">주문했던 스토어</h3>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {MOCK_STORES.map(s => (
            <Card key={s.id} className="p-3 flex-shrink-0 w-36 text-center" onClick={() => openStore(s)}>
              <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-2"><Store size={20} className="text-indigo-500" /></div>
              <p className="text-sm font-medium text-gray-900 truncate">{s.name}</p>
              <p className="text-xs text-gray-400">{s.category}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* 진행중 상담 */}
      <section>
        <h3 className="font-semibold text-gray-800 mb-3">진행 중인 상담</h3>
        {inquiries.filter(i => i.status !== "RESOLVED").length === 0 ? (
          <p className="text-sm text-gray-400 py-4 text-center">진행 중인 상담이 없습니다</p>
        ) : inquiries.filter(i => i.status !== "RESOLVED").sort((a, b) => b.lastMessageAt.localeCompare(a.lastMessageAt)).slice(0, 5).map(inq => (
          <Card key={inq.id} className="p-3 mb-2" onClick={() => openInquiry(inq)}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MessageCircle size={18} className="text-indigo-500" />
                <div>
                  <p className="text-sm font-medium">{inq.title}</p>
                  <p className="text-xs text-gray-500">{inq.storeName}</p>
                </div>
              </div>
              <StatusBadge status={inq.status} />
            </div>
          </Card>
        ))}
      </section>

      {/* 최근 문의 */}
      <section>
        <h3 className="font-semibold text-gray-800 mb-3">최근 문의</h3>
        {[...inquiries].sort((a, b) => b.lastMessageAt.localeCompare(a.lastMessageAt)).slice(0, 5).map(inq => (
          <Card key={inq.id} className="p-3 mb-2" onClick={() => openInquiry(inq)}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{inq.title}</p>
                <p className="text-xs text-gray-500">{inq.lastMessageAt}</p>
              </div>
              <StatusBadge status={inq.status} />
            </div>
          </Card>
        ))}
      </section>
    </div>
  );

  // ─ Orders Page ─
  const OrdersPage = () => {
    const [filter, setFilter] = useState("latest");
    const [storeFilter, setStoreFilter] = useState("all");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const sorted = [...MOCK_ORDERS]
      .filter(o => storeFilter === "all" || o.storeId === parseInt(storeFilter))
      .filter(o => !dateFrom || o.orderedAt >= dateFrom)
      .filter(o => !dateTo || o.orderedAt <= dateTo)
      .sort((a, b) => filter === "latest" ? b.orderedAt.localeCompare(a.orderedAt) : a.orderedAt.localeCompare(b.orderedAt));

    return (
      <div>
        <div className="flex items-center gap-2 mb-4">
          <button onClick={() => setPage("main")} className="p-1"><ArrowLeft size={20} /></button>
          <h2 className="text-lg font-bold">주문 목록</h2>
        </div>
        <div className="flex gap-2 mb-4 flex-wrap">
          <select className="border rounded-lg px-3 py-1.5 text-sm" value={filter} onChange={e => setFilter(e.target.value)}>
            <option value="latest">최신순</option><option value="oldest">오래된순</option>
          </select>
          <select className="border rounded-lg px-3 py-1.5 text-sm" value={storeFilter} onChange={e => setStoreFilter(e.target.value)}>
            <option value="all">전체 스토어</option>
            {MOCK_STORES.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <input type="date" className="border rounded-lg px-3 py-1.5 text-sm" value={dateFrom} onChange={e => setDateFrom(e.target.value)} placeholder="시작일" />
          <input type="date" className="border rounded-lg px-3 py-1.5 text-sm" value={dateTo} onChange={e => setDateTo(e.target.value)} placeholder="종료일" />
        </div>
        <div className="space-y-2">
          {sorted.map(o => (
            <Card key={o.id} className="p-4" onClick={() => { const s = MOCK_STORES.find(s => s.id === o.storeId); if (s) { setSelectedOrder(o); openStore(s, "consult"); } }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500 font-mono">{o.orderNumber}</span>
                <span className="text-xs text-gray-400">{o.orderedAt}</span>
              </div>
              <p className="font-medium text-sm">{o.productName} <span className="text-gray-400">x{o.quantity}</span></p>
              <div className="flex justify-between mt-1">
                <span className="text-xs text-gray-500">{o.storeName}</span>
                <span className="text-sm font-semibold">{o.totalPrice.toLocaleString()}원</span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  // ─ Search ─
  const SearchPage = () => {
    const [q, setQ] = useState(searchQuery);
    const [tab, setTab] = useState("all");
    const [showSuggestions, setShowSuggestions] = useState(false);
    const cats = ["all", "의류", "음식", "전자기기", "생활용품", "기타"];
    const results = MOCK_STORES.filter(s => (tab === "all" || s.category === tab) && (!q || s.name.includes(q)));
    const suggestions = q.length > 0 ? MOCK_STORES.filter(s => s.name.includes(q)).slice(0, 5) : [];
    return (
      <div>
        <div className="flex items-center gap-2 mb-4">
          <button onClick={() => setPage("main")}><ArrowLeft size={20} /></button>
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className="w-full border rounded-lg pl-9 pr-3 py-2 text-sm" placeholder="스토어 검색..." value={q}
              onChange={e => { setQ(e.target.value); setShowSuggestions(true); }}
              onFocus={() => q && setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              autoFocus />
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-20 overflow-hidden">
                {suggestions.map(s => (
                  <button key={s.id} className="w-full text-left px-4 py-2.5 text-sm hover:bg-indigo-50 flex items-center gap-2 transition"
                    onMouseDown={() => { openStore(s); setShowSuggestions(false); }}>
                    <Store size={14} className="text-gray-400" />
                    <span>{s.name}</span>
                    <span className="text-xs text-gray-400 ml-auto">{s.category}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-2 mb-4 overflow-x-auto">
          {cats.map(c => (
            <button key={c} onClick={() => setTab(c)} className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${tab === c ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600"}`}>
              {c === "all" ? "전체" : c}
            </button>
          ))}
        </div>
        {!q && <p className="text-xs text-gray-400 mb-3">내가 주문한 적 있는 스토어</p>}
        <div className="space-y-2">
          {results.map(s => (
            <Card key={s.id} className="p-3 flex items-center gap-3" onClick={() => openStore(s)}>
              <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center"><Store size={18} className="text-indigo-500" /></div>
              <div><p className="text-sm font-medium">{s.name}</p><p className="text-xs text-gray-400">{s.category}</p></div>
            </Card>
          ))}
          {results.length === 0 && <p className="text-sm text-gray-400 text-center py-8">검색 결과가 없습니다</p>}
        </div>
      </div>
    );
  };

  // ─ Store Page ─
  const StorePage = () => {
    const [expanded, setExpanded] = useState(false);
    if (!selectedStore) return null;

    return (
      <div>
        <div className="flex items-center gap-2 mb-3">
          <button onClick={() => setPage("main")} className="flex items-center gap-1 text-sm text-gray-500"><ArrowLeft size={16} /> 뒤로</button>
          <div className="flex-1 relative" onClick={() => setPage("search")}>
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <div className="w-full border rounded-lg pl-8 pr-3 py-1.5 text-sm text-gray-400 cursor-pointer hover:border-indigo-300">스토어 검색...</div>
          </div>
        </div>
        {/* Store Header */}
        <Card className="p-4 mb-4" onClick={() => setExpanded(!expanded)}>
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center"><Store size={24} className="text-indigo-600" /></div>
            <div className="flex-1">
              <h2 className="font-bold text-lg">{selectedStore.name}</h2>
              <p className="text-xs text-gray-500">{selectedStore.category} · {selectedStore.desc}</p>
            </div>
            {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>
          {expanded && (
            <div className="mt-3 pt-3 border-t text-sm text-gray-600 space-y-1">
              <p className="flex items-center gap-2"><Phone size={14} /> {selectedStore.phone}</p>
              <p className="flex items-center gap-2"><MapPin size={14} /> {selectedStore.address}</p>
              <p className="flex items-center gap-2"><Clock size={14} /> {selectedStore.operatingHours}</p>
            </div>
          )}
        </Card>

        {/* Tabs */}
        <div className="flex border-b mb-4 overflow-x-auto">
          <TabButton active={storeTab === "chatbot"} onClick={() => setStoreTab("chatbot")} icon={Bot}>챗봇</TabButton>
          <TabButton active={storeTab === "consult"} onClick={() => setStoreTab("consult")} icon={MessageCircle}>상담</TabButton>
          <TabButton active={storeTab === "board"} onClick={() => setStoreTab("board")} icon={FileText}>문의</TabButton>
          <TabButton active={storeTab === "myInquiry"} onClick={() => setStoreTab("myInquiry")} icon={User}>나의 문의</TabButton>
        </div>

        {storeTab === "chatbot" && <ChatbotTab store={selectedStore} onHandoff={(chatHistory) => { setChatbotHistory(chatHistory); setStoreTab("consult"); }} />}
        {storeTab === "consult" && <ConsultTab store={selectedStore} order={selectedOrder} inquiries={inquiries} setInquiries={setInquiries} onOpenInquiry={openInquiry} chatbotHistory={chatbotHistory} clearChatbotHistory={() => setChatbotHistory([])} />}
        {storeTab === "board" && <BoardTab store={selectedStore} posts={boardPosts.filter(p => p.storeId === selectedStore.id)} />}
        {storeTab === "myInquiry" && <MyInquiryTab store={selectedStore} inquiries={inquiries.filter(i => i.storeId === selectedStore.id)} onOpenInquiry={openInquiry} />}
      </div>
    );
  };

  // ─ Chatbot Tab ─
  const ChatbotTab = ({ store, onHandoff }) => {
    const [messages, setMessages] = useState([{ id: 0, sender: "bot", content: `${store.name}에 오신 것을 환영합니다! 무엇을 도와드릴까요?` }]);
    const [input, setInput] = useState("");
    const [showFaq, setShowFaq] = useState(true);
    const chatEnd = useRef(null);
    useEffect(() => { chatEnd.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

    const send = () => {
      if (!input.trim()) return;
      const userMsg = { id: messages.length, sender: "user", content: input };
      const botReply = { id: messages.length + 1, sender: "bot", content: getBotReply(input) };
      setMessages(p => [...p, userMsg, botReply]);
      setInput("");
      setShowFaq(false);
    };

    const getBotReply = (q) => {
      if (q.includes("배송")) return "주문 확인 후 1~3 영업일 내 발송됩니다. 더 자세한 사항은 상담사에게 연결해드릴까요?";
      if (q.includes("교환") || q.includes("반품")) return "수령 후 7일 이내 교환/반품이 가능합니다. 자세한 안내가 필요하시면 상담사 연결을 눌러주세요.";
      if (q.includes("결제")) return "신용카드, 계좌이체, 간편결제를 지원합니다.";
      return "죄송합니다, 해당 질문에 대한 답변을 찾지 못했습니다. 상담사 연결을 통해 더 정확한 답변을 받으실 수 있습니다.";
    };

    const askFaq = (faq) => {
      setMessages(p => [...p, { id: p.length, sender: "user", content: faq.question }, { id: p.length + 1, sender: "bot", content: faq.answer }]);
      setShowFaq(false);
    };

    return (
      <div className="flex flex-col" style={{ height: "60vh" }}>
        <div className="flex-1 overflow-y-auto space-y-3 mb-3 pr-1">
          {messages.map(m => (
            <div key={m.id} className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}>
              {m.sender === "bot" && <Avatar name="B" bg="bg-green-100 text-green-600" />}
              <div className={`max-w-xs mx-2 px-3 py-2 rounded-2xl text-sm ${m.sender === "user" ? "bg-indigo-600 text-white rounded-br-md" : "bg-gray-100 text-gray-800 rounded-bl-md"}`}>
                {m.content}
              </div>
            </div>
          ))}
          <div ref={chatEnd} />
        </div>
        {showFaq && (
          <div className="mb-3 space-y-1">
            <p className="text-xs text-gray-400 mb-1">자주 묻는 질문</p>
            {MOCK_FAQ.map(f => (
              <button key={f.id} onClick={() => askFaq(f)} className="block w-full text-left px-3 py-2 bg-indigo-50 rounded-lg text-sm text-indigo-700 hover:bg-indigo-100 transition">{f.question}</button>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <input className="flex-1 border rounded-xl px-4 py-2 text-sm" placeholder="메시지를 입력하세요..." value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} />
          <Button onClick={send} className="rounded-xl"><Send size={16} /></Button>
        </div>
        <button onClick={() => onHandoff(messages)} className="mt-2 text-xs text-indigo-600 hover:underline text-center flex items-center justify-center gap-1">
          <ArrowRight size={14} /> 상담사 연결
        </button>
      </div>
    );
  };

  // ─ Consult Tab ─
  const ConsultTab = ({ store, order, inquiries, setInquiries, onOpenInquiry, chatbotHistory = [], clearChatbotHistory }) => {
    const [selectingOrder, setSelectingOrder] = useState(false);
    const [chosenOrder, setChosenOrder] = useState(order || null);
    const storeOrders = MOCK_ORDERS.filter(o => o.storeId === store.id);
    const activeInq = inquiries.find(i => i.storeId === store.id && i.status === "IN_PROGRESS");

    const startConsult = () => {
      const handoffMessages = chatbotHistory.length > 0
        ? [
            { id: 1, sender: "system", content: "챗봇에서 상담으로 전환되었습니다." },
            ...chatbotHistory.filter(m => m.sender !== "bot").map((m, idx) => ({
              id: idx + 2, sender: "customer", content: m.content, time: new Date().toLocaleString()
            })),
            { id: chatbotHistory.length + 2, sender: "system", content: `[챗봇 대화 요약] 고객이 챗봇에서 ${chatbotHistory.filter(m => m.sender === "user").length}건의 질문을 했으며, 해결되지 않아 상담사 연결을 요청했습니다.` }
          ]
        : [{ id: 1, sender: "system", content: "상담이 시작되었습니다." }];

      const newInq = {
        id: inquiries.length + 1, storeId: store.id, storeName: store.name, type: "상담",
        status: "IN_PROGRESS", title: chosenOrder ? `${chosenOrder.productName} 관련 상담` : "일반 상담",
        orderId: chosenOrder?.id, createdAt: new Date().toLocaleString(), lastMessageAt: new Date().toLocaleString(),
        messages: handoffMessages
      };
      setInquiries(p => [...p, newInq]);
      onOpenInquiry(newInq);
      if (clearChatbotHistory) clearChatbotHistory();
    };

    return (
      <div>
        <div className="bg-indigo-50 rounded-lg p-3 mb-4 text-sm">
          <p className="font-medium text-indigo-700 flex items-center gap-1"><Clock size={14} /> 상담 가능 시간</p>
          <p className="text-indigo-600 mt-1">{store.operatingHours}</p>
        </div>

        {activeInq ? (
          <Card className="p-4" onClick={() => onOpenInquiry(activeInq)}>
            <p className="text-sm font-medium mb-1">진행 중인 상담</p>
            <p className="text-xs text-gray-500">{activeInq.title}</p>
            <div className="flex justify-between items-center mt-2">
              <StatusBadge status={activeInq.status} />
              <ChevronRight size={16} className="text-gray-400" />
            </div>
          </Card>
        ) : (
          <div>
            <div onClick={() => setSelectingOrder(!selectingOrder)} className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center cursor-pointer hover:border-indigo-400 transition mb-3">
              <Plus size={20} className="mx-auto text-gray-400 mb-1" />
              <p className="text-sm text-gray-500">{chosenOrder ? chosenOrder.productName : "상담할 주문 내역 선택"}</p>
            </div>
            {selectingOrder && (
              <div className="mb-3 space-y-2">
                <button onClick={() => { setChosenOrder(null); setSelectingOrder(false); }} className="w-full text-left px-3 py-2 bg-gray-50 rounded-lg text-sm hover:bg-gray-100">일반 상담</button>
                {storeOrders.map(o => (
                  <button key={o.id} onClick={() => { setChosenOrder(o); setSelectingOrder(false); }} className="w-full text-left px-3 py-2 bg-gray-50 rounded-lg text-sm hover:bg-gray-100">
                    {o.productName} ({o.orderNumber})
                  </button>
                ))}
              </div>
            )}
            <Button className="w-full" onClick={startConsult}>상담 시작</Button>
          </div>
        )}
      </div>
    );
  };

  // ─ Board Tab ─
  const BoardTab = ({ store, posts: initialPosts }) => {
    const [view, setView] = useState("list");
    const [selectedPost, setSelectedPost] = useState(null);
    const [writing, setWriting] = useState(false);
    const [newPost, setNewPost] = useState({ title: "", content: "", isSecret: false, orderId: null, image: null });
    const [localPosts, setLocalPosts] = useState(initialPosts);
    const storeOrders = MOCK_ORDERS.filter(o => o.storeId === store.id);

    const submitPost = () => {
      if (!newPost.content.trim()) return;
      const linkedOrder = storeOrders.find(o => o.id === newPost.orderId);
      const post = {
        id: localPosts.length + 100,
        storeId: store.id,
        title: newPost.title || newPost.content.slice(0, 20) + "...",
        author: "서**",
        date: new Date().toISOString().slice(0, 10),
        time: new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" }),
        status: "대기",
        isSecret: newPost.isSecret,
        content: newPost.content,
        orderId: newPost.orderId,
        orderInfo: linkedOrder ? `${linkedOrder.productName} (${linkedOrder.orderNumber})` : null,
        image: newPost.image,
        answer: "",
      };
      setLocalPosts(p => [post, ...p]);
      setNewPost({ title: "", content: "", isSecret: false, orderId: null, image: null });
      setWriting(false);
    };

    if (writing) return (
      <div>
        <button onClick={() => setWriting(false)} className="flex items-center gap-1 text-sm text-gray-500 mb-3"><ArrowLeft size={16} /> 목록</button>
        <h3 className="font-bold mb-4">문의 작성</h3>
        <div className="space-y-3">
          <Input label="제목" value={newPost.title} onChange={e => setNewPost(p => ({ ...p, title: e.target.value }))} placeholder="제목 (선택, 미입력 시 본문 내용으로)" />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">본문</label>
            <textarea className="border rounded-lg px-3 py-2 text-sm h-32 resize-none" value={newPost.content} onChange={e => setNewPost(p => ({ ...p, content: e.target.value }))} placeholder="문의 내용을 작성하세요" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">주문 내용 참조</label>
            <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm" value={newPost.orderId || ""} onChange={e => setNewPost(p => ({ ...p, orderId: e.target.value ? parseInt(e.target.value) : null }))}>
              <option value="">선택 안 함</option>
              {storeOrders.map(o => <option key={o.id} value={o.id}>{o.productName} ({o.orderNumber})</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">이미지 첨부</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-indigo-400 transition">
              {newPost.image ? (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{newPost.image}</span>
                  <button onClick={() => setNewPost(p => ({ ...p, image: null }))} className="text-red-400 hover:text-red-600"><X size={16} /></button>
                </div>
              ) : (
                <div onClick={() => setNewPost(p => ({ ...p, image: "screenshot_" + Date.now() + ".png" }))}>
                  <Image size={20} className="mx-auto text-gray-400 mb-1" />
                  <p className="text-xs text-gray-400">클릭하여 이미지 첨부</p>
                </div>
              )}
            </div>
            {newPost.image && <p className="text-xs text-green-600">미리보기: 이미지가 첨부되었습니다</p>}
          </div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={newPost.isSecret} onChange={e => setNewPost(p => ({ ...p, isSecret: e.target.checked }))} /> <Lock size={14} /> 비밀글</label>
          <Button className="w-full" onClick={submitPost}>글 작성</Button>
        </div>
      </div>
    );

    if (selectedPost) return (
      <div>
        <button onClick={() => setSelectedPost(null)} className="flex items-center gap-1 text-sm text-gray-500 mb-3"><ArrowLeft size={16} /> 목록</button>
        <Card className="p-4">
          <h3 className="font-bold mb-1">{selectedPost.title}</h3>
          <p className="text-xs text-gray-500 mb-2">{selectedPost.date} {selectedPost.time || ""} · {selectedPost.author}</p>
          {selectedPost.orderInfo && (
            <div className="flex items-center gap-1.5 mb-2 bg-gray-50 rounded px-2 py-1.5">
              <Package size={13} className="text-gray-400" />
              <span className="text-xs text-gray-600">참조 주문: {selectedPost.orderInfo}</span>
            </div>
          )}
          <p className="text-sm text-gray-700 mb-3">{selectedPost.content}</p>
          {selectedPost.image && (
            <div className="mb-3 bg-gray-100 rounded-lg p-3 text-center">
              <Image size={24} className="mx-auto text-gray-400 mb-1" />
              <p className="text-xs text-gray-500">첨부 이미지: {selectedPost.image}</p>
            </div>
          )}
          {selectedPost.answer && (
            <div className="bg-indigo-50 rounded-lg p-3 mb-3">
              <p className="text-xs font-medium text-indigo-700 mb-1">답변</p>
              <p className="text-sm text-indigo-800">{selectedPost.answer}</p>
            </div>
          )}
          <div className="flex gap-2">
            {!selectedPost.answer && <Button size="sm" variant="outline" onClick={() => { setNewPost({ title: selectedPost.title, content: selectedPost.content, isSecret: selectedPost.isSecret, orderId: selectedPost.orderId || null, image: selectedPost.image }); setSelectedPost(null); setWriting(true); }}><Edit3 size={14} /> 수정</Button>}
            <Button size="sm" variant="ghost" onClick={() => setSelectedPost(null)}>목록</Button>
          </div>
        </Card>
      </div>
    );

    return (
      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold">문의 게시판</h3>
          <Button size="sm" onClick={() => setWriting(true)}><Edit3 size={14} /> 문의 작성</Button>
        </div>
        <div className="space-y-2">
          {localPosts.map(p => (
            <Card key={p.id} className="p-3" onClick={() => !p.isSecret && setSelectedPost(p)}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">#{p.id}</span>
                  {p.isSecret && <Lock size={12} className="text-gray-400" />}
                  <span className="text-sm">{p.isSecret ? "비밀글 입니다." : p.title}</span>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={p.status} />
                  <span className="text-xs text-gray-400">{p.author}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  // ─ My Inquiry Tab ─
  const MyInquiryTab = ({ inquiries, onOpenInquiry }) => {
    const [mode, setMode] = useState("consult");
    return (
      <div>
        <div className="flex gap-2 mb-4">
          <Button variant={mode === "consult" ? "primary" : "outline"} size="sm" onClick={() => setMode("consult")}>상담</Button>
          <Button variant={mode === "board" ? "primary" : "outline"} size="sm" onClick={() => setMode("board")}>문의</Button>
        </div>
        {mode === "consult" ? (
          <div className="space-y-2">
            {inquiries.filter(i => i.type === "상담").length === 0 ? <p className="text-sm text-gray-400 text-center py-4">상담 기록이 없습니다</p> :
              inquiries.filter(i => i.type === "상담").map(inq => (
                <Card key={inq.id} className="p-3" onClick={() => onOpenInquiry(inq)}>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium">{inq.title}</p>
                      <p className="text-xs text-gray-500">{inq.createdAt}</p>
                    </div>
                    <StatusBadge status={inq.status} />
                  </div>
                </Card>
              ))
            }
          </div>
        ) : (
          <div className="space-y-2">
            {inquiries.filter(i => i.type === "문의").length === 0 ? <p className="text-sm text-gray-400 text-center py-4">문의 기록이 없습니다</p> :
              inquiries.filter(i => i.type === "문의").map(inq => (
                <Card key={inq.id} className="p-3" onClick={() => onOpenInquiry(inq)}>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium">{inq.title}</p>
                      <p className="text-xs text-gray-500">{inq.createdAt}</p>
                    </div>
                    <StatusBadge status={inq.status} />
                  </div>
                </Card>
              ))
            }
          </div>
        )}
      </div>
    );
  };

  // ─ Inquiry Detail ─
  const InquiryDetailPage = () => {
    const [input, setInput] = useState("");
    const chatEnd = useRef(null);
    const inq = selectedInquiry;
    if (!inq) return null;
    useEffect(() => { chatEnd.current?.scrollIntoView({ behavior: "smooth" }); }, [inq?.messages]);

    const sendMsg = () => {
      if (!input.trim()) return;
      const updated = { ...inq, messages: [...inq.messages, { id: inq.messages.length + 1, sender: "customer", content: input, time: new Date().toLocaleString() }], lastMessageAt: new Date().toLocaleString() };
      setSelectedInquiry(updated);
      setInquiries(p => p.map(i => i.id === inq.id ? updated : i));
      setInput("");
    };

    return (
      <div className="flex flex-col" style={{ height: "calc(100vh - 120px)" }}>
        <div className="flex items-center gap-2 mb-3">
          <button onClick={() => setPage(selectedStore ? "store" : "main")}><ArrowLeft size={20} /></button>
          <div className="flex-1">
            <h3 className="font-bold text-sm">{inq.title}</h3>
            <p className="text-xs text-gray-500">{inq.storeName}</p>
          </div>
          <StatusBadge status={inq.status} />
        </div>

        {inq.orderId && (
          <div className="bg-gray-50 rounded-lg p-2 mb-3 text-xs text-gray-600 flex items-center gap-2">
            <Package size={14} />
            <span>주문: {MOCK_ORDERS.find(o => o.id === inq.orderId)?.productName || "N/A"}</span>
          </div>
        )}

        <div className="flex-1 overflow-y-auto space-y-3 mb-3">
          {inq.messages.map(m => (
            <div key={m.id} className={`flex ${m.sender === "customer" ? "justify-end" : m.sender === "system" ? "justify-center" : "justify-start"}`}>
              {m.sender === "system" ? (
                <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">{m.content}</span>
              ) : (
                <>
                  {m.sender === "operator" && <Avatar name="S" bg="bg-orange-100 text-orange-600" />}
                  <div className={`max-w-xs mx-2 px-3 py-2 rounded-2xl text-sm ${m.sender === "customer" ? "bg-indigo-600 text-white rounded-br-md" : "bg-gray-100 text-gray-800 rounded-bl-md"}`}>
                    {m.content}
                    {m.time && <p className={`text-xs mt-1 ${m.sender === "customer" ? "text-indigo-200" : "text-gray-400"}`}>{m.time}</p>}
                  </div>
                </>
              )}
            </div>
          ))}
          <div ref={chatEnd} />
        </div>

        {inq.status !== "RESOLVED" && inq.status !== "종료" ? (
          <div className="flex gap-2">
            <input className="flex-1 border rounded-xl px-4 py-2 text-sm" placeholder="메시지를 입력하세요..." value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && sendMsg()} />
            <Button onClick={sendMsg} className="rounded-xl"><Send size={16} /></Button>
          </div>
        ) : (
          <div className="text-center text-xs text-gray-400 py-2">상담이 종료되었습니다</div>
        )}
      </div>
    );
  };

  // ─ Settings ─
  const SettingsPage = () => (
    <div>
      <div className="flex items-center gap-2 mb-4"><button onClick={() => setPage("main")}><ArrowLeft size={20} /></button><h2 className="text-lg font-bold">설정</h2></div>
      <Card className="p-4 space-y-4">
        <Input label="이름" defaultValue="서재철" />
        <Input label="전화번호" defaultValue="010-1234-5678" />
        <Input label="이메일" defaultValue="sikeon3329@kunsan.ac.kr" />
        <Button className="w-full">저장</Button>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Nav />
      <div className="max-w-4xl mx-auto px-4 py-6">
        {page === "main" && <MainPage />}
        {page === "orders" && <OrdersPage />}
        {page === "search" && <SearchPage />}
        {page === "store" && <StorePage />}
        {page === "inquiryDetail" && <InquiryDetailPage />}
        {page === "settings" && <SettingsPage />}
      </div>
    </div>
  );
};

// ─── Operator App ────────────────────────────────────────────
const OperatorApp = ({ onLogout }) => {
  const [page, setPage] = useState("main");
  const [inquiries, setInquiries] = useState(MOCK_INQUIRIES);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [sideNav, setSideNav] = useState(false);
  const [prevPage, setPrevPage] = useState("main");
  const storeName = "패션스토어 루미";

  const openInquiry = (inq) => { setPrevPage(page); setSelectedInquiry(inq); setPage("inquiryDetail"); };

  // ─ Nav ─
  const OperatorNav = () => (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="max-w-5xl mx-auto px-4 flex items-center justify-between h-14">
        <div className="flex items-center gap-3">
          <button onClick={() => setSideNav(!sideNav)} className="p-1 lg:hidden"><Menu size={20} /></button>
          <div className="flex items-baseline gap-2 cursor-pointer" onClick={() => setPage("main")}>
            <span className="font-bold text-gray-900">{storeName}</span>
            <span className="text-xs text-gray-400">관리자</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setPage("main")} className={`p-2 rounded-lg ${page === "main" ? "bg-indigo-50 text-indigo-600" : "hover:bg-gray-100"}`}><Home size={18} /></button>
          <button onClick={() => setPage("channel")} className={`p-2 rounded-lg ${page === "channel" ? "bg-indigo-50 text-indigo-600" : "hover:bg-gray-100"}`}><MessageSquare size={18} /></button>
          <button onClick={() => setPage("stats")} className={`p-2 rounded-lg ${page === "stats" ? "bg-indigo-50 text-indigo-600" : "hover:bg-gray-100"}`}><BarChart3 size={18} /></button>
          <button onClick={() => setPage("settings")} className={`p-2 rounded-lg ${page === "settings" ? "bg-indigo-50 text-indigo-600" : "hover:bg-gray-100"}`}><Settings size={18} /></button>
          <button onClick={onLogout} className="p-2 hover:bg-gray-100 rounded-lg text-red-500 ml-2"><LogOut size={18} /></button>
        </div>
      </div>
    </div>
  );

  // ─ Operator Main ─
  const OperatorMain = () => {
    const [ratePeriod, setRatePeriod] = useState("7일");
    const [countPeriod, setCountPeriod] = useState("1일");

    const filterByPeriod = (list, period) => {
      const now = new Date();
      const days = period === "1일" ? 1 : period === "7일" ? 7 : period === "30일" ? 30 : 9999;
      return list.filter(i => {
        const d = new Date(i.createdAt);
        return (now - d) / 86400000 <= days;
      });
    };

    const rateFiltered = filterByPeriod(inquiries, ratePeriod);
    const rateTotal = rateFiltered.length;
    const rateResolved = rateFiltered.filter(i => i.status === "RESOLVED").length;
    const rate = rateTotal ? Math.round((rateResolved / rateTotal) * 100) : 0;

    const countFiltered = filterByPeriod(inquiries, countPeriod);

    return (
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Card className="p-4 text-center">
            <div className="relative w-20 h-20 mx-auto mb-2">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <circle cx="18" cy="18" r="15.5" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                <circle cx="18" cy="18" r="15.5" fill="none" stroke="#6366f1" strokeWidth="3" strokeDasharray={`${rate} ${100 - rate}`} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-sm font-bold">{rateResolved}/{rateTotal}</div>
            </div>
            <p className="text-xs text-gray-500">상담 완료율</p>
            <div className="flex justify-center gap-1 mt-2">
              {["7일", "30일", "전체"].map(l => <button key={l} onClick={() => setRatePeriod(l)} className={`text-xs px-2 py-0.5 rounded ${ratePeriod === l ? "bg-indigo-100 text-indigo-600" : "text-gray-400 hover:text-gray-600"}`}>{l}</button>)}
            </div>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-3xl font-bold text-indigo-600 mb-1">{countFiltered.length}</p>
            <p className="text-xs text-gray-500">문의량</p>
            <div className="flex justify-center gap-1 mt-2">
              {["1일", "7일", "30일", "전체"].map(l => <button key={l} onClick={() => setCountPeriod(l)} className={`text-xs px-2 py-0.5 rounded ${countPeriod === l ? "bg-indigo-100 text-indigo-600" : "text-gray-400 hover:text-gray-600"}`}>{l}</button>)}
            </div>
          </Card>
          <Card className="p-4 text-center hidden md:block">
            <p className="text-3xl font-bold text-green-600 mb-1">{(() => {
              const times = inquiries.filter(i => i.messages && i.messages.length >= 2).map(inq => {
                const fc = inq.messages.find(m => m.sender === "customer");
                const fo = inq.messages.find(m => m.sender === "operator");
                if (!fc || !fo || !fc.time || !fo.time) return null;
                const diff = new Date(fo.time) - new Date(fc.time);
                return diff > 0 ? diff : null;
              }).filter(Boolean);
              if (times.length === 0) return "N/A";
              return Math.round(times.reduce((a, b) => a + b, 0) / times.length / 60000) + "분";
            })()}</p>
            <p className="text-xs text-gray-500">평균 첫 응답시간</p>
          </Card>
        </div>

        {/* Recent Consults */}
        <section>
          <h3 className="font-semibold text-gray-800 mb-3">최근 상담</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[...inquiries].filter(i => i.type === "상담").sort((a, b) => b.lastMessageAt.localeCompare(a.lastMessageAt)).slice(0, 5).map(inq => {
              const order = MOCK_ORDERS.find(o => o.id === inq.orderId);
              return (
                <Card key={inq.id} className="p-3" onClick={() => openInquiry(inq)}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <Avatar name={order?.customerName} size="w-6 h-6" bg="bg-blue-100 text-blue-600" />
                      <span className="text-sm font-semibold text-gray-800">{order?.customerName || "고객"}</span>
                    </div>
                    <StatusBadge status={inq.status} />
                  </div>
                  {order && (
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Package size={12} className="text-gray-400" />
                      <span className="text-xs text-gray-500">{order.productName} · {order.orderNumber}</span>
                    </div>
                  )}
                  <div className="bg-gray-50 rounded-md px-2.5 py-1.5 mb-1.5">
                    <div className="flex items-start gap-1">
                      <Bot size={12} className="text-indigo-400 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-gray-600 leading-relaxed">{generateAISummary(inq)}</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400">최근: {inq.lastMessageAt}</p>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Recent Inquiries */}
        <section>
          <h3 className="font-semibold text-gray-800 mb-3">최근 문의</h3>
          {[...inquiries].filter(i => i.type === "문의").sort((a, b) => b.lastMessageAt.localeCompare(a.lastMessageAt)).slice(0, 5).map(inq => {
            const order = MOCK_ORDERS.find(o => o.id === inq.orderId);
            return (
              <Card key={inq.id} className="p-3 mb-2" onClick={() => openInquiry(inq)}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <Avatar name={order?.customerName} size="w-6 h-6" bg="bg-emerald-100 text-emerald-600" />
                    <span className="text-sm font-semibold text-gray-800">{order?.customerName || "고객"}</span>
                    {order && <span className="text-xs text-gray-400">· {order.productName}</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={inq.status} />
                    <ChevronRight size={14} className="text-gray-400" />
                  </div>
                </div>
                <div className="bg-gray-50 rounded-md px-2.5 py-1.5">
                  <div className="flex items-start gap-1">
                    <Bot size={12} className="text-indigo-400 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-gray-600">{generateAISummary(inq)}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </section>

        {/* Orders */}
        <section>
          <h3 className="font-semibold text-gray-800 mb-3">주문 목록</h3>
          {MOCK_ORDERS.filter(o => o.storeId === 1).slice(0, 10).map(o => (
            <OrderRow key={o.id} order={o} inquiries={inquiries} onOpenInquiry={openInquiry} />
          ))}
        </section>
      </div>
    );
  };

  const OrderRow = ({ order, inquiries, onOpenInquiry }) => {
    const [expanded, setExpanded] = useState(false);
    const linked = inquiries.filter(i => i.orderId === order.id);
    return (
      <Card className="p-3 mb-2">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">{order.productName}</p>
            <p className="text-xs text-gray-500">{order.orderNumber} · {order.orderedAt}</p>
          </div>
          <button onClick={() => setExpanded(!expanded)} className="p-1">{expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</button>
        </div>
        {expanded && linked.length > 0 && (
          <div className="mt-2 pt-2 border-t space-y-1">
            {linked.map(inq => (
              <div key={inq.id} onClick={() => onOpenInquiry(inq)} className="flex items-center justify-between px-2 py-1 bg-gray-50 rounded cursor-pointer hover:bg-gray-100">
                <span className="text-xs">{inq.title}</span>
                <StatusBadge status={inq.status} />
              </div>
            ))}
          </div>
        )}
        {expanded && linked.length === 0 && <p className="text-xs text-gray-400 mt-2 pt-2 border-t">연결된 상담/문의 없음</p>}
      </Card>
    );
  };

  // ─ Channel ─
  const ChannelPage = () => {
    const [tab, setTab] = useState("consult");
    const [filter, setFilter] = useState("latest");
    const [searchQ, setSearchQ] = useState("");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const list = inquiries
      .filter(i => tab === "consult" ? i.type === "상담" : i.type === "문의")
      .filter(i => !searchQ || i.title.includes(searchQ) || i.storeName.includes(searchQ) || (MOCK_ORDERS.find(o => o.id === i.orderId)?.customerName || "").includes(searchQ))
      .filter(i => !dateFrom || i.createdAt.slice(0, 10) >= dateFrom)
      .filter(i => !dateTo || i.createdAt.slice(0, 10) <= dateTo)
      .sort((a, b) => filter === "latest" ? b.lastMessageAt.localeCompare(a.lastMessageAt) : a.lastMessageAt.localeCompare(b.lastMessageAt));

    return (
      <div>
        <h2 className="text-lg font-bold mb-4">상담·문의 관리</h2>
        <div className="flex border-b mb-4">
          <TabButton active={tab === "consult"} onClick={() => setTab("consult")} icon={MessageCircle}>상담 내역</TabButton>
          <TabButton active={tab === "board"} onClick={() => setTab("board")} icon={FileText}>문의 내역</TabButton>
        </div>
        <div className="flex gap-2 mb-2 flex-wrap">
          <div className="flex-1 relative min-w-[150px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className="w-full border rounded-lg pl-8 pr-3 py-1.5 text-sm" placeholder="이름, 제목, 스토어 검색..." value={searchQ} onChange={e => setSearchQ(e.target.value)} />
          </div>
          <select className="border rounded-lg px-2 py-1.5 text-sm" value={filter} onChange={e => setFilter(e.target.value)}>
            <option value="latest">최신순</option><option value="oldest">오래된순</option>
          </select>
        </div>
        <div className="flex gap-2 mb-4 items-center">
          <span className="text-xs text-gray-500">기간:</span>
          <input type="date" className="border rounded-lg px-2 py-1 text-xs" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
          <span className="text-xs text-gray-400">~</span>
          <input type="date" className="border rounded-lg px-2 py-1 text-xs" value={dateTo} onChange={e => setDateTo(e.target.value)} />
          {(dateFrom || dateTo) && <button onClick={() => { setDateFrom(""); setDateTo(""); }} className="text-xs text-red-400 hover:text-red-600">초기화</button>}
        </div>
        <div className="space-y-2">
          {list.map(inq => {
            const order = MOCK_ORDERS.find(o => o.id === inq.orderId);
            return (
              <Card key={inq.id} className="p-3" onClick={() => openInquiry(inq)}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <Avatar name={order?.customerName} size="w-6 h-6" bg="bg-blue-100 text-blue-600" />
                    <span className="text-sm font-semibold">{order?.customerName || "고객"}</span>
                    {order && <span className="text-xs text-gray-400">· {order.productName} ({order.orderNumber})</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={inq.status} />
                    <ChevronRight size={14} className="text-gray-400" />
                  </div>
                </div>
                <div className="bg-gray-50 rounded-md px-2.5 py-1.5 mb-1">
                  <div className="flex items-start gap-1">
                    <Bot size={12} className="text-indigo-400 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-gray-600">{generateAISummary(inq)}</p>
                  </div>
                </div>
                <p className="text-xs text-gray-400">{inq.lastMessageAt}</p>
              </Card>
            );
          })}
        </div>
      </div>
    );
  };

  // ─ Inquiry Detail (Operator) ─
  const OperatorInquiryDetail = () => {
    const [input, setInput] = useState("");
    const [noteInput, setNoteInput] = useState("");
    const [notes, setNotes] = useState([]);
    const [showNotes, setShowNotes] = useState(false);
    const chatEnd = useRef(null);
    const inq = selectedInquiry;
    if (!inq) return null;
    useEffect(() => { chatEnd.current?.scrollIntoView({ behavior: "smooth" }); }, [inq?.messages]);

    const order = MOCK_ORDERS.find(o => o.id === inq.orderId);

    const sendMsg = () => {
      if (!input.trim()) return;
      const updated = { ...inq, messages: [...inq.messages, { id: inq.messages.length + 1, sender: "operator", content: input, time: new Date().toLocaleString() }], lastMessageAt: new Date().toLocaleString() };
      setSelectedInquiry(updated);
      setInquiries(p => p.map(i => i.id === inq.id ? updated : i));
      setInput("");
    };

    const changeStatus = (status) => {
      const updated = { ...inq, status };
      setSelectedInquiry(updated);
      setInquiries(p => p.map(i => i.id === inq.id ? updated : i));
    };

    const addNote = () => {
      if (!noteInput.trim()) return;
      setNotes(p => [...p, { id: p.length + 1, content: noteInput, time: new Date().toLocaleString() }]);
      setNoteInput("");
    };

    return (
      <div>
        <div className="flex items-center gap-2 mb-4">
          <button onClick={() => setPage(prevPage || "main")}><ArrowLeft size={20} /></button>
          <div className="flex-1">
            <h3 className="font-bold">{inq.title}</h3>
            <p className="text-xs text-gray-500">#{inq.id} · {inq.storeName} · {inq.type}</p>
          </div>
          <StatusBadge status={inq.status} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Main Chat */}
          <div className="lg:col-span-2">
            {/* Customer & Order Info */}
            {order && (
              <Card className="p-3 mb-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1 flex items-center gap-1"><User size={12} /> 고객 정보</p>
                    <div className="text-sm space-y-0.5">
                      <p className="font-medium">{order.customerName}</p>
                      <p className="text-gray-500 flex items-center gap-1"><Phone size={11} /> {order.phone}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1 flex items-center gap-1"><Package size={12} /> 주문 정보</p>
                    <div className="text-sm space-y-0.5">
                      <p>{order.productName} x{order.quantity}</p>
                      <p className="text-gray-500">{order.orderNumber} · {order.orderedAt}</p>
                      <p className="font-medium">{order.totalPrice.toLocaleString()}원</p>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Messages */}
            <Card className="p-4" style={{ height: "50vh" }}>
              <div className="h-full flex flex-col">
                <div className="flex-1 overflow-y-auto space-y-3 mb-3">
                  {inq.messages.map(m => (
                    <div key={m.id} className={`flex ${m.sender === "operator" ? "justify-end" : m.sender === "system" ? "justify-center" : "justify-start"}`}>
                      {m.sender === "system" ? (
                        <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">{m.content}</span>
                      ) : (
                        <>
                          {m.sender === "customer" && <Avatar name="고" bg="bg-blue-100 text-blue-600" />}
                          <div className={`max-w-sm mx-2 px-3 py-2 rounded-2xl text-sm ${m.sender === "operator" ? "bg-indigo-600 text-white rounded-br-md" : "bg-gray-100 text-gray-800 rounded-bl-md"}`}>
                            {m.content}
                            {m.time && <p className={`text-xs mt-1 ${m.sender === "operator" ? "text-indigo-200" : "text-gray-400"}`}>{m.time}</p>}
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                  <div ref={chatEnd} />
                </div>
                {inq.status !== "RESOLVED" ? (
                  <div className="flex gap-2">
                    <input className="flex-1 border rounded-xl px-4 py-2 text-sm" placeholder="답변을 입력하세요..." value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && sendMsg()} />
                    <Button onClick={sendMsg} className="rounded-xl"><Send size={16} /></Button>
                  </div>
                ) : (
                  <p className="text-center text-xs text-gray-400">해결된 문의입니다</p>
                )}
              </div>
            </Card>

            {/* Status Controls */}
            <div className="flex flex-wrap gap-2 mt-3">
              {["IN_PROGRESS", "RESOLVED"].map(s => (
                <Button key={s} size="sm" variant={inq.status === s ? "primary" : "outline"} onClick={() => changeStatus(s)}>
                  {s === "IN_PROGRESS" ? "진행 중" : "해결"}
                </Button>
              ))}
            </div>
          </div>

          {/* Side Panel */}
          <div className="space-y-4">
            {/* Internal Notes */}
            <Card className="p-4">
              <h4 className="font-semibold text-sm mb-3 flex items-center gap-1"><Clipboard size={14} /> 내부 메모</h4>
              <div className="space-y-2 mb-3 max-h-40 overflow-y-auto">
                {notes.length === 0 ? <p className="text-xs text-gray-400">메모가 없습니다</p> :
                  notes.map(n => (
                    <div key={n.id} className="bg-yellow-50 rounded p-2 text-xs">
                      <p>{n.content}</p>
                      <p className="text-gray-400 mt-1">{n.time}</p>
                    </div>
                  ))
                }
              </div>
              <div className="flex gap-1">
                <input className="flex-1 border rounded px-2 py-1 text-xs" placeholder="메모 입력..." value={noteInput} onChange={e => setNoteInput(e.target.value)} onKeyDown={e => e.key === "Enter" && addNote()} />
                <Button size="sm" onClick={addNote}>추가</Button>
              </div>
            </Card>

            {/* AI Summary */}
            <Card className="p-4">
              <h4 className="font-semibold text-sm mb-2 flex items-center gap-1"><Star size={14} /> AI 요약</h4>
              <p className="text-xs text-gray-600 leading-relaxed">고객이 {order?.productName || "상품"} 관련하여 문의했습니다. 주요 이슈는 사이즈 교환/제품 문의이며, 현재 {inq.status === "RESOLVED" ? "해결" : "처리 중"}입니다.</p>
            </Card>

            {/* Quick Presets */}
            <Card className="p-4">
              <h4 className="font-semibold text-sm mb-2 flex items-center gap-1"><HelpCircle size={14} /> 빠른 답변</h4>
              <div className="space-y-1">
                {["교환/반품은 7일 이내 가능합니다.", "배송은 1~3 영업일 소요됩니다.", "확인 후 안내드리겠습니다."].map((preset, i) => (
                  <button key={i} onClick={() => setInput(preset)} className="block w-full text-left px-2 py-1.5 bg-gray-50 rounded text-xs hover:bg-gray-100 transition">{preset}</button>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  };

  // ─ Stats ─
  const StatsPage = () => {
    const [ratePeriod, setRatePeriod] = useState("7일");
    const [countPeriod, setCountPeriod] = useState("1일");
    const [inquiryRatePeriod, setInquiryRatePeriod] = useState("7일");

    const filterByPeriod = (list, period) => {
      const now = new Date();
      const days = period === "1일" ? 1 : period === "7일" ? 7 : period === "30일" ? 30 : 9999;
      return list.filter(i => {
        const d = new Date(i.createdAt);
        return (now - d) / 86400000 <= days;
      });
    };

    // 상담 완료율
    const consultFiltered = filterByPeriod(inquiries.filter(i => i.type === "상담"), ratePeriod);
    const consultTotal = consultFiltered.length;
    const consultResolved = consultFiltered.filter(i => i.status === "RESOLVED").length;
    const consultRate = consultTotal ? Math.round((consultResolved / consultTotal) * 100) : 0;

    // 문의 완료율
    const inquiryFiltered = filterByPeriod(inquiries.filter(i => i.type === "문의"), inquiryRatePeriod);
    const inquiryTotal = inquiryFiltered.length;
    const inquiryResolved = inquiryFiltered.filter(i => i.status === "RESOLVED").length;
    const inquiryRate = inquiryTotal ? Math.round((inquiryResolved / inquiryTotal) * 100) : 0;

    const countFiltered = filterByPeriod(inquiries, countPeriod);

    // 평균 첫 응답 시간 계산 (고객 첫 메시지 → 운영자 첫 응답)
    const avgResponseTime = (() => {
      const times = inquiries.filter(i => i.messages && i.messages.length >= 2).map(inq => {
        const firstCustomer = inq.messages.find(m => m.sender === "customer");
        const firstOperator = inq.messages.find(m => m.sender === "operator");
        if (!firstCustomer || !firstOperator || !firstCustomer.time || !firstOperator.time) return null;
        const diff = new Date(firstOperator.time) - new Date(firstCustomer.time);
        return diff > 0 ? diff : null;
      }).filter(Boolean);
      if (times.length === 0) return "N/A";
      const avgMs = times.reduce((a, b) => a + b, 0) / times.length;
      const mins = Math.round(avgMs / 60000);
      return mins > 0 ? `${mins}분` : "1분 미만";
    })();

    return (
      <div>
        <h2 className="text-lg font-bold mb-4">통계</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* 상담 완료율 */}
          <Card className="p-6 text-center">
            <div className="relative w-28 h-28 mx-auto mb-3">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <circle cx="18" cy="18" r="15.5" fill="none" stroke="#e5e7eb" strokeWidth="2.5" />
                <circle cx="18" cy="18" r="15.5" fill="none" stroke="#6366f1" strokeWidth="2.5" strokeDasharray={`${consultRate} ${100 - consultRate}`} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-lg font-bold">{consultResolved}/{consultTotal}</span>
                <span className="text-xs text-gray-400">{consultRate}%</span>
              </div>
            </div>
            <p className="font-medium text-sm">상담 완료율</p>
            <div className="flex justify-center gap-1 mt-2">
              {["7일", "30일", "전체"].map(l => <button key={l} onClick={() => setRatePeriod(l)} className={`text-xs px-2 py-0.5 rounded ${ratePeriod === l ? "bg-indigo-100 text-indigo-600" : "text-gray-400 hover:text-gray-600"}`}>{l}</button>)}
            </div>
          </Card>

          {/* 문의 완료율 */}
          <Card className="p-6 text-center">
            <div className="relative w-28 h-28 mx-auto mb-3">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <circle cx="18" cy="18" r="15.5" fill="none" stroke="#e5e7eb" strokeWidth="2.5" />
                <circle cx="18" cy="18" r="15.5" fill="none" stroke="#10b981" strokeWidth="2.5" strokeDasharray={`${inquiryRate} ${100 - inquiryRate}`} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-lg font-bold">{inquiryResolved}/{inquiryTotal}</span>
                <span className="text-xs text-gray-400">{inquiryRate}%</span>
              </div>
            </div>
            <p className="font-medium text-sm">문의 완료율</p>
            <div className="flex justify-center gap-1 mt-2">
              {["7일", "30일", "전체"].map(l => <button key={l} onClick={() => setInquiryRatePeriod(l)} className={`text-xs px-2 py-0.5 rounded ${inquiryRatePeriod === l ? "bg-green-100 text-green-600" : "text-gray-400 hover:text-gray-600"}`}>{l}</button>)}
            </div>
          </Card>

          {/* 문의량 */}
          <Card className="p-6 text-center">
            <p className="text-4xl font-bold text-indigo-600 mb-2">{countFiltered.length}</p>
            <p className="font-medium text-sm">총 문의량</p>
            <div className="flex justify-center gap-1 mt-2">
              {["1일", "7일", "30일", "전체"].map(l => <button key={l} onClick={() => setCountPeriod(l)} className={`text-xs px-2 py-0.5 rounded ${countPeriod === l ? "bg-indigo-100 text-indigo-600" : "text-gray-400 hover:text-gray-600"}`}>{l}</button>)}
            </div>
          </Card>

          {/* 평균 응답시간 - 실제 계산 */}
          <Card className="p-6 text-center">
            <p className="text-4xl font-bold text-green-600 mb-2">{avgResponseTime}</p>
            <p className="font-medium text-sm">평균 첫 응답시간</p>
            <p className="text-xs text-gray-400 mt-1">고객 메시지 → 상담사 첫 응답</p>
          </Card>

          {/* 챗봇 전환율 */}
          <Card className="p-6 text-center">
            <p className="text-4xl font-bold text-amber-600 mb-2">35%</p>
            <p className="font-medium text-sm">챗봇 → 상담 전환율</p>
          </Card>
        </div>
      </div>
    );
  };

  // ─ Operator Settings ─
  const OperatorSettings = () => {
    const [tab, setTab] = useState("chatbot");
    const [files, setFiles] = useState([{ id: 1, name: "FAQ_안내.txt", size: "2.3KB" }, { id: 2, name: "반품정책.txt", size: "1.8KB" }]);
    const [presets, setPresets] = useState(MOCK_FAQ.slice(0, 3).map((f, i) => ({ ...f, id: i + 1 })));

    return (
      <div>
        <h2 className="text-lg font-bold mb-4">스토어 설정</h2>
        <div className="flex border-b mb-4">
          <TabButton active={tab === "chatbot"} onClick={() => setTab("chatbot")} icon={Bot}>챗봇 관리</TabButton>
          <TabButton active={tab === "store"} onClick={() => setTab("store")} icon={Store}>스토어 관리</TabButton>
        </div>

        {tab === "chatbot" && (
          <div className="space-y-6">
            {/* Knowledge Files */}
            <Card className="p-4">
              <h3 className="font-semibold text-sm mb-3">챗봇 적용 정보 관리</h3>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center mb-3 hover:border-indigo-400 cursor-pointer transition">
                <Upload size={24} className="mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">txt 파일을 드래그하거나 클릭하여 업로드</p>
              </div>
              <div className="space-y-2">
                {files.map(f => (
                  <div key={f.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2">
                      <FileText size={14} className="text-gray-400" />
                      <span className="text-sm">{f.name}</span>
                      <span className="text-xs text-gray-400">{f.size}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button className="p-1 hover:bg-gray-200 rounded"><Eye size={14} /></button>
                      <button onClick={() => setFiles(p => p.filter(x => x.id !== f.id))} className="p-1 hover:bg-red-100 rounded text-red-500"><X size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Presets */}
            <Card className="p-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-sm">프리셋 관리 (최대 5개)</h3>
                <Button size="sm" variant="outline" onClick={() => setPresets([])}>초기화</Button>
              </div>
              <div className="space-y-3">
                {[0, 1, 2, 3, 4].map(i => (
                  <div key={i} className="border rounded-lg p-3">
                    <Input label={`질문 ${i + 1}`} defaultValue={presets[i]?.question || ""} placeholder="자주 묻는 질문" />
                    <div className="mt-2">
                      <label className="text-sm font-medium text-gray-700">답변</label>
                      <textarea className="w-full border rounded-lg px-3 py-2 text-sm h-16 resize-none mt-1" defaultValue={presets[i]?.answer || ""} placeholder="답변 내용" />
                    </div>
                  </div>
                ))}
              </div>
              <Button className="w-full mt-3">저장</Button>
            </Card>
          </div>
        )}

        {tab === "store" && (
          <Card className="p-4 space-y-4">
            <h3 className="font-semibold text-sm">스토어 정보</h3>
            <Input label="전화번호" defaultValue="02-1234-5678" />
            <Input label="주소" defaultValue="서울시 강남구" />
            <Input label="상담 운영 시간" defaultValue="평일 09:00 ~ 18:00" />
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">소개글</label>
              <textarea className="border rounded-lg px-3 py-2 text-sm h-24 resize-none" defaultValue="트렌디한 의류 전문 스토어" />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1"><Eye size={16} /> 프리뷰</Button>
              <Button className="flex-1">저장</Button>
            </div>
          </Card>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <OperatorNav />
      <div className="max-w-5xl mx-auto px-4 py-6">
        {page === "main" && <OperatorMain />}
        {page === "channel" && <ChannelPage />}
        {page === "inquiryDetail" && <OperatorInquiryDetail />}
        {page === "stats" && <StatsPage />}
        {page === "settings" && <OperatorSettings />}
      </div>
    </div>
  );
};

// ─── Main App ────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState("login");
  const [registerType, setRegisterType] = useState(null);

  if (screen === "login") return <LoginPage onLogin={role => setScreen(role)} onGoRegister={type => { setRegisterType(type); setScreen("register"); }} />;
  if (screen === "register") return <RegisterPage type={registerType} onBack={() => setScreen("login")} onRegister={() => setScreen("login")} />;
  if (screen === "customer") return <CustomerApp onLogout={() => setScreen("login")} />;
  if (screen === "operator") return <OperatorApp onLogout={() => setScreen("login")} />;
  return null;
}
