import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, font, spacing } from '../theme';
import { Post } from '../types';
import { formatDate, summarize } from '../utils/helpers';
import { Button, Card } from './ui';

interface Props {
  post: Post;
  onPress: () => void;
  /** Quando informados, exibe os botões de edição/exclusão (visão administrativa). */
  onEdit?: () => void;
  onDelete?: () => void;
}

export function PostCard({ post, onPress, onEdit, onDelete }: Props) {
  return (
    <Card onPress={onPress} testID={`post-card-${post.id}`}>
      <Text style={styles.title} numberOfLines={2}>
        {post.title}
      </Text>
      <View style={styles.meta}>
        <Ionicons name="person-circle-outline" size={16} color={colors.primary} />
        <Text style={styles.author}>{post.author}</Text>
        <Text style={styles.dot}>•</Text>
        <Text style={styles.date}>{formatDate(post.createdAt)}</Text>
      </View>
      <Text style={styles.description} numberOfLines={3}>
        {summarize(post.content)}
      </Text>

      {(onEdit || onDelete) && (
        <View style={styles.actions}>
          {onEdit && <Button title="Editar" icon="create-outline" variant="secondary" small onPress={onEdit} />}
          {onDelete && <Button title="Excluir" icon="trash-outline" variant="danger" small onPress={onDelete} />}
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: font.subtitle, fontWeight: '700', color: colors.text },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: spacing.sm },
  author: { fontSize: font.small, fontWeight: '600', color: colors.primaryDark },
  dot: { color: colors.textMuted },
  date: { fontSize: font.small, color: colors.textMuted },
  description: { fontSize: font.body, color: colors.textMuted, marginTop: spacing.sm, lineHeight: 21 },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
});
