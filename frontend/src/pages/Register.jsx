import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// On importe nos composants d'interface !
import Input from '../components/Input';
import Button from '../components/Button';

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('${import.meta.env.VITE_API_URL}/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert("Inscription réussie ! Tu peux te connecter.");
        navigate('/connexion');
      } else {
        const data = await response.json();
        alert(`Erreur : ${data.error}`);
      }
    } catch (error) {
      console.error("Erreur :", error);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '400px', margin: '0 auto' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Créer un compte</h2>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        
        {/* Utilisation de notre composant Input */}
        <Input 
          type="text" 
          placeholder="Ton nom" 
          value={formData.name} 
          onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
          required 
        />
        
        <Input 
          type="email" 
          placeholder="Ton email" 
          value={formData.email} 
          onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
          required 
        />
        
        <Input 
          type="password" 
          placeholder="Mot de passe" 
          value={formData.password} 
          onChange={(e) => setFormData({ ...formData, password: e.target.value })} 
          required 
        />
        
        {/* Utilisation de notre composant Button en mode "submit" */}
        <Button 
          type="submit" 
          text="S'inscrire" 
          bgColor="#27ae60" 
          textColor="white" 
          fullWidth={true} 
        />
        
      </form>
    </div>
  );
}

export default Register;