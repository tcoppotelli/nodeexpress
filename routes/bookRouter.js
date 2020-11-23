const lib = require('../prepareElastic')();

const express = require('express');
const booksController = require('../controllers/booksController');

function routes() {
    const bookRouter = express.Router();
    bookRouter.route('/es')
        .get((req, res) => {
            lib.ping(res);
        });
    //http://localhost:4000/api/es/init
    bookRouter.route('/es/init')
        .get((req, res) => {
            lib.init(res);
        });

    const controller = booksController(lib);
    //http://localhost:4000/api/sct_usage?q=prop_type:House
    bookRouter.route('/data_product_live')
        .post(controller.post)
        .get(controller.get);

    bookRouter.route('/data_product_live/:id')
        .get(controller.getById);


    bookRouter.route('/reports/:reportName')
        .get(controller.getReport);

    return bookRouter;
}

module.exports = routes;