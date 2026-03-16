import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { showSuccessToast } from 'utils/toast';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAppSelector, useAppDispatch } from 'types/reduxTypes';
import { updateSubscription, SubscriptionStatus } from 'store/slices/appsSlice';
import { SCREENS } from 'constants/index';
import { RootStackParamList } from 'navigation/Navigators';
import { useTheme } from 'hooks/useTheme';
import { Icon } from 'components/common';

type NavProp = NativeStackNavigationProp<RootStackParamList>;
type RouteType = RouteProp<RootStackParamList, typeof SCREENS.PLAN_UPGRADE>;

interface Plan {
  id: SubscriptionStatus;
  name: string;
  price: number;
  period: string;
  color: string;
  recommended: boolean;
  features: string[];
}

const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    period: 'forever',
    color: '#6B7280',
    recommended: false,
    features: ['1 application', '1,000 API calls/mo', '100 MB storage', 'Email support', 'Basic analytics'],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 9.99,
    period: 'month',
    color: '#3B82F6',
    recommended: true,
    features: ['10 apps', '100K API calls/mo', '10 GB storage', 'Priority support', 'Advanced analytics', '5 team members', 'Custom domain'],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 29.99,
    period: 'month',
    color: '#D97706',
    recommended: false,
    features: ['Unlimited apps', 'Unlimited API calls', '100 GB storage', '24/7 support', 'Unlimited team', 'Custom integrations', 'SLA guarantee'],
  },
];

const formatCardNumber = (text: string): string => {
  const digits = text.replace(/\D/g, '').slice(0, 16);
  return digits.replace(/(.{4})/g, '$1 ').trim();
};

const formatExpiry = (text: string): string => {
  const digits = text.replace(/\D/g, '').slice(0, 4);
  if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return digits;
};

const PlanUpgradeScreen = () => {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RouteType>();
  const dispatch = useAppDispatch();
  const { colors } = useTheme();
  const { appId } = route.params;

  const app = useAppSelector(state => state.apps.apps.find(a => a.id === appId));

  const [selectedPlan, setSelectedPlan] = useState<SubscriptionStatus>(app?.subscriptionStatus ?? 'free');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardErrors, setCardErrors] = useState({ cardNumber: '', expiry: '', cvv: '', cardName: '' });
  const [processing, setProcessing] = useState(false);

  if (!app) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: colors.error }}>Application not found.</Text>
      </View>
    );
  }

  const isPaidPlan = selectedPlan !== 'free';
  const currentPlan = PLANS.find(p => p.id === selectedPlan)!;

  const validatePayment = (): boolean => {
    const errors = { cardNumber: '', expiry: '', cvv: '', cardName: '' };
    let isValid = true;

    const rawCard = cardNumber.replace(/\s/g, '');
    if (!rawCard) { errors.cardNumber = 'Card number is required'; isValid = false; }
    else if (rawCard.length < 16) { errors.cardNumber = 'Enter a valid 16-digit card number'; isValid = false; }

    if (!expiry) { errors.expiry = 'Expiry date is required'; isValid = false; }
    else if (expiry.length < 5) { errors.expiry = 'Enter valid expiry (MM/YY)'; isValid = false; }

    if (!cvv) { errors.cvv = 'CVV is required'; isValid = false; }
    else if (cvv.length < 3) { errors.cvv = 'Enter valid CVV'; isValid = false; }

    if (!cardName.trim()) { errors.cardName = 'Name on card is required'; isValid = false; }

    setCardErrors(errors);
    return isValid;
  };

  const handleConfirm = async () => {
    if (isPaidPlan && !validatePayment()) return;

    setProcessing(true);
    await new Promise<void>(resolve => setTimeout(resolve, 2000));
    setProcessing(false);

    dispatch(updateSubscription({ id: appId, status: selectedPlan }));

    showSuccessToast(
      isPaidPlan
        ? `Your ${currentPlan.name} subscription is now active for ${app.name}.`
        : `${app.name} has been downgraded to the Free plan.`,
      isPaidPlan ? 'Payment Successful!' : 'Plan Updated!',
    );
    navigation.navigate(SCREENS.DASHBOARD);
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    topBar: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingTop: 52,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
    },
    backBtn: {
      width: 40,
      height: 40,
      borderRadius: 10,
      backgroundColor: colors.inputBackground,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    topTitle: { fontSize: 18, fontWeight: '700', color: colors.text, flex: 1 },
    scroll: { paddingHorizontal: 16, paddingBottom: 40, paddingTop: 16 },
    sectionLabel: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 14 },
    planCard: {
      borderRadius: 16,
      borderWidth: 2,
      padding: 18,
      marginBottom: 12,
      position: 'relative',
    },
    recommendedBadge: {
      position: 'absolute',
      top: -1,
      right: 16,
      borderBottomLeftRadius: 8,
      borderBottomRightRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 4,
    },
    recommendedText: { color: '#fff', fontSize: 11, fontWeight: '700' },
    planCardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    planCardLeft: { flexDirection: 'row', alignItems: 'center' },
    radioOuter: {
      width: 22,
      height: 22,
      borderRadius: 11,
      borderWidth: 2,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    radioInner: { width: 11, height: 11, borderRadius: 6 },
    planCardName: { fontSize: 18, fontWeight: '800' },
    planCardPrice: { alignItems: 'flex-end' },
    planCardAmount: { fontSize: 22, fontWeight: '800', color: colors.text },
    planCardPeriod: { fontSize: 12, color: colors.textSecondary },
    planFeatureGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
    featurePill: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4, backgroundColor: colors.inputBackground },
    featurePillText: { fontSize: 12, color: colors.textSecondary },
    divider: { height: 1, backgroundColor: colors.divider, marginVertical: 20 },
    paymentSection: {},
    stripeNote: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#F0FDF4',
      borderRadius: 10,
      padding: 12,
      marginBottom: 18,
      borderWidth: 1,
      borderColor: '#BBF7D0',
    },
    stripeNoteIcon: { fontSize: 16, marginRight: 8 },
    stripeNoteText: { fontSize: 13, color: '#166534', flex: 1 },
    label: { fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 6 },
    inputRow: {
      borderWidth: 1,
      borderColor: colors.inputBorder,
      borderRadius: 12,
      paddingHorizontal: 14,
      backgroundColor: colors.inputBackground,
      marginBottom: 4,
    },
    inputError: { borderColor: colors.error },
    input: { height: 52, fontSize: 15, color: colors.inputText },
    errorText: { fontSize: 12, color: colors.error, marginBottom: 10 },
    fieldWrap: { marginBottom: 4 },
    twoCol: { flexDirection: 'row', gap: 12 },
    halfField: { flex: 1 },
    summaryCard: {
      backgroundColor: colors.inputBackground,
      borderRadius: 14,
      padding: 16,
      marginTop: 20,
      marginBottom: 16,
    },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    summaryLabel: { fontSize: 14, color: colors.textSecondary },
    summaryValue: { fontSize: 14, fontWeight: '600', color: colors.text },
    summaryTotal: { borderTopWidth: 1, borderTopColor: colors.divider, paddingTop: 10, marginTop: 4 },
    totalLabel: { fontSize: 16, fontWeight: '700', color: colors.text },
    totalValue: { fontSize: 16, fontWeight: '800', color: colors.primary },
    confirmBtn: {
      borderRadius: 14,
      height: 54,
      alignItems: 'center',
      justifyContent: 'center',
    },
    confirmBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
    currentBadge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 8,
      backgroundColor: '#F3F4F6',
    },
    currentBadgeText: { fontSize: 11, fontWeight: '600', color: '#6B7280' },
  });

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Icon componentName="Ionicons" iconName="chevron-back" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Change Plan</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.sectionLabel}>Choose a Plan</Text>

        {PLANS.map(planItem => {
          const isSelected = selectedPlan === planItem.id;
          const isCurrent = app.subscriptionStatus === planItem.id;

          return (
            <TouchableOpacity
              key={planItem.id}
              style={[
                styles.planCard,
                {
                  borderColor: isSelected ? planItem.color : colors.cardBorder,
                  backgroundColor: isSelected ? `${planItem.color}08` : colors.card,
                },
              ]}
              onPress={() => setSelectedPlan(planItem.id)}>
              {planItem.recommended && (
                <View style={[styles.recommendedBadge, { backgroundColor: planItem.color }]}>
                  <Text style={styles.recommendedText}>MOST POPULAR</Text>
                </View>
              )}

              <View style={styles.planCardHeader}>
                <View style={styles.planCardLeft}>
                  <View style={[styles.radioOuter, { borderColor: isSelected ? planItem.color : colors.border }]}>
                    {isSelected && (
                      <View style={[styles.radioInner, { backgroundColor: planItem.color }]} />
                    )}
                  </View>
                  <Text style={[styles.planCardName, { color: planItem.color }]}>{planItem.name}</Text>
                </View>
                <View style={styles.planCardPrice}>
                  <Text style={styles.planCardAmount}>
                    {planItem.price === 0 ? 'Free' : `$${planItem.price}`}
                  </Text>
                  {planItem.price > 0 && <Text style={styles.planCardPeriod}>per {planItem.period}</Text>}
                </View>
              </View>

              <View style={styles.planFeatureGrid}>
                {planItem.features.map((feature, idx) => (
                  <View key={idx} style={styles.featurePill}>
                    <Text style={styles.featurePillText}>{feature}</Text>
                  </View>
                ))}
              </View>

              {isCurrent && (
                <View style={[styles.currentBadge, { marginTop: 10, alignSelf: 'flex-start' }]}>
                  <Text style={styles.currentBadgeText}>CURRENT PLAN</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}

        {/* Payment Form — only shown for paid plans */}
        {isPaidPlan && (
          <>
            <View style={styles.divider} />
            <Text style={styles.sectionLabel}>Payment Details</Text>

            <View style={styles.stripeNote}>
              <Text style={styles.stripeNoteIcon}>🔒</Text>
              <Text style={styles.stripeNoteText}>
                Your payment information is encrypted and never stored.
              </Text>
            </View>

            <View style={styles.fieldWrap}>
              <Text style={styles.label}>Card Number</Text>
              <View style={[styles.inputRow, cardErrors.cardNumber ? styles.inputError : null]}>
                <TextInput
                  style={styles.input}
                  placeholder="1234 5678 9012 3456"
                  placeholderTextColor={colors.placeholder}
                  value={cardNumber}
                  onChangeText={val => { setCardNumber(formatCardNumber(val)); if (cardErrors.cardNumber) setCardErrors(prev => ({ ...prev, cardNumber: '' })); }}
                  keyboardType="number-pad"
                  maxLength={19}
                />
              </View>
              {!!cardErrors.cardNumber && <Text style={styles.errorText}>{cardErrors.cardNumber}</Text>}
            </View>

            <View style={styles.fieldWrap}>
              <Text style={styles.label}>Name on Card</Text>
              <View style={[styles.inputRow, cardErrors.cardName ? styles.inputError : null]}>
                <TextInput
                  style={styles.input}
                  placeholder="John Doe"
                  placeholderTextColor={colors.placeholder}
                  value={cardName}
                  onChangeText={val => { setCardName(val); if (cardErrors.cardName) setCardErrors(prev => ({ ...prev, cardName: '' })); }}
                  autoCapitalize="words"
                />
              </View>
              {!!cardErrors.cardName && <Text style={styles.errorText}>{cardErrors.cardName}</Text>}
            </View>

            <View style={styles.twoCol}>
              <View style={[styles.halfField, styles.fieldWrap]}>
                <Text style={styles.label}>Expiry Date</Text>
                <View style={[styles.inputRow, cardErrors.expiry ? styles.inputError : null]}>
                  <TextInput
                    style={styles.input}
                    placeholder="MM/YY"
                    placeholderTextColor={colors.placeholder}
                    value={expiry}
                    onChangeText={val => { setExpiry(formatExpiry(val)); if (cardErrors.expiry) setCardErrors(prev => ({ ...prev, expiry: '' })); }}
                    keyboardType="number-pad"
                    maxLength={5}
                  />
                </View>
                {!!cardErrors.expiry && <Text style={styles.errorText}>{cardErrors.expiry}</Text>}
              </View>

              <View style={[styles.halfField, styles.fieldWrap]}>
                <Text style={styles.label}>CVV</Text>
                <View style={[styles.inputRow, cardErrors.cvv ? styles.inputError : null]}>
                  <TextInput
                    style={styles.input}
                    placeholder="123"
                    placeholderTextColor={colors.placeholder}
                    value={cvv}
                    onChangeText={val => { setCvv(val.replace(/\D/g, '').slice(0, 4)); if (cardErrors.cvv) setCardErrors(prev => ({ ...prev, cvv: '' })); }}
                    keyboardType="number-pad"
                    maxLength={4}
                    secureTextEntry
                  />
                </View>
                {!!cardErrors.cvv && <Text style={styles.errorText}>{cardErrors.cvv}</Text>}
              </View>
            </View>
          </>
        )}

        {/* Order Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Application</Text>
            <Text style={styles.summaryValue} numberOfLines={1}>{app.name}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Plan</Text>
            <Text style={[styles.summaryValue, { color: currentPlan.color }]}>{currentPlan.name}</Text>
          </View>
          {isPaidPlan && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Billing Period</Text>
              <Text style={styles.summaryValue}>Monthly</Text>
            </View>
          )}
          <View style={[styles.summaryRow, styles.summaryTotal]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>
              {currentPlan.price === 0 ? 'Free' : `$${currentPlan.price.toFixed(2)}/mo`}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.confirmBtn, { backgroundColor: currentPlan.color }]}
          onPress={handleConfirm}
          disabled={processing}>
          {processing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.confirmBtnText}>
              {isPaidPlan ? `Pay $${currentPlan.price.toFixed(2)}/mo` : 'Confirm Free Plan'}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default PlanUpgradeScreen;
