import 'normalize.css'

import type { FC } from 'react'
import type { AppProps } from 'next/app'
import type { PageProps } from '@/data/types'

import { useEffect } from 'react'
import { gsap } from 'gsap'

import '@/styles/global.scss'

import { localStore } from '@/store'

import { AnalyticsService } from '@/services/analytics'

import { fontVariables } from '@/utils/fonts'
import { setBodyClasses } from '@/utils/set-body-classes'

import { useFeatureFlags } from '@/hooks/use-feature-flags'

import { initGsap } from '@/motion/core/init'

import { Layout } from '@/components/Layout/Layout'
import { useRouter } from 'next/router'
import { detect } from '@/utils/detect'
import { routes } from '@/data/routes'

require('focus-visible')

initGsap()

// This default export is required in a new `pages/_app.js` file.
const App: FC<AppProps<PageProps>> = (props) => {
  const { flags } = useFeatureFlags()
  const router = useRouter()

  const cookieConsent = localStore(({ consent }) => consent.cookieConsent)

  useEffect(() => {
    history.scrollRestoration = 'manual'

    // Body class names
    setBodyClasses()
    document.body.classList.add(fontVariables)

    // Fix https://github.com/vercel/next.js/issues/17464
    document.querySelectorAll<HTMLElement>('head > link[rel="stylesheet"]').forEach((node) => {
      delete node.dataset.nG
      delete node.dataset.nP
    })

    // FOUC prevention step 2/2: Make sure the page us un-hidden once application kicks in
    gsap.set(document.documentElement, { autoAlpha: 1 })

    new MutationObserver((mutations) => {
      mutations.forEach(({ target }) => {
        const t = target as Element
        if (t.nodeName === 'STYLE' && t.getAttribute('media') === 'x') t.removeAttribute('media')
      })
    }).observe(document.head, { subtree: true, attributeFilter: ['media'] })
  }, [])

  useEffect(() => {
    if (cookieConsent?.statistics) {
      AnalyticsService.start()
    }
  }, [cookieConsent])

  useEffect(() => {
    if (flags.dynamicResponsiveness) document.documentElement.classList.add('dynamic')
    else document.documentElement.classList.remove('dynamic')
  }, [flags.dynamicResponsiveness])

  // Detect if user in inApp
  useEffect(() => {
    const isInSocialMediaApp = detect.browser.inApp

    if (isInSocialMediaApp) {
      router.push(routes.UNSUPPORTED)
    }
  }, [router])

  return props.pageProps.noLayout ? <props.Component {...props.pageProps} /> : <Layout {...props} />
}

export default App
