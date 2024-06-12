import type { AppState } from '@/store'
import type { CookieConsent } from '@/store/slice-consent'
import type { ControllerProps } from './CookieBanner.controller'

import { type FC, useCallback, useState } from 'react'
import classNames from 'classnames'

import css from './CookieBanner.module.scss'

import { copy } from '@/utils/copy'

import { useRefs } from '@/hooks/use-refs'

import { CloseButton } from '@/components/CloseButton'
import { PillButton } from '@/components/PillButton'

export interface ViewProps extends ControllerProps {
  cookieConsent: AppState['consent']['cookieConsent']
  setCookieConsent: AppState['consent']['setCookieConsent']
}

export type ViewRefs = {
  root: HTMLDivElement
}

// View (pure and testable component, receives props exclusively from the controller)
export const View: FC<ViewProps> = ({ className, content, cookieConsent, setCookieConsent }) => {
  const refs = useRefs<ViewRefs>()

  const [settings, setSettings] = useState(false)
  const [consent, setConsent] = useState<CookieConsent>(
    cookieConsent ?? {
      necessary: true,
      statistics: true
    }
  )

  const handleAcceptAll = useCallback(() => {
    setCookieConsent(consent)
  }, [consent, setCookieConsent])

  const handleDeclineAll = useCallback(() => {
    setCookieConsent({
      necessary: true,
      statistics: false
    })
  }, [setCookieConsent])

  const handleSettingsOpen = useCallback(() => {
    setSettings(true)
  }, [])

  const handleSettingsClose = useCallback(() => {
    setSettings(false)
  }, [])

  const handleUpdate = useCallback(
    (key: keyof CookieConsent, value: boolean) => {
      setConsent({ ...consent, [key]: value })
    },
    [consent]
  )

  return (
    <div className={classNames('CookieBanner', css.root, className)} ref={refs.root}>
      <p className={css.description} {...copy.html(content.description)} />

      <div className={css.buttonContainer}>
        <PillButton onClick={handleAcceptAll}>
          <span {...copy.html(content.ctas.accept)} />
        </PillButton>

        <PillButton onClick={handleDeclineAll}>
          <span {...copy.html(content.ctas.reject)} />
        </PillButton>

        <PillButton onClick={handleSettingsOpen}>
          <span {...copy.html(content.ctas.settings)} />
        </PillButton>
      </div>

      {settings && (
        <div className={css.cookieSettings}>
          <CloseButton className={css.cookieSettingsClose} onClick={handleSettingsClose} />

          <div className={css.cookieSettingsContent}>
            <p className={css.cookieSettingsDescription} {...copy.html(content.settings)} />

            <ul className={css.cookieSettingsList}>
              <li>
                <input type="checkbox" id="cookie-necessary" checked={consent?.necessary} readOnly />
                <label htmlFor="cookie-necessary" {...copy.html(content.purpose.necessary)} />
              </li>
              <li>
                <input
                  type="checkbox"
                  id="cookie-statistics"
                  checked={consent?.statistics}
                  onChange={(e) => {
                    handleUpdate('statistics', e.target.checked)
                  }}
                />
                <label htmlFor="cookie-statistics" {...copy.html(content.purpose.statistics)} />
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}

View.displayName = 'CookieBanner_View'
