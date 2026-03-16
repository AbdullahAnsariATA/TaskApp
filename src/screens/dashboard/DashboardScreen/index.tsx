import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppSelector, useAppDispatch } from 'types/reduxTypes';
import { deleteApp, AppItem } from 'store/slices/appsSlice';
import { resetAppState } from 'store/slices/appSettings';
import { clearAuth } from 'store/slices/authSlice';
import { firebaseAuth } from 'api/firebaseAuth';
import { SCREENS } from 'constants/index';
import { COLORS } from 'utils/index';
import { RootStackParamList } from 'navigation/Navigators';
import { useTheme } from 'hooks/useTheme';
import { AppCard } from './AppCard';
import { DeleteModal } from './DeleteModal';
import { LogoutModal } from './LogoutModal';
import { createStyles } from './styles';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

const DashboardScreen = () => {
  const navigation = useNavigation<NavProp>();
  const dispatch = useAppDispatch();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const apps = useAppSelector(state => state.apps.apps);
  const user = useAppSelector(state => state.auth.user);

  const [refreshing, setRefreshing] = useState(false);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ visible: boolean; app: AppItem | null }>({
    visible: false,
    app: null,
  });

  const styles = createStyles(colors, insets);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await new Promise<void>(resolve => setTimeout(resolve, 1200));
    setRefreshing(false);
  }, []);

  const confirmDelete = (app: AppItem) => {
    setDeleteModal({ visible: true, app });
  };

  const handleDelete = () => {
    if (deleteModal.app) {
      dispatch(deleteApp(deleteModal.app.id));
    }
    setDeleteModal({ visible: false, app: null });
  };

  const handleLogout = async () => {
    setLogoutModalVisible(false);
    await firebaseAuth.logout();
    dispatch(clearAuth());
    dispatch(resetAppState());
  };

  const proCount = apps.filter(a => a.subscriptionStatus === 'pro').length;
  const enterpriseCount = apps.filter(a => a.subscriptionStatus === 'enterprise').length;
  const userName = user?.displayName || 'User';
  const userInitial = userName.charAt(0).toUpperCase();

  const renderEmpty = () => (
    <View style={styles.emptyWrap}>
      <Text style={styles.emptyIcon}>📱</Text>
      <Text style={styles.emptyTitle}>No Applications Yet</Text>
      <Text style={styles.emptySubtitle}>
        Tap the + button to add your first application
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.PRIMARY} />

      <View style={styles.headerGradient}>
        <View style={styles.headerRow}>
          <View style={styles.avatarWrap}>
            <View style={styles.avatar}>
              {user?.photoURL ? (
                <Image source={{ uri: user.photoURL }} style={styles.avatarImage} />
              ) : (
                <Text style={styles.avatarText}>{userInitial}</Text>
              )}
            </View>
            <View>
              <Text style={styles.headerGreeting}>Good day,</Text>
              <Text style={styles.headerName}>{userName}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.logoutBtn} onPress={() => setLogoutModalVisible(true)}>
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{apps.length}</Text>
            <Text style={styles.statLabel}>Total Apps</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{proCount}</Text>
            <Text style={styles.statLabel}>Pro Plans</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{enterpriseCount}</Text>
            <Text style={styles.statLabel}>Enterprise</Text>
          </View>
        </View>
      </View>

      <FlatList
        data={apps}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.PRIMARY} />
        }
        ListHeaderComponent={
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Applications</Text>
            <Text style={styles.sectionCount}>{apps.length} app{apps.length !== 1 ? 's' : ''}</Text>
          </View>
        }
        ListEmptyComponent={renderEmpty}
        renderItem={({ item }) => (
          <AppCard
            app={item}
            colors={colors}
            onEdit={() => navigation.navigate(SCREENS.EDIT_APP, { appId: item.id })}
            onDelete={() => confirmDelete(item)}
            onSubscription={() => navigation.navigate(SCREENS.SUBSCRIPTION_DETAIL, { appId: item.id })}
          />
        )}
      />

      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate(SCREENS.CREATE_APP)}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <DeleteModal
        visible={deleteModal.visible}
        app={deleteModal.app}
        colors={colors}
        bottomInset={insets.bottom}
        onCancel={() => setDeleteModal({ visible: false, app: null })}
        onConfirm={handleDelete}
      />

      <LogoutModal
        visible={logoutModalVisible}
        colors={colors}
        bottomInset={insets.bottom}
        onCancel={() => setLogoutModalVisible(false)}
        onConfirm={handleLogout}
      />
    </View>
  );
};

export default DashboardScreen;
