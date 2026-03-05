// On a ajouté "type" et "fullWidth" dans les paramètres
function Button({ text, bgColor, textColor, onClick, type = "button", fullWidth = false }) {
  return (
    <button
      type={type} // "button" par défaut, mais pourra être "submit"
      onClick={onClick}
      style={{
        backgroundColor: bgColor || 'transparent',
        color: textColor || '#333',
        padding: '10px 15px',
        border: bgColor === 'transparent' ? '1px solid white' : 'none', 
        borderRadius: '4px',
        cursor: 'pointer',
        fontWeight: 'bold',
        transition: '0.2s',
        width: fullWidth ? '100%' : 'auto' // S'adapte à la largeur si on le demande
      }}
    >
      {text}
    </button>
  );
}

export default Button;