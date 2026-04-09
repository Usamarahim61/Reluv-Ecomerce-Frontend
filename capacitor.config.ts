import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.reluv.app',
  appName: 'Reluv',
  webDir: 'out',
  server: {
    url: 'http://10.250.30.52:3000',
    cleartext: true
  }
};

export default config;
