import type { PageContestProps } from '@/components/PageContest'
import type { GetStaticProps } from 'next'

import { CmsService } from '@/services/cms'

export const getStaticProps: GetStaticProps<PageContestProps> = async () => {
  return {
    props: {
      content: CmsService.getPageContent('contest')
    }
  }
}

export { PageContest as default } from '@/components/PageContest'
