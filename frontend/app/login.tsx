import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { getLocalizedErrorMessage, login, register } from '../services/auth';
import { useTranslation } from '../i18n';

export default function LoginScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');

    if (isRegister) {
      if (!email.trim() || !username.trim() || !password.trim()) {
        setError(t('login_fill_all_fields'));
        return;
      }
    } else {
      if (!username.trim() || !password.trim()) {
        setError(t('login_fill_all_fields'));
        return;
      }
    }

    setLoading(true);
    try {
      if (isRegister) {
        await register(email.trim(), username.trim(), password);
      } else {
        await login(username.trim(), password);
      }
      router.replace('/home');
    } catch (e: any) {
      setError(getLocalizedErrorMessage(e, t, 'login_generic_error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.card}>
          <View style={styles.iconCircle}>
            <Text style={styles.iconEmoji}>🧮</Text>
          </View>

          <Text style={styles.title}>{isRegister ? t('register_title') : t('login_title')}</Text>
          <Text style={styles.subtitle}>
            {isRegister ? t('register_subtitle') : t('login_subtitle')}
          </Text>

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {isRegister && (
            <>
              <Text style={styles.label}>{t('login_email')}</Text>
              <TextInput
                style={styles.input}
                placeholder={t('login_email_placeholder')}
                placeholderTextColor="#94A3B8"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={email}
                onChangeText={setEmail}
              />
            </>
          )}

          <Text style={styles.label}>{t('login_username')}</Text>
          <TextInput
            style={styles.input}
            placeholder={t('login_username_placeholder')}
            placeholderTextColor="#94A3B8"
            autoCapitalize="none"
            autoCorrect={false}
            value={username}
            onChangeText={setUsername}
          />

          <Text style={styles.label}>{t('login_password')}</Text>
          <TextInput
            style={styles.input}
            placeholder={t('login_password_placeholder')}
            placeholderTextColor="#94A3B8"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.buttonText}>
                {isRegister ? t('register_button') : t('login_button')} →
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.switchButton,
              isRegister ? styles.secondaryButton : styles.switchLinkButton,
            ]}
            onPress={() => {
              setIsRegister(!isRegister);
              setError('');
            }}
          >
            <Text style={[styles.switchText, isRegister && styles.secondaryButtonText]}>
              {isRegister ? t('login_switch_to_login') : t('login_switch_to_register')}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FD',
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 40,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 5,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 16,
  },
  iconEmoji: {
    fontSize: 30,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: '#1E2B4D',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#475569',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E2B4D',
    marginBottom: 6,
    marginLeft: 4,
  },
  input: {
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1E2B4D',
    marginBottom: 16,
  },
  errorBox: {
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#2B76E5',
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: '#2B76E5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
    marginTop: 8,
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  switchButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  switchLinkButton: {
    paddingVertical: 8,
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 30,
    paddingVertical: 16,
    marginTop: 4,
  },
  switchText: {
    color: '#0B47D1',
    fontWeight: '700',
    fontSize: 14,
  },
  secondaryButtonText: {
    color: '#1E2B4D',
    fontSize: 15,
  },
});
