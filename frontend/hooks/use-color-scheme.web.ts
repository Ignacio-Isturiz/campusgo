import { useEffect, useState } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';
import { getPreferences, addPreferencesListener } from '@/src/utils/storage';

/**
 * To support static rendering, this value needs to be re-calculated on the client side for web
 */
export function useColorScheme() {
  const [hasHydrated, setHasHydrated] = useState(false);
  const [pref, setPref] = useState<'light'|'dark'|null>(null);

  useEffect(() => {
    setHasHydrated(true);
    let mounted = true;
    getPreferences().then(p => {
      if (!mounted) return;
      setPref(p?.theme as any ?? null);
    }).catch(() => {});
    const unsub = addPreferencesListener((p) => setPref(p?.theme as any ?? null));
    return () => { mounted = false; unsub(); };
  }, []);

  const colorScheme = useRNColorScheme();

  if (hasHydrated) {
    return (pref as any) || colorScheme;
  }

  return 'light';
}
