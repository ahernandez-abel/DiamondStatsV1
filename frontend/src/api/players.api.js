import axios from './axios'

export const getPlayers = () =>
  axios.get('/players')

export const getPlayerById = (id) =>
  axios.get(`/players/${id}`)

export const createPlayer = (player) =>
  axios.post('/players', player)

export const updatePlayer = (id, player) =>
  axios.put(`/players/${id}`, player)

export const deletePlayer = (id) =>
  axios.delete(`/players/${id}`)