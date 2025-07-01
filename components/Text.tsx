import { StyleSheet, Text as RNText, type TextProps } from 'react-native';

import { useThemeColor } from '@/hooks/useThemeColor';

export type TextComponentProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
};

export function Text({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: TextComponentProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  return (
    <RNText
      style={[
        { color },
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'link' ? styles.link : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: 'Poppins-Regular',
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: 'Poppins-Medium',
  },
  title: {
    fontSize: 32,
    lineHeight: 32,
    fontFamily: 'Poppins-Bold',
  },
  subtitle: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
  },
  link: {
    lineHeight: 30,
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#0a7ea4',
  },
}); 