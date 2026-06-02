import api from './api'

export const getMensajesContacto = () => api.get('/mensajes-contacto')

export const createMensajeContacto = (mensaje) => api.post('/mensajes-contacto', mensaje)

export const marcarMensajeComoLeido = (id) => api.put(`/mensajes-contacto/${id}/leido`)

export const responderMensajeContacto = (id, respuesta) => api.put(`/mensajes-contacto/${id}/responder`, respuesta)

export const deleteMensajeContacto = (id) => api.delete(`/mensajes-contacto/${id}`)
