import type { FC } from 'react'
import type { ControllerProps } from './Nav.controller'

import { useImperativeHandle } from 'react'
import { useRouter } from 'next/router'
import classNames from 'classnames'
import { gsap } from 'gsap'

import css from './Nav.module.scss'

import { useRefs } from '@/hooks/use-refs'

import { BaseButton } from '@/components/BaseButton'

export type ViewHandle = {
  animateIn: () => gsap.core.Timeline
}

export interface ViewProps extends ControllerProps {}

export type ViewRefs = {
  root: HTMLDivElement
}

// View (pure and testable component, receives props exclusively from the controller)
export const View: FC<ViewProps> = ({ className, content, handleRef }) => {
  const refs = useRefs<ViewRefs>()
  const pathname = useRouter().asPath

  useImperativeHandle(handleRef, () => ({
    animateIn: () => gsap.timeline().to(refs.root.current, { duration: 0.33, opacity: 1 }, 0.33)
  }))

  return (
    <nav className={classNames('Nav', css.root, className)} ref={refs.root}>
      <div className={css.wrapper}>
        <ul className={css.ctas}>
          {content.links.map(({ path, title }, index) => (
            <>
              <li key={title}>
                <BaseButton className={css.link} href={path}>
                  {title}
                </BaseButton>
              </li>
              {index === 0 && '/'}
            </>
          ))}
        </ul>

        <ul className={css.routes}>
          <a tabIndex={0} aria-label="Skip to content" className={css.skipToContent} href="#start-of-content">
            Skip to content
          </a>
          {content.routes.map(({ path, title }) => (
            <li key={title}>
              <BaseButton
                className={classNames(css.link, css.hasBorder, {
                  [css.isActive]: pathname === path
                })}
                href={path}
              >
                {title}
              </BaseButton>
            </li>
          ))}
        </ul>
        <div />
      </div>

      <section aria-hidden="true" id="start-of-content"></section>
    </nav>
  )
}

View.displayName = 'Nav_View'
