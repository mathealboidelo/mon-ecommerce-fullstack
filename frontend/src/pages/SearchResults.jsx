import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import Fuse from 'fuse.js';
import ProductCard from '../components/ProductCard';

// 🌟 Importation de nos nouvelles librairies
import Select from 'react-select';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css'; // Le style de la barre de prix

function SearchResults() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- ÉTATS POUR LES FILTRES ET LE TRI ---
  // On met le prix max par défaut à 1000€, on l'ajustera quand on aura chargé les produits
  const [maxPossiblePrice, setMaxPossiblePrice] = useState(1000);
  const [priceRange, setPriceRange] = useState([0, 1000]); 
  const [sortOption, setSortOption] = useState(null);

  // Les options pour notre menu déroulant (react-select)
  const sortOptions = [
    { value: 'price_asc', label: 'Prix : Croissant (Moins cher d\'abord)' },
    { value: 'price_desc', label: 'Prix : Décroissant (Plus cher d\'abord)' },
    { value: 'rating_desc', label: 'Note : Les mieux notés ⭐' },
    { value: 'rating_asc', label: 'Note : Les moins bien notés' }
  ];

  // 1. Récupération des données depuis le backend
  useEffect(() => {
    fetch('${import.meta.env.VITE_API_URL}/api/products')
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        
        // Petite astuce : on trouve le produit le plus cher pour régler le maximum du curseur !
        if (data.length > 0) {
          const highestPrice = Math.max(...data.map(p => Number(p.price)));
          setMaxPossiblePrice(Math.ceil(highestPrice));
          setPriceRange([0, Math.ceil(highestPrice)]); // On règle le curseur de base de 0€ au max
        }
        
        setLoading(false);
      })
      .catch(err => console.error(err));
  }, []);

  // 2. 🧠 LA MAGIE : Le calcul en chaîne (Recherche -> Filtrage -> Tri)
  // useMemo permet de ne refaire ces calculs QUE si les produits, la recherche, le curseur ou le tri changent.
  const processedProducts = useMemo(() => {
    let currentList = [...products]; // On fait une copie de la liste

    // A. RECHERCHE TEXTUELLE (Fuse.js)
    if (query) {
      const fuse = new Fuse(currentList, {
        keys: ['name', 'description'],
        threshold: 0.4,
      });
      currentList = fuse.search(query).map(result => result.item);
    }

    // B. FILTRAGE PAR PRIX (Avec la fourchette du slider)
    currentList = currentList.filter(
      p => Number(p.price) >= priceRange[0] && Number(p.price) <= priceRange[1]
    );

    // C. TRI DES RÉSULTATS (Avec react-select)
    if (sortOption) {
      switch (sortOption.value) {
        case 'price_asc':
          currentList.sort((a, b) => Number(a.price) - Number(b.price));
          break;
        case 'price_desc':
          currentList.sort((a, b) => Number(b.price) - Number(a.price));
          break;
        case 'rating_desc':
          currentList.sort((a, b) => Number(b.average_rating) - Number(a.average_rating));
          break;
        case 'rating_asc':
          currentList.sort((a, b) => Number(a.average_rating) - Number(b.average_rating));
          break;
        default:
          break;
      }
    }

    return currentList;
  }, [products, query, priceRange, sortOption]); // <-- Les dépendances du useMemo

  if (loading) return <h2 style={{ textAlign: 'center', padding: '2rem' }}>Chargement du catalogue...</h2>;

  return (
    <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      
      {query && <h2>Résultats pour : <span style={{ color: '#3498db' }}>"{query}"</span></h2>}
      <p style={{ color: '#7f8c8d', marginBottom: '30px' }}>{processedProducts.length} produit(s) trouvé(s)</p>
      
      {/* STRUCTURE EN 2 COLONNES */}
      <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start' }}>
        
        {/* COLONNE GAUCHE : LES FILTRES (Largeur fixe) */}
        <div style={{ width: '280px', backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px', border: '1px solid #ddd', position: 'sticky', top: '20px' }}>
          <h3 style={{ marginTop: 0, marginBottom: '20px', borderBottom: '2px solid #3498db', paddingBottom: '10px' }}>Filtres & Tri</h3>

          {/* Le composant de Tri */}
          <div style={{ marginBottom: '30px' }}>
            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '10px' }}>Trier par :</label>
            <Select 
              options={sortOptions} 
              value={sortOption}
              onChange={setSortOption}
              placeholder="Sélectionner un tri..."
              isClearable // Permet de remettre à zéro en cliquant sur la petite croix
            />
          </div>

          {/* Le Slider de Prix */}
          <div>
            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '10px' }}>
              Tranche de prix :
            </label>
            <div style={{ padding: '0 10px', marginBottom: '15px' }}>
              <Slider 
                range 
                min={0} 
                max={maxPossiblePrice} 
                value={priceRange} 
                onChange={setPriceRange}
                trackStyle={[{ backgroundColor: '#3498db' }]} // Couleur de la barre remplie
                handleStyle={[ { borderColor: '#3498db' }, { borderColor: '#3498db' } ]} // Couleur des poignées
              />
            </div>
            {/* Affichage des valeurs en euros */}
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#555', fontWeight: 'bold' }}>
              <span>{priceRange[0]} €</span>
              <span>{priceRange[1]} €</span>
            </div>
          </div>
        </div>

        {/* COLONNE DROITE : LA GRILLE DE RÉSULTATS */}
        <div style={{ flex: '1', display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          {processedProducts.length > 0 ? (
            processedProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            <div style={{ textAlign: 'center', width: '100%', padding: '3rem', backgroundColor: '#fdfdfd', borderRadius: '8px', border: '1px dashed #ccc' }}>
              <h3 style={{ color: '#e74c3c' }}>Aucun produit ne correspond à ces critères.</h3>
              <p>Essaie d'élargir ta tranche de prix ou de changer ta recherche.</p>
            </div>
          )}
        </div>

      </div>
    </main>
  );
}

export default SearchResults;