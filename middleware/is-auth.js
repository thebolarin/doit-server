const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {

  // let token = req.headers.token; //token
  // jwt.verify(token, 'secretkey', (err, decoded) => {
  //   if (err) return res.status(401).json({
  //     title: 'unauthorized'
  //   });


  const authHeader = req.get('Authorization');
  if (!authHeader) {
    const error = new Error('Not authenticated.');
    error.statusCode = 401;
    throw error;
  }
  const token = authHeader.split(' ')[1];
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, 'somesupersecretsecret');
  } catch (err) {
    err.statusCode = 500;
    throw err;
  }
  if (!decodedToken) {
    const error = new Error('Not authenticated.');
    error.statusCode = 401;
    throw error;
  }
  req.userId = decodedToken.userId;
  req.name = decodedToken.name;
  req.phone = decodedToken.phone;
  next();
};
