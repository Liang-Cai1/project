var crypto = require('crypto');

let APIKey = null;
let allAPIKeys = new Map();

function getNewAPIKey(email) {
const newAPIKey = crypto.randomBytes(6).toString('hex');
  allAPIKeys.set(email, newAPIKey);
  displayAPIKeys();
  return newAPIKey;
}

function displayAPIKeys() {
  console.log("allAPIKeys:");
  for (let entry of allAPIKeys.entries()) {
    console.log(entry)
  }
}

function setAPIKey() {
  let APIKey = process.env.API_KEY;

    process.argv.forEach(arg => {
    if (arg.startsWith('--api-key=')) {
      apiKey = arg.split('=')[1];
    }
  });

  if (APIKey) {
    allAPIKeys.set("default", APIKey);
    displayAPIKeys();
  } else {
    console.log("APIKey has no value. Please provide a value through the API_KEY env var or --api-key cmd line parameter.");
    process.exit(1);
  }
}

function checkAPIKey(req, res, next) {
  const APIKeyHeader = req.query.APIKey || req.headers['x-api-key'];

  if (!APIKeyHeader) {
    return res.status(401).json({ message: 'API Key is missing' });
  }

  let ValidKey = false;
  for (let value of allAPIKeys.values()) {
    if (APIKeyHeader === value) {
      ValidKey = true;
    }
  }
	if (!ValidKey) {
    return res.status(403).json({ message: 'API Key is invalid' });
  }

  next();
}

setAPIKey();

module.exports = { setAPIKey, checkAPIKey, getNewAPIKey };