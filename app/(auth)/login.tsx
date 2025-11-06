import React, { useState } from 'react';
import { View, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { Link } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { colors, spacing } from '../../constants/theme';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    try {
      setLoading(true);
      await login(email.trim().toLowerCase(), password);
    } catch (error: any) {
      Alert.alert('Login Failed', error.message ?? 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.content}>
        {/* Minimal logo */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <View style={styles.logo}>
              <Text style={styles.logoText}>W</Text>
            </View>
          </View>
          <Text variant="displaySmall" style={styles.title}>
            WealthTrack
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            Sign in to your account
          </Text>
        </View>

        {/* Form */}
        <View style={styles.formContainer}>
          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            style={styles.input}
            outlineColor={colors.border}
            activeOutlineColor={colors.black}
            textColor={colors.textPrimary}
            theme={{
              colors: {
                onSurfaceVariant: colors.textSecondary,
              }
            }}
          />

          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            mode="outlined"
            secureTextEntry={!showPw}
            autoComplete="password"
            style={styles.input}
            outlineColor={colors.border}
            activeOutlineColor={colors.black}
            textColor={colors.textPrimary}
            theme={{
              colors: {
                onSurfaceVariant: colors.textSecondary,
              }
            }}
            right={
              <TextInput.Icon
                icon={showPw ? 'eye-off-outline' : 'eye-outline'}
                onPress={() => setShowPw((v) => !v)}
                color={colors.textSecondary}
              />
            }
          />

          <Button
            mode="text"
            onPress={() => Alert.alert('Forgot Password', 'Coming soon')}
            textColor={colors.textSecondary}
            style={styles.forgotButton}
          >
            Forgot password?
          </Button>

          {/* Black button */}
          <Button
            mode="contained"
            onPress={handleLogin}
            loading={loading}
            disabled={loading}
            buttonColor={colors.black}
            textColor={colors.white}
            style={styles.button}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <Link href="/(auth)/register" style={styles.link}>
            <Text style={styles.linkText}>Sign Up</Text>
          </Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  // Header
  header: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  logoContainer: {
    marginBottom: spacing.lg,
  },
  logo: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: colors.black,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  logoText: {
    fontSize: 40,
    fontWeight: '800',
    color: colors.white,
    letterSpacing: -1,
  },
  title: {
    color: colors.textPrimary,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
    letterSpacing: -1,
  },
  subtitle: {
    color: colors.textSecondary,
  },
  // Form
  formContainer: {
    width: '100%',
  },
  input: {
    marginBottom: spacing.md,
    backgroundColor: colors.white,
  },
  forgotButton: {
    alignSelf: 'flex-end',
    marginBottom: spacing.sm,
  },
  // Button
  button: {
    marginTop: spacing.sm,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonContent: {
    height: 56,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  // Footer
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
  footerText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  link: {
    textDecorationLine: 'none',
  },
  linkText: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '600',
  },
});
