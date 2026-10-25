export class HttpError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

// Kiểm tra dữ liệu bằng schema zod; sai thì trả lỗi 400 kèm chi tiết từng trường
export function parse(schema, data) {
  const r = schema.safeParse(data);
  if (!r.success) {
    const details = r.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message }));
    throw new HttpError(400, 'VALIDATION', 'Dữ liệu không hợp lệ', details);
  }
  return r.data;
}
