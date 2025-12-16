import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';

const Dependiente = () => {
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        age: '',
        gender: '',
        relationship: '',
        bloodGroup: '',
        genotype: '',
        knownAllergies: '',
        profilePicture: null
    });

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);
    const [patientData, setPatientData] = useState(null);
    const [loadingPatient, setLoadingPatient] = useState(true);

    useEffect(() => {
        fetchPatientData();
    }, []);

    const fetchPatientData = async () => {
        try {
            const response = await apiService.getMyPatients();
            if (response.data.statusCode === 200 && response.data.data.length > 0) {
                // Usar el primer paciente (titular)
                setPatientData(response.data.data[0]);
            } else {
                setError('No tienes un perfil de paciente. Por favor, crea uno primero.');
            }
        } catch (error) {
            setError('Error al cargar tu perfil de paciente');
            console.error('Error:', error);
        } finally {
            setLoadingPatient(false);
        }
    };

    const calculateAge = (birthDate) => {
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        
        return age;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        if (name === 'dateOfBirth') {
            const age = calculateAge(value);
            setFormData(prev => ({
                ...prev,
                [name]: value,
                age: age.toString()
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validar tamaño (5MB máximo)
            if (file.size > 5 * 1024 * 1024) {
                setError('La imagen no debe superar los 5MB');
                return;
            }

            // Validar tipo
            if (!file.type.startsWith('image/')) {
                setError('Solo se permiten archivos de imagen');
                return;
            }

            setFormData(prev => ({
                ...prev,
                profilePicture: file
            }));

            // Crear preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result);
            };
            reader.readAsDataURL(file);
            setError('');
        }
    };

    const removeImage = () => {
        setFormData(prev => ({
            ...prev,
            profilePicture: null
        }));
        setPreviewImage(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        // Validar que tenemos patientId
        if (!patientData?.id) {
            setError('No se pudo obtener tu perfil de paciente');
            setLoading(false);
            return;
        }

        try {
            // 1. Registrar dependiente SIN foto
            const response = await apiService.addDependent(patientData.id, {
                firstName: formData.firstName,
                lastName: formData.lastName,
                dateOfBirth: formData.dateOfBirth,
                gender: formData.gender,
                relationship: formData.relationship,
                bloodGroup: formData.bloodGroup || null,
                genotype: formData.genotype || null,
                knownAllergies: formData.knownAllergies || null
            });

            if (response.data.statusCode === 201 || response.data.statusCode === 200) {
                const dependentId = response.data.data.id;
                const expedienteNumber = response.data.data.expedienteNumber;

                // 2. Subir foto SI existe
                if (formData.profilePicture) {
                    try {
                        await apiService.uploadDependentPhoto(dependentId, formData.profilePicture);
                    } catch (photoError) {
                        console.warn('Dependiente creado pero error al subir foto:', photoError);
                    }
                }

                setSuccess(`¡Dependiente agregado exitosamente! Número de expediente: ${expedienteNumber}`);
                setTimeout(() => {
                    navigate('/profile');
                }, 2000);
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Error al agregar dependiente');
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        navigate('/profile');
    };

    return (
        <div className="container">
            <div className="form-container" style={{ maxWidth: '1200px' }}>
                <div className="form-header">
                    <h1 className="form-title">Agregar Dependiente</h1>
                    <p className="form-subtitle">Complete la información del dependiente</p>
                </div>

                {loadingPatient && (
                    <div className="alert alert-info">
                        Cargando datos del paciente...
                    </div>
                )}

                {!loadingPatient && !patientData && (
                    <div className="alert alert-error">
                        No tienes un perfil de paciente. Por favor, crea uno primero.
                    </div>
                )}

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

                <form onSubmit={handleSubmit} className="form">
                    {/* Fotografía */}
                    <div className="form-group">
                        <label className="form-label">
                            Fotografía
                        </label>
                        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                            {previewImage ? (
                                <div style={{ position: 'relative' }}>
                                    <img 
                                        src={previewImage} 
                                        alt="Preview" 
                                        style={{
                                            width: '120px',
                                            height: '120px',
                                            borderRadius: '8px',
                                            objectFit: 'cover',
                                            border: '2px solid #ddd'
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={removeImage}
                                        style={{
                                            position: 'absolute',
                                            top: '-8px',
                                            right: '-8px',
                                            background: '#ff4444',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '50%',
                                            width: '24px',
                                            height: '24px',
                                            cursor: 'pointer',
                                            fontSize: '14px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        ×
                                    </button>
                                </div>
                            ) : (
                                <div style={{
                                    width: '120px',
                                    height: '120px',
                                    border: '2px dashed #ddd',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#999',
                                    fontSize: '40px'
                                }}>
                                    👤
                                </div>
                            )}
                            <div>
                                <input
                                    type="file"
                                    id="profilePicture"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    style={{ display: 'none' }}
                                />
                                <label 
                                    htmlFor="profilePicture"
                                    className="btn btn-secondary"
                                    style={{ cursor: 'pointer', display: 'inline-block' }}
                                >
                                    Seleccionar Imagen
                                </label>
                                <p style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
                                    Tamaño máximo: 5MB. Formatos: JPG, PNG, GIF
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Fila 1: Nombre | Apellido | Fecha de Nacimiento | Edad */}
                    <div className="form-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px' }}>
                        <div className="form-group">
                            <label htmlFor="firstName" className="form-label">
                                Nombre *
                            </label>
                            <input
                                type="text"
                                id="firstName"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                className="form-input"
                                required
                                placeholder="Ingrese el nombre"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="lastName" className="form-label">
                                Apellido *
                            </label>
                            <input
                                type="text"
                                id="lastName"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                className="form-input"
                                required
                                placeholder="Ingrese el apellido"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="dateOfBirth" className="form-label">
                                Fecha de Nacimiento *
                            </label>
                            <input
                                type="date"
                                id="dateOfBirth"
                                name="dateOfBirth"
                                value={formData.dateOfBirth}
                                onChange={handleChange}
                                className="form-input"
                                required
                                max={new Date().toISOString().split('T')[0]}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="age" className="form-label">
                                Edad
                            </label>
                            <input
                                type="text"
                                id="age"
                                name="age"
                                value={formData.age}
                                className="form-input"
                                readOnly
                                placeholder="Se calcula automáticamente"
                            />
                        </div>
                    </div>

                    {/* Fila 2: Género | Parentesco | Grupo Sanguíneo | Genotipo */}
                    <div className="form-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px' }}>
                        <div className="form-group">
                            <label htmlFor="gender" className="form-label">
                                Género *
                            </label>
                            <select
                                id="gender"
                                name="gender"
                                value={formData.gender}
                                onChange={handleChange}
                                className="form-input"
                                required
                            >
                                <option value="">Seleccione género</option>
                                <option value="Masculino">Masculino</option>
                                <option value="Femenino">Femenino</option>
                                <option value="Otro">Otro</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="relationship" className="form-label">
                                Parentesco *
                            </label>
                            <select
                                id="relationship"
                                name="relationship"
                                value={formData.relationship}
                                onChange={handleChange}
                                className="form-input"
                                required
                            >
                                <option value="">Seleccione parentesco</option>
                                <option value="Hijo/a">Hijo/a</option>
                                <option value="Padre/Madre">Padre/Madre</option>
                                <option value="Conyuge">Cónyuge</option>
                                <option value="Hermano/a">Hermano/a</option>
                                <option value="Otro">Otro</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="bloodGroup" className="form-label">
                                Grupo Sanguíneo
                            </label>
                            <select
                                id="bloodGroup"
                                name="bloodGroup"
                                value={formData.bloodGroup}
                                onChange={handleChange}
                                className="form-input"
                            >
                                <option value="">Seleccione grupo sanguíneo (opcional)</option>
                                <option value="A_POSITIVE">A+</option>
                                <option value="A_NEGATIVE">A-</option>
                                <option value="B_POSITIVE">B+</option>
                                <option value="B_NEGATIVE">B-</option>
                                <option value="O_POSITIVE">O+</option>
                                <option value="O_NEGATIVE">O-</option>
                                <option value="AB_POSITIVE">AB+</option>
                                <option value="AB_NEGATIVE">AB-</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="genotype" className="form-label">
                                Genotipo
                            </label>
                            <select
                                id="genotype"
                                name="genotype"
                                value={formData.genotype}
                                onChange={handleChange}
                                className="form-input"
                            >
                                <option value="">Seleccione genotipo (opcional)</option>
                                <option value="AA">AA</option>
                                <option value="AS">AS</option>
                                <option value="AC">AC</option>
                                <option value="SS">SS</option>
                                <option value="SC">SC</option>
                            </select>
                        </div>
                    </div>

                    {/* Alergias Conocidas - Fila completa */}
                    <div className="form-group">
                        <label htmlFor="knownAllergies" className="form-label">
                            Alergias Conocidas
                        </label>
                        <textarea
                            id="knownAllergies"
                            name="knownAllergies"
                            value={formData.knownAllergies}
                            onChange={handleChange}
                            className="form-input"
                            rows="3"
                            placeholder="Ingrese alergias conocidas (opcional)"
                        />
                    </div>

                    <div className="form-actions">
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="btn btn-secondary"
                            disabled={loading}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading}
                        >
                            {loading ? 'Guardando...' : 'Agregar Dependiente'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Dependiente;
