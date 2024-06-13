import type { FC, ReactNode, RefObject } from 'react'
import type { AppProps } from 'next/app'
import type { NavHandle } from '@/components/Nav'
import type { PageHandle, PageProps } from '@/data/types'

import { memo, useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { CognitoJwtVerifier } from 'aws-jwt-verify'
import classNames from 'classnames'
import { gsap } from 'gsap'
import { nanoid } from 'nanoid'

import css from './Layout.module.scss'

import { routes } from '@/data/routes'

import { localState, localStore } from '@/store'

import { getScrollTop } from '@/utils/basic-functions'

import { useFeatureFlags } from '@/hooks/use-feature-flags'
import { useLocalStorage } from '@/hooks/use-local-storage'
import { useRefs } from '@/hooks/use-refs'

import { BaseModal } from '@/components/BaseModal'
import { Head } from '@/components/Head'
import { LogModal } from '@/components/LogModal'
import { Nav } from '@/components/Nav'
import { PlayNow } from '@/components/PlayNow'
import { ScreenLowBattery } from '@/components/ScreenLowBattery'
import { ScreenNoScript } from '@/components/ScreenNoScript'
import { SoundSwitch } from '@/components/SoundSwitch'
import { TopNav } from '@/components/TopNav'

import { GAME_SOUNDS_BASE_URL } from '@/game/game.config'

const ScreenRotate = dynamic(() => import('@/components/ScreenRotate').then((m) => m.ScreenRotate), { ssr: false })
const CookieBanner = dynamic(() => import('@/components/CookieBanner').then((m) => m.CookieBanner), { ssr: false })
const AppAdmin = dynamic(() => import('@/components/AppAdmin').then((m) => m.AppAdmin), { ssr: false })

export type LayoutRefs = {
  pathname: string
  navHandle: NavHandle | null
  pageHandle: PageHandle | null
  isFirstPage: boolean
  scrollRestorationTimeout: NodeJS.Timeout
}

export const Layout: FC<AppProps<PageProps>> = memo(({ Component, pageProps }) => {
  const refs = useRefs<LayoutRefs>({
    pathname: useRef('/'),
    isFirstPage: useRef(true)
  })

  const router = useRouter()

  const { flags } = useFeatureFlags()

  const [currentPage, setCurrentPage] = useState<ReactNode>(<Component key="first-page" {...pageProps} />)
  const isModalOpen = localState().screen.isModalOpen

  const [idToken] = useLocalStorage('idToken')
  const [accessToken] = useLocalStorage('accessToken')

  //
  // Update pathname ref
  //
  useEffect(() => {
    refs.pathname.current = router.asPath
      .split('#')[0]
      .split('?')[0]
      .replace(/^\/..-..\/?/u, '')
  }, [refs, router.asPath])

  //
  // Navigation utils
  //
  useEffect(() => {
    const navigateTo = (href: string) => {
      const to = href.split('/').filter(Boolean).join('/').replace(/\/$/u, '')
      const from = router.asPath.split('/').filter(Boolean).join('/').replace(/\/$/u, '')
      if (to === from) router.replace(href, '', { scroll: false }).catch(console.log)
      else router.push(href, '', { scroll: false }).catch(console.log)
    }
    const navigateBack = () => {
      if (localState().navigation.hasNavigated) {
        router.back()
      } else if (window.location.hash) {
        setTimeout(() => {
          navigateTo(window.location.pathname)
        })
      } else {
        navigateTo('/')
      }
    }
    localState().navigation.setNavigateTo(navigateTo)
    localState().navigation.setNavigateBack(navigateBack)
    // detect first navigation
    const onFirstNavigation = () => {
      localState().navigation.setHasNavigated(true)
      router.events.off('routeChangeComplete', onFirstNavigation)
      router.events.off('hashChangeComplete', onFirstNavigation)
    }
    if (!localState().navigation.hasNavigated) {
      router.events.on('routeChangeComplete', onFirstNavigation)
      router.events.on('hashChangeComplete', onFirstNavigation)
    }
    // handle scroll history
    const onBeforeHistoryChange = () => {
      if (!localState().navigation.isNavigatingBack) {
        const scrollHistory = [
          ...localState().navigation.scrollHistory,
          { pathname: refs.pathname.current || '/', value: getScrollTop() }
        ]
        localState().navigation.setScrollHistory(scrollHistory)
      }
    }
    router.beforePopState(() => {
      localState().navigation.setIsNavigatingBack(true)
      return true
    })
    router.events.on('beforeHistoryChange', onBeforeHistoryChange)
    return () => {
      router.events.off('beforeHistoryChange', onBeforeHistoryChange)
    }
  }, [refs, router])

  //
  // Page transitions
  //
  useEffect(() => {
    const transitionTimeline = gsap.timeline()

    // if the current page has an animateOut(), do it
    if (flags.pageTransitions && refs.pageHandle.current?.animateOut) {
      transitionTimeline.add(refs.pageHandle.current.animateOut())
    }

    // after the out animation, set the new page
    transitionTimeline.add(() => {
      // reset scroll
      gsap.set(window, { scrollTo: { x: 0, y: 0, autoKill: false } })
      // update app.pathname
      localState().navigation.setPathname(refs.pathname.current || '/')
      // set new page
      setCurrentPage(
        <Component
          key={refs.isFirstPage.current ? 'first-page' : nanoid()}
          {...pageProps}
          onReady={(pageHandle?: RefObject<PageHandle>) => {
            refs.pageHandle.current = pageHandle?.current || null
            // animate in
            const pageTransition = refs.pageHandle.current?.animateIn?.()
            const navTransition = refs.navHandle.current?.animateIn?.()
            if (!flags.pageTransitions) {
              pageTransition?.progress(1)
              navTransition?.progress(1)
            }
            // restore scroll
            clearTimeout(refs.scrollRestorationTimeout.current!)
            refs.scrollRestorationTimeout.current = setTimeout(() => {
              if (localState().navigation.isNavigatingBack) {
                const scrollHistory = [...localState().navigation.scrollHistory]
                const lastScrollHistory = scrollHistory.pop()
                localState().navigation.setScrollHistory(scrollHistory)
                if (lastScrollHistory && lastScrollHistory.pathname === refs.pathname.current) {
                  gsap.set(window, { scrollTo: { x: 0, y: lastScrollHistory.value, autoKill: false } })
                }
              } else {
                gsap.set(window, { scrollTo: { x: 0, y: 0, autoKill: false } })
              }
              clearTimeout(refs.scrollRestorationTimeout.current!)
              refs.scrollRestorationTimeout.current = setTimeout(() => {
                localState().navigation.setIsNavigatingBack(false)
              }, 400)
            }, 100)
          }}
        />
      )
      refs.isFirstPage.current = false
    })

    return () => {
      transitionTimeline.kill()
    }
  }, [refs, Component, pageProps, flags.pageTransitions])

  // Verifying ID token
  useEffect(() => {
    const verifyToken = async () => {
      if (!idToken) return
      const verifier = CognitoJwtVerifier.create({
        userPoolId: process.env.NEXT_PUBLIC_USER_POOL_ID ?? '',
        tokenUse: 'id',
        clientId: process.env.NEXT_PUBLIC_CLIENT_ID ?? ''
      })

      try {
        const payload = await verifier.verify(idToken)
        console.log('Token is valid. Payload:', payload)
        localState().user.setIsTokenValid(true)
        localState().user.setNickname(String(payload.preferred_username))
        localState().user.setAccessToken(String(accessToken))

        if (isModalOpen && String(payload.preferred_username)) {
          localState().screen.setIsModalOpen(false)
        }
      } catch (error) {
        console.log('Token not valid!', error)
        localState().user.resetUser()
      }
    }

    verifyToken()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idToken])

  // Fullscreen
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        localState().screen.setIsfullscreen(false)
      }
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
    document.addEventListener('mozfullscreenchange', handleFullscreenChange)

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange)
    }
  }, [])

  const handleFullscreen = () => {
    if (document.fullscreenElement) {
      if (document.exitFullscreen) {
        document.exitFullscreen()
        localState().screen.setIsfullscreen(false)
      }
    } else {
      const element = document.documentElement
      if (element.requestFullscreen) {
        element.requestFullscreen()
        localState().screen.setIsfullscreen(true)
      }
    }
  }

  return (
    <div className={classNames('Layout', css.root)}>
      <Head {...pageProps.content.head} />

      <TopNav
        text={localStore().user.nickname ? localState().user.nickname : pageProps.content.common.topNav.logIn}
        onClick={() => localState().screen.setIsModalOpen(true)}
        isDisabled={!!localState().user.nickname} // TODO: add a validation here to verify the token, so on ref the user stays logged in
      />

      {refs.pathname.current !== routes.FULL_LEADERBOARD &&
        refs.pathname.current !== routes.FAQ &&
        refs.pathname.current !== routes.TERMS && (
          <>
            {refs.pathname.current !== routes.GAME && (
              <>
                {refs.pathname.current !== routes.GAME_OVER && (
                  <PlayNow text={pageProps.content.common.playNow} className={css.playButton} url={routes.GAME} />
                )}
                <Nav
                  content={pageProps.content.common.nav}
                  handleRef={refs.navHandle}
                  onFullscreen={handleFullscreen}
                  isGameOver={refs.pathname.current === routes.GAME_OVER}
                />
              </>
            )}
            <SoundSwitch className={css.soundSwitch} audioSrc={GAME_SOUNDS_BASE_URL} />
          </>
        )}

      <div className={css.content}>{currentPage}</div>

      {isModalOpen && (
        <BaseModal onClose={() => localState().screen.setIsModalOpen(false)}>
          <LogModal {...pageProps.content.common.logModal} onClose={() => localState().screen.setIsModalOpen(false)} />
        </BaseModal>
      )}

      <CookieBanner content={pageProps.content.common.cookieBanner} />

      <ScreenRotate content={pageProps.content.common.screenRotate} />
      <ScreenNoScript content={pageProps.content.common.screenNoScript} />
      <ScreenLowBattery content={pageProps.content.common.screenLowBattery} />

      <AppAdmin />
    </div>
  )
})

Layout.displayName = 'Layout'
