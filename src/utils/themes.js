export const themes = {
  light: {
    bg: '#ffffff',
    bgSecondary: '#f8f9fa',
    bgTertiary: '#e9ecef',
    text: '#212529',
    textHeading: '#111111',
    textSecondary: '#495057',
    textMuted: '#adb5bd',
    border: '#dee2e6',
    accent: '#228be6',
    accentLight: '#e7f5ff',
  },
  dark: {
    bg: '#1a1b1e',
    bgSecondary: '#25262b',
    bgTertiary: '#2c2e33',
    text: '#c1c2c5',
    textHeading: '#ffffff',
    textSecondary: '#909296',
    textMuted: '#5c5f66',
    border: '#373a40',
    accent: '#4dabf7',
    accentLight: '#1c3a5e',
  }
};

export const getColors = (theme) => themes[theme] || themes.light;
