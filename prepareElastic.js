var elasticsearch = require('elasticsearch');

var client = new elasticsearch.Client({
    host: 'localhost:9200'
});
var index = 'data_product_live';

const getAveragePricesByDateReport = require('./reports/getAveragePriceByDate');
const getDashboarReport = require('./reports/getDashboardData');

function es() {
    function init(res) {

        Promise.resolve()
            .then(deleteIndex, handleError)
            .then(createIndex, handleError)
            // .then(checkStatus, handleError)
            // .then(closeIndex, handleError)
            // .then(putSettings, handleError)
            .then(putMapping, handleError)
            .then(indexSample, handleError)
            // .then(openIndex, handleError)
            .then(res.json("ES populated!"));

    };


    function ping(res) {
        console.log('ping() ...');

        return client.ping({
            requestTimeout: 30000,
        }, function (error) {
            if (error) {
                res.json('elasticsearch cluster is down!');
            } else {
                res.json('All is well');
            }
        });
    }

    function deleteIndex() {

        console.log('Deleting old index ...');

        return client.indices.delete({
            index: index,
            ignore: [404]
        }).then(handleResolve);
    }

    function createIndex() {

        console.log('Creating new index ...');

        return client.indices.create({
            index: index,
            body: {
                settings: {
                    index: {
                        number_of_replicas: 1 // for local development
                    }
                }
            }
        }).then(handleResolve);
    }

    // This isn't strictly necessary, but it solves a problem with closing
    // the index before it has been created
    function checkStatus() {

        console.log('Checking status ...');

        return client.cluster.health({
            index: index
        }).then(handleResolve);
    }

    function closeIndex() {

        console.log('Closing index ...');

        return client.indices.close({
            index: index
        }).then(handleResolve);
    }

    function putSettings() {

        console.log('Put settings ...');

        return client.indices.putSettings({
            index: index,
            type: type,
            body: {
                settings: {
                    analysis: {
                        analyzer: {
                            folding: {
                                tokenizer: 'standard',
                                filter: ['lowercase', 'asciifolding']
                            }
                        }
                    }
                }
            }
        }).then(handleResolve);
    }

    function putMapping() {

        console.log('Put mapping ...');

        return client.indices.putMapping({
            index: index,
            body: {
                properties: {
                    "valuation_uid": {
                        "type": "integer"
                    },
                    "location": {
                        "type": "geo_point"
                    },
                    "prop_type": {
                        "type": "keyword"
                    },
                    "prop_style": {
                        "type": "keyword"
                    },
                    "beds": {
                        "type": "integer"
                    },
                    "create_date": {
                        "type": "date"
                    },
                    "transaction_price": {
                        "type": "integer"
                    },
                    "sur_rental_val": {
                        "type": "integer"
                    },
                    "postcode": {
                        "type": "keyword"
                    },
                    "PA": {
                        "type": "keyword"
                    },
                    "local_authority": {
                        "type": "keyword"
                    },
                    "gov_region": {
                        "type": "keyword"
                    },
                    "applic_type": {
                        "type": "keyword"
                    },
                    "lender": {
                        "type": "keyword"
                    },
                    "market_sector": {
                        "type": "keyword"
                    },
                    "customer_uid": {
                        "type": "integer"
                    }
                }
            }
        }).then(handleResolve);
    }

    async function get(id, callback) {
        await client.get({
            index: index,
            id: id
        }, callback);

    }


    function indexSample() {

        console.log('Index sample...');

        return client.index({
            index: index,
            id: '1',
            body: {

                "valuation_uid": "1",
                "location": {
                    "lat": 41.12,
                    "lon": -71.34
                },
                "prop_type": "H",
                "prop_style": "SD",
                "beds": 2,
                "create_date": Date.now(),
                "transaction_price": 100000,
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
        }).then(handleResolve);
    }

    async function indexDocument(content, callback) {

        console.log('Index new content...');

        await client.index({
            index: index,
            body: content
        }, callback);
    }

    var formatter = new Intl.NumberFormat('en-UK', {
        style: 'currency',
        currency: 'GBP',

        // These options are needed to round to whole numbers if that's what you want.
        //minimumFractionDigits: 0,
        //maximumFractionDigits: 0,
    });

    async function getReport(reportName, query) {
        console.log('"' + reportName + '"')
        switch (reportName) {
            case 'average_prices_by_date':
                const result = await getAveragePricesByDateReport(client, index, query);
                return result;
            default: throw new Error('No report found')
        }
    }

    async function search(query, callback) {
        await client.search({
            index: index,
            body: {
                query: {
                    bool: {
                        must: [
                            {
                                match: {
                                    postcode_district: query.q.replace('postcode_district:', ''),
                                },

                            },
                            {
                                range: {
                                    transaction_date: {
                                        gte: query.startDate,
                                        lte: query.endDate,
                                        format: "dd-MM-yyyy"
                                    }
                                }
                            }
                        ]
                    }
                }
            },
            size: 100
        }, callback);

    }

    async function getDashboardData(query) {
        const result = await getDashboarReport(client, index, query)
        return result;
    }

    function openIndex() {

        console.log('Open index ...');

        return client.indices.open({
            index: index
        }).then(handleResolve);
    }

    function handleResolve(body) {

        if (!body.error) {

            console.log('\x1b[32m' + 'Success' + '\x1b[37m');
        } else {

            console.log('\x1b[33m' + 'Failed' + '\x1b[37m');
        }

        return Promise.resolve();
    }

    function handleError(err) {

        console.error(JSON.stringify(err.body, null, 2));

        return Promise.reject();
    }

    return { indexDocument, search, getReport, getDashboardData, get, init, ping };
}

module.exports = es;