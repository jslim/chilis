import type { PageUsOnlyProps } from '@/components/PageUsOnly'
import type { GetStaticProps } from 'next'

import { CmsService } from '@/services/cms'

export const getStaticProps: GetStaticProps<PageUsOnlyProps> = async () => {
  return {
    props: {
      content: CmsService.getPageContent('usOnly'),
      noLayout: true
    }
  }
}

export { PageUsOnly as default } from '@/components/PageUsOnly'
