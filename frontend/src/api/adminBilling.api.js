import api from './axios';

export const getMyBilling = async () => {
  return await api.get('/admin/billing');
};