

export const DarkColors = {
  background: "#07061D", 
  cottonCandy: "#66D9EF",
  lemon: "#2DFF0B",
  gum: "#FD78C4",
  pistachio: "#D3FFCC",
  cream: "#E2DFCD",
  foam: "#D7DAE2",
  snow: "#FFFFFF",
  tabBorder: "#DCFFD6", 
} as const;

export const LightColors = {
  background: "#FFFFFF",
  primary: "#4A90E2", 
  secondary: "#E91E63", 
  accent: "#4CAF50", 
  surface: "#F5F5F5",
  text: "#212121",
  textSecondary: "#757575",
  border: "#E0E0E0",
  tabBorder: "#E0E0E0", 
} as const;

export const Colors = {
  light: {
    text: LightColors.text,
    background: LightColors.background,
    tint: LightColors.primary,
    icon: LightColors.textSecondary,
    tabIconDefault: LightColors.textSecondary,
    tabIconSelected: LightColors.primary,
    primary: LightColors.primary,
    secondary: LightColors.secondary,
    accent: LightColors.accent,
    surface: LightColors.surface,
    border: LightColors.border,
    tabBorder: LightColors.tabBorder,
  },
  dark: {
    text: DarkColors.foam,
    background: DarkColors.background,
    tint: DarkColors.cottonCandy,
    icon: DarkColors.foam,
    tabIconDefault: DarkColors.foam,
    tabIconSelected: DarkColors.cottonCandy,
    primary: DarkColors.cottonCandy,
    secondary: DarkColors.gum,
    accent: DarkColors.lemon,
    surface: DarkColors.cream,
    muted: DarkColors.pistachio,
    tabBorder: DarkColors.tabBorder,
  },
};
