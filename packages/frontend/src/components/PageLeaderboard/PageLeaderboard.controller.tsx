import type { FC } from 'react'
import type { ApiResponse, PageProps } from '@/data/types'

import { memo, useEffect, useState } from 'react'

import { Endpoints, fetchApi } from '@/utils/fetchApi'

import { View } from './PageLeaderboard.view'

export interface ControllerProps extends PageProps<'leaderboard'> {}

// Controller (handles global state, router, data fetching, etc. Feeds props to the view component)
export const Controller: FC<ControllerProps> = memo((props) => {
  const [arrayOfPlayers, setArrayOfPlayers] = useState<ApiResponse['data']>([])
  //  const [loading, setLoading] = useState<boolean>(true) TODO: in case we need to show a loading spinner
  // const [error, setError] = useState<string | null>(null) TODO: in case we need to show an error message

  const handleApiCall = async () => {
    try {
      const response = await fetchApi(`${process.env.NEXT_PUBLIC_API_URL + Endpoints.LEADERBOARD}`, '10', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const apiResponse = response as ApiResponse

      if (Array.isArray(apiResponse) && apiResponse.length > 0) {
        console.log('Success:', apiResponse)
        setArrayOfPlayers(apiResponse)
        return apiResponse
      }

      console.error('An error ocurred:', apiResponse.message)
    } catch (error_) {
      console.error(error_)
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      const response = await handleApiCall()
      if (response && Array.isArray(response.data)) {
        setArrayOfPlayers(response.data)
      }
    }

    fetchData()
  }, [])

  return <View {...props} arrayOfPlayers={arrayOfPlayers} />
})

Controller.displayName = 'PageLeaderboard_Controller'
