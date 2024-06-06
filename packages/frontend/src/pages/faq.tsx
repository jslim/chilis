import type { PageFaqProps } from '@/components/PageFaq'
import type { GetStaticProps } from 'next'

import { CmsService } from '@/services/cms'

export const getStaticProps: GetStaticProps<PageFaqProps> = async () => {
  return {
    props: {
      content: CmsService.getPageContent('faq') // because is same structure, query is the same as FAQs
    }
  }
}

export { PageFaq as default } from '@/components/PageFaq'
