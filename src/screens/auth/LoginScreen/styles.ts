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
});
