import type { FC } from 'react'
import type { ApiResponse, PageProps } from '@/data/types'

import { memo, useCallback, useEffect, useState } from 'react'

import { localState } from '@/store'

import { Endpoints, fetchApi } from '@/utils/fetch-api'

import { View } from './PageFullLeaderboard.view'

export interface ControllerProps extends PageProps<'fullLeaderboard'> {}

// Controller (handles global state, router, data fetching, etc. Feeds props to the view component)
export const Controller: FC<ControllerProps> = memo((props) => {
  const [arrayOfPlayers, setArrayOfPlayers] = useState<ApiResponse['data']>([])
  // const [loading, setLoading] = useState<boolean>(true) TODO: in case we need to show a loading spinner
  // const [error, setError] = useState<string | null>(null) TODO: in case we need to show an error message
  const userToken = localState().user.accessToken

  const handleApiCall = useCallback(async () => {
    try {
      const response = await fetchApi(`${process.env.NEXT_PUBLIC_API_URL + Endpoints.LEADERBOARD}`, '100', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userToken}`
        }
      })

      const apiResponse = response as ApiResponse

      if (Array.isArray(apiResponse.leaderboard)) {
        if (apiResponse.leaderboard.length > 0) {
          return apiResponse
        }
        console.error('Leaderboard is empty:', apiResponse)
      } else {
        console.error('An error occurred:', apiResponse)
      }
    } catch (error_) {
      console.error(error_)
    }
  }, [userToken])

  useEffect(() => {
    const fetchData = async () => {
      const response = await handleApiCall()
      if (response && Array.isArray(response.leaderboard) && response.leaderboard.length > 0) {
        setArrayOfPlayers(response.leaderboard)
      }
    }

    fetchData()
  }, [handleApiCall])

  return <View {...props} arrayOfPlayers={arrayOfPlayers} />
})

Controller.displayName = 'PageFullLeaderboard_Controller'
