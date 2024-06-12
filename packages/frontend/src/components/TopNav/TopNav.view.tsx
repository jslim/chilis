import type { ControllerProps } from './TopNav.controller'

import { type FC, useState } from 'react'
import classNames from 'classnames'

import css from './TopNav.module.scss'

import { routes } from '@/data/routes'

import { localStore } from '@/store'

import { useRefs } from '@/hooks/use-refs'

import { BaseButton } from '@/components/BaseButton'
import { BaseModal } from '@/components/BaseModal'

import SvgBack from '@/svgs/Back.svg'
import ChilisSvg from '@/svgs/Chilis.svg'
import SvgClose from '@/svgs/Close.svg'
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

  const handleNavigateBack = () => {
    setIsModalOpen(false)
    navigateBack()
  }

  return (
    <nav className={classNames('TopNav', css.root, className)} ref={refs.root}>
      {
        // TODO: move this to it's own component
      }
      {isModalOpen && (
        <BaseModal className={css.modal} onClose={handleClose}>
          <div className={css.container}>
            ARE YOU SURE?
            <BaseButton className={css.close} onClick={handleClose}>
              <SvgClose />
            </BaseButton>
            <div className={css.buttonContainer}>
              <BaseButton className={css.goBack} onClick={handleNavigateBack}>
                YES GO BACK
              </BaseButton>
              <BaseButton className={css.skip} onClick={handleClose}>
                NO STAY HERE
              </BaseButton>
            </div>
          </div>
        </BaseModal>
      )}
      <div className={css.wrapper}>
        {currentRoute !== routes.GAME ? (
          <BaseButton className={css.logoContainer} href={routes.HOME}>
            <ChilisSvg />
          </BaseButton>
        ) : (
          <BaseButton className={css.logoContainer} onClick={() => setIsModalOpen(true)}>
            <SvgBack />
          </BaseButton>
        )}

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
