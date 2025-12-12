import axios from "axios";


const API_BASE_URL = "http://localhost:8080/api";


// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
})


// Add token to requests if available
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        // Only attach Authorization header if token looks like a compact JWT (has two dots)
        if (token && typeof token === 'string' && (token.split('.').length - 1) === 2) {
            config.headers.Authorization = `Bearer ${token}`
        } else if (token && typeof token === 'string') {
            // If there's a malformed token in storage, remove it to avoid backend JWT parse errors
            console.warn('Malformed token in localStorage, removing it to avoid sending invalid Authorization header.', token);
            localStorage.removeItem('token');
        }
        return config;
    },
    (error) => {
        return Promise.reject(error)
    }
);


export const apiService = {

    //AUTH DATA MANAGEMENT

    saveAuthData: (token, roles) => {
        localStorage.setItem('token', token)
        localStorage.setItem('roles', JSON.stringify(roles))
    },

    logout: () => {
        localStorage.removeItem('token')
        localStorage.removeItem('roles')
    },

    hasRole(role) {
        const roels = localStorage.getItem('roles')
        return roels ? JSON.parse(roels).includes(role) : false;
    },

    isAuthenticated: () => {
        return localStorage.getItem('token') !== null;
    },

    // Check if the user is a doctor
    isDoctor() {
        return this.hasRole('DOCTOR');
    },

    // Check if the user is a PATIENT
    isPatient() {
        return this.hasRole('PATIENT');
    },



    //AUTH & USERS MANAGEMENT METHODS

    login: (body) => {
        return api.post('/auth/login', body);
    },

    register: (body) => {
        return api.post('/auth/register', body);
    },


    forgetPassword: (body) => {
        return api.post('/auth/forgot-password', body)
    },

    resetPassword: (body) => {
        return api.post('/auth/reset-password', body)
    },


    getMyUserDetails: () => {
        return api.get("/users/me");
    },

    getUserById: (userId) => {
        return api.get(`/users/by-id/${userId}`);
    },

    getAllUsers: () => {
        return api.get("/users/all");
    },

    updatePassword: (updatePasswordRequest) => {
        return api.put("/users/update-password", updatePasswordRequest);
    },


    uploadProfilePicture: (file) => {
        // Must use FormData to handle file uploads correctly
        const formData = new FormData();
        formData.append('file', file);

        return api.put("/users/profile-picture", formData, {
            // Important: Set the content type header for file uploads
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    },











    // PATIENTS ACCOUNT MANAGEMENT

    getMyPatientProfile: () => {
        return api.get("/patients/me")
    },

    
    updateMyPatientProfile: (body) => {
        return api.put('/patients/me', body);
    },

    getPatientById: (patientId) => {
        return api.get(`/patients/${patientId}`);
    },

    getAllGenotypeEnums: () => {
        return api.get(`/patients/genotype`);
    },

    getAllBloodGroupEnums: () => {
        return api.get(`/patients/bloodgroup`);
    },




    // DOCTORS ACCOUNT MANAGEMENT

    getMyDoctorProfile: () => {
        return api.get("/doctors/me");
    },

    updateMyDoctorProfile: (body) => {
        return api.put("/doctors/me", body);
    },

    getAllDoctors: () => {
        return api.get("/doctors");
    },

    getDoctorById: (doctorId) => {
        return api.get(`/doctors/${doctorId}`);
    },


    getAllDocgetAllSpecializationEnumstors: () => {
        return api.get("/doctors/specializations");
    },









    // APPOINTMENT MANAGEMENT

    bookAppointment: (appointmentDTO) => {
        return api.post("/appointments", appointmentDTO);
    },

    getMyAppointments: () => {
        return api.get("/appointments");
    },

    cancelAppointment: (appointmentId) => {
        return api.put(`/appointments/cancel/${appointmentId}`);
    },

    completeAppointment: (appointmentId) => {
        return api.put(`/appointments/complete/${appointmentId}`);
    },







    // CONSULTATION MANAGEMENT

    createConsultation: (consultationDTO) => {
        return api.post("/consultations", consultationDTO);
    },

    getConsultationByAppointmentId: (appointmentId) => {
        return api.get(`/consultations/appointment/${appointmentId}`);
    },

    getConsultationHistoryForPatient: (patientId) => {
        return api.get("/consultations/history", {
            params: { patientId }
        });
    },



    // DEPENDENTS MANAGEMENT

    addDependent: (dependentDTO) => {
        return api.post("/dependents", dependentDTO);
    },

    getMyDependents: () => {
        return api.get("/dependents");
    },

    getDependentById: (dependentId) => {
        return api.get(`/dependents/${dependentId}`);
    },

    updateDependent: (dependentId, dependentDTO) => {
        return api.put(`/dependents/${dependentId}`, dependentDTO);
    },

    deleteDependent: (dependentId) => {
        return api.delete(`/dependents/${dependentId}`);
    },

}



export default api;