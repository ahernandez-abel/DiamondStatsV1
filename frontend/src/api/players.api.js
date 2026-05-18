import axios from './axios'

const buildQueryParams = (params = {}) => {
  const query = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (
      value !== undefined &&
      value !== null &&
      value !== ''
    ) {
      query.append(key, value)
    }
  })

  const queryString = query.toString()

  return queryString ? `?${queryString}` : ''
}

export const getPlayers = (tenantSlug, params = {}) => {
  const queryString = buildQueryParams(params)

  if (tenantSlug) {
    return axios.get(`/public/${tenantSlug}/players${queryString}`)
  }

  return axios.get(`/players${queryString}`)
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