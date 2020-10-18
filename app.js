const bookRouter  = require('./routes/bookRouter')();

const bodyParser = require('body-parser');
const express = require('express');
const app = express();

const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.use('/api', bookRouter);

app.get('/', (req, res) => {
  res.send('Welcome to my API 2!');
});


app.listen(port, () => {
  console.log(`Runing on port ${port}`);
});
