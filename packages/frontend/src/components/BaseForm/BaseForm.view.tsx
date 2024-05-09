import type { FC } from 'react'
import type { ControllerProps } from './BaseForm.controller'

import classNames from 'classnames'

import css from './BaseForm.module.scss'

import { useRefs } from '@/hooks/use-refs'

import { BaseButton } from '@/components/BaseButton'

export interface ViewProps extends ControllerProps {}

export type ViewRefs = {
  root: HTMLFormElement
}

// View (pure and testable component, receives props exclusively from the controller)
export const View: FC<ViewProps> = ({
  className,
  children,
  onSubmit,
  isSubmitting,
  submitMessage = 'Submit',
  hasReset,
  resetMessage = 'Reset',
  hasError,
  errorMessage
}) => {
  const refs = useRefs<ViewRefs>()

  return (
    <div className={classNames('BaseForm', css.root, className)}>
      <form className={css.form} ref={refs.root}>
        {children}
        <BaseButton type="submit" onClick={() => onSubmit} disabled={isSubmitting}>
          {submitMessage}
        </BaseButton>
        {hasReset && <BaseButton type="reset">{resetMessage}</BaseButton>}
      </form>
      {hasError && <div className={css.error}>{errorMessage}</div>}
    </div>
  )
}

View.displayName = 'BaseForm_View'
