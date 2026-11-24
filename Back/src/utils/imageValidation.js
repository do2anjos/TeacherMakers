const ALLOWED_FORMATS = Object.freeze({
  '.jpg': { mime: 'image/jpeg', signature: isJpeg },
  '.jpeg': { mime: 'image/jpeg', signature: isJpeg },
  '.png': { mime: 'image/png', signature: (buffer) => buffer.length >= 45 && buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) && buffer.subarray(-8).equals(Buffer.from([0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82])) },
  '.webp': { mime: 'image/webp', signature: (buffer) => buffer.length >= 20 && buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.readUInt32LE(4) === buffer.length - 8 && buffer.toString('ascii', 8, 12) === 'WEBP' }
});

function isJpeg(buffer) {
  return buffer.length >= 4 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[buffer.length - 2] === 0xff && buffer[buffer.length - 1] === 0xd9;
}

function validateImage(file) {
  if (!file || !Buffer.isBuffer(file.buffer)) return 'É obrigatório anexar uma imagem.';
  const extension = require('path').extname(file.originalname || '').toLowerCase();
  const format = ALLOWED_FORMATS[extension];
  if (!format) return 'Formato de imagem não permitido. Use JPG, PNG ou WEBP.';
  if (file.mimetype !== format.mime) return 'O tipo MIME não corresponde à extensão do arquivo.';
  if (!format.signature(file.buffer)) return 'O conteúdo do arquivo não corresponde a uma imagem válida.';
  return null;
}

module.exports = { ALLOWED_FORMATS, validateImage };
