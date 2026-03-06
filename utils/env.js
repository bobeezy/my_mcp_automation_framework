function getRequiredEnv(name) {
  const value = process.env[name];
  if (!value) {
    const envFile = process.env.ENV_FILE || 'data/credentials/.env.credentials';
    throw new Error(`Missing required environment variable: ${name}. Set it in ${envFile}.`);
  }
  return value;
}

module.exports = {
  getRequiredEnv
};
