import type { FC } from 'react'
import type { ControllerProps } from './PageUnsupported.controller'

import classNames from 'classnames'

import css from './PageUnsupported.module.scss'

import { getImageUrl } from '@/utils/basic-functions'
import { copy } from '@/utils/copy'

import { useRefs } from '@/hooks/use-refs'

import { BaseImage } from '@/components/BaseImage'

import SvgChilis from '@/svgs/Chilis.svg'

export interface ViewProps extends ControllerProps {}

export type ViewRefs = {
  root: HTMLDivElement
}

// View (pure and testable component, receives props exclusively from the controller)
export const View: FC<ViewProps> = ({ content }) => {
  const refs = useRefs<ViewRefs>()

  return (
    <main className={classNames('PageUnsupported', css.root)} ref={refs.root}>
      <BaseImage className={css.background} data={getImageUrl(content.body.image.src)} alt="" />
      <div className={css.container}>
        <div className={css.heroContainer}>
          <BaseImage className={css.hero} data={getImageUrl(content.body.hero.src)} alt={content.body.hero.alt} />
        </div>
        <h1 className={css.title} {...copy.html(content.body.title)} />
      </div>
      <div className={css.logoContainer}>
        <SvgChilis />
      </div>
    </main>
  )
}

View.displayName = 'PageUnsupported_View'
