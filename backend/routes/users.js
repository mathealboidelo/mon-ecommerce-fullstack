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

// Récupérer tous les utilisateurs (GET)
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

module.exports = router;