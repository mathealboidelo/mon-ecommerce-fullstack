import { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';

function Home() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/products')
      .then(response => response.json())
      .then(data => setProducts(data))
      .catch(error => console.error("Erreur de connexion :", error));
  }, []);

  return (
    <main style={{ padding: '2rem' }}>
      <h2>Nos Produits en Stock</h2>
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        {products.length === 0 && <p>Chargement des produits...</p>}
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </main>
  );
}

export default Home;