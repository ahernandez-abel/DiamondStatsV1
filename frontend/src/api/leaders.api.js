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

export const comparePlayersCommonGames = (
  playerOneId,
  playerTwoId,
  equalAb = false
) => {
  return API.get('/leaders/compare/common-games', {
    params: {
      playerOneId,
      playerTwoId,
      equalAb,
    },
  })
}