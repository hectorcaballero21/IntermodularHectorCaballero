import { Link } from 'react-router-dom'
import LegalModals from './LegalModals'
import '../assets/css/sharedLayout.css'

function PublicFooter() {
  return (
    <>
      <footer className="footer-custom">
        <div className="footer-brand">
          <div className="footer-brand-title">
            Hospital Virgen de Altagracia
          </div>

          <div className="footer-brand-subtitle">
            Plataforma interna para personal sanitario
          </div>
        </div>

        <nav className="footer-center" aria-label="Enlaces informativos">
          <Link to="/contacto">
            Contacto
          </Link>

          <Link to="/nosotros">
            Sobre nosotros
          </Link>

          <Link to="/info">
            Información
          </Link>
        </nav>

        <div className="footer-right">
          <span>
            Servicio de Salud de Castilla-La Mancha
          </span>

          <img src="/img/logojccm.png" alt="Logo JCCM" />

          <div className="w3c-logos">
            <a
              href="https://jigsaw.w3.org/css-validator/check/referer"
              target="_blank"
              rel="noreferrer"
            >
              <img
                src="https://jigsaw.w3.org/css-validator/images/vcss"
                alt="CSS válido"
              />
            </a>

            <a
              href="https://jigsaw.w3.org/css-validator/check/referer"
              target="_blank"
              rel="noreferrer"
            >
              <img
                src="https://jigsaw.w3.org/css-validator/images/vcss-blue"
                alt="CSS válido azul"
              />
            </a>

            <img
              src="/img/sello-accesibilidad.png"
              alt="Sello de accesibilidad"
            />
          </div>
        </div>
      </footer>

      <button
        type="button"
        className="legal-btn"
        data-bs-toggle="modal"
        data-bs-target="#legalModal"
      >
        Avisos legales
      </button>

      <LegalModals />
    </>
  )
}

export default PublicFooter
