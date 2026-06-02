import api from './api'

export const getPacientes = () => api.get('/pacientes')

export const getPacienteById = (id) => api.get(`/pacientes/${id}`)

export const createPaciente = (data) => api.post('/pacientes', data)

export const deletePaciente = (id) => api.delete(`/pacientes/${id}`)