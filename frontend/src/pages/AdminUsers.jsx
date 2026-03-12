import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  const token = localStorage.getItem('token');
  // On récupère notre propre ID pour la sécurité côté Frontend
  const currentUserId = localStorage.getItem('userId'); 

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/users`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error("Non autorisé");
        return res.json();
      })
      .then(data => {
        setUsers(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Erreur :", err);
        setLoading(false);
      });
  }, [token]);

  const handleDelete = async (id) => {
    if (!window.confirm("⚠️ Es-tu sûr de vouloir bannir cet utilisateur ? Ses commandes pourraient être affectées.")) return;
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        setUsers(users.filter(u => u.id !== id));
        alert("✅ Utilisateur supprimé !");
      } else {
        const data = await response.json();
        alert(`Erreur : ${data.error}`);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-extrabold text-slate-800">👥 Gestion des Utilisateurs</h2>
        <button 
          onClick={() => navigate('/admin')}
          className="bg-slate-500 hover:bg-slate-600 text-white px-4 py-2 rounded-lg font-bold transition-colors"
        >
          ← Retour au Dashboard
        </button>
      </div>

      {loading ? (
        <p className="text-center text-slate-500 text-xl py-10">Chargement des utilisateurs...</p>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800 text-white">
                <th className="p-4 font-semibold">Nom</th>
                <th className="p-4 font-semibold">Email</th>
                <th className="p-4 font-semibold">Date d'inscription</th>
                <th className="p-4 font-semibold">Rôle</th>
                <th className="p-4 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => {
                // On vérifie si la ligne correspond à NOTRE compte
                const isMe = user.id.toString() === currentUserId;

                return (
                  <tr key={user.id} className={`border-b border-slate-100 transition-colors ${isMe ? 'bg-blue-50' : 'hover:bg-slate-50'}`}>
                    <td className="p-4 font-bold text-slate-700">
                      {user.name} {isMe && <span className="text-xs text-blue-500 ml-2">(Toi)</span>}
                    </td>
                    <td className="p-4 text-slate-600">{user.email}</td>
                    <td className="p-4 text-sm text-slate-500">
                      {new Date(user.created_at).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-slate-200 text-slate-700'}`}>
                        {user.role === 'admin' ? 'Administrateur' : 'Client'}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <button 
                        onClick={() => handleDelete(user.id)}
                        disabled={isMe} // 🚨 Désactive le bouton si c'est nous-même
                        className={`px-3 py-1 rounded text-sm transition-colors font-bold ${
                          isMe 
                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                            : 'bg-red-500 hover:bg-red-600 text-white'
                        }`}
                        title={isMe ? "Tu ne peux pas te supprimer toi-même" : "Supprimer cet utilisateur"}
                      >
                        {isMe ? '🛡️ Intouchable' : '🗑️ Bannir'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminUsers;