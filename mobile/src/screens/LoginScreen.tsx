import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Banner, Button, Input } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../services/api';
import { colors, font, radius, spacing } from '../theme';
import { isValidEmail } from '../utils/helpers';

export default function LoginScreen() {
  const { login, enterAsGuest } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleLogin() {
    const next: typeof errors = {};
    if (!isValidEmail(email)) next.email = 'Informe um e-mail válido.';
    if (!password) next.password = 'Informe a senha.';
    setErrors(next);
    setApiError(null);
    if (Object.keys(next).length) return;

    setSubmitting(true);
    try {
      await login(email, password);
    } catch (e) {
      setApiError(getErrorMessage(e));
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.logo}>
            <Ionicons name="school" size={44} color={colors.white} />
          </View>
          <Text style={styles.title}>Blog FIAP</Text>
          <Text style={styles.subtitle}>Entre para acessar o conteúdo e a área administrativa</Text>

          <View style={styles.form}>
            {!!apiError && <Banner message={apiError} />}
            <Input
              label="E-mail"
              value={email}
              onChangeText={setEmail}
              placeholder="seu@email.com"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              error={errors.email}
              testID="login-email"
            />
            <Input
              label="Senha"
              value={password}
              onChangeText={setPassword}
              placeholder="••••••"
              secureTextEntry
              error={errors.password}
              onSubmitEditing={handleLogin}
              testID="login-password"
            />
            <Button title="Entrar" onPress={handleLogin} loading={submitting} testID="login-submit" />
            <Button
              title="Continuar como visitante"
              variant="ghost"
              onPress={enterAsGuest}
              style={{ marginTop: spacing.md }}
              testID="login-guest"
            />
          </View>

          <View style={styles.hint}>
            <Text style={styles.hintTitle}>Contas de demonstração</Text>
            <Text style={styles.hintText}>Professor: prof@fiap.com / 123456</Text>
            <Text style={styles.hintText}>Aluno: aluno@fiap.com / 123456</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { flexGrow: 1, padding: spacing.xl, justifyContent: 'center' },
  logo: {
    alignSelf: 'center',
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 28, fontWeight: '800', color: colors.text, textAlign: 'center', marginTop: spacing.lg },
  subtitle: { fontSize: font.body, color: colors.textMuted, textAlign: 'center', marginBottom: spacing.xl },
  form: { width: '100%', maxWidth: 420, alignSelf: 'center' },
  hint: {
    marginTop: spacing.xl,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    alignSelf: 'center',
    width: '100%',
    maxWidth: 420,
  },
  hintTitle: { fontWeight: '700', color: colors.primaryDark, marginBottom: 4 },
  hintText: { color: colors.primaryDark, fontSize: font.small },
});
