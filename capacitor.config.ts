import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.MyFoodieApp.app',
  appName: 'My App',
  webDir: 'dist/spa',
  server: {
    androidScheme: 'http',
    cleartext: true
  }
};

export default config;
