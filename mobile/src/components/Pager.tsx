import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, font, spacing } from '../theme';
import { Button } from './ui';

interface Props {
  page: number;
  totalPages: number;
  total: number;
  onChange: (page: number) => void;
}

/** Rodapé de paginação usado nas listagens de professores e alunos. */
export function Pager({ page, totalPages, total, onChange }: Props) {
  return (
    <View style={styles.container} testID="pager">
      <Button
        title="Anterior"
        icon="chevron-back"
        variant="ghost"
        small
        disabled={page <= 1}
        onPress={() => onChange(page - 1)}
      />
      <View style={{ alignItems: 'center' }}>
        <Text style={styles.page}>
          Página {page} de {totalPages}
        </Text>
        <Text style={styles.total}>{total} registro(s)</Text>
      </View>
      <Button
        title="Próxima"
        variant="ghost"
        small
        disabled={page >= totalPages}
        onPress={() => onChange(page + 1)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  page: { fontSize: font.small, fontWeight: '700', color: colors.text },
  total: { fontSize: 12, color: colors.textMuted },
});
