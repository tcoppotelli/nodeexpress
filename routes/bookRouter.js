const lib  = require('../prepareElastic');

const express = require('express');

function routes(){
    const bookRouter = express.Router();
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

    return bookRouter;
}

 module.exports = routes;