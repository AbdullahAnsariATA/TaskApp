import { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, StyleProp, ViewStyle, TouchableOpacity } from 'react-native';
import { Photo, Icon, Typography, ModalComponent } from 'components/common';
import { COLORS, FLEX_CENTER, screenWidth } from 'utils/index';
import { VARIABLES, IMAGES } from 'constants/index';
import { FontSize } from 'types/fontTypes';
import { SelectedMedia, useMediaPicker, UseMediaPickerOptions } from 'hooks/useMediaPicker';

interface ProfilePictureUploadProps {
  /** Current profile image source (URI string or image asset) */
  source?: string | number | null;
  /** Callback when image is selected */
  onImageSelected?: (image: SelectedMedia) => void;
  /** Whether the edit icon should be shown */
  showEditIcon?: boolean;
  /** Whether the component is disabled (no updates allowed) */
  disabled?: boolean;
  /** Size of the profile picture */
  size?: number;
  /** Border width */
  borderWidth?: number;
  /** Border color */
  borderColor?: string;
  /** Validation error message */
  error?: string;
  /** Whether the field has been touched (for error display) */
  touched?: boolean;
  /** Custom container style */
  containerStyle?: StyleProp<ViewStyle>;
  /** Image picker configuration */
  imageConfig?: UseMediaPickerOptions;
}

export const ProfilePictureUpload: React.FC<ProfilePictureUploadProps> = ({
  source,
  onImageSelected,
  showEditIcon = true,
  disabled = false,
  size = screenWidth(30),
  borderWidth = 3,
  borderColor = COLORS.PRIMARY,
  error,
  touched = false,
  containerStyle,
  imageConfig = {
    mediaType: 'image',
    cropping: true,
    width: 300,
    height: 300,
    cropperCircleOverlay: true,
  },
}) => {
  const { pickMedia, selectedMedia } = useMediaPicker();
  const previousMediaRef = useRef<SelectedMedia | null>(null);
  const onImageSelectedRef = useRef(onImageSelected);
  const [pickerModalVisible, setPickerModalVisible] = useState(false);

  // Keep the callback ref up to date without causing re-renders
  useEffect(() => {
    onImageSelectedRef.current = onImageSelected;
  }, [onImageSelected]);

  // Default image config
  const defaultImageConfig: UseMediaPickerOptions = {
    mediaType: 'image',
    cropping: true,
    width: 300,
    height: 300,
    cropperCircleOverlay: true,
    ...imageConfig,
  };

  const handleImagePick = () => {
    if (disabled) return;
    setPickerModalVisible(true);
  };

  const handlePickFromCamera = () => {
    setPickerModalVisible(false);
    pickMedia({ ...defaultImageConfig, source: 'camera' });
  };

  const handlePickFromGallery = () => {
    setPickerModalVisible(false);
    pickMedia({ ...defaultImageConfig, source: 'gallery' });
  };

  // Notify parent when image is selected (only when media actually changes)
  useEffect(() => {
    const currentMedia = selectedMedia?.[0];

    // Only call callback if:
    // 1. There's new media
    // 2. It's different from the previous one (by URI comparison)
    // 3. Callback exists
    if (
      currentMedia &&
      currentMedia.uri !== previousMediaRef.current?.uri &&
      onImageSelectedRef.current
    ) {
      previousMediaRef.current = currentMedia;
      onImageSelectedRef.current(currentMedia);
    }
  }, [selectedMedia]); // Only depend on selectedMedia, not onImageSelected

  // Determine which image to display
  const displayImage = selectedMedia?.[0]?.uri ?? source ?? IMAGES.USER_IMAGE;
  const imageSize = size - borderWidth * 2; // Subtract border width on both sides
  const borderRadius = imageSize / 2;
  const showError = touched && error;

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.photoContainer}>
        <View
          style={[
            styles.photoWrapper,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderWidth,
              borderColor,
            },
          ]}
        >
          <Photo
            source={displayImage}
            resizeMode='cover'
            size={imageSize}
            borderRadius={borderRadius}
          />
        </View>
        {showEditIcon && !disabled && (
          <Icon
            componentName={VARIABLES.Entypo}
            iconName={'camera'}
            onPress={handleImagePick}
            color={COLORS.PRIMARY}
            iconStyle={[
              styles.editIcon,
              {
                bottom: 5,
                right: 5,
              },
            ]}
          />
        )}
      </View>
      {showError && (
        <View style={styles.errorContainer}>
          <Typography style={styles.errorText}>{error}</Typography>
        </View>
      )}

      <ModalComponent
        modalVisible={pickerModalVisible}
        setModalVisible={setPickerModalVisible}
        wantToCloseOnBack
        wantToCloseOnTop
      >
        <Typography style={styles.modalTitle}>Choose Image Source</Typography>
        <TouchableOpacity style={styles.modalOption} onPress={handlePickFromCamera}>
          <Icon componentName="Ionicons" iconName="camera-outline" size={22} color={COLORS.TEXT} />
          <Typography style={styles.modalOptionText}>Camera</Typography>
        </TouchableOpacity>
        <TouchableOpacity style={styles.modalOption} onPress={handlePickFromGallery}>
          <Icon componentName="Ionicons" iconName="image-outline" size={22} color={COLORS.TEXT} />
          <Typography style={styles.modalOptionText}>Gallery</Typography>
        </TouchableOpacity>
        <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setPickerModalVisible(false)}>
          <Typography style={styles.modalCancelText}>Cancel</Typography>
        </TouchableOpacity>
      </ModalComponent>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoContainer: {
    position: 'relative',
    ...FLEX_CENTER,
  },
  photoWrapper: {
    backgroundColor: COLORS.WHITE,
    overflow: 'hidden',
    position: 'relative',
    ...FLEX_CENTER,
  },
  editIcon: {
    position: 'absolute',
    backgroundColor: COLORS.WHITE,
    borderWidth: 2,
    borderColor: COLORS.PRIMARY,
    padding: 6,
    borderRadius: 16,
    overflow: 'hidden',
    width: 32,
    height: 32,
    ...FLEX_CENTER,
  },
  errorContainer: {
    marginTop: 5,
    marginBottom: 10,
  },
  errorText: {
    color: COLORS.ERROR,
    fontSize: FontSize.Small,
    textAlign: 'center',
  },
  modalTitle: {
    fontSize: FontSize.MediumLarge,
    fontWeight: '700',
    color: COLORS.TEXT,
    marginBottom: 16,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  modalOptionText: {
    fontSize: FontSize.Medium,
    color: COLORS.TEXT,
  },
  modalCancelBtn: {
    alignItems: 'center',
    paddingVertical: 14,
    marginTop: 4,
  },
  modalCancelText: {
    fontSize: FontSize.Medium,
    color: COLORS.TEXT_SECONDARY,
    fontWeight: '600',
  },
});
