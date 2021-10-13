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


# Profile Completion Processor verification:

- You can use the postman collection and environment provided inside postman folder for checking the member traits in topcoder dev environment

Start the producer for profile update topic:
`docker exec -it onboarding-checklist-processor_kafka /opt/kafka/bin/kafka-console-producer.sh --broker-list localhost:9092 --topic member.action.profile.update`

-- Post the update profile message (userId = 305384, handle = mess):
`{"topic":"member.action.profile.update","originator":"topcoder-member-api","timestamp":"2021-10-06T13:59:38.278Z","mime-type":"application/json","payload":{"lastName":"last name","addresses":[{"zip":"560110","streetAddr1":"GM INFINITE ECITY TOWN","city":"Bangalore","stateCode":"Karnataka","type":"HOME"}],"updatedBy":"LEyCiuOrHc7UAFoY0EAAhMulWSX7SrQ5@clients","description":"What goes around comes around","homeCountryCode":"IRL","handle":"denis","otherLangName":"en","userId":305384,"handleLower":"denis","emailVerifyTokenDate":"2021-10-06T14:59:38.262Z","tracks":["DESIGN","DEVELOP"],"firstName":"Atif Ali","photoURL":"https://topcoder-dev-media.s3.amazonaws.com/member/profile/upbeat-1575621848253.png","createdAt":"2020-02-06T07:38:50.088Z","createdBy":"test1","newEmailVerifyToken":"8c3c2f17-ef72-4c3d-894d-e6eefc68075d","emailVerifyToken":"359aaf3b-55e3-4336-b6b0-522d0a81d24c","maxRating":{"rating":1000,"track":"dev","subTrack":"code"},"newEmail":"atif.siddiqui2@topcoder.com","competitionCountryCode":"IRL","newEmailVerifyTokenDate":"2021-10-06T14:59:38.262Z","email":"denis@topcoder.com","status":"ACTIVE","updatedAt":"2021-10-06T13:59:38.262Z"}}`

The processor output should be like: https://monosnap.com/direct/2VsT5LHGhZwmb99s1fvibBz1TvK0wV

-- Post the update profile message - Remove country (userId = 305384, handle = mess):
`{"topic":"member.action.profile.update","originator":"topcoder-member-api","timestamp":"2021-10-06T13:59:38.278Z","mime-type":"application/json","payload":{"lastName":"last name","addresses":[{"zip":"560110","streetAddr1":"GM INFINITE ECITY TOWN","city":"Bangalore","stateCode":"Karnataka","type":"HOME"}],"updatedBy":"LEyCiuOrHc7UAFoY0EAAhMulWSX7SrQ5@clients","description":"What goes around comes around","homeCountryCode":"IRL","handle":"denis","otherLangName":"en","userId":305384,"handleLower":"denis","emailVerifyTokenDate":"2021-10-06T14:59:38.262Z","tracks":["DESIGN","DEVELOP"],"firstName":"Atif Ali","photoURL":"https://topcoder-dev-media.s3.amazonaws.com/member/profile/upbeat-1575621848253.png","createdAt":"2020-02-06T07:38:50.088Z","createdBy":"test1","newEmailVerifyToken":"8c3c2f17-ef72-4c3d-894d-e6eefc68075d","emailVerifyToken":"359aaf3b-55e3-4336-b6b0-522d0a81d24c","maxRating":{"rating":1000,"track":"dev","subTrack":"code"},"newEmail":"atif.siddiqui2@topcoder.com","newEmailVerifyTokenDate":"2021-10-06T14:59:38.262Z","email":"denis@topcoder.com","status":"ACTIVE","updatedAt":"2021-10-06T13:59:38.262Z"}}`

Start the producer for profile picture upload:
`docker exec -it onboarding-checklist-processor_kafka /opt/kafka/bin/kafka-console-producer.sh --broker-list localhost:9092 --topic member.action.profile.photo.update`

-- Post the upload profile picture message (userId =20437508, handle=MiG-29 ):
`{"topic":"member.action.profile.photo.update","originator":"topcoder-member-api","timestamp":"2021-10-06T13:59:38.278Z","mime-type":"application/json","payload":{"userId":20437508,"photoURL":"https://xxx.amazonaws.com/member/profile/abacd.png","updatedAt":"2021-10-11T04:53:22.048Z","updatedBy":"20437508"}}`

-- Post the remove profile picture message (userId =20437508, handle=MiG-29 ):
`{"topic":"member.action.profile.photo.update","originator":"topcoder-member-api","timestamp":"2021-10-06T13:59:38.278Z","mime-type":"application/json","payload":{"userId":20437508,"photoURL":"","updatedAt":"2021-10-11T04:53:22.048Z","updatedBy":"20437508"}}`


Start the producer for create profile trait:
`docker exec -it onboarding-checklist-processor_kafka /opt/kafka/bin/kafka-console-producer.sh --broker-list localhost:9092 --topic member.action.profile.trait.create`

- Before posting the message: https://monosnap.com/direct/OHNzICZUTuhE5Je2vAflYVbEAdxU41

- Post the following message:
`{"topic":"member.action.profile.trait.create","originator":"topcoder-member-api","timestamp":"2021-10-06T14:02:15.568Z","mime-type":"application/json","payload":{"categoryName":"Education","traitId":"education","traits":{"traitId":"education","data":[{"timePeriodTo":"2019-02-16T00:00:00.000Z","major":"Major 1","timePeriodFrom":"2019-01-17T00:00:00.000Z","graduated":true,"schoolCollegeName":"School College Name 1"},{"timePeriodTo":"2020-02-29T06:30:00.000Z","major":"Major 2","timePeriodFrom":"2020-02-01T06:30:00.000Z","graduated":false,"schoolCollegeName":"School College Name 2"}]},"userId":305384,"createdAt":1633528935556,"createdBy":"LEyCiuOrHc7UAFoY0EAAhMulWSX7SrQ5@clients"}}`

- processor output: https://monosnap.com/direct/mjKQgki8K3vAATBpeUefBouMctvh4j
- user traits in tc-dev environment: https://monosnap.com/direct/VqUyFQbTWW9qqO0Mjw4yvm7Hv0q8rF

You can use the following messages for testing other scenarios (post them in the corresponding producers)

- Update profile trait:
  `{"topic":"member.action.profile.trait.update","originator":"topcoder-member-api","timestamp":"2021-10-06T14:02:15.568Z","mime-type":"application/json","payload":{"categoryName":"Education","traitId":"education","traits":{"traitId":"education","data":[{"timePeriodTo":"2019-02-16T00:00:00.000Z","major":"Major 1","timePeriodFrom":"2019-01-17T00:00:00.000Z","graduated":true,"schoolCollegeName":"School College Name 1"}]},"userId":305384,"createdAt":1633528935556,"createdBy":"LEyCiuOrHc7UAFoY0EAAhMulWSX7SrQ5@clients"}}`

- Delete profile trait:
`{"topic":"member.action.profile.trait.delete","originator":"topcoder-member-api","timestamp":"2021-10-06T11:26:58.223Z","mime-type":"application/json","payload":{"userId":305384,"memberProfileTraitIds":["education"],"updatedAt":"2021-10-06T11:26:58.223Z","updatedBy":"LEyCiuOrHc7UAFoY0EAAhMulWSX7SrQ5@clients"}}`

# Unit tests
To run unit tests, execute the following command `npm run test`

# Unit tests with coverage
To run unit tests with coverage run `npm run test:cov`