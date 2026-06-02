import '../assets/css/alertasSanitario.css'

function AlertasSanitario() {
  const alertas = [
    {
      tipo: 'Urgente',
      texto: 'Revisar citas pendientes antes de finalizar el turno.',
    },
    {
      tipo: 'Aviso',
      texto: 'Actualización del sistema programada para esta noche.',
    },
    {
      tipo: 'Info',
      texto: 'Recuerda comprobar los datos del paciente antes de guardar una cita.',
    },
  ]

  return (
    <section className="alertas-card">
      <h2>Alertas internas</h2>

      <div className="alertas-lista">
        {alertas.map((alerta, index) => (
          <div key={index} className="alerta-item">
            <span className="alerta-tipo">{alerta.tipo}</span>
            <p>{alerta.texto}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

export default AlertasSanitario