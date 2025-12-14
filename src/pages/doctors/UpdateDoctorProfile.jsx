import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api';



const UpdateDoctorProfile = () => {

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        gender: '',
        phone: '',
        specialization: '',
        additionalSpecializations: [],
        genderRestriction: '',
        minAge: '',
        maxAge: '',
        schedule: {
            monday: { enabled: false, startTime: '', endTime: '', lunchStart: '', lunchEnd: '' },
            tuesday: { enabled: false, startTime: '', endTime: '', lunchStart: '', lunchEnd: '' },
            wednesday: { enabled: false, startTime: '', endTime: '', lunchStart: '', lunchEnd: '' },
            thursday: { enabled: false, startTime: '', endTime: '', lunchStart: '', lunchEnd: '' },
            friday: { enabled: false, startTime: '', endTime: '', lunchStart: '', lunchEnd: '' },
            saturday: { enabled: false, startTime: '', endTime: '', lunchStart: '', lunchEnd: '' },
            sunday: { enabled: false, startTime: '', endTime: '', lunchStart: '', lunchEnd: '' }
        }
    });

    const [specializations, setSpecializations] = useState([]);
    const [selectedAdditionalSpec, setSelectedAdditionalSpec] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingEnums, setLoadingEnums] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchProfileData();
        fetchSpecializations();

    }, [])

    const fetchProfileData = async () => {

        try {
            const response = await apiService.getMyDoctorProfile();

            if (response.data.statusCode === 200) {
                const doctorData = response.data.data;

                setFormData({
                    firstName: doctorData.firstName || '',
                    lastName: doctorData.lastName || '',
                    gender: doctorData.gender || '',
                    phone: doctorData.phone || '',
                    specialization: doctorData.specialization || '',
                    additionalSpecializations: doctorData.additionalSpecializations || [],
                    genderRestriction: doctorData.genderRestriction || '',
                    minAge: doctorData.minAge || '',
                    maxAge: doctorData.maxAge || '',
                    schedule: doctorData.schedule || formData.schedule
                });
            }

        } catch (error) {
            setError('No se pudo cargar la información del perfil');

        }
    }

    const fetchSpecializations = async () => {
        try {
            const response = await apiService.getAllDocgetAllSpecializationEnumstors();

            if (response.data.statusCode === 200) {
                setSpecializations(response.data.data);
            }

        } catch (error) {
            setError('No se pudo cargar las especializaciones');

        } finally {
            setLoadingEnums(false)
        }
    }


    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleCancel = () => {
        navigate('/doctor/profile');
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await apiService.updateMyDoctorProfile(formData);

            if (response.data.statusCode === 200) {
                setSuccess('¡Perfil actualizado con éxito!');
                setTimeout(() => {
                    navigate('/doctor/profile');
                }, 5000);
            } else {
                setError(response.data.message || 'No se pudo actualizar el perfil');
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Ocurrió un error al actualizar el perfil');
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="container">
            <div className="form-container form-container-wide">
                <h2 className="form-title">Actualizar Perfil del Doctor</h2>

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
                    {/* Información Básica */}
                    <h3 className="section-subtitle">Información Básica</h3>
                    <div className="form-row-4">
                        <div className="form-group">
                            <label className="form-label">Nombre *</label>
                            <input
                                type="text"
                                name="firstName"
                                className="form-input"
                                value={formData.firstName}
                                onChange={handleChange}
                                placeholder="Ingrese su nombre"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Apellido *</label>
                            <input
                                type="text"
                                name="lastName"
                                className="form-input"
                                value={formData.lastName}
                                onChange={handleChange}
                                placeholder="Ingrese su apellido"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Género *</label>
                            <select
                                name="gender"
                                className="form-input"
                                value={formData.gender}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Seleccione género</option>
                                <option value="MASCULINO">Masculino</option>
                                <option value="FEMENINO">Femenino</option>
                                <option value="OTRO">Otro</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Número de Teléfono *</label>
                            <input
                                type="tel"
                                name="phone"
                                className="form-input"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="+1234567890"
                                required
                            />
                        </div>
                    </div>

                    {/* Especializaciones */}
                    <h3 className="section-subtitle">Especializaciones</h3>
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Especialización Principal *</label>
                            <select
                                name="specialization"
                                className="form-input"
                                value={formData.specialization}
                                onChange={handleChange}
                                required
                                disabled={loadingEnums}
                            >
                                <option value="">Seleccione su especialización</option>
                                {specializations.map((spec) => (
                                    <option key={spec} value={spec}>
                                        {spec.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Especializaciones Adicionales</label>
                        <div className="specializations-container">
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                                <select
                                    className="form-input"
                                    value={selectedAdditionalSpec}
                                    onChange={(e) => setSelectedAdditionalSpec(e.target.value)}
                                    disabled={loadingEnums}
                                >
                                    <option value="">Seleccione especialización adicional</option>
                                    {specializations.filter(spec => 
                                        spec !== formData.specialization && 
                                        !formData.additionalSpecializations.includes(spec)
                                    ).map((spec) => (
                                        <option key={spec} value={spec}>
                                            {spec.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                                        </option>
                                    ))}
                                </select>
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => {
                                        if (selectedAdditionalSpec) {
                                            setFormData({
                                                ...formData,
                                                additionalSpecializations: [...formData.additionalSpecializations, selectedAdditionalSpec]
                                            });
                                            setSelectedAdditionalSpec('');
                                        }
                                    }}
                                >
                                    Agregar
                                </button>
                            </div>
                            <div className="tags-container">
                                {formData.additionalSpecializations.map((spec, index) => (
                                    <span key={index} className="tag">
                                        {spec.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setFormData({
                                                    ...formData,
                                                    additionalSpecializations: formData.additionalSpecializations.filter((_, i) => i !== index)
                                                });
                                            }}
                                            className="tag-remove"
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>
                        </div>
                    </div>

                    {/* Restricciones */}
                    <h3 className="section-subtitle">Restricciones de Pacientes</h3>
                    <div className="form-row-3">
                        <div className="form-group">
                            <label className="form-label">Restricción de Género</label>
                            <select
                                name="genderRestriction"
                                className="form-input"
                                value={formData.genderRestriction}
                                onChange={handleChange}
                            >
                                <option value="">Sin restricción</option>
                                <option value="MASCULINO">Solo masculino</option>
                                <option value="FEMENINO">Solo femenino</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Edad Mínima</label>
                            <input
                                type="number"
                                name="minAge"
                                className="form-input"
                                value={formData.minAge}
                                onChange={handleChange}
                                placeholder="Ej: 0"
                                min="0"
                                max="120"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Edad Máxima</label>
                            <input
                                type="number"
                                name="maxAge"
                                className="form-input"
                                value={formData.maxAge}
                                onChange={handleChange}
                                placeholder="Ej: 100"
                                min="0"
                                max="120"
                            />
                        </div>
                    </div>

                    {/* Horario de Atención */}
                    <div className="schedule-header">
                        <h3 className="section-subtitle">Horario de Atención</h3>
                        <label className="apply-all-checkbox">
                            <input
                                type="checkbox"
                                onChange={(e) => {
                                    if (e.target.checked) {
                                        // Aplicar horario del lunes a todos los días
                                        const mondaySchedule = formData.schedule.monday;
                                        const newSchedule = {};
                                        
                                        Object.keys(formData.schedule).forEach(d => {
                                            newSchedule[d] = {
                                                enabled: mondaySchedule.startTime !== '' || mondaySchedule.endTime !== '' || 
                                                        mondaySchedule.lunchStart !== '' || mondaySchedule.lunchEnd !== '',
                                                startTime: mondaySchedule.startTime,
                                                endTime: mondaySchedule.endTime,
                                                lunchStart: mondaySchedule.lunchStart,
                                                lunchEnd: mondaySchedule.lunchEnd
                                            };
                                        });

                                        setFormData({
                                            ...formData,
                                            schedule: newSchedule
                                        });
                                    }
                                    // Desmarcar automáticamente después de aplicar
                                    e.target.checked = false;
                                }}
                            />
                            <span>Aplicar a todos</span>
                        </label>
                    </div>
                    <div className="schedule-table-container">
                        <table className="schedule-table">
                            <thead>
                                <tr>
                                    <th>Activo</th>
                                    <th>Día de la semana</th>
                                    <th>Hora de entrada</th>
                                    <th>Hora de salida</th>
                                    <th>Inicio almuerzo</th>
                                    <th>Fin almuerzo</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.keys(formData.schedule).map((day) => {
                                    const dayNames = {
                                        monday: 'Lunes',
                                        tuesday: 'Martes',
                                        wednesday: 'Miércoles',
                                        thursday: 'Jueves',
                                        friday: 'Viernes',
                                        saturday: 'Sábado',
                                        sunday: 'Domingo'
                                    };

                                    // Función para convertir hora 24h a 12h con AM/PM
                                    const formatTime12h = (time24) => {
                                        if (!time24) return '';
                                        const [hours, minutes] = time24.split(':');
                                        const hour = parseInt(hours);
                                        const ampm = hour >= 12 ? 'PM' : 'AM';
                                        const hour12 = hour % 12 || 12;
                                        return `${hour12}:${minutes} ${ampm}`;
                                    };

                                    return (
                                        <tr key={day} className={!formData.schedule[day].enabled ? 'schedule-row-disabled' : ''}>
                                            <td className="schedule-checkbox-cell">
                                                <input
                                                    type="checkbox"
                                                    className="schedule-checkbox"
                                                    checked={formData.schedule[day].enabled}
                                                    onChange={(e) => {
                                                        setFormData({
                                                            ...formData,
                                                            schedule: {
                                                                ...formData.schedule,
                                                                [day]: {
                                                                    ...formData.schedule[day],
                                                                    enabled: e.target.checked
                                                                }
                                                            }
                                                        });
                                                    }}
                                                />
                                            </td>
                                            <td className="schedule-day-name">{dayNames[day]}</td>
                                            <td>
                                                <div className="time-input-wrapper">
                                                    <input
                                                        type="time"
                                                        className="schedule-time-input"
                                                        value={formData.schedule[day].startTime}
                                                        disabled={!formData.schedule[day].enabled}
                                                        onChange={(e) => {
                                                            setFormData({
                                                                ...formData,
                                                                schedule: {
                                                                    ...formData.schedule,
                                                                    [day]: {
                                                                        ...formData.schedule[day],
                                                                        startTime: e.target.value
                                                                    }
                                                                }
                                                            });
                                                        }}
                                                    />
                                                    {formData.schedule[day].startTime && (
                                                        <span className="time-ampm">{formatTime12h(formData.schedule[day].startTime)}</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td>
                                                <div className="time-input-wrapper">
                                                    <input
                                                        type="time"
                                                        className="schedule-time-input"
                                                        value={formData.schedule[day].endTime}
                                                        disabled={!formData.schedule[day].enabled}
                                                        onChange={(e) => {
                                                            setFormData({
                                                                ...formData,
                                                                schedule: {
                                                                    ...formData.schedule,
                                                                    [day]: {
                                                                        ...formData.schedule[day],
                                                                        endTime: e.target.value
                                                                    }
                                                                }
                                                            });
                                                        }}
                                                    />
                                                    {formData.schedule[day].endTime && (
                                                        <span className="time-ampm">{formatTime12h(formData.schedule[day].endTime)}</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td>
                                                <div className="time-input-wrapper">
                                                    <input
                                                        type="time"
                                                        className="schedule-time-input"
                                                        value={formData.schedule[day].lunchStart}
                                                        disabled={!formData.schedule[day].enabled}
                                                        onChange={(e) => {
                                                            setFormData({
                                                                ...formData,
                                                                schedule: {
                                                                    ...formData.schedule,
                                                                    [day]: {
                                                                        ...formData.schedule[day],
                                                                        lunchStart: e.target.value
                                                                    }
                                                                }
                                                            });
                                                        }}
                                                    />
                                                    {formData.schedule[day].lunchStart && (
                                                        <span className="time-ampm">{formatTime12h(formData.schedule[day].lunchStart)}</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td>
                                                <div className="time-input-wrapper">
                                                    <input
                                                        type="time"
                                                        className="schedule-time-input"
                                                        value={formData.schedule[day].lunchEnd}
                                                        disabled={!formData.schedule[day].enabled}
                                                        onChange={(e) => {
                                                            setFormData({
                                                                ...formData,
                                                                schedule: {
                                                                    ...formData.schedule,
                                                                    [day]: {
                                                                        ...formData.schedule[day],
                                                                        lunchEnd: e.target.value
                                                                    }
                                                                }
                                                            });
                                                        }}
                                                    />
                                                    {formData.schedule[day].lunchEnd && (
                                                        <span className="time-ampm">{formatTime12h(formData.schedule[day].lunchEnd)}</span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
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
                            {loading ? 'Actualizando...' : 'Actualizar Perfil'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
export default UpdateDoctorProfile;