import { useEffect, useMemo, useState } from 'react'
import StaffHeader from '../components/StaffHeader'
import PublicFooter from '../components/PublicFooter'
import { deleteCita, getCitas } from '../services/citaService'
import { useToast } from '../context/ToastContext'
import '../assets/css/eliminarcitas.css'

function EliminarCitasPage() {
  const { showToast } = useToast()

  const [idCita, setIdCita] = useState('')
  const [citas, setCitas] = useState([])
  const [filtroFecha, setFiltroFecha] = useState('')
  const [filtroPaciente, setFiltroPaciente] = useState('')
  const [citaPendiente, setCitaPendiente] = useState(null)

  useEffect(() => {
    getCitas()
      .then((res) => setCitas(res.data))
      .catch(() => {
        setCitas([])
        showToast('No se pudieron cargar las citas', 'error')
      })
  }, [showToast])

  const citasFiltradas = useMemo(() => {
    return citas.filter((c) => {
      const coincideFecha = filtroFecha ? c.fecha === filtroFecha : true

      const nombrePaciente = c.paciente
        ? `${c.paciente.nombre ?? ''} ${c.paciente.apellidos ?? ''}`.toLowerCase()
        : ''

      const coincidePaciente = filtroPaciente
        ? nombrePaciente.includes(filtroPaciente.toLowerCase().trim())
        : true

      return coincideFecha && coincidePaciente
    })
  }, [citas, filtroFecha, filtroPaciente])

  const normalizarHora = (hora) => {
    if (!hora) return ''
    const partes = hora.split(':')
    return `${partes[0].padStart(2, '0')}:${partes[1].padStart(2, '0')}`
  }

  const calcularSalida = (hora) => {
    if (!hora) return ''
    const fecha = new Date(`2000-01-01T${normalizarHora(hora)}:00`)
    fecha.setMinutes(fecha.getMinutes() + 15)

    return `${String(fecha.getHours()).padStart(2, '0')}:${String(fecha.getMinutes()).padStart(2, '0')}`
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!idCita) {
      showToast('Introduce o selecciona el ID de la cita', 'warning')
      return
    }

    const citaEncontrada = citas.find(
      (c) => Number(c.id ?? c.idCita) === Number(idCita),
    )

    setCitaPendiente(
      citaEncontrada || {
        id: idCita,
        fecha: 'No disponible',
        hora: '',
        paciente: null,
        motivo: 'No disponible',
      },
    )
  }

  const confirmarEliminacion = async () => {
    if (!citaPendiente) return

    const id = citaPendiente.id ?? citaPendiente.idCita

    try {
      await deleteCita(id)

      showToast('Cita eliminada correctamente', 'success')
      setIdCita('')
      setCitaPendiente(null)
      setCitas((prev) => prev.filter((c) => Number(c.id ?? c.idCita) !== Number(id)))
    } catch (error) {
      console.error(error)
      showToast('No se pudo eliminar la cita', 'error')
    }
  }

  const seleccionarCita = (cita) => {
    setIdCita(cita.id ?? cita.idCita)
  }

  return (
    <>
      <StaffHeader />

      <img
        src="/img/logosescam.png"
        alt="Logo SESCAM"
        className="logo-sescam-eliminar-citas"
      />

      <div className="contenedor-eliminar">
        <form onSubmit={handleSubmit}>
          <label htmlFor="id-cita" className="label-eliminar">
            ID de la cita
          </label>

          <input
            type="number"
            id="id-cita"
            className="input-eliminar"
            placeholder="Haz clic para seleccionar cita"
            value={idCita}
            onChange={(e) => setIdCita(e.target.value)}
            data-bs-toggle="modal"
            data-bs-target="#modalCitasEliminar"
          />

          <button type="submit" className="boton-eliminar">
            <img
              src="/img/eliminar.png"
              alt="Eliminar"
              className="icono-boton"
            />
            Eliminar Cita
          </button>
        </form>
      </div>

      <div className="modal fade" id="modalCitasEliminar" tabIndex="-1">
        <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
          <div className="modal-content modal-selector-content">
            <div className="modal-header modal-selector-header">
              <h5 className="modal-title">Seleccionar cita</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
            </div>

            <div className="modal-body modal-selector-body">
              <div className="selector-filtros-dobles">
                <input
                  type="date"
                  className="selector-filtro"
                  value={filtroFecha}
                  onChange={(e) => setFiltroFecha(e.target.value)}
                />

                <input
                  type="text"
                  className="selector-filtro"
                  placeholder="Filtrar por paciente"
                  value={filtroPaciente}
                  onChange={(e) => setFiltroPaciente(e.target.value)}
                />
              </div>

              <div className="selector-listado selector-listado-citas">
                {citasFiltradas.length === 0 ? (
                  <p className="selector-vacio">No hay citas que coincidan.</p>
                ) : (
                  citasFiltradas.map((c) => (
                    <button
                      key={c.id ?? c.idCita}
                      type="button"
                      className="selector-item"
                      data-bs-dismiss="modal"
                      onClick={() => seleccionarCita(c)}
                    >
                      <span>
                        <strong>ID:</strong> {c.id ?? c.idCita}
                      </span>

                      <span>
                        <strong>Fecha:</strong> {c.fecha}
                      </span>

                      <span>
                        <strong>Hora:</strong> {normalizarHora(c.hora)} - {calcularSalida(c.hora)}
                      </span>

                      <span>
                        <strong>Paciente:</strong>{' '}
                        {c.paciente
                          ? `${c.paciente.nombre} ${c.paciente.apellidos ?? ''}`
                          : 'Paciente no disponible'}
                      </span>

                      <span>
                        <strong>Motivo:</strong> {c.motivo || 'Sin motivo'}
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {citaPendiente && (
        <>
          <div className="modal show d-block" tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content modal-selector-content">
                <div className="modal-header modal-selector-header">
                  <h5 className="modal-title">Confirmar eliminación</h5>
                  <button type="button" className="btn-close" onClick={() => setCitaPendiente(null)}></button>
                </div>

                <div className="modal-body modal-selector-body">
                  <p>
                    ¿Seguro que quieres eliminar esta cita?
                  </p>

                  <p>
                    <strong>ID:</strong> {citaPendiente.id ?? citaPendiente.idCita}
                  </p>

                  <p>
                    <strong>Fecha:</strong> {citaPendiente.fecha}
                  </p>

                  <p>
                    <strong>Hora:</strong> {normalizarHora(citaPendiente.hora)} - {calcularSalida(citaPendiente.hora)}
                  </p>

                  <p>
                    <strong>Paciente:</strong>{' '}
                    {citaPendiente.paciente
                      ? `${citaPendiente.paciente.nombre} ${citaPendiente.paciente.apellidos ?? ''}`
                      : 'Paciente no disponible'}
                  </p>

                  <p>
                    <strong>Motivo:</strong> {citaPendiente.motivo || 'Sin motivo'}
                  </p>

                  <div className="d-flex justify-content-end gap-2 mt-4">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setCitaPendiente(null)}
                    >
                      Cancelar
                    </button>

                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={confirmarEliminacion}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="modal-backdrop show"></div>
        </>
      )}

      <PublicFooter />
    </>
  )
}

export default EliminarCitasPage