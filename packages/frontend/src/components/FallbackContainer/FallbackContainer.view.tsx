import { useEffect, useState, type FC } from 'react'
import type { ControllerProps } from './FallbackContainer.controller'

import classNames from 'classnames'
import { BaseButton } from '@/components/BaseButton'
import { BaseImage } from '@/components/BaseImage'
import { useRefs } from '@/hooks/use-refs'
import { getImageUrl } from '@/utils/basic-functions'
import { copy } from '@/utils/copy'
import { detect } from '@/utils/detect'
import SvgChilis from '@/svgs/Chilis.svg'

import css from './FallbackContainer.module.scss'

export interface ViewProps extends ControllerProps {}

export type ViewRefs = {
  root: HTMLDivElement
}

// View (pure and testable component, receives props exclusively from the controller)
export const View: FC<ViewProps> = ({ className, title, image, isLarge = false, site }) => {
  const refs = useRefs<ViewRefs>()
  const [browserName, setBrowserName] = useState<string | null>(null)
  const [tooltipVisible, setTooltipVisible] = useState(false)

  useEffect(() => {
    // Set browser name based on OS
    if (detect.os.ios) {
      setBrowserName('Safari')
    } else if (detect.os.android) {
      setBrowserName('Chrome')
    }
  }, [])

  const handleCopyToClipboard = () => {
    if (site && navigator.clipboard) {
      navigator.clipboard.writeText(process.env.NEXT_PUBLIC_WEBSITE_SITE_URL ?? 'https://chilisburgertime.com/').then(
        () => {
          setTooltipVisible(true)
          setTimeout(() => {
            setTooltipVisible(false)
          }, 2000)
        },
        (error) => {
          console.error('Could not copy text:', error)
        }
      )
    }
  }

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

      {site && (
        <div className={css.buttonContainer}>
          <BaseButton className={css.button} onClick={handleCopyToClipboard}>
            {site} {browserName && `in ${browserName}`}
          </BaseButton>
          {tooltipVisible && <div className={css.tooltip}>Copied to clipboard!</div>}
        </div>
      )}
    </div>
  )
}

View.displayName = 'FallbackContainer_View'
