const express = require('express');
const router = express.Router();
const contentController = require('../controllers/contentController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

router.get('/modulos', contentController.getModulos);
router.get('/modulos/:moduloId/aulas', contentController.getAulasByModulo);
router.get('/modulos/:moduloId/praticas', contentController.getPraticasByModulo);
router.get('/aulas/:id', contentController.getAulaDetalhes);
router.get('/praticas/:id', contentController.getPraticaDetalhes);

module.exports = router;
