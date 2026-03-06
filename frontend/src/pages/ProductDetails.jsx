import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Button from '../components/Button';
// 1. 🌟 On importe la fameuse librairie d'étoiles !
import { Rating } from 'react-simple-star-rating';
import { useCartStore } from '../store/cartStore';

function ProductDetails() {
  const addToCart = useCartStore(state => state.addToCart);
  const { id } = useParams(); 
  const navigate = useNavigate();
  
  const currentUserId = localStorage.getItem('userId');
  const token = localStorage.getItem('token');
  
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });

  useEffect(() => {
    fetch(`http://localhost:5000/api/products/${id}`)
      .then(res => {
        if (!res.ok) throw new Error("Produit introuvable");
        return res.json();
      })
      .then(data => {
        setProduct(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });

    fetch(`http://localhost:5000/api/products/${id}/reviews`)
      .then(res => res.json())
      .then(data => setReviews(data))
      .catch(err => console.error("Erreur avis :", err));
  }, [id]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:5000/api/products/${id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(newReview)
      });

      if (response.ok) {
        const refreshRes = await fetch(`http://localhost:5000/api/products/${id}/reviews`);
        const refreshData = await refreshRes.json();
        setReviews(refreshData);
        setNewReview({ rating: 5, comment: '' }); 
        alert("Merci pour ton avis ! ⭐");
      } else {
        const data = await response.json();
        alert(`Erreur : ${data.error}`);
      }
    } catch (error) {
      console.error("Erreur :", error);
    }
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm("Es-tu sûr de vouloir supprimer ce produit définitivement ?");
    if (!confirmDelete) return;
    try {
      const response = await fetch(`http://localhost:5000/api/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        alert("🗑️ Produit supprimé avec succès !");
        navigate('/');
      }
    } catch (error) {
      console.error("Erreur :", error);
    }
  };

  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0 
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews).toFixed(1)
    : 0;

  const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach(review => {
    ratingCounts[review.rating] += 1;
  });

  if (loading) return <h2 style={{ padding: '2rem', textAlign: 'center' }}>Chargement...</h2>;
  if (error) return <h2 style={{ padding: '2rem', textAlign: 'center', color: 'red' }}>{error}</h2>;

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <Button text="← Retour à la vitrine" onClick={() => navigate('/')} />
      
      {/* LA CARTE DU PRODUIT */}
      <div style={{ display: 'flex', gap: '40px', marginTop: '20px', backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px' }}>
        <div style={{ flex: '1' }}>
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} style={{ width: '100%', borderRadius: '8px', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '100%', height: '300px', backgroundColor: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px' }}>Pas d'image</div>
          )}
        </div>

        <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <h1 style={{ margin: 0 }}>{product.name}</h1>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
             <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#27ae60', margin: 0 }}>{product.price} €</p>
             {totalReviews > 0 && (
               <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                 {/* 2. 🌟 Affichage de la moyenne avec de belles étoiles (supporte les demi-étoiles !) */}
                 <Rating initialValue={Number(averageRating)} readonly allowFraction size={24} />
                 <span style={{ color: '#7f8c8d', fontSize: '14px' }}>({averageRating})</span>
               </div>
             )}
          </div>
          
          <div style={{ backgroundColor: '#fff', padding: '15px', borderRadius: '4px', border: '1px solid #ddd' }}>
            <h3 style={{ marginTop: 0 }}>Description</h3>
            <p style={{ lineHeight: '1.6', color: '#444' }}>{product.description}</p>
          </div>
          
          <p><strong>Stock :</strong> {product.stock > 0 ? `${product.stock} unités` : <span style={{ color: 'red' }}>Rupture</span>}</p>
          
          <Button 
            text="Ajouter au panier 🛒" 
            bgColor="#f39c12" 
            textColor="white" 
            fullWidth={true} 
            onClick={() => {
              if(!token) {
                alert("Tu dois être connecté pour ajouter au panier !");
                navigate('/connexion');
              } else {
                addToCart(product); // 🌟 On envoie le produit dans le Store Zustand !
              }
            }} 
          />

          {currentUserId && product.user_id && currentUserId === product.user_id.toString() && (
            <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
              <Button text="✏️ Modifier" bgColor="#3498db" textColor="white" fullWidth={true} onClick={() => navigate(`/modifier-produit/${product.id}`)} />
              <Button text="🗑️ Supprimer" bgColor="#e74c3c" textColor="white" fullWidth={true} onClick={handleDelete} />
            </div>
          )}
        </div>
      </div>

      {/* ZONE DES COMMENTAIRES */}
      <div style={{ marginTop: '40px', backgroundColor: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #ddd' }}>
        <h2 style={{ marginTop: 0 }}>Avis clients ({totalReviews})</h2>

        {/* LE GRAPHIQUE DES ÉTOILES */}
        {totalReviews > 0 && (
          <div style={{ display: 'flex', gap: '30px', alignItems: 'center', marginBottom: '30px', padding: '20px', backgroundColor: '#fdfdfd', borderRadius: '8px', border: '1px solid #eee' }}>
            
            <div style={{ textAlign: 'center', minWidth: '120px' }}>
              <h1 style={{ fontSize: '48px', margin: '0', color: '#2c3e50' }}>{averageRating}</h1>
              <div style={{ marginBottom: '5px' }}>
                {/* 3. 🌟 Étoiles de la note globale */}
                <Rating initialValue={Number(averageRating)} readonly allowFraction size={20} />
              </div>
              <p style={{ margin: 0, color: '#7f8c8d' }}>{totalReviews} avis</p>
            </div>

            <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[5, 4, 3, 2, 1].map(star => {
                const count = ratingCounts[star];
                const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                
                return (
                  <div key={star} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ minWidth: '60px', color: '#555', fontWeight: 'bold' }}>{star} ⭐</span>
                    <div style={{ flex: '1', height: '12px', backgroundColor: '#eee', borderRadius: '6px', overflow: 'hidden' }}>
                      <div style={{ width: `${percentage}%`, height: '100%', backgroundColor: '#f1c40f', borderRadius: '6px', transition: 'width 0.5s ease-in-out' }}></div>
                    </div>
                    <span style={{ minWidth: '30px', textAlign: 'right', color: '#7f8c8d', fontSize: '14px' }}>{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        {/* LE FORMULAIRE D'AJOUT (Visible uniquement si connecté) */}
        {token ? (
          <form onSubmit={handleReviewSubmit} style={{ marginBottom: '30px', padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
            <h4 style={{ marginTop: 0 }}>Laisser un avis</h4>
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '15px' }}>
              <label style={{ fontWeight: 'bold', color: '#555' }}>Ta note :</label>
              
              {/* 4. 🌟 LE CŒUR DE LA LIBRAIRIE : Les étoiles interactives ! */}
              <Rating 
                onClick={(rate) => setNewReview({...newReview, rating: rate})}
                initialValue={newReview.rating}
                size={30}
                transition
                fillColor="#f1c40f"
                emptyColor="#e0e0e0"
              />
              
            </div>
            <textarea 
              placeholder="Ton avis sur ce produit..." 
              required
              value={newReview.comment}
              onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
              style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', minHeight: '80px', marginBottom: '10px', fontFamily: 'inherit', boxSizing: 'border-box' }}
            />
            <Button type="submit" text="Publier mon avis" bgColor="#27ae60" textColor="white" />
          </form>
        ) : (
          <p style={{ fontStyle: 'italic', color: '#7f8c8d', paddingBottom: '20px', borderBottom: '1px solid #eee' }}>
            Tu dois être connecté pour laisser un avis.
          </p>
        )}

        {/* LA LISTE DES COMMENTAIRES */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {reviews.length === 0 ? (
            <p>Aucun avis pour le moment. Sois le premier à donner ton opinion !</p>
          ) : (
            reviews.map(review => (
              <div key={review.id} style={{ borderBottom: '1px solid #eee', paddingBottom: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <strong style={{ color: '#2c3e50', fontSize: '18px' }}>{review.user_name}</strong>
                  
                  {/* 5. 🌟 Étoiles individuelles de chaque client */}
                  <Rating initialValue={review.rating} readonly size={18} />
                  
                </div>
                <p style={{ margin: 0, color: '#555', lineHeight: '1.5', marginTop: '5px' }}>{review.comment}</p>
                <small style={{ color: '#aaa', display: 'block', marginTop: '8px' }}>{new Date(review.created_at).toLocaleDateString('fr-FR')}</small>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}

export default ProductDetails;