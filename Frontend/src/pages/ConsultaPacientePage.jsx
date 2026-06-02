import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import StaffHeader from '../components/StaffHeader'
import PublicFooter from '../components/PublicFooter'
import { getPacienteById } from '../services/pacienteService'
import { getCitas } from '../services/citaService'
import '../assets/css/consulta.css'

function ConsultaPacientePage() {
  const { id } = useParams()
  const [paciente, setPaciente] = useState(null)
  const [citasPaciente, setCitasPaciente] = useState([])

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

  const citasOrdenadas = useMemo(() => {
    return [...citasPaciente].sort((a, b) => {
      const fechaA = `${a.fecha || ''} ${a.hora || ''}`
      const fechaB = `${b.fecha || ''} ${b.hora || ''}`

      return fechaB.localeCompare(fechaA)
    })
  }, [citasPaciente])

  const normalizarHora = (hora) => {
    if (!hora) return 'Sin hora'

    const partes = hora.split(':')

    return `${partes[0].padStart(2, '0')}:${partes[1].padStart(2, '0')}`
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

            <div className="dato-consulta">
              <span className="label-consulta">Historial clínico:</span>

              <button
                type="button"
                className="btn-historial"
                data-bs-toggle="modal"
                data-bs-target="#historialClinicoModal"
              >
                Ver historial clínico
              </button>
            </div>
          </div>
        ) : (
          <p className="mensaje-consulta">No se ha encontrado el paciente.</p>
        )}
      </div>

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