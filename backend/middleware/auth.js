const jwt = require('jsonwebtoken');
require('dotenv').config();

// Voici la fonction "vigile"
module.exports = (req, res, next) => {
  try {
    // 1. On cherche le bracelet (le token) dans l'en-tête de la requête
    // Il arrive sous la forme "Bearer eyJhbGciOiJ..." donc on le coupe pour ne garder que le code
    const token = req.headers.authorization.split(' ')[1];
    
    // 2. On vérifie que c'est un vrai bracelet fabriqué par NOTRE serveur avec NOTRE phrase secrète
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    
    // 3. Si c'est bon, on extrait l'ID de l'utilisateur et on l'accroche à la requête pour la suite
    req.auth = {
      userId: decodedToken.userId,
      userRole: decodedToken.userRole
    };
    
    // 4. Tout est en règle, on laisse passer la requête vers la route finale !
    next();
    
  } catch (error) {
    // Si le token est faux, expiré, ou absent, le vigile bloque tout.
    res.status(401).json({ error: "Accès refusé. Vous devez être connecté avec un Token valide." });
  }
};