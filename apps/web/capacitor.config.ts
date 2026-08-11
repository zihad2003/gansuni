import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'app.gansuni.player',
  appName: 'Gaansuni',
  webDir: '../out',
  server: {
    androidScheme: 'https',
    cleartext: false,
  },
  plugins: {
    CapacitorHttp: {
      enabled: true,
    },
    SplashScreen: {
      launchAutoHide: false,
      backgroundColor: '#000000',
      showSpinner: true,
      spinnerColor: '#F59E0B',
    },
  },
  android: {
    allowMixedContent: false,
    captureInput: true,
    hideLogs: false,
    webContentsDebuggingEnabled: true,
    launchAutoHide: false,
    backgroundColor: '#000000',
    initialOrientation: 'portrait',
  },
}

export default config
