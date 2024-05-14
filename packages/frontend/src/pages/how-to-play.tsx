import type { PageHowToPlayProps } from '@/components/PageHowToPlay'
import type { GetStaticProps } from 'next'

import { CmsService } from '@/services/cms'

export const getStaticProps: GetStaticProps<PageHowToPlayProps> = async () => {
  return {
    props: {
      content: CmsService.getPageContent('howToPlay')
    }
  }
}

export { PageHowToPlay as default } from '@/components/PageHowToPlay'
