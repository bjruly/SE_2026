import { StyleSheet } from 'react-native';

export const colors = {
  primary: '#1d4ed8',
  green: '#16a34a',
  text: '#111827',
  muted: '#6b7280',
  border: '#e5e7eb',
  warn: '#b45309',
  bg: '#f3f4f6',
};

export const shared = StyleSheet.create({
  meta: { fontSize: 12, color: colors.muted },
  warn: { fontSize: 13, color: colors.warn },
  btn: {
    paddingVertical: 10, paddingHorizontal: 14, borderRadius: 8,
    borderWidth: 1, borderColor: '#d1d5db', backgroundColor: '#fff', alignItems: 'center',
  },
  btnText: { fontSize: 15, color: colors.text },
  btnPrimary: { backgroundColor: colors.primary, borderColor: colors.primary },
  btnPrimaryText: { color: '#fff' },
  btnOn: { backgroundColor: colors.green, borderColor: colors.green },
  input: {
    borderWidth: 1, borderColor: '#d1d5db', borderRadius: 6, paddingHorizontal: 10,
    paddingVertical: 8, backgroundColor: '#fff', fontSize: 15,
  },
});
