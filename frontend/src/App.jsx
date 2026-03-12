import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import AddProduct from './pages/AddProduct';
import ProductDetails from './pages/ProductDetails';
import EditProduct from './pages/EditProduct';
import SearchResults from './pages/SearchResults';
import Cart from './pages/Cart';
import MyAccount from './pages/MyAccount';
import CheckoutSuccess from './pages/CheckoutSuccess';
import AdminDashboard from './pages/AdminDashboard';
import AdminRoute from './components/AdminRoute';
import AdminProducts from './pages/AdminProducts';
import AdminOrders from './pages/AdminOrders';

function App() {
  return (
    <BrowserRouter>
      <div style={{ fontFamily: 'Arial, sans-serif' }}>
        <Header />
        
        {/* L'aiguilleur : selon l'URL, il affiche le bon composant */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/inscription" element={<Register />} />
          <Route path="/connexion" element={<Login />} />
          <Route path="/ajouter-produit" element={<AddProduct />} />
          <Route path="/produit/:id" element={<ProductDetails />} />
          <Route path="/modifier-produit/:id" element={<EditProduct />} />
          <Route path="/recherche" element={<SearchResults />} />
          <Route path="/panier" element={<Cart />} />
          <Route path="/succes" element={<CheckoutSuccess />} />
          <Route path="/mon-compte" element={<MyAccount />} />
          <Route path="/admin" element={ <AdminRoute> <AdminDashboard /> </AdminRoute>} />
          <Route path="/admin/produits" element={<AdminRoute><AdminProducts /></AdminRoute>} />
          <Route path="/admin/commandes" element={<AdminRoute><AdminOrders /></AdminRoute>} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;