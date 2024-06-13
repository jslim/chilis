import type { ControllerProps } from './TopNav.controller'

import { type FC, useCallback, useState } from 'react'
import classNames from 'classnames'

import css from './TopNav.module.scss'

import { routes } from '@/data/routes'

import { localStore } from '@/store'

import { useRefs } from '@/hooks/use-refs'

import { BaseButton } from '@/components/BaseButton'
import { BaseModal } from '@/components/BaseModal'
import { CloseButton } from '@/components/CloseButton'
import { PillButton } from '@/components/PillButton'

import SvgBack from '@/svgs/Back.svg'
import ChilisSvg from '@/svgs/Chilis.svg'
import SvgLoginLogout from '@/svgs/LoginLogout.svg'

export interface ViewProps extends ControllerProps {}

export type ViewRefs = {
  root: HTMLDivElement
}

// View (pure and testable component, receives props exclusively from the controller)
export const View: FC<ViewProps> = ({ className, text, onClick, isDisabled }) => {
  const refs = useRefs<ViewRefs>()
  const currentRoute = localStore((state) => state.navigation.pathname)
  const navigateBack = localStore((state) => state.navigation.navigateBack)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleClose = () => {
    setIsModalOpen(false)
  }

  const handleNavigateBack = useCallback(() => {
    setIsModalOpen(false)
    navigateBack()
  }, [navigateBack])

  const renderBackButtonSlot = useCallback(() => {
    switch (currentRoute) {
      // @NOTE: Back button with modal confirmation
      case routes.GAME: {
        return (
          <BaseButton className={css.logoContainer} onClick={() => setIsModalOpen(true)}>
            <SvgBack />
          </BaseButton>
        )
      }
      // @NOTE: Back button with back router navigation
      case routes.TERMS:
      case routes.FAQ:
      case routes.FULL_LEADERBOARD: {
        return (
          <BaseButton className={css.logoContainer} onClick={handleNavigateBack}>
            <SvgBack />
          </BaseButton>
        )
      }
      // @NOTE: Logo button pointing to home [chillis logo]
      default: {
        return (
          <BaseButton className={css.logoContainer} href={routes.HOME}>
            <ChilisSvg />
          </BaseButton>
        )
      }
    }
  }, [currentRoute, handleNavigateBack])

  return (
    <nav className={classNames('TopNav', css.root, className)} ref={refs.root}>
      {
        // TODO: move this to it's own component
      }
      {isModalOpen && (
        <BaseModal className={css.modal} onClose={handleClose}>
          <div className={css.container}>
            <p className={css.description}>ARE YOU SURE?</p>
            <CloseButton className={css.close} onClick={handleClose} />
            <div className={css.buttonContainer}>
              <PillButton className={css.goBack} onClick={handleNavigateBack}>
                YES GO BACK
              </PillButton>
              <PillButton className={css.stay} onClick={handleClose} theme="blue">
                NO STAY HERE
              </PillButton>
            </div>
          </div>
        </BaseModal>
      )}
      <div className={css.wrapper}>
        {renderBackButtonSlot()}

        <BaseButton className={css.button} onClick={onClick} disabled={isDisabled}>
          {text}
          <div className={css.iconContainer}>
            <SvgLoginLogout />
          </div>
        </BaseButton>
      </div>
    </nav>
  )
}

View.displayName = 'TopNav_View'
