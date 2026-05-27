/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#FF7A00';
const tintColorDark = '#FF8A1A';

export const Colors = {
  light: {
    text: '#11181C',
    textMuted: '#5B6167',
    background: '#F7F7F7',
    surface: '#FFFFFF',
    surfaceAlt: '#F1F3F5',
    card: '#FFFFFF',
    border: '#E6E8EB',
    muted: 'rgba(0,0,0,0.45)',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#E7EBF0',
    textMuted: '#A3A9B2',
    background: '#0E0F12',
    surface: '#14161A',
    surfaceAlt: '#1B1E24',
    card: '#15181E',
    border: '#262B33',
    muted: 'rgba(255,255,255,0.55)',
    tint: tintColorDark,
    icon: '#A3A9B2',
    tabIconDefault: '#8B929C',
    tabIconSelected: tintColorDark,
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
