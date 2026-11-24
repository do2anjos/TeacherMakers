const express = require('express');
const router = express.Router();
const progressController = require('../controllers/progressController');
const authMiddleware = require('../middlewares/authMiddleware');
const multer = require('multer');
const storageConfig = require('../config/storage');
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: storageConfig.maxUploadBytes, files: 1, fields: 2 }
});

router.use(authMiddleware);

router.get('/conquistas', progressController.listarConquistas);
router.post('/aula/:aulaId/complete', progressController.completarAula);
router.post('/quiz/submit', progressController.submeterQuiz);
router.post('/pratica/finish', (req, res, next) => {
  upload.single('foto')(req, res, (error) => {
    if (error) {
      if (error.code === 'LIMIT_FILE_SIZE') error.status = 413;
      else if (error instanceof multer.MulterError) error.status = 400;
      return next(error);
    }
    next();
  });
}, progressController.finalizarPratica);
router.post('/certificado/emitir', progressController.emitirCertificado);

module.exports = router;
