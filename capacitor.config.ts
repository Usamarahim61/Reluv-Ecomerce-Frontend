import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.reluv.app',
  appName: 'Reluv',
  webDir: 'public',
  server: {
    url: 'http://192.168.100.134:3000',
    cleartext: true
  }
};

export default config;
