import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'mx.puntoextra.app',
  appName: 'Punto Extra',
  webDir: 'dist',
  android: {
    allowMixedContent: false,
  },
}

export default config
