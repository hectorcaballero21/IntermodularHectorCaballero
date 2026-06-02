import api from './api'

export const getAlertas = () => api.get('/alertas')

export const getAlertaById = (id) => api.get(`/alertas/${id}`)

export const createAlerta = (alerta) => api.post('/alertas', alerta)

export const updateAlerta = (id, alerta) => api.put(`/alertas/${id}`, alerta)

export const deleteAlerta = (id) => api.delete(`/alertas/${id}`)
