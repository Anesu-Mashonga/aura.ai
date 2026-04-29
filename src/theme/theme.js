import { createTheme } from '@mui/material/styles'

const paletteByMode = {
  light: {
    primary: { main: '#e76f51', light: '#f4a261', dark: '#cc5b3f' },
    secondary: { main: '#2a9d8f', light: '#78c6bc', dark: '#1f766d' },
    background: { default: '#f7f2ea', paper: '#fffaf3' },
    text: { primary: '#152033', secondary: '#5f6878' },
    success: { main: '#2a9d8f' },
    warning: { main: '#f4a261' },
    error: { main: '#d64545' },
    divider: 'rgba(21, 32, 51, 0.08)',
  },
  dark: {
    primary: { main: '#ff8c6c', light: '#ffb18b', dark: '#e76f51' },
    secondary: { main: '#69d2c7', light: '#9be5dd', dark: '#2a9d8f' },
    background: { default: '#0e1726', paper: '#142033' },
    text: { primary: '#f8f3eb', secondary: '#aab6c8' },
    success: { main: '#5bc0a8' },
    warning: { main: '#f7b267' },
    error: { main: '#ff7b72' },
    divider: 'rgba(255, 246, 233, 0.08)',
  },
}

const commonTypography = {
  fontFamily: '"Manrope", "Segoe UI", sans-serif',
  h1: { fontFamily: '"Space Grotesk", "Manrope", sans-serif', fontWeight: 700, letterSpacing: '-0.06em' },
  h2: { fontFamily: '"Space Grotesk", "Manrope", sans-serif', fontWeight: 700, letterSpacing: '-0.06em' },
  h3: { fontFamily: '"Space Grotesk", "Manrope", sans-serif', fontWeight: 700, letterSpacing: '-0.05em' },
  h4: { fontFamily: '"Space Grotesk", "Manrope", sans-serif', fontWeight: 700, letterSpacing: '-0.05em' },
  h5: { fontFamily: '"Space Grotesk", "Manrope", sans-serif', fontWeight: 700, letterSpacing: '-0.04em' },
  h6: { fontFamily: '"Space Grotesk", "Manrope", sans-serif', fontWeight: 700, letterSpacing: '-0.03em' },
  button: { fontWeight: 700 },
}

const createAppTheme = (mode) => {
  const isDark = mode === 'dark'

  return createTheme({
    palette: {
      mode,
      ...paletteByMode[mode],
    },
    typography: commonTypography,
    shape: { borderRadius: 24 },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundImage: 'none',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 28,
            border: `1px solid ${isDark ? 'rgba(255, 246, 233, 0.08)' : 'rgba(21, 32, 51, 0.08)'}`,
            backgroundColor: isDark ? 'rgba(20, 32, 51, 0.78)' : 'rgba(255, 255, 255, 0.72)',
            backdropFilter: 'blur(20px)',
            transition: 'transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease',
            boxShadow: isDark
              ? '0 20px 50px rgba(0, 0, 0, 0.3)'
              : '0 24px 60px rgba(21, 32, 51, 0.1)',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 700,
            borderRadius: 999,
            paddingInline: 18,
            transition: 'transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease, background-color 0.18s ease',
            '&:hover': {
              transform: 'translateY(-1px)',
            },
          },
          containedPrimary: {
            background: 'linear-gradient(135deg, #e76f51 0%, #f4a261 100%)',
            boxShadow: '0 14px 30px rgba(231, 111, 81, 0.28)',
            '&:hover': {
              boxShadow: '0 18px 34px rgba(231, 111, 81, 0.34)',
            },
          },
          outlined: {
            borderWidth: 1.5,
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 999,
            fontWeight: 700,
            transition: 'transform 0.18s ease, border-color 0.18s ease, background-color 0.18s ease',
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            transition: 'transform 0.18s ease, background-color 0.18s ease, color 0.18s ease',
            '&:hover': {
              transform: 'translateY(-1px) scale(1.02)',
            },
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            transition: 'transform 0.18s ease, background-color 0.18s ease, box-shadow 0.18s ease',
            '&:hover': {
              transform: 'translateX(2px)',
            },
            '&.Mui-selected': {
              boxShadow: isDark
                ? '0 12px 24px rgba(0, 0, 0, 0.18)'
                : '0 12px 24px rgba(21, 32, 51, 0.08)',
            },
          },
        },
      },
      MuiMenuItem: {
        styleOverrides: {
          root: {
            transition: 'background-color 0.18s ease, transform 0.18s ease',
            '&:hover': {
              transform: 'translateX(2px)',
            },
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 18,
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.8)',
          },
        },
      },
      MuiToggleButton: {
        styleOverrides: {
          root: {
            borderRadius: 999,
            textTransform: 'capitalize',
            paddingInline: 16,
            transition: 'transform 0.18s ease, border-color 0.18s ease, background-color 0.18s ease',
            '&:hover': {
              transform: 'translateY(-1px)',
            },
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 28,
          },
        },
      },
    },
  })
}

export const lightTheme = createAppTheme('light')
export const darkTheme = createAppTheme('dark')
