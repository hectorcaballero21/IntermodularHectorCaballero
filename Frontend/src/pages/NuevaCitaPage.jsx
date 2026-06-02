import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../assets/css/anadircitas.css'
import StaffHeader from '../components/StaffHeader'
import PublicFooter from '../components/PublicFooter'
import CustomDatePicker from '../components/CustomDatePicker'
import { createCita, getCitas } from '../services/citaService'
import { getPacientes } from '../services/pacienteService'
import { useToast } from '../context/ToastContext'

function NuevaCitaPage() {
  const navigate = useNavigate()
  const { showToast } = useToast()

  const usuarioLogeado = JSON.parse(localStorage.getItem('usuario') || 'null')

  const [pacientes, setPacientes] = useState([])
  const [citas, setCitas] = useState([])
  const [citaModal, setCitaModal] = useState(null)

  const [form, setForm] = useState({
    fecha: '',
    hora: '',
    motivo: '',
    pacienteId: '',
  })

  useEffect(() => {
    getPacientes()
      .then((res) => setPacientes(res.data))
      .catch(() => {
        setPacientes([])
        showToast('No se pudieron cargar los pacientes', 'error')
      })

    getCitas()
      .then((res) => setCitas(res.data))
      .catch(() => {
        setCitas([])
        showToast('No se pudieron cargar las citas', 'error')
      })
  }, [])

  const usuarioIdLogeado = usuarioLogeado?.id ?? usuarioLogeado?.idUsuario

  const horasDisponibles = useMemo(() => {
    const horas = []
    const inicio = 10 * 60
    const fin = 14 * 60

    for (let minutos = inicio; minutos < fin; minutos += 15) {
      const h = String(Math.floor(minutos / 60)).padStart(2, '0')
      const m = String(minutos % 60).padStart(2, '0')
      horas.push(`${h}:${m}`)
    }

    return horas
  }, [])

  const normalizarHora = (hora) => {
    if (!hora) return ''
    const partes = hora.split(':')
    return `${partes[0].padStart(2, '0')}:${partes[1].padStart(2, '0')}`
  }

  const calcularSalida = (hora) => {
    const fecha = new Date(`2000-01-01T${hora}:00`)
    fecha.setMinutes(fecha.getMinutes() + 15)

    return `${String(fecha.getHours()).padStart(2, '0')}:${String(fecha.getMinutes()).padStart(2, '0')}`
  }

  const citasDelDiaDelMedico = useMemo(() => {
    if (!form.fecha) return []

    return citas.filter((cita) => {
      const idUsuarioCita =
        cita.usuario?.id ??
        cita.usuario?.idUsuario ??
        cita.usuarioId ??
        cita.idUsuario

      return (
        cita.fecha === form.fecha &&
        Number(idUsuarioCita) === Number(usuarioIdLogeado)
      )
    })
  }, [citas, form.fecha, usuarioIdLogeado])

  const buscarCitaPorHora = (hora) => {
    return citasDelDiaDelMedico.find((cita) => normalizarHora(cita.hora) === hora)
  }

  const horasOcupadas = useMemo(() => {
    return horasDisponibles
      .map((hora) => ({
        hora,
        cita: buscarCitaPorHora(hora),
      }))
      .filter((item) => item.cita)
  }, [horasDisponibles, citasDelDiaDelMedico])

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    })
  }

  const validarFormulario = () => {
    if (!form.pacienteId) {
      showToast('Debes seleccionar un paciente', 'warning')
      return false
    }

    if (!form.fecha) {
      showToast('Debes seleccionar una fecha', 'warning')
      return false
    }

    if (!form.hora) {
      showToast('Debes seleccionar una hora', 'warning')
      return false
    }

    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)

    const fechaSeleccionada = new Date(`${form.fecha}T00:00:00`)

    if (fechaSeleccionada < hoy) {
      showToast('No puedes crear citas en fechas pasadas', 'warning')
      return false
    }

    const [horaSeleccionada] = form.hora.split(':').map(Number)

    if (horaSeleccionada < 10 || horaSeleccionada >= 14) {
      showToast('Las citas deben estar entre las 10:00 y las 14:00', 'warning')
      return false
    }

    if (!form.motivo.trim()) {
      showToast('Debes introducir un motivo para la cita', 'warning')
      return false
    }

    if (form.motivo.trim().length < 5) {
      showToast('El motivo debe tener al menos 5 caracteres', 'warning')
      return false
    }

    if (form.motivo.trim().length > 250) {
      showToast('El motivo no puede superar los 250 caracteres', 'warning')
      return false
    }

    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validarFormulario()) return

    const citaOcupada = buscarCitaPorHora(form.hora)

    if (citaOcupada) {
      setCitaModal(citaOcupada)
      showToast('Esa hora ya está ocupada', 'warning')
      return
    }

    try {
      await createCita({
        fecha: form.fecha,
        hora: form.hora,
        motivo: form.motivo.trim(),
        estado: 'pendiente',
        paciente: {
          id: Number(form.pacienteId),
        },
        usuario: {
          id: usuarioIdLogeado,
        },
      })

      showToast('Cita añadida correctamente', 'success')
      navigate('/citas')
    } catch (error) {
      console.error(error)
      showToast('Error al crear la cita', 'error')
    }
  }

  return (
    <>
      <StaffHeader />

      <img
        src="/img/logosescam.png"
        alt="Logo SESCAM"
        className="logo-sescam-nueva-cita"
      />

      <div className="contenedor-formulario-cita">
        <h2 className="titulo-cita">Añadir nueva cita</h2>

        <form onSubmit={handleSubmit}>
          <div className="campo-cita">
            <label>Paciente:</label>

            <select
              name="pacienteId"
              className="input-cita"
              value={form.pacienteId}
              onChange={handleChange}
            >
              <option value="">Selecciona un paciente</option>

              {pacientes.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre} {p.apellidos}
                </option>
              ))}
            </select>
          </div>

          <div className="campo-cita">
            <label>Fecha:</label>

            <CustomDatePicker
              className="input-cita input-fecha-cita"
              placeholder="Selecciona una fecha"
              value={form.fecha}
              minDate={new Date().toISOString().split('T')[0]}
              onChange={(valor) => {
                setForm({
                  ...form,
                  fecha: valor,
                  hora: '',
                })
              }}
            />
          </div>

          <div className="campo-cita">
            <label>Hora:</label>

            <select
              name="hora"
              className="input-cita"
              value={form.hora}
              onChange={handleChange}
              disabled={!form.fecha}
            >
              <option value="">
                {form.fecha ? 'Selecciona una hora' : 'Selecciona primero una fecha'}
              </option>

              {horasDisponibles.map((hora) => {
                const citaOcupada = buscarCitaPorHora(hora)

                return (
                  <option
                    key={hora}
                    value={hora}
                    disabled={Boolean(citaOcupada)}
                  >
                    {hora} - {calcularSalida(hora)}
                    {citaOcupada ? ' (Cogido)' : ''}
                  </option>
                )
              })}
            </select>
          </div>

          {form.fecha && horasOcupadas.length > 0 && (
            <div className="horas-ocupadas-box">
              <p>Horas ocupadas:</p>

              <div className="horas-ocupadas-lista">
                {horasOcupadas.map((item) => (
                  <button
                    key={item.hora}
                    type="button"
                    className="hora-ocupada-btn"
                    data-bs-toggle="modal"
                    data-bs-target="#citaOcupadaModal"
                    onClick={() => setCitaModal(item.cita)}
                  >
                    {item.hora} - {calcularSalida(item.hora)}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="campo-cita">
            <label>Motivo:</label>

            <textarea
              name="motivo"
              className="input-cita textarea-cita"
              value={form.motivo}
              maxLength="250"
              onChange={handleChange}
              placeholder="Introduce el motivo de la cita"
            />
          </div>

          <button type="submit" className="btn-confirmar-cita">
            <img
              src="/img/agregarcita.png"
              className="icono-boton-cita"
              alt="añadir"
            />
            Añadir cita
          </button>
        </form>
      </div>

      <div className="modal fade" id="citaOcupadaModal" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content cita-ocupada-modal">
            <div className="modal-header cita-ocupada-header">
              <h5 className="modal-title">Hora ocupada</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
            </div>

            <div className="modal-body cita-ocupada-body">
              {citaModal ? (
                <>
                  <p><strong>Fecha:</strong> {citaModal.fecha}</p>

                  <p>
                    <strong>Hora:</strong>{' '}
                    {normalizarHora(citaModal.hora)} - {calcularSalida(normalizarHora(citaModal.hora))}
                  </p>

                  <p>
                    <strong>Paciente:</strong>{' '}
                    {citaModal.paciente
                      ? `${citaModal.paciente.nombre} ${citaModal.paciente.apellidos ?? ''}`
                      : 'Paciente no disponible'}
                  </p>

                  <p><strong>Motivo:</strong> {citaModal.motivo || 'Sin motivo indicado'}</p>
                  <p><strong>Estado:</strong> {citaModal.estado || 'pendiente'}</p>
                </>
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

export default NuevaCitaPage