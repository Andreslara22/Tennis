import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.acecoach.app',
  appName: 'AceCoach',
  webDir: 'dist',
  backgroundColor: '#0f1720',
  android: {
    // Permite recargar en desarrollo apuntando al servidor de Vite si se desea.
    allowMixedContent: true,
  },
}

export default config
