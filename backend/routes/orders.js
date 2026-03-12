const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const auth = require('../middleware/auth'); // Le vigile

// Créer une commande (POST) - Correspond à /api/orders
router.post('/', auth, async (req, res) => {
  // On ne fait pas un query direct, on "emprunte" un client à la BDD pour faire notre Transaction
  const client = await pool.connect(); 

  try {
    await client.query('BEGIN'); // 🚨 DÉBUT DE LA TRANSACTION : Tout ou rien !

    const { cart, totalPrice } = req.body;
    const userId = req.auth.userId;

    // 1. Vérifier ET déduire les stocks
    for (let item of cart) {
      // On regarde combien il en reste
      const stockRes = await client.query('SELECT stock FROM products WHERE id = $1', [item.id]);
      
      if (stockRes.rows[0].stock < item.quantity) {
        throw new Error(`Désolé, stock insuffisant pour le produit : ${item.name}`);
      }

      // On déduit du stock
      await client.query(
        'UPDATE products SET stock = stock - $1 WHERE id = $2',
        [item.quantity, item.id]
      );
    }

    // 2. Créer le "Ticket de caisse" (Order)
    const orderRes = await client.query(
      'INSERT INTO orders (user_id, total_price) VALUES ($1, $2) RETURNING id',
      [userId, totalPrice]
    );
    const orderId = orderRes.rows[0].id;

    // 3. Ajouter chaque produit au ticket de caisse (Order Items)
    for (let item of cart) {
      await client.query(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)',
        [orderId, item.id, item.quantity, item.price]
      );
    }

    await client.query('COMMIT'); // ✅ SUCCÈS : On sauvegarde tout définitivement !
    res.status(201).json({ message: "Commande validée avec succès !", orderId });

  } catch (err) {
    await client.query('ROLLBACK'); // ❌ ERREUR : On annule tout, aucun stock n'est touché !
    console.error(err.message);
    res.status(400).json({ error: err.message });
  } finally {
    client.release(); // On rend le client à la BDD
  }
});

router.get('/my-orders', auth, async (req, res) => {
  try {
    const userId = req.auth.userId; // Le vigile nous donne l'ID du client
    
    // 1. On récupère les tickets de caisse de ce client
    const ordersRes = await pool.query(
      'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );

    // 2. Pour chaque ticket, on va chercher les produits précis qu'il a achetés
    const orders = [];
    for (let order of ordersRes.rows) {
      const itemsRes = await pool.query(
        `SELECT oi.quantity, oi.price, p.name, p.image_url 
         FROM order_items oi 
         LEFT JOIN products p ON oi.product_id = p.id 
         WHERE oi.order_id = $1`,
        [order.id]
      );
      // On regroupe le ticket et ses articles
      orders.push({ ...order, items: itemsRes.rows });
    }

    res.json(orders);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Erreur lors de la récupération des commandes" });
  }
});

router.get('/all', auth, async (req, res) => {
  try {
    // 1. Vérifier si l'utilisateur qui demande est bien un administrateur
    const userCheck = await pool.query('SELECT role FROM users WHERE id = $1', [req.auth.userId]);
    if (userCheck.rows.length === 0 || userCheck.rows[0].role !== 'admin') {
      return res.status(403).json({ error: "Accès refusé. Cette zone est réservée aux administrateurs." });
    }

    // 2. Récupérer toutes les commandes en les joignant avec la table users pour avoir le nom du client
    const ordersQuery = await pool.query(`
      SELECT o.id, o.total_price, o.created_at, u.name as user_name, u.email as user_email
      FROM orders o
      JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
    `);
    
    const orders = ordersQuery.rows;

    // 3. Pour chaque commande, on va chercher les articles correspondants
    for (let order of orders) {
      const itemsQuery = await pool.query(`
        SELECT oi.quantity, oi.price, p.name 
        FROM order_items oi
        LEFT JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = $1
      `, [order.id]);
      
      order.items = itemsQuery.rows;
    }

    // 4. On renvoie le tout au Frontend
    res.json(orders);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Erreur lors de la récupération des commandes." });
  }
});

module.exports = router;