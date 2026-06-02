import { useEffect, useMemo, useState } from 'react'
import StaffHeader from '../components/StaffHeader'
import PublicFooter from '../components/PublicFooter'
import '../assets/css/horario.css'
import { getCitas } from '../services/citaService'

function HorarioPage() {
  const [citas, setCitas] = useState([])
  const [citaSeleccionada, setCitaSeleccionada] = useState(null)

  const usuarioLogeado = JSON.parse(localStorage.getItem('usuario') || 'null')

  const hoy = new Date().toISOString().split('T')[0]
  const fechaHoyFormateada = new Date().toLocaleDateString('es-ES')

  useEffect(() => {
    getCitas()
      .then((res) => setCitas(res.data || []))
      .catch(() => setCitas([]))
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

  const citasDeHoyDelUsuario = useMemo(() => {
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
          cita.fecha === hoy &&
          Number(idUsuarioCita) === Number(idUsuarioLogeado)
        )
      })
      .sort((a, b) =>
        normalizarHora(a.hora).localeCompare(normalizarHora(b.hora)),
      )
  }, [citas, hoy, usuarioLogeado])

  return (
    <>
      <StaffHeader />

      <main className="horario-main">
        <img
          src="/img/logosescam.png"
          alt="Logo SESCAM"
          className="logo-sescam-horario"
        />

        <section className="horario-layout">
          <aside className="horario-info-card">
            <h2>
              ¡Bienvenido, {usuarioLogeado?.nombre || 'Sanitario'}!
            </h2>

            <p className="horario-subtitulo">
              Horario del día
            </p>

            <hr />

            <p className="horario-label">
              Tu horario de hoy es de:
            </p>

            <h3 className="horario-hora">
              10:00 a 14:00
            </h3>

            <p className="horario-label">
              Estas son tus citas de hoy
            </p>

            <h3 className="horario-fecha">
              {fechaHoyFormateada}
            </h3>

            <hr />

            <small>
              * Los horarios pueden estar sujetos a cambios.
            </small>
          </aside>

          <section className="horario-tabla-card">
            <div className="horario-tabla-header">
              <h2>
                Tus citas - {fechaHoyFormateada}
              </h2>

              <span>
                {citasDeHoyDelUsuario.length} cita(s)
              </span>
            </div>

            <div className="horario-tabla-scroll">
              <table className="table table-bordered horario-table">
                <thead className="table-dark">
                  <tr>
                    <th>Nombre</th>
                    <th>Hora Entrada</th>
                    <th>Hora Salida</th>
                  </tr>
                </thead>

                <tbody>
                  {citasDeHoyDelUsuario.length === 0 ? (
                    <tr>
                      <td colSpan="3">
                        No tienes citas para hoy
                      </td>
                    </tr>
                  ) : (
                    citasDeHoyDelUsuario.map((cita) => (
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

      <div className="modal fade" id="detalleCitaModal" tabIndex="-1">
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

export default HorarioPage