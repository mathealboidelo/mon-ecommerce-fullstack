import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/orders/all`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error("Non autorisé");
        return res.json();
      })
      .then(data => {
        setOrders(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Erreur :", err);
        setLoading(false);
      });
  }, [token]);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* EN-TÊTE */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-extrabold text-slate-800">🛒 Toutes les Commandes</h2>
        <button 
          onClick={() => navigate('/admin')}
          className="bg-slate-500 hover:bg-slate-600 text-white px-4 py-2 rounded-lg font-bold transition-colors"
        >
          ← Retour au Dashboard
        </button>
      </div>

      {/* CHARGEMENT OU AFFICHAGE */}
      {loading ? (
        <p className="text-center text-slate-500 text-xl py-10">Chargement des commandes...</p>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800 text-white">
                <th className="p-4 font-semibold">N° Cmd</th>
                <th className="p-4 font-semibold">Date</th>
                <th className="p-4 font-semibold">Client</th>
                <th className="p-4 font-semibold">Articles achetés</th>
                <th className="p-4 font-semibold text-right">Total TTC</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-500 italic">
                    Aucune commande n'a été passée sur le site pour le moment.
                  </td>
                </tr>
              ) : (
                orders.map(order => (
                  <tr key={order.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-bold text-slate-700">#{order.id}</td>
                    <td className="p-4 text-sm text-slate-600">
                      {new Date(order.created_at).toLocaleDateString('fr-FR')}<br/>
                      <span className="text-xs text-slate-400">{new Date(order.created_at).toLocaleTimeString('fr-FR')}</span>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-slate-800">{order.user_name}</div>
                      <div className="text-sm text-slate-500">{order.user_email}</div>
                    </td>
                    <td className="p-4 text-sm">
                      <ul className="list-disc pl-4 text-slate-600">
                        {order.items.map((item, index) => (
                          <li key={index}>
                            {item.quantity}x {item.name || "Produit supprimé"} 
                            <span className="text-slate-400 italic"> ({item.price}€/u)</span>
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="p-4 font-bold text-green-600 text-right text-lg">
                      {order.total_price} €
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminOrders;