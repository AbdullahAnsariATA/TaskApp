import { StyleSheet } from 'react-native';
import { FontSize } from 'types/fontTypes';
import { COLORS } from 'utils/index';

export const styles = StyleSheet.create({
  forgotText: {
    color: COLORS.PRIMARY,
    alignSelf: 'flex-end',
    marginBottom: 16,
    marginTop: 4,
    fontSize: FontSize.Small,
  },
  biometricContainer: {
    alignItems: 'center',
    marginTop: 24,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.BORDER,
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: FontSize.Small,
    color: COLORS.TEXT_SECONDARY,
  },
  biometricButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1.5,
    borderColor: COLORS.PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  biometricLabel: {
    marginTop: 10,
    fontSize: FontSize.Small,
    color: COLORS.TEXT_SECONDARY,
  },
});
