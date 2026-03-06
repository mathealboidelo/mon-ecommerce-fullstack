import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import Button from '../components/Button';
import { useState } from 'react';


function Cart() {
  const navigate = useNavigate();

  const [isProcessing, setIsProcessing] = useState(false);
  
  // On récupère toutes nos fonctions magiques du store Zustand
  const { cart, removeFromCart, updateQuantity, clearCart, getTotalPrice } = useCartStore();

  // Si le panier est vide, on affiche un message sympa
  if (cart.length === 0) {
    return (
      <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
        <h2>Ton panier est tristement vide 😢</h2>
        <p style={{ color: '#7f8c8d', marginBottom: '20px' }}>Il est temps d'aller faire du shopping !</p>
        <Button text="Retourner à la boutique" bgColor="#3498db" textColor="white" onClick={() => navigate('/')} />
      </div>
    );
  }

  const handleCheckout = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert("Tu dois être connecté pour passer commande !");
      return navigate('/connexion');
    }

    setIsProcessing(true); // On affiche un chargement

    try {
      // On envoie la requête à notre super route de transaction !
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/orders`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        // On envoie le contenu du panier et le prix calculé par Zustand
        body: JSON.stringify({ cart, totalPrice: getTotalPrice() })
      });

      if (response.ok) {
        clearCart(); // 🌟 On vide le panier Zustand une fois payé
        navigate('/succes'); // On va vers la page de célébration
      } else {
        const data = await response.json();
        alert(`Erreur : ${data.error}`); // Message si rupture de stock !
      }
    } catch (error) {
      console.error("Erreur commande :", error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Si le panier est plein, on affiche l'interface
  return (
    <main style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <h2 style={{ borderBottom: '2px solid #eee', paddingBottom: '10px' }}>🛒 Mon Panier</h2>

      <div style={{ display: 'flex', gap: '30px', marginTop: '20px', alignItems: 'flex-start' }}>
        
        {/* COLONNE GAUCHE : LA LISTE DES ARTICLES */}
        <div style={{ flex: '2', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {cart.map(item => (
            <div key={item.id} style={{ display: 'flex', gap: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#fff', alignItems: 'center' }}>
              
              {/* Image du produit */}
              <img src={item.image_url} alt={item.name} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px' }} />
              
              {/* Titre et prix unitaire */}
              <div style={{ flex: '1' }}>
                <h3 style={{ margin: '0 0 5px 0', fontSize: '16px' }}>{item.name}</h3>
                <p style={{ margin: 0, color: '#7f8c8d' }}>{item.price} € / unité</p>
              </div>

              {/* Les boutons + et - pour la quantité */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', backgroundColor: '#f9f9f9', padding: '5px 15px', borderRadius: '20px', border: '1px solid #eee' }}>
                <button onClick={() => updateQuantity(item.id, -1)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '20px', fontWeight: 'bold', color: '#e74c3c' }}>-</button>
                <span style={{ fontWeight: 'bold', fontSize: '18px', minWidth: '20px', textAlign: 'center' }}>{item.quantity}</span>
                <button onClick={() => updateQuantity(item.id, 1)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '20px', fontWeight: 'bold', color: '#2ecc71' }}>+</button>
              </div>

              {/* Le prix total de CETTE ligne (prix * quantité) */}
              <div style={{ fontWeight: 'bold', fontSize: '18px', color: '#27ae60', minWidth: '90px', textAlign: 'right' }}>
                {(item.price * item.quantity).toFixed(2)} €
              </div>

              {/* Bouton pour supprimer la ligne */}
              <button 
                onClick={() => removeFromCart(item.id)} 
                style={{ background: '#ff7675', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                title="Retirer du panier"
              >
                X
              </button>
            </div>
          ))}
        </div>

        {/* COLONNE DROITE : RÉSUMÉ DE LA COMMANDE */}
        <div style={{ flex: '1', backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px', border: '1px solid #ddd', position: 'sticky', top: '20px' }}>
          <h3 style={{ marginTop: 0, borderBottom: '1px solid #ccc', paddingBottom: '10px' }}>Résumé</h3>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontSize: '18px' }}>
            <span>Total TTC :</span>
            {/* L'appel à notre fonction magique getTotalPrice() */}
            <span style={{ fontWeight: 'bold', color: '#2c3e50', fontSize: '24px' }}>{getTotalPrice().toFixed(2)} €</span>
          </div>

          <Button 
            text={isProcessing ? "Traitement en cours..." : "Valider la commande"} 
            bgColor="#2ecc71" 
            textColor="white" 
            fullWidth={true} 
            onClick={handleCheckout} 
          />
          
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <span 
              onClick={clearCart} 
              style={{ color: '#e74c3c', textDecoration: 'underline', cursor: 'pointer', fontSize: '14px' }}
            >
              Vider tout le panier
            </span>
          </div>
        </div>

      </div>
    </main>
  );
}

export default Cart;