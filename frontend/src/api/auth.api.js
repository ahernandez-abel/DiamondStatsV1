import API from './axios'

export const loginRequest = (data) => API.post('/auth/login', data)