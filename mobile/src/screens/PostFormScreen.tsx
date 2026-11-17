import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';

import { Banner, Button, ErrorState, Input, Loading } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { RootScreenProps } from '../navigation/types';
import { getErrorMessage } from '../services/api';
import { postService } from '../services/postService';
import { spacing } from '../theme';
import { notify } from '../utils/helpers';
import { hasErrors, validatePost } from '../utils/validation';

/** Criação (sem id) e edição (com id) de posts - exclusivo para professores. */
export default function PostFormScreen({ route, navigation }: RootScreenProps<'PostForm'>) {
  const postId = route.params?.id;
  const isEditing = postId !== undefined;
  const { user, isTeacher } = useAuth();

  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState(user?.name ?? '');
  const [content, setContent] = useState('');
  const [errors, setErrors] = useState<ReturnType<typeof validatePost>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(isEditing);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    navigation.setOptions({ title: isEditing ? 'Editar post' : 'Novo post' });
  }, [navigation, isEditing]);

  // Edição: carrega os dados atuais do post
  useEffect(() => {
    if (!isEditing) return;
    let active = true;
    (async () => {
      try {
        const post = await postService.get(postId!);
        if (!active) return;
        setTitle(post.title);
        setAuthor(post.author);
        setContent(post.content);
      } catch (e) {
        if (active) setLoadError(getErrorMessage(e));
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [isEditing, postId]);

  async function handleSave() {
    const found = validatePost({ title, content, author });
    setErrors(found);
    setApiError(null);
    if (hasErrors(found)) return;

    setSaving(true);
    try {
      const input = { title: title.trim(), content: content.trim(), author: author.trim() };
      if (isEditing) await postService.update(postId!, input);
      else await postService.create(input);
      notify(isEditing ? 'Post atualizado' : 'Post publicado', 'Operação realizada com sucesso.');
      navigation.goBack();
    } catch (e) {
      setApiError(getErrorMessage(e));
    } finally {
      setSaving(false);
    }
  }

  if (!isTeacher) return <ErrorState message="Apenas professores podem criar ou editar posts." />;
  if (loading) return <Loading message="Carregando dados do post…" />;
  if (loadError) return <ErrorState message={loadError} onRetry={() => navigation.goBack()} />;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {!!apiError && <Banner message={apiError} />}
        <Input label="Título" value={title} onChangeText={setTitle} placeholder="Título do post" error={errors.title} testID="post-title-input" />
        <Input label="Autor" value={author} onChangeText={setAuthor} placeholder="Nome do autor" error={errors.author} testID="post-author-input" />
        <Input
          label="Conteúdo"
          value={content}
          onChangeText={setContent}
          placeholder="Escreva o conteúdo completo do post…"
          multiline
          style={{ minHeight: 200 }}
          error={errors.content}
          testID="post-content-input"
        />
        <Button
          title={isEditing ? 'Salvar alterações' : 'Publicar post'}
          icon="checkmark-circle-outline"
          onPress={handleSave}
          loading={saving}
          testID="post-save"
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.lg, paddingBottom: spacing.xxl },
});
