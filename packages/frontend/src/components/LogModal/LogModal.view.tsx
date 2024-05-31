import type { FC } from 'react'
import type { ControllerProps } from './LogModal.controller'

import classNames from 'classnames'

import css from './LogModal.module.scss'

import { getImageUrl } from '@/utils/basic-functions'
import { copy } from '@/utils/copy'

import { useRefs } from '@/hooks/use-refs'

import { BaseButton } from '@/components/BaseButton'
import { BaseForm } from '@/components/BaseForm'
import { BaseImage } from '@/components/BaseImage'

import SvgChilis from '@/svgs/Chilis.svg'
import SvgClose from '@/svgs/Close.svg'

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
  errorMessage,
  forgotPassword,
  skipLabel,
  skip,
  decoration,
  onClose
}) => {
  const refs = useRefs<ViewRefs>()

  return (
    <div className={classNames('LogModal', css.root, className)} ref={refs.root}>
      <BaseButton className={css.close} onClick={onClose}>
        <SvgClose />
      </BaseButton>
      <div className={css.top}>
        <div className={css.logoContainer}>
          <SvgChilis />
        </div>
        <div className={css.title} {...copy.html(title)} />
        <div className={css.description} {...copy.html(description)} />

        <BaseForm
          onSubmit={function (): void {
            throw new Error('Function not implemented.')
          }}
          submitMessage={cta}
          errorMessage={errorMessage}
          isSubmitting={false}
        >
          <div className={css.fieldsContainer}>
            <input type="text" id="phone" name="phone" placeholder={phone} />
            <input type="password" id="password" name="password" placeholder={password} />
          </div>
        </BaseForm>

        <div className={css.forgotPassword}>
          <BaseButton href="/">{forgotPassword}</BaseButton>
        </div>
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
  )
}

View.displayName = 'LogModal_View'
