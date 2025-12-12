import { Navigate } from "react-router-dom";
import { apiService } from "./api";


export const PatientsOnlyRoute = ({ element: Component }) => {
    return apiService.isPatient() ? (
        Component
    ) : (
        <Navigate to={"/login"} />
    )
}


export const DoctorsOnlyRoute = ({ element: Component }) => {
    return apiService.isDoctor() ? (
        Component
    ) : (
        <Navigate to={"/login"} />
    )
}

export const DoctorsAndPatientRoute = ({ element: Component }) => {

    return apiService.isAuthenticated() ? (
        Component
    ) : (
        <Navigate to={"/login"} />
    )
}