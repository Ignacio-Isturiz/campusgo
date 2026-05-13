import { StyleSheet, Platform } from 'react-native';

export const accountPalette = {
  primary: '#FF7A00', // Institutional Orange
  primaryDark: '#E66E00',
  primarySoft: '#FFF0E0',
  background: '#F8F9FA',
  surface: '#FFFFFF',
  text: '#1A1A1A',
  textMuted: '#6C757D',
  border: '#E9ECEF',
  danger: '#DC3545',
  success: '#28A745',
  darkBg: '#0F0F0F',
  darkSurface: '#1A1A1A',
  darkText: '#FFFFFF',
  darkTextMuted: '#A0A0A0',
  darkBorder: '#2A2A2A',
};

export const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: accountPalette.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: accountPalette.text,
  },
  card: {
    backgroundColor: accountPalette.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: accountPalette.textMuted,
    marginBottom: 8,
  },
  input: {
    height: 50,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 15,
    fontSize: 15,
    color: accountPalette.text,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  button: {
    height: 52,
    backgroundColor: accountPalette.primary,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
