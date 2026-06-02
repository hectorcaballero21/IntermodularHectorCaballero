import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import '../assets/css/verpacientes.css'
import StaffHeader from '../components/StaffHeader'
import PublicFooter from '../components/PublicFooter'
import CustomDatePicker from '../components/CustomDatePicker'
import { getPacientes } from '../services/pacienteService'
import { useToast } from '../context/ToastContext'

function PacientesPage() {
  const { showToast } = useToast()

  const [pacientes, setPacientes] = useState([])
  const [filtro, setFiltro] = useState('dni')
  const [busqueda, setBusqueda] = useState('')
  const [busquedaValidada, setBusquedaValidada] = useState('')
  const [paginaActual, setPaginaActual] = useState(1)
  const [cargandoPacientes, setCargandoPacientes] = useState(true)

  const pacientesPorPagina = 5

  useEffect(() => {
    let activo = true

    setCargandoPacientes(true)

    getPacientes()
      .then((res) => {
        if (activo) setPacientes(res.data || [])
      })
      .catch(() => {
        if (activo) {
          setPacientes([])
          showToast('No se pudieron cargar los pacientes', 'error')
        }
      })
      .finally(() => {
        if (activo) setCargandoPacientes(false)
      })

    return () => {
      activo = false
    }
  }, [showToast])

  const validarBusqueda = () => {
    const valor = busqueda.trim()

    if (!valor) {
      setBusquedaValidada('')
      setPaginaActual(1)
      return true
    }

    if (filtro === 'dni' && !/^[0-9]{8}[A-Za-z]$/.test(valor)) {
      showToast('El DNI debe tener 8 números y una letra', 'warning')
      return false
    }

    if (filtro === 'telefono' && !/^[0-9]{9}$/.test(valor)) {
      showToast('El teléfono debe tener 9 cifras', 'warning')
      return false
    }

    if (filtro === 'id' && !/^[0-9]+$/.test(valor)) {
      showToast('El ID debe ser numérico', 'warning')
      return false
    }

    if (filtro === 'fecha_nacimiento' && !/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(valor)) {
      showToast('La fecha debe tener formato AAAA-MM-DD', 'warning')
      return false
    }

    setBusquedaValidada(valor)
    setPaginaActual(1)
    return true
  }

  const handleBuscar = () => {
    validarBusqueda()
  }

  const handleBusquedaChange = (e) => {
    const value = e.target.value

    setBusqueda(filtro === 'dni' ? value.toUpperCase() : value)

    if (!value.trim()) {
      setBusquedaValidada('')
      setPaginaActual(1)
    }
  }

  const handleFiltroChange = (e) => {
    setFiltro(e.target.value)
    setBusqueda('')
    setBusquedaValidada('')
    setPaginaActual(1)
  }

  const pacientesFiltrados = useMemo(() => {
    if (!busquedaValidada.trim()) return pacientes

    const q = busquedaValidada.toLowerCase()

    return pacientes.filter((p) => {
      const map = {
        dni: p.dni,
        id: p.id ?? p.idPaciente,
        nombre: p.nombre,
        apellidos: p.apellidos,
        fecha_nacimiento: p.fechaNacimiento,
        domicilio: p.direccion,
        telefono: p.telefono,
      }

      return String(map[filtro] ?? '').toLowerCase().includes(q)
    })
  }, [pacientes, filtro, busquedaValidada])

  const totalPaginas = Math.max(1, Math.ceil(pacientesFiltrados.length / pacientesPorPagina))

  const pacientesPagina = useMemo(() => {
    const inicio = (paginaActual - 1) * pacientesPorPagina
    const fin = inicio + pacientesPorPagina

    return pacientesFiltrados.slice(inicio, fin)
  }, [pacientesFiltrados, paginaActual])

  const placeholderBusqueda = {
    dni: 'Ej: 12345678A',
    id: 'Ej: 1',
    nombre: 'Introduce el nombre',
    apellidos: 'Introduce los apellidos',
    fecha_nacimiento: 'Ej: 2000-05-20',
    domicilio: 'Introduce el domicilio',
    telefono: 'Ej: 600123456',
  }

  return (
    <>
      <StaffHeader />

      <img
        src="/img/logosescam.png"
        alt="Logo SESCAM"
        className="logo-sescam-ver-pacientes"
      />

      <div className="contenedor-principal-pacientes">
        <div className="contenedor-busqueda-pacientes">
          <h2>Buscar Pacientes</h2>

          <label htmlFor="filtro">Filtrar por:</label>

          <select
            id="filtro"
            className="select-filtro-pacientes"
            value={filtro}
            onChange={handleFiltroChange}
          >
            <option value="dni">DNI</option>
            <option value="id">ID</option>
            <option value="nombre">Nombre</option>
            <option value="apellidos">Apellidos</option>
            <option value="fecha_nacimiento">Fecha de Nacimiento</option>
            <option value="domicilio">Domicilio</option>
            <option value="telefono">Teléfono</option>
          </select>

          {filtro === 'fecha_nacimiento' ? (
            <CustomDatePicker
              id="valor-busqueda"
              className="input-busqueda-pacientes"
              placeholder={placeholderBusqueda[filtro]}
              value={busqueda}
              onChange={(valor) => {
                setBusqueda(valor)

                if (!valor.trim()) {
                  setBusquedaValidada('')
                  setPaginaActual(1)
                }
              }}
            />
          ) : (
            <input
              type="text"
              id="valor-busqueda"
              className="input-busqueda-pacientes"
              placeholder={placeholderBusqueda[filtro]}
              value={busqueda}
              onChange={handleBusquedaChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleBuscar()
              }}
            />
          )}

          <button
            className="btn-buscar-pacientes"
            type="button"
            onClick={handleBuscar}
          >
            <img src="/img/buscar.png" className="icono-boton-pacientes" alt="buscar" />
            Buscar
          </button>
        </div>

        <div className="tabla-pacientes-box">
          <div className="titulo-tabla-pacientes">
            Pacientes ({pacientesFiltrados.length})
          </div>

          <table className="table table-bordered tabla-pacientes-real">
            <thead className="table-dark">
              <tr>
                <th>Nombre</th>
                <th>DNI</th>
                <th>Acción</th>
              </tr>
            </thead>

            <tbody>
              {cargandoPacientes ? (
                <tr>
                  <td colSpan="3" className="estado-carga-tabla">
                  <div className="carga-tabla-contenido">
                    <div className="spinner-carga" aria-hidden="true"></div>
                    <span>Cargando pacientes...</span>
                  </div>
                </td>
                </tr>
              ) : pacientesPagina.length === 0 ? (
                <tr>
                  <td colSpan="3">
                    No hay pacientes que coincidan con la búsqueda
                  </td>
                </tr>
              ) : (
                pacientesPagina.map((p) => (
                  <tr key={p.id ?? p.idPaciente}>
                    <td title={`${p.nombre ?? ''} ${p.apellidos ?? ''}`}>
                      {p.nombre} {p.apellidos}
                    </td>

                    <td>{p.dni || 'No indicado'}</td>

                    <td>
                      <Link
                        to={`/pacientes/${p.id ?? p.idPaciente}`}
                        className="btn-consultar-pacientes"
                      >
                        <img src="/img/buscar.png" className="icono-boton-pacientes" alt="buscar" />
                        Consultar
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <div className="paginacion-pacientes">
            <button
              type="button"
              disabled={cargandoPacientes || paginaActual === 1}
              onClick={() => setPaginaActual((prev) => Math.max(1, prev - 1))}
            >
              Anterior
            </button>

            <label htmlFor="selector-pagina-pacientes">
              Página
            </label>

            <select
              id="selector-pagina-pacientes"
              className="selector-pagina-pacientes"
              value={paginaActual}
              disabled={cargandoPacientes}
              onChange={(e) => setPaginaActual(Number(e.target.value))}
            >
              {Array.from({ length: totalPaginas }, (_, index) => (
                <option key={index + 1} value={index + 1}>
                  {index + 1}
                </option>
              ))}
            </select>

            <span>
              de {totalPaginas}
            </span>

            <button
              type="button"
              disabled={cargandoPacientes || paginaActual === totalPaginas}
              onClick={() => setPaginaActual((prev) => Math.min(totalPaginas, prev + 1))}
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>

      <PublicFooter />
    </>
  )
}

export default PacientesPage