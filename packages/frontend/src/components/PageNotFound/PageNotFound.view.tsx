import type { PageHandle } from '@/data/types'
import type { ControllerProps } from './PageNotFound.controller'

import { type FC, useEffect } from 'react'
import classNames from 'classnames'
import gsap from 'gsap'

import css from './PageNotFound.module.scss'

import { routes } from '@/data/routes'

import { copy } from '@/utils/copy'

import { useRefs } from '@/hooks/use-refs'

import { BaseButton } from '@/components/BaseButton'

import SvgChilis from '@/svgs/Chilis.svg'
import Reboot from '@/svgs/Reboot.svg'

export interface ViewProps extends ControllerProps {}

export type ViewRefs = {
  root: HTMLImageElement
  pageHandle: PageHandle
}

// View (pure and testable component, receives props exclusively from the controller)
export const View: FC<ViewProps> = ({ content }) => {
  const refs = useRefs<ViewRefs>()

  useEffect(() => {
    gsap.timeline().to(refs.root.current, { opacity: 1 })
  }, [refs])

  return (
    <main className={classNames('PageNotFound', css.root)} ref={refs.root}>
      <div className={css.logoContainer}>
        <SvgChilis />
      </div>

      <div className={css.container}>
        <h1 className={css.title} {...copy.html(content.body.title)} />

        <BaseButton className={css.button} href={routes.HOME}>
          <Reboot className={css.svg} />
        </BaseButton>
      </div>
    </main>
  )
}

View.displayName = 'PageNotFound_View'
