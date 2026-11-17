import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from 'react-native';

import { colors, font, radius, shadow, spacing } from '../theme';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

// ------------------------------------------------------------------- Button
interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  icon?: IconName;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  small?: boolean;
  testID?: string;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  icon,
  loading,
  disabled,
  style,
  small,
  testID,
}: ButtonProps) {
  const palette = {
    primary: { bg: colors.primary, fg: colors.white, border: colors.primary },
    secondary: { bg: colors.primarySoft, fg: colors.primaryDark, border: colors.primarySoft },
    danger: { bg: colors.dangerSoft, fg: colors.danger, border: colors.dangerSoft },
    ghost: { bg: 'transparent', fg: colors.textMuted, border: colors.border },
  }[variant];
  const inactive = disabled || loading;

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onPress}
      disabled={inactive}
      style={({ pressed }) => [
        styles.button,
        small && styles.buttonSmall,
        { backgroundColor: palette.bg, borderColor: palette.border },
        inactive && { opacity: 0.55 },
        pressed && { opacity: 0.8 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={palette.fg} />
      ) : (
        <>
          {icon && <Ionicons name={icon} size={small ? 16 : 18} color={palette.fg} />}
          <Text style={[styles.buttonText, small && { fontSize: font.small }, { color: palette.fg }]}>
            {title}
          </Text>
        </>
      )}
    </Pressable>
  );
}

// -------------------------------------------------------------------- Input
interface InputProps extends TextInputProps {
  label: string;
  error?: string;
}

export function Input({ label, error, style, ...rest }: InputProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={colors.textMuted}
        style={[
          styles.input,
          rest.multiline && { minHeight: 140, textAlignVertical: 'top' },
          !!error && { borderColor: colors.danger },
          style,
        ]}
        {...rest}
      />
      {!!error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

// --------------------------------------------------------------------- Card
export function Card({
  children,
  onPress,
  style,
  testID,
}: {
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}) {
  if (!onPress) {
    return (
      <View testID={testID} style={[styles.card, style]}>
        {children}
      </View>
    );
  }
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }, style]}
    >
      {children}
    </Pressable>
  );
}

// ------------------------------------------------------------- Loading/Empty
export function Loading({ message = 'Carregando…' }: { message?: string }) {
  return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.muted}>{message}</Text>
    </View>
  );
}

export function EmptyState({
  icon = 'file-tray-outline',
  title,
  message,
  actionLabel,
  onAction,
}: {
  icon?: IconName;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.center}>
      <Ionicons name={icon} size={52} color={colors.border} />
      <Text style={styles.emptyTitle}>{title}</Text>
      {!!message && <Text style={[styles.muted, { textAlign: 'center' }]}>{message}</Text>}
      {!!actionLabel && !!onAction && (
        <Button title={actionLabel} onPress={onAction} variant="secondary" style={{ marginTop: spacing.md }} />
      )}
    </View>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <EmptyState
      icon="cloud-offline-outline"
      title="Algo deu errado"
      message={message}
      actionLabel={onRetry ? 'Tentar novamente' : undefined}
      onAction={onRetry}
    />
  );
}

export function Banner({ message, type = 'error' }: { message: string; type?: 'error' | 'success' }) {
  const isError = type === 'error';
  return (
    <View
      accessibilityRole="alert"
      style={[styles.banner, { backgroundColor: isError ? colors.dangerSoft : colors.successSoft }]}
    >
      <Ionicons
        name={isError ? 'alert-circle' : 'checkmark-circle'}
        size={18}
        color={isError ? colors.danger : colors.success}
      />
      <Text style={{ color: isError ? colors.danger : colors.success, flex: 1, fontSize: font.small }}>
        {message}
      </Text>
    </View>
  );
}

export function Badge({ label, tone = 'primary' }: { label: string; tone?: 'primary' | 'success' | 'warning' }) {
  const palette = {
    primary: { bg: colors.primarySoft, fg: colors.primaryDark },
    success: { bg: colors.successSoft, fg: colors.success },
    warning: { bg: colors.warningSoft, fg: colors.warning },
  }[tone];
  return (
    <View style={[styles.badge, { backgroundColor: palette.bg }]}>
      <Text style={{ color: palette.fg, fontSize: 12, fontWeight: '600' }}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: 13,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    minHeight: 46,
  },
  buttonSmall: { paddingVertical: 8, paddingHorizontal: spacing.md, minHeight: 36, borderRadius: radius.sm },
  buttonText: { fontSize: font.body, fontWeight: '700' },
  field: { marginBottom: spacing.lg },
  label: { fontSize: font.small, fontWeight: '600', color: colors.text, marginBottom: 6 },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    fontSize: font.body,
    color: colors.text,
  },
  error: { color: colors.danger, fontSize: 12, marginTop: 4 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadow,
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xxl, gap: spacing.sm },
  muted: { color: colors.textMuted, fontSize: font.small },
  emptyTitle: { fontSize: font.subtitle, fontWeight: '700', color: colors.text, marginTop: spacing.sm },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.lg,
  },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 3, borderRadius: radius.pill },
});
