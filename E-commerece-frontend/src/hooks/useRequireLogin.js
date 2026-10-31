import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Ye function true return karta hai agar user logged in hai.
// Warna login page par bhej deta hai aur false return karta hai.
export const useRequireLogin = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  return () => {
    if (user) return true;
    navigate('/login', { state: { from: location.pathname } });
    return false;
  };
};