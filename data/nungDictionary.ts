/**
 * Từ điển tiếng Nùng Trung Việt Nam - DATA LAYER
 * File này chứa dữ liệu từ điển - được tách riêng khỏi logic để dễ quản lý
 *
 * Cấu trúc:
 * - data/nungDictionary.ts: Chứa NungWord interface và NUNG_DICTIONARY (data)
 * - services/nungVocab.ts: Chứa các hàm lookup, inference, reverse lookup (logic)
 */

export interface NungWord {
  script: string;
  phonetic: string;
  notes?: string;
}

export const NUNG_DICTIONARY: Record<string, NungWord> = {
  đầu: {
    script: "thua / hua / bầu",
    phonetic: "",
    notes: "thua (Hòa An - Cao Bằng) / hua (Cao Lộc - Lạng Sơn",
  },
  trán: {
    script: "Hu / phjác / nằ phac",
    phonetic: "",
    notes: "Hu (Đồng Sơn) / phjác (Cao Bằng)",
  },
  tóc: {
    script: "phjôm / xu / Pít hu",
    phonetic: "",
    notes: "phjôm (Hòa An - Cao Bằng",
  },
  mũi: {
    script: "đăng",
    phonetic: "đăng",
    notes: "",
  },
  "vành tai": {
    script: "pin xu / pí xu / pín xu",
    phonetic: "",
    notes:
      "pin xu (Thất Khê - Lạng Sơn) / pí xu (Thạch An - Cao Bằng) / pín xu (Tày Ba Bể",
  },
  miệng: {
    script: "pác",
    phonetic: "pác",
    notes: "",
  },
  cằm: {
    script: "cìm",
    phonetic: "cìm",
    notes: "",
  },
  mắt: {
    script: "tha",
    phonetic: "tha",
    notes: "",
  },
  "lông mày": {
    script: "gàng / càn g / cắp càng / Ha / Mác Ha / Khuân Chàu / Khuân sàu",
    phonetic: "",
    notes: "gàng",
  },
  chân: {
    script: "kha / Ha",
    phonetic: "",
    notes: "kha (Thất Khê - Lạng Sơn",
  },
  lưỡi: {
    script: "lin / lịn / Li ận",
    phonetic: "",
    notes: "lin (Khuân Sàu) / lịn (Thạch An - Cao Bằng",
  },
  "óc (não)": {
    script: "ẹc / úc áy / Úc iất / óc áy / óc oai",
    phonetic: "",
    notes:
      "ẹc (Bảo Lạc - Cao Bằng) / úc áy (Cao Bằng) / Úc iất (Thất Khê - Lạng Sơn) / óc áy (Tày Ba Bể)",
  },
  răng: {
    script: "khẻo / Khéo",
    phonetic: "",
    notes: "khẻo (Cao Bằng) / Khéo (Chi Lăng - Lạng Sơn)",
  },
  nướu: {
    script: "Hước / Ngước",
    phonetic: "",
    notes: "Hước (Cao Bằng) / Ngước (Lộc Bình - Lạng Sơn)",
  },
  "mí mắt": {
    script: "pín tha / Pí tha",
    phonetic: "",
    notes: "pín tha (Cao Bằng) / Pí tha (Thất Khê - Lạng Sơn)",
  },
  môi: {
    script: "pín pác / Pbỉ pác / Pín pác / pji pác",
    phonetic: "",
    notes:
      "pín pác (Cao Bằng) / Pbỉ pác (Thất Khê - Lạng Sơn) / Pín pác (Tày Ba Bể) / pji pác (Lạng Sơn)",
  },
  cổ: {
    script: "cò / khò / Gò",
    phonetic: "",
    notes: "cò (Cao Bằng) / khò (Chiêm Hóa - Tuyên Quang) / Gò (Hòa An)",
  },
  họng: {
    script: "rù cò / lù cò / rù gồ",
    phonetic: "",
    notes: "rù cò",
  },
  "tay (bàn tay)": {
    script: "mừng / mừ / fả mù",
    phonetic: "",
    notes: "mừng",
  },
  "tay (cánh tay)": {
    script: "Pbả mừ / p'á mừng / Phả mừng",
    phonetic: "",
    notes:
      "Pbả mừ (Thất Khê - Lạng Sơn) / p'á mừng (Tày Ba Bể) / Phả mừng (Hòa An)",
  },
  "bắp tay": {
    script: "pi khen / Pi mừ",
    phonetic: "",
    notes: "",
  },
  "ngón tay": {
    script: "nỉu mừ / nju mừng",
    phonetic: "",
    notes: "nju mừng (Tày Ba Bể)",
  },
  "ngón cái": {
    script: "mẻ / nịu mẻ",
    phonetic: "",
    notes: "mẻ",
  },
  "ngón út": {
    script: "nịu hỏi / nịu thang / nịu hang",
    phonetic: "",
    notes:
      "nịu hỏi (Thạch An - Cao Bằng) / nịu thang (Hòa An - Cao Bằng) / nịu hang (Tày Ba Bể)",
  },
  "chỉ tay (vân tay)": {
    script: "lài mừng / Lài mừ",
    phonetic: "",
    notes: "Lài mừ (Lạng Sơn)",
  },
  "khuỷu tay": {
    script: "công sloóc / Cốc sloóc / Khen SOÓC",
    phonetic: "",
    notes: "Cốc sloóc (Lạng Sơn) / Khen SOÓC (Hòa An)",
  },
  lưng: {
    script: "Lăng",
    phonetic: "Lăng",
    notes: "",
  },
  ngực: {
    script: "ấc / ức",
    phonetic: "",
    notes: "ấc (Tày Ba Bể)",
  },
  bụng: {
    script: "mốc / tọng",
    phonetic: "",
    notes: "",
  },
  vú: {
    script: "mắc nùm / nồm / Nghế Nằm / No-ô-mờ-ôm-huyền-nồm",
    phonetic: "",
    notes:
      "mắc nùm (Thạch An - Cao Bằng) / Nghế Nằm (Thất Khê - Lạng Sơn) / nồm (Tày Ba Bể)",
  },
  "xương sườn": {
    script: "Đúc xang / đúc rẻ / đúc slẻ",
    phonetic: "",
    notes: "đúc rẻ (Trà Lĩnh",
  },
  xương: {
    script: "đúc / Đốc",
    phonetic: "",
    notes: "Đốc (Bình Liêu - Quảng Ninh)",
  },
  "xương cột sống": {
    script: "đúc lăng / đục lằng",
    phonetic: "",
    notes:
      "đục lằng (Chi Lăng - Lạng Sơn) / đúc lăng (Tày Ba Bể) / Đốc lăng (Bình Liêu - Quảng Ninh)",
  },
  da: {
    script: "năng",
    phonetic: "năng",
    notes: "",
  },
  thịt: {
    script: "Nựa / Nự",
    phonetic: "",
    notes: "Nựa (Thất Khê - Lạng Sơn",
  },
  "bắp đùi": {
    script: "Ha / Kha / hau / pi kha",
    phonetic: "",
    notes: "Ha (Đồng Đăng - Lạng Sơn) / Kha (Tày Ba Bể)",
  },
  "đầu gối": {
    script: "Pi-kha / khau kháu / thua kháu / Bầu kháu / Hua kháu",
    phonetic: "",
    notes:
      "Pi-kha (Tày Ba Bể) / khau kháu (Thạch An - Cao Bằng) / Bầu kháu (Đồng Đăng - Lạng Sơn) / Hua kháu (Tày Ba Bể",
  },
  "cẳng chân": {
    script: "kjẻng kha / hèng kha",
    phonetic: "",
    notes: "",
  },
  "gót chân": {
    script: "sâm kiêu / tin kiểu / kiểu kha / Hang kha",
    phonetic: "",
    notes: "tin kiểu (Trà Lĩnh",
  },
  "bàn chân": {
    script: "phả kha / Pbả Kha",
    phonetic: "",
    notes: "Pbả Kha (Thất Khê - Lạng Sơn)",
  },
  "ngón chân": {
    script: "nịu kha",
    phonetic: "nịu kha",
    notes: "",
  },
  "móng chân": {
    script: "lệp kha / lịp kha",
    phonetic: "",
    notes: "",
  },
  "lông (nói chung)": {
    script: "Khuân",
    phonetic: "Khuân",
    notes: "",
  },
  "lông chân": {
    script: "Khuân kha",
    phonetic: "Khuân kha",
    notes: "",
  },
  "mắt cá chân": {
    script: "kha pu / Tha pu / Khiảng bang",
    phonetic: "",
    notes: "Tha pu (Lạng Sơn) / Khiảng bang (Thất Khê - Lạng Sơn)",
  },
  rốn: {
    script: "đúng đi / Đúc đỉ / Đốc đỉ",
    phonetic: "",
    notes: "Đúc đỉ (Lạng Sơn) / Đốc đỉ (Bình Liêu - Quảng Ninh)",
  },
  mông: {
    script: "quần / củn",
    phonetic: "quần / củn",
    notes: "",
  },
  tim: {
    script: "slem tàu / rim tàu / SLâm / Sliim / Slim tàu / Săm tàu",
    phonetic: "",
    notes:
      "slem tàu (Cao Bằng) / SLâm (Thất Khê - Lạng Sơn) / Slim tàu (Lạng Sơn) / Săm tàu (Bình Liêu - Quảng Ninh)",
  },
  gan: {
    script: "tắp",
    phonetic: "tắp",
    notes: "tắp (Cao Bằng)",
  },
  ruột: {
    script: "rẩy / SLảy / Slẩy / thẩy / Sảy",
    phonetic: "",
    notes:
      "SLảy (Thất Khê - Lạng Sơn) / Slẩy (Tày Ba Bể) / thẩy (Chiêm Hóa - Tuyên Quang) / Sảy (Bình Liêu - Quảng Ninh)",
  },
  "lá lách": {
    script: "mam",
    phonetic: "mam",
    notes: "",
  },
  "mỡ (trong cơ thể)": {
    script: "lào / pi / Vì",
    phonetic: "",
    notes: "Vì (Hòa An)",
  },
  "thịt nạc": {
    script: "nựa xịn / nựa chinh / Nưa chịn / nưa chịt / Nự chện / Nựa dịn",
    phonetic: "",
    notes:
      "Nưa chịn (Lạng Sơn) / nưa chịt (Chiêm Hóa - Tuyên Quang) / Nự chện (Bình Liêu - Quảng Ninh) / Nựa dịn (Hòa An)",
  },
  phổi: {
    script: "pút / Pốt / Pót",
    phonetic: "",
    notes: "Pốt (Thất Khê - Lạng Sơn) / Pót (Lạng Sơn)",
  },
  gân: {
    script: "din / Nhần / dần",
    phonetic: "",
    notes: "Nhần (Thất Khê - Lạng Sơn) / dần (Tày Ba Bể",
  },
  máu: {
    script: "lượt / lợt / Lựt",
    phonetic: "",
    notes: "lượt (Chiêm Hóa - Tuyên Quang) / Lựt (Bình Liêu - Quảng Ninh)",
  },
  "xương bả vai": {
    script: "đúc đảm / đúc bạ",
    phonetic: "",
    notes: "",
  },
  "răng cửa": {
    script: "khẻo nả / Khẻo tu",
    phonetic: "",
    notes: "",
  },
  "răng hàm": {
    script: "khẻo vài",
    phonetic: "khẻo vài",
    notes: "",
  },
  "ruột non": {
    script: "rầy ón / SLảy ốn",
    phonetic: "",
    notes: "SLảy ốn (Thất Khê - Lạng Sơn)",
  },
  "ruột già": {
    script: "rẩy ké / SLảy Kế / Sẩy ké",
    phonetic: "",
    notes: "SLảy Kế (Thất Khê - Lạng Sơn) / Sẩy ké (Hòa An)",
  },
  "dạ dày": {
    script: "toọng muỗng",
    phonetic: "toọng muỗng",
    notes: "",
  },
  mật: {
    script: "đi",
    phonetic: "đi",
    notes: "",
  },
  "lỗ tai": {
    script: "rù xu / Lù Hu / Lù xu / Slù Xu / Choòng su",
    phonetic: "",
    notes:
      "Lù Hu (Thất Khê - Lạng Sơn) / Lù xu (Tày Ba Bể) / Choòng su (Bình Liêu - Quảng Ninh)",
  },
  "lỗ mũi": {
    script: "rù đăng / Lù đăng / Choòng đăng",
    phonetic: "",
    notes: "Lù đăng (Thất Khê - Lạng Sơn",
  },
  "móng tay": {
    script: "lịp mừng / Lip Mừ / Lếp mư / Lệp mừng",
    phonetic: "",
    notes:
      "Lip Mừ (Thất Khê - Lạng Sơn) / Lếp mư (Bình Liêu - Quảng Ninh) / Lệp mừng (Hòa An)",
  },
  "tóc bạc": {
    script: "khao / Phâm khao",
    phonetic: "",
    notes: "Phâm khao (Bình Liêu - Quảng Ninh)",
  },
  "cổ tay": {
    script: "cò mừng / Cò mừ / khò mừ",
    phonetic: "",
    notes: "khò mừ (Chiêm Hóa - Tuyên Quang)",
  },
  gáy: {
    script: "cò đửn / Cò đần",
    phonetic: "",
    notes: "Cò đần (Tày Ba Bể)",
  },
  "ngươi mắt": {
    script: "mác tha / Ngàu tha",
    phonetic: "",
    notes: "mác tha (Đồng Đăng - Lạng Sơn)",
  },
  "xương chậu": {
    script: "đúc cúm",
    phonetic: "",
    notes: "",
  },
  "hậu môn": {
    script: "Slù cuồn / p' kheoro",
    phonetic: "",
    notes: "p' kheoro (Tày Ba Bể)",
  },
  "hàm răng trên": {
    script: "Càng khẻo nưa",
    phonetic: "Càng khẻo nưa",
    notes: "",
  },
  "hàm răng dưới": {
    script: "càng khẻo tẩu",
    phonetic: "càng khẻo tẩu",
    notes: "",
  },
  "lông mi": {
    script: "khuân tha",
    phonetic: "khuân tha",
    notes: "khuân tha (Tày Ba Bể)",
  },
  "sống mũi": {
    script: "kiểu đăng",
    phonetic: "kiểu đăng",
    notes: "kiểu đăng (Tày Ba Bể)",
  },
  "xương nách": {
    script: "Đúc / Đốc",
    phonetic: "",
    notes: "Đúc (Tày Ba Bể) / Đốc (Bình Liêu - Quảng Ninh)",
  },
  nách: {
    script: "Sljac le / rặc rẹ / Chặc lẹ",
    phonetic: "",
    notes:
      "Sljac le (Lạng Sơn) / rặc rẹ (Cao Bằng) / Chặc lẹ (Bình Liêu - Quảng Ninh)",
  },
  "xương bánh chè": {
    script: "Mác páp",
    phonetic: "Mác páp",
    notes: "",
  },
  "kẽ ngón chân": {
    script: "váng kha",
    phonetic: "váng kha",
    notes: "",
  },
  "kẽ ngón tay": {
    script: "váng mừ",
    phonetic: "váng mừ",
    notes: "",
  },
  "mu chân": {
    script: "lản kha",
    phonetic: "lản kha",
    notes: "",
  },
  thận: {
    script: "Mác lùm",
    phonetic: "Mác lùm",
    notes: "Mác lùm (Hòa An)",
  },
  "ông tổ": {
    script: "cúng chộ / cúng chỏ / pú chỏ / ú mẻ",
    phonetic: "",
    notes:
      "cúng chỏ (Hòa An) / pú chỏ (Chiêm Hóa - Tuyên Quang) / ú mẻ (Lộc Bình - Lạng Sơn)",
  },
  "ông cụ": {
    script: "ung sựa / Pú chựa / Pồ Cúng / ú chựa",
    phonetic: "",
    notes:
      "ung sựa (Cao Bằng) / Pú chựa (Tày Ba Bể) / Pồ Cúng (Thất Khê - Lạng Sơn) / ú chựa (Lộc Bình - Lạng Sơn)",
  },
  "bà cụ": {
    script: "dả sựa / Chựa / Mé chựa / Mề Pồ",
    phonetic: "",
    notes: "dả sựa (Cao Bằng) / Chựa (Tày Ba Bể) / Mề Pồ (Thất Khê - Lạng Sơn)",
  },
  bố: {
    script: "pá / anh / chá / Cá / po / Báo / Pò",
    phonetic: "",
    notes: "pá",
  },
  mẹ: {
    script: "mé / á / me / a",
    phonetic: "",
    notes: "mé",
  },
  ông: {
    script: "ung / cống / kú",
    phonetic: "",
    notes: "ung (Cao Bằng) / cống (Lạng Sơn) / kú (Chiêm Hóa - Tuyên Quang)",
  },
  bà: {
    script: "dả / mé / dzja",
    phonetic: "",
    notes: "dả (Cao Bằng) / mé (Bắc Kạn) / dzja (Lạng Sơn)",
  },
  "ông nội": {
    script: "ung / pú / phlồ",
    phonetic: "",
    notes: "ung (Cao Bằng) / pú (Bắc Kạn)",
  },
  "bà nội": {
    script: "dả / Mé / Dà",
    phonetic: "",
    notes: "dả (Cao Bằng) / Mé (Bắc Kạn) / Dà (Bình Liêu - Quảng Ninh)",
  },
  "ông ngoại": {
    script: "pỏ ké / ta / Tả / Ta",
    phonetic: "",
    notes:
      "pỏ ké (Cao Bằng) / ta (Bắc Kạn) / Tả (Chi Lăng - Lạng Sơn) / Ta (Bình Liêu - Quảng Ninh)",
  },
  "bà ngoại": {
    script: "mẻ ké / tái / mé tai / mje tai / Tai",
    phonetic: "",
    notes: "mẻ ké (Cao Bằng) / tái (Bắc Kạn) / Tai (Bình Liêu - Quảng Ninh)",
  },
  "bác trai": {
    script: "bảc / Dé / Pồ Dế",
    phonetic: "",
    notes: "bảc (Cao Bằng) / Dé (Thất Khê - Lạng Sơn)",
  },
  "bác gái": {
    script: "Pác / Bảc / Pả / Mề Mú / Pá",
    phonetic: "",
    notes:
      "Pác (Chi Lăng - Lạng Sơn) / Bảc (Bình Liêu - Quảng Ninh) / Pả (Cao Bằng",
  },
  chú: {
    script: "chủ / Áo",
    phonetic: "",
    notes: "chủ (Cao Bằng) / Áo (Tày Ba Bể)",
  },
  thím: {
    script: "a lùa / lùa / A lù / Thim",
    phonetic: "",
    notes:
      "a lùa (Cao Bằng) / lùa (Hạ Lang) / A lù (Bình Liêu - Quảng Ninh) / Thim (Hòa An)",
  },
  cô: {
    script: "a / A",
    phonetic: "",
    notes: "a (Cao Bằng) / A (Bình Liêu - Quảng Ninh)",
  },
  "dượng (chồng cô)": {
    script: "sượng",
    phonetic: "sượng",
    notes: "sượng (Cao Bằng)",
  },
  "dượng (chồng dì)": {
    script: "nà khươi / sượng / Nà khửi / ao khươi",
    phonetic: "",
    notes:
      "nà khươi (Bắc Kạn) / sượng (Cao Bằng) / Nà khửi (Bình Liêu - Quảng Ninh) / ao khươi (Chiêm Hóa - Tuyên Quang)",
  },
  "bác (chung)": {
    script: "bảc",
    phonetic: "",
    notes: "bảc (Cao Bằng)",
  },
  bá: {
    script: "bả / pá",
    phonetic: "",
    notes: "bả (Cao Bằng) / pá (Chiêm Hóa - Tuyên Quang)",
  },
  "cậu (em trai mẹ)": {
    script: "cạu / khủ / khú / nả / Pồ Khạu / Pò nà",
    phonetic: "",
    notes:
      "cạu (Cao Bằng) / khủ (Bắc Kạn) / khú (Tuyên Quang) / nả (Hòa An - Cao Bằng) / Pồ Khạu (Thất Khê - Lạng Sơn) / Pò nà (Bình Liêu - Quảng Ninh)",
  },
  "mợ (vợ cậu)": {
    script: "mử / mứ / Nà lù / ná / Mề Khặm / nả lùa",
    phonetic: "",
    notes:
      "mử (Bắc Kạn) / mứ (Tuyên Quang) / Nà lù (Bình Liêu - Quảng Ninh) / Mề Khặm (Thất Khê - Lạng Sơn) / nả lùa (Cao Bằng)",
  },
  "dì (em gái mẹ)": {
    script: "nà / nả / a / Nà",
    phonetic: "",
    notes:
      "nà (Bắc Kạn) / nả (Cao Bằng) / a (Chiêm Hóa - Tuyên Quang) / Nà (Bình Liêu - Quảng Ninh)",
  },
  "anh trai": {
    script: "pì chài / pi sài / Pì Báo / Pi báo",
    phonetic: "",
    notes:
      "pì chài (Bắc Kạn) / pi sài (Cao Bằng) / Pì Báo (Thất Khê - Lạng Sơn) / Pi báo (Bình Liêu - Quảng Ninh)",
  },
  "chị gái": {
    script: "pỉ / slao / nhình",
    phonetic: "",
    notes: "slao (Thất Khê",
  },
  "em trai": {
    script:
      "Pi Slao / Pì sao / pi nhình / noong chài / Noong Báo / noọng ao / noọng khú",
    phonetic: "",
    notes:
      "Pi Slao (Thất Khê - Lạng Sơn) / Pì sao (Bình Liêu - Quảng Ninh) / pi nhình (Tuyên Quang) / noong chài (Bắc Kạn) / Noong Báo (Thất Khê - Lạng Sơn) / noọng khú (Tuyên Quang)",
  },
  "em gái": {
    script: "noong slao / noong naa / noong ga",
    phonetic: "",
    notes: "noong naa",
  },
  "anh (xưng hô)": {
    script: "báo / chài / Chài",
    phonetic: "",
    notes: "Báo (Bình Liêu - Quảng Ninh)",
  },
  "chị (xưng hô)": {
    script: "pí / slao / á / nhình",
    phonetic: "",
    notes: "pí",
  },
  con: {
    script: "lục / Lộc",
    phonetic: "",
    notes:
      "Lộc (Bình Liêu - Quảng Ninh) - Dùng cho con người (con cái), KHÔNG dùng cho động vật",
  },
  cháu: {
    script: "lan",
    phonetic: "lan",
    notes: "",
  },
  chắt: {
    script: "lịn / lin / lẫn / Lễn",
    phonetic: "",
    notes: "Lễn (Bình Liêu - Quảng Ninh)",
  },
  "con ruột": {
    script: "lục đeng / Lục góc",
    phonetic: "",
    notes: "Lục góc (Thất Khê - Lạng Sơn",
  },
  "con nuôi": {
    script: "lục liệng / Lục Sượng",
    phonetic: "",
    notes: "Lục Sượng (Thất Khê - Lạng Sơn)",
  },
  "cháu nội": {
    script: "Lan đeng",
    phonetic: "",
    notes: "Lan đeng (Tày Ba Bể)",
  },
  cụ: {
    script: "sựa / trọ chựa",
    phonetic: "",
    notes: "trọ chựa (Tày Ba Bể)",
  },
  "anh rể": {
    script: "pỉ khươi / Pì khươi / Pì khui",
    phonetic: "",
    notes: "Pì khươi (Tày Ba Bể",
  },
  "chị dâu": {
    script: "pỉ lùa / Pi Liu / Pì lù",
    phonetic: "",
    notes: "Pi Liu (Thất Khê - Lạng Sơn) / Pì lù (Bình Liêu - Quảng Ninh)",
  },
  "em dâu": {
    script: "noong lùa / Noong Lìu / Noong lù",
    phonetic: "",
    notes:
      "Noong Lìu (Thất Khê - Lạng Sơn) / Noong lù (Bình Liêu - Quảng Ninh)",
  },
  "em rể": {
    script: "noong khươi / Noong khui",
    phonetic: "",
    notes: "Noong khui (Bình Liêu - Quảng Ninh)",
  },
  "em cô": {
    script: "noong a",
    phonetic: "noong a",
    notes: "",
  },
  "em chú": {
    script: "noong áo",
    phonetic: "noong áo",
    notes: "",
  },
  "em cậu": {
    script: "noọng khủ",
    phonetic: "noọng khủ",
    notes: "",
  },
  "chị em (đã lập gia đình)": {
    script: "noọng nả / pả nà",
    phonetic: "",
    notes: "",
  },
  "em dâu (vợ em)": {
    script: "lùa / Mề Lìu / Mè lù",
    phonetic: "",
    notes: "Mề Lìu (Thất Khê - Lạng Sơn) / Mè lù (Bình Liêu - Quảng Ninh)",
  },
  "con rể": {
    script: "khươi / Lục Khươi / Pò khui",
    phonetic: "",
    notes: "Lục Khươi (Thất Khê - Lạng Sơn) / Pò khui (Bình Liêu - Quảng Ninh)",
  },
  "chú (xưng hô)": {
    script: "Áo / chủ",
    phonetic: "",
    notes: "Áo (Tày Ba Bể) / chủ (Cao Bằng)",
  },
  "thầy tào": {
    script: "lảo th'ao / Pồ Mô",
    phonetic: "",
    notes: "Pồ Mô (Thất Khê - Lạng Sơn)",
  },
  "bà bụt": {
    script: "Mẻ Pựt",
    phonetic: "Mẻ Pựt",
    notes: "",
  },
  "vợ chồng": {
    script: "phjua mìa",
    phonetic: "phjua mìa",
    notes: "",
  },
  nhà: {
    script: "Lườn / Slờn / rjườn / Lừn",
    phonetic: "",
    notes: "Lườn (Lạng Sơn",
  },
  "cửa ra vào": {
    script: "Tu / tu cải / Tâu / táng",
    phonetic: "",
    notes: "Tu (Tày Ba Bể) / Tâu",
  },
  "cửa sổ": {
    script: "Tu (slai) / táng",
    phonetic: "",
    notes: "Tu (Tày Ba Bể) / Táng (Hòa An - Cao Bằng)",
  },
  "cửa trước": {
    script: "tu nạ / Tu nả",
    phonetic: "",
    notes: "Tu nả (Hòa An - Cao Bằng)",
  },
  "cửa sau": {
    script: "Tu lăng",
    phonetic: "Tu lăng",
    notes: "",
  },
  bàn: {
    script: "bàn Nghế / Choòng / Tài",
    phonetic: "",
    notes: "Choòng (Thất Khê - Lạng Sơn",
  },
  ghế: {
    script: "tắng",
    phonetic: "tắng",
    notes: "",
  },
  "ghế đầu": {
    script: "Tắng tảu / Tắng",
    phonetic: "",
    notes: "Tắng tảu (Thất Khê - Lạng Sơn) / Tắng (Tày Ba Bể)",
  },
  giường: {
    script: "sljan / Slang / slường / Chưừng",
    phonetic: "",
    notes: "Slang (Thất Khê - Lạng Sơn) / Chưừng (Bình Liêu - Quảng Ninh)",
  },
  "cầu thang": {
    script: "đây / Đu-ây / Day",
    phonetic: "",
    notes: "Đu-ây (Tày Ba Bể) / Day (Bình Liêu - Quảng Ninh)",
  },
  "gác lửng": {
    script: "các / khỉnh lên / Tưng / Các",
    phonetic: "",
    notes: "Các (Thất Khê - Lạng Sơn",
  },
  "nhà bếp": {
    script: "lườn phầy / lườn mu",
    phonetic: "",
    notes: "lườn mu (Chiêm Hóa - Tuyên Quang)",
  },
  bếp: {
    script: "pjỉnh phjầy / cháo / kiềng",
    phonetic: "",
    notes: "kiềng (Cao Bằng) / Cháo (Bình Liêu - Quảng Ninh)",
  },
  "vại nước": {
    script: "pjiet nặm / Cang / pjét nặm",
    phonetic: "",
    notes: "Cang (Tày Ba Bể)",
  },
  "bát / tô": {
    script: "áng / Ăng / pát cải",
    phonetic: "",
    notes: "Ăng (Tày Ba Bể) / pát cải (Cao Bằng)",
  },
  "cầu tiêu": {
    script: "Tung Sli / thiêng sli",
    phonetic: "",
    notes: "Tung Sli (Thất Khê - Lạng Sơn) / thiêng sli (Trà Lĩnh - Thất Khê)",
  },
  chiếu: {
    script: "Phụt / Phuuc / Vục / phjục",
    phonetic: "",
    notes:
      "Phụt (Thất Khê - Lạng Sơn) / Phuuc (Ba Bể) / Vục (Chi Lăng - Lạng Sơn) / phjục (Trà Lĩnh - Thất Khê)",
  },
  nồi: {
    script: "Nghế mỗ / Mỏ",
    phonetic: "",
    notes: "Nghế mỗ (Thất Khê - Lạng Sơn) / Mỏ (Ba Bể",
  },
  chảo: {
    script: "Nghế Hếc / Cháo",
    phonetic: "",
    notes: "Hếc (Thất Khê - Lạng Sơn) / Cháo (Tày Ba Bể)",
  },
  "bát (ăn cơm)": {
    script: "Nghế thuổi / Pát",
    phonetic: "",
    notes: "Nghế thuổi (Thất Khê - Lạng Sơn) / Pát (Tày Ba Bể)",
  },
  "bát to (canh)": {
    script: "Thuổi ủn",
    phonetic: "",
    notes: "Thuổi ủn (Thất Khê - Lạng Sơn)",
  },
  đũa: {
    script: "Thú / Tiu keng",
    phonetic: "",
    notes: "Thú (Thất Khê - Lạng Sơn",
  },
  thìa: {
    script: "ăn thìa",
    phonetic: "",
    notes: "ăn thìa (Cao Bằng)",
  },
  thau: {
    script: "Pừn / chạu / Éng",
    phonetic: "",
    notes: "Pừn (Tày Ba Bể) / chạu (Cao Bằng) / Éng (Bình Liêu - Quảng Ninh)",
  },
  "cối (xay/giã)": {
    script: "Chộc / sộc",
    phonetic: "",
    notes: "Chộc (Tày Ba Bể) / sộc (Cao Bằng)",
  },
  chày: {
    script: "Slác / rác",
    phonetic: "",
    notes: "Slác (Tày Ba Bể) / rác (Cao Bằng)",
  },
  "vá (muôi)": {
    script: "Môi",
    phonetic: "Môi",
    notes: "Môi (Tày Ba Bể)",
  },
  dao: {
    script: "Pja / Tao",
    phonetic: "",
    notes: "Pja (Tày Ba Bể) / Tao (Bình Liêu - Quảng Ninh)",
  },
  "dao nhọn": {
    script: "Pja sliểm",
    phonetic: "",
    notes: "Pja sliểm (Tày Ba Bể)",
  },
  "dao chuôi liền": {
    script: "Pja bỏong",
    phonetic: "",
    notes: "Pja bỏong (Tày Ba Bể)",
  },
  "dao nhíp": {
    script: "Pja căp",
    phonetic: "",
    notes: "Pja căp (Tày Ba Bể)",
  },
  "dao rựa": {
    script: "Pja cúp",
    phonetic: "",
    notes: "Pja cúp (Tày Ba Bể)",
  },
  "dao quắm": {
    script: "Pja kho",
    phonetic: "",
    notes: "Pja kho (Tày Ba Bể) / Pạ kho (Bình Liêu - Quảng Ninh)",
  },
  "dao mấu": {
    script: "Pja le",
    phonetic: "",
    notes: "Pja le (Tày Ba Bể)",
  },
  "dao phay": {
    script: "Pja phay",
    phonetic: "",
    notes: "Pja phay (Tày Ba Bể)",
  },
  "dao phát": {
    script: "Pja quang",
    phonetic: "",
    notes: "Pja quang (Tày Ba Bể)",
  },
  "dao găm": {
    script: "Pja xính",
    phonetic: "",
    notes: "Pja xính (Tày Ba Bể)",
  },
  "bàn thờ": {
    script: "Thản / Thua Bán / Xoòng Slằn",
    phonetic: "",
    notes: "Thản (Tày Ba Bể) / Thua Bán (Cao Bằng) / Xoòng Slằn (Thất Khê)",
  },
  thớt: {
    script: "Khiêng / Khíng",
    phonetic: "",
    notes: "Khiêng (Tày Ba Bể",
  },
  "kệ / giá": {
    script: "Chá / sạn pát / khỉnh pát",
    phonetic: "",
    notes: "Chá (Tày Ba Bể) / sạn pát",
  },
  cột: {
    script: "Slâu / sjêu / Sliu / Cộc thâu",
    phonetic: "",
    notes: "Slâu (Tày Ba Bể) / sjêu",
  },
  "cái rổ": {
    script: "Thủng / Pha lả / Ăn rồ",
    phonetic: "",
    notes: "Thủng (Tày Ba Bể",
  },
  "gáo múc nước": {
    script: "Pèo",
    phonetic: "",
    notes: "Pèo (Tày Ba Bể",
  },
  "cái chăn": {
    script: "Phà / fjả / Pạ",
    phonetic: "",
    notes: "Phà (Tày Ba Bể",
  },
  "cái màn (mùng)": {
    script: "Slứt / rjứt / Sljut / Líp / Chường",
    phonetic: "",
    notes:
      "Slứt (Tày Ba Bể) / rjứt (Cao Bằng) / Líp (Bình Liêu - Quảng Ninh) / Chường (Hữu Lũng - Lạng Sơn)",
  },
  "lư hương": {
    script: "Bóoc lò hương / buốc hương / Bóoc hưưng",
    phonetic: "",
    notes:
      "Bóoc lò hương (Tày Ba Bể) / buốc hương (Cao Bằng) / Bóoc hưưng (Bình Liêu - Quảng Ninh)",
  },
  "cây nhang": {
    script: "theo hương",
    phonetic: "",
    notes: "theo hương (Cao Bằng)",
  },
  "cái cuốc": {
    script: "mác cuốc / mác bai / mác quà",
    phonetic: "",
    notes: "mác bai (Cao Bằng)",
  },
  "cái chổi": {
    script: "Nhù Quét",
    phonetic: "",
    notes: "Nhù Quét (Cao Bằng)",
  },
  "cào phơi lúa": {
    script: "mác qjuà",
    phonetic: "",
    notes: "mác qjuà (Cao Bằng)",
  },
  "xe đạp / máy": {
    script: "mác rí / xe đạp / xe máy",
    phonetic: "",
    notes: "mác rí (Cao Bằng)",
  },
  "xà phòng": {
    script: "xà phòng",
    phonetic: "xà phòng",
    notes: "xà phòng (Cao Bằng)",
  },
  "kem đánh răng": {
    script: "da sát khẻo",
    phonetic: "",
    notes: "da sát khẻo (Cao Bằng)",
  },
  "quần / áo": {
    script: "khóa / slử / Slửa / Vá / Sử",
    phonetic: "",
    notes: "Slửa (Tày Ba Bể",
  },
  dép: {
    script: "cài / hái / Hài",
    phonetic: "",
    notes: "cài (Cao Bằng) / hái (Thất Khê - Lạng Sơn) / Hài (Tày Ba Bể)",
  },
  giầy: {
    script: "cài phải / Hài phải",
    phonetic: "",
    notes: "Hài phải (Tày Ba Bể)",
  },
  "giầy ủng": {
    script: "Hài ổng",
    phonetic: "",
    notes: "Hài ổng (Tày Ba Bể)",
  },
  "găng tay": {
    script: "Maat mừng",
    phonetic: "",
    notes: "Maat mừng (Tày Ba Bể)",
  },
  "bít tất": {
    script: "Mạat kha",
    phonetic: "",
    notes: "Mạat kha (Tày Ba Bể)",
  },
  "giầy da": {
    script: "Hài năng / hái năng",
    phonetic: "",
    notes: "Hài năng (Tày Ba Bể) / hái năng (Cao Bằng)",
  },
  "gác bếp": {
    script: "các khứ / các fin / fjầy",
    phonetic: "",
    notes: "các khứ (Chiêm Hóa - Tuyên Quang)",
  },
  "chạn bát": {
    script: "lạng pát / sạn pát",
    phonetic: "",
    notes: "lạng pát (Chiêm Hóa - Tuyên Quang) / sạn pát (Cao Bằng)",
  },
  "mái ngói": {
    script: "f jài ngọa / Pjai ngọa / Pai ngọa",
    phonetic: "",
    notes: "f jài ngọa (Cao Bằng) / Pai ngọa (Bình Liêu - Quảng Ninh)",
  },
  "nhà đất (trình tường)": {
    script: "rườn tôm / lườn trình",
    phonetic: "",
    notes: "rườn tôm (Cao Bằng)",
  },
  "nhà gỗ": {
    script: "rườn mạy",
    phonetic: "",
    notes: "rườn mạy (Cao Bằng)",
  },
  "nhà sàn": {
    script: "rưởn sạn",
    phonetic: "",
    notes: "rưởn sạn (Cao Bằng)",
  },
  "chuồng (trâu bò)": {
    script: "lang / hiêm",
    phonetic: "",
    notes: "lang (Chiêm Hóa - Tuyên Quang",
  },
  "chuồng trâu": {
    script: "lang vài",
    phonetic: "",
    notes: "lang vài (Cao Bằng)",
  },
  "chuồng bò": {
    script: "lang mò",
    phonetic: "",
    notes: "lang mò (Cao Bằng)",
  },
  "chuồng lợn": {
    script: "cooc mu",
    phonetic: "",
    notes: "cooc mu (Cao Bằng)",
  },
  "chuồng gà": {
    script: "lậu cáy / Cooc cáy",
    phonetic: "",
    notes: "lậu cáy (Cao Bằng) / Cooc cáy (Bình Liêu - Quảng Ninh)",
  },
  "chuồng vịt": {
    script: "lậu pjết",
    phonetic: "",
    notes: "lậu pjết (Cao Bằng)",
  },
  "lồng gà vịt": {
    script: "súng cáy / súng pjết",
    phonetic: "",
    notes: "súng cáy",
  },
  củi: {
    script: "phừn / Phìn / Lu",
    phonetic: "",
    notes: "phừn (Cao Bằng) / Phìn (Lạng Sơn) / Lu (Bình Liêu - Quảng Ninh)",
  },
  "đun bếp": {
    script: "tó phjầy",
    phonetic: "",
    notes: "",
  },
  "xào rau": {
    script: "xẻo fiắc / Xẻo phắc",
    phonetic: "",
    notes: "xẻo fiắc (Cao Bằng) / Xẻo phắc (Bình Liêu - Quảng Ninh)",
  },
  "ăn cơm": {
    script: "kin khẩu",
    phonetic: "",
    notes: "",
  },
  "uống rượu": {
    script: "kin lẩu",
    phonetic: "",
    notes: "",
  },
  "ăn cơm sáng": {
    script: "kin lèng",
    phonetic: "",
    notes: "kin lèng (Cao Bằng)",
  },
  "ăn cơm trưa": {
    script: "kin ngài",
    phonetic: "",
    notes: "kin ngài (Cao Bằng)",
  },
  "ăn cơm tối": {
    script: "kin fjầu",
    phonetic: "",
    notes: "kin fjầu (Cao Bằng)",
  },
  "uống nước": {
    script: "kin nặm",
    phonetic: "",
    notes: "",
  },
  kim: {
    script: "khiêm / Khêm",
    phonetic: "",
    notes: "Khêm (Bình Liêu - Quảng Ninh)",
  },
  chỉ: {
    script: "mây / May",
    phonetic: "",
    notes: "May (Bình Liêu - Quảng Ninh)",
  },
  "muối ăn": {
    script: "cưa",
    phonetic: "",
    notes: "",
  },
  "đường ăn": {
    script: "thương / Thưng",
    phonetic: "",
    notes: "Thưng (Bình Liêu - Quảng Ninh)",
  },
  "đường kính": {
    script: "thương khao",
    phonetic: "",
    notes: "",
  },
  "đường đỏ": {
    script: "thương đeng",
    phonetic: "",
    notes: "",
  },
  sắt: {
    script: "lếch / Léc",
    phonetic: "",
    notes: "Léc (Hữu Lũng - Lạng Sơn)",
  },
  búa: {
    script: "bủa / Pù",
    phonetic: "",
    notes: "Pù (Hữu Lũng - Lạng Sơn)",
  },
  cưa: {
    script: "Cứ / Cừ",
    phonetic: "",
    notes: "Cứ (Bình Liêu - Quảng Ninh) / Cừ (Hữu Lũng - Lạng Sơn)",
  },
  đục: {
    script: "slíu / Xìu",
    phonetic: "",
    notes: "Xìu (Hữu Lũng - Lạng Sơn)",
  },
  "đèn dầu": {
    script: "ăn tển",
    phonetic: "",
    notes: "",
  },
  "con vật (nói chung)": {
    script: "tua / Tu",
    phonetic: "",
    notes: "Tu (Bình Liêu - Quảng Ninh)",
  },
  "con trâu": {
    script: "tua vài / Tu vài",
    phonetic: "",
    notes: "Tu vài (Bình Liêu - Quảng Ninh)",
  },
  "con bò": {
    script: "tua mò / Tu mò",
    phonetic: "",
    notes: "Tu mò (Bình Liêu - Quảng Ninh)",
  },
  "con lợn": {
    script: "tua mu / Tu mu",
    phonetic: "",
    notes: "Tu mu (Bình Liêu - Quảng Ninh)",
  },
  "lợn đực": {
    script: "mu ríu / tua mu tậc",
    phonetic: "",
    notes: "tua mu tậc (Cao Bằng)",
  },
  "lợn nái": {
    script: "mu mè",
    phonetic: "",
    notes: "",
  },
  "lợn con": {
    script: "mu eng",
    phonetic: "",
    notes: "",
  },
  "lợn thịt": {
    script: "mu nua",
    phonetic: "",
    notes: "",
  },
  ngỗng: {
    script: "tua hán / Pận",
    phonetic: "",
    notes: "Pận (Hữu Lũng - Lạng Sơn)",
  },
  ngan: {
    script: "tua nhạn",
    phonetic: "",
    notes: "",
  },
  vịt: {
    script: "tua fiất / Tu pết",
    phonetic: "",
    notes: "Tu pết (Bình Liêu - Quảng Ninh)",
  },
  gà: {
    script: "tua cáy / Tu cáy",
    phonetic: "",
    notes: "Tu cáy (Bình Liêu - Quảng Ninh)",
  },
  "gà trống": {
    script: "cáy reng / Cáy xeng",
    phonetic: "",
    notes: "Cáy xeng (Bình Liêu - Quảng Ninh)",
  },
  "gà mái": {
    script: "cáy mẻ",
    phonetic: "",
    notes: "",
  },
  "gà mái to": {
    script: "khướng / Cáy khứng",
    phonetic: "",
    notes: "Cáy khứng (Bình Liêu - Quảng Ninh)",
  },
  chó: {
    script: "tua ma / Tu ma",
    phonetic: "",
    notes: "Tu ma (Bình Liêu - Quảng Ninh)",
  },
  mèo: {
    script: "tua mèo / tua méo / Tu méo",
    phonetic: "",
    notes:
      "tua mèo (Cao Bằng) / tua méo (Tày Định Hóa - Thái Nguyên) / Tu méo (Bình Liêu - Quảng Ninh)",
  },
  chim: {
    script: "tua nộc / Tu nộc",
    phonetic: "",
    notes: "tua nộc (Cao Bằng) / Tu nộc (Bình Liêu - Quảng Ninh)",
  },
  "cá lóc": {
    script: "pja lẳn / pja lài / Pá Lài",
    phonetic: "",
    notes:
      "pja lẳn (Tày Trà Lĩnh) / pja lài (Lạng Sơn) / Pá Lài (Hữu Lũng - Lạng Sơn)",
  },
  "cá trê": {
    script: "pja cạo / pja đúc / Pa đốc",
    phonetic: "",
    notes: "Pa đốc (Bình Liêu - Quảng Ninh)",
  },
  "cá chép": {
    script: "pja nầy / pja này / Pa này",
    phonetic: "",
    notes: "Pa này (Bình Liêu - Quảng Ninh)",
  },
  lươn: {
    script: "pja chít / pja lây / tua lay / Pa lay",
    phonetic: "",
    notes:
      "pja lây (Trà Lĩnh - Thất Khê) / tua lay (Cao Bằng) / Pa lay (Bình Liêu - Quảng Ninh)",
  },
  "cá trạch": {
    script: "pja sát / Pa sát / Pá lét",
    phonetic: "",
    notes: "Pa sát (Bình Liêu - Quảng Ninh) / Pá lét (Hữu Lũng - Lạng Sơn)",
  },
  "chim bìm bịp": {
    script: "nộc cút / Nọc cóot can",
    phonetic: "",
    notes: "Nọc cóot can (Hữu Lũng - Lạng Sơn)",
  },
  "chim sẻ": {
    script: "nộc chóoc",
    phonetic: "",
    notes: "",
  },
  "chim chào mào": {
    script: "nộc mảo / Nọc mạo",
    phonetic: "",
    notes: "Nọc mạo (Hữu Lũng - Lạng Sơn)",
  },
  "cá cờ": {
    script: "pja cài",
    phonetic: "",
    notes: "",
  },
  tôm: {
    script: "Tua củng / Tu cổng",
    phonetic: "",
    notes: "Tua củng (Tày Ba Bể) / Tu cổng (Bình Liêu - Quảng Ninh)",
  },
  "con cua": {
    script: "tua pu / Tu pu",
    phonetic: "",
    notes: "Tu pu (Bình Liêu - Quảng Ninh)",
  },
  tép: {
    script: "tua nhảo / ngiều / Tu ngiều",
    phonetic: "",
    notes: "Tu ngiều (Hữu Lũng - Lạng Sơn)",
  },
  "con ba ba": {
    script: "tua phja / Tu Phả",
    phonetic: "",
    notes: "Tu Phả (Hữu Lũng - Lạng Sơn)",
  },
  "con rắn": {
    script: "tua ngủ / Tu ngủ",
    phonetic: "",
    notes: "Tu ngủ (Bình Liêu - Quảng Ninh)",
  },
  "con ốc": {
    script: "tua hoi / Tu hoi",
    phonetic: "",
    notes: "Tu hoi (Bình Liêu - Quảng Ninh)",
  },
  "ốc sên": {
    script: "hoi ngửa",
    phonetic: "",
    notes: "",
  },
  "con rùa": {
    script: "rủa / Tua tấu / tua fa / Tu tảu",
    phonetic: "",
    notes:
      "rủa (Cao Bằng) / Tua tấu (Lạng Sơn) / Tu tảu (Bình Liêu - Quảng Ninh)",
  },
  "cá diếc": {
    script: "pja khao / Pja đí",
    phonetic: "",
    notes: "",
  },
  "cá bống": {
    script: "pja bú / Pa bú / Pá bù",
    phonetic: "",
    notes: "Pa bú (Bình Liêu - Quảng Ninh) / Pá bù (Hữu Lũng - Lạng Sơn)",
  },
  "chim bồ câu": {
    script: "nộc cu",
    phonetic: "",
    notes: "",
  },
  "con trai (vỏ)": {
    script: "tua pảng / tua hoi pảng / cáp quại / Tua ngao",
    phonetic: "",
    notes:
      "tua hoi pảng (Trà Lĩnh) / cáp quại (Tày Ba Bể) / Tua ngao (Lạng Sơn)",
  },
  "con đỉa": {
    script: "tua ping / Tu pêng",
    phonetic: "",
    notes: "Tu pêng (Bình Liêu - Quảng Ninh)",
  },
  "con vắt": {
    script: "tua tác",
    phonetic: "",
    notes: "",
  },
  "con nhái": {
    script: "tua khuyết / Tú Heệt",
    phonetic: "",
    notes: "Tú Heệt (Hữu Lũng - Lạng Sơn)",
  },
  "con ếch": {
    script: "tua cốp / Tua cấp",
    phonetic: "",
    notes: "",
  },
  "con châu chấu": {
    script: "Tua ljuồm / Tu lùm / Luộn tóp thém",
    phonetic: "",
    notes:
      "Tu lùm (Bình Liêu - Quảng Ninh) / Luộn tóp thém (Hữu Lũng - Lạng Sơn)",
  },
  "con cóc": {
    script: "tua cáy rộc / tua sửa cáy / tua cúm slu / Tua pạng pú / Cấy cộc",
    phonetic: "",
    notes:
      "tua cáy rộc (Tày Trùng Khánh) / tua sửa cáy (Trà Lĩnh) / tua cúm slu (Tày Trà Lĩnh) / Tua pạng pú (Tày Ba Bể) / Cấy cộc (Lạng Sơn)",
  },
  "con chuồn chuồn": {
    script: "tua cúng quang / tua kính quang / tua pi / tua bi / Mèng pị",
    phonetic: "",
    notes:
      "tua kính quang (Trà Lĩnh) / tua pi (Tày Ba Bể) / tua bi (Lạng Sơn) / Mèng pị (Hữu Lũng - Lạng Sơn)",
  },
  "con muỗi": {
    script: "tua nhùng / mèng nhùng / Tua mèng những",
    phonetic: "",
    notes: "mèng nhùng (Tày Ba Bể) / Tua mèng những (Lạng Sơn)",
  },
  "con ruồi": {
    script: "tua mèng / tua mèng khiêu / Mèng pù",
    phonetic: "",
    notes:
      "tua mèng (Tày Trà Lĩnh) / tua mèng khiêu (Tày Ba Bể) / Mèng pù (Hữu Lũng - Lạng Sơn)",
  },
  "con bướm": {
    script: "tua vij / tua pa pi / tua pi / Tu bở",
    phonetic: "",
    notes: "tua pi (Tày Ba Bể) / Tu bở (Bình Liêu - Quảng Ninh)",
  },
  "con kiến": {
    script: "tua mật",
    phonetic: "",
    notes: "",
  },
  "con ong": {
    script: "tua then / mèng nèo / Tu pèm",
    phonetic: "",
    notes: "mèng nèo (Tày Ba Bể) / Tu pèm (Hữu Lũng - Lạng Sơn)",
  },
  "con ong mật": {
    script: "tua mềng thương / Meng thưng",
    phonetic: "",
    notes: "Meng thưng (Bình Liêu - Quảng Ninh)",
  },
  "ong vò vẽ": {
    script: "tua tó / tua mềng nhay / Tu tó",
    phonetic: "",
    notes: "tua tó (Tày Ba Bể) / Tu tó (Bình Liêu - Quảng Ninh)",
  },
  "con nhện": {
    script: "tua xúng xao / Tua sao / Tú chí hảo",
    phonetic: "",
    notes: "Tú chí hảo (Hữu Lũng - Lạng Sơn)",
  },
  "con gián": {
    script: "tua ráp / tua rjáp / Tua sljap / Tu sáp",
    phonetic: "",
    notes: "Tu sáp (Bình Liêu - Quảng Ninh)",
  },
  "con giun đất": {
    script: "tua mềng đươn / Tu đưn",
    phonetic: "",
    notes: "Tu đưn (Bình Liêu - Quảng Ninh)",
  },
  "con din": {
    script: "tua đươn",
    phonetic: "",
    notes: "",
  },
  "con muỗi vằn": {
    script: "mềng rưẩn / mèng món",
    phonetic: "",
    notes: "",
  },
  "con chuột": {
    script: "mèng lài / tua nu",
    phonetic: "",
    notes: "",
  },
  "con dũi": {
    script: "tua uồn",
    phonetic: "",
    notes: "",
  },
  "con nhím": {
    script: "tua mìn",
    phonetic: "",
    notes: "",
  },
  "con tê tê": {
    script: "tua lin / tua slua",
    phonetic: "",
    notes: "",
  },
  "con cọp": {
    script: "tua hân",
    phonetic: "",
    notes: "",
  },
  "con hươu": {
    script: "tua quang",
    phonetic: "",
    notes: "",
  },
  "con đười ươi": {
    script: "tua căng",
    phonetic: "",
    notes: "",
  },
  "con khỉ": {
    script: "tua linh / Tu lềng",
    phonetic: "",
    notes: "Tu lềng (Bình Liêu - Quảng Ninh)",
  },
  "con nai": {
    script: "tua nạn",
    phonetic: "",
    notes: "",
  },
  "con chồn": {
    script: "tua chỏn",
    phonetic: "",
    notes: "",
  },
  "con cáo": {
    script: "tua hân / tua hin",
    phonetic: "",
    notes: "",
  },
  "con gấu": {
    script: "tua mi",
    phonetic: "",
    notes: "",
  },
  "con vượn": {
    script: "tua cảng",
    phonetic: "",
    notes: "",
  },
  "con dê": {
    script: "tua bẻ",
    phonetic: "",
    notes: "",
  },
  "con báo": {
    script: "hin pjẻo",
    phonetic: "",
    notes: "",
  },
  "con ngựa": {
    script: "tua mạ",
    phonetic: "",
    notes: "",
  },
  "con trăn": {
    script: "tua tảng / Tu lum / Tú Nướm",
    phonetic: "",
    notes: "Tu lum (Bình Liêu - Quảng Ninh) / Tú Nướm (Hữu Lũng - Lạng Sơn)",
  },
  "con voi": {
    script: "tua giảng / tua sảng / Tu chạng",
    phonetic: "",
    notes: "Tu chạng (Bình Liêu - Quảng Ninh)",
  },
  "rắn hổ mang": {
    script: "ngủ háo lếch / ngủ hân lếch",
    phonetic: "",
    notes: "ngủ hân lếch (Tày Trà Lĩnh)",
  },
  "rắn lục / rắn xanh": {
    script: "ngủ kheo",
    phonetic: "",
    notes: "ngủ kheo (Cao Bằng)",
  },
  "rắn cạp nia": {
    script: "Ngủ cáp đồng / ngủ cáp nặm",
    phonetic: "",
    notes: "Ngủ cáp đồng (Ba Bể) / ngủ cáp nặm (Cao Bằng)",
  },
  "con muỗm": {
    script: "tua luồm / Tú luồm lào",
    phonetic: "",
    notes: "tua luồm (Cao Bằng) / Tú luồm lào (Hữu Lũng - Lạng Sơn)",
  },
  "lợn rừng": {
    script: "mu đông",
    phonetic: "",
    notes: "mu đông (Cao Bằng)",
  },
  "gà rừng": {
    script: "tua cáy đông",
    phonetic: "",
    notes: "tua cáy đông (Cao Bằng)",
  },
  "chim cuốc": {
    script: "nộc củ vắc",
    phonetic: "",
    notes: "nộc củ vắc (Cao Bằng)",
  },
  "con chuột nhắt": {
    script: "tua nu chỉ",
    phonetic: "",
    notes: "tua nu chỉ (Cao Bằng)",
  },
  "con sâu ngứa (rõm)": {
    script: "tua non cần",
    phonetic: "",
    notes: "tua non cần (Cao Bằng)",
  },
  "con quạ": {
    script: "tua ca",
    phonetic: "",
    notes: "tua ca (Cao Bằng)",
  },
  "con diều hâu": {
    script: "tua lằm / Dệu",
    phonetic: "",
    notes: "tua lằm (Cao Bằng) / Dệu (Hữu Lũng - Lạng Sơn)",
  },
  "con dơi": {
    script: "tua ca cào / tua cáng kìa",
    phonetic: "",
    notes: "tua ca cào (Cao Bằng) / tua cáng kìa (Tày Ba Bể)",
  },
  "con cú mèo": {
    script: "tua lắm củm",
    phonetic: "",
    notes: "tua lắm củm (Cao Bằng)",
  },
  "con ve sầu": {
    script: "tua cảu / Nhí nhỏi",
    phonetic: "",
    notes: "Nhí nhỏi (Hữu Lũng - Lạng Sơn)",
  },
  "con đom đóm": {
    script: "tua heng hỏi / tua nhỏi",
    phonetic: "",
    notes: "tua heng hỏi",
  },
  "con tằm": {
    script: "tua mọn",
    phonetic: "",
    notes: "tua mọn (Cao Bằng)",
  },
  "giun sán": {
    script: "tua tje",
    phonetic: "",
    notes: "tua tje (Cao Bằng)",
  },
  "con ve chó": {
    script: "tua lướt",
    phonetic: "",
    notes: "tua lướt (Cao Bằng)",
  },
  "con rận": {
    script: "tua mìn",
    phonetic: "",
    notes: "tua mìn (Cao Bằng)",
  },
  "con chấy": {
    script: "tua thâu",
    phonetic: "",
    notes: "tua thâu (Cao Bằng)",
  },
  "con ghẻ": {
    script: "tua khít",
    phonetic: "",
    notes: "tua khít (Cao Bằng)",
  },
  "con rắn ráo": {
    script: "ngủ khuyết / ngù slin / Ngủ sá",
    phonetic: "",
    notes: "ngủ khuyết (Cao Bằng) / Ngủ sá (Hữu Lũng - Lạng Sơn)",
  },
  "con bọ gậy": {
    script: "tua từng tỉnh",
    phonetic: "",
    notes: "tua từng tỉnh (Cao Bằng)",
  },
  "con bê": {
    script: "tua mồ eng",
    phonetic: "",
    notes: "",
  },
  "con quạ đốm": {
    script: "tua ca đáng",
    phonetic: "",
    notes: "",
  },
  "con quạ đen": {
    script: "tua ca đăm",
    phonetic: "",
    notes: "",
  },
  "con rầy hại lúa": {
    script: "tua phòng phồng chạ",
    phonetic: "",
    notes: "",
  },
  "con rồng": {
    script: "tua luồng / Tu lùng",
    phonetic: "",
    notes: "Tu lùng (Bình Liêu - Quảng Ninh)",
  },
  "con cà cuống": {
    script: "tua niếng",
    phonetic: "",
    notes: "",
  },
  "con sư tử": {
    script: "kỳ lần",
    phonetic: "",
    notes: "",
  },
  "cá cơm": {
    script: "pja khẩu",
    phonetic: "",
    notes: "",
  },
  "con dế": {
    script: "tua ai nả / kit lit / sắc hịn",
    phonetic: "",
    notes: "sắc hịn (Hữu Lũng - Lạng Sơn)",
  },
  "con dế mèn": {
    script: "tua ỏn mòn / tu thắc tống",
    phonetic: "",
    notes: "",
  },
  "con kiến đen": {
    script: "tua mật lin / tua mật đăm",
    phonetic: "",
    notes: "",
  },
  "con nghé": {
    script: "tua vài eng",
    phonetic: "",
    notes: "",
  },
  "chim bói cá": {
    script: "nộc đăm pja / nộc tính / Nọc séng sì",
    phonetic: "",
    notes: "Nọc séng sì (Hữu Lũng - Lạng Sơn)",
  },
  "con rết": {
    script: "tua ka kiến / Cáy thếp / Khỉ khíp",
    phonetic: "",
    notes: "Cáy thếp (Ba Bể)",
  },
  "con bọ cạp": {
    script: "tua cao thấp",
    phonetic: "",
    notes: "",
  },
  "sừng trâu": {
    script: "cóoc vài",
    phonetic: "",
    notes: "",
  },
  "mào gà": {
    script: "hon cáy",
    phonetic: "",
    notes: "",
  },
  "mề gà": {
    script: "thjâu cáy",
    phonetic: "",
    notes: "",
  },
  "yên ngựa": {
    script: "an mạ",
    phonetic: "",
    notes: "",
  },
  "cựa gà": {
    script: "đưa cáy",
    phonetic: "",
    notes: "",
  },
  "phao câu": {
    script: "ăn rừn / Ăn đính",
    phonetic: "",
    notes: "",
  },
  "rau cải": {
    script: "phjắc cát",
    phonetic: "",
    notes: "",
  },
  "cải bắp": {
    script: "phjắc xú",
    phonetic: "",
    notes: "",
  },
  "su hào": {
    script: "xú ăn",
    phonetic: "",
    notes: "",
  },
  "củ cải": {
    script: "lào phjặc / Lằm pặc",
    phonetic: "",
    notes: "Lằm pặc (Bình Liêu - Quảng Ninh)",
  },
  "cải thìa": {
    script: "cát thìa",
    phonetic: "",
    notes: "",
  },
  "cải thảo": {
    script: "xú pao",
    phonetic: "",
    notes: "",
  },
  "cải cúc": {
    script: "xông hao",
    phonetic: "",
    notes: "",
  },
  "cải xanh / cải bẹ": {
    script: "cát kheo",
    phonetic: "",
    notes: "",
  },
  "rau má": {
    script: "phjắc xèn / phjắc đạm / phjắc xu ma",
    phonetic: "",
    notes: "phjắc xèn (Trà Lĩnh)",
  },
  "rau diếp": {
    script: "nhiệp phjắc kem",
    phonetic: "",
    notes: "",
  },
  "rau bí": {
    script: "phjắc vặc / phjắc phặc",
    phonetic: "",
    notes: "",
  },
  "rau cải xoong": {
    script: "phjắc cát xoong",
    phonetic: "",
    notes: "",
  },
  "rau bò khai": {
    script: "phjắc diễn / khau hương",
    phonetic: "",
    notes: "",
  },
  "rau ngót": {
    script: "phjắc bón",
    phonetic: "",
    notes: "",
  },
  "rau cần": {
    script: "phjắc ỏ",
    phonetic: "",
    notes: "",
  },
  "rau dền": {
    script: "dền / phjắc hôm / khảu úm",
    phonetic: "",
    notes: "",
  },
  hành: {
    script: "sung búa / Sôông",
    phonetic: "",
    notes: "Sôông (Bình Liêu - Quảng Ninh)",
  },
  tỏi: {
    script: "ruốn / Sún",
    phonetic: "",
    notes: "Sún (Bình Liêu - Quảng Ninh)",
  },
  ớt: {
    script: "mác phjết / Mắc mần",
    phonetic: "",
    notes: "Mắc mần (Bình Liêu - Quảng Ninh)",
  },
  "cây hồi": {
    script: "mác các / Mắc chác",
    phonetic: "",
    notes: "Mắc chác (Bình Liêu - Quảng Ninh)",
  },
  "cây kiệu": {
    script: "kiệu",
    phonetic: "kiệu",
    notes: "",
  },
  "cây sả": {
    script: "xả phjéc",
    phonetic: "",
    notes: "",
  },
  "cây hẹ": {
    script: "phjắc kép",
    phonetic: "",
    notes: "",
  },
  "rau môn": {
    script: "bon khao / bon",
    phonetic: "",
    notes: "",
  },
  "bạc hà (nấu canh)": {
    script: "p'ắc bôn",
    phonetic: "",
    notes: "",
  },
  "cúc tần": {
    script: "phjạc phả",
    phonetic: "",
    notes: "",
  },
  "rau răm": {
    script: "lạc liều",
    phonetic: "",
    notes: "",
  },
  "rau thơm": {
    script: "phjắc hom nam",
    phonetic: "",
    notes: "",
  },
  "rau ngải cứu": {
    script: "nhả ngải",
    phonetic: "",
    notes: "",
  },
  "đồ tương": {
    script: "thúa nà",
    phonetic: "",
    notes: "",
  },
  "đậu đũa": {
    script: "thúa nựa",
    phonetic: "",
    notes: "",
  },
  "đậu hà lan": {
    script: "thủa cà lán / thúa ngà lán",
    phonetic: "",
    notes: "thúa ngà lán (Trà Lĩnh)",
  },
  lạc: {
    script: "thúa tâm / thúa tôm / Thú đên / Thúa đin",
    phonetic: "",
    notes:
      "thúa tôm (Trà Lĩnh) / Thú đên (Bình Liêu - Quảng Ninh) / Thúa đin (Ba Bể)",
  },
  ngô: {
    script: "tấy / Mác",
    phonetic: "",
    notes: "Mác (Bình Liêu - Quảng Ninh)",
  },
  "cây đu đủ": {
    script: "mác các cô / mác kha co / mác rầu / Mắc lừ / mác lào",
    phonetic: "",
    notes:
      "mác rầu (Trà Lĩnh) / Mắc lừ (Bình Liêu - Quảng Ninh) / mác lào (Ba Bể)",
  },
  "đậu cô ve": {
    script: "thúa kin tủ",
    phonetic: "",
    notes: "",
  },
  "củ đậu": {
    script: "mằn cát / Mắc cát",
    phonetic: "",
    notes: "Mắc cát (Bình Liêu - Quảng Ninh)",
  },
  "củ từ": {
    script: "mằn toong rua",
    phonetic: "",
    notes: "",
  },
  "cà chua": {
    script: "mác tàu / mác chẻ / Mắc khè",
    phonetic: "",
    notes: "mác chẻ (Lạng Sơn) / Mắc khè (Bình Liêu - Quảng Ninh)",
  },
  "đậu trắng": {
    script: "thúa khao",
    phonetic: "",
    notes: "",
  },
  "đậu xanh": {
    script: "thúa kheo",
    phonetic: "",
    notes: "",
  },
  "đậu đen": {
    script: "thúa đăm",
    phonetic: "",
    notes: "",
  },
  "đậu ván": {
    script: "thúa páp",
    phonetic: "",
    notes: "",
  },
  "quả lê": {
    script: "mác lì",
    phonetic: "",
    notes: "",
  },
  "quả đào": {
    script: "mác tào",
    phonetic: "",
    notes: "",
  },
  "quả mận": {
    script: "mác mặn",
    phonetic: "",
    notes: "",
  },
  "quả vải": {
    script: "mác chia / Mắc chi",
    phonetic: "",
    notes: "Mắc chi (Bình Liêu - Quảng Ninh)",
  },
  "dâu da": {
    script: "mác phjầy / Mắc fày",
    phonetic: "",
    notes: "Mắc fày (Bình Liêu - Quảng Ninh)",
  },
  "quả quất hồng bì": {
    script: "mác mặt",
    phonetic: "",
    notes: "",
  },
  "quả quýt": {
    script: "mác cam chỉa",
    phonetic: "",
    notes: "",
  },
  "quả cam": {
    script: "mác cam tủng",
    phonetic: "",
    notes: "",
  },
  "quả chanh": {
    script: "mác cheng",
    phonetic: "",
    notes: "",
  },
  "quả vả": {
    script: "mác nỏa",
    phonetic: "",
    notes: "",
  },
  "quả hồng": {
    script: "mác chí",
    phonetic: "",
    notes: "",
  },
  "quả bưởi": {
    script: "mác phjàng / Mắc pốc",
    phonetic: "",
    notes: "Mắc pốc (Bình Liêu - Quảng Ninh)",
  },
  "quả dứa": {
    script: "mác dửa / Mắc dử",
    phonetic: "",
    notes: "Mắc dử (Bình Liêu - Quảng Ninh)",
  },
  "quả dưa": {
    script: "theng",
    phonetic: "",
    notes: "",
  },
  "quả ổi": {
    script: "mác ỏi",
    phonetic: "",
    notes: "",
  },
  "quả sim": {
    script: "mác nim / Mắc nêm",
    phonetic: "",
    notes: "Mắc nêm (Bình Liêu - Quảng Ninh)",
  },
  "quả nho": {
    script: "mác ít",
    phonetic: "",
    notes: "",
  },
  "quả nhót": {
    script: "mác lót",
    phonetic: "",
    notes: "",
  },
  "quả mua": {
    script: "mác nát",
    phonetic: "",
    notes: "",
  },
  "quả muỗm (xoài)": {
    script: "mác muồng / mác phjì phjà",
    phonetic: "",
    notes: "",
  },
  "quả mít": {
    script: "mác mỉ / Mắc mị",
    phonetic: "",
    notes: "Mắc mị (Bình Liêu - Quảng Ninh)",
  },
  "quả mắc mật": {
    script: "mác mặt",
    phonetic: "",
    notes: "",
  },
  "quả chôm chôm": {
    script: "mác chia bân",
    phonetic: "",
    notes: "",
  },
  "cây tre": {
    script: "may phjeo / Mạy pháy",
    phonetic: "",
    notes: "Mạy pháy (Bình Liêu - Quảng Ninh)",
  },
  "cây nghiến": {
    script: "mảy diễn",
    phonetic: "",
    notes: "",
  },
  "cây gạo": {
    script: "mạy ngyủ (mạy nhỉu)",
    phonetic: "",
    notes: "",
  },
  "quả trám": {
    script: "mác bay / Mắc bay",
    phonetic: "",
    notes: "Mắc bay (Bình Liêu - Quảng Ninh)",
  },
  "trám xanh": {
    script: "mác cưởm / Mắc cửm",
    phonetic: "",
    notes: "Mắc cửm (Bình Liêu - Quảng Ninh)",
  },
  "gỗ nghiến": {
    script: "mạy lòi",
    phonetic: "",
    notes: "",
  },
  "cây mía": {
    script: "co ỏi",
    phonetic: "",
    notes: "",
  },
  "củ khoai": {
    script: "ăn mằn / mằn rằn / Khoai may",
    phonetic: "",
    notes: "Khoai may (Bình Liêu - Quảng Ninh)",
  },
  "củ sắn": {
    script: "mằn phjan",
    phonetic: "",
    notes: "",
  },
  "khoai tây": {
    script: "mằn phjước",
    phonetic: "",
    notes: "",
  },
  "khoai sọ": {
    script: "Phức",
    phonetic: "",
    notes: "Phức (Bình Liêu - Quảng Ninh)",
  },
  "khoai lang": {
    script: "mằn bùng",
    phonetic: "",
    notes: "",
  },
  "cây mai (tre mười)": {
    script: "may / Mạy mùi",
    phonetic: "",
    notes: "Mạy mùi (Bình Liêu - Quảng Ninh)",
  },
  "cây xoan hôi": {
    script: "may xao (mạy rỉ)",
    phonetic: "",
    notes: "",
  },
  "cây xoan": {
    script: "mạy riễn",
    phonetic: "",
    notes: "",
  },
  "cây vông": {
    script: "may toòng",
    phonetic: "",
    notes: "",
  },
  "cây dàng dàng": {
    script: "co cút",
    phonetic: "",
    notes: "",
  },
  "cây hạt dẻ": {
    script: "mạy có / ăn mác lịch",
    phonetic: "",
    notes: "",
  },
  "quả nhãn": {
    script: "mác nhản / Mắc nhạn",
    phonetic: "",
    notes: "Mắc nhạn (Bình Liêu - Quảng Ninh)",
  },
  "bí xanh": {
    script: "phặc mẫn",
    phonetic: "",
    notes: "",
  },
  "quả dâu da": {
    script: "mác phầy",
    phonetic: "",
    notes: "mác phầy (Na Rì - Bắc Kạn)",
  },
  "quả chôm chôm rừng": {
    script: "Mác chia đông",
    phonetic: "",
    notes: "",
  },
  "quả trứng gà": {
    script: "Mắc xáy cáy",
    phonetic: "",
    notes: "Mắc xáy cáy (Bình Liêu - Quảng Ninh)",
  },
  "quả mướp đắng": {
    script: "mác xáy khâm / mác khẩy khôm",
    phonetic: "",
    notes: "",
  },
  "quả mướp": {
    script: "ăn we / ăn ve / ăn que",
    phonetic: "",
    notes: "ăn ve (Bình Liêu - Quảng Ninh)",
  },
  "rau diếp cá": {
    script: "phjắc way",
    phonetic: "",
    notes: "",
  },
  măng: {
    script: "mạy / Mảy",
    phonetic: "",
    notes: "Mảy (Bình Liêu - Quảng Ninh)",
  },
  "măng chua": {
    script: "mạy rầm / mảy rlỗm / Mảy xẩm",
    phonetic: "",
    notes: "Mảy xẩm (Bình Liêu - Quảng Ninh)",
  },
  "măng khô": {
    script: "mạy lạp",
    phonetic: "",
    notes: "",
  },
  "quả su su": {
    script: "mác nhùng quá",
    phonetic: "",
    notes: "",
  },
  "quả gấc": {
    script: "mác kháy khẩu",
    phonetic: "",
    notes: "",
  },
  "quả khế": {
    script: "mác vừng / mác phường",
    phonetic: "",
    notes: "",
  },
  "cây lá dong": {
    script: "cô toong trưng / co toong mẻng",
    phonetic: "",
    notes: "",
  },
  "quả chuối": {
    script: "ăn cuối",
    phonetic: "",
    notes: "",
  },
  "buồng chuối": {
    script: "lừa cuổi",
    phonetic: "",
    notes: "",
  },
  "nải chuối": {
    script: "wy cuổi",
    phonetic: "",
    notes: "",
  },
  "hoa chuối": {
    script: "pi cuổi",
    phonetic: "",
    notes: "",
  },
  thóc: {
    script: "khẩu các / Khảu",
    phonetic: "",
    notes: "Khảu (Bình Liêu - Quảng Ninh)",
  },
  gạo: {
    script: "các",
    phonetic: "",
    notes: "",
  },
  "lúa nương": {
    script: "khẩu ran / Khảu san / khẩu rẩy",
    phonetic: "",
    notes: "Khảu san (Bình Liêu - Quảng Ninh)",
  },
  "lúa nước": {
    script: "khẩu nà",
    phonetic: "",
    notes: "",
  },
  "lúa nếp": {
    script: "khẩu nua / Khảu pỏ",
    phonetic: "",
    notes: "Khảu pỏ (Bình Liêu - Quảng Ninh)",
  },
  "lúa tẻ": {
    script: "khẩu chăm / Khảu chăm",
    phonetic: "",
    notes: "Khảu chăm (Bình Liêu - Quảng Ninh)",
  },
  cỏ: {
    script: "nhả",
    phonetic: "",
    notes: "",
  },
  "cỏ may": {
    script: "nhả quác",
    phonetic: "",
    notes: "",
  },
  "cỏ hôi": {
    script: "nhả mên",
    phonetic: "",
    notes: "",
  },
  "cây gừng": {
    script: "co khinh",
    phonetic: "",
    notes: "",
  },
  nghệ: {
    script: "kháng mìn / khác min",
    phonetic: "",
    notes: "",
  },
  "bí đỏ": {
    script: "phjặc đeng",
    phonetic: "",
    notes: "",
  },
  "cây mạ": {
    script: "chả",
    phonetic: "",
    notes: "",
  },
  "bó mạ": {
    script: "căm chả",
    phonetic: "",
    notes: "",
  },
  "cây rau bợ": {
    script: "cô phjắc trắm",
    phonetic: "",
    notes: "",
  },
  "rau muống": {
    script: "phjắc bùng",
    phonetic: "",
    notes: "",
  },
  "rau xanh": {
    script: "phjắc khiêu",
    phonetic: "",
    notes: "",
  },
  hoa: {
    script: "bjoóc",
    phonetic: "",
    notes: "",
  },
  "mặt trời": {
    script: "may khâm / tha vằn",
    phonetic: "",
    notes: "",
  },
  "lá mơ": {
    script: "thau tất ma",
    phonetic: "",
    notes: "",
  },
  "sa nhân": {
    script: "mác nẻng",
    phonetic: "",
    notes: "",
  },
  "quả cà": {
    script: "mác khưa",
    phonetic: "",
    notes: "",
  },
  "hoa nở": {
    script: "phjoông",
    phonetic: "",
    notes: "",
  },
  quả: {
    script: "ăn mác",
    phonetic: "",
    notes: "",
  },
  "cây nhọ nồi": {
    script: "cô mị mộ",
    phonetic: "",
    notes: "",
  },
  "cây xương rồng": {
    script: "cô đúc luồng",
    phonetic: "",
    notes: "",
  },
  "cây gai": {
    script: "cô nam",
    phonetic: "",
    notes: "",
  },
  "cây bò khai": {
    script: "cô phjắc ziễn",
    phonetic: "",
    notes: "",
  },
  "mặt trăng": {
    script: "hai",
    phonetic: "",
    notes: "",
  },
  sông: {
    script: "tả / Tà",
    phonetic: "",
    notes: "Tà (Bình Liêu - Quảng Ninh)",
  },
  suối: {
    script: "khuỗi / Khủi",
    phonetic: "",
    notes: "Khủi (Bình Liêu - Quảng Ninh)",
  },
  hồ: {
    script: "thâm",
    phonetic: "",
    notes: "",
  },
  "khe nước": {
    script: "kha nặm",
    phonetic: "",
    notes: "",
  },
  "nguồn nước": {
    script: "bố nặm / cốc bó",
    phonetic: "",
    notes: "",
  },
  "mỏ nước": {
    script: "bố nặm / bó năm",
    phonetic: "",
    notes: "",
  },
  sương: {
    script: "mjoóc",
    phonetic: "",
    notes: "",
  },
  đất: {
    script: "tâm / toôm",
    phonetic: "",
    notes: "",
  },
  núi: {
    script: "phja",
    phonetic: "",
    notes: "",
  },
  đồi: {
    script: "khau / đỏng / đông",
    phonetic: "",
    notes: "đông (Trà Lĩnh)",
  },
  vườn: {
    script: "ruôn / phjươn / Sun",
    phonetic: "",
    notes: "Sun (Bình Liêu - Quảng Ninh)",
  },
  đá: {
    script: "tản",
    phonetic: "",
    notes: "",
  },
  "ao cá": {
    script: "thâm pja / Khư pa",
    phonetic: "",
    notes: "Khư pa (Bình Liêu - Quảng Ninh)",
  },
  ruộng: {
    script: "nà",
    phonetic: "nà",
    notes: "",
  },
  "nương rẫy": {
    script: "rẫy / Lày",
    phonetic: "",
    notes: "Lày (Bình Liêu - Quảng Ninh)",
  },
  "đập nước": {
    script: "phai nặm",
    phonetic: "",
    notes: "",
  },
  nắng: {
    script: "đét",
    phonetic: "",
    notes: "",
  },
  mưa: {
    script: "phân / phjân",
    phonetic: "",
    notes: "",
  },
  "mưa phùn": {
    script: "phân mẫn / Phân mất",
    phonetic: "",
    notes: "Phân mất (Bình Liêu - Quảng Ninh)",
  },
  nóng: {
    script: "pâm / phjp / đướt",
    phonetic: "",
    notes: "",
  },
  lạnh: {
    script: "dân / cắt / cắt tót / Cắt chít",
    phonetic: "",
    notes: "",
  },
  "trời mưa": {
    script: "phạ phân",
    phonetic: "",
    notes: "",
  },
  rơi: {
    script: "tốc",
    phonetic: "",
    notes: "",
  },
  "mưa đá": {
    script: "mác thấp",
    phonetic: "",
    notes: "",
  },
  "hạn hán": {
    script: "phạ lễng / phạ lẹng",
    phonetic: "",
    notes: "",
  },
  "mưa to": {
    script: "phân cại / phân cải / phjân cải",
    phonetic: "",
    notes: "",
  },
  "cầu vồng": {
    script: "luồng hoa kin nặm / muốc",
    phonetic: "",
    notes: "",
  },
  sấm: {
    script: "phạ đăng",
    phonetic: "",
    notes: "",
  },
  chớp: {
    script: "phạ mjép / phạ khiếc",
    phonetic: "",
    notes: "",
  },
  "lũ lụt": {
    script: "mền phạ / nặm nôồng / nặm noong / nặm noong",
    phonetic: "",
    notes: "",
  },
  "sương giá": {
    script: "mươi khao / nây",
    phonetic: "",
    notes: "",
  },
  sao: {
    script: "đao đí",
    phonetic: "",
    notes: "",
  },
  "gió lớn": {
    script: "lồm phjặt / phjeo",
    phonetic: "",
    notes: "",
  },
  "mưa ngâu": {
    script: "phjân đoi / phjân đôi",
    phonetic: "",
    notes: "",
  },
  "mưa rào": {
    script: "phjân loạt / rảo",
    phonetic: "",
    notes: "",
  },
  "nước sông": {
    script: "nặm tả",
    phonetic: "",
    notes: "",
  },
  "suối cạn": {
    script: "bỏ bốc",
    phonetic: "",
    notes: "",
  },
  "nước chảy": {
    script: "nặm lây",
    phonetic: "",
    notes: "",
  },
  "trăng lên": {
    script: "hai khửn",
    phonetic: "",
    notes: "",
  },
  "mặt trời lặn": {
    script: "tha vằn lồng",
    phonetic: "",
    notes: "",
  },
  "hoàng hôn": {
    script: "pửa pài / pài cắm",
    phonetic: "",
    notes: "",
  },
  "bình minh": {
    script: "nâu sau",
    phonetic: "",
    notes: "",
  },
  "ban đêm": {
    script: "ban chang / châng hần",
    phonetic: "",
    notes: "",
  },
  "gần sáng": {
    script: "rạp rủng",
    phonetic: "",
    notes: "",
  },
  "gà gáy": {
    script: "cáy găn / cáy khăn",
    phonetic: "",
    notes: "",
  },
  "buổi trưa": {
    script: "pửa ngài",
    phonetic: "",
    notes: "",
  },
  "buổi chiều": {
    script: "chang vắn",
    phonetic: "",
    notes: "",
  },
  "vừa nắng vừa mưa": {
    script: "phjả đồng / phjân đét",
    phonetic: "",
    notes: "",
  },
  sáng: {
    script: "rủng",
    phonetic: "",
    notes: "",
  },
  "trời râm": {
    script: "phja khăm",
    phonetic: "",
    notes: "",
  },
  "nắng to": {
    script: "đét rèng",
    phonetic: "",
    notes: "",
  },
  "nắng dịu": {
    script: "đét ón",
    phonetic: "",
    notes: "",
  },
  "sương mù": {
    script: "mươi / moóc",
    phonetic: "",
    notes: "",
  },
  tối: {
    script: "đăm / gắm",
    phonetic: "",
    notes: "",
  },
  "sương xuống": {
    script: "nây lồng",
    phonetic: "",
    notes: "",
  },
  "xoáy nước": {
    script: "voằng năm",
    phonetic: "",
    notes: "",
  },
  "thác nước": {
    script: "voằng nặm tốc",
    phonetic: "",
    notes: "",
  },
  "guồng nước": {
    script: "cọn năm",
    phonetic: "",
    notes: "",
  },
  "mương nước": {
    script: "mương nặm",
    phonetic: "",
    notes: "",
  },
  "nước nguội": {
    script: "nặm cắt",
    phonetic: "",
    notes: "",
  },
  "nước nóng": {
    script: "nặm phjôm",
    phonetic: "",
    notes: "",
  },
  "nước mưa": {
    script: "nặm phjân",
    phonetic: "",
    notes: "",
  },
  "nước đục": {
    script: "năm vòom",
    phonetic: "",
    notes: "",
  },
  "nước lã": {
    script: "nặm cắt",
    phonetic: "",
    notes: "",
  },
  "nước sôi": {
    script: "nặm phjật",
    phonetic: "",
    notes: "",
  },
  "nước mắt": {
    script: "nặm tha",
    phonetic: "",
    notes: "",
  },
  "nước mũi": {
    script: "mjục",
    phonetic: "",
    notes: "",
  },
  rượu: {
    script: "lầu / Lảu",
    phonetic: "",
    notes: "Lảu (Bình Liêu - Quảng Ninh)",
  },
  "nước dấm chua": {
    script: "nặm mí",
    phonetic: "",
    notes: "",
  },
  "nước trà": {
    script: "nặm xà",
    phonetic: "",
    notes: "",
  },
  "nước đường": {
    script: "nặm thương",
    phonetic: "",
    notes: "",
  },
  "đường kính trắng": {
    script: "thương khao",
    phonetic: "",
    notes: "",
  },
  mỡ: {
    script: "pjì / lào",
    phonetic: "",
    notes: "",
  },
  "cá bằm": {
    script: "pja bằm",
    phonetic: "",
    notes: "",
  },
  "nước chấm": {
    script: "năm chẳm",
    phonetic: "",
    notes: "",
  },
  "nước mắm": {
    script: "nặm bằm",
    phonetic: "",
    notes: "",
  },
  "làm việc": {
    script: "hất công",
    phonetic: "",
    notes: "",
  },
  "cấy lúa": {
    script: "đăm nà",
    phonetic: "",
    notes: "",
  },
  "nhổ mạ": {
    script: "lốc chả",
    phonetic: "",
    notes: "",
  },
  cày: {
    script: "thư thây",
    phonetic: "",
    notes: "",
  },
  bừa: {
    script: "thư pjưa",
    phonetic: "",
    notes: "",
  },
  "làm cỏ lúa": {
    script: "bjai nà",
    phonetic: "",
    notes: "",
  },
  "gặt lúa": {
    script: "rặt nà / Cùn khảu",
    phonetic: "",
    notes: "Cùn khảu (Bình Liêu - Quảng Ninh)",
  },
  "lấy ngô": {
    script: "au tấy",
    phonetic: "",
    notes: "",
  },
  "trồng ngô": {
    script: "lồng tấy",
    phonetic: "",
    notes: "",
  },
  "vun ngô": {
    script: "puồn tấy",
    phonetic: "",
    notes: "",
  },
  "ngô đồng": {
    script: "tấy nà",
    phonetic: "",
    notes: "",
  },
  "lấy củi": {
    script: "au vừn",
    phonetic: "",
    notes: "",
  },
  "bổ củi": {
    script: "khiếc vừn",
    phonetic: "",
    notes: "",
  },
  "bó củi": {
    script: "béc phjừn / Béc lu",
    phonetic: "",
    notes: "",
  },
  "nấu cơm": {
    script: "kươm khẩu / cươm khẩu / hjết ngai",
    phonetic: "",
    notes: "",
  },
  "nấu nước": {
    script: "tỏm năm / pjắc nặm",
    phonetic: "",
    notes: "",
  },
  "chiên trứng": {
    script: "chen xảy",
    phonetic: "",
    notes: "",
  },
  "nấu rượu": {
    script: "riêu lầu",
    phonetic: "",
    notes: "",
  },
  "nướng cá": {
    script: "pjin pjia",
    phonetic: "",
    notes: "",
  },
  "giết (thịt) gà/vịt/lợn": {
    script: "khả cáy / khả pết / khả mu",
    phonetic: "",
    notes: "",
  },
  "thịt gà/vịt/lợn": {
    script: "nựa cáy / nựa pết / nựa mu",
    phonetic: "",
    notes: "",
  },
  "rang cơm": {
    script: "xẻo khẩu",
    phonetic: "",
    notes: "",
  },
  "gánh nước": {
    script: "tháp nặm",
    phonetic: "",
    notes: "",
  },
  "múc nước": {
    script: "vặt nặm",
    phonetic: "",
    notes: "",
  },
  "xới cơm": {
    script: "tắc khẩu",
    phonetic: "",
    notes: "",
  },
  "trồng rau": {
    script: "chay phjắc",
    phonetic: "",
    notes: "",
  },
  "cuốc đất": {
    script: "bác tjôm",
    phonetic: "",
    notes: "",
  },
  "nhổ cỏ": {
    script: "bai nhả",
    phonetic: "",
    notes: "",
  },
  "rào vườn": {
    script: "lọm ruôn",
    phonetic: "",
    notes: "",
  },
  trồng: {
    script: "chay",
    phonetic: "",
    notes: "",
  },
  "trồng cây": {
    script: "chay mạy",
    phonetic: "",
    notes: "",
  },
  "trồng cây ăn quả": {
    script: "chay mác",
    phonetic: "",
    notes: "",
  },
  "trồng trọt": {
    script: "chay của",
    phonetic: "",
    notes: "",
  },
  "trồng dưa": {
    script: "chay theng",
    phonetic: "",
    notes: "",
  },
  "xạ lúa": {
    script: "ván nà",
    phonetic: "",
    notes: "",
  },
  "vãi phân": {
    script: "ván khún",
    phonetic: "",
    notes: "",
  },
  "lấy nước vào ruộng": {
    script: "hắp nặm nà",
    phonetic: "",
    notes: "",
  },
  "làm bờ ruộng": {
    script: "bai cằn nà",
    phonetic: "",
    notes: "",
  },
  "đi làm": {
    script: "hjất công",
    phonetic: "",
    notes: "",
  },
  "đắp bờ ruộng": {
    script: "khửn cần nà",
    phonetic: "",
    notes: "",
  },
  "đi chơi": {
    script: "pjây liễu / pây hỉn",
    phonetic: "",
    notes: "",
  },
  "đi chợ": {
    script: "pjây háng",
    phonetic: "",
    notes: "",
  },
  "đi ăn cưới (uống rượu)": {
    script: "pjây kin lầu",
    phonetic: "",
    notes: "",
  },
  tắm: {
    script: "áp đang",
    phonetic: "",
    notes: "",
  },
  rửa: {
    script: "rjào",
    phonetic: "",
    notes: "",
  },
  "rửa tay/chân": {
    script: "rjào mjừng / rjào kha",
    phonetic: "",
    notes: "",
  },
  "rửa rau": {
    script: "rjào phjắc",
    phonetic: "",
    notes: "",
  },
  "rửa chén bát": {
    script: "lạng pát",
    phonetic: "",
    notes: "",
  },
  "giặt quần áo": {
    script: "rjặc slửa khóa",
    phonetic: "",
    notes: "",
  },
  "giặt giũ": {
    script: "rjặc rào",
    phonetic: "",
    notes: "",
  },
  "dội rửa": {
    script: "lạng",
    phonetic: "",
    notes: "",
  },
  "quét nhà": {
    script: "quyét rườn",
    phonetic: "",
    notes: "",
  },
  "giặt chăn": {
    script: "rjặc phjả",
    phonetic: "",
    notes: "",
  },
  "chăn lợn": {
    script: "khun mu",
    phonetic: "",
    notes: "",
  },
  "chăn gà/vịt": {
    script: "khun cáy / khun phjết",
    phonetic: "",
    notes: "",
  },
  "chăn trâu": {
    script: "hen vài",
    phonetic: "",
    notes: "",
  },
  "chăn bò": {
    script: "hen mò",
    phonetic: "",
    notes: "",
  },
  "chăn tằm": {
    script: "liệng mọn",
    phonetic: "",
    notes: "",
  },
  "trông cháu": {
    script: "ngòi lan",
    phonetic: "",
    notes: "",
  },
  "trông con": {
    script: "ngòi lục",
    phonetic: "",
    notes: "",
  },
  "xúc cá/tôm tép": {
    script: "xỗn pja / xỏn nhjảo",
    phonetic: "",
    notes: "",
  },
  "quăng chài": {
    script: "tọt khe",
    phonetic: "",
    notes: "",
  },
  "câu cá": {
    script: "téng bất",
    phonetic: "",
    notes: "",
  },
  "trông nhà": {
    script: "hen rườn / ngòi rườn",
    phonetic: "",
    notes: "",
  },
  "nấu cơm trưa": {
    script: "hjết ngai",
    phonetic: "",
    notes: "",
  },
  "nấu cơm sáng": {
    script: "hiết lèng",
    phonetic: "",
    notes: "",
  },
  "nấu cơm tối": {
    script: "hjết phjầu",
    phonetic: "",
    notes: "",
  },
  "đi ngủ": {
    script: "pây noòn",
    phonetic: "",
    notes: "",
  },
  đi: {
    script: "pây",
    phonetic: "",
    notes: "",
  },
  "mặc áo quần": {
    script: "slửa khóa",
    phonetic: "",
    notes: "",
  },
  "bắt muỗi": {
    script: "pjắt nhùng",
    phonetic: "",
    notes: "",
  },
  "thả màn": {
    script: "khang rứt",
    phonetic: "",
    notes: "",
  },
  "đắp chăn": {
    script: "hấm pjả / hốm pjả",
    phonetic: "",
    notes: "",
  },
  "nằm mơ": {
    script: "phjân cùn / phjăn cừn",
    phonetic: "",
    notes: "",
  },
  "trải chiếu": {
    script: "phjái phjục",
    phonetic: "",
    notes: "",
  },
  "buồn ngủ": {
    script: "màu noòn",
    phonetic: "",
    notes: "",
  },
  "khó ngủ": {
    script: "nòn khỏ / nòn mí đắc",
    phonetic: "",
    notes: "",
  },
  "bóng đè": {
    script: "pji dăm đé",
    phonetic: "",
    notes: "",
  },
  "ngủ ngon": {
    script: "nòn đắc",
    phonetic: "",
    notes: "",
  },
  "ngủ mê mệt": {
    script: "nòn ón",
    phonetic: "",
    notes: "",
  },
  mệt: {
    script: "ón",
    phonetic: "",
    notes: "",
  },
  khỏe: {
    script: "mì rềng / mì rèng",
    phonetic: "",
    notes: "",
  },
  "mệt mỏi": {
    script: "ón ín",
    phonetic: "",
    notes: "",
  },
  "mỏi chân/gối": {
    script: "kha nất / kha nái / kha ón",
    phonetic: "",
    notes: "",
  },
  "đau lưng": {
    script: "lăng chjếp",
    phonetic: "",
    notes: "",
  },
  "đau chân": {
    script: "kha chjếp",
    phonetic: "",
    notes: "",
  },
  "đau bụng": {
    script: "móoc chjếp",
    phonetic: "",
    notes: "",
  },
  "mỏi vai": {
    script: "bá nất",
    phonetic: "",
    notes: "",
  },
  "mỏi tay": {
    script: "mừng nất",
    phonetic: "",
    notes: "",
  },
  "đấm lưng": {
    script: "tjụp lăng",
    phonetic: "",
    notes: "",
  },
  "xoa bụng": {
    script: "lụp toọng",
    phonetic: "",
    notes: "",
  },
  "ôm bụng": {
    script: "cót mốc",
    phonetic: "",
    notes: "",
  },
  "đánh gió": {
    script: "noọt xá",
    phonetic: "",
    notes: "",
  },
  "bắt gió": {
    script: "náp xá",
    phonetic: "",
    notes: "",
  },
  xông: {
    script: "rùm",
    phonetic: "",
    notes: "",
  },
  "làm nhà": {
    script: "hjết rườn",
    phonetic: "",
    notes: "",
  },
  "bắt ếch": {
    script: "khản cấp",
    phonetic: "",
    notes: "",
  },
  "bắt gà": {
    script: "cặp cáy",
    phonetic: "",
    notes: "",
  },
  "bẫy thú": {
    script: "téng cắp",
    phonetic: "",
    notes: "",
  },
  "bẫy chuột": {
    script: "téng nu",
    phonetic: "",
    notes: "",
  },
  dắt: {
    script: "chung",
    phonetic: "",
    notes: "",
  },
  "dắt trâu": {
    script: "chung vài",
    phonetic: "",
    notes: "",
  },
  "dắt bò": {
    script: "chung mò",
    phonetic: "",
    notes: "",
  },
  "lấy cỏ": {
    script: "au nhả",
    phonetic: "",
    notes: "",
  },
  lấy: {
    script: "au",
    phonetic: "",
    notes: "",
  },
  "lấy vợ": {
    script: "au lùa / au mẻ",
    phonetic: "",
    notes: "",
  },
  "lấy chồng": {
    script: "au khươi",
    phonetic: "",
    notes: "",
  },
  "lấy chăn": {
    script: "au phjà",
    phonetic: "",
    notes: "",
  },
  "lấy nước": {
    script: "au nặm",
    phonetic: "",
    notes: "",
  },
  "lấy nón": {
    script: "au chúp",
    phonetic: "",
    notes: "",
  },
  "thơm (hôn)": {
    script: "chúp",
    phonetic: "",
    notes: "",
  },
  ghét: {
    script: "kẹt",
    phonetic: "",
    notes: "",
  },
  thích: {
    script: "nắt",
    phonetic: "",
    notes: "",
  },
  yêu: {
    script: "điếp",
    phonetic: "",
    notes: "",
  },
  "yêu nhau": {
    script: "điếp căn",
    phonetic: "",
    notes: "",
  },
  "thích nhau": {
    script: "nắt căn",
    phonetic: "",
    notes: "",
  },
  "lấy nhau": {
    script: "au căn",
    phonetic: "",
    notes: "",
  },
  "bỏ nhau": {
    script: "pjá căn / tả căn",
    phonetic: "",
    notes: "",
  },
  bỏ: {
    script: "pjá",
    phonetic: "",
    notes: "",
  },
  "đợi (chờ)": {
    script: "thả",
    phonetic: "",
    notes: "",
  },
  cởi: {
    script: "ké",
    phonetic: "",
    notes: "",
  },
  đón: {
    script: "rặp",
    phonetic: "",
    notes: "",
  },
  gặp: {
    script: "rộp",
    phonetic: "",
    notes: "",
  },
  "ai cũng lấy vợ/chồng hết rồi": {
    script: "cần từa củng mì pỏ mì mẻ lẹo dá",
    phonetic: "",
    notes: "",
  },
  "gặp nhau": {
    script: "rộp căn / rặp căn / chặp căn",
    phonetic: "",
    notes: "chặp căn (Ba Bể - Bắc Kạn)",
  },
  "xa nhau": {
    script: "quây căn",
    phonetic: "",
    notes: "",
  },
  "buồn chán": {
    script: "bứa",
    phonetic: "",
    notes: "",
  },
  ngứa: {
    script: "đẳn",
    phonetic: "",
    notes: "",
  },
  "nước ăn chân tay": {
    script: "pần xo",
    phonetic: "",
    notes: "",
  },
  "chia tay": {
    script: "phjạc căn",
    phonetic: "",
    notes: "",
  },
  "gần nhau": {
    script: "slâử căn",
    phonetic: "",
    notes: "",
  },
  "xích gần nhau": {
    script: "thân sảng căn",
    phonetic: "",
    notes: "",
  },
  "đuổi đi": {
    script: "tẹp pây",
    phonetic: "",
    notes: "",
  },
  "xích vào": {
    script: "thân khẩu",
    phonetic: "",
    notes: "",
  },
  "xích ra": {
    script: "thân oóc",
    phonetic: "",
    notes: "",
  },
  "đón em": {
    script: "rặp noọng",
    phonetic: "",
    notes: "",
  },
  "đợi anh": {
    script: "thả chài / thả báo",
    phonetic: "",
    notes: "",
  },
  mong: {
    script: "ngoòng / ngâừ",
    phonetic: "",
    notes: "",
  },
  quên: {
    script: "lồm",
    phonetic: "",
    notes: "",
  },
  nhớ: {
    script: "chứ",
    phonetic: "",
    notes: "",
  },
  "em nhớ anh nhiều": {
    script: "noọng chứ chài lai",
    phonetic: "",
    notes: "",
  },
  trả: {
    script: "pjá",
    phonetic: "",
    notes: "",
  },
  "xin tiền": {
    script: "xo xèn",
    phonetic: "",
    notes: "",
  },
  "chửi / mắng": {
    script: "đá",
    phonetic: "",
    notes: "",
  },
  "chửi to": {
    script: "đá rèng",
    phonetic: "",
    notes: "",
  },
  đánh: {
    script: "nện / tệnh",
    phonetic: "",
    notes: "",
  },
  tát: {
    script: "phja",
    phonetic: "",
    notes: "",
  },
  đấm: {
    script: "tăm / tjệnh",
    phonetic: "",
    notes: "",
  },
  ôm: {
    script: "cót",
    phonetic: "",
    notes: "",
  },
  "ôm chặt": {
    script: "cót mắn",
    phonetic: "",
    notes: "",
  },
  "can ra / ngăn ra": {
    script: "pjéc oóc",
    phonetic: "",
    notes: "",
  },
  "đẩy ra": {
    script: "trỏ oóc",
    phonetic: "",
    notes: "",
  },
  "đẩy vào": {
    script: "trỏ khẩu",
    phonetic: "",
    notes: "",
  },
  "mở cửa": {
    script: "khay tu",
    phonetic: "",
    notes: "",
  },
  đóng: {
    script: "hắp",
    phonetic: "",
    notes: "",
  },
  nói: {
    script: "phjuối",
    phonetic: "",
    notes: "",
  },
  "nói chuyện": {
    script: "phjuối tẻn",
    phonetic: "",
    notes: "",
  },
  "nói cười": {
    script: "phjuối khua",
    phonetic: "",
    notes: "",
  },
  "cốc đầu": {
    script: "khoóc thua",
    phonetic: "",
    notes: "",
  },
  "gội đầu": {
    script: "khuổi thua",
    phonetic: "",
    notes: "",
  },
  "nhổ tóc bạc": {
    script: "lốc phjôm khao",
    phonetic: "",
    notes: "",
  },
  "tỉa ngô": {
    script: "thjón bắp",
    phonetic: "",
    notes: "",
  },
  "tỉa lúa": {
    script: "thjón chả",
    phonetic: "",
    notes: "",
  },
  "dặm lúa": {
    script: "dỏm nà",
    phonetic: "",
    notes: "",
  },
  "tập viết": {
    script: "cháo việt",
    phonetic: "",
    notes: "",
  },
  "học / đi học": {
    script: "slon slư / pây slon slư",
    phonetic: "",
    notes: "",
  },
  "bán hàng": {
    script: "khai cúa",
    phonetic: "",
    notes: "",
  },
  "mua hàng": {
    script: "rjự cúa",
    phonetic: "",
    notes: "",
  },
  "bán gạo": {
    script: "khai khẩu",
    phonetic: "",
    notes: "",
  },
  "mua gạo": {
    script: "rjự khẩu",
    phonetic: "",
    notes: "",
  },
  "bán quả": {
    script: "khai mác",
    phonetic: "",
    notes: "",
  },
  "bán rau": {
    script: "khai phjắc",
    phonetic: "",
    notes: "",
  },
  "phát nương rẫy": {
    script: "phját rẩy",
    phonetic: "",
    notes: "",
  },
  "đám ruộng": {
    script: "rẩư nà",
    phonetic: "",
    notes: "",
  },
  "đám rẫy": {
    script: "đôn rẩy",
    phonetic: "",
    notes: "",
  },
  "đi mua thịt": {
    script: "pây rjự nựa",
    phonetic: "",
    notes: "",
  },
  "gối đầu": {
    script: "mon thua",
    phonetic: "",
    notes: "",
  },
  "gác chân": {
    script: "cái kha",
    phonetic: "",
    notes: "",
  },
  giấy: {
    script: "chỉa",
    phonetic: "",
    notes: "",
  },
  "giấy trắng": {
    script: "chỉa khao",
    phonetic: "",
    notes: "",
  },
  "giấy màu": {
    script: "chỉa đăm đeng",
    phonetic: "",
    notes: "",
  },
  "màu vàng": {
    script: "lương / hẻn",
    phonetic: "",
    notes: "",
  },
  "màu xanh": {
    script: "kheo",
    phonetic: "",
    notes: "",
  },
  "màu đỏ": {
    script: "đeng",
    phonetic: "",
    notes: "",
  },
  "màu hồng": {
    script: "đáo",
    phonetic: "",
    notes: "",
  },
  "màu đen": {
    script: "đăm",
    phonetic: "",
    notes: "",
  },
  "màu hoa": {
    script: "lài",
    phonetic: "",
    notes: "",
  },
  "màu tím": {
    script: "cắm",
    phonetic: "",
    notes: "",
  },
  "màu nâu": {
    script: "moóc",
    phonetic: "",
    notes: "",
  },
  "màu trắng": {
    script: "khao",
    phonetic: "",
    notes: "",
  },
  "xanh lá mạ": {
    script: "kheo ón",
    phonetic: "",
    notes: "",
  },
  "đỏ chót": {
    script: "đeng chít",
    phonetic: "",
    notes: "",
  },
  "tím biếc": {
    script: "cắm bức",
    phonetic: "",
    notes: "",
  },
  "vàng đậm": {
    script: "lương dán",
    phonetic: "",
    notes: "",
  },
  "màu trắng xóa": {
    script: "khao xác",
    phonetic: "",
    notes: "",
  },
  "tím sẫm": {
    script: "cắm tjử",
    phonetic: "",
    notes: "",
  },
  "đen xì": {
    script: "đăm nhám",
    phonetic: "",
    notes: "",
  },
  "hoa lấm chấm": {
    script: "lài ngặng",
    phonetic: "",
    notes: "",
  },
  "hoa vàng": {
    script: "bjoóc lương",
    phonetic: "",
    notes: "",
  },
  "đỏ thắm": {
    script: "đeng nhàn",
    phonetic: "",
    notes: "",
  },
  "xanh biếc": {
    script: "kheo bức",
    phonetic: "",
    notes: "",
  },
  "khó tính": {
    script: "khỏ tỉnh",
    phonetic: "",
    notes: "",
  },
  "lắm điều": {
    script: "pác lai",
    phonetic: "",
    notes: "",
  },
  "tức giận": {
    script: "phát rính",
    phonetic: "",
    notes: "",
  },
  "cần cù / chăm chỉ": {
    script: "sắc săn",
    phonetic: "",
    notes: "",
  },
  "lười nhác": {
    script: "sjạn / sjạn mjạt",
    phonetic: "",
    notes: "",
  },
  "nén giận": {
    script: "chjẳn rính",
    phonetic: "",
    notes: "",
  },
  "nguôi giận": {
    script: "rính lồng",
    phonetic: "",
    notes: "",
  },
  "ki bo": {
    script: "khắt khi",
    phonetic: "",
    notes: "",
  },
  "phóng khoáng": {
    script: "cò loải",
    phonetic: "",
    notes: "",
  },
  "nóng giận": {
    script: "rính phjôm",
    phonetic: "",
    notes: "",
  },
  "nóng nảy": {
    script: "rính khỉ",
    phonetic: "",
    notes: "",
  },
  "lòng dạ xấu xa": {
    script: "mốc khuân",
    phonetic: "",
    notes: "",
  },
  "lắm miệng": {
    script: "pác ác",
    phonetic: "",
    notes: "",
  },
  "giận nhanh": {
    script: "rính cấn",
    phonetic: "",
    notes: "",
  },
  "tháo vát": {
    script: "rjảo roạc",
    phonetic: "",
    notes: "",
  },
  "gan dạ / gan lì": {
    script: "cường lai / tài tảm",
    phonetic: "",
    notes: "",
  },
  "đẹp gái / đẹp trai": {
    script: "đây rjao / đây slao / đây báo",
    phonetic: "",
    notes: "",
  },
  dại: {
    script: "vả",
    phonetic: "",
    notes: "",
  },
  khôn: {
    script: "quai",
    phonetic: "",
    notes: "",
  },
  "ngớ ngẩn": {
    script: "âứ",
    phonetic: "",
    notes: "",
  },
  "tin người": {
    script: "rứn cần",
    phonetic: "",
    notes: "",
  },
  "bị lừa": {
    script: "tốc vả",
    phonetic: "",
    notes: "",
  },
  "sống lỏi / khôn lỏi": {
    script: "quai lình",
    phonetic: "",
    notes: "",
  },
  "hay giận dỗi": {
    script: "mốc kho / rjẩy kho",
    phonetic: "",
    notes: "",
  },
  "ấp úng": {
    script: "phjuối bấu oóc pjác",
    phonetic: "",
    notes: "",
  },
  "mau miệng": {
    script: "pác nẩư",
    phonetic: "",
    notes: "",
  },
  "hiền lành": {
    script: "mốc rjẩy đây",
    phonetic: "",
    notes: "",
  },
  "hài lòng": {
    script: "mốc phjôm / gò lồng",
    phonetic: "",
    notes: "",
  },
  "lo lắng": {
    script: "hí mốc rẩy khát",
    phonetic: "",
    notes: "",
  },
  "suy nghĩ": {
    script: "nẳm",
    phonetic: "",
    notes: "",
  },
  "vui vẻ": {
    script: "hôn hỉ",
    phonetic: "",
    notes: "",
  },
  "nóng lòng": {
    script: "mốc rjẩy rjằn",
    phonetic: "",
    notes: "",
  },
  "nóng mặt": {
    script: "nả pjôm",
    phonetic: "",
    notes: "",
  },
  "chóng mặt": {
    script: "lài tha",
    phonetic: "",
    notes: "",
  },
  "đau đầu": {
    script: "thua tót",
    phonetic: "",
    notes: "",
  },
  "giật mình": {
    script: "djan",
    phonetic: "",
    notes: "",
  },
  "hoa mắt": {
    script: "tha lài",
    phonetic: "",
    notes: "",
  },
  "mắt mù": {
    script: "tha bjót",
    phonetic: "",
    notes: "",
  },
  "đau mắt": {
    script: "chjếp tha",
    phonetic: "",
    notes: "",
  },
  "đau răng": {
    script: "khẻo chjếp",
    phonetic: "",
    notes: "",
  },
  "ù tai": {
    script: "xu vjính",
    phonetic: "",
    notes: "",
  },
  "điếc tai": {
    script: "xu nuốc",
    phonetic: "",
    notes: "",
  },
  "ngáp ngủ": {
    script: "mầu nòn / hao lầm",
    phonetic: "",
    notes: "",
  },
  "tê chân": {
    script: "mjửn kha",
    phonetic: "",
    notes: "",
  },
  "tỉnh giấc": {
    script: "thjẻo đua",
    phonetic: "",
    notes: "",
  },
  "câm như miệng hến": {
    script: "pjác oôm re / ngạo pác mì oóc",
    phonetic: "",
    notes: "",
  },
  "thính tai": {
    script: "su rỉnh",
    phonetic: "",
    notes: "",
  },
  "mắt tinh": {
    script: "tha quai / tha rỉnh",
    phonetic: "",
    notes: "",
  },
  "hay giúp người": {
    script: "riềng xiển",
    phonetic: "",
    notes: "",
  },
  run: {
    script: "rjằn / Sền slẳn",
    phonetic: "",
    notes: "",
  },
  "run rẩy": {
    script: "rjằn roọc",
    phonetic: "",
    notes: "",
  },
  "vắng vẻ": {
    script: "quẻng xích",
    phonetic: "",
    notes: "",
  },
  "đơn côi": {
    script: "đang đeo",
    phonetic: "",
    notes: "",
  },
  "đông đúc": {
    script: "đông nhào",
    phonetic: "",
    notes: "",
  },
  "tự hào": {
    script: "đăng boỏng",
    phonetic: "",
    notes: "",
  },
  "nóng tai": {
    script: "xu pôm",
    phonetic: "",
    notes: "",
  },
  "không hài lòng": {
    script: "mì ngám cồ",
    phonetic: "",
    notes: "",
  },
  "tham lam": {
    script: "tham cồ",
    phonetic: "",
    notes: "",
  },
  dài: {
    script: "rì / Lì",
    phonetic: "",
    notes: "Lì (Bình Liêu - Quảng Ninh)",
  },
  ngắn: {
    script: "tjẩn / Tển",
    phonetic: "",
    notes: "",
  },
  "dài ngoằng": {
    script: "rì roảng / Lì lát",
    phonetic: "",
    notes: "Lì lát (Bình Liêu - Quảng Ninh)",
  },
  "ngắn ngủn": {
    script: "tỉn tét / Tển nhảu",
    phonetic: "",
    notes: "Tển nhảu (Bình Liêu - Quảng Ninh)",
  },
  "một gang": {
    script: "cháp đều",
    phonetic: "",
    notes: "",
  },
  to: {
    script: "cải",
    phonetic: "",
    notes: "",
  },
  hơn: {
    script: "quá",
    phonetic: "",
    notes: "So sánh hơn (comparative)",
  },
  nhỏ: {
    script: "ráy / eng",
    phonetic: "",
    notes: "",
  },
  "to đùng": {
    script: "cải coọc / cải cúp",
    phonetic: "",
    notes: "",
  },
  "nhỏ xíu": {
    script: "ráy rít / eng nhét",
    phonetic: "",
    notes: "",
  },
  "mỏng dính": {
    script: "lịp lạp",
    phonetic: "",
    notes: "",
  },
  rộng: {
    script: "quảng",
    phonetic: "",
    notes: "",
  },
  "rộng mênh mông": {
    script: "quảng xác",
    phonetic: "",
    notes: "",
  },
  hẹp: {
    script: "cjặp / Hẹp",
    phonetic: "",
    notes: "",
  },
  "hẹp quá": {
    script: "cjặp kẹp",
    phonetic: "",
    notes: "",
  },
  cao: {
    script: "rung / Sông",
    phonetic: "",
    notes: "",
  },
  "cao chót vót": {
    script: "rung wuýt",
    phonetic: "",
    notes: "",
  },
  cong: {
    script: "kho",
    phonetic: "",
    notes: "",
  },
  thẳng: {
    script: "dàu",
    phonetic: "",
    notes: "",
  },
  "thẳng đuột": {
    script: "dàu dít",
    phonetic: "",
    notes: "",
  },
  "cong queo": {
    script: "quột ngjang / quột kjẻo",
    phonetic: "",
    notes: "",
  },
  lép: {
    script: "phjẹp",
    phonetic: "",
    notes: "",
  },
  "lép kẹp": {
    script: "léng",
    phonetic: "",
    notes: "",
  },
  "một mẩu": {
    script: "mjửn đều",
    phonetic: "",
    notes: "",
  },
  "1 mét": {
    script: "xích đều",
    phonetic: "",
    notes: "",
  },
  tròn: {
    script: "mần",
    phonetic: "",
    notes: "",
  },
  "tròn vo": {
    script: "mần léng / mần lít",
    phonetic: "",
    notes: "",
  },
  một: {
    script: "đều",
    phonetic: "",
    notes: "",
  },
  hai: {
    script: "sloong",
    phonetic: "",
    notes: "",
  },
  ba: {
    script: "slam",
    phonetic: "",
    notes: "",
  },
  bốn: {
    script: "slí",
    phonetic: "",
    notes: "",
  },
  năm: {
    script: "hả",
    phonetic: "",
    notes: "",
  },
  sáu: {
    script: "hốc",
    phonetic: "",
    notes: "",
  },
  bảy: {
    script: "chất",
    phonetic: "",
    notes: "",
  },
  tám: {
    script: "pjét",
    phonetic: "",
    notes: "",
  },
  chín: {
    script: "cẩư",
    phonetic: "",
    notes: "",
  },
  mười: {
    script: "slíp",
    phonetic: "",
    notes: "",
  },
  "mười một": {
    script: "slíp ất",
    phonetic: "",
    notes: "",
  },
  "một trăm": {
    script: "pác đều / pác nưng",
    phonetic: "",
    notes: "pác nưng (Thất Khê - Cao Bằng)",
  },
  "tháng chạp": {
    script: "bươn lạp",
    phonetic: "",
    notes: "",
  },
  "tháng giêng": {
    script: "bươn chiêng",
    phonetic: "",
    notes: "",
  },
  "ngày 30 âm": {
    script: "vằn đắp",
    phonetic: "",
    notes: "",
  },
  "ngày mùng một": {
    script: "xo ất",
    phonetic: "",
    notes: "",
  },
  "tháng mười một": {
    script: "bươn ất",
    phonetic: "",
    notes: "",
  },
  "hai mươi": {
    script: "nhỉ slíp",
    phonetic: "",
    notes: "",
  },
  "một sải tay": {
    script: "quoa đều / woa đều",
    phonetic: "",
    notes: "",
  },
  "một lạng": {
    script: "giàng đều / Chàng điu",
    phonetic: "",
    notes: "",
  },
  "ngày mùng hai": {
    script: "Vằn xo nhỉ",
    phonetic: "",
    notes: "",
  },
  "một nghìn": {
    script: "xiên đều / xiên nưng",
    phonetic: "",
    notes: "xiên nưng (Thất Khê - Cao Bằng)",
  },
  "hai nghìn": {
    script: "slong xiên",
    phonetic: "",
    notes: "",
  },
  "một đồng": {
    script: "mưn đều",
    phonetic: "",
    notes: "",
  },
  "một cái": {
    script: "ăn đều / ăn nưng",
    phonetic: "",
    notes: "ăn nưng (Thất Khê - Cao Bằng)",
  },
  "một con": {
    script: "tua đều / tua nưng",
    phonetic: "",
    notes: "tua nưng (Thất Khê - Cao Bằng)",
  },
  "một ít": {
    script: "ỉ đều / ỉnh nưng",
    phonetic: "",
    notes: "ỉnh nưng (Thất Khê - Cao Bằng)",
  },
  lạng: {
    script: "giàng / Chàng",
    phonetic: "",
    notes: "",
  },
  hạt: {
    script: "mặt / mưỡi / hồi",
    phonetic: "",
    notes: "hồi (Hữu Lũng - Lạng Sơn)",
  },
  "một hạt": {
    script: "mặt đều / mưỡi đều",
    phonetic: "",
    notes: "",
  },
  "bó rau": {
    script: "căm phjắc",
    phonetic: "",
    notes: "",
  },
  "bánh rán": {
    script: "pjẻng chao",
    phonetic: "",
    notes: "",
  },
  "bánh cuốn": {
    script: "pjẻng cuổn",
    phonetic: "",
    notes: "",
  },
  "bánh nướng": {
    script: "pjẻng hai",
    phonetic: "",
    notes: "",
  },
  "bánh gạo tẻ": {
    script: "pjẻng tẻ",
    phonetic: "",
    notes: "",
  },
  "bánh ú / bánh gai": {
    script: "pjẻng tải",
    phonetic: "",
    notes: "",
  },
  "bánh sắn": {
    script: "pjẻng mằn",
    phonetic: "",
    notes: "",
  },
  "bột gạo": {
    script: "bưa khẩu",
    phonetic: "",
    notes: "",
  },
  "cám gạo": {
    script: "rjằm khẩu / Lằm",
    phonetic: "",
    notes: "",
  },
  "bánh khảo": {
    script: "cao",
    phonetic: "",
    notes: "",
  },
  "bánh tro": {
    script: "pjẻng đắng / Kèm đắng",
    phonetic: "",
    notes: "",
  },
  "bánh trôi": {
    script: "phù noòng / bưa noòng",
    phonetic: "",
    notes: "",
  },
  "bánh chưng": {
    script: "pẻng chưng",
    phonetic: "",
    notes: "",
  },
  "bánh bò": {
    script: "cao bông",
    phonetic: "",
    notes: "",
  },
  "bánh trà lam": {
    script: "pẻng kinh",
    phonetic: "",
    notes: "",
  },
};
