// constants/theme.ts
import { MD3LightTheme as DefaultTheme } from "react-native-paper";

// Minimal Black & White Finance Theme
export const colors = {
  // Core monochrome
  black: "#000000",
  white: "#FFFFFF",

  // Grays (from darkest to lightest)
  gray900: "#0A0A0A",        // Almost black
  gray800: "#1A1A1A",        // Dark surface
  gray700: "#2A2A2A",        // Elevated dark
  gray600: "#404040",        // Medium dark
  gray500: "#737373",        // Medium
  gray400: "#A3A3A3",        // Medium light
  gray300: "#D4D4D4",        // Light
  gray200: "#E5E5E5",        // Very light
  gray100: "#F5F5F5",        // Almost white
  gray50:  "#FAFAFA",        // Off white

  // Strategic color accents (only for financial data)
  profit: "#10B981",         // Green for profits
  profitBg: "#ECFDF5",       // Light green background
  loss: "#EF4444",           // Red for losses
  lossBg: "#FEF2F2",         // Light red background
  neutral: "#737373",        // Gray for neutral

  // Backgrounds
  background: "#000000",     // Pure black
  backgroundElevated: "#1A1A1A",
  surface: "#FFFFFF",
  surfaceDark: "#0A0A0A",

  // Borders
  border: "#E5E5E5",
  borderDark: "#2A2A2A",

  // Text
  textPrimary: "#000000",
  textSecondary: "#737373",
  textTertiary: "#A3A3A3",
  textWhite: "#FFFFFF",
  textGray: "#D4D4D4",

  // Overlays
  overlay: "rgba(0, 0, 0, 0.5)",
  overlayLight: "rgba(0, 0, 0, 0.3)",
};

// Minimal gradients (black/white only, no color)
export const gradients = {
  dark: ["#000000", "#1A1A1A"],
  light: ["#FFFFFF", "#F5F5F5"],
  subtle: ["#FAFAFA", "#FFFFFF"],
};

export const paperTheme = {
  ...DefaultTheme,
  roundness: 8, // Sharp, minimal corners
  fonts: {
    ...DefaultTheme.fonts,
    bodyMedium: { ...DefaultTheme.fonts.bodyMedium, fontFamily: "Poppins_400" },
    bodyLarge:  { ...DefaultTheme.fonts.bodyLarge,  fontFamily: "Poppins_400" },
    titleMedium:{ ...DefaultTheme.fonts.titleMedium,fontFamily: "Poppins_600" },
    titleLarge: { ...DefaultTheme.fonts.titleLarge, fontFamily: "Poppins_700" },
    labelLarge: { ...DefaultTheme.fonts.labelLarge, fontFamily: "Poppins_600" },
  },
  colors: {
    ...DefaultTheme.colors,
    primary: colors.black,
    secondary: colors.gray500,
    background: colors.white,
    surface: colors.white,
    outline: colors.border,
    error: colors.loss,
  },
};

// Spacing system
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Shadow presets
export const shadows = {
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  colored: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
};
