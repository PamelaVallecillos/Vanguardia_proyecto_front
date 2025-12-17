import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { apiService } from '../services/api';
import { ensureLocalIsoHasSeconds, toLocalIsoWithoutSeconds } from '../utils/dateUtils';
import CalendarComponent from '../components/CalendarComponent';


const BookAppointment = () => {

    const [formData, setFormData] = useState({
        doctorId: '',
        purposeOfConsultation: '',
        initialSymptoms: '',
        startTime: ''
    });


    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingDoctors, setLoadingDoctors] = useState(true);
    const [doctorAppointments, setDoctorAppointments] = useState([]);
    const [loadingAppointments, setLoadingAppointments] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();


    const location = useLocation();

    useEffect(() => {
        fetchDoctors();

        // If navigated with an appointment to edit, prefill fields
        const editAppointment = location.state?.editAppointment;
        if (editAppointment) {
            // backend may return local ISO like 'YYYY-MM-DDTHH:mm:ss' or an ISO with Z
            const st = editAppointment.startTime;
            let startVal = '';
            if (st) {
                // If it's a plain local ISO (no Z), take first 16 chars; if it has Z or offset, construct local ISO from Date
                if (/Z|[+-]\d{2}:?\d{2}/.test(st)) {
                    startVal = toLocalIsoWithoutSeconds(new Date(st));
                } else {
                    startVal = st.length >= 16 ? st.slice(0,16) : st;
                }
            }

            setFormData({
                doctorId: editAppointment.doctor?.id ? String(editAppointment.doctor.id) : String(editAppointment.doctorId || ''),
                purposeOfConsultation: editAppointment.purposeOfConsultation || '',
                initialSymptoms: editAppointment.initialSymptoms || '',
                startTime: startVal
            });
        }
    }, [])


    const fetchDoctors = async () => {
        try {

            const response = await apiService.getAllDoctors();

            if (response.data.statusCode === 200) {
                setDoctors(response.data.data);
            }

        } catch (error) {
            setError('No se pudo cargar la lista de doctores');

        } finally {
            setLoadingDoctors(false)
        }
    }

    const fetchDoctorAppointments = async (doctorId) => {
        if (!doctorId) {
            setDoctorAppointments([]);
            return;
        }

        setLoadingAppointments(true);
        try {
            // Create API endpoint to get doctor's appointments
            const response = await apiService.getMyAppointments();
            
            if (response.data.statusCode === 200) {
                // Filter appointments for selected doctor
                const filtered = response.data.data.filter(apt => 
                    apt.doctor?.id === parseInt(doctorId) || apt.doctorId === parseInt(doctorId)
                );
                setDoctorAppointments(filtered);
            }
        } catch (error) {
            console.error('Error al cargar citas del doctor:', error);
            setDoctorAppointments([]);
        } finally {
            setLoadingAppointments(false);
        }
    };

    // Effect to load appointments when doctor selection changes
    useEffect(() => {
        if (formData.doctorId) {
            fetchDoctorAppointments(formData.doctorId);
        } else {
            setDoctorAppointments([]);
        }
    }, [formData.doctorId]);


    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };




    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        // Validation
        if (!formData.doctorId) {
            setError('Por favor seleccione un doctor');
            setLoading(false);
            return;
        }

        if (!formData.startTime) {
            setError('Por favor seleccione la fecha y hora de la cita');
            setLoading(false);
            return;
        }

        // Send startTime as local ISO without timezone (backend uses LocalDateTime)
        const startLocal = formData.startTime ? ensureLocalIsoHasSeconds(formData.startTime) : null; // e.g. '2025-12-22T08:30:00'

        const appointmentData = {
            ...formData,
            doctorId: parseInt(formData.doctorId),
            startTime: startLocal
        };

        try {
            const response = await apiService.bookAppointment(appointmentData);

            if (response.data.statusCode === 200) {
                setSuccess('¡Cita reservada con éxito!');
                setFormData({
                    doctorId: '',
                    purposeOfConsultation: '',
                    initialSymptoms: '',
                    startTime: ''
                });
                setTimeout(() => {
                    navigate('/my-appointments');
                }, 5000);
            } else {
                setError(response.data.message || 'No se pudo reservar la cita');
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Ocurrió un error al reservar la cita');
        } finally {
            setLoading(false);
        }
    };



    const handleCancel = () => {
        navigate('/profile');
    };

    const formatDoctorName = (doctor) => {
        if (doctor.firstName && doctor.lastName) {
            return `Dr. ${doctor.firstName} ${doctor.lastName} - ${doctor.specialization?.replace(/_/g, ' ')}`;
        }
        return `Dr. ${doctor.user?.name} - ${doctor.specialization?.replace(/_/g, ' ') || 'General Practice'}`;
    };

    // Get minimum datetime (current time)
    const getMinDateTime = () => {
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        return now.toISOString().slice(0, 16);
    };




    return (
        <div className="container" style={{ maxWidth: '1400px' }}>
            <h2 className="form-title" style={{ textAlign: 'center', marginBottom: '2rem' }}>Reservar Cita</h2>
            
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: formData.doctorId ? '500px 1fr' : '1fr',
                gap: '2rem',
                alignItems: 'start'
            }}>
                {/* Formulario */}
                <div className="form-container" style={{ margin: 0 }}>
                    {error && (
                        <div className="alert alert-error">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="alert alert-success">
                            {success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Seleccione Doctor</label>
                        <select
                            name="doctorId"
                            className="form-select"
                            value={formData.doctorId}
                            onChange={handleChange}
                            required
                            disabled={loadingDoctors}
                        >
                            <option value="">Seleccione un doctor</option>
                            {doctors.map((doctor) => (
                                <option key={doctor.id} value={doctor.id}>
                                    {formatDoctorName(doctor)}
                                </option>
                            ))}
                        </select>
                        {loadingDoctors && (
                            <small className="form-help">Cargando doctores...</small>
                        )}
                    </div>

                    <div className="form-group">
                        <label className="form-label">Propósito de la Consulta</label>
                        <input
                            type="text"
                            name="purposeOfConsultation"
                            className="form-input"
                            value={formData.purposeOfConsultation}
                            onChange={handleChange}
                            placeholder="Describa brevemente por qué necesita la consulta"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Síntomas Iniciales</label>
                        <textarea
                            name="initialSymptoms"
                            className="form-input"
                            value={formData.initialSymptoms}
                            onChange={handleChange}
                            placeholder="Describa sus síntomas en detalle"
                            rows="4"
                            required
                        />
                        <small className="form-help">Sea específico sobre sus síntomas, duración y gravedad</small>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Fecha y Hora Preferida</label>
                        <input
                            type="datetime-local"
                            name="startTime"
                            className="form-input"
                            value={formData.startTime}
                            onChange={handleChange}
                            min={getMinDateTime()}
                            required
                        />
                        <small className="form-help">Seleccione la fecha y hora preferida para la cita</small>
                    </div>

                        <div className="form-actions">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={handleCancel}
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={loading || loadingDoctors}
                            >
                                {loading ? 'Reservando...' : 'Reservar Cita'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Calendar to show doctor's availability */}
                {formData.doctorId && (
                    <div style={{ 
                        backgroundColor: 'white',
                        borderRadius: '10px',
                        padding: '2rem',
                        boxShadow: '0 5px 15px rgba(0,0,0,0.1)'
                    }}>
                        <h3 style={{ 
                            fontSize: '1.5rem', 
                            marginBottom: '1rem',
                            color: '#2c3e50',
                            textAlign: 'center'
                        }}>
                            Disponibilidad del Doctor
                        </h3>
                        <div className="alert alert-info" style={{ marginBottom: '1rem' }}>
                            <strong>Nota:</strong> Los bloques marcados en el calendario muestran las citas ya reservadas. 
                            Seleccione un horario disponible para su cita.
                        </div>
                        {loadingAppointments ? (
                            <p style={{ textAlign: 'center', padding: '2rem', color: '#65676b' }}>
                                Cargando disponibilidad...
                            </p>
                        ) : (
                            <CalendarComponent 
                                appointments={doctorAppointments}
                                readOnly={true}
                            />
                        )}
                    </div>
                )}
            </div>
        </div>
    );

}

export default BookAppointment;