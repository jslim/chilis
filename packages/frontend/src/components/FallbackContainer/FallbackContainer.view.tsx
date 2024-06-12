import type { FC } from 'react'
import type { ControllerProps } from './FallbackContainer.controller'

import classNames from 'classnames'

import css from './FallbackContainer.module.scss'

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
export const View: FC<ViewProps> = ({ className, title, image, isLarge = false }) => {
  const refs = useRefs<ViewRefs>()

  return (
    <div
      className={classNames('FallbackContainer', css.root, className, {
        [css.isLarge]: isLarge
      })}
      ref={refs.root}
    >
      {image ? <BaseImage className={css.image} data={getImageUrl(image.src)} alt="" /> : null}
      {title ? <h1 className={css.title} {...copy.html(title, {}, 10)} /> : null}

      <div className={css.logoContainer}>
        <SvgChilis />
      </div>
    </div>
  )
}

View.displayName = 'FallbackContainer_View'
