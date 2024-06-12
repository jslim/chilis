// Import Swiper styles
import 'swiper/css'
import 'swiper/css/pagination'

import type { FC } from 'react'
import type { ControllerProps } from './Carousel.controller'

import classNames from 'classnames'
// import Swiper core and required modules
import { A11y, Pagination } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'

import css from './Carousel.module.scss'

import { getImageUrl } from '@/utils/basic-functions'
import { copy } from '@/utils/copy'

import { useRefs } from '@/hooks/use-refs'

import { BaseImage } from '@/components/BaseImage'

export interface ViewProps extends ControllerProps {}

export type ViewRefs = {
  root: HTMLDivElement
}

// View (pure and testable component, receives props exclusively from the controller)
export const View: FC<ViewProps> = ({ className, slides }) => {
  const refs = useRefs<ViewRefs>()

  return (
    <div className={classNames('Carousel', css.root, className)} ref={refs.root}>
      <Swiper
        pagination={{
          clickable: true
        }}
        modules={[Pagination, A11y]}
        slidesPerView="auto"
      >
        {slides.map((slide, index) => (
          <SwiperSlide className={css.slide} key={index}>
            <div className={css.imageContainer}>
              <BaseImage className={css.image} data={getImageUrl(slide.image.src)} alt={slide.image.alt} />
            </div>
            <p className={css.title} {...copy.html(slide.title)} />
            <p className={css.text} {...copy.html(slide.text)} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  )
}

View.displayName = 'Carousel_View'
