import React from 'react';
import { StyleSheet, Alert, View } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { Text } from '@/components/Text';
import { LoginButton } from '@/components/LoginButton';
import { useAuth } from '@/hooks/useAuth';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { router } from 'expo-router';

export default function LoginScreen() {
  const { 
    loading, 
    error, 
    login, 
    clearError 
  } = useAuth();
  
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];

  const handleLogin = async () => {
    try {
      clearError();
      const success = await login();
      
      if (success) {
        router.replace('/(tabs)');
      } else {
        Alert.alert(
          'Erro',
          'Falha na autenticação. Tente novamente.',
          [{ text: 'OK' }]
        );
      }
    } catch {
      Alert.alert(
        'Erro',
        'Ocorreu um erro durante o login. Tente novamente.',
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <View style={styles.container}>
      {/* Logo e Título */}
      <View style={styles.header}>
        <FontAwesome5 
          name="shield-alt" 
          size={80} 
          color={colors.tint} 
        />
        <Text type="title" style={styles.appTitle}>
          Interfocus
        </Text>
        <Text style={styles.subtitle}>
          Entre para continuar
        </Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.welcomeContainer}>
          <Text type="subtitle" style={styles.welcomeTitle}>
            Bem-vindo de volta!
          </Text>
          <Text style={styles.description}>
            Faça login com sua conta para acessar seus dados.
          </Text>
        </View>

        {/* Login Button */}
        <View style={styles.buttonContainer}>
          <LoginButton
            title="Entrar com OAuth"
            onPress={handleLogin}
            loading={loading}
          />
          
          {error && (
            <View style={styles.errorContainer}>
              {/* <Ionicons name="alert-circle" size={16} color="#F44336" /> */}
              <Text style={styles.errorText}>
                {error}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.securityInfo}>
          {/* <Ionicons name="shield-checkmark" size={16} color="#4CAF50" /> */}
          <Text style={styles.securityText}>
            Conexão segura e criptografada
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#07061D',
  },
  header: {
    flex: 0.4,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 80,
  },
  appTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    opacity: 0.8,
    textAlign: 'center',
  },
  content: {
    flex: 0.5,
    paddingHorizontal: 32,
    justifyContent: 'space-between',
  },
  welcomeContainer: {
    alignItems: 'center',
    gap: 16,
    marginTop: 20,
  },
  welcomeTitle: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    opacity: 0.8,
    maxWidth: 280,
  },
  buttonContainer: {
    alignItems: 'center',
    gap: 20,
    paddingBottom: 40,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    borderColor: '#F44336',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    gap: 8,
    maxWidth: 320,
  },
  errorText: {
    color: '#F44336',
    fontSize: 14,
    flex: 1,
  },
  footer: {
    flex: 0.1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingBottom: 24,
  },
  securityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  securityText: {
    fontSize: 12,
    opacity: 0.7,
    textAlign: 'center',
  },
}); 