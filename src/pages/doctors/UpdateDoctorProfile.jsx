import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api';



const UpdateDoctorProfile = () => {

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        specialization: ''
    });

    const [specializations, setSpecializations] = useState([]);
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
                    specialization: doctorData.specialization || ''
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
            <div className="form-container">
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
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Nombre</label>
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
                            <label className="form-label">Apellido</label>
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
                    </div>

                    <div className="form-group">
                        <label className="form-label">Especialización</label>
                        <select
                            name="specialization"
                            className="form-select"
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
                        {loadingEnums && (
                            <small className="form-help">Cargando especializaciones...</small>
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
                            {loading ? 'Actualizando...' : 'Actualizar Perfil'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
export default UpdateDoctorProfile;