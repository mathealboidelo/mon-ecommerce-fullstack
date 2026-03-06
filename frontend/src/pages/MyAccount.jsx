import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import Input from '../components/Input';

function MyAccount() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  
  // 🌟 L'ÉTAT QUI GÈRE LES ONGLETS : 'profile' ou 'history'
  const [activeTab, setActiveTab] = useState('profile');
  
  // États pour l'historique
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // États pour le profil
  const [email, setEmail] = useState(''); // Idéalement, à récupérer depuis ton backend
  const [newPassword, setNewPassword] = useState('');

  // Vérification de connexion
  useEffect(() => {
    if (!token) {
      alert("Tu dois être connecté pour voir cette page !");
      navigate('/connexion');
    }
  }, [token, navigate]);

  // Récupérer les commandes quand on clique sur l'onglet "historique"
  useEffect(() => {
    if (activeTab === 'history') {
      setLoadingOrders(true);
      fetch(`${import.meta.env.VITE_API_URL}/api/orders/my-orders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        setOrders(data);
        setLoadingOrders(false);
      })
      .catch(err => {
        console.error("Erreur historique :", err);
        setLoadingOrders(false);
      });
    }
  }, [activeTab, token]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    
    // Si l'utilisateur clique sur le bouton sans rien remplir, on bloque
    if (!email && !newPassword) {
      return alert("Tu dois remplir au moins un champ pour mettre à jour ton profil.");
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // On montre notre bracelet VIP
        },
        // On envoie l'email et le nouveau mot de passe
        body: JSON.stringify({ email, newPassword })
      });

      if (response.ok) {
        alert("✅ Tes informations ont été mises à jour avec succès !");
        // On vide les champs pour montrer que c'est bien validé
        setEmail('');
        setNewPassword('');
      } else {
        const data = await response.json();
        alert(`Erreur : ${data.error}`);
      }
    } catch (error) {
      console.error("Erreur de mise à jour :", error);
    }
  };

  return (
    <main style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '32px', marginBottom: '30px' }}>👤 Mon Espace Personnel</h2>

      {/* 🗂️ LE MENU DES ONGLETS */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', borderBottom: '2px solid #eee' }}>
        <button 
          onClick={() => setActiveTab('profile')}
          style={{ 
            padding: '10px 20px', fontSize: '18px', cursor: 'pointer', border: 'none', background: 'transparent',
            borderBottom: activeTab === 'profile' ? '3px solid #3498db' : '3px solid transparent',
            color: activeTab === 'profile' ? '#3498db' : '#7f8c8d',
            fontWeight: activeTab === 'profile' ? 'bold' : 'normal'
          }}
        >
          Mes Informations
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          style={{ 
            padding: '10px 20px', fontSize: '18px', cursor: 'pointer', border: 'none', background: 'transparent',
            borderBottom: activeTab === 'history' ? '3px solid #3498db' : '3px solid transparent',
            color: activeTab === 'history' ? '#3498db' : '#7f8c8d',
            fontWeight: activeTab === 'history' ? 'bold' : 'normal'
          }}
        >
          Historique des commandes
        </button>
      </div>

      {/* 📄 CONTENU DE L'ONGLET : PROFIL */}
      {activeTab === 'profile' && (
        <div style={{ backgroundColor: '#f9f9f9', padding: '30px', borderRadius: '8px', border: '1px solid #ddd' }}>
          <h3>Mettre à jour mes informations</h3>
          <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '400px' }}>
            <div>
              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Adresse Email</label>
              <Input 
                type="email" 
                placeholder="Nouvel email (optionnel)" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
              />
            </div>
            <div>
              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Nouveau Mot de Passe</label>
              <Input 
                type="password" 
                placeholder="Laisser vide pour ne pas changer" 
                value={newPassword} 
                onChange={(e) => setNewPassword(e.target.value)} 
              />
            </div>
            <Button type="submit" text="Enregistrer les modifications" bgColor="#2ecc71" textColor="white" />
          </form>
        </div>
      )}

      {/* 📦 CONTENU DE L'ONGLET : HISTORIQUE */}
      {activeTab === 'history' && (
        <div>
          {loadingOrders ? (
            <p>Chargement de tes anciennes commandes...</p>
          ) : orders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
              <h3>Tu n'as encore rien acheté !</h3>
              <p style={{ color: '#7f8c8d' }}>Il est temps de te faire plaisir dans la boutique.</p>
              <Button text="Aller à la boutique" onClick={() => navigate('/')} bgColor="#3498db" textColor="white" />
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {orders.map(order => (
                <div key={order.id} style={{ border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden' }}>
                  
                  {/* En-tête de la commande */}
                  <div style={{ backgroundColor: '#2c3e50', color: 'white', padding: '15px', display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <strong>Commande n° {order.id}</strong>
                      <div style={{ fontSize: '14px', color: '#bdc3c7', marginTop: '5px' }}>
                        Passée le {new Date(order.created_at).toLocaleDateString('fr-FR')} à {new Date(order.created_at).toLocaleTimeString('fr-FR')}
                      </div>
                    </div>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#f1c40f' }}>
                      {order.total_price} €
                    </div>
                  </div>

                  {/* Liste des produits de CETTE commande */}
                  <div style={{ padding: '15px', backgroundColor: '#fff', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {order.items.map((item, index) => (
                      <div key={index} style={{ display: 'flex', gap: '15px', alignItems: 'center', borderBottom: index !== order.items.length - 1 ? '1px solid #eee' : 'none', paddingBottom: index !== order.items.length - 1 ? '10px' : '0' }}>
                        {item.image_url ? (
                          <img src={item.image_url} alt={item.name} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} />
                        ) : (
                          <div style={{ width: '50px', height: '50px', backgroundColor: '#ccc', borderRadius: '4px' }}></div>
                        )}
                        <div style={{ flex: '1' }}>
                          <strong style={{ display: 'block' }}>{item.name || "Produit supprimé du catalogue"}</strong>
                          <span style={{ color: '#7f8c8d', fontSize: '14px' }}>Quantité : {item.quantity}</span>
                        </div>
                        <div style={{ fontWeight: 'bold' }}>
                          {item.price} €
                        </div>
                      </div>
                    ))}
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </main>
  );
}

export default MyAccount;