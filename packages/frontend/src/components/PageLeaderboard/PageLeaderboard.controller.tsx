import type { FC } from 'react'
import type { ApiResponse, PageProps, Player } from '@/data/types'

import { memo, useCallback, useEffect, useState } from 'react'

import { localState } from '@/store'

import { Endpoints, fetchApi } from '@/utils/fetchApi'

import { View } from './PageLeaderboard.view'

export interface ControllerProps extends PageProps<'leaderboard'> {}

// Controller (handles global state, router, data fetching, etc. Feeds props to the view component)
export const Controller: FC<ControllerProps> = memo((props) => {
  const [arrayOfPlayers, setArrayOfPlayers] = useState<ApiResponse['data']>([])
  const [currentPlayer, setCurrentPlayer] = useState<Player>()
  const userToken = localState().user.accessToken

  const handleApiCall = useCallback(async () => {
    try {
      const response = await fetchApi(`${process.env.NEXT_PUBLIC_API_URL + Endpoints.LEADERBOARD}`, '10', {
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

      if (response && response.user && response.user.nickname) {
        setCurrentPlayer(response.user)
      }
    }

    fetchData()
  }, [handleApiCall])

  return <View {...props} arrayOfPlayers={arrayOfPlayers} currentPlayer={currentPlayer} />
})

Controller.displayName = 'PageLeaderboard_Controller'
