import API from './axios'

export const getBattingLeaders = () => {
  return API.get('/leaders/batting')
}

export const getPitchingLeaders = () => {
  return API.get('/leaders/pitching')
}

export const getFieldingLeaders = () => {
  return API.get('/leaders/fielding')
}

export const getMonthlyMVP = () => {
  return API.get('/leaders/mvp/monthly')
}