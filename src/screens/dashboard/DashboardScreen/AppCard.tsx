import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { AppItem, SubscriptionStatus } from 'store/slices/appsSlice';
import { COLORS } from 'utils/index';
import { ThemeColors } from 'types/themeTypes';

const CATEGORY_COLORS: Record<string, string> = {
  Analytics: '#3B82F6',
  Productivity: '#10B981',
  Storage: '#8B5CF6',
  Business: '#F59E0B',
  Marketing: '#EF4444',
  Development: '#06B6D4',
  Other: '#6B7280',
};

const SUBSCRIPTION_COLORS: Record<SubscriptionStatus, { bg: string; text: string; label: string }> = {
  free: { bg: '#F3F4F6', text: '#6B7280', label: 'FREE' },
  pro: { bg: '#EFF6FF', text: '#3B82F6', label: 'PRO' },
  enterprise: { bg: '#FFFBEB', text: '#D97706', label: 'ENTERPRISE' },
};

export const formatRelativeDate = (isoString: string): string => {
  const date = new Date(isoString);
  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

interface AppCardProps {
  app: AppItem;
  onEdit: () => void;
  onDelete: () => void;
  onSubscription: () => void;
  colors: ThemeColors;
}

export const AppCard = ({ app, onEdit, onDelete, onSubscription, colors }: AppCardProps) => {
  const categoryColor = CATEGORY_COLORS[app.category] ?? '#6B7280';
  const subInfo = SUBSCRIPTION_COLORS[app.subscriptionStatus];

  const cardStyles = StyleSheet.create({
    card: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.cardBorder,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 3,
    },
    row: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    logoWrap: {
      width: 52,
      height: 52,
      borderRadius: 14,
      backgroundColor: categoryColor,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 14,
    },
    logoImage: { width: 52, height: 52, borderRadius: 14, marginRight: 14 },
    logoLetter: { color: '#fff', fontSize: 22, fontWeight: '700' },
    info: { flex: 1 },
    appName: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 2 },
    category: { fontSize: 13, color: colors.textSecondary },
    subBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
      backgroundColor: subInfo.bg,
    },
    subText: { fontSize: 11, fontWeight: '700', color: subInfo.text },
    description: { fontSize: 13, color: colors.textSecondary, lineHeight: 19, marginBottom: 12 },
    footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    timestamp: { fontSize: 12, color: colors.textDisabled },
    actions: { flexDirection: 'row', gap: 8 },
    actionBtn: {
      paddingHorizontal: 14,
      paddingVertical: 7,
      borderRadius: 8,
      borderWidth: 1,
    },
    editBtn: { borderColor: COLORS.PRIMARY, backgroundColor: 'transparent' },
    editBtnText: { fontSize: 13, fontWeight: '600', color: COLORS.PRIMARY },
    subBtn: { borderColor: COLORS.PRIMARY, backgroundColor: COLORS.PRIMARY },
    subBtnText: { fontSize: 13, fontWeight: '600', color: '#fff' },
    deleteBtn: { borderColor: COLORS.ERROR, backgroundColor: 'transparent' },
    deleteBtnText: { fontSize: 13, fontWeight: '600', color: COLORS.ERROR },
  });

  return (
    <View style={cardStyles.card}>
      <View style={cardStyles.row}>
        {app.logo ? (
          <Image source={{ uri: app.logo }} style={cardStyles.logoImage} />
        ) : (
          <View style={cardStyles.logoWrap}>
            <Text style={cardStyles.logoLetter}>{app.name.charAt(0).toUpperCase()}</Text>
          </View>
        )}
        <View style={cardStyles.info}>
          <Text style={cardStyles.appName} numberOfLines={1}>{app.name}</Text>
          <Text style={cardStyles.category}>{app.category}</Text>
        </View>
        <View style={cardStyles.subBadge}>
          <Text style={cardStyles.subText}>{subInfo.label}</Text>
        </View>
      </View>

      <Text style={cardStyles.description} numberOfLines={2}>{app.description}</Text>

      <View style={cardStyles.footer}>
        <Text style={cardStyles.timestamp}>Updated {formatRelativeDate(app.lastUpdated)}</Text>
        <View style={cardStyles.actions}>
          <TouchableOpacity style={[cardStyles.actionBtn, cardStyles.subBtn]} onPress={onSubscription}>
            <Text style={cardStyles.subBtnText}>Plan</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[cardStyles.actionBtn, cardStyles.editBtn]} onPress={onEdit}>
            <Text style={cardStyles.editBtnText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[cardStyles.actionBtn, cardStyles.deleteBtn]} onPress={onDelete}>
            <Text style={cardStyles.deleteBtnText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};
