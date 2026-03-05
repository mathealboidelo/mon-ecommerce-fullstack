// Notre super composant Input réutilisable !
function Input({ type = "text", placeholder, value, onChange, required = false }) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      style={{
        padding: '12px',
        borderRadius: '4px',
        border: '1px solid #ccc',
        width: '100%',
        boxSizing: 'border-box', // Empêche le champ de déborder
        fontSize: '16px',
        outline: 'none' // Enlève la bordure noire moche quand on clique
      }}
    />
  );
}

export default Input;