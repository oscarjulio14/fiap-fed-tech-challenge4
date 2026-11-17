import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';

import { Pager } from '../components/Pager';
import { Badge, Banner, Button, Card, EmptyState, ErrorState, Loading } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { useResource } from '../hooks/useResource';
import { TabScreenProps } from '../navigation/types';
import { PAGE_SIZE } from '../config/env';
import { getErrorMessage } from '../services/api';
import { personService } from '../services/personService';
import { colors, font, spacing } from '../theme';
import { Paginated, Person, PersonKind } from '../types';
import { confirmAction } from '../utils/helpers';

/**
 * Listagem paginada de professores OU alunos (o tipo é definido pela aba).
 * Cada item tem botão de editar (vai para o formulário) e de excluir.
 */
export default function PeopleListScreen({
  route,
  navigation,
}: TabScreenProps<'Teachers'> | TabScreenProps<'Students'>) {
  const kind: PersonKind = route.name === 'Teachers' ? 'teachers' : 'students';
  const labels =
    kind === 'teachers'
      ? { singular: 'professor', plural: 'professores', extra: 'Disciplina' }
      : { singular: 'aluno', plural: 'alunos', extra: 'Turma' };

  const { isTeacher, user } = useAuth();
  const [page, setPage] = useState(1);
  const [actionError, setActionError] = useState<string | null>(null);

  const fetcher = useCallback(() => personService.list(kind, page, PAGE_SIZE), [kind, page]);
  const { data, error, loading, refreshing, reload } = useResource<Paginated<Person>>(fetcher);

  async function handleDelete(person: Person) {
    const ok = await confirmAction(
      `Excluir ${labels.singular}`,
      `Deseja realmente excluir ${person.name}? Esta ação não pode ser desfeita.`,
    );
    if (!ok) return;
    try {
      setActionError(null);
      await personService.remove(kind, person.id);
      // Se removeu o último item da página, volta uma página
      if (data && data.data.length === 1 && page > 1) setPage(page - 1);
      else await reload();
    } catch (e) {
      setActionError(getErrorMessage(e));
    }
  }

  if (!isTeacher) return <ErrorState message="Área restrita a professores." />;
  if (loading) return <Loading message={`Carregando ${labels.plural}…`} />;
  if (error && !data) return <ErrorState message={error} onRetry={reload} />;

  const extraOf = (p: Person) => (kind === 'teachers' ? p.subject : p.classGroup);

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={data?.data ?? []}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        ListHeaderComponent={actionError ? <Banner message={actionError} /> : undefined}
        renderItem={({ item }) => {
          const isSelf = kind === 'teachers' && item.id === user?.id;
          return (
            <Card testID={`person-${kind}-${item.id}`}>
              <View style={styles.row}>
                <View style={styles.avatar}>
                  <Ionicons name={kind === 'teachers' ? 'school' : 'person'} size={22} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.email}>{item.email}</Text>
                </View>
                {isSelf && <Badge label="Você" tone="success" />}
              </View>
              <View style={styles.extra}>
                <Badge label={`${labels.extra}: ${extraOf(item) ?? '-'}`} tone="warning" />
              </View>
              <View style={styles.actions}>
                <Button
                  title="Editar"
                  icon="create-outline"
                  variant="secondary"
                  small
                  onPress={() => navigation.navigate('PersonForm', { kind, id: item.id })}
                />
                <Button
                  title="Excluir"
                  icon="trash-outline"
                  variant="danger"
                  small
                  disabled={isSelf}
                  onPress={() => handleDelete(item)}
                />
              </View>
            </Card>
          );
        }}
        ListEmptyComponent={
          <EmptyState
            icon="people-outline"
            title={`Nenhum ${labels.singular} cadastrado`}
            actionLabel={`Cadastrar ${labels.singular}`}
            onAction={() => navigation.navigate('PersonForm', { kind })}
          />
        }
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={reload} colors={[colors.primary]} />}
      />
      {data && data.total > 0 && (
        <Pager page={data.page} totalPages={data.totalPages} total={data.total} onChange={setPage} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing.lg, flexGrow: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: { fontSize: font.body + 1, fontWeight: '700', color: colors.text },
  email: { fontSize: font.small, color: colors.textMuted, marginTop: 2 },
  extra: { marginTop: spacing.md },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
});
