This project is a middlewere between ES and the Data Product Ui

To Start just run
```
npm start
```

Make sure that data is loaded in kibana
http://localhost:5601/

if not just start the kibana cluster
Check the data
```
http://localhost:4000/api/sct_usage
```

Search:
```
http://localhost:4000/api/sct_usage?q=pa:SW
```

```
curl -XPUT "http://localhost:9200/_cluster/settings" \
 -H 'Content-Type: application/json' -d'
{
  "persistent": {
    "cluster": {
      "routing": {
        "allocation.disk.threshold_enabled": false
      }
    }
  }
}'
```

