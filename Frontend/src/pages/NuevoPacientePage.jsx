import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../assets/css/anadirpacientes.css'
import StaffHeader from '../components/StaffHeader'
import PublicFooter from '../components/PublicFooter'
import CustomDatePicker from '../components/CustomDatePicker'
import { createPaciente, getPacientes } from '../services/pacienteService'
import { useToast } from '../context/ToastContext'

function NuevoPacientePage() {
  const navigate = useNavigate()
  const { showToast } = useToast()

  const [form, setForm] = useState({
    nombre: '',
    apellidos: '',
    dni: '',
    telefono: '',
    email: '',
    fechaNacimiento: '',
    direccion: '',
    numeroSeguridadSocial: '',
    historialClinico: '',
  })

  const [errores, setErrores] = useState({})

  const limpiarTexto = (texto) => String(texto || '').trim()
  const validarDni = (dni) => /^[0-9]{8}[A-Za-z]$/.test(dni)
  const validarTelefono = (telefono) => /^[0-9]{9}$/.test(telefono)
  const validarEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  const validarNSS = (nss) => /^[0-9]{12}$/.test(nss)

  const fechaEsValida = (fecha) => {
    if (!fecha) return false

    const fechaNacimiento = new Date(`${fecha}T00:00:00`)
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)

    return fechaNacimiento < hoy
  }

  const validarFormulario = () => {
    const nuevosErrores = {}

    if (!limpiarTexto(form.nombre)) {
      nuevosErrores.nombre = 'El nombre es obligatorio'
    } else if (limpiarTexto(form.nombre).length < 2) {
      nuevosErrores.nombre = 'El nombre debe tener al menos 2 caracteres'
    }

    if (!limpiarTexto(form.apellidos)) {
      nuevosErrores.apellidos = 'Los apellidos son obligatorios'
    } else if (limpiarTexto(form.apellidos).length < 2) {
      nuevosErrores.apellidos = 'Los apellidos deben tener al menos 2 caracteres'
    }

    if (!limpiarTexto(form.dni)) {
      nuevosErrores.dni = 'El DNI es obligatorio'
    } else if (!validarDni(form.dni)) {
      nuevosErrores.dni = 'El DNI debe tener 8 números y una letra'
    }

    if (!limpiarTexto(form.telefono)) {
      nuevosErrores.telefono = 'El teléfono es obligatorio'
    } else if (!validarTelefono(form.telefono)) {
      nuevosErrores.telefono = 'El teléfono debe tener 9 cifras'
    }

    if (!limpiarTexto(form.email)) {
      nuevosErrores.email = 'El email es obligatorio'
    } else if (!validarEmail(form.email)) {
      nuevosErrores.email = 'Introduce un email válido'
    }

    if (!form.fechaNacimiento) {
      nuevosErrores.fechaNacimiento = 'La fecha de nacimiento es obligatoria'
    } else if (!fechaEsValida(form.fechaNacimiento)) {
      nuevosErrores.fechaNacimiento = 'La fecha de nacimiento no puede ser futura'
    }

    if (!limpiarTexto(form.direccion)) {
      nuevosErrores.direccion = 'La dirección es obligatoria'
    } else if (limpiarTexto(form.direccion).length < 5) {
      nuevosErrores.direccion = 'La dirección debe tener al menos 5 caracteres'
    }

    if (!limpiarTexto(form.numeroSeguridadSocial)) {
      nuevosErrores.numeroSeguridadSocial = 'El Nº Seguridad Social es obligatorio'
    } else if (!validarNSS(form.numeroSeguridadSocial)) {
      nuevosErrores.numeroSeguridadSocial = 'El Nº Seguridad Social debe tener 12 cifras'
    }

    if (limpiarTexto(form.historialClinico).length > 1000) {
      nuevosErrores.historialClinico = 'El historial clínico no puede superar los 1000 caracteres'
    }

    setErrores(nuevosErrores)
    return Object.keys(nuevosErrores).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    let nuevoValor = value

    if (name === 'dni') {
      nuevoValor = value.toUpperCase()
    }

    if (name === 'telefono' || name === 'numeroSeguridadSocial') {
      nuevoValor = value.replace(/\D/g, '')
    }

    setForm({
      ...form,
      [name]: nuevoValor,
    })

    setErrores({
      ...errores,
      [name]: '',
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validarFormulario()) {
      showToast('Revisa los campos marcados en rojo', 'warning')
      return
    }

    try {
      const resPacientes = await getPacientes()
      const pacientes = resPacientes.data || []

      const dniExiste = pacientes.some((paciente) =>
        String(paciente.dni || '').toUpperCase().trim() ===
        String(form.dni || '').toUpperCase().trim(),
      )

      if (dniExiste) {
        setErrores((prev) => ({
          ...prev,
          dni: 'Ya existe un paciente con ese DNI',
        }))
        showToast('Ya existe un paciente con ese DNI', 'warning')
        return
      }

      const nssExiste = pacientes.some((paciente) =>
        String(paciente.numeroSeguridadSocial || '').trim() ===
        String(form.numeroSeguridadSocial || '').trim(),
      )

      if (nssExiste) {
        setErrores((prev) => ({
          ...prev,
          numeroSeguridadSocial: 'Ya existe un paciente con ese Nº Seguridad Social',
        }))
        showToast('Ya existe un paciente con ese Nº Seguridad Social', 'warning')
        return
      }

      const emailExiste = pacientes.some((paciente) =>
        String(paciente.email || '').toLowerCase().trim() ===
        String(form.email || '').toLowerCase().trim(),
      )

      if (emailExiste) {
        setErrores((prev) => ({
          ...prev,
          email: 'Ya existe un paciente con ese email',
        }))
        showToast('Ya existe un paciente con ese email', 'warning')
        return
      }

      await createPaciente({
        nombre: limpiarTexto(form.nombre),
        apellidos: limpiarTexto(form.apellidos),
        dni: limpiarTexto(form.dni).toUpperCase(),
        telefono: limpiarTexto(form.telefono),
        email: limpiarTexto(form.email).toLowerCase(),
        fechaNacimiento: form.fechaNacimiento,
        direccion: limpiarTexto(form.direccion),
        numeroSeguridadSocial: limpiarTexto(form.numeroSeguridadSocial),
        historialClinico: limpiarTexto(form.historialClinico),
      })

      showToast('Paciente añadido correctamente', 'success')
      navigate('/pacientes')
    } catch (error) {
      console.error(error)
      showToast('No se pudo crear el paciente', 'error')
    }
  }

  return (
    <>
      <StaffHeader />

      <img
        src="/img/logosescam.png"
        alt="Logo SESCAM"
        className="logo-sescam-nuevo-paciente"
      />

      <div className="contenedor-paciente">
        <h2>Añadir nuevo paciente</h2>

        <form className="ficha-paciente" onSubmit={handleSubmit}>
          <div className="dato">
            <label htmlFor="nombre-paciente">Nombre:</label>
            <input
              type="text"
              id="nombre-paciente"
              name="nombre"
              className={`input-dato ${errores.nombre ? 'input-error' : ''}`}
              placeholder="Introduce el nombre"
              value={form.nombre}
              onChange={handleChange}
            />
            {errores.nombre && <span className="mensaje-error">{errores.nombre}</span>}
          </div>

          <div className="dato">
            <label htmlFor="apellidos-paciente">Apellidos:</label>
            <input
              type="text"
              id="apellidos-paciente"
              name="apellidos"
              className={`input-dato ${errores.apellidos ? 'input-error' : ''}`}
              placeholder="Introduce los apellidos"
              value={form.apellidos}
              onChange={handleChange}
            />
            {errores.apellidos && <span className="mensaje-error">{errores.apellidos}</span>}
          </div>

          <div className="dato">
            <label htmlFor="dni-paciente">DNI:</label>
            <input
              type="text"
              id="dni-paciente"
              name="dni"
              maxLength="9"
              className={`input-dato ${errores.dni ? 'input-error' : ''}`}
              placeholder="Ej: 12345678A"
              value={form.dni}
              onChange={handleChange}
            />
            {errores.dni && <span className="mensaje-error">{errores.dni}</span>}
          </div>

          <div className="dato">
            <label htmlFor="telefono-paciente">Teléfono:</label>
            <input
              type="text"
              id="telefono-paciente"
              name="telefono"
              maxLength="9"
              className={`input-dato ${errores.telefono ? 'input-error' : ''}`}
              placeholder="Ej: 600123456"
              value={form.telefono}
              onChange={handleChange}
            />
            {errores.telefono && <span className="mensaje-error">{errores.telefono}</span>}
          </div>

          <div className="dato">
            <label htmlFor="email-paciente">Email:</label>
            <input
              type="email"
              id="email-paciente"
              name="email"
              className={`input-dato ${errores.email ? 'input-error' : ''}`}
              placeholder="Introduce el correo"
              value={form.email}
              onChange={handleChange}
            />
            {errores.email && <span className="mensaje-error">{errores.email}</span>}
          </div>

          <div className="dato">
            <label htmlFor="fecha-paciente">Fecha de nacimiento:</label>
            <CustomDatePicker
              id="fecha-paciente"
              className={`input-dato input-fecha-paciente ${errores.fechaNacimiento ? 'input-error' : ''}`}
              placeholder="Selecciona la fecha"
              value={form.fechaNacimiento}
              maxDate={new Date().toISOString().split('T')[0]}
              onChange={(valor) => {
                setForm({
                  ...form,
                  fechaNacimiento: valor,
                })

                setErrores({
                  ...errores,
                  fechaNacimiento: '',
                })
              }}
            />
            {errores.fechaNacimiento && (
              <span className="mensaje-error">{errores.fechaNacimiento}</span>
            )}
          </div>

          <div className="dato">
            <label htmlFor="direccion-paciente">Dirección:</label>
            <input
              type="text"
              id="direccion-paciente"
              name="direccion"
              className={`input-dato ${errores.direccion ? 'input-error' : ''}`}
              placeholder="Introduce la dirección"
              value={form.direccion}
              onChange={handleChange}
            />
            {errores.direccion && <span className="mensaje-error">{errores.direccion}</span>}
          </div>

          <div className="dato">
            <label htmlFor="nss-paciente">Nº Seguridad Social:</label>
            <input
              type="text"
              id="nss-paciente"
              name="numeroSeguridadSocial"
              maxLength="12"
              className={`input-dato ${errores.numeroSeguridadSocial ? 'input-error' : ''}`}
              placeholder="12 cifras"
              value={form.numeroSeguridadSocial}
              onChange={handleChange}
            />
            {errores.numeroSeguridadSocial && (
              <span className="mensaje-error">{errores.numeroSeguridadSocial}</span>
            )}
          </div>

          <div className="dato">
            <label htmlFor="historial-paciente">Historial clínico:</label>
            <textarea
              id="historial-paciente"
              name="historialClinico"
              className={`input-dato textarea-historial ${errores.historialClinico ? 'input-error' : ''}`}
              placeholder="Alergias, medicación, antecedentes u observaciones"
              value={form.historialClinico}
              maxLength="1000"
              onChange={handleChange}
            />
            {errores.historialClinico && (
              <span className="mensaje-error">{errores.historialClinico}</span>
            )}
          </div>

          <button type="submit" className="btn-confirmar-paciente">
            <img src="/img/anadirusu.png" className="icono-boton-paciente" alt="agregar" />
            Añadir paciente
          </button>
        </form>
      </div>

      <PublicFooter />
    </>
  )
}

export default NuevoPacientePage
