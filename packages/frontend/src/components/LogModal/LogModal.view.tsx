import type { ApiResponse } from '@/data/types'
import type { ControllerProps } from './LogModal.controller'

import { type FC, useState } from 'react'
import classNames from 'classnames'

import css from './LogModal.module.scss'

import { routes } from '@/data/routes'

import { localState, localStore } from '@/store'

import { getImageUrl } from '@/utils/basic-functions'
import { copy } from '@/utils/copy'
import { Endpoints, fetchApi } from '@/utils/fetch-api'

import { useLocalStorage } from '@/hooks/use-local-storage'
import { useRefs } from '@/hooks/use-refs'

import { BaseButton } from '@/components/BaseButton'
import { BaseForm } from '@/components/BaseForm'
import { BaseImage } from '@/components/BaseImage'
import { CloseButton } from '@/components/CloseButton'

import SvgChilis from '@/svgs/Chilis.svg'

export interface ViewProps extends ControllerProps {}

export type ViewRefs = {
  root: HTMLDivElement
}

// View (pure and testable component, receives props exclusively from the controller)
export const View: FC<ViewProps> = ({
  className,
  title,
  description,
  cta,
  phone,
  password,
  nickname,
  nicknameTitle,
  nicknameDescription,
  nicknameCta,
  errorMessage,
  errorMessageNickname,
  forgotPassword,
  skipLabel,
  skip,
  decoration,
  onClose
}) => {
  const refs = useRefs<ViewRefs>()
  const [phoneValue, setPhoneValue] = useState('')
  const [passwordValue, setPasswordValue] = useState('')
  const [nicknameValue, setNicknameValue] = useState('')
  const [accessToken, setAccessToken] = useLocalStorage('accessToken')
  const [, setIdToken] = useLocalStorage('idToken')
  const [hasError, setHasError] = useState(false)
  const [hasLogged, setHasLogged] = useState(false)
  const preferredNickname = localState().user.nickname

  const handleLoginSubmit = async () => {
    try {
      const response = await fetchApi(`${process.env.NEXT_PUBLIC_API_URL + Endpoints.USER}`, undefined, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ phone: phoneValue, password: passwordValue })
      })

      const apiResponse = response as ApiResponse

      console.log('Login response:', apiResponse)

      if (!apiResponse.IdToken || !apiResponse.AccessToken) {
        console.error('Login failed:', apiResponse.message)
        setHasError(true)
      } else {
        setAccessToken(String(apiResponse.AccessToken))
        setIdToken(String(apiResponse.IdToken))
        localState().user.setAccessToken(String(apiResponse.AccessToken))
        localState().user.setIdToken(String(apiResponse.IdToken))
        localState().user.setIsTokenValid(true)
        setHasLogged(true)
      }
    } catch (error) {
      console.error(error)
      setHasError(true)
    }
  }

  const handleNicknameSubmit = async () => {
    try {
      const response = await fetchApi(`${process.env.NEXT_PUBLIC_API_URL + Endpoints.USER}`, undefined, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify({ nickname: nicknameValue })
      })

      const apiResponse = response as ApiResponse

      console.log('Nickname response:', apiResponse)

      if (apiResponse.message.toLowerCase().includes('success')) {
        console.log('Nickame set successful:', apiResponse.message)
        localState().user.setNickname(nicknameValue)
        onClose()
      } else {
        console.error('Error while setting nickname:', apiResponse.message)
        setHasError(true)
      }
    } catch (error) {
      console.error(error)
      setHasError(true)
    }
  }

  return (
    <div className={classNames('LogModal', css.root, className)} ref={refs.root}>
      <div className={css.wrapper}>
        <CloseButton className={css.close} onClick={onClose} />
        <div className={css.top}>
          <div className={css.logoContainer}>
            <SvgChilis />
          </div>

          {!localStore().user.isTokenValid ? (
            <>
              <div className={css.title} {...copy.html(title)} />
              <div className={css.description} {...copy.html(description)} />
              <BaseForm
                onSubmit={handleLoginSubmit}
                submitMessage={cta}
                errorMessage={errorMessage}
                hasError={hasError}
                disabled={phoneValue === '' || passwordValue === ''}
              >
                <div className={css.fieldsContainer}>
                  <input
                    type="text"
                    id="phone"
                    name="phone"
                    placeholder={phone}
                    onChange={(e) => setPhoneValue(e.target.value)}
                    required
                  />
                  <input
                    type="password"
                    id="password"
                    name="password"
                    placeholder={password}
                    onChange={(e) => setPasswordValue(e.target.value)}
                    required
                  />
                </div>
              </BaseForm>

              <div className={css.forgotPassword}>
                <BaseButton href={routes.HOME}>{forgotPassword}</BaseButton>
              </div>
            </>
          ) : (
            !preferredNickname && (
              <>
                <div className={css.title} {...copy.html(nicknameTitle)} />
                <div className={css.description} {...copy.html(nicknameDescription)} />
                <BaseForm
                  onSubmit={handleNicknameSubmit}
                  submitMessage={nicknameCta}
                  errorMessage={errorMessageNickname}
                >
                  <div className={css.fieldsContainer}>
                    <input
                      type="text"
                      id="nickname"
                      name="nickname"
                      placeholder={nickname}
                      onChange={(e) => setNicknameValue(e.target.value)}
                      required
                    />
                  </div>
                </BaseForm>
              </>
            )
          )}
        </div>
        <div className={css.bottom}>
          <div className={css.chillieContainer}>
            <BaseImage className={css.chillie} data={getImageUrl(decoration)} />
          </div>

          <div className={css.skipContainer}>
            <p className={css.label} {...copy.html(skipLabel)} />
            <BaseButton className={css.skipButton} onClick={onClose}>
              {skip}
            </BaseButton>
          </div>
        </div>
      </div>
    </div>
  )
}

View.displayName = 'LogModal_View'
