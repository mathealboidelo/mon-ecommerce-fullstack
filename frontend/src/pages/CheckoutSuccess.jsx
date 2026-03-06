import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import Button from '../components/Button';

function CheckoutSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    // 🌟 LA MAGIE DE LA LIBRAIRIE : On lance des confettis au chargement de la page !
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#2ecc71', '#3498db', '#f1c40f', '#e74c3c']
    });
  }, []);

  return (
    <div style={{ padding: '4rem 2rem', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '60px', margin: '0 0 20px 0' }}>🎉</h1>
      <h2 style={{ color: '#2ecc71', fontSize: '32px' }}>Commande réussie !</h2>
      <p style={{ color: '#555', fontSize: '18px', lineHeight: '1.6', marginBottom: '40px' }}>
        Merci pour ton achat ! Ta commande a bien été enregistrée. 
        Le montant a été validé et les stocks ont été mis à jour automatiquement.
      </p>
      
      <Button 
        text="Continuer mes achats" 
        bgColor="#3498db" 
        textColor="white" 
        onClick={() => navigate('/')} 
      />
    </div>
  );
}

export default CheckoutSuccess;