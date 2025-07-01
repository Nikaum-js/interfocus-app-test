import React from 'react';
import { StyleSheet, Alert, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Text } from '@/components/Text';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/hooks/useAuth';

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Tem certeza que deseja sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Sair', 
          style: 'destructive',
          onPress: async () => {
            await logout();
            Alert.alert('Sucesso', 'Logout realizado com sucesso!');
          }
        }
      ]
    );
  };

  const SettingItem = ({ 
    icon, 
    title, 
    value, 
    onPress,
    isDestructive = false
  }: { 
    icon: string, 
    title: string, 
    value?: string,
    onPress?: () => void,
    isDestructive?: boolean
  }) => (
    <TouchableOpacity 
      style={styles.settingItem}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={
          isDestructive
            ? ['#F4433620', '#F4433610']
            : colorScheme === 'dark'
              ? ['rgba(255,255,255,0.12)', 'rgba(255,255,255,0.06)']
              : ['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.7)']
        }
        style={styles.settingGradient}
      >
        <View style={styles.settingLeft}>
          <View style={[
            styles.iconContainer,
            { backgroundColor: isDestructive ? '#F4433620' : colors.tint + '20' }
          ]}>
            <Ionicons 
              name={icon as any} 
              size={20} 
              color={isDestructive ? '#F44336' : colors.tint} 
            />
          </View>
          <View style={styles.settingContent}>
            <Text style={[
              styles.settingTitle,
              { color: isDestructive ? '#F44336' : colors.text }
            ]}>
              {title}
            </Text>
            {value && (
              <Text style={[styles.settingValue, { color: colors.text + '80' }]}>
                {value}
              </Text>
            )}
          </View>
        </View>
        {onPress && (
          <Ionicons 
            name="chevron-forward" 
            size={16} 
            color={colors.text + '60'} 
          />
        )}
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={
          colorScheme === 'dark' 
            ? ['rgba(255,255,255,0.12)', 'rgba(255,255,255,0.06)']
            : ['rgba(255,255,255,0.95)', 'rgba(255,255,255,0.85)']
        }
        style={styles.headerGradient}
      >
        <View style={[styles.header, { borderBottomColor: colors.text + '15' }]}>
          <View style={styles.headerContent}>
            <View style={styles.titleContainer}>
              <View style={[styles.titleIconContainer, { backgroundColor: colors.tint + '20' }]}>
                <Ionicons name="settings" size={24} color={colors.tint} />
              </View>
              <Text type="title" style={[styles.headerTitle, { color: colors.text }]}>
                Configurações
              </Text>
            </View>
            {user && (
              <Text style={[styles.userSubtitle, { color: colors.text + '70' }]}>
                Gerencie sua conta e preferências
              </Text>
            )}
          </View>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {user && (
          <View style={styles.profileCard}>
            <LinearGradient
              colors={[colors.tint + '15', colors.tint + '08']}
              style={styles.profileGradient}
            >
              <View style={styles.profileHeader}>
                <View style={[styles.profileAvatar, { backgroundColor: colors.tint + '30' }]}>
                  <Ionicons name="person" size={28} color={colors.tint} />
                </View>
                <View style={styles.profileInfo}>
                  <Text style={[styles.profileName, { color: colors.text }]}>
                    {user.name}
                  </Text>
                  <Text style={[styles.profileEmail, { color: colors.text + '80' }]}>
                    {user.email}
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </View>
        )}

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text + '90' }]}>
            Informações da Conta
          </Text>
          
          <View style={styles.sectionContent}>
            {user && (
              <>
                <SettingItem
                  icon="mail-outline"
                  title="Email"
                  value={user.email}
                />
                <SettingItem
                  icon="person-circle-outline"
                  title="Nome"
                  value={user.name}
                />
              </>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text + '90' }]}>
            Ações
          </Text>
          
          <View style={styles.sectionContent}>
            <SettingItem
              icon="log-out-outline"
              title="Fazer Logout"
              onPress={handleLogout}
              isDestructive={true}
            />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerGradient: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 16,
    paddingTop: 60,
    borderBottomWidth: 1,
  },
  headerContent: {
    flex: 1,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 4,
  },
  titleIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  userSubtitle: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 20,
  },
  profileCard: {
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
  },
  profileGradient: {
    paddingVertical: 20,
    paddingHorizontal: 18,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    marginLeft: 16,
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  profileEmail: {
    fontSize: 14,
    marginTop: 4,
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 12,
    marginLeft: 4,
  },
  sectionContent: {
    gap: 8,
  },
  settingItem: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 8,
  },
  settingGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  settingValue: {
    fontSize: 14,
    marginTop: 2,
    fontWeight: '500',
  },
  footer: {
    marginTop: 30,
    marginBottom: 40,
    borderRadius: 12,
    overflow: 'hidden',
  },
  footerGradient: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  footerIcon: {
    marginRight: 12,
    marginTop: 1,
  },
  footerText: {
    fontSize: 12,
    lineHeight: 18,
    flex: 1,
    fontWeight: '500',
  },
});
