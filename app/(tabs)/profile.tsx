import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Text, IconButton, Switch } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { colors } from '../../constants/theme';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [biometrics, setBiometrics] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to sign out');
            }
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Coming Soon', 'Account deletion will be available in a future update');
          },
        },
      ]
    );
  };

  const getInitials = () => {
    if (user?.first_name && user?.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
    } else if (user?.first_name) {
      return user.first_name.substring(0, 2).toUpperCase();
    } else if (user?.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return 'U';
  };

  const getDisplayName = () => {
    if (user?.first_name || user?.last_name) {
      return `${user?.first_name || ''} ${user?.last_name || ''}`.trim();
    }
    return 'User';
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>ACCOUNT</Text>
        <Text style={styles.title}>Settings</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials()}</Text>
          </View>

          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{getDisplayName()}</Text>
            <Text style={styles.profileEmail}>{user?.email}</Text>
            <Text style={styles.memberSince}>
              Member since {new Date(user?.created_at || '').toLocaleDateString('en-US', {
                month: 'short',
                year: 'numeric'
              })}
            </Text>
          </View>

          <TouchableOpacity style={styles.editButton}>
            <IconButton
              icon="pencil-outline"
              iconColor={colors.white}
              size={18}
              style={styles.editIcon}
            />
          </TouchableOpacity>
        </View>

        {/* Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PREFERENCES</Text>

          <View style={styles.settingsCard}>
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <IconButton
                  icon="bell-outline"
                  iconColor={colors.black}
                  size={24}
                  style={styles.settingIcon}
                />
                <View style={styles.settingText}>
                  <Text style={styles.settingLabel}>Push Notifications</Text>
                  <Text style={styles.settingDescription}>
                    Receive alerts about portfolio changes
                  </Text>
                </View>
              </View>
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                color={colors.black}
              />
            </View>

            <View style={styles.settingDivider} />

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <IconButton
                  icon="fingerprint"
                  iconColor={colors.black}
                  size={24}
                  style={styles.settingIcon}
                />
                <View style={styles.settingText}>
                  <Text style={styles.settingLabel}>Biometric Login</Text>
                  <Text style={styles.settingDescription}>
                    Use Face ID or Touch ID
                  </Text>
                </View>
              </View>
              <Switch
                value={biometrics}
                onValueChange={setBiometrics}
                color={colors.black}
              />
            </View>
          </View>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ACCOUNT</Text>

          <View style={styles.menuCard}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => Alert.alert('Coming Soon', 'Change password will be available soon')}
            >
              <View style={styles.menuInfo}>
                <IconButton
                  icon="lock-outline"
                  iconColor={colors.black}
                  size={24}
                  style={styles.menuIcon}
                />
                <Text style={styles.menuLabel}>Change Password</Text>
              </View>
              <IconButton
                icon="chevron-right"
                iconColor={colors.textSecondary}
                size={20}
                style={styles.chevronIcon}
              />
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => Alert.alert('Coming Soon', 'Export data will be available soon')}
            >
              <View style={styles.menuInfo}>
                <IconButton
                  icon="download-outline"
                  iconColor={colors.black}
                  size={24}
                  style={styles.menuIcon}
                />
                <Text style={styles.menuLabel}>Export Data</Text>
              </View>
              <IconButton
                icon="chevron-right"
                iconColor={colors.textSecondary}
                size={20}
                style={styles.chevronIcon}
              />
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleDeleteAccount}
            >
              <View style={styles.menuInfo}>
                <IconButton
                  icon="delete-outline"
                  iconColor={colors.loss}
                  size={24}
                  style={styles.menuIcon}
                />
                <Text style={[styles.menuLabel, { color: colors.loss }]}>
                  Delete Account
                </Text>
              </View>
              <IconButton
                icon="chevron-right"
                iconColor={colors.textSecondary}
                size={20}
                style={styles.chevronIcon}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ABOUT</Text>

          <View style={styles.menuCard}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => Alert.alert('WealthTrack', 'Version 1.0.0\n\nA premium wealth tracking app')}
            >
              <View style={styles.menuInfo}>
                <IconButton
                  icon="information-outline"
                  iconColor={colors.black}
                  size={24}
                  style={styles.menuIcon}
                />
                <Text style={styles.menuLabel}>App Version</Text>
              </View>
              <Text style={styles.versionText}>1.0.0</Text>
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => Alert.alert('Coming Soon', 'Privacy policy will be available soon')}
            >
              <View style={styles.menuInfo}>
                <IconButton
                  icon="shield-check-outline"
                  iconColor={colors.black}
                  size={24}
                  style={styles.menuIcon}
                />
                <Text style={styles.menuLabel}>Privacy Policy</Text>
              </View>
              <IconButton
                icon="chevron-right"
                iconColor={colors.textSecondary}
                size={20}
                style={styles.chevronIcon}
              />
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => Alert.alert('Coming Soon', 'Terms of service will be available soon')}
            >
              <View style={styles.menuInfo}>
                <IconButton
                  icon="file-document-outline"
                  iconColor={colors.black}
                  size={24}
                  style={styles.menuIcon}
                />
                <Text style={styles.menuLabel}>Terms of Service</Text>
              </View>
              <IconButton
                icon="chevron-right"
                iconColor={colors.textSecondary}
                size={20}
                style={styles.chevronIcon}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Sign Out Button */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.signOutButton}
            onPress={handleLogout}
          >
            <IconButton
              icon="logout"
              iconColor={colors.white}
              size={20}
              style={styles.signOutIcon}
            />
            <Text style={styles.signOutText}>SIGN OUT</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 24,
    backgroundColor: colors.white,
  },
  greeting: {
    fontSize: 11,
    letterSpacing: 1,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.black,
    letterSpacing: -1.5,
  },
  profileCard: {
    marginHorizontal: 24,
    marginBottom: 32,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.gray200,
    borderRadius: 20,
    backgroundColor: colors.white,
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.black,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: '800',
    color: colors.white,
    letterSpacing: -1,
  },
  profileInfo: {
    alignItems: 'center',
  },
  profileName: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.black,
    letterSpacing: -1,
    marginBottom: 6,
  },
  profileEmail: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  memberSince: {
    fontSize: 11,
    color: colors.textTertiary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  editButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: colors.black,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  editIcon: {
    margin: 0,
  },
  section: {
    marginHorizontal: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 11,
    letterSpacing: 1,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  settingsCard: {
    padding: 20,
    borderWidth: 1,
    borderColor: colors.gray200,
    borderRadius: 16,
    backgroundColor: colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    margin: 0,
    marginRight: 12,
  },
  settingText: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.black,
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  settingDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  settingDivider: {
    height: 1,
    backgroundColor: colors.gray200,
    marginVertical: 16,
  },
  menuCard: {
    borderWidth: 1,
    borderColor: colors.gray200,
    borderRadius: 16,
    backgroundColor: colors.white,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  menuInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    margin: 0,
    marginRight: 12,
  },
  menuLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.black,
    letterSpacing: -0.3,
  },
  chevronIcon: {
    margin: 0,
  },
  versionText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  menuDivider: {
    height: 1,
    backgroundColor: colors.gray200,
    marginLeft: 64,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.black,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  signOutIcon: {
    margin: 0,
  },
  signOutText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.white,
    letterSpacing: 0.5,
  },
  bottomSpacer: {
    height: 40,
  },
});
