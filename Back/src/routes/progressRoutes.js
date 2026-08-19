const express = require('express');
const router = express.Router();
const progressController = require('../controllers/progressController');
const authMiddleware = require('../middlewares/authMiddleware');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/evidencias/');
  },
  filename: (req, file, cb) => {
    cb(null, `evidencia-${Date.now()}${path.extname(file.originalname)}`);
  }
});
const upload = multer({ storage });

router.use(authMiddleware);

router.post('/aula/:aulaId/complete', progressController.completarAula);
router.post('/quiz/submit', progressController.submeterQuiz);
router.post('/pratica/finish', upload.single('foto'), progressController.finalizarPratica);
router.post('/certificado/emitir', progressController.emitirCertificado);

module.exports = router;
