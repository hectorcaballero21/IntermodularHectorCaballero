import { Routes, Route } from 'react-router-dom'

import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import AreaPersonalPage from './pages/AreaPersonalPage'

import PacientesPage from './pages/PacientesPage'
import NuevoPacientePage from './pages/NuevoPacientePage'
import EliminarPacientesPage from './pages/EliminarPacientesPage'

import CitasPage from './pages/CitasPage'
import NuevaCitaPage from './pages/NuevaCitaPage'
import EliminarCitasPage from './pages/EliminarCitasPage'

import GestionCitasPage from './pages/GestionCitasPage'
import GestionPacientesPage from './pages/GestionPacientesPage'
import HorarioPage from './pages/HorarioPage'

import ContactoPage from './pages/ContactoPage'
import NosotrosPage from './pages/NosotrosPage'
import InfoPage from './pages/InfoPage'
import ConsultaPacientePage from './pages/ConsultaPacientePage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/area-personal" element={<AreaPersonalPage />} />

      <Route path="/gestion-pacientes" element={<GestionPacientesPage />} />
      <Route path="/pacientes" element={<PacientesPage />} />
      <Route path="/pacientes/:id" element={<ConsultaPacientePage />} />
      <Route path="/pacientes/nuevo" element={<NuevoPacientePage />} />
      <Route path="/pacientes/eliminar" element={<EliminarPacientesPage />} />

      <Route path="/gestion-citas" element={<GestionCitasPage />} />
      <Route path="/citas" element={<CitasPage />} />
      <Route path="/citas/nueva" element={<NuevaCitaPage />} />
      <Route path="/citas/eliminar" element={<EliminarCitasPage />} />

      <Route path="/horario" element={<HorarioPage />} />

      <Route path="/contacto" element={<ContactoPage />} />
      <Route path="/nosotros" element={<NosotrosPage />} />
      <Route path="/info" element={<InfoPage />} />
    </Routes>
  )
}

export default App