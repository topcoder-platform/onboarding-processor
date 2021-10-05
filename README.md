# Onboarding API Checklist 

## Dependencies

- Nodejs(v14+)
- Kafka
- [Informix](https://www.ibm.com/products/informix)
- Java 1.8

## Configuration

Configuration is at `config/default.js`.
The following parameters can be set in config files or in env variables:

- `PORT`: port number the health check dropin listening on
- `LOG_LEVEL`: the log level
- `KAFKA_URL`: comma separated Kafka hosts
- `KAFKA_CLIENT_CERT`: Kafka connection certificate, optional;
    if not provided, then SSL connection is not used, direct insecure connection is used;
    if provided, it can be either path to certificate file or certificate content
- `KAFKA_CLIENT_CERT_KEY`: Kafka connection private key, optional;
    if not provided, then SSL connection is not used, direct insecure connection is used;
    if provided, it can be either path to private key file or private key content
- `KAFKA_GROUP_ID`: the Kafka group id
- `MEMBER_API_URL`: the member api url
- `STANDARD_TERMS_ID`: The Topcoder standard terms id
- `NDA_TERMS_ID`: The NDA terms id
- `TERMS_USER_AGREEMENT_TOPIC`: The kafka topic on which the processor will listen to terms agreement events
- `USER_TAXFORM_UPDATE_TOPIC`: The Kafka topic to which to listen to user tax form updated events
- `auth0.AUTH0_URL`: Auth0 URL, used to get TC M2M token
- `auth0.AUTH0_AUDIENCE`: Auth0 audience, used to get TC M2M token
- `auth0.AUTH0_CLIENT_ID`: Auth0 client id, used to get TC M2M token
- `auth0.AUTH0_CLIENT_SECRET`: Auth0 client secret, used to get TC M2M token
- `auth0.AUTH0_PROXY_SERVER_URL`: Proxy Auth0 URL, used to get TC M2M token
- `auth0.TOKEN_CACHE_TIME`: Auth0 token cache time, used to get TC M2M token
- `PAYMENT_METHODS_PROCESSOR_CRON_EXPRESSION`: The cron expression for the user payment methods processor, default value is `* * * * *` (every minutes, used for development only)
- `MODIFIED_PAYMENT_METHODS_TIMEFRAME_DAYS`: The timeframe expressed in days for which to get the updated user payment methods from informix database, default value is 3 which means that when the job runs it will get the user payment methods records modified in the last 3 days
- INFORMIX: This configuration object contains the configuration parameters for Informix database connection, the confguration parameters defined in this object are self-explanatory, for more details refer to `config/default.js`

## Local Dependencies setup

1. Navigate to the directory `local`

2. Run the following command

    ```bash
    docker-compose up -d
    ```
This will setup both Kafka and Informix database with Topcoder databases all set

## Local deployment

0. Make sure to use Node v14+ by command `node -v`. We recommend using [NVM](https://github.com/nvm-sh/nvm) to quickly switch to the right version:

   ```bash
   nvm use
   ```

1. From the project root directory, run the following command to install the dependencies

    ```bash
    npm install
    ```

2. To run linters if required

    ```bash
    npm run lint
    ```

    To fix possible lint errors:

    ```bash
    npm run lint:fix
    ```

3. Local config

   In the `onboarding-processor` root directory create `.env` file with the next environment variables. Values for **Auth0 config** should be shared with you on the forum.<br>

      ```bash
      # Auth0 config
      AUTH0_URL=
      AUTH0_AUDIENCE=
      AUTH0_CLIENT_ID=
      AUTH0_CLIENT_SECRET=
      AUTH0_PROXY_SERVER_URL=
      ```

      - Values from this file would be automatically used by many `npm` commands.
      - ⚠️ Never commit this file or its copy to the repository!

4. Start the processor and health check dropin

    ```bash
    npm start
    ```

5. Run unit tests
    ```bash
    npm run test
    npm run test:cov
    ```

## Local Deployment with Docker

To run the processor using docker, follow the below steps

1. Navigate to the directory `docker`

2. Rename the file `sample.api.env` to `api.env`

3. Set the required configuration parameters in the file `api.env`.

    Note that you can also add other variables to `api.env`, with `<key>=<value>` format per line.

4. Once that is done, run the following command

    ```bash
    docker-compose up
    ```

5. When you are running the application for the first time, It will take some time initially to download the image and install the dependencies
