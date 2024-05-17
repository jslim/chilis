import type { PageFaqProps } from '@/components/PageFaq'
import type { GetStaticProps } from 'next'

import { CmsService } from '@/services/cms'

export const getStaticProps: GetStaticProps<PageFaqProps> = async () => {
  return {
    props: {
      content: CmsService.getPageContent('faq')
    }
  }
}

export { PageFaq as default } from '@/components/PageFaq'
