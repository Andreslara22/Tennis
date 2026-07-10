import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'mx.caeelveinte.app',
  appName: 'Cae el Veinte',
  webDir: 'dist',
  android: {
    allowMixedContent: false,
  },
}

export default config
