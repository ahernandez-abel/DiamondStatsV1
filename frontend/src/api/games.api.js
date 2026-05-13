import API from './axios'

export const getGames = () => {
  return API.get('/games')
}

export const getGameById = (id) => {
  return API.get(`/games/${id}`)
}

export const createGame = (data) => {
  return API.post('/games', data)
}

export const updateGame = (id, data) => {
  return API.put(`/games/${id}`, data)
}

export const deleteGame = (id) => {
  return API.delete(`/games/${id}`)
}

export const getGameStats = (gameId) => {
  return API.get(`/stats/game/${gameId}`)
}

export const savePlayerGameStats = (gameId, data) => {
  return API.post(`/stats/game/${gameId}/player`, data)
}

export const updateGameResult = (id, data) => {
  return API.patch(`/games/${id}/result`, data)
}