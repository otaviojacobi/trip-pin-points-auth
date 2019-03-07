[![Build Status](https://travis-ci.com/otaviojacobi/trip-pin-points-auth.png)](https://travis-ci.com/otaviojacobi/trip-pin-points-auth)

## Setting up your local environment

 - In the project root run `npm install` to install all dependencies
 - [Start the postgresql database](https://www.postgresql.org/docs/9.1/server-start.html)
 - Set a the following environment variables pointing to your postgresql db
    ```
    RDS_USERNAME=postgres_username_here
    RDS_PASSWORD=postgres_password_here
    RDS_HOSTNAME=localhost
    RDS_PORT=5432
    RDS_DB_NAME=postges_db_name_here
    ```

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.<br>
Open [http://localhost:3001](http://localhost:3001) to view it in the browser.

### `npm test`

Launches all unit tests, test coverage and linter.

### `npm run test-no-cov`

Launches unit tests with tape and linter, no coverage.

### `npm run test-coverage`

Launches unit test coverage.

### `npm run lint`

Launches only linter.

### `npm run fix-eslint`

Launches linter fix mode.
