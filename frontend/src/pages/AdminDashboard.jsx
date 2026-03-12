import { useNavigate } from 'react-router-dom';

function AdminDashboard() {
    const navigate = useNavigate();
  return (
    <main className="p-8 max-w-5xl mx-auto">
      <h2 className="text-3xl font-extrabold mb-6 text-slate-800 border-b-2 border-slate-200 pb-2">
        👑 Panneau de Commandes
      </h2>
      
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <p className="text-slate-600 mb-8 text-lg">
          Bienvenue, Maître du site ! Que souhaitez-vous gérer aujourd'hui ? 🙇‍♂️
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Carte Produits */}
          <div 
            onClick={() => navigate('/admin/produits')} 
            className="bg-blue-50 p-6 rounded-lg border border-blue-100 text-center hover:shadow-md transition-shadow cursor-pointer"
          >
            <h3 className="font-bold text-blue-800 text-xl mb-2">📦 Produits</h3>
            <p className="text-blue-600">Gérer le catalogue et les stocks</p>
          </div>

          {/* Carte Commandes */}
          <div className="bg-green-50 p-6 rounded-lg border border-green-100 text-center hover:shadow-md transition-shadow cursor-pointer">
            <h3 className="font-bold text-green-800 text-xl mb-2">🛒 Commandes</h3>
            <p className="text-green-600">Voir toutes les transactions</p>
          </div>

          {/* Carte Utilisateurs */}
          <div className="bg-purple-50 p-6 rounded-lg border border-purple-100 text-center hover:shadow-md transition-shadow cursor-pointer">
            <h3 className="font-bold text-purple-800 text-xl mb-2">👥 Utilisateurs</h3>
            <p className="text-purple-600">Modérer les comptes clients</p>
          </div>
        </div>
      </div>
    </main>
  );
}

export default AdminDashboard;