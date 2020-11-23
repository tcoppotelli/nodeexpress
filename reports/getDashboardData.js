const formatter = require("./priceFormatter")

const metadata = {
    average_prices_by_date: {
        title: 'Sold Prices analysis',
        bucketValueKey: 'average_price',
        isPrice: true,
        highlightInfo: {
            name: 'average_price',
            title: 'avg.',
        }
    },
    bedrooms: {
        title: 'Area analysis',
        highlightInfo: {
            name: 'averageBedRoomCount',
            title: '3 bedrooms',
            hardcodedValue: '25%'
        },
        extraInfo: {
            title: 'Bedroom analysis',
            type: 'average',
            prefferredChart: 'pie'
        }
    },
    sales_demand: {
        title: 'Sales Demand',
        bucketValueKey: 'average_price',
        isPrice: true,
        highlightInfo: {
            // name: 'average_price',
            title: 'houses',
            hardcodedValue: '123'
        }
    },
    time_on_market: {
        title: 'Time on Market',
        bucketValueKey: 'average_price',
        isPrice: true,
        highlightInfo: {
            // name: 'average_price',
            title: 'days avg.',
            hardcodedValue: '69'
        }
    },
    lead_flow: {
        title: 'Lead flows',
        bucketValueKey: 'lead_flow',
        isPrice: true,
        highlightInfo: {
            // name: 'average_price',
            title: 'most leads in',
            hardcodedValue: 'E11'
        }
    },
    // rent_demand: {
    //     title: 'Rent Demand',
    //     bucketValueKey: 'average_price',
    //     isPrice: true,
    //     highlightInfo: {
    //         // name: 'average_price',
    //         title: 'apartments to rent',
    //         hardcodedValue: '1230'
    //     }
    // },

    // sales_asking_price: {
    //     title: 'Sales Asking Price',
    //     bucketValueKey: 'average_price',
    //     isPrice: true,
    //     highlightInfo: {
    //         // name: 'average_price',
    //         title: 'avg.',
    //         hardcodedValue: '1230'
    //     }
    // },

    // rent_asking_price: {
    //     title: 'Rent Asking Price',
    //     bucketValueKey: 'average_price',
    //     isPrice: true,
    //     highlightInfo: {
    //         // name: 'average_price',
    //         title: 'avg.',
    //         hardcodedValue: '1230'
    //     }
    // },

    // sales_demand: {
    //     title: 'Sales Demand',
    //     bucketValueKey: 'average_price',
    //     isPrice: true,
    //     highlightInfo: {
    //         // name: 'average_price',
    //         title: 'ratio',
    //         hardcodedValue: '1.2'
    //     }
    // },

    // rent_demand: {
    //     title: 'Rent Demand',
    //     bucketValueKey: 'average_price',
    //     isPrice: true,
    //     highlightInfo: {
    //         // name: 'average_price',
    //         title: 'ratio',
    //         hardcodedValue: '1.2'
    //     }
    // },

    // rent_asking_price: {
    //     title: 'Rent Asking Price',
    //     bucketValueKey: 'average_price',
    //     isPrice: true,
    //     highlightInfo: {
    //         // name: 'average_price',
    //         title: 'avg.',
    //         hardcodedValue: '1230'
    //     }
    // }
}

const extractBucketValues = (key) => (item) => {
    console.log(item)
    return {
        key: item.key,
        value: item[key || 'doc_count'],
        item
    }
}

const getDataForUser = (response) => {
    const { aggregations } = response;
    const dashboardData = Object.keys(metadata).map((key) => {
        const metadataInfo = metadata[key]
        const value = (aggregations[metadataInfo.highlightInfo.name] || {}).value
        return {
            type: key,
            title: metadataInfo.title,
            highlightInfo: {
                ...metadataInfo.highlightInfo,
                value: metadataInfo.highlightInfo.hardcodedValue || (metadataInfo.isPrice ? formatter.format(Math.round(value)) : value)
            },
            // dataSets: [
            //     {
            //         metaData: metadataInfo.extraInfo,
            //         data: aggregations[key] && aggregations[key].buckets.map(extractBucketValues(metadata[key].bucketValueKey))
            //     }
            // ]
        }
    })

    const charts = [
        {
            type: 'bedrooms',
            title: 'Area Analyis',
            data: aggregations['bedrooms'].buckets.map((item) => ({
                name: `${item.key} bedrooms`,
                value: item.doc_count
            }))
        },
        {
            type: 'bedrooms',
            title: 'Properties Styles',
            data: aggregations['prop_type_style'].buckets.map((item) => ({
                name: `${item.key}`,
                value: item.doc_count
            }))
        }
    ]
    return { dashboardData, charts };
}

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
                "average_prices_by_bedrooms": {
                    "date_histogram": {
                        "field": "transaction_date",
                        calendar_interval,
                        "time_zone": "Europe/London",
                        "min_doc_count": 1
                    },
                    "aggs": {
                        "average_price": {
                            "terms": {
                                "field": "bedrooms",
                                "order": {
                                    "average_transaction_price": "desc"
                                },
                                "size": 5
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
                },
                "average_time_to_sell_by_bedrooms": {
                    "date_histogram": {
                        "field": "transaction_date",
                        calendar_interval,
                        "time_zone": "Europe/London",
                        "min_doc_count": 1
                    },
                    "aggs": {
                        "average_time_to_sell": {
                            "terms": {
                                "field": "bedrooms",
                                "order": {
                                    "average_time_to_sell": "desc"
                                },
                                "size": 5
                            },
                            "aggs": {
                                "average_time_to_sell": {
                                    "avg": {
                                        "field": "days_to_complete"
                                    }
                                }
                            }
                        },
                    }
                },
                "bedrooms": {
                    "terms": { "field": "bedrooms" }
                },
                "prop_type_style": {
                    "terms": { "field": "prop_type_style" }
                },
                "prop_type": {
                    "terms": { "field": "prop_type" }
                },
                "new_build": {
                    "terms": { "field": "new_build" }
                },
                "average_price": {
                    "avg": {
                        "field": "transaction_price"
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
                    "must_not": []
                }
            }
        }
    });

    return getDataForUser(result);
}