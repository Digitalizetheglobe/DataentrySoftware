const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || '02f4f70a480adff88c7be79840e8ceb3cfac79d7948fcc669129f4ef59b8feec55f897d92ecc9d1f8e9e98cb387384e5e45337345f33a7ffd1de3288a199d112';

const authenticateAdmin = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'Access denied. No token provided.' });

  try {
    // Decode the token directly without splitting
    const decoded = jwt.verify(token, JWT_SECRET);  // No need for .split(' ')[1]
    
    // Check the role from the decoded token
    if (decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admins only.' });
    }

    req.user = decoded;  // Store decoded user info for use in next middleware/route
    next();
  } catch (error) {
    res.status(400).json({ message: 'Invalid token.' });
  }
};

module.exports = { authenticateAdmin };
