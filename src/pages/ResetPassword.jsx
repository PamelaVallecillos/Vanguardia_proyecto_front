import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { apiService } from '../services/api';
import PasswordInput from '../components/PasswordInput';



const ResetPassword = () => {

    const [formData, setFormData] = useState({
        newPassword: '',
        confirmPassword: '',
        code: ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const codeFromUrl = searchParams.get('code');
        if (codeFromUrl) {
            setFormData(prev => ({
                ...prev,
                code: codeFromUrl
            }));
        }
    }, [searchParams]);


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
        if (!formData.code) {
            setError('El código de restablecimiento falta. Por favor, usa el enlace de tu correo electrónico.');
            setLoading(false);
            return;
        }

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
            const resetData = {
                newPassword: formData.newPassword,
                code: formData.code
            };

            const response = await apiService.resetPassword(resetData);

            if (response.data.statusCode === 200) {
                setSuccess('¡Contraseña restablecida con éxito! Ahora puedes iniciar sesión con tu nueva contraseña.');
                setFormData({
                    newPassword: '',
                    confirmPassword: '',
                    code: formData.code // Keep code for display
                });

                // Redirect to login after 3 seconds
                setTimeout(() => {
                    navigate('/login');
                }, 5000);
            } else {
                setError(response.data.message || 'Error al restablecer la contraseña');
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Ocurrió un error al restablecer la contraseña');
        } finally {
            setLoading(false);
        }
    };





    return (
        <div className="container">
            <div className="form-container">
                <h2 className="form-title">Restablecer Contraseña</h2>

                {!formData.code && (
                    <div className="alert alert-error">
                        Enlace de restablecimiento inválido. Por favor, usa el enlace enviado a tu correo electrónico.
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

                {formData.code && (
                    <>
                        <div className="reset-code-info">
                            <p>
                                <strong>Código de Restablecimiento:</strong> {formData.code}
                            </p>
                            <small>Este código fue extraído de tu enlace de restablecimiento</small>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label">Nueva Contraseña</label>
                                <PasswordInput
                                    name="newPassword"
                                    value={formData.newPassword}
                                    onChange={handleChange}
                                    placeholder="Ingresa tu nueva contraseña"
                                    required
                                    minLength={6}
                                />
                                <small className="form-help">Debe tener al menos 6 caracteres</small>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Confirmar Nueva Contraseña</label>
                                <PasswordInput
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="Confirma tu nueva contraseña"
                                    required
                                    minLength={6}
                                />
                            </div>

                            <button
                                type="submit"
                                className="form-btn"
                                disabled={loading}
                            >
                                {loading ? 'Restableciendo...' : 'Restablecer Contraseña'}
                            </button>
                        </form>
                    </>
                )}

                <div className="form-link">
                    <p>
                        ¿Recuerdas tu contraseña? <Link to="/login">Volver al inicio de sesión</Link>
                    </p>
                    <p className="mt-1">
                        ¿Necesitas un nuevo enlace de restablecimiento? <Link to="/forgot-password">Solicitar nuevamente</Link>
                    </p>
                </div>

                {/* Password Requirements */}
                <div className="password-requirements">
                    <h4>Requisitos de la Contraseña:</h4>
                    <ul>
                        <li className={formData.newPassword.length >= 5 ? 'requirement-met' : ''}>
                            Al menos 5 caracteres de longitud
                        </li>
                        <li className={formData.newPassword && formData.confirmPassword && formData.newPassword === formData.confirmPassword ? 'requirement-met' : ''}>
                            Las contraseñas coinciden
                        </li>
                    </ul>
                </div>

            </div>
        </div>
    );
}
export default ResetPassword;