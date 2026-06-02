import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import '../assets/css/customDatePicker.css'

function CustomDatePicker({
  id,
  value,
  onChange,
  minDate = '',
  maxDate = '',
  placeholder = 'Selecciona una fecha',
  className = '',
}) {
  const buttonRef = useRef(null)
  const [abierto, setAbierto] = useState(false)
  const [posicion, setPosicion] = useState({ top: 0, left: 0, width: 320 })

  const fechaBase = value ? new Date(`${value}T00:00:00`) : new Date()
  const [mesVisible, setMesVisible] = useState(
    new Date(fechaBase.getFullYear(), fechaBase.getMonth(), 1),
  )

  const meses = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
  ]

  const diasSemana = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

  const formatearISO = (fecha) => {
    const year = fecha.getFullYear()
    const month = String(fecha.getMonth() + 1).padStart(2, '0')
    const day = String(fecha.getDate()).padStart(2, '0')

    return `${year}-${month}-${day}`
  }

  const formatearVisible = (fechaISO) => {
    if (!fechaISO) return ''

    const partes = fechaISO.split('-')
    if (partes.length !== 3) return fechaISO

    return `${partes[2]}/${partes[1]}/${partes[0]}`
  }

  const actualizarPosicion = () => {
    if (!buttonRef.current) return

    const rect = buttonRef.current.getBoundingClientRect()
    const ancho = Math.max(rect.width, 330)

    setPosicion({
      top: rect.bottom + 8,
      left: Math.min(rect.left, window.innerWidth - ancho - 12),
      width: ancho,
    })
  }

  useEffect(() => {
    if (!abierto) return undefined

    actualizarPosicion()

    const cerrarConEscape = (e) => {
      if (e.key === 'Escape') setAbierto(false)
    }

    const actualizar = () => actualizarPosicion()

    window.addEventListener('keydown', cerrarConEscape)
    window.addEventListener('resize', actualizar)
    window.addEventListener('scroll', actualizar, true)

    return () => {
      window.removeEventListener('keydown', cerrarConEscape)
      window.removeEventListener('resize', actualizar)
      window.removeEventListener('scroll', actualizar, true)
    }
  }, [abierto])

  useEffect(() => {
    if (!value) return

    const nuevaFecha = new Date(`${value}T00:00:00`)
    setMesVisible(new Date(nuevaFecha.getFullYear(), nuevaFecha.getMonth(), 1))
  }, [value])

  const diasCalendario = useMemo(() => {
    const primerDiaMes = new Date(mesVisible.getFullYear(), mesVisible.getMonth(), 1)
    const inicio = new Date(primerDiaMes)
    const diaSemana = (primerDiaMes.getDay() + 6) % 7
    inicio.setDate(primerDiaMes.getDate() - diaSemana)

    return Array.from({ length: 42 }, (_, index) => {
      const fecha = new Date(inicio)
      fecha.setDate(inicio.getDate() + index)
      return fecha
    })
  }, [mesVisible])

  const estaDeshabilitada = (fecha) => {
    const fechaISO = formatearISO(fecha)

    if (minDate && fechaISO < minDate) return true
    if (maxDate && fechaISO > maxDate) return true

    return false
  }

  const seleccionarFecha = (fecha) => {
    if (estaDeshabilitada(fecha)) return

    onChange(formatearISO(fecha))
    setAbierto(false)
  }

  const cambiarMes = (cantidad) => {
    setMesVisible((prev) => new Date(prev.getFullYear(), prev.getMonth() + cantidad, 1))
  }

  const seleccionarHoy = () => {
    const hoy = new Date()
    const hoyISO = formatearISO(hoy)

    if (minDate && hoyISO < minDate) return
    if (maxDate && hoyISO > maxDate) return

    onChange(hoyISO)
    setMesVisible(new Date(hoy.getFullYear(), hoy.getMonth(), 1))
    setAbierto(false)
  }

  const limpiarFecha = () => {
    onChange('')
    setAbierto(false)
  }

  const calendario = abierto ? createPortal(
    <>
      <button
        type="button"
        className="custom-calendar-backdrop"
        aria-label="Cerrar calendario"
        onClick={() => setAbierto(false)}
      />

      <div
        className="custom-calendar-popover"
        style={{
          top: `${posicion.top}px`,
          left: `${posicion.left}px`,
          width: `${posicion.width}px`,
        }}
      >
        <div className="custom-calendar-header">
          <button type="button" onClick={() => cambiarMes(-1)}>
            ‹
          </button>

          <strong>
            {meses[mesVisible.getMonth()]} {mesVisible.getFullYear()}
          </strong>

          <button type="button" onClick={() => cambiarMes(1)}>
            ›
          </button>
        </div>

        <div className="custom-calendar-weekdays">
          {diasSemana.map((dia) => (
            <span key={dia}>{dia}</span>
          ))}
        </div>

        <div className="custom-calendar-grid">
          {diasCalendario.map((dia) => {
            const diaISO = formatearISO(dia)
            const esOtroMes = dia.getMonth() !== mesVisible.getMonth()
            const seleccionada = value === diaISO
            const deshabilitada = estaDeshabilitada(dia)

            return (
              <button
                key={diaISO}
                type="button"
                className={`custom-calendar-day ${esOtroMes ? 'otro-mes' : ''} ${seleccionada ? 'seleccionada' : ''}`}
                disabled={deshabilitada}
                onClick={() => seleccionarFecha(dia)}
              >
                {dia.getDate()}
              </button>
            )
          })}
        </div>

        <div className="custom-calendar-footer">
          <button type="button" onClick={seleccionarHoy}>
            Hoy
          </button>

          <button type="button" onClick={limpiarFecha}>
            Limpiar
          </button>
        </div>
      </div>
    </>,
    document.body,
  ) : null

  return (
    <>
      <button
        id={id}
        ref={buttonRef}
        type="button"
        className={`custom-date-input ${className}`}
        onClick={() => setAbierto((prev) => !prev)}
      >
        <span className={value ? '' : 'custom-date-placeholder'}>
          {value ? formatearVisible(value) : placeholder}
        </span>

        <span className="custom-date-icon">📅</span>
      </button>

      {calendario}
    </>
  )
}

export default CustomDatePicker
