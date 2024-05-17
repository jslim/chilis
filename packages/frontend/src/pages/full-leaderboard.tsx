import type { PageFullLeaderboardProps } from '@/components/PageFullLeaderboard'
import type { GetStaticProps } from 'next'

import { CmsService } from '@/services/cms'

export const getStaticProps: GetStaticProps<PageFullLeaderboardProps> = async () => {
  return {
    props: {
      content: CmsService.getPageContent('fullLeaderboard')
    }
  }
}

export { PageFullLeaderboard as default } from '@/components/PageFullLeaderboard'
