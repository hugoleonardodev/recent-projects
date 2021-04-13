const express = require('express');
const fs = require('fs');

const router = express.Router();
const crush = 'crush.json';

const SUCCESS = 200;
// const readCrushes = async () => {
//   const crush = await fs.readFile(
//     path.resolve(__dirname, 'crush.json'),
//     'utf-8',
//   );
//   console.log(crush.toString('utf-8'));
//   return JSON.parse(crush.toString('utf-8'));
// };
// router.get('/crush', async (req, res) => {
//   console.log('entrou no get');
//   const crushes = await readCrushes();
//   console.log(crushes);
//   res.status(SUCCESS).send(crushes);
// });

// function readFilePromise(fileName) {
//   return new Promise((resolve, reject) => {
//     fs.readFile(fileName, (err, content) => {
//       if (err) return reject(err);
//       console.log(content);
//       resolve(content);
//     });
//   });
// }

// router.get('/crush', async (req, res) => {
//   console.log('entrou no get');
//   const crushes = await readFilePromise(crush);
//   console.log(crushes);
//   res.status(SUCCESS).send(crushes);
// });

const data = fs.readFileSync(crush, 'utf8');
console.log(data);
try {
  router.get('/crush', (req, res) => {
    console.log('entrou no get');
    res.status(SUCCESS).send(JSON.parse(data));
    res.end();
  });
} catch (err) {
  console.error(`Erro ao ler o arquivo: ${err.path}`);
  console.log(err);
}

module.exports = router;
