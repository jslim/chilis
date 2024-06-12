import type { PageGameOverProps } from '@/components/PageGameOver'
import type { GetStaticProps } from 'next'

import { CmsService } from '@/services/cms'

export const getStaticProps: GetStaticProps<PageGameOverProps> = async () => {
  return {
    props: {
      content: CmsService.getPageContent('gameOver')
    }
  }
}

export { PageGameOver as default } from '@/components/PageGameOver'
