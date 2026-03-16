import { useState } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { useAppSelector, useAppDispatch } from 'types/reduxTypes';
import { updateApp, SubscriptionStatus } from 'store/slices/appsSlice';
import { SCREENS } from 'constants/index';
import { RootStackParamList } from 'navigation/Navigators';
import { createAppValidationSchema, COLORS } from 'utils/index';
import { useFormikForm, useAsyncButton } from 'hooks/index';
import { useMediaPicker } from 'hooks/useMediaPicker';
import { showSuccessToast } from 'utils/toast';
import { Button, Input, Wrapper, Typography, ModalComponent, Icon } from 'components/index';
import { onBack } from 'navigation/index';
import { styles } from './styles';

type RouteType = RouteProp<RootStackParamList, typeof SCREENS.EDIT_APP>;

const CATEGORIES = ['Analytics', 'Productivity', 'Storage', 'Business', 'Marketing', 'Development', 'Other'];
const PLANS: SubscriptionStatus[] = ['free', 'pro', 'enterprise'];

const PLAN_COLORS: Record<SubscriptionStatus, string> = {
  free: '#6B7280',
  pro: '#3B82F6',
  enterprise: '#D97706',
};

interface EditAppFormValues {
  name: string;
  description: string;
  category: string;
}

const EditAppScreen = () => {
  const route = useRoute<RouteType>();
  const dispatch = useAppDispatch();
  const { pickMedia } = useMediaPicker();
  const { appId } = route.params;

  const app = useAppSelector(state => state.apps.apps.find(a => a.id === appId));

  const [plan, setPlan] = useState<SubscriptionStatus>(app?.subscriptionStatus ?? 'free');
  const [logo, setLogo] = useState<string | null>(app?.logo ?? null);
  const [imageModalVisible, setImageModalVisible] = useState(false);

  const handleSubmit = async (values: EditAppFormValues) => {
    await new Promise<void>(resolve => setTimeout(resolve, 600));
    dispatch(updateApp({
      id: appId,
      updates: {
        name: values.name.trim(),
        description: values.description.trim(),
        category: values.category,
        subscriptionStatus: plan,
        logo,
      },
    }));
    showSuccessToast(`${values.name.trim()} has been updated.`, 'Saved!');
    onBack();
  };

  const formik = useFormikForm<EditAppFormValues>({
    initialValues: {
      name: app?.name ?? '',
      description: app?.description ?? '',
      category: app?.category ?? '',
    },
    validationSchema: createAppValidationSchema,
    onSubmit: handleSubmit,
  });

  const { loading, onPress } = useAsyncButton(formik);

  if (!app) {
    return (
      <Wrapper headerTitle="Edit Application" showBackButton>
        <View style={styles.notFoundContainer}>
          <Typography style={styles.notFoundText}>Application not found.</Typography>
        </View>
      </Wrapper>
    );
  }

  const handlePickFromCamera = async () => {
    setImageModalVisible(false);
    const result = await pickMedia({ source: 'camera', cropping: true, cropperCircleOverlay: true, width: 200, height: 200 });
    if (result.length > 0) { setLogo(result[0].uri); }
  };

  const handlePickFromGallery = async () => {
    setImageModalVisible(false);
    const result = await pickMedia({ source: 'gallery', cropping: true, cropperCircleOverlay: true, width: 200, height: 200 });
    if (result.length > 0) { setLogo(result[0].uri); }
  };

  const handleRemoveIcon = () => {
    setImageModalVisible(false);
    setLogo(null);
  };

  return (
    <Wrapper headerTitle="Edit Application" showBackButton useScrollView>
      <View style={styles.content}>
        {/* App Icon Picker */}
        <View style={styles.iconSection}>
          <TouchableOpacity style={styles.iconPicker} onPress={() => setImageModalVisible(true)}>
            {logo ? (
              <Image source={{ uri: logo }} style={styles.iconImage} />
            ) : (
              <>
                <Text style={styles.iconPlaceholder}>📷</Text>
                <Typography style={styles.iconHint}>Tap to change</Typography>
              </>
            )}
          </TouchableOpacity>
          <Typography style={styles.iconLabel}>App Icon</Typography>
        </View>

        {/* App Name */}
        <Input
          name="name"
          title="App Name *"
          placeholder="App name"
          value={formik.values.name}
          onChangeText={formik.handleChange('name')}
          onBlur={formik.handleBlur('name')}
          error={formik.errors.name}
          touched={Boolean(formik.touched.name && formik.submitCount)}
          returnKeyType="next"
        />

        {/* Description */}
        <Input
          name="description"
          title="Description *"
          placeholder="Describe your app..."
          value={formik.values.description}
          onChangeText={formik.handleChange('description')}
          onBlur={formik.handleBlur('description')}
          error={formik.errors.description}
          touched={Boolean(formik.touched.description && formik.submitCount)}
          returnKeyType="done"
        />

        {/* Category */}
        <Typography style={styles.sectionLabel}>Category *</Typography>
        {!!(formik.touched.category && formik.errors.category && formik.submitCount) && (
          <Typography style={styles.errorText}>{formik.errors.category}</Typography>
        )}
        <View style={styles.categoryGrid}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat}
              style={[styles.categoryChip, formik.values.category === cat && styles.categoryChipSelected]}
              onPress={() => formik.setFieldValue('category', cat)}>
              <Text style={[styles.categoryChipText, formik.values.category === cat && styles.categoryChipTextSelected]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Subscription Plan */}
        <Typography style={styles.sectionLabel}>Subscription Plan</Typography>
        <View style={styles.planRow}>
          {PLANS.map(p => {
            const planColor = PLAN_COLORS[p];
            const isSelected = plan === p;
            return (
              <TouchableOpacity
                key={p}
                style={[
                  styles.planCard,
                  { borderColor: isSelected ? planColor : COLORS.BORDER },
                  isSelected && { backgroundColor: `${planColor}15` },
                ]}
                onPress={() => setPlan(p)}>
                <View style={[styles.planDot, { backgroundColor: planColor }]} />
                <Text style={[styles.planName, isSelected && styles.planNameSelected]}>
                  {p}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Button title="Save Changes" loading={loading} onPress={onPress} />
      </View>

      <ModalComponent
        modalVisible={imageModalVisible}
        setModalVisible={setImageModalVisible}
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
        {logo && (
          <TouchableOpacity style={styles.modalOption} onPress={handleRemoveIcon}>
            <Icon componentName="Ionicons" iconName="trash-outline" size={22} color={COLORS.ERROR} />
            <Typography style={[styles.modalOptionText, { color: COLORS.ERROR }]}>Remove Icon</Typography>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setImageModalVisible(false)}>
          <Typography style={styles.modalCancelText}>Cancel</Typography>
        </TouchableOpacity>
      </ModalComponent>
    </Wrapper>
  );
};

export default EditAppScreen;
