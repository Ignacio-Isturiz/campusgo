import { useColorScheme as useRNColorScheme } from 'react-native';
import React from 'react';
import { getPreferences, addPreferencesListener } from '@/src/utils/storage';

export function useColorScheme() {
	const system = useRNColorScheme();
	const [pref, setPref] = React.useState<'light'|'dark'|null>(null);

	React.useEffect(() => {
		let mounted = true;
		getPreferences().then(p => {
			if (!mounted) return;
			if (p && p.theme) setPref(p.theme as any);
		}).catch(() => {});

		const unsub = addPreferencesListener((p) => {
			setPref(p?.theme as any ?? null);
		});

		return () => {
			mounted = false;
			unsub();
		};
	}, []);

	return (pref as any) || system;
}
