import { StyleSheet } from 'react-native';

export const colors = {
  navy: '#102c52',
  blue: '#174a78',
  teal: '#147491',
  paleTeal: '#e7f5f2',
  primary: '#14536b',
  green: '#16a34a',
  text: '#111827',
  muted: '#64748b',
  border: '#dbe5ee',
  warn: '#b45309',
  bg: '#f3f6f9',
};

export const shared = StyleSheet.create({
  meta: { fontSize: 12, lineHeight: 17, color: colors.muted },
  warn: { fontSize: 13, lineHeight: 18, color: colors.warn },
  btn: {
    minHeight: 42, paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10,
    borderWidth: 1, borderColor: '#cbd5e1', backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center',
  },
  btnText: { fontSize: 14, fontWeight: '600', color: colors.text },
  btnPrimary: { backgroundColor: colors.teal, borderColor: colors.teal },
  btnPrimaryText: { color: '#fff' },
  btnOn: { backgroundColor: '#15803d', borderColor: '#15803d' },
  input: {
    minHeight: 44, borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 10, paddingHorizontal: 12,
    paddingVertical: 9, backgroundColor: '#fff', fontSize: 15,
  },
});
