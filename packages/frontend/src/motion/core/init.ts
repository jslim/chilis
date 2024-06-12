import { gsap } from 'gsap'
import CustomEase from 'gsap/dist/CustomEase'
import ScrollToPlugin from 'gsap/dist/ScrollToPlugin'

import { customEases, favouriteEases } from '../eases/eases'

export function initGsap() {
  if (typeof window === 'undefined') return

  gsap.registerPlugin(CustomEase, ScrollToPlugin)

  gsap.defaults({ ease: 'none', duration: 0.667 })

  favouriteEases.forEach((ease) => {
    CustomEase.create(ease.name, ease.ease)
  })

  customEases.forEach((ease) => {
    CustomEase.create(ease.name, ease.ease)
  })

  gsap.registerEffect(require('@/motion/effects/fade/fadeIn/fadeIn').default)
}
