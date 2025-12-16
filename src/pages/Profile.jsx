import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import { FiChevronDown } from 'react-icons/fi';
import CalendarComponent from '../components/CalendarComponent';
import { parseLocalDateTimeToDate } from '../utils/dateUtils';



const Profile = () => {

    const [userData, setUserData] = useState(null)
    const [patientData, setPatientData] = useState(null)
    const [activeTab, setActiveTab] = useState('info-medica');
    const [appointments, setAppointments] = useState([]);
    const [consultations, setConsultations] = useState([]);
    const [dependents, setDependents] = useState([]);
    const [loadingDependents, setLoadingDependents] = useState(false);
    const [doctors, setDoctors] = useState([]);
    const [loadingDoctors, setLoadingDoctors] = useState(false);
    const [openMenuId, setOpenMenuId] = useState(null);
    const [openDoctorMenuId, setOpenDoctorMenuId] = useState(null);
    const [showDoctorModal, setShowDoctorModal] = useState(false);
    const [selectedDoctor, setSelectedDoctor] = useState(null);

    const [error, setError] = useState('');
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const [uploadSuccess, setUploadSuccess] = useState('');
    const navigate = useNavigate();


    useEffect(() => {
        fetchUserData();
        fetchDependents();
    }, [])


    const fetchUserData = async () => {

        try {

            // Fetch user details
            const userResponse = await apiService.getMyUserDetails();

            if (userResponse.data.statusCode === 200) {
                setUserData(userResponse.data.data);

                // Fetch patient profile if user is a patient
                if (userResponse.data.data.roles.some(role => role.name === 'PATIENT')) {
                    const patientResponse = await apiService.getMyPatientProfile();
                    if (patientResponse.data.statusCode === 200) {
                        setPatientData(patientResponse.data.data);
                    }
                }

            }

        } catch (error) {

            setError('Error al cargar los datos del perfil');
            console.error('Error al cargar el perfil: ', error);
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
            if (!patientData?.id) {
                console.error('No patient ID available');
                return;
            }
            const response = await apiService.getConsultationHistoryForPatient(patientData.id);
            console.log('Consultations response:', response.data);
            if (response.data.statusCode === 200) {
                setConsultations(response.data.data);
            }
        } catch (error) {
            console.error('Error al cargar consultas:', error);
        }
    }

    const fetchDependents = async () => {
        setLoadingDependents(true);
        try {
            const response = await apiService.getMyDependents();
            if (response.data.statusCode === 200) {
                setDependents(response.data.data);
            }
        } catch (error) {
            console.error('Error al cargar dependientes:', error);
        } finally {
            setLoadingDependents(false);
        }
    };

    const fetchDoctors = async () => {
        setLoadingDoctors(true);
        try {
            const response = await apiService.getAllDoctors();
            if (response.data.statusCode === 200) {
                setDoctors(response.data.data);
            }
        } catch (error) {
            console.error('Error al cargar doctores:', error);
        } finally {
            setLoadingDoctors(false);
        }
    };

    const handleToggleMenu = (id) => {
        setOpenMenuId(prev => (prev === id ? null : id));
    };

    const handleViewProfile = (dependentId) => {
        setOpenMenuId(null);
        navigate(`/dependents/${dependentId}`);
    };

    const handleToggleDoctorMenu = (id) => {
        setOpenDoctorMenuId(prev => (prev === id ? null : id));
    };

    const handleViewDoctorDetails = (doctorId) => {
        setOpenDoctorMenuId(null);
        const doctor = doctors.find(d => d.id === doctorId);
        if (doctor) {
            console.log('Doctor seleccionado COMPLETO:', JSON.stringify(doctor, null, 2));
            console.log('Campos del doctor:', Object.keys(doctor));
            console.log('minPatientAge:', doctor.minPatientAge);
            console.log('maxPatientAge:', doctor.maxPatientAge);
            console.log('workingHours:', doctor.workingHours);
            console.log('availability:', doctor.availability);
            console.log('schedule:', doctor.schedule);
            console.log('restrictions:', doctor.restrictions);
            console.log('patientRestrictions:', doctor.patientRestrictions);
            setSelectedDoctor(doctor);
            setShowDoctorModal(true);
        }
    };

    const handleCloseDoctorModal = () => {
        setShowDoctorModal(false);
        setSelectedDoctor(null);
    };

    const formatSpecialization = (spec) => {
        if (!spec) return 'No especificado';
        return spec.replace(/_/g, ' ');
    };

    const formatWorkingHours = (hours) => {
        if (!hours || hours.length === 0) return 'No especificado';
        return hours.join(', ');
    };

    const formatDateTime = (dateTimeString) => {
        try {
            const d = parseLocalDateTimeToDate(dateTimeString) || new Date(dateTimeString);
            return d.toLocaleString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (e) {
            return dateTimeString;
        }
    };


    const getStatusBadge = (status) => {
        const statusConfig = {
            'SCHEDULED': { class: 'status-scheduled', text: 'Programada' },
            'COMPLETED': { class: 'status-completed', text: 'Completada' },
            'CANCELLED': { class: 'status-cancelled', text: 'Cancelada' },
            'IN_PROGRESS': { class: 'status-in-progress', text: 'En progreso' }
        };

        const config = statusConfig[status] || { class: 'status-default', text: status };
        return <span className={`status-badge ${config.class}`}>{config.text}</span>;
    };


    const handleCancelAppointment = async (appointmentId) => {
        if (!window.confirm('¿Estás seguro de que deseas cancelar esta cita?')) {
            return;
        }

        try {
            const response = await apiService.cancelAppointment(appointmentId);
            if (response.data.statusCode === 200) {
                // Refresh appointments list
                fetchAppointments();
            } else {
                setError('Error al cancelar la cita');
            }
        } catch (error) {
            setError('Error al cancelar la cita');
        }
    };


    const handleUpdateProfile = () => {
        navigate('/update-profile');
    };

    const handleUpdatePassword = () => {
        navigate('/update-password');
    };


    const handleProfilePictureChange = async (event) => {

        const file = event.target.files[0];
        if (!file) return;

        // Validate file type
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', ];
        if (!validTypes.includes(file.type)) {
            setUploadError('Por favor selecciona un archivo de imagen válido (JPEG, PNG, GIF)');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setUploadError('El tamaño del archivo debe ser menor a 5MB');
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
                fetchUserData();
                // Clear the file input
                event.target.value = '';
            } else {
                setUploadError(response.data.message || 'Error al subir la foto de perfil');
            }
        } catch (error) {
            setUploadError(error.response?.data?.message || 'Ocurrió un error al subir la foto');
        } finally {
            setUploading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'No proporcionado';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatGender = (gender) => {
        if (!gender) return 'No proporcionado';
        const map = {
            'MASCULINO': 'Masculino',
            'FEMENINO': 'Femenino',
            'MALE': 'Masculino',
            'FEMALE': 'Femenino',
            'OTHER': 'Otro',
            'UNKNOWN': 'Prefiero no decir'
        };
        return map[gender] || gender;
    };

    const formatBloodGroup = (bloodGroup) => {
        if (!bloodGroup) return 'No proporcionado';
        return bloodGroup.replace('_', ' ');
    };

    // Construct full URL for profile picture
    const getProfilePictureUrl = () => {
        const url = userData?.profilePictureUrl;
        if (!url) return null;

        // Add cache buster when upload succeeded recently to force browser refresh
        const cacheBuster = uploadSuccess ? `?t=${Date.now()}` : '';

        try {
            if (url.startsWith('http://') || url.startsWith('https://')) {
                return `${url}${cacheBuster}`;
            }
        } catch (e) {
            // ignore
        }

        if (url.startsWith('/')) {
            return `http://localhost:8080${url}${cacheBuster}`;
        }

        return `http://localhost:8080/${url}${cacheBuster}`;
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
                                    {userData?.name?.charAt(0)?.toUpperCase() || 'U'}
                                </div>
                                <div className="fb-profile-picture-overlay">
                                    <label htmlFor="profile-picture-upload" className="fb-upload-label">
                                        {uploading ? 'Subiendo...' : '📷'}
                                    </label>
                                    <input
                                        id="profile-picture-upload"
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
                            <h1 className="fb-profile-name">{userData?.name}</h1>
                            <p className="fb-profile-friends">{userData?.email}</p>
                        </div>
                    </div>

                    {/* Botones de acción */}
                    <div className="fb-profile-actions">
                        <button onClick={() => navigate('/agregar-dependiente')} className="fb-btn fb-btn-primary">
                            + Agregar dependiente
                        </button>
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
                            className={`fb-tab ${activeTab === 'info-medica' ? 'active' : ''}`}
                            onClick={() => setActiveTab('info-medica')}
                        >
                            Información Médica
                        </button>
                        {/* 'Hacer cita' removed — use Nav 'Reservar cita' instead */}
                        <button 
                            className={`fb-tab ${activeTab === 'mis-citas' ? 'active' : ''}`}
                            onClick={() => {
                                setActiveTab('mis-citas');
                                fetchAppointments();
                            }}
                        >
                            Mis citas
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
                            className={`fb-tab ${activeTab === 'doctores' ? 'active' : ''}`}
                            onClick={() => {
                                setActiveTab('doctores');
                                fetchDoctors();
                            }}
                        >
                            Doctores
                        </button>
                        <button 
                            className={`fb-tab ${activeTab === 'calendario' ? 'active' : ''}`}
                            onClick={() => {
                                setActiveTab('calendario');
                                fetchAppointments();
                            }}
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
                        {/* Columna izquierda: Información de contacto y datos personales */}
                        <div className="fb-profile-sidebar">
                            <div className="fb-card">
                                <h3 className="fb-card-title">Información de Contacto</h3>
                                <div className="fb-info-list">
                                    <div className="fb-info-item">
                                        <span className="fb-info-icon">📧</span>
                                        <span className="fb-info-text">{userData?.email || 'No proporcionado'}</span>
                                    </div>
                                    {patientData && (
                                        <div className="fb-info-item">
                                            <span className="fb-info-icon">📞</span>
                                            <span className="fb-info-text">{patientData.phone || 'No proporcionado'}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {patientData && (
                                <div className="fb-card">
                                    <h3 className="fb-card-title">Datos Personales</h3>
                                    <div className="fb-info-list">
                                        <div className="fb-info-item">
                                            <span className="fb-info-icon">👤</span>
                                            <span className="fb-info-text">
                                                {`${patientData.firstName || ''} ${patientData.lastName || ''}`.trim() || 'No proporcionado'}
                                            </span>
                                        </div>
                                                <div className="fb-info-item">
                                                    <span className="fb-info-icon">📅</span>
                                                    <span className="fb-info-text">{formatDate(patientData.dateOfBirth)}</span>
                                                </div>
                                                <div className="fb-info-item">
                                                    <span className="fb-info-icon">🚻</span>
                                                    <span className="fb-info-text">{formatGender(patientData.gender)}</span>
                                                </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Columna derecha: Contenido principal */}
                        <div className="fb-profile-main">
                            {activeTab === 'info-medica' && (
                                <>
                                    {patientData ? (
                                        <>
                                            <div className="fb-card">
                                                <h3 className="fb-card-title">Información Médica</h3>
                                                
                                                {/* Número de Expediente */}
                                                <div className="alert alert-info" style={{ marginBottom: '20px' }}>
                                                    <strong>Número de Expediente:</strong> {patientData.expedienteNumber || 'No asignado'}
                                                </div>
                                                
                                                <div className="fb-medical-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                                                    <div className="fb-medical-item">
                                                        <label>Grupo Sanguíneo</label>
                                                        <p>{formatBloodGroup(patientData.bloodGroup)}</p>
                                                    </div>
                                                    <div className="fb-medical-item">
                                                        <label>Genotipo</label>
                                                        <p>{patientData.genotype || 'No proporcionado'}</p>
                                                    </div>
                                                    <div className="fb-medical-item">
                                                        <label>Alergias Conocidas</label>
                                                        <p>{patientData.knownAllergies || 'No hay alergias conocidas'}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Sección de Dependientes */}
                                            <div className="fb-card" style={{ marginTop: '20px' }}>
                                                <h3 className="fb-card-title">Dependientes</h3>
                                                <div className="fb-dependents-list">
                                                    {loadingDependents ? (
                                                        <p className="fb-empty-state">Cargando...</p>
                                                    ) : dependents.length > 0 ? (
                                                        dependents.map(dependent => (
                                                            <div key={dependent.id} className="fb-dependent-item" style={{
                                                                padding: '12px',
                                                                borderBottom: '1px solid #eee',
                                                                display: 'flex',
                                                                justifyContent: 'space-between',
                                                                alignItems: 'center',
                                                                gap: '12px',
                                                                position: 'relative'
                                                            }}>
                                                                {/* Foto del dependiente */}
                                                                <div style={{
                                                                    width: '50px',
                                                                    height: '50px',
                                                                    borderRadius: '50%',
                                                                    overflow: 'hidden',
                                                                    flexShrink: 0,
                                                                    backgroundColor: '#f0f2f5',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center'
                                                                }}>
                                                                    {dependent.profilePhoto ? (
                                                                        <img 
                                                                            src={`http://localhost:8080${dependent.profilePhoto}`}
                                                                            alt={`${dependent.firstName} ${dependent.lastName}`}
                                                                            style={{
                                                                                width: '100%',
                                                                                height: '100%',
                                                                                objectFit: 'cover'
                                                                            }}
                                                                            onError={(e) => {
                                                                                e.target.style.display = 'none';
                                                                                e.target.parentElement.innerHTML = '<span style="font-size: 24px;">👤</span>';
                                                                            }}
                                                                        />
                                                                    ) : (
                                                                        <span style={{ fontSize: '24px' }}>👤</span>
                                                                    )}
                                                                </div>
                                                                
                                                                {/* Información del dependiente */}
                                                                <div style={{ flex: 1 }}>
                                                                    <strong>{dependent.firstName} {dependent.lastName}</strong>
                                                                    <p style={{ fontSize: '12px', color: '#666', margin: '4px 0' }}>
                                                                        {dependent.relationship} - Expediente: {dependent.expedienteNumber}
                                                                    </p>
                                                                </div>
                                                                
                                                                {/* Menú de tres puntos */}
                                                                <div style={{ flexShrink: 0, position: 'relative' }}>
                                                                    <button
                                                                        onClick={() => handleToggleMenu(dependent.id)}
                                                                        aria-expanded={openMenuId === dependent.id}
                                                                        style={{
                                                                            cursor: 'pointer',
                                                                            padding: '8px',
                                                                            fontSize: '18px',
                                                                            color: '#65676b',
                                                                            background: 'transparent',
                                                                            border: 'none'
                                                                        }}
                                                                    >
                                                                        ⋮
                                                                    </button>

                                                                    {openMenuId === dependent.id && (
                                                                        <div style={{
                                                                            position: 'absolute',
                                                                            right: 0,
                                                                            top: '36px',
                                                                            background: '#fff',
                                                                            boxShadow: '0 6px 18px rgba(0,0,0,0.08)',
                                                                            borderRadius: '6px',
                                                                            zIndex: 50,
                                                                            minWidth: '140px',
                                                                            overflow: 'hidden'
                                                                        }}>
                                                                            <button
                                                                                onClick={() => handleViewProfile(dependent.id)}
                                                                                style={{
                                                                                    display: 'block',
                                                                                    width: '100%',
                                                                                    textAlign: 'left',
                                                                                    padding: '10px 12px',
                                                                                    border: 'none',
                                                                                    background: 'transparent',
                                                                                    cursor: 'pointer'
                                                                                }}
                                                                            >
                                                                                Ver perfil
                                                                            </button>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <p className="fb-empty-state">No hay dependientes registrados</p>
                                                    )}
                                                    {dependents.length > 0 && (
                                                        <button 
                                                            className="fb-btn fb-btn-link" 
                                                            onClick={() => navigate('/agregar-dependiente')}
                                                        >
                                                            + Agregar otro dependiente
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="fb-card">
                                            <div className="alert alert-info">
                                                <p>No se encontró un perfil de paciente. Por favor, actualice su perfil para agregar información médica.</p>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}

                            {activeTab === 'mis-citas' && (
                                <div className="fb-card">
                                    <h3 className="fb-card-title">Mis Citas</h3>

                                    {appointments.length === 0 ? (
                                        <div className="fb-empty-state">
                                            <h3>No se encontraron citas</h3>
                                            <p>Aún no has reservado ninguna cita.</p>
                                        </div>
                                    ) : (
                                        <div className="fb-appointments-list">
                                            {appointments.map((appointment) => (
                                                <div key={appointment.id} className="fb-appointment-card appointment-card">
                                                    <div className="appointment-header">
                                                        <div className="appointment-info">
                                                            <h3 className="doctor-name">Dr. {appointment.doctor?.firstName} {appointment.doctor?.lastName}</h3>
                                                            <p className="specialization">{appointment.doctor?.specialization?.replace(/_/g, ' ')}</p>
                                                        </div>
                                                            <div className="appointment-actions">
                                                            {getStatusBadge(appointment.status)}
                                                            {appointment.status === 'SCHEDULED' && (
                                                                <>
                                                                    <button
                                                                        onClick={() => navigate('/book-appointment', { state: { editAppointment: appointment } })}
                                                                        className="btn btn-outline btn-sm"
                                                                        style={{ marginRight: 8 }}
                                                                    >
                                                                        Editar
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleCancelAppointment(appointment.id)}
                                                                        className="btn btn-danger btn-sm"
                                                                    >
                                                                        Cancel
                                                                    </button>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="appointment-details">
                                                        <div className="detail-row">
                                                            <div className="detail-item">
                                                                <label>Fecha y hora :</label>
                                                                <span>{formatDateTime(appointment.startTime || appointment.appointmentDate)}</span>
                                                            </div>
                                                            <div className="detail-item">
                                                                <label>Duración:</label>
                                                                <span>1 hora</span>
                                                            </div>
                                                        </div>

                                                        {appointment.purposeOfConsultation && (
                                                            <div className="detail-item">
                                                                <label>Propósito:</label>
                                                                <span>{appointment.purposeOfConsultation}</span>
                                                            </div>
                                                        )}

                                                        {appointment.initialSymptoms && (
                                                            <div className="detail-item">
                                                                <label>Síntomas:</label>
                                                                <span>{appointment.initialSymptoms}</span>
                                                            </div>
                                                        )}

                                                        {appointment.meetingLink && appointment.status === 'SCHEDULED' && (
                                                            <div className="detail-item">
                                                                <label>Enlace de la reunión:</label>
                                                                <a href={appointment.meetingLink} target="_blank" rel="noopener noreferrer" className="meeting-link">Unirse a la consulta por video</a>
                                                            </div>
                                                        )}

                                                        {appointment.status === 'COMPLETED' && (
                                                            <div className="detail-item">
                                                                <Link to={`/consultation-history?appointmentId=${appointment.id}`} className="btn btn-outline btn-sm">Ver notas de la consulta</Link>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
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
                                                        <h4>Notas de Consulta</h4>
                                                        <span className="fb-consultation-date">
                                                            {new Date(consultation.consultationDate).toLocaleDateString('es-ES', {
                                                                year: 'numeric',
                                                                month: 'long',
                                                                day: 'numeric'
                                                            })}
                                                        </span>
                                                    </div>
                                                    <div className="fb-consultation-details">
                                                        {consultation.subjectiveNotes && (
                                                            <div className="fb-consultation-section">
                                                                <p><strong>Notas Subjetivas:</strong></p>
                                                                <p>{consultation.subjectiveNotes}</p>
                                                            </div>
                                                        )}
                                                        {consultation.objectiveFindings && (
                                                            <div className="fb-consultation-section">
                                                                <p><strong>Hallazgos Objetivos:</strong></p>
                                                                <p>{consultation.objectiveFindings}</p>
                                                            </div>
                                                        )}
                                                        {consultation.assessment && (
                                                            <div className="fb-consultation-section">
                                                                <p><strong>Evaluación:</strong></p>
                                                                <p>{consultation.assessment}</p>
                                                            </div>
                                                        )}
                                                        {consultation.plan && (
                                                            <div className="fb-consultation-section">
                                                                <p><strong>Plan de Tratamiento:</strong></p>
                                                                <p>{consultation.plan}</p>
                                                            </div>
                                                        )}
                                                        {!consultation.subjectiveNotes && !consultation.objectiveFindings && 
                                                         !consultation.assessment && !consultation.plan && (
                                                            <p className="fb-empty-state">No hay detalles disponibles para esta consulta</p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="fb-empty-state">No hay consultas en tu historial</p>
                                    )}
                                </div>
                            )}

                            {activeTab === 'doctores' && (
                                <div className="fb-card">
                                    <h3 className="fb-card-title">Doctores</h3>
                                    <div className="fb-dependents-list">
                                        {loadingDoctors ? (
                                            <p className="fb-empty-state">Cargando...</p>
                                        ) : doctors.length > 0 ? (
                                            doctors.map(doctor => (
                                                <div key={doctor.id} className="fb-dependent-item" style={{
                                                    padding: '12px',
                                                    borderBottom: '1px solid #eee',
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    gap: '12px',
                                                    position: 'relative'
                                                }}>
                                                    {/* Foto del doctor */}
                                                    <div style={{
                                                        width: '50px',
                                                        height: '50px',
                                                        borderRadius: '50%',
                                                        overflow: 'hidden',
                                                        flexShrink: 0,
                                                        backgroundColor: '#f0f2f5',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                    }}>
                                                        {doctor.user?.profilePictureUrl ? (
                                                            <img 
                                                                src={`http://localhost:8080${doctor.user.profilePictureUrl}`}
                                                                alt={`Dr. ${doctor.firstName} ${doctor.lastName}`}
                                                                style={{
                                                                    width: '100%',
                                                                    height: '100%',
                                                                    objectFit: 'cover'
                                                                }}
                                                                onError={(e) => {
                                                                    e.target.style.display = 'none';
                                                                    e.target.parentElement.innerHTML = '<span style="font-size: 24px;">👨‍⚕️</span>';
                                                                }}
                                                            />
                                                        ) : (
                                                            <span style={{ fontSize: '24px' }}>👨‍⚕️</span>
                                                        )}
                                                    </div>
                                                    
                                                    {/* Información del doctor */}
                                                    <div style={{ flex: 1 }}>
                                                        <strong>Dr. {doctor.firstName} {doctor.lastName}</strong>
                                                        <p style={{ fontSize: '12px', color: '#666', margin: '4px 0' }}>
                                                            {doctor.specialization?.replace(/_/g, ' ')}
                                                        </p>
                                                    </div>
                                                    
                                                    {/* Menú de tres puntos */}
                                                    <div style={{ flexShrink: 0, position: 'relative' }}>
                                                        <button
                                                            onClick={() => handleToggleDoctorMenu(doctor.id)}
                                                            aria-expanded={openDoctorMenuId === doctor.id}
                                                            style={{
                                                                cursor: 'pointer',
                                                                padding: '8px',
                                                                fontSize: '18px',
                                                                color: '#65676b',
                                                                background: 'transparent',
                                                                border: 'none'
                                                            }}
                                                        >
                                                            ⋮
                                                        </button>

                                                        {openDoctorMenuId === doctor.id && (
                                                            <div style={{
                                                                position: 'absolute',
                                                                right: 0,
                                                                top: '36px',
                                                                background: '#fff',
                                                                boxShadow: '0 6px 18px rgba(0,0,0,0.08)',
                                                                borderRadius: '6px',
                                                                zIndex: 50,
                                                                minWidth: '140px',
                                                                overflow: 'hidden'
                                                            }}>
                                                                <button
                                                                    onClick={() => handleViewDoctorDetails(doctor.id)}
                                                                    style={{
                                                                        display: 'block',
                                                                        width: '100%',
                                                                        textAlign: 'left',
                                                                        padding: '10px 12px',
                                                                        border: 'none',
                                                                        background: 'transparent',
                                                                        cursor: 'pointer'
                                                                    }}
                                                                >
                                                                    Ver detalles
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="fb-empty-state">No hay doctores registrados</p>
                                        )}
                                    </div>
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

            {/* Modal de Detalles del Doctor */}
            {showDoctorModal && selectedDoctor && (
                <div 
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                        padding: '20px'
                    }}
                    onClick={handleCloseDoctorModal}
                >
                    <div 
                        style={{
                            backgroundColor: 'white',
                            borderRadius: '12px',
                            maxWidth: '700px',
                            width: '100%',
                            maxHeight: '90vh',
                            overflow: 'auto',
                            boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
                            position: 'relative'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header del Modal */}
                        <div style={{
                            padding: '24px',
                            borderBottom: '1px solid #e1e8ed',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            borderRadius: '12px 12px 0 0',
                            color: 'white'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div style={{
                                    width: '60px',
                                    height: '60px',
                                    borderRadius: '50%',
                                    overflow: 'hidden',
                                    backgroundColor: '#fff',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    {selectedDoctor.user?.profilePictureUrl ? (
                                        <img 
                                            src={`http://localhost:8080${selectedDoctor.user.profilePictureUrl}`}
                                            alt={`Dr. ${selectedDoctor.firstName} ${selectedDoctor.lastName}`}
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover'
                                            }}
                                        />
                                    ) : (
                                        <span style={{ fontSize: '30px' }}>👨‍⚕️</span>
                                    )}
                                </div>
                                <div>
                                    <h2 style={{ margin: 0, fontSize: '24px' }}>Dr. {selectedDoctor.firstName} {selectedDoctor.lastName}</h2>
                                    <p style={{ margin: '4px 0 0 0', opacity: 0.9 }}>{formatSpecialization(selectedDoctor.specialization)}</p>
                                </div>
                            </div>
                            <button 
                                onClick={handleCloseDoctorModal}
                                style={{
                                    background: 'rgba(255,255,255,0.2)',
                                    border: 'none',
                                    color: 'white',
                                    fontSize: '24px',
                                    cursor: 'pointer',
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: 0
                                }}
                            >
                                ×
                            </button>
                        </div>

                        {/* Contenido del Modal */}
                        <div style={{ padding: '24px' }}>
                            {/* Información Profesional */}
                            <div style={{ marginBottom: '24px' }}>
                                <h3 style={{ 
                                    fontSize: '18px', 
                                    fontWeight: '600', 
                                    marginBottom: '16px',
                                    color: '#2c3e50',
                                    borderLeft: '4px solid #667eea',
                                    paddingLeft: '12px'
                                }}>
                                    Información Profesional
                                </h3>
                                <div style={{ 
                                    display: 'grid', 
                                    gridTemplateColumns: 'repeat(2, 1fr)', 
                                    gap: '16px',
                                    backgroundColor: '#f8f9fa',
                                    padding: '16px',
                                    borderRadius: '8px'
                                }}>
                                    <div>
                                        <label style={{ 
                                            fontSize: '12px', 
                                            color: '#65676b', 
                                            fontWeight: '600',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px'
                                        }}>
                                            Número de Licencia
                                        </label>
                                        <p style={{ margin: '8px 0 0 0', fontSize: '14px', color: '#2c3e50' }}>
                                            {selectedDoctor.licenseNumber || 'No especificado'}
                                        </p>
                                    </div>
                                    <div>
                                        <label style={{ 
                                            fontSize: '12px', 
                                            color: '#65676b', 
                                            fontWeight: '600',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px'
                                        }}>
                                            Tiempo de Consulta
                                        </label>
                                        <p style={{ margin: '8px 0 0 0', fontSize: '14px', color: '#2c3e50' }}>
                                            {selectedDoctor.consultationDuration || 'No especificado'} minutos
                                        </p>
                                    </div>
                                    <div>
                                        <label style={{ 
                                            fontSize: '12px', 
                                            color: '#65676b', 
                                            fontWeight: '600',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px'
                                        }}>
                                            Especialización Principal
                                        </label>
                                        <p style={{ margin: '8px 0 0 0', fontSize: '14px', color: '#2c3e50' }}>
                                            {formatSpecialization(selectedDoctor.specialization)}
                                        </p>
                                    </div>
                                    <div>
                                        <label style={{ 
                                            fontSize: '12px', 
                                            color: '#65676b', 
                                            fontWeight: '600',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px'
                                        }}>
                                            Especializaciones Adicionales
                                        </label>
                                        <p style={{ margin: '8px 0 0 0', fontSize: '14px', color: '#2c3e50' }}>
                                            {selectedDoctor.additionalSpecializations && selectedDoctor.additionalSpecializations.length > 0 
                                                ? selectedDoctor.additionalSpecializations.map(s => formatSpecialization(s)).join(', ')
                                                : 'Ninguna'}
                                        </p>
                                    </div>
                                    <div style={{ gridColumn: '1 / -1' }}>
                                        <label style={{ 
                                            fontSize: '12px', 
                                            color: '#65676b', 
                                            fontWeight: '600',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px'
                                        }}>
                                            Email profesional
                                        </label>
                                        <p style={{ margin: '8px 0 0 0', fontSize: '14px', color: '#2c3e50' }}>
                                            {selectedDoctor.user?.email || 'No especificado'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Restricciones de Pacientes */}
                            <div style={{ marginBottom: '24px' }}>
                                <h3 style={{ 
                                    fontSize: '18px', 
                                    fontWeight: '600', 
                                    marginBottom: '16px',
                                    color: '#2c3e50',
                                    borderLeft: '4px solid #667eea',
                                    paddingLeft: '12px'
                                }}>
                                    Restricciones de Pacientes
                                </h3>
                                <div style={{ 
                                    backgroundColor: '#f8f9fa',
                                    padding: '16px',
                                    borderRadius: '8px',
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(3, 1fr)',
                                    gap: '16px'
                                }}>
                                    <div>
                                        <label style={{ 
                                            fontSize: '12px', 
                                            color: '#65676b', 
                                            fontWeight: '600',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px'
                                        }}>
                                            Restricción de Género
                                        </label>
                                        <p style={{ margin: '8px 0 0 0', fontSize: '14px', color: '#2c3e50' }}>
                                            {selectedDoctor.genderRestriction 
                                                ? (selectedDoctor.genderRestriction === 'FEMALE' ? 'Solo Mujeres' : 
                                                   selectedDoctor.genderRestriction === 'MALE' ? 'Solo Hombres' : 
                                                   selectedDoctor.genderRestriction)
                                                : 'Sin restricción'}
                                        </p>
                                    </div>
                                    <div>
                                        <label style={{ 
                                            fontSize: '12px', 
                                            color: '#65676b', 
                                            fontWeight: '600',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px'
                                        }}>
                                            Edad Mínima
                                        </label>
                                        <p style={{ margin: '8px 0 0 0', fontSize: '14px', color: '#2c3e50', fontWeight: '500' }}>
                                            {selectedDoctor.minAge !== null && selectedDoctor.minAge !== undefined 
                                                ? `${selectedDoctor.minAge} años` 
                                                : 'Sin restricción'}
                                        </p>
                                    </div>
                                    <div>
                                        <label style={{ 
                                            fontSize: '12px', 
                                            color: '#65676b', 
                                            fontWeight: '600',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px'
                                        }}>
                                            Edad Máxima
                                        </label>
                                        <p style={{ margin: '8px 0 0 0', fontSize: '14px', color: '#2c3e50', fontWeight: '500' }}>
                                            {selectedDoctor.maxAge !== null && selectedDoctor.maxAge !== undefined 
                                                ? `${selectedDoctor.maxAge} años` 
                                                : 'Sin restricción'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Horario de Atención */}
                            <div>
                                <h3 style={{ 
                                    fontSize: '18px', 
                                    fontWeight: '600', 
                                    marginBottom: '16px',
                                    color: '#2c3e50',
                                    borderLeft: '4px solid #667eea',
                                    paddingLeft: '12px'
                                }}>
                                    Horario de Atención
                                </h3>
                                <div style={{ 
                                    backgroundColor: '#f8f9fa',
                                    padding: '16px',
                                    borderRadius: '8px'
                                }}>
                                    {selectedDoctor.schedules && selectedDoctor.schedules.length > 0 ? (
                                        <div style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '2px',
                                            overflow: 'auto'
                                        }}>
                                            {/* Header */}
                                            <div style={{
                                                display: 'grid',
                                                gridTemplateColumns: '120px 1fr 1fr',
                                                gap: '12px',
                                                padding: '8px 12px',
                                                backgroundColor: '#e1e8ed',
                                                borderRadius: '6px',
                                                fontWeight: '600',
                                                fontSize: '12px',
                                                color: '#2c3e50',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px'
                                            }}>
                                                <div>Día</div>
                                                <div>Horario</div>
                                                <div>Almuerzo</div>
                                            </div>
                                            {/* Rows */}
                                            {selectedDoctor.schedules.map((schedule, index) => {
                                                const dayNames = {
                                                    'MONDAY': 'Lunes',
                                                    'TUESDAY': 'Martes',
                                                    'WEDNESDAY': 'Miércoles',
                                                    'THURSDAY': 'Jueves',
                                                    'FRIDAY': 'Viernes',
                                                    'SATURDAY': 'Sábado',
                                                    'SUNDAY': 'Domingo'
                                                };
                                                
                                                const day = dayNames[schedule.dayOfWeek] || schedule.dayOfWeek;
                                                const hours = `${schedule.startTime} - ${schedule.endTime}`;
                                                const lunch = schedule.lunchStart && schedule.lunchEnd 
                                                    ? `${schedule.lunchStart} - ${schedule.lunchEnd}` 
                                                    : 'Sin almuerzo';
                                                
                                                
                                                return (
                                                    <div key={schedule.id || index} style={{
                                                        display: 'grid',
                                                        gridTemplateColumns: '120px 1fr 1fr',
                                                        gap: '12px',
                                                        padding: '10px 12px',
                                                        backgroundColor: index % 2 === 0 ? '#fff' : '#f8f9fa',
                                                        borderRadius: '4px',
                                                        fontSize: '14px',
                                                        color: '#2c3e50'
                                                    }}>
                                                        <div style={{ fontWeight: '600' }}>{day}</div>
                                                        <div style={{ color: '#667eea', fontWeight: '500' }}>{hours}</div>
                                                        <div style={{ color: '#65676b', fontStyle: 'italic' }}>{lunch}</div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <p style={{ 
                                            margin: 0, 
                                            fontSize: '14px', 
                                            color: '#65676b',
                                            fontStyle: 'italic'
                                        }}>
                                            No hay horarios especificados
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Footer del Modal */}
                        <div style={{
                            padding: '16px 24px',
                            borderTop: '1px solid #e1e8ed',
                            display: 'flex',
                            justifyContent: 'flex-end',
                            backgroundColor: '#f8f9fa',
                            borderRadius: '0 0 12px 12px'
                        }}>
                            <button 
                                onClick={handleCloseDoctorModal}
                                className="btn btn-secondary"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );

}


export default Profile;