import type { PageNotFoundProps } from '@/components/PageNotFound'
import type { GetStaticProps } from 'next'

import { CmsService } from '@/services/cms'

export const getStaticProps: GetStaticProps<PageNotFoundProps> = async () => {
  return {
    props: {
      content: CmsService.getPageContent('notFound500'),
      noLayout: true
    }
  }
}

export { PageNotFound as default } from '@/components/PageNotFound'
