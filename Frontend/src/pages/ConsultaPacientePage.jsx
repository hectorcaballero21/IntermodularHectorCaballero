import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import StaffHeader from '../components/StaffHeader'
import PublicFooter from '../components/PublicFooter'
import { getPacienteById } from '../services/pacienteService'
import { getCitas } from '../services/citaService'
import api from '../services/api'
import { useToast } from '../context/ToastContext'
import '../assets/css/consulta.css'

function ConsultaPacientePage() {
  const { id } = useParams()
  const { showToast } = useToast()
  const [paciente, setPaciente] = useState(null)
  const [citasPaciente, setCitasPaciente] = useState([])
  const [editandoPaciente, setEditandoPaciente] = useState(false)
  const [guardandoPaciente, setGuardandoPaciente] = useState(false)
  const [formPaciente, setFormPaciente] = useState({
    nombre: '',
    apellidos: '',
    dni: '',
    email: '',
    fechaNacimiento: '',
    direccion: '',
    telefono: '',
    numeroSeguridadSocial: '',
    historialClinico: '',
  })

  const usuarioLogeado = JSON.parse(localStorage.getItem('usuario') || 'null')

  const esAdmin =
    String(usuarioLogeado?.rol || '')
      .toLowerCase()
      .trim() === 'admin'

  useEffect(() => {
    getPacienteById(id)
      .then((res) => setPaciente(res.data))
      .catch(() => setPaciente(null))

    getCitas()
      .then((res) => {
        const citasFiltradas = res.data.filter((cita) => {
          const idPacienteCita =
            cita.paciente?.id ??
            cita.paciente?.idPaciente ??
            cita.pacienteId ??
            cita.idPaciente

          return Number(idPacienteCita) === Number(id)
        })

        setCitasPaciente(citasFiltradas)
      })
      .catch(() => setCitasPaciente([]))
  }, [id])

  useEffect(() => {
    if (!paciente) return

    setFormPaciente({
      nombre: paciente.nombre || '',
      apellidos: paciente.apellidos || '',
      dni: paciente.dni || '',
      email: paciente.email || '',
      fechaNacimiento: paciente.fechaNacimiento || '',
      direccion: paciente.direccion || '',
      telefono: paciente.telefono || '',
      numeroSeguridadSocial: paciente.numeroSeguridadSocial || '',
      historialClinico: paciente.historialClinico || '',
    })
  }, [paciente])

  const citasOrdenadas = useMemo(() => {
    return [...citasPaciente].sort((a, b) => {
      const fechaA = `${a.fecha || ''} ${a.hora || ''}`
      const fechaB = `${b.fecha || ''} ${b.hora || ''}`

      return fechaB.localeCompare(fechaA)
    })
  }, [citasPaciente])

  const normalizarHora = (hora) => {
    if (!hora) return 'Sin hora'

    const partes = String(hora).split(':')

    return `${partes[0].padStart(2, '0')}:${(partes[1] || '00').padStart(2, '0')}`
  }

  const formatearFecha = (fechaISO) => {
    if (!fechaISO) return 'Sin fecha'

    const [year, month, day] = fechaISO.split('-')

    return `${day}/${month}/${year}`
  }

  const normalizarEstado = (estado) => {
    return String(estado || 'pendiente').toLowerCase()
  }

  const textoEstado = (estado) => {
    const estadoNormalizado = normalizarEstado(estado)

    if (estadoNormalizado === 'completada') return 'Completada'
    if (estadoNormalizado === 'cancelada') return 'Cancelada'

    return 'Pendiente'
  }

  const handlePacienteChange = (e) => {
    const { name, value } = e.target

    setFormPaciente((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const abrirEdicionPaciente = () => {
    if (!paciente) return

    setFormPaciente({
      nombre: paciente.nombre || '',
      apellidos: paciente.apellidos || '',
      dni: paciente.dni || '',
      email: paciente.email || '',
      fechaNacimiento: paciente.fechaNacimiento || '',
      direccion: paciente.direccion || '',
      telefono: paciente.telefono || '',
      numeroSeguridadSocial: paciente.numeroSeguridadSocial || '',
      historialClinico: paciente.historialClinico || '',
    })

    setEditandoPaciente(true)
  }

  const validarPaciente = () => {
    if (!formPaciente.nombre.trim()) {
      showToast('El nombre es obligatorio', 'warning')
      return false
    }

    if (!formPaciente.apellidos.trim()) {
      showToast('Los apellidos son obligatorios', 'warning')
      return false
    }

    if (formPaciente.dni.trim() && !/^\d{8}[A-Za-z]$/.test(formPaciente.dni.trim())) {
      showToast('El DNI debe tener 8 números y una letra', 'warning')
      return false
    }

    if (formPaciente.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formPaciente.email.trim())) {
      showToast('Introduce un email válido', 'warning')
      return false
    }

    if (formPaciente.telefono.trim() && !/^\d{9}$/.test(formPaciente.telefono.trim())) {
      showToast('El teléfono debe tener 9 números', 'warning')
      return false
    }

    if (formPaciente.numeroSeguridadSocial.trim() && !/^\d{12}$/.test(formPaciente.numeroSeguridadSocial.trim())) {
      showToast('El número de Seguridad Social debe tener 12 números', 'warning')
      return false
    }

    if (formPaciente.fechaNacimiento) {
      const hoy = new Date()
      hoy.setHours(0, 0, 0, 0)

      const fechaNacimiento = new Date(`${formPaciente.fechaNacimiento}T00:00:00`)

      if (fechaNacimiento > hoy) {
        showToast('La fecha de nacimiento no puede ser futura', 'warning')
        return false
      }
    }

    return true
  }

  const guardarPaciente = async () => {
    if (!paciente || !validarPaciente()) return

    const idPaciente = paciente.id ?? paciente.idPaciente

    const pacienteActualizado = {
      ...paciente,
      nombre: formPaciente.nombre.trim(),
      apellidos: formPaciente.apellidos.trim(),
      dni: formPaciente.dni.trim().toUpperCase(),
      email: formPaciente.email.trim(),
      fechaNacimiento: formPaciente.fechaNacimiento || null,
      direccion: formPaciente.direccion.trim(),
      telefono: formPaciente.telefono.trim(),
      numeroSeguridadSocial: formPaciente.numeroSeguridadSocial.trim(),
      historialClinico: formPaciente.historialClinico.trim(),
    }

    setGuardandoPaciente(true)

    try {
      const res = await api.put(`/pacientes/${idPaciente}`, pacienteActualizado)
      const pacienteGuardado = res.data || pacienteActualizado

      setPaciente(pacienteGuardado)
      setEditandoPaciente(false)
      showToast('Paciente actualizado correctamente', 'success')
    } catch (error) {
      console.error(error)
      showToast('No se pudo actualizar el paciente', 'error')
    }

    setGuardandoPaciente(false)
  }

  return (
    <>
      <StaffHeader />

      <img
        src="/img/logosescam.png"
        alt="Logo SESCAM"
        className="logo-sescam-consulta"
      />

      <div className="contenedor-paciente-consulta">
        <h2>Datos del paciente elegido</h2>

        {paciente ? (
          <div className="ficha-paciente-consulta">
            <div className="dato-consulta">
              <span className="label-consulta">ID:</span>
              {paciente.id ?? paciente.idPaciente}
            </div>

            <div className="dato-consulta">
              <span className="label-consulta">Nombre:</span>
              {paciente.nombre}
            </div>

            <div className="dato-consulta">
              <span className="label-consulta">Apellidos:</span>
              {paciente.apellidos}
            </div>

            <div className="dato-consulta">
              <span className="label-consulta">DNI:</span>
              {paciente.dni || 'No indicado'}
            </div>

            <div className="dato-consulta">
              <span className="label-consulta">Email:</span>
              {paciente.email || 'No indicado'}
            </div>

            <div className="dato-consulta">
              <span className="label-consulta">Fecha de nacimiento:</span>
              {paciente.fechaNacimiento || 'No indicada'}
            </div>

            <div className="dato-consulta">
              <span className="label-consulta">Domicilio:</span>
              {paciente.direccion || 'No indicado'}
            </div>

            <div className="dato-consulta">
              <span className="label-consulta">Teléfono:</span>
              {paciente.telefono || 'No indicado'}
            </div>

            <div className="dato-consulta">
              <span className="label-consulta">Nº Seguridad Social:</span>
              {paciente.numeroSeguridadSocial || 'No indicado'}
            </div>

            <div className="dato-consulta acciones-consulta-paciente">
              <span className="label-consulta">Historial clínico:</span>

              <button
                type="button"
                className="btn-historial"
                data-bs-toggle="modal"
                data-bs-target="#historialClinicoModal"
              >
                Ver historial clínico
              </button>

              {esAdmin && (
                <button
                  type="button"
                  className="btn-modificar-paciente"
                  onClick={abrirEdicionPaciente}
                >
                  Modificar paciente
                </button>
              )}
            </div>
          </div>
        ) : (
          <p className="mensaje-consulta">No se ha encontrado el paciente.</p>
        )}
      </div>

      {editandoPaciente && (
        <div className="modal-edicion-paciente-overlay">
          <div className="modal-edicion-paciente-card">
            <div className="modal-edicion-paciente-header">
              <h5>Modificar paciente</h5>

              <button
                type="button"
                onClick={() => setEditandoPaciente(false)}
              >
                ×
              </button>
            </div>

            <div className="modal-edicion-paciente-body">
              <label>Nombre:</label>
              <input
                type="text"
                name="nombre"
                value={formPaciente.nombre}
                onChange={handlePacienteChange}
              />

              <label>Apellidos:</label>
              <input
                type="text"
                name="apellidos"
                value={formPaciente.apellidos}
                onChange={handlePacienteChange}
              />

              <label>DNI:</label>
              <input
                type="text"
                name="dni"
                maxLength="9"
                value={formPaciente.dni}
                onChange={handlePacienteChange}
              />

              <label>Email:</label>
              <input
                type="email"
                name="email"
                value={formPaciente.email}
                onChange={handlePacienteChange}
              />

              <label>Fecha de nacimiento:</label>
              <input
                type="date"
                name="fechaNacimiento"
                value={formPaciente.fechaNacimiento}
                onChange={handlePacienteChange}
              />

              <label>Domicilio:</label>
              <input
                type="text"
                name="direccion"
                value={formPaciente.direccion}
                onChange={handlePacienteChange}
              />

              <label>Teléfono:</label>
              <input
                type="text"
                name="telefono"
                maxLength="9"
                value={formPaciente.telefono}
                onChange={handlePacienteChange}
              />

              <label>Nº Seguridad Social:</label>
              <input
                type="text"
                name="numeroSeguridadSocial"
                maxLength="12"
                value={formPaciente.numeroSeguridadSocial}
                onChange={handlePacienteChange}
              />

              <label>Historial clínico:</label>
              <textarea
                name="historialClinico"
                rows="4"
                maxLength="2000"
                value={formPaciente.historialClinico}
                onChange={handlePacienteChange}
              />
            </div>

            <div className="modal-edicion-paciente-footer">
              <button
                type="button"
                className="btn-cancelar-edicion-paciente"
                onClick={() => setEditandoPaciente(false)}
              >
                Cancelar
              </button>

              <button
                type="button"
                className="btn-guardar-edicion-paciente"
                disabled={guardandoPaciente}
                onClick={guardarPaciente}
              >
                {guardandoPaciente ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="modal fade" id="historialClinicoModal" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content historial-modal-content">
            <div className="modal-header historial-modal-header">
              <h5 className="modal-title">Historial clínico</h5>

              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
              ></button>
            </div>

            <div className="modal-body historial-modal-body">
              <section className="historial-manual">
                <h5>Observaciones clínicas</h5>

                <p>
                  {paciente?.historialClinico || 'Sin historial clínico registrado.'}
                </p>
              </section>

              <hr />

              <section className="historial-citas">
                <h5 className="titulo-historial-citas">
                  Historial de citas del paciente
                </h5>

                {citasOrdenadas.length === 0 ? (
                  <p>No hay citas registradas para este paciente.</p>
                ) : (
                  <div className="historial-citas-lista">
                    {citasOrdenadas.map((cita) => (
                      <div
                        key={cita.id ?? cita.idCita}
                        className="historial-cita-item"
                      >
                        <strong>
                          {formatearFecha(cita.fecha)} - {normalizarHora(cita.hora)}
                        </strong>

                        <span>
                          Motivo: {cita.motivo || 'Sin motivo indicado'}
                        </span>

                        <span>
                          Estado:{' '}
                          <span className={`estado-badge estado-${normalizarEstado(cita.estado)}`}>
                            {textoEstado(cita.estado)}
                          </span>
                        </span>

                        {normalizarEstado(cita.estado) === 'completada' && (
                          <>
                            <span>
                              Diagnóstico: {cita.diagnostico || 'No indicado'}
                            </span>

                            <span>
                              Tratamiento: {cita.tratamiento || 'No indicado'}
                            </span>
                          </>
                        )}

                        <span>
                          Médico:{' '}
                          {cita.usuario
                            ? `${cita.usuario.nombre} ${cita.usuario.apellidos ?? ''}`
                            : 'No disponible'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          </div>
        </div>
      </div>

      <PublicFooter />
    </>
  )
}

export default ConsultaPacientePage
