import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-content">
                    <div className="footer-brand">
                        <h3>AgendaSalud</h3>
                        <p>Tu salud, nuestra prioridad - Conectando pacientes con profesionales de la salud</p>
                    </div>

                    <div className="footer-links">
                        <div className="footer-section">
                            <h4>Enlaces rápidos</h4>
                            <Link to="/" className="footer-link">Inicio</Link>
                            <Link to="/about" className="footer-link">Sobre nosotros</Link>
                            <Link to="/services" className="footer-link">Servicios</Link>
                            <Link to="/contact" className="footer-link">Contacto</Link>
                        </div>

                        <div className="footer-section">
                            <h4>Para pacientes</h4>
                            <Link to="/register" className="footer-link">Registrarse</Link>
                            <Link to="/book-appointment" className="footer-link">Reservar cita</Link>
                            <Link to="/find-doctors" className="footer-link">Buscar doctores</Link>
                        </div>

                        <div className="footer-section">
                            <h4>Para doctores</h4>
                            <Link to="/register-doctor" className="footer-link">Registrarse como doctor</Link>
                            <Link to="/doctor-benefits" className="footer-link">Beneficios</Link>
                        </div>

                        <div className="footer-section">
                            <h4>Legal</h4>
                            <Link to="/privacy" className="footer-link">Política de privacidad</Link>
                            <Link to="/terms" className="footer-link">Términos de servicio</Link>
                            <Link to="/cookies" className="footer-link">Política de cookies</Link>
                        </div>
                    </div>
                </div>

                <div className="footer-bottom">

                    <div className="social-links">
                        <a href="#!" className="social-link">Facebook</a>
                        <a href="#!" className="social-link">Twitter</a>
                        <a href="#!" className="social-link">LinkedIn</a>
                        <a href="#!" className="social-link">Instagram</a>
                    </div>

     
                </div>
            </div>
        </footer>
    );
};

export default Footer;