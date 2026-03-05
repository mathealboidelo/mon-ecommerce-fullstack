import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Input from '../components/Input';
import Button from '../components/Button';

function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', description: '', price: '', imageUrl: '', stock: '' });

  // Au chargement, on va chercher les infos actuelles du produit pour pré-remplir le formulaire
  useEffect(() => {
    fetch(`http://localhost:5000/api/products/${id}`)
      .then(res => res.json())
      .then(data => {
        setFormData({
          name: data.name,
          description: data.description,
          price: data.price,
          imageUrl: data.image_url || '',
          stock: data.stock
        });
      })
      .catch(err => console.error("Erreur :", err));
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    try {
      // SÉCURITÉ : On fait un PUT (modifier) vers l'ID du produit
      const response = await fetch(`http://localhost:5000/api/products/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          stock: parseInt(formData.stock, 10)
        })
      });

      if (response.ok) {
        alert("🎉 Produit modifié avec succès !");
        navigate(`/produit/${id}`); // On retourne voir la fiche produit
      } else {
        const data = await response.json();
        alert(`Erreur : ${data.error}`);
      }
    } catch (error) {
      console.error("Erreur :", error);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '500px', margin: '0 auto' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>✏️ Modifier le produit</h2>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <Input type="text" placeholder="Nom" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
        <Input type="text" placeholder="Description" required value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
        <div style={{ display: 'flex', gap: '15px' }}>
          <Input type="number" placeholder="Prix" required value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} />
          <Input type="number" placeholder="Stock" required value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: e.target.value })} />
        </div>
        <Input type="url" placeholder="Image URL" value={formData.imageUrl} onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })} />
        
        <Button type="submit" text="Enregistrer les modifications" bgColor="#3498db" textColor="white" fullWidth={true} />
        <Button text="Annuler" bgColor="#e74c3c" textColor="white" fullWidth={true} onClick={() => navigate(`/produit/${id}`)} />
      </form>
    </div>
  );
}

export default EditProduct;