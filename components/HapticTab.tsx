import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { PlatformPressable } from '@react-navigation/elements';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

interface HapticTabProps extends BottomTabBarButtonProps {
  hapticIntensity?: Haptics.ImpactFeedbackStyle;
  enableHaptics?: boolean;
  enableAndroidHaptics?: boolean;
}

export function HapticTab({
  hapticIntensity = Haptics.ImpactFeedbackStyle.Light,
  enableHaptics = true,
  enableAndroidHaptics = false,
  onPressIn,
  ...props
}: HapticTabProps) {
  const handlePressIn = async (ev: any) => {
    if (enableHaptics) {
      try {
        if (Platform.OS === 'ios') {
          await Haptics.impactAsync(hapticIntensity);
        } else if (Platform.OS === 'android' && enableAndroidHaptics) {
          await Haptics.selectionAsync();
        }
      } catch (error) {
        console.warn('Haptic feedback failed:', error);
      }
    }
    
    onPressIn?.(ev);
  };

  return (
    <PlatformPressable
      {...props}
      onPressIn={handlePressIn}
    />
  );
}
