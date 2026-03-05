const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } 
});

pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Erreur de connexion à la base de données :', err.message);
  } else {
    console.log('✅ Base de données PostgreSQL (Supabase) Connectée !');
    release();
  }
});

module.exports = pool; // On exporte la connexion pour l'utiliser ailleurs