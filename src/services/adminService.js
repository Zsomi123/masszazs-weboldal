import { apiFetch } from './api';

// --- AUTH ---
export const loginAdmin = (credentials) => {
  return apiFetch('/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
};

// --- FOGLALÁSOK (NAPTÁR) ---
export const getAppointmentsRange = (start, end) => {
  return apiFetch(`/admin/appointments/range?start=${start}&end=${end}`);
};

export const deleteAppointment = (id) => {
  return apiFetch(`/admin/appointments/${id}`, { method: 'DELETE' });
};

// --- BLOKKOLÁSOK (KIHÚZÁSOK) ---
export const getBlocksRange = (start, end) => {
  return apiFetch(`/admin/blocks/range?start=${start}&end=${end}`);
};

export const createBlock = (blockData) => {
  return apiFetch('/admin/blocks', {
    method: 'POST',
    body: JSON.stringify(blockData),
  });
};

export const deleteBlock = (id) => {
  return apiFetch(`/admin/blocks/${id}`, { method: 'DELETE' });
};

// --- SZOLGÁLTATÁSOK (CMS) ---
export const createService = (serviceData) => {
  return apiFetch('/admin/services', {
    method: 'POST',
    body: JSON.stringify(serviceData),
  });
};

export const updateService = (id, serviceData) => {
  return apiFetch(`/admin/services/${id}`, {
    method: 'PUT',
    body: JSON.stringify(serviceData),
  });
};

export const deleteService = (id) => {
  return apiFetch(`/admin/services/${id}`, { method: 'DELETE' });
};