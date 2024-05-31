import type { FC } from 'react'
import type { ControllerProps } from './BaseForm.controller'

import classNames from 'classnames'

import css from './BaseForm.module.scss'

import { useRefs } from '@/hooks/use-refs'

import { BaseButton } from '@/components/BaseButton'

export interface ViewProps extends ControllerProps {}

export type ViewRefs = {
  root: HTMLDivElement
}

// View (pure and testable component, receives props exclusively from the controller)
export const View: FC<ViewProps> = ({
  className,
  children,
  onSubmit,
  submitMessage = 'Submit',
  hasError,
  errorMessage,
  disabled
}) => {
  const refs = useRefs<ViewRefs>()

  return (
    <div className={classNames('BaseForm', css.root, className)}>
      <div className={css.form} ref={refs.root}>
        {children}
        <BaseButton
          className={classNames(css.button, { [css.isDisabled]: disabled })}
          type="submit"
          onClick={onSubmit}
          disabled={disabled}
        >
          {submitMessage}
        </BaseButton>
      </div>
      {hasError && <div className={css.error}>{errorMessage}</div>}
    </div>
  )
}

View.displayName = 'BaseForm_View'
