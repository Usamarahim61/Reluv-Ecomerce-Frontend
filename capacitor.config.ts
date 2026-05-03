import type { CapacitorConfig } from '@capacitor/cli';

const serverUrl = process.env.CAPACITOR_SERVER_URL || 'http://192.168.100.134:3000';

const config: CapacitorConfig = {
  appId: 'com.reluv.app',
  appName: 'Reluv',
  webDir: 'public',
  server: {
    url: serverUrl,
    cleartext: true,
  },
};

export default config;
