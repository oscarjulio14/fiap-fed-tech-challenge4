import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Badge, Button, Card } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config/env';
import { colors, font, spacing } from '../theme';

export default function AccountScreen() {
  const { user, isTeacher, logout } = useAuth();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Ionicons name={user ? 'person' : 'eye'} size={40} color={colors.white} />
        </View>
        <Text style={styles.name}>{user?.name ?? 'Visitante'}</Text>
        {!!user && <Text style={styles.email}>{user.email}</Text>}
        <Badge
          label={isTeacher ? 'Professor' : user ? 'Aluno' : 'Somente leitura'}
          tone={isTeacher ? 'success' : 'warning'}
        />
      </View>

      <Card>
        <Text style={styles.cardTitle}>Permissões</Text>
        <Text style={styles.cardText}>
          {isTeacher
            ? 'Você pode criar, editar e excluir posts, além de administrar professores e alunos.'
            : 'Você pode ler os posts e comentar (quando autenticado). Criação e edição são exclusivas de professores.'}
        </Text>
      </Card>

      <Card>
        <Text style={styles.cardTitle}>Servidor</Text>
        <Text style={styles.cardText}>{API_URL}</Text>
      </Card>

      <Button
        title={user ? 'Sair da conta' : 'Fazer login'}
        icon={user ? 'log-out-outline' : 'log-in-outline'}
        variant={user ? 'danger' : 'primary'}
        onPress={logout}
        testID="account-logout"
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.lg },
  header: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xl },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: { fontSize: font.title, fontWeight: '800', color: colors.text },
  email: { color: colors.textMuted, fontSize: font.body },
  cardTitle: { fontWeight: '700', fontSize: font.body, color: colors.text, marginBottom: 4 },
  cardText: { color: colors.textMuted, fontSize: font.small, lineHeight: 19 },
});
