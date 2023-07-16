# tikapi-ingest-kafka

## Start Kafka & Zookeeper in Docker
```docker compose up -d```

## Create topic "TikAPI" in Kafka
```docker exec -it kafka /bin/kafka-topics --create --replication-factor 1 --partitions 1 --bootstrap-server localhost:9092 --topic TikAPI```

## Install node dependencies
```npm install```

## Build nodejs project
```npm run build```

## Run Producer that ingests data from TikAPI
```node dist/index.js <search> <limit>```

## Helpful commands for Kafka
Show Topics  
```docker exec -it kafka /bin/kafka-topics --list --bootstrap-server localhost:9092```

Describe Topic  
```docker exec -it kafka /bin/kafka-topics --bootstrap-server localhost:9092 --describe --topic TikAPI```

Check Messages  
```docker exec -it kafka /bin/kafka-console-consumer --bootstrap-server localhost:9092 --topic TikAPI --from-beginning```
