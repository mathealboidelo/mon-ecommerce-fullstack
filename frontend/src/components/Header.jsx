import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; 
import Button from './Button';
import Input from './Input';
import { useCartStore } from '../store/cartStore';

function Header() {
  const navigate = useNavigate();
  const location = useLocation(); 
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');
  const totalItems = useCartStore(state => state.getTotalItems());
  
  // La boîte pour le texte tapé dans la barre du header
  const [searchInput, setSearchInput] = useState('');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId'); 
    localStorage.removeItem('userRole');
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
    <header className="flex flex-col md:flex-row justify-between items-center p-4 bg-slate-800 text-white gap-4 shadow-md">
      
      {/* Le Logo */}
      <h1 onClick={() => navigate('/')} className="m-0 cursor-pointer text-2xl font-bold whitespace-nowrap hover:text-blue-400 transition-colors">
        Mon E-commerce
      </h1>
      
      {/* LA BARRE DE RECHERCHE */}
      <form onSubmit={handleSearch} className="flex w-full md:w-auto md:flex-1 max-w-lg gap-2">
        {/* Note: Il faudrait aussi convertir notre composant <Input /> à Tailwind plus tard */}
        <Input 
          type="text" 
          placeholder="Rechercher un produit..." 
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <Button type="submit" text="🔍" bgColor="#334155" textColor="white" />
      </form>

      {/* Les boutons (flex-wrap permet de passer à la ligne si l'écran est trop petit) */}
      <div className="flex flex-wrap justify-center gap-3 w-full md:w-auto">
        {token ? (
          <> 
            <Button text={`🛒 Panier (${totalItems})`} bgColor="#f59e0b" textColor="white" onClick={() => navigate('/panier')} />
            <Button text="Ajouter un produit" bgColor="#10b981" textColor="white" onClick={() => navigate('/ajouter-produit')} />
            <Button text="👤 Mon Compte" bgColor="#475569" textColor="white" onClick={() => navigate('/mon-compte')} />
            <Button text="Déconnexion" bgColor="#ef4444" textColor="white" onClick={handleLogout} />
            {userRole === 'ADMIN' && (
              <Button text="👑 Dashboard Admin" bgColor="#8b5cf6" textColor="white" onClick={() => navigate('/admin')} />
            )}
          </>
        ) : (
          <> 
            <Button text="Inscription" bgColor="transparent" textColor="white" onClick={() => navigate('/inscription')} />
            <Button text="Connexion" bgColor="#3b82f6" textColor="white" onClick={() => navigate('/connexion')} />
          </>
        )}
      </div>
    </header>
  );
}

export default Header;