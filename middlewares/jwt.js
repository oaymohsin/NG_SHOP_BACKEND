const { expressjwt: jwt } = require("express-jwt");

function authJwt() {
  const secret = process.env.secret;
  const api = process.env.API_URL;
  return jwt({ secret, algorithms: ["HS256"], isRevoked: isRevoked }).unless({
    path: [
      { url: /\/public\/uploads(.*)/, methods: ['GET', 'OPTIONS'] },
      {
        url: /\/api\/v1\/products(.*)/,
        methods: ["GET", "OPTIONS"],
      },
      { url: /\/api\/v1\/categories(.*)/, methods: ["GET", "OPTIONS"] },
      { url: /\/api\/v1\/orders(.*)/, methods: ['GET', 'OPTIONS', 'POST'] },
      `${api}/users/userLogin`,
      `${api}/users/createUser`,
      // { url: /(.*)/ },
    ],
  });
}

async function isRevoked(req, token) {
  if (!token.payload.isAdmin) {
    return true;
  }
  return false;
}

// function errorHandler(err, req, res, next) {
//     if (err.name === 'UnauthorizedError') {
//       return res.status(401).json({ error: 'Unauthorized', message: 'The token has been revoked.' });
//     }
//     next(err);
//   }

module.exports = authJwt;
