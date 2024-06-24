import config from '@/data/config.json'

import { print } from '@/utils/print'
import { getRuntimeEnv } from '@/utils/runtime-env'

import { GAME_LOGS } from '@/game/game.config'

export type GAEvent = {
  category: string
  action: string
  label: string
  value?: number
}

class Service {
  tracking = false

  gaId: string

  constructor() {
    const env = getRuntimeEnv()
    this.gaId = config.analytics.gaIds[env] || ''
  }

  start = () => {
    if (typeof window !== 'undefined' && !this.tracking) {
      this.tracking = true

      if (this.gaId) {
        const script = document.createElement('script')
        script.id = 'ga-container'
        script.text = `
          (function(){
            var gtagScript = document.createElement('script');
            gtagScript.async = true;
            gtagScript.src = 'https://www.googletagmanager.com/gtag/js?id=${this.gaId}';
            document.head.appendChild(gtagScript);

            window.dataLayer = window.dataLayer || [];
            function gtag(){window.dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${this.gaId}');
          })();
        `
        document.head.append(script)
        if (GAME_LOGS) print('Analytics', 'GA initialized')
      }
    }
  }

  trackGa(payload: GAEvent): void {
    if (this.gaId && this.tracking) {
      const { category, action, label, value } = payload
      window.gtag('event', action, {
        event_category: category,
        event_label: label,
        value
      })
      if (GAME_LOGS) print('Analytics', `GA: ${JSON.stringify(payload)}`)
    }
  }
}

export const AnalyticsService = new Service()
