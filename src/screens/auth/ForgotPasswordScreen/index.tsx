import { SCREENS, COMMON_TEXT, AUTH_TEXT } from 'constants/index';
import { showSuccessToast, showErrorToast } from 'utils/toast';
import { forgotPasswordValidationSchema } from 'utils/index';
import { FocusProvider, useFormikForm, useAsyncButton } from 'hooks/index';
import { Button, Input, AuthComponent } from 'components/index';
import { navigate, onBack } from 'navigation/index';
import { firebaseAuth } from 'api/firebaseAuth';

interface ForgotPasswordFormValues {
  email: string;
}

const ForgotPasswordScreen = () => {
  const initialValues: ForgotPasswordFormValues = {
    email: '',
  };

  const handleSubmit = async (values: ForgotPasswordFormValues) => {
    try {
      await firebaseAuth.forgotPassword(values.email.trim());
      showSuccessToast('A password reset link has been sent to your email. Please check your inbox.', 'Email Sent!');
      onBack();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to send reset email';
      showErrorToast(message);
    }
  };

  const formik = useFormikForm<ForgotPasswordFormValues>({
    initialValues,
    validationSchema: forgotPasswordValidationSchema,
    onSubmit: handleSubmit,
  });

  const { loading, onPress } = useAsyncButton(formik);

  return (
    <AuthComponent
      heading1={COMMON_TEXT.FORGOT_PASSWORD}
      description={AUTH_TEXT.DONT_WORRY_FORGOT}
      bottomText={COMMON_TEXT.ALREADY_HAVE_AN_ACCOUNT}
      bottomButtonText={COMMON_TEXT.SIGN_IN}
      onBottomTextPress={() => navigate(SCREENS.LOGIN)}
    >
      <FocusProvider>
        <Input
          name={COMMON_TEXT.EMAIL}
          title={COMMON_TEXT.EMAIL_ADDRESS}
          onChangeText={formik.handleChange('email')}
          onBlur={formik.handleBlur('email')}
          value={formik.values.email}
          allowSpacing={false}
          returnKeyType="done"
          keyboardType="email-address"
          autoCapitalize="none"
          placeholder={COMMON_TEXT.ENTER_YOUR_EMAIL}
          error={formik.errors.email}
          touched={Boolean(formik.touched.email && formik.submitCount)}
        />
      </FocusProvider>

      <Button title={COMMON_TEXT.SEND_RESET_LINK} loading={loading} onPress={onPress} />
    </AuthComponent>
  );
};

export default ForgotPasswordScreen;
