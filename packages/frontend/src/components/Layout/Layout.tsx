import type { FC, ReactNode, RefObject } from 'react'
import type { AppProps } from 'next/app'
import type { NavHandle } from '@/components/Nav'
import type { ApiResponse, PageHandle, PageProps } from '@/data/types'

import { memo, useCallback, useEffect, useRef, useState } from 'react'
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
import { Endpoints, fetchApi } from '@/utils/fetch-api'

import { useFeatureFlags } from '@/hooks/use-feature-flags'
import { useLocalStorage } from '@/hooks/use-local-storage'
import { useRefs } from '@/hooks/use-refs'
import { useSound } from '@/hooks/use-sound'

import { BaseModal } from '@/components/BaseModal'
import { ConfirmationModal } from '@/components/ConfirmationModal'
import { Head } from '@/components/Head'
import { LogModal } from '@/components/LogModal'
import { Nav } from '@/components/Nav'
import { PlayNow } from '@/components/PlayNow'
import { ScreenLowBattery } from '@/components/ScreenLowBattery'
import { ScreenNoScript } from '@/components/ScreenNoScript'
import { SoundSwitch } from '@/components/SoundSwitch'
import { TopNav } from '@/components/TopNav'

import { GAME_LOGS } from '@/game/game.config'

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
  const [playNowTriggered, setPlayNowTriggered] = useState<boolean>(false)
  const [loginButtonTriggered, setLoginButtonTriggered] = useState<boolean>(false)
  const isModalOpen = localState().screen.isModalOpen
  const nickname = localState().user.nickname
  const isMutedStore = localStore().screen.isMuted
  const isContextInitialized = localStore().navigation.isContextInitialized

  const [idToken] = useLocalStorage('idToken')
  const [accessToken] = useLocalStorage('accessToken')
  const [highScoreFromStorage] = useLocalStorage('highScore')
  const [gameId] = useLocalStorage('gameId')

  const [soundState, setSoundState] = useSound()
  const [allowSignin, setAllowSignin] = useState<boolean>(false)

  const handleResetFlags = useCallback(() => {
    setPlayNowTriggered(false)
    setLoginButtonTriggered(false)
  }, [])

  const handleCountryCheck = useCallback(async () => {
    try {
      const response = await fetchApi(`${process.env.NEXT_PUBLIC_API_URL + Endpoints.COUNTRY_CODE}`, '', {
        method: 'GET'
      })

      return response as ApiResponse
    } catch (error_) {
      if (GAME_LOGS) console.error(error_)
    }
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      const response = await handleCountryCheck()

      if (response?.message === 'Success') {
        setAllowSignin(true)
      }
    }

    fetchData()
  }, [handleCountryCheck])

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
      handleResetFlags()

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
  }, [refs, router, handleResetFlags])

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
        localState().user.setIsTokenValid(true)

        if (payload.preferred_username) {
          localState().user.setUserId(String(payload.sub))
          localState().user.setNickname(String(payload.preferred_username))
        }

        localState().user.setAccessToken(String(accessToken))

        if (isModalOpen && payload.preferred_username) {
          localState().screen.setIsModalOpen(false)
        }

        if (gameId) {
          localState().user.setGameId(gameId)
        }
      } catch (error) {
        if (GAME_LOGS) console.log('Token not valid!', error)
        localState().user.resetUser()
      }
    }

    verifyToken()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idToken])

  // Fetch highscore
  useEffect(() => {
    if (!accessToken) return

    const checkHighscore = async () => {
      try {
        const response = await fetchApi(`${process.env.NEXT_PUBLIC_API_URL + Endpoints.LEADERBOARD}`, '100', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`
          }
        })

        const apiResponse = response as ApiResponse

        if (apiResponse.user && apiResponse.user.score) {
          localState().user.setHighScore(apiResponse.user.score)
        }
      } catch (error) {
        console.error(error)
      }
    }

    checkHighscore()
  }, [accessToken, highScoreFromStorage])

  // Set highscore from local storage
  useEffect(() => {
    if (highScoreFromStorage && !localState().user.highScore) {
      localState().user.setHighScore(Number(highScoreFromStorage))
    }
  }, [highScoreFromStorage])

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

  useEffect(() => {
    if (nickname && playNowTriggered) {
      router.push(routes.GAME)
      setPlayNowTriggered(false)
    }
  }, [nickname, playNowTriggered, router])

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

  // Log out
  const handleNavigateBack = useCallback(() => {
    localState().user.resetUser()
    localState().screen.setIsModalOpen(false)
    localStorage.removeItem('idToken')
    localStorage.removeItem('accessToken')

    const storedDataString = localStorage.getItem('NEXTJS-BOILERPLATE')
    const storedData = JSON.parse(String(storedDataString))

    if (storedData && storedData.accessToken && storedData.idToken) {
      delete storedData.accessToken
      delete storedData.idToken
      localStorage.setItem('NEXTJS-BOILERPLATE', JSON.stringify(storedData))
    }

    if (refs.pathname.current === routes.GAME) {
      router.push(routes.HOME)
    }

    handleResetFlags()
  }, [refs.pathname, router, handleResetFlags])

  const noNickname = !nickname || nickname === 'undefined'

  return (
    <div
      className={classNames('Layout', css.root, {
        [css.scrollable]: refs.pathname.current === routes.HOW_TO_PLAY || refs.pathname.current === routes.CONTEST
      })}
    >
      <Head {...pageProps.content.head} />

      <TopNav
        content={pageProps.content.common.topNav}
        text={localStore().user.nickname ? localState().user.nickname : pageProps.content.common.topNav.logIn}
        onClick={() => {
          setLoginButtonTriggered(true)
          localState().screen.setIsModalOpen(true)
        }}
        allowSignin={!noNickname || (allowSignin && localState().navigation.pathname !== routes.GAME)}
      />

      {refs.pathname.current !== routes.FULL_LEADERBOARD &&
        refs.pathname.current !== routes.FAQ &&
        refs.pathname.current !== routes.TERMS && (
          <>
            {refs.pathname.current !== routes.GAME && (
              <>
                {refs.pathname.current !== routes.GAME_OVER && (
                  <PlayNow
                    text={pageProps.content.common.playNow}
                    className={css.playButton}
                    onClick={() => {
                      if (isMutedStore === true && !isContextInitialized) setSoundState(true)

                      if (noNickname && allowSignin) {
                        setPlayNowTriggered(true)
                        localState().screen.setIsModalOpen(true)
                      } else {
                        router.push(routes.GAME)
                      }
                    }}
                  />
                )}
                <Nav
                  content={pageProps.content.common.nav}
                  handleRef={refs.navHandle}
                  onFullscreen={handleFullscreen}
                  isGameOver={refs.pathname.current === routes.GAME_OVER}
                />
              </>
            )}
            <SoundSwitch className={css.soundSwitch} soundState={soundState} onClick={setSoundState} />
          </>
        )}

      <div className={css.content}>{currentPage}</div>

      {isModalOpen &&
        (noNickname ? (
          <BaseModal
            onClose={() => {
              handleResetFlags()
              localState().screen.setIsModalOpen(false)
            }}
          >
            <LogModal
              {...pageProps.content.common.logModal}
              loginButtonTriggered={loginButtonTriggered}
              onClose={() => {
                handleResetFlags()
                localState().screen.setIsModalOpen(false)
              }}
              onSkip={() => {
                if (localState().navigation.pathname !== routes.GAME) {
                  localState().navigation.navigateTo(routes.GAME)
                }

                localState().screen.setIsModalOpen(false)
              }}
            />
          </BaseModal>
        ) : (
          <BaseModal
            onClose={() => {
              handleResetFlags()
              localState().screen.setIsModalOpen(false)
            }}
          >
            <ConfirmationModal
              className={css.modalLogOut}
              show={isModalOpen}
              handleClose={() => {
                handleResetFlags()
                localState().screen.setIsModalOpen(false)
              }}
              content={pageProps.content.common.topNav.logOutModal}
              logo={pageProps.content.common.topNav.logo}
              handleNavigateBack={handleNavigateBack}
            />
          </BaseModal>
        ))}

      <CookieBanner content={pageProps.content.common.cookieBanner} />

      <ScreenRotate content={pageProps.content.common.screenRotate} />
      <ScreenNoScript content={pageProps.content.common.screenNoScript} />
      <ScreenLowBattery content={pageProps.content.common.screenLowBattery} />

      <AppAdmin />
    </div>
  )
})

Layout.displayName = 'Layout'
