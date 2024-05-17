import type { PageLeaderboardProps } from '@/components/PageLeaderboard'
import type { GetStaticProps } from 'next'

import { CmsService } from '@/services/cms'

export const getStaticProps: GetStaticProps<PageLeaderboardProps> = async () => {
  return {
    props: {
      content: CmsService.getPageContent('leaderboard')
    }
  }
}

export { PageLeaderboard as default } from '@/components/PageLeaderboard'
