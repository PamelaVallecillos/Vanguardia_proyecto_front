import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import { FiBell } from 'react-icons/fi';


const Navbar = () => {


    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isPatient, setIsPatient] = useState(false);
    const [isDoctor, setIsDoctor] = useState(false);

    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [notificationsCount, setNotificationsCount] = useState(0);
    const location = useLocation();
    const navigate = useNavigate();


    useEffect(() => {
        checkAuthStatus();
    }, [location]);


    const checkAuthStatus = () => {
        setIsAuthenticated(apiService.isAuthenticated())
        setIsPatient(apiService.isPatient());
        setIsDoctor(apiService.isDoctor());
    }

    const handleLogoutClick = () => {
        setShowLogoutModal(true)
    }

    // TODO: Replace with real fetch for user's unread notifications count
    useEffect(() => {
        // Example: fetch count from an endpoint e.g. /notifications/count
        // For now initialize to 0 or a mocked value
        setNotificationsCount(0);
    }, [isAuthenticated]);

    const handleConfirmLogout = () => {
        apiService.logout();
        setShowLogoutModal(false)
        navigate('/')
    }

    const handleCancelLogout = () => {
        setShowLogoutModal(false)
    }

    const isActiveLink = (path) => {
        return location.pathname === path ? 'nav-link active' : 'nav-link';
    };


    return (
        <>
            <nav className="navbar">
                <div className="container">
                    <div className="navbar-content">
                        <Link to="/" className="logo">
                            AgendaSalud
                        </Link>

                        <div className="nav-links">
                            <div className="nav-left">
                                <Link to="/" className={isActiveLink('/') }>
                                    Inicio
                                </Link>

                                {!isAuthenticated ? (
                                    <>
                                        <Link to="/login" className={isActiveLink('/login')}>
                                            Acceder
                                        </Link>
                                        <Link to="/register" className={isActiveLink('/register')}>
                                            Registrarse como paciente
                                        </Link>
                                        <Link to="/register-doctor" className={isActiveLink('/register-doctor')}>
                                            Registrarse como doctor
                                        </Link>
                                    </>
                                ) : (
                                    <>
                                        {/* Patient specific links */}
                                        {isPatient && (
                                            <>
                                                <Link to="/profile" className={isActiveLink('/profile')}>
                                                    Perfil
                                                </Link>
                                                <Link to="/book-appointment" className={isActiveLink('/book-appointment')}>
                                                    Reservar cita
                                                </Link>
                                                <Link to="/my-appointments" className={isActiveLink('/my-appointments')}>
                                                    Mis citas
                                                </Link>
                                            </>
                                        )}

                                        {/* Doctor specific links */}
                                        {isDoctor && (
                                            <>
                                                <Link to="/doctor/profile" className={isActiveLink('/doctor/profile')}>
                                                    Perfil de doctor
                                                </Link>
                                                <Link to="/doctor/appointments" className={isActiveLink('/doctor/appointments')}>
                                                    Mis citas
                                                </Link>
                                            </>
                                        )}

                                        {/* Notification button placed after links so logout can sit at extreme right */}
                                        {isAuthenticated && (
                                            <button
                                                onClick={() => navigate('/notifications')}
                                                className="notif-circle"
                                                aria-label="Notificaciones"
                                                title="Notificaciones"
                                            >
                                                <span className="notif-icon"><FiBell className="notif-bell" /></span>
                                                {notificationsCount > 0 && (
                                                    <span className="notif-badge">{notificationsCount}</span>
                                                )}
                                            </button>
                                        )}
                                    </>
                                )}
                            </div>

                            <div className="nav-right">
                                {isAuthenticated && (
                                    <button onClick={handleLogoutClick} className="logout-btn">
                                        Cerrar sesión
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </nav>



            {/* Logout Confirmation Modal */}
            {showLogoutModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h3>Confirmar cierre de sesión</h3>
                        </div>
                        <div className="modal-body">
                            <p>¿Estás seguro de que deseas cerrar sesión?</p>
                        </div>
                        <div className="modal-actions">
                            <button
                                onClick={handleCancelLogout}
                                className="btn btn-secondary"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleConfirmLogout}
                                className="btn btn-primary"
                            >
                                Sí, cerrar sesión
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default Navbar;

