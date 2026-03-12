import { Navigate } from 'react-router-dom';

function AdminRoute({ children }) {
  const userRole = localStorage.getItem('userRole');

  // Si l'utilisateur n'est pas admin, on le renvoie à l'accueil avec un message
  if (userRole !== 'ADMIN') {
    alert("⛔ Accès refusé : Cette zone est réservée aux administrateurs.");
    return <Navigate to="/" replace />;
  }

  // S'il est admin, on affiche le composant enfant (la page Dashboard)
  return children;
}

export default AdminRoute;