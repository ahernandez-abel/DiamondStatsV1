import API from './axios'

export const getBattingStats = () => {
  return API.get('/stats/batting')
}

export const createBattingStats = (data) => {
  return API.post('/stats/batting', data)
}

export const getPitchingStats = () => {
  return API.get('/stats/pitching')
}

export const createPitchingStats = (data) => {
  return API.post('/stats/pitching', data)
}

export const getFieldingStats = () => {
  return API.get('/stats/fielding')
}

export const createFieldingStats = (data) => {
  return API.post('/stats/fielding', data)
}

export const getGameStats = (gameId) => {
  return API.get(`/stats/game/${gameId}`)
}

export const savePlayerGameStats = (gameId, data) => {
  return API.post(`/stats/game/${gameId}/player`, data)
}

export const getPlayerGameStats = (gameId, playerId) => {
  return API.get(`/stats/games/${gameId}/player/${playerId}`)
}