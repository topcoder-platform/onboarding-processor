The following verification steps expect that the member-api is properly working

# Start Dependencies (Kafka and Informix):
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


## Payment methods processor verification
- Connect to informix database using your preferred SQL client tool with the following credentials:
  (Make sure to connect to `informixoltp` database, this is where the `user_payment_method` table is defined)
  - JDBC URL: `jdbc:informix-sqli://localhost:2021/informixoltp:INFORMIXSERVER=informixoltp_tcp`
  - Username: `informix`
  - Password: `1nf0rm1x`

- Insert the test data by running the following statements in `informixoltp` database:
```sql
insert into payment_method_lu(payment_method_desc,payment_method_id,payment_method_list_order,active) VALUES ('wipro payroll', 7, 7, 't');

SET TRIGGERS "informix".trig_user_payment_method_inserted DISABLED;
insert into user_payment_method(user_id, payment_method_id, modify_date) values(10336829, 5, current);
insert into user_payment_method(user_id, payment_method_id, modify_date) values(10336829, 6, current - 1 units day);
insert into user_payment_method(user_id, payment_method_id, modify_date) values(7340263, 5, current - 2 units day);
insert into user_payment_method(user_id, payment_method_id, modify_date) values(252022, 6, current - 4 units day);
insert into user_payment_method(user_id, payment_method_id, modify_date) values(21932422, 6, current - 5 units day);
SET TRIGGERS "informix".trig_user_payment_method_inserted ENABLED;
```

The mapping between the user handles and user ids in TC Dev environment is the following:
- AleaActaEst: 252022
- argolite: 287614
- gevak: 7340263
- saarixx: 21932422
- albertwang: 10336829


Wait for the next execution of the user payment method processor.

- When the processor runs, it will show output like the following: https://monosnap.com/direct/sTV1pKlu5alpOnaiOBCCDtEm0LW2m2

In this output notice that:
 - Only records for 10336829 (albertwang) and 7340263 (gevak) were considered
 - Only the latest updated payment method for 'albertwang' was considered even if he has two records in the db
 - records for users 252022 and 21932422 are not included in the result since these records were modified 4 and 5 days ago respectively


- Update the record for gevak (7340263) using the following SQL statement:
```sql
update user_payment_method set payment_method_id = 2 where user_id = 7340263;
```

- The output of the processor should show logs like: https://monosnap.com/direct/Pdo00x7VpRxQpmGyCfzIJZUZc0XhdE
- The next run output should be: https://monosnap.com/direct/UKt0CgY90mugNxKCVhsecWJyFjJiCh

- Update the record for gevak (7340263) to set a different method:
```sql
update user_payment_method set payment_method_id = 1 where user_id = 7340263;
```

- The output of the next execution should be like: https://monosnap.com/direct/SHwsrW7ZvPOJ7jS9zFfiZTeKLTYIA9
- Subsequent executions will show the following: https://monosnap.com/direct/8OQt6J083ieBDOton9FrnMpv54o2Au

## Id verification processor verification

### before starting app

- Add `LOOKER_API_BASE_URL=https://looker-api.free.beeceptor.com` to `.env` file. It's a online mockServer to mock the looker api

### after starting app and IdVerificationProcessor executed

- The output of the processor should show logs like: https://monosnap.com/file/7u9FRtSbbh6HlYMVC13feDk4gbWJe6


# Unit tests
To run unit tests, execute the following command `npm run test`

# Unit tests with coverage
To run unit tests with coverage run `npm run test:cov`