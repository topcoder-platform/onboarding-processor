The following verification steps expect that the member-api is properly working

# Start Kafka:
- `cd local`
- `docker-compose up`

# Start the processor:
- `npm start`

# Start Kafka producer:

`docker exec -it onboarding-checklist-processor_kafka /opt/kafka/bin/kafka-console-producer.sh --broker-list localhost:9092 --topic terms.notification.user.agreed`

# Post the following message in the producer console:
- message for standard terms completion (userId = 251280 is the id of 'denis' member in tc dev environment )
`{"topic":"terms.notification.user.agreed","originator":"onboarding-api","timestamp":"2021-09-14T00:00:00.000Z","mime-type":"application/json","payload":{"userId":251280,"termsOfUseId":"0dedac8f-5a1a-4fe7-001f-e1d04dc65b7d","legacyId":123456,"created":"2021-09-14T00:00:00.000Z"}}`

- message for nda terms completion
`{"topic":"terms.notification.user.agreed","originator":"onboarding-api","timestamp":"2021-09-14T00:00:00.000Z","mime-type":"application/json","payload":{"userId":251280,"termsOfUseId":"0dedac8f-5a1a-4fe7-002f-e1d04dc65b7d","legacyId":123456,"created":"2021-09-14T00:00:00.000Z"}}`

- message for unsupported terms id
`{"topic":"terms.notification.user.agreed","originator":"onboarding-api","timestamp":"2021-09-14T00:00:00.000Z","mime-type":"application/json","payload":{"userId":251280,"termsOfUseId":"0dedac8f-5a1a-4fe7-003f-e1d04dc65b7d","legacyId":123456,"created":"2021-09-14T00:00:00.000Z"}}`

- Invalid topic message:
`{"topic":"terms.notification.user.invalid","originator":"onboarding-api","timestamp":"2021-09-14T00:00:00.000Z","mime-type":"application/json","payload":{"userId":251280,"termsOfUseId":"0dedac8f-5a1a-4fe7-001f-e1d04dc65b7d","legacyId":123456,"created":"2021-09-14T00:00:00.000Z"}}`

- Malformed JSON message:
`{"topic":"terms.notification.user.invalid","originator":"onboarding-api","timestamp":"2021-09-14T00:00:00.000Z","mime-type":"application/json","payload":{"userId":251280,"termsOfUseId":"0dedac8f-5a1a-4fe7-001f-e1d04dc65b7d","legacyId":123456,"created":"2021-09-14T00:00:`

## Verify tax form processor service

`docker exec -it onboarding-checklist-processor_kafka /opt/kafka/bin/kafka-console-producer.sh --broker-list localhost:9092 --topic terms.notification.user.taxform.updated`

- message for user tax form updated
`{"topic":"terms.notification.user.taxform.updated","originator":"onboarding-api","timestamp":"2021-09-14T00:00:00.000Z","mime-type":"application/json","payload":{"userId":251280,"taxForm":"W-9(TopCoder)","Handle":"denis","created":"2021-09-14T00:00:00.000Z"}}`


# Unit tests
To run unit tests, execute the following command `npm run test`

# Unit tests with coverage
To run unit tests with coverage run `npm run test:cov`