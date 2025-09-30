import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.aguapiatua.app',
  appName: 'Agua Piatua',
  webDir: 'dist',
  plugins: {
    GoogleAuth: {
      scopes: ['profile', 'email'],
      serverClientId: '326319514229-c1e4uvs5h9o3j21f36cgl7g9cvk7vqpm.apps.googleusercontent.com',
      forceCodeForRefreshToken: true
    }
  }
};

export default config;
