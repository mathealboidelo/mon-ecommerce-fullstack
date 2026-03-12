const express = require('express');
const router = express.Router();
const pool = require('../config/db'); // On importe notre base de données
const auth = require('../middleware/auth');

// 1. Ajouter un nouveau produit (POST) - Correspond à /api/products/
router.post('/', auth, async (req, res) => {
  try {
    const { name, description, price, imageUrl, stock } = req.body;
    
    // On ajoute $6 qui correspond à req.auth.userId !
    const newProduct = await pool.query(
      'INSERT INTO products (name, description, price, image_url, stock, user_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [name, description, price, imageUrl, stock, req.auth.userId]
    );
    
    res.status(201).json(newProduct.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Erreur serveur lors de la création du produit" });
  }
});

// 2. Récupérer tous les produits (GET) - Correspond à /api/products/
router.get('/', async (req, res) => {
  try {
    // 🚨 LA MAGIE DU SQL : On joint les tables et on calcule la moyenne à la volée !
    const allProducts = await pool.query(`
      SELECT 
        p.*, 
        COALESCE(ROUND(AVG(r.rating), 1), 0) AS average_rating, 
        COUNT(r.id) AS review_count
      FROM products p
      LEFT JOIN reviews r ON p.id = r.product_id
      GROUP BY p.id
      ORDER BY p.id ASC
    `);
    
    res.json(allProducts.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Erreur serveur lors de la récupération des produits" });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params; // On récupère le numéro dans l'URL
    
    const product = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    
    // Si le produit n'existe pas
    if (product.rows.length === 0) {
      return res.status(404).json({ error: "Produit introuvable" });
    }
    
    res.json(product.rows[0]); // On renvoie l'unique produit trouvé
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Erreur serveur lors de la récupération du produit" });
  }
});

// 4. Modifier un produit (PUT) - Correspond à /api/products/:id
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, imageUrl, stock } = req.body;

    // 1. On vérifie d'abord que le produit existe
    const productCheck = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    if (productCheck.rows.length === 0) {
      return res.status(404).json({ error: "Produit introuvable" });
    }

    // 2. On récupère le rôle de l'utilisateur qui fait la requête
    const userCheck = await pool.query('SELECT role FROM users WHERE id = $1', [req.auth.userId]);
    const userRole = userCheck.rows.length > 0 ? userCheck.rows[0].role : 'user';

    // 3. SÉCURITÉ : On vérifie que c'est le propriétaire OU un admin
    const isOwner = productCheck.rows[0].user_id === req.auth.userId;
    const isAdmin = userRole === 'ADMIN';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: "Vous n'êtes pas autorisé à modifier ce produit." });
    }

    // 4. Si c'est le bon utilisateur ou l'admin, on met à jour !
    const updateProduct = await pool.query(
      'UPDATE products SET name = $1, description = $2, price = $3, image_url = $4, stock = $5 WHERE id = $6 RETURNING *',
      [name, description, price, imageUrl, stock, id]
    );

    res.json(updateProduct.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Erreur lors de la modification du produit" });
  }
});

// --- ROUTE POUR SUPPRIMER UN PRODUIT ---
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    // 1. On vérifie d'abord que le produit existe
    const productCheck = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    if (productCheck.rows.length === 0) {
      return res.status(404).json({ error: "Produit introuvable" });
    }

    // 2. On récupère le rôle de l'utilisateur qui fait la requête
    const userCheck = await pool.query('SELECT role FROM users WHERE id = $1', [req.auth.userId]);
    const userRole = userCheck.rows.length > 0 ? userCheck.rows[0].role : 'user';

    // 3. SÉCURITÉ : On vérifie que c'est le propriétaire OU un admin
    const isOwner = productCheck.rows[0].user_id === req.auth.userId;
    const isAdmin = userRole === 'ADMIN';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: "Vous n'êtes pas autorisé à supprimer ce produit." });
    }

    // 4. Si tout est bon, on efface la ligne de la base de données
    await pool.query('DELETE FROM products WHERE id = $1', [id]);

    res.json({ message: "Produit supprimé avec succès." });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Erreur lors de la suppression du produit" });
  }
});

router.post('/:id/reviews', auth, async (req, res) => {
  try {
    const { id } = req.params; // L'ID du produit
    const { rating, comment } = req.body;
    const userId = req.auth.userId; // Récupéré grâce au vigile (auth)

    const newReview = await pool.query(
      'INSERT INTO reviews (product_id, user_id, rating, comment) VALUES ($1, $2, $3, $4) RETURNING *',
      [id, userId, rating, comment]
    );
    
    res.status(201).json(newReview.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Erreur lors de l'ajout du commentaire" });
  }
});

// 7. Récupérer les commentaires d'un produit (GET) - Correspond à /api/products/:id/reviews
router.get('/:id/reviews', async (req, res) => {
  try {
    const { id } = req.params;
    
    // On fait une JOINTURE (JOIN) SQL pour récupérer le nom de l'utilisateur qui a posté l'avis !
    const reviews = await pool.query(
      `SELECT r.*, u.name as user_name 
       FROM reviews r 
       JOIN users u ON r.user_id = u.id 
       WHERE r.product_id = $1 
       ORDER BY r.created_at DESC`,
      [id]
    );
    
    res.json(reviews.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Erreur lors de la récupération des commentaires" });
  }
});

module.exports = router;