import type { PageTermsProps } from '@/components/PageTerms'
import type { GetStaticProps } from 'next'

import { CmsService } from '@/services/cms'

export const getStaticProps: GetStaticProps<PageTermsProps> = async () => {
  return {
    props: {
      content: CmsService.getPageContent('terms')
    }
  }
}

export { PageTerms as default } from '@/components/PageTerms'
