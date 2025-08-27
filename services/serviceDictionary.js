// services/serviceDictionary.js
// Canonical service names + aliases per provider + basic region map

const CANONICAL = {
  'Amazon EC2': {
    type: 'Compute',
    aliases: { aws: 'Amazon EC2', azure: 'Virtual Machines', gcp: 'Compute Engine', oci: 'Compute Instance' },
    synonyms: [/EC2/i, /Elastic Compute Cloud/i]
  },
  'Amazon S3': {
    type: 'Storage',
    aliases: { aws: 'Amazon S3', azure: 'Blob Storage', gcp: 'Cloud Storage', oci: 'Object Storage' },
    synonyms: [/S3/i, /Simple Storage Service/i]
  },
  'Amazon RDS': {
    type: 'Database',
    aliases: { aws: 'Amazon RDS', azure: 'Azure SQL Database', gcp: 'Cloud SQL', oci: 'Database Service' },
    synonyms: [/RDS/i, /Relational Database/i]
  },
  'AWS Lambda': {
    type: 'Compute',
    aliases: { aws: 'AWS Lambda', azure: 'Azure Functions', gcp: 'Cloud Functions', oci: 'Functions' },
    synonyms: [/Lambda/i]
  },
  'Amazon CloudFront': {
    type: 'Networking',
    aliases: { aws: 'Amazon CloudFront', azure: 'Azure CDN', gcp: 'Cloud CDN', oci: 'Content Delivery' },
    synonyms: [/CloudFront/i]
  },
  'AWS Data Transfer': {
    type: 'Networking',
    aliases: { aws: 'Data Transfer', azure: 'Data Transfer', gcp: 'Network Egress', oci: 'Data Transfer' },
    synonyms: [/Data Transfer/i, /Bandwidth/i]
  }
};

// Extra aliases so we can reverse-map from non-AWS bills back to canonical keys
const REVERSE_ALIASES = Object.entries(CANONICAL).reduce((acc, [canonical, def]) => {
  Object.entries(def.aliases).forEach(([prov, name]) => {
    acc[`${prov}:${name.toLowerCase()}`] = canonical;
  });
  return acc;
}, {});

// Minimal region mapping (expand as needed)
const REGION_MAP = {
  aws: {
    'us-east-1': { azure: 'eastus', gcp: 'us-east1', oci: 'us-ashburn-1' },
    'us-west-2': { azure: 'westus2', gcp: 'us-west1', oci: 'us-phoenix-1' },
    'eu-west-1': { azure: 'westeurope', gcp: 'europe-west1', oci: 'eu-frankfurt-1' }
  },
  azure: {
    'eastus': { aws: 'us-east-1', gcp: 'us-east1', oci: 'us-ashburn-1' },
    'westus2': { aws: 'us-west-2', gcp: 'us-west1', oci: 'us-phoenix-1' },
    'westeurope': { aws: 'eu-west-1', gcp: 'europe-west1', oci: 'eu-frankfurt-1' }
  },
  gcp: {
    'us-east1': { aws: 'us-east-1', azure: 'eastus', oci: 'us-ashburn-1' },
    'us-west1': { aws: 'us-west-2', azure: 'westus2', oci: 'us-phoenix-1' },
    'europe-west1': { aws: 'eu-west-1', azure: 'westeurope', oci: 'eu-frankfurt-1' }
  },
  oci: {
    'us-ashburn-1': { aws: 'us-east-1', azure: 'eastus', gcp: 'us-east1' },
    'us-phoenix-1': { aws: 'us-west-2', azure: 'westus2', gcp: 'us-west1' },
    'eu-frankfurt-1': { aws: 'eu-west-1', azure: 'westeurope', gcp: 'europe-west1' }
  }
};

function canonicalFrom(providerCode, rawName) {
  const key = `${providerCode}:${String(rawName || '').toLowerCase()}`;
  return REVERSE_ALIASES[key] || null;
}

function aliasFor(targetProviderCode, canonicalKey) {
  const def = CANONICAL[canonicalKey];
  return def ? def.aliases[targetProviderCode] : null;
}

function typeFor(canonicalKey) {
  return CANONICAL[canonicalKey]?.type || null;
}

function mapRegion(sourceProvider, sourceRegion, targetProvider) {
  if (!sourceRegion) return defaultRegion(targetProvider);
  const left = REGION_MAP[sourceProvider]?.[sourceRegion.toLowerCase()];
  if (left && left[targetProvider]) return left[targetProvider];
  return defaultRegion(targetProvider);
}

function defaultRegion(provider) {
  switch (provider) {
    case 'aws': return 'us-east-1';
    case 'azure': return 'eastus';
    case 'gcp': return 'us-east1';
    case 'oci': return 'us-ashburn-1';
    default: return 'us-east-1';
  }
}

module.exports = {
  CANONICAL,
  canonicalFrom,
  aliasFor,
  typeFor,
  mapRegion,
  defaultRegion
};
