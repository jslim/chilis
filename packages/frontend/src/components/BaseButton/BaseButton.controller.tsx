import type { FocusEvent, KeyboardEvent, MouseEvent, ReactNode } from 'react'
import type { GAEvent } from '@/services/analytics'
import type { UrlObject } from 'node:url'

import { forwardRef, memo } from 'react'

import { View } from './BaseButton.view'

export interface ControllerProps {
  children: ReactNode
  className?: string
  download?: boolean
  disabled?: boolean
  tabIndex?: number
  subject?: string
  target?: string
  title?: string
  href?: string | UrlObject
  link?: string | UrlObject
  role?: string
  rel?: string
  id?: string
  type?: 'submit' | 'reset' | 'button'
  gaEvent?: GAEvent
  onClick?: (event?: MouseEvent<HTMLElement>) => void
  onFocus?: (event?: FocusEvent<HTMLElement>) => void
  onKeyDown?: (event?: KeyboardEvent<HTMLElement>) => void
  onMouseEnter?: (event?: MouseEvent<HTMLElement>) => void
  onMouseLeave?: (event?: MouseEvent<HTMLElement>) => void
  'aria-label'?: string
  'data-text'?: string
}

// Controller (handles global state, router, data fetching, etc. Feeds props to the view component)
export const Controller = memo(
  forwardRef<HTMLElement, ControllerProps>((props, ref) => {
    return <View {...props} ref={ref} />
  })
)
