import { useEffect, useMemo, useState } from 'react'
import StaffHeader from '../components/StaffHeader'
import PublicFooter from '../components/PublicFooter'
import { deletePaciente, getPacientes } from '../services/pacienteService'
import { useToast } from '../context/ToastContext'
import '../assets/css/eliminarpacientes.css'

function EliminarPacientesPage() {
  const { showToast } = useToast()

  const [idPaciente, setIdPaciente] = useState('')
  const [pacientes, setPacientes] = useState([])
  const [filtroNombre, setFiltroNombre] = useState('')
  const [pacientePendiente, setPacientePendiente] = useState(null)

  useEffect(() => {
    getPacientes()
      .then((res) => setPacientes(res.data))
      .catch(() => {
        setPacientes([])
        showToast('No se pudieron cargar los pacientes', 'error')
      })
  }, [showToast])

  const pacientesFiltrados = useMemo(() => {
    const q = filtroNombre.toLowerCase().trim()

    if (!q) return pacientes

    return pacientes.filter((p) => {
      const nombreCompleto = `${p.nombre ?? ''} ${p.apellidos ?? ''}`.toLowerCase()
      const dni = String(p.dni ?? '').toLowerCase()

      return nombreCompleto.includes(q) || dni.includes(q)
    })
  }, [pacientes, filtroNombre])

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!idPaciente) {
      showToast('Introduce o selecciona el ID del paciente', 'warning')
      return
    }

    const pacienteEncontrado = pacientes.find(
      (p) => Number(p.id ?? p.idPaciente) === Number(idPaciente),
    )

    setPacientePendiente(
      pacienteEncontrado || {
        id: idPaciente,
        nombre: 'Paciente',
        apellidos: '',
        dni: 'No disponible',
      },
    )
  }

  const confirmarEliminacion = async () => {
    if (!pacientePendiente) return

    const id = pacientePendiente.id ?? pacientePendiente.idPaciente

    try {
      await deletePaciente(id)

      showToast('Paciente eliminado correctamente', 'success')
      setIdPaciente('')
      setPacientePendiente(null)
      setPacientes((prev) => prev.filter((p) => Number(p.id ?? p.idPaciente) !== Number(id)))
    } catch (error) {
      console.error(error)
      showToast('No se pudo eliminar el paciente', 'error')
    }
  }

  const seleccionarPaciente = (paciente) => {
    setIdPaciente(paciente.id ?? paciente.idPaciente)
  }

  return (
    <>
      <StaffHeader />

      <img
        src="/img/logosescam.png"
        alt="Logo SESCAM"
        className="logo-sescam-eliminar-pacientes"
      />

      <div className="contenedor-eliminar">
        <form onSubmit={handleSubmit}>
          <label htmlFor="id-paciente" className="label-eliminar">
            ID del paciente
          </label>

          <input
            type="number"
            id="id-paciente"
            className="input-eliminar"
            placeholder="Haz clic para seleccionar paciente"
            value={idPaciente}
            onChange={(e) => setIdPaciente(e.target.value)}
            data-bs-toggle="modal"
            data-bs-target="#modalPacientesEliminar"
          />

          <button type="submit" className="boton-eliminar">
            <img
              src="/img/eliminarusu.png"
              alt="Eliminar"
              className="icono-boton"
            />
            Eliminar Paciente
          </button>
        </form>
      </div>

      <div className="modal fade" id="modalPacientesEliminar" tabIndex="-1">
        <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
          <div className="modal-content modal-selector-content">
            <div className="modal-header modal-selector-header">
              <h5 className="modal-title">Seleccionar paciente</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
            </div>

            <div className="modal-body modal-selector-body">
              <input
                type="text"
                className="selector-filtro"
                placeholder="Filtrar por nombre, apellidos o DNI"
                value={filtroNombre}
                onChange={(e) => setFiltroNombre(e.target.value)}
              />

              <div className="selector-listado">
                {pacientesFiltrados.length === 0 ? (
                  <p className="selector-vacio">No hay pacientes que coincidan.</p>
                ) : (
                  pacientesFiltrados.map((p) => (
                    <button
                      key={p.id ?? p.idPaciente}
                      type="button"
                      className="selector-item"
                      data-bs-dismiss="modal"
                      onClick={() => seleccionarPaciente(p)}
                    >
                      <span>
                        <strong>ID:</strong> {p.id ?? p.idPaciente}
                      </span>

                      <span>
                        <strong>Paciente:</strong> {p.nombre} {p.apellidos}
                      </span>

                      <span>
                        <strong>DNI:</strong> {p.dni || 'Sin DNI'}
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {pacientePendiente && (
        <>
          <div className="modal show d-block" tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content modal-selector-content">
                <div className="modal-header modal-selector-header">
                  <h5 className="modal-title">Confirmar eliminación</h5>
                  <button type="button" className="btn-close" onClick={() => setPacientePendiente(null)}></button>
                </div>

                <div className="modal-body modal-selector-body">
                  <p>
                    ¿Seguro que quieres eliminar al paciente{' '}
                    <strong>
                      {pacientePendiente.nombre} {pacientePendiente.apellidos}
                    </strong>
                    ?
                  </p>

                  <p>
                    <strong>ID:</strong> {pacientePendiente.id ?? pacientePendiente.idPaciente}
                  </p>

                  <p>
                    <strong>DNI:</strong> {pacientePendiente.dni || 'Sin DNI'}
                  </p>

                  <div className="d-flex justify-content-end gap-2 mt-4">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setPacientePendiente(null)}
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

export default EliminarPacientesPage