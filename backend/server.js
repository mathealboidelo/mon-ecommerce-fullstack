const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
// On lance la connexion à la base de données
require('./config/db'); 
const authRoutes = require('./routes/auth');
const orderRoutes = require('./routes/orders');

// On importe nos routes
const productRoutes = require('./routes/produits');
const userRoutes = require('./routes/users');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// On dit à Express d'utiliser le fichier produits.js pour tout ce qui commence par /api/products
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);

app.get('/', (req, res) => {
  res.send('API e-commerce bien rangée !');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Serveur sur le port ${PORT}`);
});