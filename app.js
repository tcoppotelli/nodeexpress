const lib  = require('./prepareElastic');
const bodyParser = require('body-parser');
const express = require('express');

const app = express();
const bookRouter = express.Router();
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

bookRouter.route('/es')
    .get((req,res) =>{
       lib.ping(res);
    });

bookRouter.route('/es/init')
    .get((req,res) =>{
        lib.init(res);
    });

//http://localhost:4000/api/books?q=prop_type:H
bookRouter.route('/books')

    .post((req, res) => {
            // console.log(req.body);
            lib.indexDocument(req.body,function (err, response, status) {
            if (err) {
                return res.send(err);
            }
            return res.json(response);

        });
    })
    .get((req, res) => {
        lib.search(req.query.q, function (err, response, status) {
            if (err) {
                return res.send(err);
            }
            return res.json(response);

        });

    });


bookRouter.route('/books/:bookId')
    .get((req, res) => {
        lib.get(req.params.bookId, function (err, response, status) {
            if (err) {
                res.send(err);
            } else {
                res.json(response._source);
            }
        });

    });

app.use('/api', bookRouter);

app.get('/', (req, res) => {
  res.send('Welcome to my API 2!');
});


app.listen(port, () => {
  console.log(`Runing on port ${port}`);
});
