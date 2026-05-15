import axios from './axios'

export const getPlayers = (tenantSlug) => {
  if (tenantSlug) {
    return axios.get(`/public/${tenantSlug}/players`)
  }

  return axios.get('/players')
}

export const getPlayerById = (id, tenantSlug) => {
  if (tenantSlug) {
    return axios.get(`/public/${tenantSlug}/players/${id}`)
  }

  return axios.get(`/players/${id}`)
}

export const createPlayer = (player) =>
  axios.post('/players', player)

export const updatePlayer = (id, player) =>
  axios.put(`/players/${id}`, player)

export const deletePlayer = (id) =>
  axios.delete(`/players/${id}`)