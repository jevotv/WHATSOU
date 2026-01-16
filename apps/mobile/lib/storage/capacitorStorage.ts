
export const capacitorStorage = {
    getItem: async (key: string): Promise<string | null> => {
        const { Preferences } = await import('@capacitor/preferences');
        const { value } = await Preferences.get({ key });
        return value;
    },
    setItem: async (key: string, value: string): Promise<void> => {
        const { Preferences } = await import('@capacitor/preferences');
        await Preferences.set({ key, value });
    },
    removeItem: async (key: string): Promise<void> => {
        const { Preferences } = await import('@capacitor/preferences');
        await Preferences.remove({ key });
    },
};
