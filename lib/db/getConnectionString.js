'use strict';

module.exports = () => {

  const username = process.env.RDS_USERNAME;
  const password = process.env.RDS_PASSWORD;
  const host = process.env.RDS_HOSTNAME;
  const port = process.env.RDS_PORT;
  const databaseName = process.env.RDS_DB_NAME;

  if(!username || !password || !host || !port || ! databaseName) {
    throw new Error('Could not fetch db connection values from environment variables.');
  }

  return `postgres://${username}:${password}@${host}:${port}/${databaseName}`;
};
