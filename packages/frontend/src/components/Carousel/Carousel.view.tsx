import 'swiper/css'
import 'swiper/css/pagination'

import type { ControllerProps } from './Carousel.controller'

import { type FC, useMemo, useState, useEffect } from 'react'
import classNames from 'classnames'
// import Swiper core and required modules
import { A11y, Pagination } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'

import css from './Carousel.module.scss'

import { getImageUrl } from '@/utils/basic-functions'
import { copy } from '@/utils/copy'
import { detect } from '@/utils/detect'

import { useRefs } from '@/hooks/use-refs'

import { BaseImage } from '@/components/BaseImage'

export interface ViewProps extends ControllerProps {}

export type ViewRefs = {
  root: HTMLDivElement
}

// View (pure and testable component, receives props exclusively from the controller)
export const View: FC<ViewProps> = ({ className, slides }) => {
  const refs = useRefs<ViewRefs>()
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    setIsMobile(detect.device.mobile || detect.device.tablet)
  }, [])

  const data = useMemo(() => {
    // If mobile, use the mobile image and the mobile text
    return isMobile
      ? slides.map((slide) => ({
          image: slide.imageMobile,
          title: slide.title,
          text: slide.textMobile
        }))
      : slides
  }, [isMobile, slides])

  return (
    <div className={classNames('Carousel', css.root, className)} ref={refs.root}>
      <Swiper
        pagination={{
          clickable: true
        }}
        modules={[Pagination, A11y]}
        slidesPerView="auto"
      >
        {data.map((slide, index) => (
          <SwiperSlide className={css.slide} key={index}>
            {slide.image && slide.image.src && (
              <div className={css.imageContainer}>
                <BaseImage className={css.image} data={getImageUrl(slide.image.src)} alt={slide.image?.alt} />
              </div>
            )}

            <p className={css.title} {...copy.html(slide.title)} />
            <p className={css.text} {...copy.html(slide.text)} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  )
}

View.displayName = 'Carousel_View'
