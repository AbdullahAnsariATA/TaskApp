import { RowComponent, Typography, Wrapper } from 'components/common';

import { SCREENS } from 'constants/routes';
import { COMMON_TEXT } from 'constants/screens';
import { reset } from 'navigation/Navigators';
import { StyleProp, StyleSheet, TextStyle, View, ViewStyle } from 'react-native';
import { ChildrenType, FontSize, FontWeight } from 'types/index';
import { screenWidth, FLEX_CENTER, COLORS } from 'utils/index';

type Props = {
  children: ChildrenType;
  heading1?: string;
  description?: string;

  showBack?: boolean;
  bottomButtonText?: string;
  bottomText?: string;
  onBottomTextPress?: () => void;
  descriptionStyle?: StyleProp<TextStyle>;
  heading1Style?: StyleProp<TextStyle>;
  containerStyle?: StyleProp<ViewStyle>;
};

export const AuthComponent = ({
  children,
  heading1 = '',
  description = '',

  showBack = true,
  descriptionStyle,
  containerStyle,
  heading1Style,
  bottomText = COMMON_TEXT.ALREADY_HAVE_AN_ACCOUNT,
  bottomButtonText = COMMON_TEXT.SIGN_IN,
  onBottomTextPress = () => {
    reset(SCREENS.LOGIN);
  },
}: Props) => {
  return (
    <Wrapper useScrollView showBackButton={showBack}>
      <View style={[styles.container, containerStyle]}>
        {heading1 && <Typography style={[styles.heading1, heading1Style]}>{heading1}</Typography>}
        {!!description && (
          <Typography style={[styles.description, descriptionStyle]}>
            {description}
          </Typography>
        )}
        {children}
      </View>
      <RowComponent style={styles.bottomText}>
        <Typography style={styles.bottomTextStyle}>{bottomText}</Typography>
        <Typography style={styles.bottomButtonTextStyle} onPress={onBottomTextPress}>
          {bottomButtonText}
        </Typography>
      </RowComponent>
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: 20,
    justifyContent: 'center',
  },
  heading1: {
    fontSize: FontSize.ExtraExtraLarge,
    fontWeight: FontWeight.Bold,
    textAlign: 'center',
  },
  bottomText: {
    ...FLEX_CENTER,
    gap: 6,
    paddingVertical: 20,
  },
  description: {
    fontSize: FontSize.Medium,
    marginTop: 6,
    marginBottom: 24,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
  },
  bottomButtonTextStyle: {
    color: COLORS.PRIMARY,
    paddingVertical: 10,
    // textDecorationLine: 'underline',
    // marginBottom: isIOS() ? 0 : 5,
    // fontWeight: FontWeight.Bold,
  },
  bottomTextStyle: {
    color: COLORS.TEXT_SECONDARY,
  },
});
