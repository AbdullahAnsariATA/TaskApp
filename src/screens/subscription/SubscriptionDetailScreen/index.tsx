import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Image,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAppSelector } from 'types/reduxTypes';
import { SubscriptionStatus } from 'store/slices/appsSlice';
import { SCREENS } from 'constants/index';
import { RootStackParamList } from 'navigation/Navigators';
import { useTheme } from 'hooks/useTheme';
import { Icon } from 'components/common';
import { createStyles } from './styles';

type NavProp = NativeStackNavigationProp<RootStackParamList>;
type RouteType = RouteProp<RootStackParamList, typeof SCREENS.SUBSCRIPTION_DETAIL>;

const PLAN_DETAILS: Record<SubscriptionStatus, {
  label: string;
  color: string;
  price: string;
  features: string[];
  apiCalls: string;
  storage: string;
  teamMembers: string;
}> = {
  free: {
    label: 'Free',
    color: '#6B7280',
    price: '$0',
    features: [
      '1 application',
      '1,000 API calls / month',
      '100 MB storage',
      'Email support',
      'Basic analytics',
    ],
    apiCalls: '1,000',
    storage: '100 MB',
    teamMembers: '1',
  },
  pro: {
    label: 'Pro',
    color: '#3B82F6',
    price: '$9.99/mo',
    features: [
      '10 applications',
      '100,000 API calls / month',
      '10 GB storage',
      'Priority email support',
      'Advanced analytics',
      'Team collaboration (5 members)',
      'Custom domain',
    ],
    apiCalls: '100,000',
    storage: '10 GB',
    teamMembers: '5',
  },
  enterprise: {
    label: 'Enterprise',
    color: '#D97706',
    price: '$29.99/mo',
    features: [
      'Unlimited applications',
      'Unlimited API calls',
      '100 GB storage',
      '24/7 dedicated support',
      'Advanced analytics & reports',
      'Unlimited team members',
      'Custom integrations',
      'SLA guarantee',
      'White-label options',
    ],
    apiCalls: 'Unlimited',
    storage: '100 GB',
    teamMembers: 'Unlimited',
  },
};

const getMockUsage = (appId: string) => {
  const seed = parseInt(appId, 10) || 1;
  return {
    apiUsage: Math.min((seed * 17) % 100, 95),
    storageUsage: Math.min((seed * 23) % 100, 88),
    teamUsage: Math.min((seed * 13) % 100, 80),
  };
};

const getUsageColor = (pct: number) => {
  if (pct < 60) return '#10B981';
  if (pct < 85) return '#F59E0B';
  return '#EF4444';
};

const SubscriptionDetailScreen = () => {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RouteType>();
  const { colors } = useTheme();
  const { appId } = route.params;

  const app = useAppSelector(state => state.apps.apps.find(a => a.id === appId));

  if (!app) {
    const fallbackStyles = createStyles(colors, '#6B7280');
    return (
      <View style={fallbackStyles.notFoundContainer}>
        <Text style={[fallbackStyles.notFoundText, { color: colors.error }]}>Application not found.</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={fallbackStyles.notFoundBack}>
          <Text style={{ color: colors.secondary }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const plan = PLAN_DETAILS[app.subscriptionStatus];
  const usage = getMockUsage(appId);
  const styles = createStyles(colors, plan.color);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Icon componentName="Ionicons" iconName="chevron-back" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Subscription</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.appHeaderCard}>
          <View style={styles.appLogo}>
            {app.logo ? (
              <Image source={{ uri: app.logo }} style={styles.appLogoImage} />
            ) : (
              <Text style={styles.appLogoText}>{app.name.charAt(0)}</Text>
            )}
          </View>
          <View style={styles.appInfo}>
            <Text style={styles.appName} numberOfLines={1}>{app.name}</Text>
            <Text style={styles.appCategory}>{app.category}</Text>
          </View>
          <View style={styles.planBadge}>
            <Text style={styles.planBadgeText}>{app.subscriptionStatus.toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.planHeader}>
            <Text style={styles.planName}>{plan.label} Plan</Text>
            <Text style={styles.planPrice}>{plan.price}</Text>
          </View>
          {plan.features.map((feature, index) => (
            <View key={index} style={styles.featureRow}>
              <Text style={[styles.featureCheck, { color: plan.color }]}>✓</Text>
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Resource Limits</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{plan.apiCalls}</Text>
              <Text style={styles.statLabel}>API Calls</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{plan.storage}</Text>
              <Text style={styles.statLabel}>Storage</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{plan.teamMembers}</Text>
              <Text style={styles.statLabel}>Team Members</Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Current Usage</Text>
          <View style={styles.usageWrap}>
            <View style={styles.usageRow}>
              <Text style={styles.usageLabel}>API Calls</Text>
              <Text style={styles.usagePercent}>{usage.apiUsage}%</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${usage.apiUsage}%`, backgroundColor: getUsageColor(usage.apiUsage) }]} />
            </View>

            <View style={styles.usageRow}>
              <Text style={styles.usageLabel}>Storage</Text>
              <Text style={styles.usagePercent}>{usage.storageUsage}%</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${usage.storageUsage}%`, backgroundColor: getUsageColor(usage.storageUsage) }]} />
            </View>

            <View style={styles.usageRow}>
              <Text style={styles.usageLabel}>Team Members</Text>
              <Text style={styles.usagePercent}>{usage.teamUsage}%</Text>
            </View>
            <View style={[styles.progressBar, { marginBottom: 0 }]}>
              <View style={[styles.progressFill, { width: `${usage.teamUsage}%`, backgroundColor: getUsageColor(usage.teamUsage) }]} />
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.upgradeBtn}
          onPress={() => navigation.navigate(SCREENS.PLAN_UPGRADE, { appId })}>
          <Text style={styles.upgradeBtnText}>
            {app.subscriptionStatus === 'enterprise' ? 'Manage Plan' : 'Upgrade Plan'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default SubscriptionDetailScreen;
