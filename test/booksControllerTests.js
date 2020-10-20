const should = require('should');
const sinon = require('sinon');
const bookController = require('../controllers/booksController');

describe('Book Controller Tests:', () =>{
   describe('Post',() =>{
       it('should not allow an empty valuation on post', () =>{
            const Lib = function() {
                async function indexDocument(content, callback) {}

                return {indexDocument}
            };

            const req = {
                body:{
                    "location": {
                        "lat": 41.12,
                        "lon": -71.34
                    },
                    "prop_type": "H",
                    "prop_style": "SD",
                    "beds": 2,
                    "create_date": Date.now(),
                    "sur_sales_val":100000,
                    "sur_rental_val": 2000,
                    "postcode": "sw15 1lq",
                    "PA": "SW",
                    "local_authority": "London",
                    "gov_region": "London",
                    "applic_type": "at",
                    "lender": "Barklays",
                    "market_sector": "high",
                    "customer_uid": 123
                }
            };

            const res = {
                status:sinon.spy(),
                send:sinon.spy(),
                json:sinon.spy()
            };

            const controller = bookController(Lib());
            controller.post(req,res);

            res.status.calledWith(400).should.equal(true, `Bad status ${res.status.args[0][0]}`);
            res.send.calledWith('Title is required').should.equal(true);

       });
   });
});

