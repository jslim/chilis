import type { FC } from 'react'
import type { PageHandle } from '@/data/types'
import type { ControllerProps } from './PageNotFound.controller'

import classNames from 'classnames'

import css from './PageNotFound.module.scss'

import { copy } from '@/utils/copy'

import { useRefs } from '@/hooks/use-refs'
import SvgChilis from '@/svgs/Chilis.svg'

export interface ViewProps extends ControllerProps {}

export type ViewRefs = {
  root: HTMLImageElement
  pageHandle: PageHandle
}

// View (pure and testable component, receives props exclusively from the controller)
export const View: FC<ViewProps> = ({ content }) => {
  const refs = useRefs<ViewRefs>()

  return (
    <main className={classNames('PageNotFound', css.root)} ref={refs.root}>
      <div className={css.logoContainer}>
        <SvgChilis />
      </div>
      <h1 className={css.title} {...copy.html(content.body.title)} />
    </main>
  )
}

View.displayName = 'PageNotFound_View'
