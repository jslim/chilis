export enum Endpoints {
  USER = '/user/',
  LEADERBOARD = '/leaderboard/',
  GAME = '/game/'
}

export const fetchApi = async <T>(url: string, params?: string, options: RequestInit = {}): Promise<T> => {
  let completeUrl: string = url
  if (params) {
    completeUrl += `?${params}`
  }
  const response = await fetch(completeUrl, options)

  if (!response.ok) {
    console.error(`Error! Status: ${response.status}`)
  }

  const data: T = await response.json()

  return data
}
