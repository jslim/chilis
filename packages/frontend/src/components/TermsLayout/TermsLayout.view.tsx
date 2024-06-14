import type { FC } from 'react'
import type { ControllerProps } from './TermsLayout.controller'

import classNames from 'classnames'

import css from './TermsLayout.module.scss'

import { copy } from '@/utils/copy'

import { useRefs } from '@/hooks/use-refs'

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
        {content.body.blocks.map((innerBlock, bIndex) => (
          <div className={css.block} key={`b-${bIndex}`}>
            {innerBlock.title ? <h2 className={css.blockTitle} {...copy.html(innerBlock.title)} /> : null}

            <div className={css.questions}>
              {innerBlock.questions.map((question, qIndex) => (
                <div className={css.question} key={`q-${qIndex}`}>
                  {question.title ? <h3 className={css.questionTitle} {...copy.html(question.title)} /> : null}
                  {question.paragraphs.map((paragraph, pIndex) => (
                    <p className={css.paragraph} key={`p-${pIndex}`} {...copy.html(paragraph)} />
                  ))}
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  )
}

View.displayName = 'TermsLayout_View'
