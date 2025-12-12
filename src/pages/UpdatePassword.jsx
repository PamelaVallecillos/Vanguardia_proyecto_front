import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';


const UpdatePassword = () => {

    const [formData, setFormData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

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
        if (formData.newPassword !== formData.confirmPassword) {
            setError('La nueva contraseña y la confirmación no coinciden');
            setLoading(false);
            return;
        }

        if (formData.newPassword.length < 5) {
            setError('La nueva contraseña debe tener al menos 5 caracteres');
            setLoading(false);
            return;
        }

        try {
            const updatePasswordRequest = {
                oldPassword: formData.oldPassword,
                newPassword: formData.newPassword
            };

            const response = await apiService.updatePassword(updatePasswordRequest);

            if (response.data.statusCode === 200) {
                setSuccess('¡Contraseña actualizada con éxito!');
                setFormData({
                    oldPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                });
                setTimeout(() => {
                    apiService.logout();
                    navigate('/login');
                }, 5000);
            } else {
                setError(response.data.message || 'Error al actualizar la contraseña');
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Ocurrió un error al actualizar la contraseña');
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
                <h2 className="form-title">Actualizar Contraseña</h2>

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
                        <label className="form-label">Contraseña Actual</label>
                        <input
                            type="password"
                            name="oldPassword"
                            className="form-input"
                            value={formData.oldPassword}
                            onChange={handleChange}
                            placeholder="Ingresa tu contraseña actual"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Nueva Contraseña</label>
                        <input
                            type="password"
                            name="newPassword"
                            className="form-input"
                            value={formData.newPassword}
                            onChange={handleChange}
                            placeholder="Ingresa tu nueva contraseña"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Confirmar Nueva Contraseña</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            className="form-input"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="Confirma tu nueva contraseña"
                            required
                        />
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
                            {loading ? 'Actualizando...' : 'Actualizar Contraseña'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
export default UpdatePassword;