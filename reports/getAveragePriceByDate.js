const formatter = require("./priceFormatter");

const reportName = 'average_prices_by_date';

module.exports = async (client, index, query) => {
    const calendar_interval = "1w"
    const result = await client.search({
        index: index,
        body: {
            "aggs": {
                "average_prices_by_date": {
                    "date_histogram": {
                        "field": "transaction_date",
                        calendar_interval,
                        "format": "dd-MM-yyyy",
                        "time_zone": "Europe/London",
                        "min_doc_count": 1
                    },
                    "aggs": {
                        "average_transaction_price": {
                            "avg": {
                                "field": "transaction_price"
                            }
                        }
                    }
                },
                "bedrooms": {
                    "terms": {
                        "field": "bedrooms"
                    },
                    aggs: {
                        "average_prices_by_date": {
                            "date_histogram": {
                                "field": "transaction_date",
                                calendar_interval,
                                "format": "dd-MM-yyyy",
                                "time_zone": "Europe/London",
                                "min_doc_count": 1
                            },
                            "aggs": {
                                "average_transaction_price": {
                                    "avg": {
                                        "field": "transaction_price"
                                    }
                                }
                            }
                        },
                    }
                }
            },
            "size": 0,
            "stored_fields": [
                "*"
            ],
            "script_fields": {},
            "docvalue_fields": [
                {
                    "field": "transaction_date",
                    "format": "date_time"
                },
                {
                    "field": "create_date",
                    "format": "date_time"
                },
                {
                    "field": "raw_date",
                    "format": "date_time"
                },
                {
                    "field": "bedrooms",
                    "format": "number"
                }
            ],
            "_source": {
                "excludes": []
            },
            "query": {
                "bool": {
                    "must": [
                        {
                            "query_string": {
                                "query": query,
                                "analyze_wildcard": true,
                                "time_zone": "Europe/London"
                            }
                        }
                    ],
                    "filter": [
                        {
                            "exists": {
                                "field": "transaction_price"
                            }
                        },

                        {
                            "exists": {
                                "field": "transaction_price"
                            }
                        },
                        // {
                        //     "range": {
                        //         "transaction_date": {
                        //             "gte": "2019-10-20T13:26:45.427Z",
                        //             "lte": "2020-12-20T13:26:45.427Z",
                        //             "format": "strict_date_optional_time"
                        //         }
                        //     }
                        // }
                    ],
                    "should": [],
                    "must_not": [
                        {
                            "match": {
                                "trans_type": "Rent"
                            }
                        },
                    ]
                }
            }
        }
    });

    const buckets = result.aggregations[reportName].buckets.map(r => {
        return {
            key: r.key,
            keyString: r.key_as_string,
            count: r.doc_count,
            ...r,
            value: {
                raw: r.average_transaction_price.value,
                formatted: formatter.format((r.average_transaction_price.value)),
            },
        }
    })
    return {
        reportName: 'Average Price by Date',
        columns: [
            {
                field: 'keyString',
                name: 'Date'
            },
            {
                field: 'value',
                name: 'Average Price'
            },
            {
                field: 'count',
                name: 'Properties sold'
            }
        ],
        buckets,
        result
    }

}
