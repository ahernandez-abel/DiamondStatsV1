import API from './axios'

export const getTeams = () =>
  API.get('/teams')

export const getTeamById = (id) =>
  API.get(`/teams/${id}`)

export const createTeam = (data) =>
  API.post('/teams', data)

export const updateTeam = (id, data) =>
  API.put(`/teams/${id}`, data)

export const deleteTeam = (id) =>
  API.delete(`/teams/${id}`)