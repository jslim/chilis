import type { PageGameProps } from '@/components/PageGame'
import type { GetStaticProps } from 'next'

import { CmsService } from '@/services/cms'

export const getStaticProps: GetStaticProps<PageGameProps> = async () => {
  return {
    props: {
      content: CmsService.getPageContent('game'),
      noLayout: true
    }
  }
}

export { PageGame as default } from '@/components/PageGame'
