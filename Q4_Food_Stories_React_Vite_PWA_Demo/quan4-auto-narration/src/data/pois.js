export const LANGUAGES = [
  { code: 'vi', label: 'Tiếng Việt', short: 'VI', speech: 'vi-VN' },
  { code: 'en', label: 'English', short: 'EN', speech: 'en-US' },
  { code: 'ja', label: '日本語', short: 'JA', speech: 'ja-JP' },
  { code: 'ko', label: '한국어', short: 'KO', speech: 'ko-KR' }
]

// Kiểm tra lại tọa độ và thông tin địa điểm định kỳ trước khi phát hành nội dung mới.
export const POIS = [
  {
    id: 'oc-oi',
    name: { vi: 'Ốc Oanh', en: 'Oc Oanh seafood', ja: 'オック・オアイン', ko: '옥 오아인 해산물' },
    category: { vi: 'Hải sản · Món đường phố', en: 'Seafood · Street food', ja: 'シーフード・屋台料理', ko: '해산물 · 길거리 음식' },
    address: '534 Vĩnh Khánh, Quận 4, TP. Hồ Chí Minh',
    lat: 10.7591, lng: 106.7048, radius: 100, icon: '🦪', color: '#e68b3f',
    description: {
      vi: 'Ốc Oanh nằm trên đường Vĩnh Khánh, khu vực có nhiều hàng quán hải sản. Thực đơn và giờ hoạt động có thể thay đổi; bạn nên kiểm tra trực tiếp với quán trước khi ghé.',
      en: 'Oc Oanh is on Vinh Khanh Street, an area with many seafood restaurants. Menus and opening hours may change, so check with the restaurant before visiting.',
      ja: 'Ốc Oanhは、シーフード店が多いヴィンカイン通りにあります。メニューや営業時間は変更される場合があるため、訪問前に店舗へご確認ください。',
      ko: 'Ốc Oanh은 해산물 식당이 많은 Vĩnh Khánh 거리에 있습니다. 메뉴와 영업시간은 변경될 수 있으니 방문 전에 매장에 확인해 주세요.'
    },
    audioUrl: { vi: '/audio/oc-oi-vi.wav', en: '/audio/oc-oi-en.wav' }
  },
  {
    id: 'banh-mi-huynh-hoa',
    name: { vi: 'Khu ẩm thực đường Tôn Đản', en: 'Ton Dan food area', ja: 'トンダン通りの飲食エリア', ko: '똔단 거리 음식 구역' },
    category: { vi: 'Ẩm thực địa phương', en: 'Local food', ja: '地元の飲食店', ko: '현지 음식' },
    address: 'Khu vực đường Tôn Đản, Quận 4, TP. Hồ Chí Minh',
    lat: 10.7623, lng: 106.7027, radius: 120, icon: '🥖', color: '#3e9b82',
    description: {
      vi: 'Khu vực đường Tôn Đản có các hàng quán phục vụ món ăn địa phương. Khi ghé thăm, bạn có thể khám phá thêm những lựa chọn ăn uống quanh khu vực.',
      en: 'The Ton Dan area has eateries serving local dishes. Explore the nearby options when you visit.',
      ja: 'トンダン通り周辺には地元料理を提供する飲食店があります。訪問時に周辺のお店もお楽しみください。',
      ko: '똔단 거리 주변에는 현지 음식을 판매하는 식당이 있습니다. 방문할 때 주변의 다양한 식당도 둘러보세요.'
    },
    audioUrl: { vi: '/audio/banh-mi-huynh-hoa-vi.wav', en: '/audio/banh-mi-huynh-hoa-en.wav' }
  },
  {
    id: 'cau-mong',
    name: { vi: 'Khu vực cầu Mống', en: 'Mong Bridge area', ja: 'モン橋周辺', ko: '몽 다리 주변' },
    category: { vi: 'Điểm dạo bộ · Ngắm cảnh', en: 'Walk · City views', ja: '散策・街の景色', ko: '산책 · 도시 풍경' },
    address: 'Khu vực cầu Mống, giáp Quận 1 và Quận 4',
    lat: 10.7682, lng: 106.7045, radius: 140, icon: '🌉', color: '#5478bd',
    description: {
      vi: 'Cầu Mống là một điểm dạo bộ quen thuộc gần trung tâm thành phố. Từ khu vực này, người tham quan có thể quan sát cảnh quan đô thị và tiếp tục hành trình khám phá Quận 4.',
      en: 'Mong Bridge is a familiar walking spot near the city center. Visitors can enjoy urban views here before continuing their District 4 exploration.',
      ja: 'モン橋は市中心部に近い散歩スポットです。ここから街の景色を楽しみ、4区の散策を続けることができます。',
      ko: '몽 다리는 도심 가까이에 있는 산책 명소입니다. 이곳에서 도시 풍경을 감상한 뒤 4군 탐방을 이어갈 수 있습니다.'
    },
    audioUrl: { vi: '/audio/cau-mong-vi.wav', en: '/audio/cau-mong-en.wav' }
  },
  {
    id: 'pho-xom-chieu',
    name: { vi: 'Khu chợ Xóm Chiếu', en: 'Xom Chieu Market area', ja: 'ソムチエウ市場周辺', ko: '솜찌에우 시장 주변' },
    category: { vi: 'Chợ địa phương · Ẩm thực', en: 'Local market · Food', ja: '地元市場・グルメ', ko: '현지 시장 · 음식' },
    address: 'Khu vực chợ Xóm Chiếu, Quận 4, TP. Hồ Chí Minh',
    lat: 10.7627, lng: 106.7067, radius: 120, icon: '🥢', color: '#9a6ab8',
    description: {
      vi: 'Chợ truyền thống là nơi dễ bắt gặp nhiều món ăn quen thuộc và nguyên liệu tươi. Nội dung thuyết minh tại đây có thể mở rộng thành câu chuyện về món ăn, người bán và văn hóa khu phố.',
      en: 'Traditional markets bring together familiar dishes and fresh ingredients. Narration here could introduce local food, vendors, and neighborhood culture.',
      ja: '伝統的な市場では、身近な料理や新鮮な食材に出会えます。音声案内では、料理や店主、地域文化を紹介できます。',
      ko: '전통 시장에서는 친숙한 음식과 신선한 재료를 만날 수 있습니다. 음성 안내를 통해 음식, 상인, 지역 문화를 소개할 수 있습니다.'
    },
    audioUrl: { vi: '/audio/pho-xom-chieu-vi.wav', en: '/audio/pho-xom-chieu-en.wav' }
  }
]