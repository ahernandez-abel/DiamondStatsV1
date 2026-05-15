import API from './axios'

export const getBattingLeaders = (tenantSlug) => {
  if (tenantSlug) {
    return API.get(`/public/${tenantSlug}/leaders/batting`)
  }

  return API.get('/leaders/batting')
}

export const getPitchingLeaders = (tenantSlug) => {
  if (tenantSlug) {
    return API.get(`/public/${tenantSlug}/leaders/pitching`)
  }

  return API.get('/leaders/pitching')
}

export const getFieldingLeaders = (tenantSlug) => {
  if (tenantSlug) {
    return API.get(`/public/${tenantSlug}/leaders/fielding`)
  }

  return API.get('/leaders/fielding')
}

export const getMonthlyMVP = (tenantSlug) => {
  if (tenantSlug) {
    return API.get(`/public/${tenantSlug}/leaders/mvp/monthly`)
  }

  return API.get('/leaders/mvp/monthly')
}

export const comparePlayersCommonGames = (
  playerOneId,
  playerTwoId,
  equalAb = false,
  tenantSlug = null
) => {
  const url = tenantSlug
    ? `/public/${tenantSlug}/leaders/compare/common-games`
    : '/leaders/compare/common-games'

  return API.get(url, {
    params: {
      playerOneId,
      playerTwoId,
      equalAb,
    },
  })
}