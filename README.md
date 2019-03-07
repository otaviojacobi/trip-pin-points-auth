## Setting up your local environment

 - In the project root run `npm install` to install all dependencies
 - [Start the postgresql database](https://www.postgresql.org/docs/9.1/server-start.html)
 - In the repository root set a `.env` file with the following vairables pointing to your postgresql db
    ```
    DB_USERNAME=postgres_username_here
    DB_PASSWORD=postgres_password_here
    DB_HOST=localhost
    DB_PORT=5432
    DB_NAME=postges_db_name_here
    ```
 - Create `public.key` and `private.key` files in the `lib/keys` folder. You can do that as described [here](https://gist.github.com/ygotthilf/baa58da5c3dd1f69fae9).

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

