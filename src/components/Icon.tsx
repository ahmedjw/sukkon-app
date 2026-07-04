import { type LucideIcon } from 'lucide-react-native';

import { colors } from '@theme/tokens';

type Props = {
  icon: LucideIcon;
  size?: number;
  color?: string;
  strokeWidth?: number;
};

export function Icon({ icon: IconCmp, size = 20, color = colors.textHi, strokeWidth = 2 }: Props) {
  return <IconCmp size={size} color={color} strokeWidth={strokeWidth} />;
}
