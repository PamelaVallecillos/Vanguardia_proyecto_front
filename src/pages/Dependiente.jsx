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
        assignedDoctor: '',
        bloodGroup: '',
        genotype: '',
        knownAllergies: ''
    });

    const [doctors, setDoctors] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchDoctors();
    }, []);

    const fetchDoctors = async () => {
        try {
            const response = await apiService.getAllDoctors();
            if (response.data.statusCode === 200) {
                setDoctors(response.data.data);
            }
        } catch (error) {
            console.error('Error al cargar doctores:', error);
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const response = await apiService.addDependent({
                firstName: formData.firstName,
                lastName: formData.lastName,
                dateOfBirth: formData.dateOfBirth,
                gender: formData.gender,
                relationship: formData.relationship,
                assignedDoctorId: formData.assignedDoctor || null,
                bloodGroup: formData.bloodGroup || null,
                genotype: formData.genotype || null,
                knownAllergies: formData.knownAllergies || null
            });

            if (response.data.statusCode === 200 || response.data.statusCode === 201) {
                setSuccess('Dependiente agregado exitosamente');
                setTimeout(() => {
                    navigate('/profile');
                }, 2000);
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Error al agregar dependiente');
            console.error('Error al agregar dependiente:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        navigate('/profile');
    };

    return (
        <div className="container">
            <div className="form-container">
                <div className="form-header">
                    <h1 className="form-title">Agregar Dependiente</h1>
                    <p className="form-subtitle">Complete la información del dependiente</p>
                </div>

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
                    <div className="form-row">
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
                    </div>

                    <div className="form-row">
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

                    <div className="form-row">
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
                                <option value="MASCULINO">Masculino</option>
                                <option value="FEMENINO">Femenino</option>
                                <option value="OTRO">Otro</option>
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
                                <option value="HIJO">Hijo/a</option>
                                <option value="PADRE">Padre</option>
                                <option value="MADRE">Madre</option>
                                <option value="ESPOSO">Esposo</option>
                                <option value="ESPOSA">Esposa</option>
                                <option value="HERMANO">Hermano/a</option>
                                <option value="ABUELO">Abuelo/a</option>
                                <option value="OTRO">Otro</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="assignedDoctor" className="form-label">
                            Doctor Asignado
                        </label>
                        <select
                            id="assignedDoctor"
                            name="assignedDoctor"
                            value={formData.assignedDoctor}
                            onChange={handleChange}
                            className="form-input"
                        >
                            <option value="">Seleccione un doctor (opcional)</option>
                            {doctors.map(doctor => (
                                <option key={doctor.id} value={doctor.id}>
                                    Dr. {doctor.firstName} {doctor.lastName} - {doctor.specialization}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-row">
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
