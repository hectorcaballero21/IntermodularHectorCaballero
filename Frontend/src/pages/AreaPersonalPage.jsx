import { useEffect, useMemo, useState } from 'react'
import StaffHeader from '../components/StaffHeader'
import PublicFooter from '../components/PublicFooter'
import '../assets/css/areapersonal.css'
import { getCitas } from '../services/citaService'

function AreaPersonalPage() {
  const [citas, setCitas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [errorCarga, setErrorCarga] = useState(false)
  const [citaSeleccionada, setCitaSeleccionada] = useState(null)

  const hoy = new Date().toISOString().split('T')[0]
  const [fechaSeleccionada] = useState(hoy)

  const usuarioLogeado = JSON.parse(localStorage.getItem('usuario') || 'null')

  useEffect(() => {
    let activo = true

    setCargando(true)
    setErrorCarga(false)

    getCitas()
      .then((res) => {
        if (activo) setCitas(res.data || [])
      })
      .catch(() => {
        if (activo) {
          setCitas([])
          setErrorCarga(true)
        }
      })
      .finally(() => {
        if (activo) setCargando(false)
      })

    return () => {
      activo = false
    }
  }, [])

  const normalizarHora = (hora) => {
    if (!hora) return ''

    const partes = String(hora).split(':')

    return `${partes[0].padStart(2, '0')}:${(partes[1] || '00').padStart(2, '0')}`
  }

  const calcularSalida = (hora) => {
    if (!hora) return ''

    const fechaBase = new Date(`2000-01-01T${normalizarHora(hora)}:00`)
    fechaBase.setMinutes(fechaBase.getMinutes() + 15)

    return `${String(fechaBase.getHours()).padStart(2, '0')}:${String(fechaBase.getMinutes()).padStart(2, '0')}`
  }

  const formatearFecha = (fechaISO) => {
    if (!fechaISO) return 'Sin fecha seleccionada'

    const [year, month, day] = fechaISO.split('-')

    return `${day}/${month}/${year}`
  }

  const citasDelUsuarioPorFecha = useMemo(() => {
    const idUsuarioLogeado =
      usuarioLogeado?.id ??
      usuarioLogeado?.idUsuario

    return citas
      .filter((cita) => {
        const idUsuarioCita =
          cita.usuario?.id ??
          cita.usuario?.idUsuario ??
          cita.idUsuario ??
          cita.usuarioId

        return (
          cita.fecha === fechaSeleccionada &&
          Number(idUsuarioCita) === Number(idUsuarioLogeado)
        )
      })
      .sort((a, b) => normalizarHora(a.hora).localeCompare(normalizarHora(b.hora)))
  }, [citas, fechaSeleccionada, usuarioLogeado])

  return (
    <>
      <StaffHeader />

      <main className="area-main">
        <img
          src="/img/logosescam.png"
          alt="Logo SESCAM"
          className="area-logo-sescam"
        />

        <section className="calendario-citas-layout">
          <aside className="selector-fecha-card">
            <div className="area-info-card-visible">
              <h2>
                ¡Bienvenido, {usuarioLogeado?.nombre || 'Sanitario'}!
              </h2>

              <p className="area-subtitulo">
                Área personal
              </p>

              <hr />

              <p className="area-label">
                Tu horario de hoy es de:
              </p>

              <h3 className="area-horario">
                10:00 a 14:00
              </h3>

              <p className="area-label">
                Estas son tus citas de hoy
              </p>

              <h3 className="area-fecha">
                {formatearFecha(fechaSeleccionada)}
              </h3>

              <hr />

              <small>
                * Los horarios pueden estar sujetos a cambios.
              </small>
            </div>
          </aside>

          <section className="tabla-calendario-card">
            <div className="tabla-calendario-header">
              <h2>
                Tus citas - {formatearFecha(fechaSeleccionada)}
              </h2>

              <span>
                {cargando ? 'Cargando...' : `${citasDelUsuarioPorFecha.length} cita(s)`}
              </span>
            </div>

            <div className="tabla-calendario-scroll">
              <table className="area-table tabla-calendario">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Hora Entrada</th>
                    <th>Hora Salida</th>
                  </tr>
                </thead>

                <tbody>
                  {cargando ? (
                    <tr>
                      <td colSpan="3">
                        <div className="estado-carga-tabla">
                          <span className="spinner-carga"></span>
                          <span>Cargando tus citas...</span>
                        </div>
                      </td>
                    </tr>
                  ) : errorCarga ? (
                    <tr>
                      <td colSpan="3" className="mensaje-error-carga">
                        No se pudieron cargar las citas
                      </td>
                    </tr>
                  ) : citasDelUsuarioPorFecha.length === 0 ? (
                    <tr>
                      <td colSpan="3">
                        No tienes citas para hoy
                      </td>
                    </tr>
                  ) : (
                    citasDelUsuarioPorFecha.map((cita) => (
                      <tr
                        key={cita.id ?? cita.idCita}
                        className="fila-cita-clickable"
                        data-bs-toggle="modal"
                        data-bs-target="#detalleCitaModal"
                        onClick={() => setCitaSeleccionada(cita)}
                      >
                        <td
                          title={
                            cita.paciente
                              ? `${cita.paciente.nombre} ${cita.paciente.apellidos ?? ''}`
                              : 'Paciente'
                          }
                        >
                          {cita.paciente
                            ? `${cita.paciente.nombre} ${cita.paciente.apellidos ?? ''}`
                            : 'Paciente'}
                        </td>

                        <td>
                          {normalizarHora(cita.hora)}
                        </td>

                        <td>
                          {calcularSalida(cita.hora)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </section>
      </main>

      <div
        className="modal fade"
        id="detalleCitaModal"
        tabIndex="-1"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content cita-detalle-modal">
            <div className="modal-header cita-detalle-header">
              <h5 className="modal-title">
                Detalles de la cita
              </h5>

              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
              ></button>
            </div>

            <div className="modal-body cita-detalle-body">
              {citaSeleccionada ? (
                <>
                  <p>
                    <strong>ID:</strong>{' '}
                    {citaSeleccionada.id ?? citaSeleccionada.idCita}
                  </p>

                  <p>
                    <strong>Fecha:</strong>{' '}
                    {citaSeleccionada.fecha}
                  </p>

                  <p>
                    <strong>Hora:</strong>{' '}
                    {normalizarHora(citaSeleccionada.hora)}
                    {' - '}
                    {calcularSalida(citaSeleccionada.hora)}
                  </p>

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

                  <p>
                    <strong>Motivo:</strong>{' '}
                    {citaSeleccionada.motivo || 'Sin motivo indicado'}
                  </p>

                  <p>
                    <strong>Estado:</strong>{' '}

                    <span
                      className={`estado-badge estado-${String(
                        citaSeleccionada.estado || 'pendiente',
                      ).toLowerCase()}`}
                    >
                      {citaSeleccionada.estado || 'pendiente'}
                    </span>
                  </p>
                </>
              ) : (
                <p>
                  No se ha podido cargar la cita.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <PublicFooter />
    </>
  )
}

export default AreaPersonalPage