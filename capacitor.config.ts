import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'ai.clerqe.app',
  appName: 'Clerqe',
  webDir: 'dist',
      backgroundColor: '#020907',
  plugins: {
    StatusBar: {
      overlaysWebView: true,
      style: 'DARK',
  backgroundColor: '#020907',
    },
  },
};

export default config;
