import { Navigate } from 'react-router-dom';
import AuthHelper from '@/helpers/AuthHelper';

export default function ProtectedRoute({ children }) {
    if (!AuthHelper.isAuthenticated()) {
        return <Navigate to="/login" replace />;
    }

    return children;
}
