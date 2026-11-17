import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';

import { Banner, Button, ErrorState, Input, Loading } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { RootScreenProps } from '../navigation/types';
import { getErrorMessage } from '../services/api';
import { personService } from '../services/personService';
import { spacing } from '../theme';
import { PersonInput } from '../types';
import { notify } from '../utils/helpers';
import { hasErrors, validatePerson } from '../utils/validation';

/** Cadastro/edição de professor ou aluno (mesmo formulário, campo extra muda). */
export default function PersonFormScreen({ route, navigation }: RootScreenProps<'PersonForm'>) {
  const { kind, id } = route.params;
  const isEditing = id !== undefined;
  const isTeacherKind = kind === 'teachers';
  const label = isTeacherKind ? 'professor' : 'aluno';
  const extraLabel = isTeacherKind ? 'Disciplina' : 'Turma';
  const { isTeacher } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [extra, setExtra] = useState('');
  const [errors, setErrors] = useState<ReturnType<typeof validatePerson>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(isEditing);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    navigation.setOptions({ title: `${isEditing ? 'Editar' : 'Novo'} ${label}` });
  }, [navigation, isEditing, label]);

  useEffect(() => {
    if (!isEditing) return;
    let active = true;
    (async () => {
      try {
        const person = await personService.get(kind, id!);
        if (!active) return;
        setName(person.name);
        setEmail(person.email);
        setExtra((isTeacherKind ? person.subject : person.classGroup) ?? '');
      } catch (e) {
        if (active) setLoadError(getErrorMessage(e));
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [isEditing, kind, id, isTeacherKind]);

  async function handleSave() {
    const found = validatePerson(kind, { name, email, password, extra }, isEditing);
    setErrors(found);
    setApiError(null);
    if (hasErrors(found)) return;

    const input: PersonInput = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      ...(password ? { password } : {}),
      ...(isTeacherKind ? { subject: extra.trim() } : { classGroup: extra.trim() }),
    };

    setSaving(true);
    try {
      if (isEditing) await personService.update(kind, id!, input);
      else await personService.create(kind, input);
      notify(`${isEditing ? 'Dados atualizados' : 'Cadastro realizado'}`, `O ${label} foi salvo com sucesso.`);
      navigation.goBack();
    } catch (e) {
      setApiError(getErrorMessage(e));
    } finally {
      setSaving(false);
    }
  }

  if (!isTeacher) return <ErrorState message="Apenas professores podem gerenciar cadastros." />;
  if (loading) return <Loading message="Carregando dados…" />;
  if (loadError) return <ErrorState message={loadError} onRetry={() => navigation.goBack()} />;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {!!apiError && <Banner message={apiError} />}
        <Input label="Nome completo" value={name} onChangeText={setName} placeholder={`Nome do ${label}`} error={errors.name} testID="person-name" />
        <Input
          label="E-mail"
          value={email}
          onChangeText={setEmail}
          placeholder="email@fiap.com"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          error={errors.email}
          testID="person-email"
        />
        <Input
          label={isEditing ? 'Nova senha (opcional)' : 'Senha'}
          value={password}
          onChangeText={setPassword}
          placeholder={isEditing ? 'Deixe em branco para manter' : 'Mínimo 6 caracteres'}
          secureTextEntry
          error={errors.password}
          testID="person-password"
        />
        <Input
          label={extraLabel}
          value={extra}
          onChangeText={setExtra}
          placeholder={isTeacherKind ? 'Ex.: Desenvolvimento Mobile' : 'Ex.: 3SOAT'}
          error={errors.extra}
          testID="person-extra"
        />
        <Button
          title={isEditing ? 'Salvar alterações' : `Cadastrar ${label}`}
          icon="checkmark-circle-outline"
          onPress={handleSave}
          loading={saving}
          testID="person-save"
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.lg, paddingBottom: spacing.xxl },
});
