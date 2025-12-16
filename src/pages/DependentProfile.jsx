import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiService } from '../services/api';

const DependentProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [dependent, setDependent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDependent();
  }, [id]);

  const fetchDependent = async () => {
    setLoading(true);
    try {
      const resp = await apiService.getDependentById(id);
      if (resp.data.statusCode === 200) {
        setDependent(resp.data.data);
      } else {
        setError(resp.data.message || 'No se encontró el dependiente');
      }
    } catch (e) {
      console.error('Error fetching dependent:', e);
      setError('Error al cargar el dependiente');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No proporcionado';
    try {
      return new Date(dateString).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  const formatBloodGroup = (bloodGroup) => {
    if (!bloodGroup) return 'No proporcionado';
    return bloodGroup.replace('_', ' ');
  };

  const getPhotoUrl = () => {
    const url = dependent?.profilePhoto;
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    if (url.startsWith('/')) return `http://localhost:8080${url}`;
    return `http://localhost:8080/${url}`;
  };

  if (loading) return <div className="container"><div className="fb-card">Cargando...</div></div>;
  if (error) return <div className="container"><div className="alert alert-error">{error}</div></div>;
  if (!dependent) return null;

  return (
    <div className="fb-profile-wrapper">
      <div className="fb-profile-header">
        <div className="container">
          <div className="fb-profile-header-content">
            <div className="fb-profile-picture-wrapper">
              <div className="fb-profile-picture-container">
                {getPhotoUrl() ? (
                  <img src={getPhotoUrl()} alt="Profile" className="fb-profile-picture" />
                ) : (
                  <div className="fb-profile-picture-placeholder">{(dependent.firstName || 'U').charAt(0).toUpperCase()}</div>
                )}
              </div>
            </div>

            <div className="fb-profile-info">
              <h1 className="fb-profile-name">{dependent.firstName} {dependent.lastName}</h1>
              <p className="fb-profile-friends">Dependiente</p>
            </div>
          </div>

          <div className="fb-profile-actions">
            <button onClick={() => navigate('/agregar-dependiente', { state: { editDependent: dependent } })} className="fb-btn fb-btn-primary">✏️ Editar dependiente</button>
            <button onClick={() => navigate('/book-appointment', { state: { patientId: dependent.id, isDependent: true } })} className="fb-btn fb-btn-secondary">📅 Hacer cita</button>
            <button onClick={() => navigate('/profile')} className="fb-btn fb-btn-icon">Volver</button>
          </div>
        </div>
      </div>

      <div className="fb-profile-content">
        <div className="container">
          <div className="fb-profile-layout">
            <div className="fb-profile-sidebar">
              <div className="fb-card">
                <h3 className="fb-card-title">Información de Contacto</h3>
                <div className="fb-info-list">
                  <div className="fb-info-item">
                    <span className="fb-info-icon">👤</span>
                    <span className="fb-info-text">Nombre del titular: {dependent.patient?.firstName || 'No proporcionado'} {dependent.patient?.lastName || ''}</span>
                  </div>
                  <div className="fb-info-item">
                    <span className="fb-info-icon">📞</span>
                    <span className="fb-info-text">{dependent.patient?.phone || 'No proporcionado'}</span>
                  </div>
                  <div className="fb-info-item">
                    <span className="fb-info-icon">📧</span>
                    <span className="fb-info-text">{dependent.patient?.user?.email || 'No proporcionado'}</span>
                  </div>
                </div>
              </div>

              <div className="fb-card">
                <h3 className="fb-card-title">Datos Personales</h3>
                <div className="fb-info-list">
                  <div className="fb-info-item">
                    <span className="fb-info-icon">👤</span>
                    <span className="fb-info-text">{`${dependent.firstName || ''} ${dependent.lastName || ''}`.trim() || 'No proporcionado'}</span>
                  </div>
                  <div className="fb-info-item">
                    <span className="fb-info-icon">📅</span>
                    <span className="fb-info-text">{formatDate(dependent.dateOfBirth)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="fb-profile-main">
              <div className="fb-card">
                <h3 className="fb-card-title">Información Médica</h3>
                <div className="alert alert-info" style={{ marginBottom: 20 }}>
                  <strong>Número de Expediente:</strong> {dependent.expedienteNumber || 'No asignado'}
                </div>

                <div className="fb-medical-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                  <div className="fb-medical-item">
                    <label>Grupo Sanguíneo</label>
                    <p>{formatBloodGroup(dependent.bloodGroup)}</p>
                  </div>
                  <div className="fb-medical-item">
                    <label>Genotipo</label>
                    <p>{dependent.genotype || 'No proporcionado'}</p>
                  </div>
                  <div className="fb-medical-item">
                    <label>Alergias Conocidas</label>
                    <p>{dependent.knownAllergies || 'No hay alergias conocidas'}</p>
                  </div>
                </div>
              </div>

              {/* Additional sections similar to patient profile can be added here */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DependentProfile;
