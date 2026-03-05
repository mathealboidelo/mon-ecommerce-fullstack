import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; 
import Button from './Button';
import Input from './Input';

function Header() {
  const navigate = useNavigate();
  const location = useLocation(); 
  const token = localStorage.getItem('token');
  
  // La boîte pour le texte tapé dans la barre du header
  const [searchInput, setSearchInput] = useState('');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId'); 
    alert("Tu es déconnecté ! À bientôt.");
    navigate('/');
  };

  // 🚨 L'action quand on tape "Entrée" ou qu'on clique sur chercher
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim() !== '') {
      // On redirige vers la page de résultats avec l'URL : /recherche?q=motclef
      navigate(`/recherche?q=${encodeURIComponent(searchInput)}`);
      setSearchInput(''); // On vide la barre après la recherche
    }
  };

  return (
    <header style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 2rem', backgroundColor: '#2c3e50', color: 'white', alignItems: 'center' }}>
      
      {/* Le Logo / Titre (à gauche) */}
      <h1 onClick={() => navigate('/')} style={{ margin: 0, cursor: 'pointer', fontSize: '24px' }}>Mon E-commerce</h1>
      
      {/* 🔍 LA BARRE DE RECHERCHE (au centre) */}
      <form onSubmit={handleSearch} style={{ display: 'flex', width: '400px', gap: '5px' }}>
        <Input 
          type="text" 
          placeholder="Rechercher un produit (ex: clavier...)" 
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <Button type="submit" text="🔍" bgColor="#34495e" textColor="white" />
      </form>

      {/* Les boutons de compte (à droite) */}
      <div style={{ display: 'flex', gap: '15px' }}>
        {token ? (
          <> 
            <Button text="Ajouter un produit" bgColor="#2ecc71" textColor="white" onClick={() => navigate('/ajouter-produit')} />
            <Button text="Déconnexion" bgColor="#e74c3c" textColor="white" onClick={handleLogout} />
          </>
        ) : (
          <> 
            <Button text="Inscription" bgColor="transparent" textColor="white" onClick={() => navigate('/inscription')} />
            <Button text="Connexion" bgColor="#3498db" textColor="white" onClick={() => navigate('/connexion')} />
          </>
        )}
      </div>
    </header>
  );
}

export default Header;