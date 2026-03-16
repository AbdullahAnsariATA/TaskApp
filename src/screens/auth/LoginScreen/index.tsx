import { useCallback, useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { useAppDispatch } from 'types/reduxTypes';
import { setIsUserLoggedIn } from 'store/slices/appSettings';
import { setAuthUser } from 'store/slices/authSlice';
import { firebaseAuth } from 'api/firebaseAuth';
import { SCREENS, COMMON_TEXT, AUTH_TEXT, VARIABLES } from 'constants/index';
import { showErrorToast } from 'utils/toast';
import { firebaseLoginValidationSchema, COLORS } from 'utils/index';
import { FocusProvider, useFormikForm, useAsyncButton, useBiometricAuth } from 'hooks/index';
import { FontSize } from 'types/fontTypes';
import { Button, Input, AuthComponent, Typography, Icon } from 'components/index';
import { navigate } from 'navigation/index';
import { styles } from './styles';

interface LoginFormValues {
  email: string;
  password: string;
  showPassword: boolean;
}

const LoginScreen = () => {
  const dispatch = useAppDispatch();
  const [biometricLoading, setBiometricLoading] = useState(false);

  const {
    isBiometricAvailable,
    biometricIconName,
    biometricLabel,
    saveCredentials,
    authenticateWithBiometric,
  } = useBiometricAuth();

  const initialValues: LoginFormValues = {
    email: '',
    password: '',
    showPassword: false,
  };

  const firebaseLogin = useCallback(
    async (email: string, password: string) => {
      const user = await firebaseAuth.login(email, password);
      const localPhoto = await firebaseAuth.getLocalProfileImage(user.uid);
      firebaseAuth.updateFCMToken(user.uid);
      dispatch(
        setAuthUser({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: localPhoto,
        }),
      );
      return user;
    },
    [dispatch],
  );

  const completeLogin = useCallback(() => {
    dispatch(setIsUserLoggedIn(true));
  }, [dispatch]);

  const handleSubmit = async (values: LoginFormValues) => {
    try {
      await firebaseLogin(values.email.trim(), values.password);
      await saveCredentials(values.email.trim(), values.password);
      completeLogin();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Invalid credentials';
      showErrorToast(message, 'Login Failed');
    }
  };

  const handleBiometricLogin = useCallback(async () => {
    setBiometricLoading(true);
    try {
      const creds = await authenticateWithBiometric();
      if (creds) {
        await firebaseLogin(creds.email, creds.password);
        completeLogin();
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Biometric login failed';
      showErrorToast(message, 'Login Failed');
    } finally {
      setBiometricLoading(false);
    }
  }, [authenticateWithBiometric, firebaseLogin, completeLogin]);

  const formik = useFormikForm<LoginFormValues>({
    initialValues,
    validationSchema: firebaseLoginValidationSchema,
    onSubmit: handleSubmit,
  });

  const { loading, onPress } = useAsyncButton(formik);

  return (
    <AuthComponent
      heading1={AUTH_TEXT.LOGIN_HEADING}
      description={AUTH_TEXT.LOGIN_DESCRIPTION}
      showBack={false}
      bottomText={COMMON_TEXT.DONT_HAVE_AN_ACCOUNT}
      bottomButtonText={COMMON_TEXT.SIGN_UP}
      onBottomTextPress={() => navigate(SCREENS.REGISTER)}
    >
      <FocusProvider>
        <Input
          name={COMMON_TEXT.EMAIL}
          title={COMMON_TEXT.EMAIL_ADDRESS}
          onChangeText={formik.handleChange('email')}
          onBlur={formik.handleBlur('email')}
          value={formik.values.email}
          allowSpacing={false}
          keyboardType="email-address"
          autoCapitalize="none"
          textContentType="none"
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
          returnKeyType="done"
          allowSpacing={false}
          textContentType="none"
          placeholder={COMMON_TEXT.ENTER_YOUR_PASSWORD}
          secureTextEntry={!formik.values.showPassword}
          endIcon={{
            componentName: VARIABLES.Ionicons,
            iconName: formik.values.showPassword ? 'eye' : 'eye-off',
            color: COLORS.ICONS,
            size: FontSize.MediumLarge,
            onPress: () => formik.setFieldValue('showPassword', !formik.values.showPassword),
          }}
          error={formik.errors.password}
          touched={Boolean(formik.touched.password && formik.submitCount)}
        />
      </FocusProvider>

      <Typography style={styles.forgotText} onPress={() => navigate(SCREENS.FORGOT_PASSWORD)}>
        {COMMON_TEXT.FORGOT_PASSWORD}
      </Typography>

      <Button title={COMMON_TEXT.LOGIN} loading={loading} onPress={onPress} />

      {isBiometricAvailable && (
        <View style={styles.biometricContainer}>
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Typography style={styles.dividerText}>or</Typography>
            <View style={styles.dividerLine} />
          </View>
          <TouchableOpacity
            style={styles.biometricButton}
            onPress={handleBiometricLogin}
            disabled={biometricLoading}
            activeOpacity={0.7}
          >
            <Icon
              componentName="MaterialCommunityIcons"
              iconName={biometricIconName}
              size={32}
              color={COLORS.PRIMARY}
            />
          </TouchableOpacity>
          <Typography style={styles.biometricLabel}>
            {`Login with ${biometricLabel}`}
          </Typography>
        </View>
      )}
    </AuthComponent>
  );
};

export default LoginScreen;
