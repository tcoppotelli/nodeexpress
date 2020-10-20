function booksController(lib){

    function post(req, res) {

        lib.indexDocument(req.body, function (err, response, status) {
            if (err) {
                return res.send(err);
            }
            res.status(201);
            res.json(response);

        });
    }

    function get(req, res) {
        lib.search(req.query.q, function (err, response, status) {
            if (err) {
                return res.send(err);
            }
            return res.json(response);

        });

    }

    return {post, get}
}


module.exports = booksController;