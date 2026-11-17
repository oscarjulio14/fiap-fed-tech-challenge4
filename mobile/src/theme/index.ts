export const colors = {
  primary: '#E5195E', // rosa FIAP
  primaryDark: '#B30F47',
  primarySoft: '#FDE7EF',
  background: '#F5F6FA',
  surface: '#FFFFFF',
  text: '#1F2430',
  textMuted: '#6B7280',
  border: '#E3E6ED',
  danger: '#D93025',
  dangerSoft: '#FDECEA',
  success: '#1E8E3E',
  successSoft: '#E6F4EA',
  warning: '#B26A00',
  warningSoft: '#FFF4E0',
  white: '#FFFFFF',
};

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };

export const radius = { sm: 8, md: 12, lg: 16, pill: 999 };

export const font = {
  title: 22,
  subtitle: 18,
  body: 15,
  small: 13,
};

export const shadow = {
  shadowColor: '#000',
  shadowOpacity: 0.06,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: 2 },
  elevation: 2,
} as const;
