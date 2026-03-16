import { IMAGES } from 'constants/assets';
import {
  Image,
  ImageResizeMode,
  ImageStyle,
  StyleProp,
  StyleSheet,
  TouchableOpacity,
  TouchableOpacityProps,
} from 'react-native';
import { StyleType } from 'types/common';

interface PhotoProps extends TouchableOpacityProps {
  source: string | number | null | undefined;
  size?: number;
  onPress?: () => void;
  disabled?: boolean;
  resizeMode?: ImageResizeMode;
  borderRadius?: number;
  containerStyle?: StyleType;
  imageStyle?: StyleProp<ImageStyle>;
}

export const Photo: React.FC<PhotoProps> = ({
  source,
  size = 50,
  onPress,
  disabled = false,
  resizeMode = 'cover',
  borderRadius = 0,
  containerStyle,
  imageStyle,
  ...otherProps
}) => {
  const imageSource = source
    ? typeof source === 'string'
      ? { uri: source, cache: 'force-cache' }
      : source
    : IMAGES.USER_IMAGE;

  const handlePress = () => {
    if (onPress) {
      onPress();
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={onPress ? 0.5 : 1}
      onPress={handlePress}
      style={[styles.container, containerStyle]}
      disabled={disabled}
      {...otherProps}
    >
      <Image
        source={imageSource}
        resizeMode={resizeMode}
        style={[styles.image, { width: size, height: size, borderRadius }, imageStyle]}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {},
});
