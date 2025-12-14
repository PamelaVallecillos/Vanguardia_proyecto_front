import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api';
import { FiChevronDown } from 'react-icons/fi';
import CalendarComponent from '../../components/CalendarComponent';



const DoctorProfile = () => {


    const [userData, setUserData] = useState(null);
    const [doctorData, setDoctorData] = useState(null);
    const [activeTab, setActiveTab] = useState('info-profesional');
    const [appointments, setAppointments] = useState([]);
    const [consultations, setConsultations] = useState([]);
    const [patients, setPatients] = useState([]);
    const [error, setError] = useState('');
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const [uploadSuccess, setUploadSuccess] = useState('');
    const navigate = useNavigate();


    useEffect(() => {
        fetchDoctorData();
    }, [])


    const fetchDoctorData = async () => {
        try {

            // Fetch user details
            const userResponse = await apiService.getMyUserDetails();

            if (userResponse.data.statusCode === 200) {
                setUserData(userResponse.data.data);

                // Fetch doctor profile
                const doctorResponse = await apiService.getMyDoctorProfile();
                if (doctorResponse.data.statusCode === 200) {
                    setDoctorData(doctorResponse.data.data);
                }
            }

        } catch (error) {
            setError('Error al cargar los datos del perfil');
            console.error('Error al cargar el perfil del doctor:', error);

        }
    };

    const fetchAppointments = async () => {
        try {
            const response = await apiService.getMyAppointments();
            if (response.data.statusCode === 200) {
                setAppointments(response.data.data);
            }
        } catch (error) {
            console.error('Error al cargar citas:', error);
        }
    };

    const fetchConsultations = async () => {
        try {
            if (!doctorData?.id) {
                console.error('No doctor ID available');
                return;
            }
            // Aquí necesitarás un endpoint específico para obtener consultas del doctor
            // const response = await apiService.getConsultationsForDoctor(doctorData.id);
            // if (response.data.statusCode === 200) {
            //     setConsultations(response.data.data);
            // }
        } catch (error) {
            console.error('Error al cargar consultas:', error);
        }
    };

    const fetchPatients = async () => {
        try {
            // Aquí necesitarás un endpoint específico para obtener pacientes del doctor
            // const response = await apiService.getPatientsForDoctor();
            // if (response.data.statusCode === 200) {
            //     setPatients(response.data.data);
            // }
        } catch (error) {
            console.error('Error al cargar pacientes:', error);
        }
    }



    const handleUpdateProfile = () => {
        navigate('/doctor/update-profile');
    };

    const handleUpdatePassword = () => {
        navigate('/update-password');
    };


    const handleProfilePictureChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file type
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            setUploadError('Por favor seleccione un archivo válido para las imagenes (JPEG, PNG, GIF)');
            return;
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            setUploadError('El tamaño del archivo debe ser menor a 10MB');
            return;
        }

        setUploading(true);
        setUploadError('');
        setUploadSuccess('');

        try {
            const response = await apiService.uploadProfilePicture(file);
            if (response.data.statusCode === 200) {
                setUploadSuccess('¡Foto de perfil actualizada con éxito!');
                // Refresh user data to get the new profile picture URL
                fetchDoctorData();
                // Clear the file input
                event.target.value = '';
            } else {
                setUploadError(response.data.message || 'No se pudo subir la foto de perfil');
            }
        } catch (error) {
            setUploadError(error.response?.data?.message || 'Ocurrió un error al subir la foto');
        } finally {
            setUploading(false);
        }
    };



    const formatSpecialization = (spec) => {
        if (!spec) return 'No especificado';
        return spec.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
    };


    // Construct full URL for profile picture
    const getProfilePictureUrl = () => {

        console.log("PRofile url is: ", userData?.profilePictureUrl)
        if (!userData?.profilePictureUrl) return null;
        return userData.profilePictureUrl;
    };


    if (error) {
        return (
            <div className="container">
                <div className="form-container">
                    <div className="alert alert-error">{error}</div>
                </div>
            </div>
        );
    }


    return (
        <div className="fb-profile-wrapper">
            {/* Header colorido tipo el gradiente actual */}
            <div className="fb-profile-header">
                <div className="container">
                    <div className="fb-profile-header-content">
                        {/* Foto de perfil */}
                        <div className="fb-profile-picture-wrapper">
                            <div className="fb-profile-picture-container">
                                {getProfilePictureUrl() ? (
                                    <img
                                        src={getProfilePictureUrl()}
                                        alt="Profile"
                                        className="fb-profile-picture"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.nextSibling.style.display = 'flex';
                                        }}
                                    />
                                ) : null}
                                <div className={`fb-profile-picture-placeholder ${getProfilePictureUrl() ? 'hidden' : ''}`}>
                                    {userData?.name?.charAt(0)?.toUpperCase() || 'D'}
                                </div>
                                <div className="fb-profile-picture-overlay">
                                    <label htmlFor="doctor-profile-picture-upload" className="fb-upload-label">
                                        {uploading ? 'Subiendo...' : '📷'}
                                    </label>
                                    <input
                                        id="doctor-profile-picture-upload"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleProfilePictureChange}
                                        disabled={uploading}
                                        style={{ display: 'none' }}
                                    />
                                </div>
                            </div>
                            {uploadError && (
                                <div className="alert alert-error mt-1">
                                    {uploadError}
                                </div>
                            )}
                            {uploadSuccess && (
                                <div className="alert alert-success mt-1">
                                    {uploadSuccess}
                                </div>
                            )}
                        </div>

                        {/* Nombre e info básica */}
                        <div className="fb-profile-info">
                            <h1 className="fb-profile-name">Dr. {userData?.name}</h1>
                            <p className="fb-profile-friends">{doctorData && formatSpecialization(doctorData.specialization)}</p>
                        </div>
                    </div>

                    {/* Botones de acción */}
                    <div className="fb-profile-actions">
                        <button onClick={handleUpdateProfile} className="fb-btn fb-btn-secondary">
                            ✏️ Editar perfil
                        </button>
                        <button onClick={handleUpdatePassword} className="fb-btn fb-btn-icon">
                            <FiChevronDown size={20} />
                        </button>
                    </div>

                    {/* Tabs de navegación */}
                    <div className="fb-profile-tabs">
                        <button 
                            className={`fb-tab ${activeTab === 'info-profesional' ? 'active' : ''}`}
                            onClick={() => setActiveTab('info-profesional')}
                        >
                            Información profesional
                        </button>
                        <button 
                            className={`fb-tab ${activeTab === 'control-citas' ? 'active' : ''}`}
                            onClick={() => {
                                setActiveTab('control-citas');
                                fetchAppointments();
                            }}
                        >
                            Control de citas
                        </button>
                        <button 
                            className={`fb-tab ${activeTab === 'historial-consultas' ? 'active' : ''}`}
                            onClick={() => {
                                setActiveTab('historial-consultas');
                                fetchConsultations();
                            }}
                        >
                            Historial de consultas
                        </button>
                        <button 
                            className={`fb-tab ${activeTab === 'historial-pacientes' ? 'active' : ''}`}
                            onClick={() => {
                                setActiveTab('historial-pacientes');
                                fetchPatients();
                            }}
                        >
                            Historial de pacientes
                        </button>
                        <button 
                            className={`fb-tab ${activeTab === 'calendario' ? 'active' : ''}`}
                            onClick={() => setActiveTab('calendario')}
                        >
                            Calendario
                        </button>
                    </div>
                </div>
            </div>

            {/* Contenido principal */}
            <div className="fb-profile-content">
                <div className="container">
                    <div className="fb-profile-layout">
                        {/* Columna izquierda: Info de cuenta */}
                        <div className="fb-profile-sidebar">
                            <div className="fb-card">
                                <h3 className="fb-card-title">Información de Cuenta</h3>
                                <div className="fb-info-list">
                                    <div className="fb-info-item">
                                        <span className="fb-info-icon">📧</span>
                                        <span className="fb-info-text">{userData?.email || 'No proporcionado'}</span>
                                    </div>
                                    <div className="fb-info-item">
                                        <span className="fb-info-icon">👤</span>
                                        <span className="fb-info-text">
                                            {userData?.roles?.map(role => role.name).join(', ') || 'No proporcionado'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {doctorData && (
                                <div className="fb-card">
                                    <h3 className="fb-card-title">Resumen Profesional</h3>
                                    <div className="fb-info-list">
                                        <div className="fb-info-item">
                                            <span className="fb-info-icon">🏥</span>
                                            <span className="fb-info-text">{formatSpecialization(doctorData.specialization)}</span>
                                        </div>
                                        <div className="fb-info-item">
                                            <span className="fb-info-icon">🆔</span>
                                            <span className="fb-info-text">ID: {doctorData.id}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Columna derecha: Contenido principal */}
                        <div className="fb-profile-main">
                            {activeTab === 'info-profesional' && (
                                <>
                                    {doctorData ? (
                                        <>
                                            <div className="fb-card">
                                                <h3 className="fb-card-title">Información Profesional</h3>
                                                <div className="fb-medical-grid">
                                                    <div className="fb-medical-item">
                                                        <label>Nombre</label>
                                                        <p>{doctorData.firstName || 'No proporcionado'}</p>
                                                    </div>
                                                    <div className="fb-medical-item">
                                                        <label>Apellido</label>
                                                        <p>{doctorData.lastName || 'No proporcionado'}</p>
                                                    </div>
                                                    <div className="fb-medical-item">
                                                        <label>Género</label>
                                                        <p>{doctorData.gender || 'No proporcionado'}</p>
                                                    </div>
                                                    <div className="fb-medical-item">
                                                        <label>Teléfono</label>
                                                        <p>{doctorData.phone || 'No proporcionado'}</p>
                                                    </div>
                                                    <div className="fb-medical-item fb-full-width">
                                                        <label>Especialización Principal</label>
                                                        <p>{formatSpecialization(doctorData.specialization)}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Especializaciones Adicionales */}
                                            <div className="fb-card">
                                                <h3 className="fb-card-title">Especializaciones</h3>
                                                <div className="fb-medical-grid">
                                                    <div className="fb-medical-item fb-full-width">
                                                        <label>Especialización Principal</label>
                                                        <p>{formatSpecialization(doctorData.specialization)}</p>
                                                    </div>
                                                    <div className="fb-medical-item fb-full-width">
                                                        <label>Especializaciones Adicionales</label>
                                                        {doctorData.additionalSpecializations && doctorData.additionalSpecializations.length > 0 ? (
                                                            <div className="tags-display">
                                                                {doctorData.additionalSpecializations.map((spec, index) => (
                                                                    <span key={index} className="tag-display">
                                                                        {spec.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <p className="text-muted">No se han agregado especializaciones adicionales</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Restricciones de Pacientes */}
                                            <div className="fb-card">
                                                <h3 className="fb-card-title">Restricciones de Pacientes</h3>
                                                <div className="fb-medical-grid">
                                                    <div className="fb-medical-item">
                                                        <label>Restricción de Género</label>
                                                        <p>
                                                            {doctorData.genderRestriction 
                                                                ? doctorData.genderRestriction === 'MALE' 
                                                                    ? 'Solo Hombres' 
                                                                    : doctorData.genderRestriction === 'FEMALE' 
                                                                        ? 'Solo Mujeres' 
                                                                        : 'Sin restricción'
                                                                : 'Sin restricción'}
                                                        </p>
                                                    </div>
                                                    <div className="fb-medical-item">
                                                        <label>Edad Mínima</label>
                                                        <p>{doctorData.minAge ? `${doctorData.minAge} años` : 'Sin restricción'}</p>
                                                    </div>
                                                    <div className="fb-medical-item">
                                                        <label>Edad Máxima</label>
                                                        <p>{doctorData.maxAge ? `${doctorData.maxAge} años` : 'Sin restricción'}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="fb-card">
                                            <div className="alert alert-info">
                                                <p>No se encontró un perfil de doctor. Por favor, actualice su perfil para agregar información profesional.</p>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}

                            {activeTab === 'control-citas' && (
                                <div className="fb-card">
                                    <h3 className="fb-card-title">Control de Citas</h3>
                                    {appointments.length > 0 ? (
                                        <div className="fb-appointments-list">
                                            {appointments.map((appointment) => (
                                                <div key={appointment.id} className="fb-appointment-card">
                                                    <div className="fb-appointment-header">
                                                        <h4>{appointment.patientName || 'Paciente'}</h4>
                                                        <span className={`fb-status-badge status-${appointment.status?.toLowerCase()}`}>
                                                            {appointment.status}
                                                        </span>
                                                    </div>
                                                    <div className="fb-appointment-details">
                                                        <p><strong>Fecha:</strong> {new Date(appointment.appointmentDate).toLocaleDateString('es-ES')}</p>
                                                        <p><strong>Hora:</strong> {appointment.appointmentTime}</p>
                                                        {appointment.reason && <p><strong>Motivo:</strong> {appointment.reason}</p>}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="fb-empty-state">No tienes citas programadas</p>
                                    )}
                                </div>
                            )}

                            {activeTab === 'historial-consultas' && (
                                <div className="fb-card">
                                    <h3 className="fb-card-title">Historial de Consultas</h3>
                                    {consultations.length > 0 ? (
                                        <div className="fb-consultations-list">
                                            {consultations.map((consultation) => (
                                                <div key={consultation.id} className="fb-consultation-card">
                                                    <div className="fb-consultation-header">
                                                        <h4>Consulta - {consultation.patientName || 'Paciente'}</h4>
                                                        <span className="fb-consultation-date">
                                                            {new Date(consultation.consultationDate).toLocaleDateString('es-ES')}
                                                        </span>
                                                    </div>
                                                    <div className="fb-consultation-details">
                                                        {consultation.subjectiveNotes && (
                                                            <div className="fb-consultation-section">
                                                                <p><strong>Notas Subjetivas:</strong></p>
                                                                <p>{consultation.subjectiveNotes}</p>
                                                            </div>
                                                        )}
                                                        {consultation.assessment && (
                                                            <div className="fb-consultation-section">
                                                                <p><strong>Evaluación:</strong></p>
                                                                <p>{consultation.assessment}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="fb-empty-state">No hay consultas en el historial</p>
                                    )}
                                </div>
                            )}

                            {activeTab === 'historial-pacientes' && (
                                <div className="fb-card">
                                    <h3 className="fb-card-title">Historial de Pacientes</h3>
                                    {patients.length > 0 ? (
                                        <div className="fb-patients-list">
                                            {patients.map((patient) => (
                                                <div key={patient.id} className="fb-patient-card">
                                                    <div className="fb-patient-header">
                                                        <h4>{patient.firstName} {patient.lastName}</h4>
                                                    </div>
                                                    <div className="fb-patient-details">
                                                        <p><strong>Última visita:</strong> {patient.lastVisit ? new Date(patient.lastVisit).toLocaleDateString('es-ES') : 'N/A'}</p>
                                                        <p><strong>Total de consultas:</strong> {patient.consultationsCount || 0}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="fb-empty-state">No hay historial de pacientes disponible</p>
                                    )}
                                </div>
                            )}

                            {activeTab === 'calendario' && (
                                <div className="fb-card">
                                    <h3 className="fb-card-title">Calendario de Citas</h3>
                                    <div className="calendar-container">
                                        <CalendarComponent appointments={appointments} />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
export default DoctorProfile;