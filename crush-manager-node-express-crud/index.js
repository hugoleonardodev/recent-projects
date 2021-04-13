const express = require('express');
const fs = require('fs').promises;
const randtoken = require('rand-token');
// const routeCrush = require('./routeCrush');

const app = express();
const SUCCESS = 200;
const CREATED = 201;
const BAD_REQUEST = 400;
const UNAUTHORIZED = 401;
const NOT_FOUND = 404;
const PORT_3000 = 3000;
const crush = 'crush.json';

app.use(express.json()); // body-parser deprecated

// não remova esse endpoint, e para o avaliador funcionar
app.get('/', (_request, response) => {
  response.status(SUCCESS).send();
});

// Requisito 01
app.get('/crush', async (req, res) => {
  const readFile = await fs.readFile(crush);
  if (!readFile) {
    return res.status(SUCCESS).send([]);
  }
  return res.status(SUCCESS).send(JSON.parse(readFile));
});

// Requisito 07
const validateToken = (authorization) => {
  if (!authorization || authorization.toString() === '') {
    return 'Token não encontrado';
  }
  if (authorization.length !== 16) {
    return 'Token inválido';
  }
  return 'OK';
};

app.get('/crush/search', async (req, res) => {
  const { authorization } = req.headers;
  console.log(authorization);
  const validToken = validateToken(authorization);
  console.log(validToken);
  if (validToken !== 'OK') {
    return res.status(UNAUTHORIZED).json({ message: validToken });
  }

  const searchTerm = req.query.q;
  const file = await fs.readFile(crush);
  const crushes = JSON.parse(file);

  if (!searchTerm || searchTerm === '') {
    return res.status(SUCCESS).json(crushes);
  }

  const searchedCrushes = crushes.filter((e) => e.name.includes(searchTerm));
  if (!searchedCrushes || searchedCrushes === []) {
    return res.status(SUCCESS).json([]);
  }
  res.status(SUCCESS).json(searchedCrushes);
});

// Requisito 02
app.get('/crush/:id', async (req, res) => {
  const { id } = req.params;
  // console.log(typeof id);
  // console.log(parseInt(id, 10));
  const readFile = await fs.readFile(crush);
  // console.log(readFile);
  const findCrush = JSON.parse(readFile).find((e) => e.id === parseInt(id, 10));
  // console.log(findCrush);
  if (!findCrush) {
    return res.status(NOT_FOUND).send({ message: 'Crush não encontrado' });
  }
  return res.status(SUCCESS).send(findCrush);
});

// Requisito 03
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const regex = /^[a-z0-9.]+@[a-z0-9]+\.[a-z]+$/i;

  if (!email || email === '') {
    return res.status(BAD_REQUEST).send({ message: 'O campo "email" é obrigatório' });
  }
  if (!regex.test(email)) {
    return res
      .status(BAD_REQUEST)
      .send({ message: 'O "email" deve ter o formato "email@email.com"' });
  }
  if (!password || password === '') {
    return res
      .status(BAD_REQUEST)
      .send({ message: 'O campo "password" é obrigatório' });
  }
  if (password.toString().length < 6) {
    return res
      .status(BAD_REQUEST)
      .send({ message: 'A "senha" deve ter pelo menos 6 caracteres' });
  }

  const token = randtoken.generate(16);
  return res.status(SUCCESS).send({ token: `${token}` });
});

// Requisito 04
const nameValidation = (req, res, next) => {
  if (!req.body.name) {
    return res.status(BAD_REQUEST).send({ message: 'O campo "name" é obrigatório' });
  }
  if (req.body.name.length <= 3) {
    return res
      .status(BAD_REQUEST)
      .send({ message: 'O "name" deve ter pelo menos 3 caracteres' });
  }
  next();
};

const ageValidation = (req, res, next) => {
  if (!req.body.age) {
    return res.status(BAD_REQUEST).send({ message: 'O campo "age" é obrigatório' });
  }
  if (req.body.age < 18) {
    return res.status(BAD_REQUEST).send({ message: 'O crush deve ser maior de idade' });
  }
  next();
};

const dateValidation = (req, res, next) => {
  if (!req.body.date || !req.body.date.rate || !req.body.date.datedAt) {
    res.status(BAD_REQUEST).send({
      message:
        'O campo "date" é obrigatório e "datedAt" e "rate" não podem ser vazios',
    });
  }
  if (req.body.date.rate < 1 || req.body.date.rate > 5) {
    res
      .status(BAD_REQUEST)
      .send({ message: 'O campo "rate" deve ser um inteiro de 1 à 5' });
  }
  next();
};

const datedAtValidation = (req, res, next) => {
  const {
    body: { date: datedAt },
  } = req;
  const regex = /^(0[1-9]|[12][0-9]|3[01])[/.](0[1-9]|1[012])[/.](19|20)\d\d$/;
  // console.log(datedAt.datedAt);
  if (!regex.test(datedAt.datedAt)) {
    res
      .status(BAD_REQUEST)
      .send({ message: 'O campo "datedAt" deve ter o formato "dd/mm/aaaa"' });
  }
  next();
};

const tokenValidation = (req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(UNAUTHORIZED).send({ message: 'Token não encontrado' });
  }
  if (req.headers.authorization.length < 16) {
    return res.status(UNAUTHORIZED).send({ message: 'Token inválido' });
  }
  next();
};

app.post(
  '/crush',
  tokenValidation,
  nameValidation,
  ageValidation,
  dateValidation,
  datedAtValidation,
  async (req, res) => {
    const file = await fs.readFile(crush);
    const crushes = JSON.parse(file);
    const { name, age, date } = req.body;

    const newCrush = {
      name,
      age,
      id: crushes.length + 1,
      date: {
        datedAt: date.datedAt,
        rate: date.rate,
      },
    };

    crushes.push(newCrush);
    const jsonCrush = JSON.stringify(crushes);
    await fs.writeFile('crush.json', jsonCrush);
    return res.status(CREATED).json(newCrush);
  },
);

// Requisito 05
const editDateValidation = (req, res, next) => {
  // console.log(req.body.date);
  if (
    !req.body.date
    || typeof req.body.date.datedAt !== 'string'
    || typeof req.body.date.rate !== 'number'
  ) {
    return res.status(BAD_REQUEST).send({
      message:
        'O campo "date" é obrigatório e "datedAt" e "rate" não podem ser vazios',
    });
  }
  if (req.body.date.rate < 1 || req.body.date.rate > 5) {
    return res
      .status(BAD_REQUEST)
      .send({ message: 'O campo "rate" deve ser um inteiro de 1 à 5' });
  }
  next();
};

app.put(
  '/crush/:id',
  tokenValidation,
  nameValidation,
  ageValidation,
  editDateValidation,
  datedAtValidation,
  async (req, res) => {
    const { id } = req.params;
    const file = await fs.readFile(crush);
    const crushes = JSON.parse(file);
    const { name, age, date } = req.body;

    const editCrush = {
      name,
      age,
      id: parseInt(id, 10),
      date: {
        datedAt: date.datedAt,
        rate: date.rate,
      },
    };

    const editedCrushes = [
      ...crushes.slice(0, id - 1),
      ...crushes.slice(id - 1, crushes.length - 1),
    ];

    const jsonCrush = JSON.stringify(editedCrushes);
    await fs.writeFile('crush.json', jsonCrush);
    return res.status(SUCCESS).json(editCrush);
  },
);

// Requisito 06
app.delete('/crush/:id', tokenValidation, async (req, res) => {
  const { id } = req.params;
  const file = await fs.readFile(crush);
  const crushes = JSON.parse(file);

  const editedCrushes = [
    ...crushes.slice(0, id - 2), // delete crush
    ...crushes.slice(id - 2, crushes.length - 1),
  ];

  const jsonCrush = JSON.stringify(editedCrushes);
  await fs.writeFile('crush.json', jsonCrush);
  return res.status(SUCCESS).json({ message: 'Crush deletado com sucesso' });
});

// Requisito 07
// const validateToken = (authorization) => {
//   if (!authorization || authorization.toString() === '') {
//     return 'Token não encontrado';
//   }
//   if (authorization.length !== 16) {
//     return 'Token inválido';
//   }
//   return 'OK';
// };

// app.get('/crush/search', async (req, res) => {
//   const { authorization } = req.headers;
//   console.log(authorization);
//   const validToken = validateToken(authorization);
//   console.log(validToken);
//   if (validToken !== 'OK') {
//     return res.status(UNAUTHORIZED).json({ message: validToken });
//   }

//   const searchTerm = req.query.q;
//   const file = await fs.readFile(crush);
//   const crushes = JSON.parse(file);

//   if (!searchTerm || searchTerm === '') {
//     return res.status(SUCCESS).json(crushes);
//   }

//   const searchedCrushes = crushes.filter((e) => e.name.includes(searchTerm));
//   if (!searchedCrushes || searchedCrushes === []) {
//     return res.status(SUCCESS).json([]);
//   }
//   res.status(SUCCESS).json(searchedCrushes);
// });

app.listen(PORT_3000, () => console.log('ouvindo na porta 3000!'));
