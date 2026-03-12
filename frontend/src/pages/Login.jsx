import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../components/Input';
import Button from '../components/Button';

function Login() {
  const navigate = useNavigate();
  // Seulement l'email et le mot de passe cette fois-ci
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // On vise la route "auth/login" de ton backend
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data = await response.json();
        
        // 🚨 LA MAGIE EST ICI : On range le Token dans le coffre-fort du navigateur
        localStorage.setItem('token', data.token);
        localStorage.setItem('userId', data.user.id);
        localStorage.setItem('userRole', data.user.role);
        
        alert("Connexion réussie ! Bienvenue.");
        navigate('/'); // On ramène l'utilisateur à l'accueil
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
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Se connecter</h2>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        
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
        
        <Button 
          type="submit" 
          text="Connexion" 
          bgColor="#3498db" 
          textColor="white" 
          fullWidth={true} 
        />
        
      </form>
    </div>
  );
}

export default Login;