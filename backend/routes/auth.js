const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); // On importe notre nouvel outil
const auth = require('../middleware/auth');


// Route pour SE CONNECTER (POST) - Correspond à /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. On vérifie si un utilisateur possède cet email dans la base de données
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: "Email ou mot de passe incorrect." });
    }

    const user = userResult.rows[0];

    // 2. On compare le mot de passe tapé avec le mot de passe crypté dans la base
    const validPassword = await bcrypt.compare(password, user.password);
    
    if (!validPassword) {
      return res.status(401).json({ error: "Email ou mot de passe incorrect." });
    }

    // 3. Le mot de passe est bon ! On fabrique le fameux Token (le bracelet VIP)
    // On met l'ID et le rôle de l'utilisateur à l'intérieur du token
    const token = jwt.sign(
      { userId: user.id, userRole: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' } // Le token expirera dans 24 heures
    );

    // 4. On renvoie le token au client (sans renvoyer le mot de passe)
    res.json({
      message: "Connexion réussie !",
      token: token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Erreur serveur lors de la connexion" });
  }
});

router.put('/update', auth, async (req, res) => {
  try {
    const userId = req.auth.userId; // Récupéré grâce au token de sécurité
    const { email, newPassword } = req.body;

    // 1. On va d'abord chercher les informations actuelles de l'utilisateur
    const user = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    if (user.rows.length === 0) {
      return res.status(404).json({ error: "Utilisateur introuvable" });
    }

    // 2. On prépare les nouvelles valeurs (si le champ est vide, on garde l'ancienne valeur)
    let finalEmail = email || user.rows[0].email;
    let finalPassword = user.rows[0].password; // On garde le mot de passe crypté actuel par défaut

    // 3. Si l'utilisateur a tapé un NOUVEAU mot de passe, on le crypte !
    if (newPassword) {
      const bcrypt = require('bcrypt'); // On s'assure que bcrypt est dispo
      const salt = await bcrypt.genSalt(10);
      finalPassword = await bcrypt.hash(newPassword, salt);
    }

    // 4. On met à jour la base de données
    await pool.query(
      'UPDATE users SET email = $1, password = $2 WHERE id = $3',
      [finalEmail, finalPassword, userId]
    );

    res.json({ message: "Profil mis à jour avec succès !" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Erreur lors de la mise à jour du profil" });
  }
});

module.exports = router;