let apiKeyFromCmd = null;
process.argv.forEach(arg => {
  if (arg.startsWith('--api-key=')) {
    apiKeyFromCmd = arg.split('=')[1];
  }
});

const apiKeyFromEnv = process.env.API_KEY;

const API_KEY = apiKeyFromCmd || apiKeyFromEnv;

if (!API_KEY) {
  console.error('Error: API key not provided. Please specify it via --api-key argument or API_KEY environment variable.');
  process.exit(1);
}

function apiKeyMiddleware(req, res, next) {
  const apiKeyFromHeader = req.header('x-api-key');

  if (!apiKeyFromHeader) {
    return res.status(401).json({ message: 'API Key is missing' });
  }
  if (apiKeyFromHeader !== API_KEY) {
    return res.status(403).json({ message: 'API Key is invalid' });
  }
  next();
}

module.exports = {apiKeyMiddleware, API_KEY};