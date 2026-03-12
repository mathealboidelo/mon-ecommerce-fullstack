import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';

function AddProduct() {
  const navigate = useNavigate();
  const [product, setProduct] = useState({ name: '', description: '', price: '', stock: '' });
  const [imageUrl, setImageUrl] = useState(''); // Pour l'option URL
  const [uploadMethod, setUploadMethod] = useState('url'); // 'url' ou 'file'
  const [selectedFile, setSelectedFile] = useState(null); // Pour l'option Fichier
  const [isUploading, setIsUploading] = useState(false);

  // Configuration de la zone de Glisser-Déposer
  const onDrop = useCallback(acceptedFiles => {
    setSelectedFile(acceptedFiles[0]);
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop, 
    accept: { 'image/*': [] }, 
    maxFiles: 1 
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    if (!token) {
      alert("Tu dois être connecté pour faire ça !");
      navigate('/connexion');
      return;
    }

    setIsUploading(true);
    let finalImageUrl = imageUrl;

    // Si l'utilisateur a choisi d'importer un fichier
    if (uploadMethod === 'file' && selectedFile) {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('upload_preset', 'ml_default'); // 🚨 À REMPLACER
      formData.append('cloud_name', 'dcp56pgs8'); // 🚨 À REMPLACER

      try {
        // Envoi de l'image à Cloudinary
        const cloudRes = await fetch(`https://api.cloudinary.com/v1_1/dcp56pgs8/image/upload`, {
          method: 'POST',
          body: formData
        }); // 🚨 N'oublie pas de remplacer TON_CLOUD_NAME dans l'URL aussi !
        
        const cloudData = await cloudRes.json();
        finalImageUrl = cloudData.secure_url; // On récupère le lien généré
      } catch (err) {
        console.error("Erreur upload Cloudinary:", err);
        alert("Erreur lors de l'upload de l'image.");
        setIsUploading(false);
        return;
      }
    }

    // Envoi des données au Backend
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...product,
          price: parseFloat(product.price),
          stock: parseInt(product.stock, 10),
          imageUrl: finalImageUrl // On envoie soit l'URL texte, soit l'URL Cloudinary
        })
      });

      if (response.ok) {
        alert("🎉 Produit ajouté avec succès !");
        navigate('/');
      } else {
        const data = await response.json();
        alert(`Erreur : ${data.error}`);
      }
    } catch (err) {
      console.error("Erreur Backend:", err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-8 max-w-lg mx-auto">
      <h2 className="text-3xl font-extrabold mb-6 text-slate-800 text-center">Ajouter un produit</h2>
      
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col gap-4">
        
        <div>
          <label className="font-bold text-slate-700 block mb-1">Nom du produit</label>
          <input type="text" required value={product.name} onChange={(e) => setProduct({ ...product, name: e.target.value })} className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:border-blue-500" />
        </div>

        <div>
          <label className="font-bold text-slate-700 block mb-1">Description</label>
          <textarea required value={product.description} onChange={(e) => setProduct({ ...product, description: e.target.value })} className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:border-blue-500" />
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <label className="font-bold text-slate-700 block mb-1">Prix (€)</label>
            <input type="number" required value={product.price} onChange={(e) => setProduct({ ...product, price: e.target.value })} className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:border-blue-500" />
          </div>
          <div className="flex-1">
            <label className="font-bold text-slate-700 block mb-1">Stock</label>
            <input type="number" required value={product.stock} onChange={(e) => setProduct({ ...product, stock: e.target.value })} className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:border-blue-500" />
          </div>
        </div>

        {/* SÉLECTEUR DE MÉTHODE D'IMAGE */}
        <div className="mt-2">
          <label className="font-bold text-slate-700 block mb-2">Image du produit</label>
          <div className="flex gap-2 mb-4">
            <button type="button" onClick={() => setUploadMethod('url')} className={`flex-1 py-2 rounded font-bold transition-colors ${uploadMethod === 'url' ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>Lien URL</button>
            <button type="button" onClick={() => setUploadMethod('file')} className={`flex-1 py-2 rounded font-bold transition-colors ${uploadMethod === 'file' ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>Importer un fichier</button>
          </div>

          {uploadMethod === 'url' ? (
            <input type="url" placeholder="https://..." value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:border-blue-500" />
          ) : (
            <div {...getRootProps()} className={`p-8 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-slate-400 bg-slate-50'}`}>
              <input {...getInputProps()} />
              {selectedFile ? (
                <p className="text-green-600 font-bold">✅ {selectedFile.name}</p>
              ) : (
                <p className="text-slate-500">Glisse une image ici, ou clique pour sélectionner</p>
              )}
            </div>
          )}
        </div>

        <button type="submit" disabled={isUploading} className={`mt-4 py-3 rounded font-bold text-white transition-colors ${isUploading ? 'bg-slate-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'}`}>
          {isUploading ? 'Création en cours...' : 'Mettre en ligne'}
        </button>
      </form>
    </div>
  );
}

export default AddProduct;