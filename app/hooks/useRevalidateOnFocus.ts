import { useEffect } from 'react';
import { useDataRefresh } from 'remix-utils';

export default function useRevalidateOnFocus() {
  const { refresh } = useDataRefresh();

  useEffect(() => {
    window.addEventListener('focus', refresh);
    window.addEventListener('visibilitychange', refresh);
    return () => {
      window.removeEventListener('focus', refresh);
      window.removeEventListener('visibilitychange', refresh);
    };
  }, [refresh]);
}
