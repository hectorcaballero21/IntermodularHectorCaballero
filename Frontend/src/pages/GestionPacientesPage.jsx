import { Link } from 'react-router-dom'
import StaffHeader from '../components/StaffHeader'
import PublicFooter from '../components/PublicFooter'
import '../assets/css/pacs.css'

function GestionPacientesPage() {
  return (
    <>
      <StaffHeader />

      <img
        src="/img/logosescam.png"
        alt="Logo SESCAM"
        className="logo-sescam-gestion-pacientes"
      />

      <div className="contenedor-botones-pacientes">
        <Link to="/pacientes" className="boton-opcion-pacientes">
          <img src="/img/perfil.png" className="icono-pacientes" alt="Icono Ver Pacientes" />
          Ver Pacientes
        </Link>

        <Link to="/pacientes/nuevo" className="boton-opcion-pacientes">
          <img src="/img/anadirusu.png" className="icono-pacientes" alt="Icono Añadir Pacientes" />
          Añadir Pacientes
        </Link>

        <Link to="/pacientes/eliminar" className="boton-opcion-pacientes">
          <img src="/img/eliminarusu.png" className="icono-pacientes" alt="Icono Eliminar Pacientes" />
          Eliminar Pacientes
        </Link>
      </div>

      <PublicFooter />
    </>
  )
}

export default GestionPacientesPage