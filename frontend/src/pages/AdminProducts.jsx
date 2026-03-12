import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function AdminProducts() {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  // Charger tous les produits au démarrage
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/products`)
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error("Erreur chargement :", err));
  }, []);

  // Fonction pour supprimer un produit
  const handleDelete = async (id) => {
    if (!window.confirm("⚠️ Es-tu sûr de vouloir supprimer ce produit définitivement ?")) return;
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        // On retire le produit du tableau sans avoir à recharger la page !
        setProducts(products.filter(p => p.id !== id));
        alert("✅ Produit supprimé !");
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
      {/* EN-TÊTE DU DASHBOARD */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">📦 Gestion des Produits</h2>
        <div className="flex gap-4">
          <button 
            onClick={() => navigate('/admin')}
            className="bg-slate-500 hover:bg-slate-600 text-white px-4 py-2 rounded font-bold transition-colors"
          >
            ← Retour
          </button>
          <button 
            onClick={() => navigate('/ajouter-produit')}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded font-bold transition-colors"
          >
            + Ajouter un produit
          </button>
        </div>
      </div>

      {/* LE TABLEAU (DATA GRID) */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-800 text-white">
              <th className="p-4 font-semibold">Image</th>
              <th className="p-4 font-semibold">Nom du produit</th>
              <th className="p-4 font-semibold">Prix</th>
              <th className="p-4 font-semibold">Stock</th>
              <th className="p-4 font-semibold text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                <td className="p-4">
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name} className="w-16 h-16 object-cover rounded shadow-sm" />
                  ) : (
                    <div className="w-16 h-16 bg-slate-200 rounded flex items-center justify-center text-xs text-slate-500">N/A</div>
                  )}
                </td>
                <td className="p-4 font-bold text-slate-700">{product.name}</td>
                <td className="p-4 text-green-600 font-bold">{product.price} €</td>
                <td className="p-4">
                  {/* Badge de couleur dynamique pour le stock */}
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${product.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {product.stock > 0 ? `${product.stock} en stock` : 'Rupture'}
                  </span>
                </td>
                <td className="p-4 flex justify-center gap-2 mt-3">
                  <button 
                    onClick={() => navigate(`/modifier-produit/${product.id}`)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition-colors"
                  >
                    ✏️ Éditer
                  </button>
                  <button 
                    onClick={() => handleDelete(product.id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-colors"
                  >
                    🗑️ Suppr.
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {products.length === 0 && (
          <p className="text-center p-8 text-slate-500 italic">Aucun produit dans le catalogue.</p>
        )}
      </div>
    </div>
  );
}

export default AdminProducts;