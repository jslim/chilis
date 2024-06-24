import type { ApiResponse } from '@/data/types'
import type { ControllerProps } from './LogModal.controller'

import { type FC, useEffect, useState } from 'react'
import classNames from 'classnames'

import css from './LogModal.module.scss'

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

import { GAME_LOGS } from '@/game/game.config'

export interface ViewProps extends ControllerProps {}

export type ViewRefs = {
  root: HTMLDivElement
}

export const View: FC<ViewProps> = ({
  className,
  logo,
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
  forgotPasswordLink,
  createAccountLink,
  createAccount,
  skipLabel,
  skip,
  decoration,
  loginButtonTriggered,
  onClose,
  onSkip
}) => {
  const refs = useRefs<ViewRefs>()
  const [phoneValue, setPhoneValue] = useState<string>('')
  const [passwordValue, setPasswordValue] = useState<string>('')
  const [nicknameValue, setNicknameValue] = useState<string>('')
  const [accessToken, setAccessToken] = useLocalStorage('accessToken')
  const [, setIdToken] = useLocalStorage('idToken')
  const [hasError, setHasError] = useState(false)
  const [loading, setLoading] = useState(false)
  const isTokenValid = localStore().user.isTokenValid

  const preferredNickname = localState().user.nickname

  useEffect(() => {
    if (isTokenValid && !preferredNickname) {
      setLoading(false)
    }
  }, [isTokenValid, preferredNickname])

  const saveTokens = (apiResponse: ApiResponse) => {
    setAccessToken(String(apiResponse.AccessToken))
    setIdToken(String(apiResponse.IdToken))
    localState().user.setAccessToken(String(apiResponse.AccessToken))
    localState().user.setIdToken(String(apiResponse.IdToken))
    localState().user.setIsTokenValid(true)
  }

  const handleLoginSubmit = async () => {
    setLoading(true)

    try {
      const response = await fetchApi(`${process.env.NEXT_PUBLIC_API_URL + Endpoints.USER}`, undefined, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ phone: phoneValue, password: passwordValue })
      })

      const apiResponse = response as ApiResponse

      if (!apiResponse.IdToken || !apiResponse.AccessToken) {
        console.error('Login failed:', apiResponse.message)
        setHasError(true)
      } else {
        saveTokens(apiResponse)
      }
    } catch (error) {
      console.error(error)
      setHasError(true)
    } finally {
      setLoading(false)
    }
  }

  const handleNicknameSubmit = async () => {
    setLoading(true)

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

      if (!apiResponse.IdToken || !apiResponse.AccessToken) {
        if (GAME_LOGS) console.error('Error while setting nickname:', apiResponse.message)
        setHasError(true)
      } else {
        saveTokens(apiResponse)
        localState().user.setNickname(nicknameValue)
        onClose()
      }
    } catch (error) {
      console.error(error)
      setHasError(true)
    } finally {
      setLoading(false)
    }
  }

  const handleNicknameChange = (value: string) => {
    const regex = /^[\w.-]{3,10}$/u
    if (regex.test(value)) {
      setHasError(false)
    } else {
      setHasError(true)
    }
    setNicknameValue(value)
  }

  const renderLoginForm = () => (
    <>
      <div className={css.innerWrapper}>
        <div className={css.title} {...copy.html(title)} />
        <div className={css.description} {...copy.html(description)} />
      </div>
      <BaseForm
        onSubmit={handleLoginSubmit}
        submitMessage={cta}
        errorMessage={errorMessage}
        hasError={hasError}
        disabled={phoneValue === '' || passwordValue === '' || loading}
      >
        <div className={css.fieldsContainer}>
          <input
            type="text"
            id="phone"
            name="phone"
            placeholder={phone}
            autoComplete="username"
            value={phoneValue}
            onChange={(e) => setPhoneValue(e.target.value)}
            required
          />
          <input
            type="password"
            id="password"
            name="password"
            placeholder={password}
            autoComplete="current-password"
            value={passwordValue}
            onChange={(e) => setPasswordValue(e.target.value)}
            required
          />
        </div>
      </BaseForm>

      <div className={css.forgotPassword}>
        <BaseButton href={forgotPasswordLink}>{forgotPassword}</BaseButton> or{' '}
        <BaseButton href={createAccountLink}>{createAccount}</BaseButton>
      </div>
    </>
  )

  const renderNicknameForm = () => (
    <>
      <div className={css.innerWrapper}>
        <div className={css.title} {...copy.html(nicknameTitle)} />
        <div className={css.description} {...copy.html(nicknameDescription)} />
      </div>
      <BaseForm
        onSubmit={handleNicknameSubmit}
        submitMessage={nicknameCta}
        errorMessage={errorMessageNickname}
        disabled={nicknameValue === '' || hasError || loading}
      >
        <div className={css.fieldsContainer}>
          <input
            type="text"
            id="nickname"
            name="nickname"
            placeholder={nickname}
            value={nicknameValue ?? ''}
            onChange={(e) => handleNicknameChange(e.target.value)}
            autoComplete="off"
            required
          />
        </div>
      </BaseForm>
    </>
  )

  return (
    <div className={classNames('LogModal', css.root, className)} ref={refs.root}>
      <div className={css.wrapper}>
        {!isTokenValid && <CloseButton className={css.close} onClick={onClose} />}

        <div className={css.top}>
          <div className={css.logoContainer}>
            <BaseImage className={css.logo} data={getImageUrl(logo.src)} alt={logo.alt} />
          </div>
          {!isTokenValid ? renderLoginForm() : !preferredNickname && renderNicknameForm()}
        </div>
        <div className={css.bottom}>
          <div className={css.chillieContainer}>
            <BaseImage className={css.chillie} data={getImageUrl(decoration)} />
          </div>
          <div className={css.skipContainer}>
            {!isTokenValid && !loginButtonTriggered && (
              <>
                <p className={css.label} {...copy.html(skipLabel)} />
                <BaseButton className={css.skipButton} onClick={onSkip}>
                  {skip}
                </BaseButton>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

View.displayName = 'LogModal_View'
