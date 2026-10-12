/** Số mảnh cookie tối đa sẽ đọc khi cookie bị chia nhỏ (name.0, name.1, ...) */
const MAX_COOKIE_CHUNKS = 8;

/**
 * Tên cookie session của Better Auth.
 * - Môi trường HTTP thường: `better-auth.session_token`
 * - Môi trường HTTPS (secure cookie): có thêm tiền tố `__Secure-`
 */
const SESSION_COOKIE_NAMES = [
  'better-auth.session_token',
  '__Secure-better-auth.session_token',
];

/**
 * Kiểu headers đầu vào.
 * Node (req.headers) dùng `undefined` khi thiếu header; giữ thêm `null` cho linh hoạt.
 */
type HeadersLike = Record<string, string | string[] | undefined | null>;

/**
 * Giải mã URL (vd: `%3D` -> `=`) một cách an toàn.
 * Nếu chuỗi bị encode lỗi thì decodeURIComponent sẽ throw,
 * khi đó trả về chuỗi gốc thay vì làm crash request.
 *
 * @param value chuỗi cần decode
 * @returns chuỗi đã decode, hoặc chuỗi gốc nếu decode thất bại
 */
function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

/**
 * Lấy token từ header `Authorization: Bearer <token>`.
 *
 * Các bước:
 * 1. Đọc header authorization (Node luôn đưa tên header về chữ thường,
 *    vẫn kiểm tra thêm `Authorization` phòng trường hợp headers tự tạo).
 * 2. Nếu header là mảng thì lấy phần tử đầu.
 * 3. Kiểm tra có tiền tố `bearer ` (không phân biệt hoa thường).
 * 4. Cắt bỏ tiền tố, trim khoảng trắng, rồi decode URL.
 *
 * @param headers headers của request
 * @returns token (chưa cắt chữ ký), hoặc null nếu không có / sai định dạng
 */
export function extractBearerToken(headers: HeadersLike): string | null {
  const raw = headers.authorization ?? headers.Authorization;

  const t = Array.isArray(raw) ? raw[0] : raw;

  if (!t || !t.toLowerCase().startsWith('bearer ')) {
    return null;
  }

  const v = t.slice(7).trim(); // 7 = độ dài của 'bearer '

  if (!v) {
    return null;
  }

  return safeDecode(v);
}

/**
 * Tìm giá trị của một cookie theo tên trong chuỗi header Cookie.
 *
 * Header Cookie có dạng: `theme=dark; a=1; better-auth.session_token=xxx`
 * -> tách theo `;`, mỗi phần tách theo dấu `=` ĐẦU TIÊN
 *    (vì giá trị có thể chứa `=`, vd base64 padding).
 *
 * @param header chuỗi header Cookie
 * @param name tên cookie cần tìm (so khớp chính xác)
 * @returns giá trị cookie đã decode, hoặc null nếu không có / rỗng
 */
function cookieValue(header: string, name: string): string | null {
  const parts = header.split(';');
  for (const part of parts) {
    const idx = part.indexOf('=');
    if (idx === -1) {
      continue; // bỏ qua phần không có dấu `=` (không phải cặp key=value)
    }
    const k = part.slice(0, idx).trim();
    if (k === name) {
      const v = part.slice(idx + 1).trim();
      return v ? safeDecode(v) : null; // cookie đã ký bị URL-encode, cần decode giống bearer
    }
  }
  return null;
}

/**
 * Đọc giá trị cookie session, hỗ trợ cả trường hợp cookie bị chia nhỏ.
 *
 * Trình duyệt giới hạn mỗi cookie ~4KB, nên cookie dài có thể bị chia thành
 * `name.0`, `name.1`, `name.2`, ... Hàm này:
 * 1. Thử đọc cookie nguyên vẹn theo `basename` trước.
 * 2. Nếu không có, đọc lần lượt các mảnh `basename.0`, `basename.1`, ...
 *    cho tới khi gặp mảnh bị thiếu (tối đa MAX_COOKIE_CHUNKS mảnh), rồi nối lại.
 *
 * @param header chuỗi header Cookie
 * @param basename tên cookie gốc (không có hậu tố .0 .1 .2)
 * @returns giá trị cookie đầy đủ, hoặc null nếu không tìm thấy
 */
function readSessionCookieValue(
  header: string,
  basename: string,
): string | null {
  const whole = cookieValue(header, basename);
  if (whole) {
    return whole;
  }

  const chunks: string[] = [];
  for (let i = 0; i < MAX_COOKIE_CHUNKS; i++) {
    const chunk = cookieValue(header, `${basename}.${i}`);
    if (!chunk) break; // mảnh bị thiếu -> dừng, không đọc tiếp
    chunks.push(chunk);
  }
  return chunks.length > 0 ? chunks.join('') : null;
}

/**
 * Cắt phần chữ ký khỏi giá trị dạng `token.signature`, chỉ giữ lại `token`.
 * Dựa vào dấu `.` CUỐI CÙNG; nếu không có dấu chấm thì trả nguyên chuỗi.
 *
 * Lưu ý: hàm này KHÔNG xác thực chữ ký. Vẫn an toàn vì session token là chuỗi
 * ngẫu nhiên và sẽ được tra trong DB ở bước sau. Không dùng cho JWT
 * (JWT có nhiều dấu chấm, cắt như vậy sẽ làm hỏng token).
 *
 * @param value giá trị dạng `token.signature`
 * @returns phần token
 */
function stripSignature(value: string): string {
  const lastDot = value.lastIndexOf('.');
  return lastDot > 0 ? value.slice(0, lastDot) : value;
}

/**
 * Hàm chính: lấy session token từ headers của request.
 *
 * Thứ tự ưu tiên:
 * 1. Header `Authorization: Bearer <token>` (thường dùng cho mobile / API client).
 * 2. Cookie session của Better Auth (thường dùng cho trình duyệt),
 *    thử lần lượt các tên trong SESSION_COOKIE_NAMES.
 *
 * Cả hai nguồn đều được cắt chữ ký trước khi trả về.
 *
 * @param headers headers của request (có thể truyền thẳng req.headers)
 * @returns session token (không kèm chữ ký), hoặc null nếu không tìm thấy
 */
export function extractSessionTokenFromHeaders(
  headers: HeadersLike,
): string | null {
  const bearer = extractBearerToken(headers);
  if (bearer) {
    return stripSignature(bearer);
  }

  const rawCookie = headers.cookie ?? headers.Cookie;
  // nếu cookie là mảng thì gộp lại thay vì chỉ lấy phần tử đầu
  const cookieHeader = Array.isArray(rawCookie)
    ? rawCookie.join('; ')
    : rawCookie;

  if (cookieHeader) {
    for (const name of SESSION_COOKIE_NAMES) {
      const val = readSessionCookieValue(cookieHeader, name);
      if (val) {
        return stripSignature(val);
      }
    }
  }
  return null;
}
