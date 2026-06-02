import api from './api'

export const getUsuarios = () => api.get('/usuarios')

export const getUsuarioById = (id) => api.get(`/usuarios/${id}`)

export const createUsuario = (data) => api.post('/usuarios', data)

export const deleteUsuario = (id) => api.delete(`/usuarios/${id}`)
