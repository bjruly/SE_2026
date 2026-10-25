import { z } from 'zod';

export const LANG_CODES = ['vi', 'en', 'zh'];

const emptyToNull = (v) => (typeof v === 'string' && v.trim() === '' ? null : v);

const translation = z.object({
  name: z.string().trim().min(1, 'Tên không được để trống').max(200),
  description: z.string().trim().min(1, 'Mô tả không được để trống').max(5000),
  audioUrl: z.preprocess(emptyToNull, z.string().trim().url('Đường dẫn audio không hợp lệ').max(2000).nullable().optional()),
});

export const poiBody = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  radiusMeters: z.number().int().min(1).max(1000),
  active: z.boolean().optional().default(true),
  translations: z.object({ vi: translation, en: translation, zh: translation }),
});

export const eventBody = z
  .object({
    poiId: z.string().min(1).max(64),
    type: z.enum(['listen', 'qr_scan']),
    lang: z.enum(LANG_CODES),
    source: z.enum(['auto', 'manual', 'qr']).optional(),
    client: z.enum(['web', 'mobile']).optional(),
  })
  .refine((e) => (e.type === 'listen' ? e.source === 'auto' || e.source === 'manual' : e.source === undefined || e.source === 'qr'), {
    message: 'source không khớp với type (listen: auto|manual, qr_scan: qr)',
  });

export const loginBody = z.object({
  email: z.string().trim().min(3).max(200),
  password: z.string().min(1).max(200),
});

const password = z.string().min(8, 'Mật khẩu phải có ít nhất 8 ký tự').max(200);
const email = z.string().trim().email('Email không hợp lệ').max(200);

export const createUserBody = z.object({
  email,
  fullName: z.string().trim().min(1).max(200),
  role: z.enum(['admin', 'editor']),
  password,
});

export const updateUserBody = z.object({
  fullName: z.string().trim().min(1).max(200).optional(),
  role: z.enum(['admin', 'editor']).optional(),
  isActive: z.boolean().optional(),
  password: password.optional(),
});

export const changePasswordBody = z.object({
  currentPassword: z.string().min(1).max(200),
  newPassword: password,
});
