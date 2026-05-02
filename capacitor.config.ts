import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.reluv.app',
  appName: 'Reluv',
  webDir: 'public',
  server: {
    url: 'http://10.0.2.2:3000',
    cleartext: true,
  },
};

export default config;
