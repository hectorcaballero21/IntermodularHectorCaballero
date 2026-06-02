import { useEffect, useMemo, useState } from 'react'
import '../assets/css/vercitas.css'
import StaffHeader from '../components/StaffHeader'
import PublicFooter from '../components/PublicFooter'
import CustomDatePicker from '../components/CustomDatePicker'
import { getCitas, updateCita } from '../services/citaService'
import { useToast } from '../context/ToastContext'

function CitasPage() {
  const toastContext = useToast()
  const showToast = toastContext?.showToast || (() => {})

  const [citas, setCitas] = useState([])
  const [fecha, setFecha] = useState('')
  const [busquedaPaciente, setBusquedaPaciente] = useState('')
  const [citaSeleccionada, setCitaSeleccionada] = useState(null)
  const [editando, setEditando] = useState(false)
  const [paginaActual, setPaginaActual] = useState(1)

  const citasPorPagina = 5

  const [formEditar, setFormEditar] = useState({
    fecha: '',
    hora: '',
    motivo: '',
    estado: 'pendiente',
    diagnostico: '',
    tratamiento: '',
  })

  const usuarioLogeado = JSON.parse(localStorage.getItem('usuario') || 'null')

  const idUsuarioLogeado =
    usuarioLogeado?.id ??
    usuarioLogeado?.idUsuario

  useEffect(() => {
    let activo = true

    getCitas()
      .then((res) => {
        if (activo) setCitas(res.data || [])
      })
      .catch(() => {
        if (activo) setCitas([])
      })

    return () => {
      activo = false
    }
  }, [])

  useEffect(() => {
    setPaginaActual(1)
  }, [fecha, busquedaPaciente])

  const formatearFecha = (fechaISO) => {
    if (!fechaISO) return 'Todas las fechas'

    const partes = fechaISO.split('-')
    if (partes.length !== 3) return fechaISO

    const [year, month, day] = partes
    return `${day}/${month}/${year}`
  }

  const normalizarHora = (hora) => {
    if (!hora) return ''

    const partes = String(hora).split(':')
    const horas = partes[0] || '00'
    const minutos = partes[1] || '00'

    return `${horas.padStart(2, '0')}:${minutos.padStart(2, '0')}`
  }

  const calcularSalida = (hora) => {
    if (!hora) return ''

    const fechaBase = new Date(`2000-01-01T${normalizarHora(hora)}:00`)
    fechaBase.setMinutes(fechaBase.getMinutes() + 15)

    return `${String(fechaBase.getHours()).padStart(2, '0')}:${String(fechaBase.getMinutes()).padStart(2, '0')}`
  }

  const obtenerEstado = (estado) => {
    const estadoNormalizado = String(estado || 'pendiente').toLowerCase()

    if (estadoNormalizado === 'completada') {
      return {
        texto: 'Completada',
        clase: 'estado-completada',
      }
    }

    if (estadoNormalizado === 'cancelada') {
      return {
        texto: 'Cancelada',
        clase: 'estado-cancelada',
      }
    }

    return {
      texto: 'Pendiente',
      clase: 'estado-pendiente',
    }
  }

  const filtradas = useMemo(() => {
    const textoBusqueda = busquedaPaciente.toLowerCase().trim()

    const resultado = citas.filter((cita) => {
      const idUsuarioCita =
        cita.usuario?.id ??
        cita.usuario?.idUsuario ??
        cita.usuarioId ??
        cita.idUsuario

      const coincideMedico =
        Number(idUsuarioCita) === Number(idUsuarioLogeado)

      const coincideFecha = fecha
        ? cita.fecha === fecha
        : true

      const nombrePaciente = cita.paciente
        ? `${cita.paciente.nombre ?? ''} ${cita.paciente.apellidos ?? ''}`
            .toLowerCase()
            .trim()
        : ''

      const coincidePaciente = textoBusqueda
        ? nombrePaciente.includes(textoBusqueda)
        : true

      return coincideMedico && coincideFecha && coincidePaciente
    })

    return [...resultado].sort((a, b) => {
      const fechaA = a.fecha || ''
      const fechaB = b.fecha || ''
      const horaA = a.hora || '00:00'
      const horaB = b.hora || '00:00'

      return `${fechaA} ${horaA}`.localeCompare(`${fechaB} ${horaB}`)
    })
  }, [citas, fecha, busquedaPaciente, idUsuarioLogeado])

  const totalPaginas = Math.max(1, Math.ceil(filtradas.length / citasPorPagina))

  const citasPagina = useMemo(() => {
    const inicio = (paginaActual - 1) * citasPorPagina
    const fin = inicio + citasPorPagina

    return filtradas.slice(inicio, fin)
  }, [filtradas, paginaActual])

  useEffect(() => {
    if (paginaActual > totalPaginas) {
      setPaginaActual(totalPaginas)
    }
  }, [paginaActual, totalPaginas])

  const seleccionarCita = (cita) => {
    setCitaSeleccionada(cita)
    setEditando(false)
  }

  const prepararEdicion = () => {
    if (!citaSeleccionada) return

    setFormEditar({
      fecha: citaSeleccionada.fecha || '',
      hora: normalizarHora(citaSeleccionada.hora),
      motivo: citaSeleccionada.motivo || '',
      estado: citaSeleccionada.estado || 'pendiente',
      diagnostico: citaSeleccionada.diagnostico || '',
      tratamiento: citaSeleccionada.tratamiento || '',
    })

    setEditando(true)
  }

  const cancelarEdicion = () => {
    setEditando(false)
  }

  const handleEditarChange = (e) => {
    const { name, value } = e.target

    setFormEditar((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const guardarCambios = async () => {
    if (!citaSeleccionada) return

    if (!formEditar.fecha || !formEditar.hora) {
      showToast('La fecha y la hora son obligatorias', 'warning')
      return
    }

    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)

    const fechaSeleccionada = new Date(`${formEditar.fecha}T00:00:00`)
    const fechaOriginal = citaSeleccionada.fecha || ''
    const fechaHaCambiado = formEditar.fecha !== fechaOriginal

    if (fechaHaCambiado && fechaSeleccionada < hoy) {
      showToast('No puedes asignar fechas pasadas', 'warning')
      return
    }

    const [horaSeleccionada] = formEditar.hora.split(':').map(Number)

    if (horaSeleccionada < 10 || horaSeleccionada >= 14) {
      showToast('Las citas deben estar entre las 10:00 y las 14:00', 'warning')
      return
    }

    if (!formEditar.motivo.trim()) {
      showToast('Debes introducir un motivo', 'warning')
      return
    }

    if (formEditar.motivo.trim().length < 5) {
      showToast('El motivo debe tener al menos 5 caracteres', 'warning')
      return
    }

    if (formEditar.motivo.trim().length > 250) {
      showToast('El motivo no puede superar los 250 caracteres', 'warning')
      return
    }

    if (formEditar.estado === 'completada') {
      if (!formEditar.diagnostico.trim()) {
        showToast('Debes introducir un diagnóstico', 'warning')
        return
      }

      if (!formEditar.tratamiento.trim()) {
        showToast('Debes introducir un tratamiento', 'warning')
        return
      }
    }

    const id = citaSeleccionada.id ?? citaSeleccionada.idCita

    const idUsuarioActual =
      citaSeleccionada.usuario?.id ??
      citaSeleccionada.usuario?.idUsuario

    const conflicto = citas.find((cita) => {
      const citaId = cita.id ?? cita.idCita

      if (Number(citaId) === Number(id)) return false

      const idUsuarioCita =
        cita.usuario?.id ??
        cita.usuario?.idUsuario

      return (
        Number(idUsuarioCita) === Number(idUsuarioActual) &&
        cita.fecha === formEditar.fecha &&
        normalizarHora(cita.hora) === normalizarHora(formEditar.hora)
      )
    })

    if (conflicto) {
      showToast('Ya existe otra cita para esa fecha y hora', 'warning')
      return
    }

    const citaActualizada = {
      ...citaSeleccionada,
      fecha: formEditar.fecha,
      hora: formEditar.hora,
      motivo: formEditar.motivo.trim(),
      estado: formEditar.estado,
      diagnostico:
        formEditar.estado === 'completada'
          ? formEditar.diagnostico.trim()
          : '',
      tratamiento:
        formEditar.estado === 'completada'
          ? formEditar.tratamiento.trim()
          : '',
      paciente: citaSeleccionada.paciente,
      usuario: citaSeleccionada.usuario,
    }

    try {
      const res = await updateCita(id, citaActualizada)
      const nuevaCita = res.data || citaActualizada

      setCitas((prev) =>
        prev.map((cita) =>
          Number(cita.id ?? cita.idCita) === Number(id)
            ? nuevaCita
            : cita,
        ),
      )

      setCitaSeleccionada(nuevaCita)
      setEditando(false)
      showToast('Cita actualizada correctamente', 'success')
    } catch (error) {
      console.error(error)
      showToast('No se pudo actualizar la cita', 'error')
    }
  }

  return (
    <>
      <StaffHeader />

      <img
        src="/img/logosescam.png"
        alt="Logo SESCAM"
        className="logo-sescam-citas"
      />

      <main className="citas-page">
        <section className="selector-fecha">
          <h2>Selecciona una fecha</h2>

          <label htmlFor="fecha-cita" className="visually-hidden">
            Fecha de la cita
          </label>

          <CustomDatePicker
            id="fecha-cita"
            className="fecha-input"
            placeholder="Selecciona una fecha"
            value={fecha}
            onChange={(valor) => {
              setFecha(valor)
              setPaginaActual(1)
            }}
          />

          <button
            type="button"
            className="btn-limpiar-fecha"
            onClick={() => {
              setFecha('')
              setPaginaActual(1)
            }}
          >
            Ver todas
          </button>

          <input
            type="text"
            className="busqueda-paciente-input"
            placeholder="Buscar paciente..."
            value={busquedaPaciente}
            onChange={(e) => setBusquedaPaciente(e.target.value)}
          />
        </section>

        <section className="tabla-citas-fecha">
          <div className="cabecera-tabla-citas">
            <h3>Citas - {formatearFecha(fecha)}</h3>
            <span>{filtradas.length} cita(s)</span>
          </div>

          <div className="tabla-scroll-citas">
            <table className="table table-bordered tabla-hoy tabla-citas-mejorada">
              <thead className="table-dark">
                <tr>
                  <th>Nombre</th>
                  <th>Hora Entrada</th>
                  <th>Hora Salida</th>
                  <th>Estado</th>
                  <th>ID</th>
                </tr>
              </thead>

              <tbody>
                {filtradas.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="sin-citas">
                      No hay citas para la búsqueda seleccionada
                    </td>
                  </tr>
                ) : (
                  citasPagina.map((cita) => {
                    const estado = obtenerEstado(cita.estado)
                    const nombrePaciente = cita.paciente
                      ? `${cita.paciente.nombre} ${cita.paciente.apellidos ?? ''}`
                      : 'Paciente'

                    return (
                      <tr
                        key={cita.id ?? cita.idCita}
                        className="fila-cita-clickable"
                        data-bs-toggle="modal"
                        data-bs-target="#detalleCitaModal"
                        onClick={() => seleccionarCita(cita)}
                      >
                        <td title={nombrePaciente}>{nombrePaciente}</td>
                        <td>{normalizarHora(cita.hora)}</td>
                        <td>{calcularSalida(cita.hora)}</td>
                        <td>
                          <span className={`estado-badge ${estado.clase}`}>
                            {estado.texto}
                          </span>
                        </td>
                        <td>{cita.id ?? cita.idCita}</td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="paginacion-citas">
            <button
              type="button"
              disabled={paginaActual === 1}
              onClick={() => setPaginaActual((prev) => Math.max(1, prev - 1))}
            >
              Anterior
            </button>

            <label htmlFor="selector-pagina-citas">Página</label>

            <select
              id="selector-pagina-citas"
              className="selector-pagina-citas"
              value={paginaActual}
              onChange={(e) => setPaginaActual(Number(e.target.value))}
            >
              {Array.from({ length: totalPaginas }, (_, index) => (
                <option key={index + 1} value={index + 1}>
                  {index + 1}
                </option>
              ))}
            </select>

            <span>de {totalPaginas}</span>

            <button
              type="button"
              disabled={paginaActual === totalPaginas}
              onClick={() => setPaginaActual((prev) => Math.min(totalPaginas, prev + 1))}
            >
              Siguiente
            </button>
          </div>
        </section>
      </main>

      <div className="modal fade" id="detalleCitaModal" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content cita-detalle-modal">
            <div className="modal-header cita-detalle-header">
              <h5 className="modal-title">
                {editando ? 'Editar cita' : 'Detalles de la cita'}
              </h5>

              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
              ></button>
            </div>

            <div className="modal-body cita-detalle-body">
              {citaSeleccionada ? (
                editando ? (
                  <div className="editar-cita-form">
                    <label>Fecha:</label>
                    <input
                      type="date"
                      name="fecha"
                      value={formEditar.fecha}
                      onChange={handleEditarChange}
                    />

                    <label>Hora:</label>
                    <input
                      type="time"
                      name="hora"
                      value={formEditar.hora}
                      onChange={handleEditarChange}
                    />

                    <label>Estado:</label>
                    <select
                      name="estado"
                      value={formEditar.estado}
                      onChange={handleEditarChange}
                    >
                      <option value="pendiente">Pendiente</option>
                      <option value="completada">Completada</option>
                      <option value="cancelada">Cancelada</option>
                    </select>

                    <label>Motivo:</label>
                    <textarea
                      name="motivo"
                      rows="3"
                      maxLength="250"
                      value={formEditar.motivo}
                      onChange={handleEditarChange}
                    />

                    {formEditar.estado === 'completada' && (
                      <>
                        <label>Diagnóstico:</label>
                        <textarea
                          name="diagnostico"
                          rows="3"
                          maxLength="1000"
                          value={formEditar.diagnostico}
                          onChange={handleEditarChange}
                          placeholder="Introduce el diagnóstico de la cita"
                        />

                        <label>Tratamiento:</label>
                        <textarea
                          name="tratamiento"
                          rows="3"
                          maxLength="1000"
                          value={formEditar.tratamiento}
                          onChange={handleEditarChange}
                          placeholder="Introduce el tratamiento recomendado"
                        />
                      </>
                    )}

                    <div className="modal-acciones-cita">
                      <button
                        type="button"
                        className="btn-cancelar-edicion"
                        onClick={cancelarEdicion}
                      >
                        Cancelar
                      </button>

                      <button
                        type="button"
                        className="btn-guardar-edicion"
                        onClick={guardarCambios}
                      >
                        Guardar cambios
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p><strong>ID:</strong> {citaSeleccionada.id ?? citaSeleccionada.idCita}</p>
                    <p><strong>Fecha:</strong> {citaSeleccionada.fecha}</p>
                    <p><strong>Hora:</strong> {normalizarHora(citaSeleccionada.hora)} - {calcularSalida(citaSeleccionada.hora)}</p>

                    <p>
                      <strong>Paciente:</strong>{' '}
                      {citaSeleccionada.paciente
                        ? `${citaSeleccionada.paciente.nombre} ${citaSeleccionada.paciente.apellidos ?? ''}`
                        : 'Paciente no disponible'}
                    </p>

                    <p>
                      <strong>Médico:</strong>{' '}
                      {citaSeleccionada.usuario
                        ? `${citaSeleccionada.usuario.nombre} ${citaSeleccionada.usuario.apellidos ?? ''}`
                        : 'Usuario no disponible'}
                    </p>

                    <p><strong>Motivo:</strong> {citaSeleccionada.motivo || 'Sin motivo indicado'}</p>

                    <p>
                      <strong>Estado:</strong>{' '}
                      <span className={`estado-badge ${obtenerEstado(citaSeleccionada.estado).clase}`}>
                        {obtenerEstado(citaSeleccionada.estado).texto}
                      </span>
                    </p>

                    {citaSeleccionada.diagnostico && (
                      <p><strong>Diagnóstico:</strong> {citaSeleccionada.diagnostico}</p>
                    )}

                    {citaSeleccionada.tratamiento && (
                      <p><strong>Tratamiento:</strong> {citaSeleccionada.tratamiento}</p>
                    )}

                    <div className="modal-acciones-cita">
                      <button
                        type="button"
                        className="btn-editar-cita"
                        onClick={prepararEdicion}
                      >
                        Editar cita
                      </button>
                    </div>
                  </>
                )
              ) : (
                <p>No se ha podido cargar la cita.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <PublicFooter />
    </>
  )
}

export default CitasPage