const express = require('express');
const router = express.Router();
const pool = require('../config/db');
// 1. On importe bcrypt
const bcrypt = require('bcrypt'); 

// Créer un nouvel utilisateur (POST)
router.post('/', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // 2. Le cryptage (hachage) du mot de passe
    const saltRounds = 10; // Niveau de complexité du cryptage (10 est le standard)
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // 3. On insère le mot de passe crypté (hashedPassword) au lieu du mot de passe en clair
    const newUser = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, email, hashedPassword, 'CLIENT']
    );
    
    // 4. SÉCURITÉ : On retire le mot de passe de la réponse avant de l'envoyer au client
    const userResponse = newUser.rows[0];
    delete userResponse.password;
    
    res.status(201).json(userResponse);
  } catch (err) {
    console.error(err.message);
    if (err.code === '23505') {
      return res.status(400).json({ error: "Cet email est déjà utilisé." });
    }
    res.status(500).json({ error: "Erreur serveur lors de la création de l'utilisateur" });
  }
});

/* Récupérer tous les utilisateurs (GET)
router.get('/', async (req, res) => {
  try {
    const allUsers = await pool.query(
      'SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(allUsers.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Erreur serveur lors de la récupération des utilisateurs" });
  }
});
*/

router.get('/', auth, async (req, res) => {
  try {
    // 1. Vérifier si l'utilisateur qui fait la requête est admin
    const userCheck = await pool.query('SELECT role FROM users WHERE id = $1', [req.auth.userId]);
    // On force la mise en majuscule avant de comparer :
    if (userCheck.rows.length === 0 || userCheck.rows[0].role.toUpperCase() !== 'ADMIN') {
      return res.status(403).json({ error: "Accès refusé. Cette zone est réservée aux administrateurs." });
    }

    // 2. Récupérer tous les utilisateurs (SANS les mots de passe !)
    const users = await pool.query(
      'SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(users.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Erreur lors de la récupération des utilisateurs." });
  }
});

// --- ROUTE ADMIN : SUPPRIMER UN UTILISATEUR ---
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Vérifier si l'utilisateur qui fait la requête est admin
    const userCheck = await pool.query('SELECT role FROM users WHERE id = $1', [req.auth.userId]);
    // On force la mise en majuscule avant de comparer :
    if (userCheck.rows.length === 0 || userCheck.rows[0].role.toUpperCase() !== 'ADMIN') {
      return res.status(403).json({ error: "Accès refusé. Cette zone est réservée aux administrateurs." });
    }

    // 2. 🚨 SÉCURITÉ ABSOLUE : Empêcher l'auto-suppression
    if (id === req.auth.userId.toString()) {
      return res.status(403).json({ error: "Suicide numérique interdit ! Vous ne pouvez pas supprimer votre propre compte." });
    }

    // 3. On supprime l'utilisateur
    await pool.query('DELETE FROM users WHERE id = $1', [id]);
    res.json({ message: "Utilisateur banni avec succès." });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Erreur lors de la suppression de l'utilisateur." });
  }
});

module.exports = router;