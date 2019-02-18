module.exports = () => {
  const username = process.env.DB_USERNAME;
  const password = process.env.DB_PASSWORD;
  const host = process.env.DB_HOST;
  const port = process.env.DB_PORT;
  const databaseName = process.env.DB_NAME;

  if(!username || !password || !host || !port || ! databaseName) {
    throw new Error('Could not fetch db connection values from environment variables.');
  }

  return `postgres://${username}:${password}@${host}:${port}/${databaseName}`;
};