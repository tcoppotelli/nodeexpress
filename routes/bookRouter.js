const lib  = require('../prepareElastic')();

const express = require('express');
const booksController = require('../controllers/booksController');

function routes(){
    const bookRouter = express.Router();
    bookRouter.route('/es')
        .get((req,res) =>{
            lib.ping(res);
        });
    //http://localhost:4000/api/es/init
    // bookRouter.route('/es/init')
    //     .get((req,res) =>{
    //         lib.init(res);
    //     });

    const controller = booksController(lib);
    //http://localhost:4000/api/sct_usage?q=prop_type:H
    bookRouter.route('/sct_usage')

        .post(controller.post)
        .get(controller.get);


    bookRouter.route('/sct_usage/:id')
        .get((req, res) => {
            lib.get(req.params.id, function (err, response, status) {
                if (err) {
                    res.send(err);
                } else {
                    res.json(response._source);
                }
            });

        });

    bookRouter.route('/bucket/')
        .get((req, res) => {
            lib.searchBucket("", function (err, response, status) {
                console.log(response);
                if (err) {
                    res.send(err);
                } else {
                    res.json(response.aggregations.average_prices.buckets);
                }
            });

        });

    return bookRouter;
}

 module.exports = routes;