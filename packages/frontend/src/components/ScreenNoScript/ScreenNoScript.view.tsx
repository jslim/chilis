import type { FC } from 'react'
import type { ControllerProps } from './ScreenNoScript.controller'

import classNames from 'classnames'

import css from './ScreenNoScript.module.scss'

import { FallbackContainer } from '@/components/FallbackContainer'

export interface ViewProps extends ControllerProps {}

// View (pure and testable component, receives props exclusively from the controller)
export const View: FC<ViewProps> = ({ className, content }) => {
  const Component = process.env.STORYBOOK ? 'div' : 'noscript'

  return (
    <Component className={classNames('ScreenNoScript', css.root, className)}>
      <FallbackContainer title={content.description} image={content.image} />
    </Component>
  )
}

View.displayName = 'ScreenNoScript_View'
