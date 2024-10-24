// const express = require('express');
// const { register, login } = require('../controllers/authController');
// const router = express.Router();

// router.post('/register', register);
// router.post('/login', login);

// module.exports = router;


// middleware/auth.js

const jwt = require('jsonwebtoken');
const JWT_SECRET = 'f293a9d53e157dcf81738d5bf916e7ab2b2cd86198f5891929eb7c0ae3d600e43febd83f3a8047d33778d6139f11de34fe6d25a4097317f496c05fe146e7e564';

const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) {
    return res.status(401).json({ message: 'No token provided.' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Failed to authenticate token.' });
    }

    req.branch_id = decoded.branch_id;
    next();
  });
};

module.exports = verifyToken;
