import type { FC } from 'react'
import type { ControllerProps } from './ConfirmationModal.controller'

import classNames from 'classnames'

import css from './ConfirmationModal.module.scss'

import { getImageUrl } from '@/utils/basic-functions'
import { copy } from '@/utils/copy'

import { useRefs } from '@/hooks/use-refs'

import { BaseImage } from '@/components/BaseImage'
import { BaseModal } from '@/components/BaseModal'
import { CloseButton } from '@/components/CloseButton'
import { PillButton } from '@/components/PillButton'

export interface ViewProps extends ControllerProps {}

export type ViewRefs = {
  root: HTMLDivElement
}

// View (pure and testable component, receives props exclusively from the controller)
export const View: FC<ViewProps> = ({ className, handleClose, handleNavigateBack, content, logo, show }) => {
  const refs = useRefs<ViewRefs>()

  return show ? (
    <BaseModal className={classNames('ConfirmationModal', css.root, className)} onClose={handleClose}>
      <div className={css.container} ref={refs.root}>
        {logo && (
          <div className={css.logoContainer}>
            <BaseImage className={css.logo} data={getImageUrl(logo.src)} alt={logo.alt} />
          </div>
        )}
        <p className={css.description} {...copy.html(content.description)} />
        <CloseButton className={css.close} onClick={handleClose} />
        <div className={css.buttonContainer}>
          <PillButton className={css.goBack} onClick={handleNavigateBack}>
            {content.ctas.confirm}
          </PillButton>
          <PillButton className={css.stay} onClick={handleClose} theme="blue">
            {content.ctas.deny}
          </PillButton>
        </div>
      </div>
    </BaseModal>
  ) : null
}

View.displayName = 'ConfirmationModal_View'
