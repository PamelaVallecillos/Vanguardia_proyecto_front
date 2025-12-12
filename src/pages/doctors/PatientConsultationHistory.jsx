import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { apiService } from '../../services/api';


const PatientConsultationHistory = () => {

    const [consultations, setConsultations] = useState([]);
    const [patient, setPatient] = useState(null);
    const [error, setError] = useState('');
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();


    const patientId = searchParams.get('patientId');

    useEffect(() => {
        if (patientId) {
            fetchConsultationHistory()
        } else {
            setError('No se proporcionó ID de paciente');
        }

    }, [patientId])


    const fetchConsultationHistory = async () => {
        try {
            const response = await apiService.getConsultationHistoryForPatient(patientId);

            if (response.data.statusCode === 200) {
                setConsultations(response.data.data);
            }

        } catch (error) {

            setError('Error al cargar el historial de consultas');
            console.error('Error al cargar el historial de consultas:', error);
        }
    }


    const formatDateTime = (dateTimeString) => {
        return new Date(dateTimeString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getTimeAgo = (dateTimeString) => {
        const now = new Date();
        const consultationDate = new Date(dateTimeString);
        const diffTime = Math.abs(now - consultationDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) return 'hace 1 día';
        if (diffDays < 7) return `hace ${diffDays} días`;
        if (diffDays < 30) return `hace ${Math.ceil(diffDays / 7)} semanas`;
        return `hace ${Math.ceil(diffDays / 30)} meses`;
    };

    const groupConsultationsByDate = (consultations) => {
        const grouped = {};

        consultations.forEach(consultation => {
            const date = new Date(consultation.consultationDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            if (!grouped[date]) {
                grouped[date] = [];
            }

            grouped[date].push(consultation);
        });

        return grouped;
    };


    const calculateStatistics = (consultations) => {
        const totalConsultations = consultations.length;
        const recentConsultations = consultations.filter(consultation => {
            const consultationDate = new Date(consultation.consultationDate);
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            return consultationDate > thirtyDaysAgo;
        }).length;

        return {
            totalConsultations,
            recentConsultations
        };
    };

    const groupedConsultations = groupConsultationsByDate(consultations);
    const stats = calculateStatistics(consultations);



    if (error) {
        return (
            <div className="container">
                <div className="form-container">
                    <div className="alert alert-error">{error}</div>
                    <button onClick={() => navigate('/doctor/appointments')} className="btn btn-secondary">
                        Volver a mis citas
                    </button>
                </div>
            </div>
        );
    }




    return (
        <div className="container">
            <div className="page-container">
                <div className="page-header">
                    <div className="header-content">
                        <div>
                            <h1 className="page-title">Historial de Consultas del Paciente</h1>
                            <p className="page-subtitle">
                                ID de Paciente: {patientId}
                            </p>
                        </div>
                        <Link to="/doctor/appointments" className="btn btn-secondary">
                            Volver a mis citas
                        </Link>
                    </div>
                </div>

                {/* Statistics Overview */}
                {consultations.length > 0 && (
                    <div className="consultation-stats">
                        <div className="stat-card">
                            <div className="stat-number">{stats.totalConsultations}</div>
                            <div className="stat-label">Total de Consultas</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-number">{stats.recentConsultations}</div>
                            <div className="stat-label">Últimos 30 días</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-number">
                                {consultations.length > 0 ? formatDateTime(consultations[0].consultationDate) : 'N/A'}
                            </div>
                            <div className="stat-label">Más Reciente</div>
                        </div>
                    </div>
                )}

                {consultations.length === 0 ? (
                    <div className="empty-state">
                        <h3>No hay historial de citas</h3>
                        <p>Este paciente aún no tiene registros de consultas.</p>
                        <p className="mt-1">Podría ser su primera visita o las consultas no han sido documentadas.</p>
                    </div>
                ) : (
                    <div className="consultation-history">
                        {Object.entries(groupedConsultations).map(([date, dayConsultations]) => (
                            <div key={date} className="consultation-day-group">
                                <h3 className="day-header">{date}</h3>
                                <div className="consultations-list">
                                    {dayConsultations.map((consultation) => (
                                        <div key={consultation.id} className="consultation-card detailed">
                                            <div className="consultation-header">
                                                <div className="consultation-meta">
                                                    <span className="consultation-time">
                                                        {formatDateTime(consultation.consultationDate)}
                                                    </span>
                                                    <span className="time-ago">
                                                        ({getTimeAgo(consultation.consultationDate)})
                                                    </span>
                                                </div>
                                                <div className="consultation-id">
                                                    Cita: #{consultation.appointmentId}
                                                </div>
                                            </div>

                                            <div className="consultation-sections">
                                                <div className="consultation-section">
                                                    <h4>📋 Notas Subjetivas</h4>
                                                    <div className="section-content">
                                                        {consultation.subjectiveNotes || 'No hay notas subjetivas registradas.'}
                                                    </div>
                                                </div>

                                                <div className="consultation-section">
                                                    <h4>🔍 Hallazgos Objetivos</h4>
                                                    <div className="section-content">
                                                        {consultation.objectiveFindings || 'No hay hallazgos objetivos registrados.'}
                                                    </div>
                                                </div>

                                                <div className="consultation-section">
                                                    <h4>💊 Evaluación</h4>
                                                    <div className="section-content">
                                                        {consultation.assessment || 'No hay evaluación registrada.'}
                                                    </div>
                                                </div>

                                                <div className="consultation-section">
                                                    <h4>📝 Plan de Tratamiento</h4>
                                                    <div className="section-content">
                                                        {consultation.plan || 'No hay plan de tratamiento registrado.'}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="consultation-actions">
                                                <button className="btn btn-outline btn-sm" onClick={() => {
                                                    // Highlight patterns or important information
                                                    alert('Utilice esta información para identificar patrones en el historial médico del paciente');
                                                }}>
                                                    Analizar Patrones
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Diagnostic Assistance Section */}
                {consultations.length > 0 && (
                    <div className="diagnostic-assistance">
                        <h3>🩺 Información Diagnóstica</h3>
                        <div className="insights-grid">
                            <div className="insight-card">
                                <h4>Síntomas Recurrentes</h4>
                                <p>Busque patrones en las notas subjetivas a lo largo de múltiples consultas</p>
                            </div>
                            <div className="insight-card">
                                <h4>Efectividad del Tratamiento</h4>
                                <p>Revise planes de tratamiento previos y sus resultados</p>
                            </div>
                            <div className="insight-card">
                                <h4>Seguimiento del Progreso</h4>
                                <p>Monitoree cambios en los hallazgos objetivos a lo largo del tiempo</p>
                            </div>
                            <div className="insight-card">
                                <h4>Condiciones Crónicas</h4>
                                <p>Identifique problemas persistentes mencionados en las evaluaciones</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

}
export default PatientConsultationHistory;