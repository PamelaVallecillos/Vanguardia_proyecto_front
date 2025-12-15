import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api';



const CreateConsultation = () => {

    const [formData, setFormData] = useState({
        appointmentId: '',
        subjectiveNotes: '',
        objectiveFindings: '',
        assessment: '',
        plan: ''
    });

    const [appointment, setAppointment] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [documents, setDocuments] = useState([]);
    const [uploadingDocs, setUploadingDocs] = useState(false);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const appointmentId = searchParams.get('appointmentId');



    useEffect(() => {

        if (appointmentId) {
            fetchAppointmentDetails();
        } else {
            setError('No appointment ID provided ');
        }

    }, [appointmentId])





    const fetchAppointmentDetails = async () => {
        try {

            const response = await apiService.getMyAppointments();

            if (response.data.statusCode === 200) {
                const foundAppointment = response.data.data.find(
                    appt => appt.id === parseInt(appointmentId)
                );
                if (foundAppointment) {
                    setAppointment(foundAppointment);
                    setFormData(prev => ({
                        ...prev,
                        appointmentId: appointmentId
                    }));
                } else {
                    setError('No se encontró la cita');
                }
            }

        } catch (error) {
            setError('No se pudo cargar los detalles de la cita');

        }
    }



    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };


    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        
        // Validar tamaño de archivos (máximo 10MB por archivo)
        const validFiles = files.filter(file => {
            if (file.size > 10 * 1024 * 1024) {
                setError(`El archivo ${file.name} excede el tamaño máximo de 10MB`);
                return false;
            }
            return true;
        });

        setDocuments(prev => [...prev, ...validFiles]);
        e.target.value = ''; // Limpiar input
    };


    const removeDocument = (index) => {
        setDocuments(prev => prev.filter((_, i) => i !== index));
    };


    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };



    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        // Validation
        if (!formData.subjectiveNotes || !formData.objectiveFindings ||
            !formData.assessment || !formData.plan) {
            setError('Todos los campos son obligatorios');
            setLoading(false);
            return;
        }

        try {
            const consultationData = {
                ...formData,
                appointmentId: parseInt(formData.appointmentId)
            };

            const response = await apiService.createConsultation(consultationData);

            if (response.data.statusCode === 200) {
                setSuccess('¡Consulta creada con éxito!');
                setTimeout(() => {
                    navigate('/doctor/appointments');
                }, 5000);
            } else {
                setError(response.data.message || 'Error al crear la consulta');
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Ocurrió un error al crear la consulta');
        } finally {
            setLoading(false);
        }
    };


    const handleCancel = () => {
        navigate('/doctor/appointments');
    };


    const formatDateTime = (dateTimeString) => {
        return new Date(dateTimeString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };



    if (error && !appointment) {
        return (
            <div className="container">
                <div className="form-container">
                    <div className="alert alert-error">{error}</div>
                    <button onClick={handleCancel} className="btn btn-secondary">
                        Regresar a mis citas
                    </button>
                </div>
            </div>
        );
    }


    return (
        <div className="container">
            <div className="form-container form-container-wide">
                <h2 className="form-title">Crear Consulta</h2>

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

                {appointment && (
                    <div className="consultation-header-info">
                        <h3>Detalles de la Cita</h3>
                        <div className="appointment-summary">
                            <p><strong>Paciente:</strong> {appointment.patient.firstName} {appointment.patient.lastName}</p>
                            <p><strong>Fecha:</strong> {formatDateTime(appointment.startTime)}</p>
                            <p><strong>Propósito:</strong> {appointment.purposeOfConsultation}</p>
                            <p><strong>Síntomas:</strong> {appointment.initialSymptoms}</p>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Notas Subjetivas</label>
                        <textarea
                            name="subjectiveNotes"
                            className="form-input"
                            value={formData.subjectiveNotes}
                            onChange={handleChange}
                            placeholder="Síntomas reportados por el paciente, historial y preocupaciones..."
                            rows="4"
                            required
                        />
                        <small className="form-help">Quejas subjetivas e historial del paciente</small>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Hallazgos Objetivos</label>
                        <textarea
                            name="objectiveFindings"
                            className="form-input"
                            value={formData.objectiveFindings}
                            onChange={handleChange}
                            placeholder="Resultados del examen físico, signos vitales, resultados de pruebas..."
                            rows="4"
                            required
                        />
                        <small className="form-help">Observaciones objetivas y hallazgos del examen</small>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Evaluación</label>
                        <textarea
                            name="assessment"
                            className="form-input"
                            value={formData.assessment}
                            onChange={handleChange}
                            placeholder="Diagnóstico, diagnóstico diferencial, impresión clínica..."
                            rows="3"
                            required
                        />
                        <small className="form-help">Evaluación clínica y diagnóstico</small>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Plan de Tratamiento y/o Receta Medica</label>
                        <textarea
                            name="plan"
                            className="form-input"
                            value={formData.plan}
                            onChange={handleChange}
                            placeholder="Recomendaciones de tratamiento, medicamentos, planes de seguimiento..."
                            rows="3"
                            required
                        />
                        <small className="form-help">Plan de tratamiento y recomendaciones</small>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Documentos Adjuntos</label>
                        <div className="file-upload-area">
                            <input
                                type="file"
                                id="documents"
                                multiple
                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
                                onChange={handleFileChange}
                                style={{ display: 'none' }}
                            />
                            <label htmlFor="documents" className="file-upload-button">
                                📎 Seleccionar archivos
                            </label>
                            <small className="form-help">Formatos: PDF, DOC, DOCX, JPG, PNG (máx. 10MB por archivo)</small>
                        </div>

                        {documents.length > 0 && (
                            <div className="uploaded-files-list">
                                {documents.map((file, index) => (
                                    <div key={index} className="uploaded-file-item">
                                        <span className="file-icon">📄</span>
                                        <div className="file-info">
                                            <span className="file-name">{file.name}</span>
                                            <span className="file-size">{formatFileSize(file.size)}</span>
                                        </div>
                                        <button
                                            type="button"
                                            className="file-remove-btn"
                                            onClick={() => removeDocument(index)}
                                            title="Eliminar archivo"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
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
                            disabled={loading}
                        >
                            {loading ? 'Creando...' : 'Crear Consulta'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


export default CreateConsultation;