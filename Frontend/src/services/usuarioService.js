import api from './api'

export const getUsuarios = () => api.get('/usuarios')

export const createUsuario = (usuario) => api.post('/usuarios', usuario)

export const updateUsuario = (id, usuario) => api.put(`/usuarios/${id}`, usuario)

export const deleteUsuario = (id) => api.delete(`/usuarios/${id}`)
