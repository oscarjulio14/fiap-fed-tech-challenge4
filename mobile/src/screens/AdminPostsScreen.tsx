import React, { useCallback, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text } from 'react-native';

import { PostCard } from '../components/PostCard';
import { Banner, EmptyState, ErrorState, Loading } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { useResource } from '../hooks/useResource';
import { TabScreenProps } from '../navigation/types';
import { getErrorMessage } from '../services/api';
import { postService } from '../services/postService';
import { colors, font, spacing } from '../theme';
import { Post } from '../types';
import { confirmAction } from '../utils/helpers';

/** Página administrativa: todos os posts com ações de editar e excluir. */
export default function AdminPostsScreen({ navigation }: TabScreenProps<'Admin'>) {
  const { isTeacher } = useAuth();
  const fetcher = useCallback(() => postService.list(), []);
  const { data, error, loading, refreshing, reload } = useResource<Post[]>(fetcher);
  const [actionError, setActionError] = useState<string | null>(null);

  async function handleDelete(post: Post) {
    const ok = await confirmAction('Excluir post', `Deseja realmente excluir “${post.title}”?`);
    if (!ok) return;
    try {
      setActionError(null);
      await postService.remove(post.id);
      await reload();
    } catch (e) {
      setActionError(getErrorMessage(e));
    }
  }

  if (!isTeacher) return <ErrorState message="Área restrita a professores." />;
  if (loading) return <Loading message="Carregando posts…" />;
  if (error && !data) return <ErrorState message={error} onRetry={reload} />;

  return (
    <FlatList
      data={data ?? []}
      keyExtractor={(item) => String(item.id)}
      contentContainerStyle={styles.list}
      ListHeaderComponent={
        <>
          {!!actionError && <Banner message={actionError} />}
          <Text style={styles.count}>{data?.length ?? 0} post(s) cadastrado(s)</Text>
        </>
      }
      renderItem={({ item }) => (
        <PostCard
          post={item}
          onPress={() => navigation.navigate('PostDetail', { id: item.id })}
          onEdit={() => navigation.navigate('PostForm', { id: item.id })}
          onDelete={() => handleDelete(item)}
        />
      )}
      ListEmptyComponent={
        <EmptyState
          title="Nenhum post cadastrado"
          message="Crie o primeiro post usando o botão + no topo."
          actionLabel="Criar post"
          onAction={() => navigation.navigate('PostForm')}
        />
      }
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={reload} colors={[colors.primary]} />}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing.lg, flexGrow: 1 },
  count: { color: colors.textMuted, fontSize: font.small, marginBottom: spacing.md },
});
