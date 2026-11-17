import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useRef, useState } from 'react';

import { getErrorMessage } from '../services/api';

/**
 * Carrega um recurso da API e o recarrega sempre que a tela volta ao foco
 * (ex.: depois de criar/editar/excluir em outra tela) ou quando o `fetcher` muda.
 *
 * - `loading`: primeira carga (sem dados ainda)
 * - `refreshing`: pull-to-refresh ou recarga com dados já na tela
 */
export function useResource<T>(fetcher: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const requestId = useRef(0);
  const hasData = useRef(false);

  const load = useCallback(
    async (manual = false) => {
      const id = ++requestId.current;
      if (manual || hasData.current) setRefreshing(true);
      else setLoading(true);
      try {
        const result = await fetcher();
        if (id !== requestId.current) return; // resposta antiga (race condition)
        setData(result);
        hasData.current = true;
        setError(null);
      } catch (e) {
        if (id !== requestId.current) return;
        setError(getErrorMessage(e));
      } finally {
        if (id === requestId.current) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    [fetcher],
  );

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const reload = useCallback(() => load(true), [load]);

  return { data, error, loading, refreshing, reload, setData };
}
