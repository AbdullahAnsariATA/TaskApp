import { firebaseAuth } from 'api/firebaseAuth';
import { SCREENS, COMMON_TEXT, AUTH_TEXT, VARIABLES } from 'constants/index';
import { showSuccessToast, showErrorToast } from 'utils/toast';
import { firebaseRegisterValidationSchema, COLORS, screenWidth } from 'utils/index';
import { FocusProvider, useFormikForm, useAsyncButton } from 'hooks/index';
import { FontSize } from 'types/fontTypes';
import { Button, Input, AuthComponent, ProfilePictureUpload } from 'components/index';
import { navigate } from 'navigation/index';
import { SelectedMedia } from 'hooks/useMediaPicker';
import { styles } from './styles';

interface RegisterFormValues {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  profileImage: SelectedMedia | null;
  showPassword: boolean;
  showConfirmPassword: boolean;
}

const RegisterScreen = () => {
  const initialValues: RegisterFormValues = {
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    profileImage: null,
    showPassword: false,
    showConfirmPassword: false,
  };

  const handleSubmit = async (values: RegisterFormValues) => {
    try {
      const { localPhotoPath } = await firebaseAuth.register(
        values.email.trim(),
        values.password,
        values.fullName.trim(),
        values.profileImage?.uri,
      );
      if (localPhotoPath) {
        // Local path is persisted on disk; it will be resolved on next login
      }
      showSuccessToast('Your account has been created successfully. Please sign in.', 'Account Created!');
      navigate(SCREENS.LOGIN);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Registration failed';
      showErrorToast(message, 'Registration Failed');
    }
  };

  const formik = useFormikForm<RegisterFormValues>({
    initialValues,
    validationSchema: firebaseRegisterValidationSchema,
    onSubmit: handleSubmit,
  });

  const { loading, onPress } = useAsyncButton(formik);

  const handleProfileImageSelected = (image: SelectedMedia) => {
    formik.setFieldValue('profileImage', image ?? null);
    formik.setFieldTouched('profileImage', true);
  };

  return (
    <AuthComponent
      heading1={AUTH_TEXT.SIGN_UP_HEADING}
      description={AUTH_TEXT.SIGN_UP_DESCRIPTION}
      showBack={true}
      bottomText={COMMON_TEXT.ALREADY_HAVE_AN_ACCOUNT}
      bottomButtonText={COMMON_TEXT.SIGN_IN}
      onBottomTextPress={() => navigate(SCREENS.LOGIN)}
    >
      <ProfilePictureUpload
        source={formik.values.profileImage?.uri || null}
        onImageSelected={handleProfileImageSelected}
        showEditIcon={true}
        disabled={false}
        size={screenWidth(30)}
        containerStyle={styles.profileHeader}
      />

      <FocusProvider>
        <Input
          name={COMMON_TEXT.FULL_NAME}
          title={COMMON_TEXT.FULL_NAME}
          onChangeText={formik.handleChange('fullName')}
          onBlur={formik.handleBlur('fullName')}
          value={formik.values.fullName}
          placeholder={COMMON_TEXT.ENTER_FULL_NAME}
          autoCapitalize="words"
          error={formik.errors.fullName}
          touched={Boolean(formik.touched.fullName && formik.submitCount)}
        />
        <Input
          name={COMMON_TEXT.EMAIL}
          title={COMMON_TEXT.EMAIL_ADDRESS}
          onChangeText={formik.handleChange('email')}
          onBlur={formik.handleBlur('email')}
          value={formik.values.email}
          allowSpacing={false}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholder={COMMON_TEXT.ENTER_YOUR_EMAIL}
          error={formik.errors.email}
          touched={Boolean(formik.touched.email && formik.submitCount)}
        />
        <Input
          name={COMMON_TEXT.PASSWORD}
          title={COMMON_TEXT.PASSWORD}
          onChangeText={formik.handleChange('password')}
          onBlur={formik.handleBlur('password')}
          value={formik.values.password}
          allowSpacing={false}
          placeholder={COMMON_TEXT.ENTER_YOUR_PASSWORD}
          secureTextEntry={!formik.values.showPassword}
          endIcon={{
            componentName: VARIABLES.Ionicons,
            iconName: formik.values.showPassword ? 'eye' : 'eye-off',
            color: COLORS.ICONS,
            size: FontSize.MediumLarge,
            onPress: () =>
              formik.setFieldValue('showPassword', !formik.values.showPassword),
          }}
          error={formik.errors.password}
          touched={Boolean(formik.touched.password && formik.submitCount)}
        />
        <Input
          name={COMMON_TEXT.CONFIRM_PASSWORD}
          title={COMMON_TEXT.CONFIRM_PASSWORD}
          onChangeText={formik.handleChange('confirmPassword')}
          onBlur={formik.handleBlur('confirmPassword')}
          value={formik.values.confirmPassword}
          allowSpacing={false}
          returnKeyType="done"
          placeholder={COMMON_TEXT.ENTER_CONFIRM_PASSWORD}
          secureTextEntry={!formik.values.showConfirmPassword}
          endIcon={{
            componentName: VARIABLES.Ionicons,
            iconName: formik.values.showConfirmPassword ? 'eye' : 'eye-off',
            color: COLORS.ICONS,
            size: FontSize.MediumLarge,
            onPress: () =>
              formik.setFieldValue('showConfirmPassword', !formik.values.showConfirmPassword),
          }}
          error={formik.errors.confirmPassword}
          touched={Boolean(formik.touched.confirmPassword && formik.submitCount)}
        />
      </FocusProvider>

      <Button title={COMMON_TEXT.REGISTER} loading={loading} onPress={onPress} />
    </AuthComponent>
  );
};

export default RegisterScreen;
