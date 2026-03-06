import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../components/Input';
import Button from '../components/Button';

function AddProduct() {
  const navigate = useNavigate();
  // Notre boîte pour stocker les infos du futur produit
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    imageUrl: '',
    stock: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 1. On récupère notre bracelet VIP dans le coffre-fort
    const token = localStorage.getItem('token');

    // Petite sécurité côté frontend au cas où...
    if (!token) {
      alert("Tu dois être connecté pour faire ça !");
      navigate('/connexion');
      return;
    }

    try {
      // 2. On tire vers notre API...
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/products`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          // 🚨 LE VOILÀ ! On montre le bracelet au vigile (le Middleware du backend)
          'Authorization': `Bearer ${token}` 
        },
        // On s'assure que le prix et le stock sont bien envoyés comme des nombres
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          stock: parseInt(formData.stock, 10)
        })
      });

      if (response.ok) {
        alert("🎉 Produit ajouté avec succès dans la vitrine !");
        navigate('/'); // On retourne voir la vitrine
      } else {
        const data = await response.json();
        alert(`Erreur du vigile : ${data.error}`);
      }
    } catch (error) {
      console.error("Erreur :", error);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '500px', margin: '0 auto' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Ajouter un nouveau produit</h2>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        
        <Input type="text" placeholder="Nom du produit (ex: Souris Gamer)" required
          value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
          
        <Input type="text" placeholder="Petite description" required
          value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
          
        <div style={{ display: 'flex', gap: '15px' }}>
          <Input type="number" placeholder="Prix (€)" required
            value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} />
            
          <Input type="number" placeholder="Stock disponible" required
            value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: e.target.value })} />
        </div>
          
        <Input type="url" placeholder="Lien de l'image (https://...)" 
          value={formData.imageUrl} onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })} />
        
        <Button type="submit" text="Mettre en ligne" bgColor="#2ecc71" textColor="white" fullWidth={true} />
        
      </form>
    </div>
  );
}

export default AddProduct;