// middlewares/adminMiddleware.js
/*function adminMiddleware(req, res, next) {
  if (req.usuario.tipo !== 'admin') {
    return res.status(403).json({ erro: 'Acesso negado. Somente admin.' });
  }
  next();
}*/


// middlewares/adminMiddleware.js
const { USER_ROLES } = require('../shared/userRoles');

function adminMiddleware(req, res, next) {
  if (req.user?.tipo !== USER_ROLES.ADMIN) {
    return res.status(403).json({ 
      error: 'Acesso negado',
      message: 'Esta funcionalidade é restrita a administradores'
    });
  }
  next();
};

module.exports = adminMiddleware;