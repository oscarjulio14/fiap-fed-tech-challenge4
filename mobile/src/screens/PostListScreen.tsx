import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, TextInput, View } from 'react-native';

import { PostCard } from '../components/PostCard';
import { EmptyState, ErrorState, Loading } from '../components/ui';
import { useDebounce } from '../hooks/useDebounce';
import { useResource } from '../hooks/useResource';
import { TabScreenProps } from '../navigation/types';
import { postService } from '../services/postService';
import { colors, font, radius, spacing } from '../theme';
import { Post } from '../types';

/** Página principal: lista de posts com busca por palavra-chave. */
export default function PostListScreen({ navigation }: TabScreenProps<'Posts'>) {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 400);

  const fetcher = useCallback(() => postService.list(debouncedQuery), [debouncedQuery]);
  const { data, error, loading, refreshing, reload } = useResource<Post[]>(fetcher);

  const header = (
    <View style={styles.searchBox}>
      <Ionicons name="search" size={18} color={colors.textMuted} />
      <TextInput
        testID="post-search"
        accessibilityLabel="Buscar posts"
        value={query}
        onChangeText={setQuery}
        placeholder="Buscar por título, conteúdo ou autor"
        placeholderTextColor={colors.textMuted}
        style={styles.searchInput}
        returnKeyType="search"
        autoCapitalize="none"
      />
      {query.length > 0 && (
        <Ionicons name="close-circle" size={20} color={colors.textMuted} onPress={() => setQuery('')} />
      )}
    </View>
  );

  if (loading) return <Loading message="Carregando posts…" />;
  if (error && !data) return <ErrorState message={error} onRetry={reload} />;

  return (
    <FlatList
      data={data ?? []}
      keyExtractor={(item) => String(item.id)}
      contentContainerStyle={styles.list}
      keyboardShouldPersistTaps="handled"
      ListHeaderComponent={
        <>
          {header}
          <Text style={styles.count}>
            {debouncedQuery ? `Resultados para “${debouncedQuery}”: ` : 'Todos os posts: '}
            {data?.length ?? 0}
          </Text>
        </>
      }
      renderItem={({ item }) => (
        <PostCard post={item} onPress={() => navigation.navigate('PostDetail', { id: item.id })} />
      )}
      ListEmptyComponent={
        <EmptyState
          icon="search-outline"
          title="Nenhum post encontrado"
          message={debouncedQuery ? 'Tente outras palavras-chave.' : 'Ainda não há posts publicados.'}
        />
      }
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={reload} colors={[colors.primary]} />}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing.lg, flexGrow: 1 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: font.body, color: colors.text },
  count: { color: colors.textMuted, fontSize: font.small, marginBottom: spacing.md },
});
