import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useState } from 'react';
import { KeyboardAvoidingView, Platform, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Banner, Button, Card, ErrorState, Input, Loading } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { useResource } from '../hooks/useResource';
import { RootScreenProps } from '../navigation/types';
import { getErrorMessage } from '../services/api';
import { postService } from '../services/postService';
import { colors, font, spacing } from '../theme';
import { formatDate } from '../utils/helpers';

/** Leitura do post completo + comentários (opcional no enunciado). */
export default function PostDetailScreen({ route, navigation }: RootScreenProps<'PostDetail'>) {
  const { id } = route.params;
  const { isAuthenticated, isTeacher, user } = useAuth();

  const fetchPost = useCallback(() => postService.get(id), [id]);
  const fetchComments = useCallback(() => postService.comments(id), [id]);
  const postRes = useResource(fetchPost);
  const commentsRes = useResource(fetchComments);

  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);

  async function sendComment() {
    if (!text.trim()) {
      setCommentError('Escreva um comentário antes de enviar.');
      return;
    }
    setSending(true);
    setCommentError(null);
    try {
      await postService.addComment(id, text);
      setText('');
      await commentsRes.reload();
    } catch (e) {
      setCommentError(getErrorMessage(e));
    } finally {
      setSending(false);
    }
  }

  if (postRes.loading) return <Loading message="Carregando post…" />;
  if (postRes.error || !postRes.data) {
    return <ErrorState message={postRes.error ?? 'Post não encontrado.'} onRetry={postRes.reload} />;
  }

  const post = postRes.data;
  const comments = commentsRes.data ?? [];

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={postRes.refreshing}
            onRefresh={() => {
              postRes.reload();
              commentsRes.reload();
            }}
            colors={[colors.primary]}
          />
        }
      >
        <Text style={styles.title} testID="post-title">
          {post.title}
        </Text>
        <View style={styles.meta}>
          <Ionicons name="person-circle-outline" size={18} color={colors.primary} />
          <Text style={styles.author}>{post.author}</Text>
          <Text style={styles.date}>• {formatDate(post.createdAt)}</Text>
        </View>

        <Text style={styles.content}>{post.content}</Text>

        {isTeacher && (
          <Button
            title="Editar post"
            icon="create-outline"
            variant="secondary"
            onPress={() => navigation.navigate('PostForm', { id: post.id })}
            style={{ marginTop: spacing.lg }}
          />
        )}

        <View style={styles.divider} />
        <Text style={styles.section}>Comentários ({comments.length})</Text>

        {comments.length === 0 && (
          <Text style={styles.muted}>Nenhum comentário ainda. Seja o primeiro a comentar!</Text>
        )}
        {comments.map((c) => (
          <Card key={c.id} style={{ padding: spacing.md }}>
            <Text style={styles.commentAuthor}>
              {c.author} <Text style={styles.date}>• {formatDate(c.createdAt)}</Text>
            </Text>
            <Text style={styles.commentText}>{c.text}</Text>
          </Card>
        ))}

        {isAuthenticated ? (
          <View style={{ marginTop: spacing.md }}>
            {!!commentError && <Banner message={commentError} />}
            <Input
              label={`Comentar como ${user?.name}`}
              value={text}
              onChangeText={setText}
              placeholder="Escreva seu comentário…"
              multiline
              style={{ minHeight: 80 }}
              testID="comment-input"
            />
            <Button title="Enviar comentário" icon="send" onPress={sendComment} loading={sending} />
          </View>
        ) : (
          <Text style={[styles.muted, { marginTop: spacing.md }]}>
            Faça login para comentar neste post.
          </Text>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.lg, paddingBottom: spacing.xxl },
  title: { fontSize: 26, fontWeight: '800', color: colors.text, lineHeight: 32 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: spacing.sm, marginBottom: spacing.lg },
  author: { fontWeight: '700', color: colors.primaryDark, fontSize: font.body },
  date: { color: colors.textMuted, fontSize: font.small, fontWeight: '400' },
  content: { fontSize: 16, lineHeight: 26, color: colors.text },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.xl },
  section: { fontSize: font.subtitle, fontWeight: '700', color: colors.text, marginBottom: spacing.md },
  muted: { color: colors.textMuted, fontSize: font.small },
  commentAuthor: { fontWeight: '700', color: colors.text, fontSize: font.small },
  commentText: { color: colors.text, marginTop: 4, fontSize: font.body },
});
