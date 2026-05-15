import API from './axios';

export const getPublicHome = (tenantSlug) => {
  return API.get(`/public/${tenantSlug}/home`);
};