import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'ai.clerqe.app',
  appName: 'Clerqe',
  webDir: 'dist',
  backgroundColor: '#000000',
  plugins: {
    StatusBar: {
      overlaysWebView: true,
      style: 'DARK',
      backgroundColor: '#000000',
    },
  },
};

export default config;
