import { useNavigate } from 'react-router-dom';
import Button from './Button';
import { Rating } from 'react-simple-star-rating'; // 1. On importe les étoiles !

function ProductCard({ product }) {
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', border: '1px solid #ddd', padding: '15px', borderRadius: '8px', width: '250px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', backgroundColor: 'white' }}>
      
      {/* L'image */}
      {product.image_url ? (
        <img src={product.image_url} alt={product.name} style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '4px' }} />
      ) : (
        <div style={{ width: '100%', height: '150px', backgroundColor: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px' }}>Pas d'image</div>
      )}
      
      {/* Titre et Prix */}
      <h3 style={{ margin: '10px 0 5px 0' }}>{product.name}</h3>
      <p style={{ fontWeight: 'bold', color: '#27ae60', fontSize: '18px', margin: '0 0 10px 0' }}>{product.price} €</p>
      
      {/* 2. 🌟 LA ZONE DES ÉTOILES (Moyenne + Nombre d'avis) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
        <Rating 
          initialValue={Number(product.average_rating)} 
          readonly 
          allowFraction 
          size={16} // Des petites étoiles car c'est une carte de vitrine
        />
        <span style={{ fontSize: '13px', color: '#7f8c8d' }}>
          ({product.review_count})
        </span>
      </div>

      {/* Description */}
      <p style={{ color: '#555', fontSize: '14px', flexGrow: 1, marginTop: '0' }}>
        {product.description.length > 50 ? product.description.substring(0, 50) + '...' : product.description}
      </p>
      
      {/* Bouton */}
      <div style={{ marginTop: '10px' }}>
        <Button 
          text="Voir les détails" 
          bgColor="#2c3e50" 
          textColor="white" 
          fullWidth={true}
          onClick={() => navigate(`/produit/${product.id}`)} 
        />
      </div>
    </div>
  );
}

export default ProductCard;