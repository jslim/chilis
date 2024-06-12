import type { FC } from 'react'
import type { ControllerProps } from './TermsLayout.controller'

import classNames from 'classnames'

import css from './TermsLayout.module.scss'

import { copy } from '@/utils/copy'

import { useRefs } from '@/hooks/use-refs'

import SvgThreeSquares from '@/svgs/ThreeSquares.svg'
import SvgTwoSquares from '@/svgs/TwoSquares.svg'

export interface ViewProps extends ControllerProps {}

export type ViewRefs = {
  root: HTMLDivElement
}

// View (pure and testable component, receives props exclusively from the controller)
export const View: FC<ViewProps> = ({ className, content }) => {
  const refs = useRefs<ViewRefs>()

  return (
    <div className={classNames('TermsLayout', css.root, className)} ref={refs.root}>
      <section className={css.titleContainer}>
        <h1 className={css.title} {...copy.html(content.body.title)} />
      </section>
      <section className={css.content}>
        {content.body.blocks.map((innerBlock, index) => (
          <div key={index} {...copy.html(innerBlock)} />
        ))}
      </section>
    </div>
  )
}

View.displayName = 'TermsLayout_View'
