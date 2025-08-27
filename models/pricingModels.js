class PricingModel {
    constructor() {
        this.providers = new Map();
        this.serviceMappings = new Map();
        this.pricingData = new Map();
    }

    // Service Type Definitions
    static get SERVICE_TYPES() {
        return {
            COMPUTE: 'Compute',
            STORAGE: 'Storage',
            DATABASE: 'Database',
            NETWORKING: 'Networking',
            ANALYTICS: 'Analytics',
            MACHINE_LEARNING: 'Machine Learning',
            CONTAINERS: 'Containers'
        };
    }

    // AWS to Other Cloud Service Mappings
    static get SERVICE_MAPPINGS() {
        return {
            // Compute Services
            'Amazon EC2': {
                aws: 'EC2',
                oci: 'Compute Instance',
                azure: 'Virtual Machines',
                gcp: 'Compute Engine',
                conversion: 1.0 // Adjust based on performance equivalents
            },
            'AWS Lambda': {
                aws: 'Lambda',
                oci: 'Functions',
                azure: 'Azure Functions',
                gcp: 'Cloud Functions',
                conversion: 1.0
            },

            // Storage Services
            'Amazon S3': {
                aws: 'S3',
                oci: 'Object Storage',
                azure: 'Blob Storage',
                gcp: 'Cloud Storage',
                conversion: 1.0
            },
            'Amazon EBS': {
                aws: 'EBS',
                oci: 'Block Volume',
                azure: 'Managed Disks',
                gcp: 'Persistent Disk',
                conversion: 1.0
            },

            // Database Services
            'Amazon RDS': {
                aws: 'RDS',
                oci: 'Database Service',
                azure: 'Azure SQL Database',
                gcp: 'Cloud SQL',
                conversion: 1.0
            },
            'Amazon DynamoDB': {
                aws: 'DynamoDB',
                oci: 'NoSQL Database',
                azure: 'Cosmos DB',
                gcp: 'Firestore',
                conversion: 1.0
            },

            // Networking
            'Amazon CloudFront': {
                aws: 'CloudFront',
                oci: 'Content Delivery Network',
                azure: 'Azure CDN',
                gcp: 'Cloud CDN',
                conversion: 1.0
            },
            'AWS Data Transfer': {
                aws: 'Data Transfer',
                oci: 'Data Transfer',
                azure: 'Data Transfer',
                gcp: 'Network Egress',
                conversion: 1.0
            }
        };
    }

    // Pricing Calculation Methods
    calculateComputeCost(usageHours, pricePerHour, instanceCount = 1) {
        return usageHours * pricePerHour * instanceCount;
    }

    calculateStorageCost(usageGB, pricePerGB, storageClass = 'standard') {
        // Different storage classes might have different pricing
        return usageGB * pricePerGB;
    }

    calculateDataTransferCost(usageGB, pricePerGB, direction = 'egress') {
        // Direction: 'ingress' (free usually) or 'egress'
        return direction === 'egress' ? usageGB * pricePerGB : 0;
    }

    calculateDatabaseCost(usageHours, storageGB, computePrice, storagePrice) {
        const computeCost = this.calculateComputeCost(usageHours, computePrice);
        const storageCost = this.calculateStorageCost(storageGB, storagePrice);
        return computeCost + storageCost;
    }

    // Usage Normalization Methods
    normalizeComputeUsage(awsUsage, targetProvider, serviceType) {
        // Convert AWS usage to target provider equivalent
        // This might involve CPU/RAM normalization factors
        const normalizationFactors = {
            'aws-to-oci': 1.0,
            'aws-to-azure': 1.0,
            'aws-to-gcp': 1.0
        };

        const factorKey = `aws-to-${targetProvider}`;
        const factor = normalizationFactors[factorKey] || 1.0;

        return {
            normalizedHours: awsUsage.hours * factor,
            normalizedGB: awsUsage.gb * factor,
            normalizedRequests: awsUsage.requests * factor
        };
    }

    // Cost Comparison Methods
    compareCosts(awsCost, targetCost, usageDetails) {
        const savings = awsCost - targetCost;
        const savingsPercentage = awsCost > 0 ? (savings / awsCost) * 100 : 0;

        return {
            awsCost: parseFloat(awsCost.toFixed(2)),
            targetCost: parseFloat(targetCost.toFixed(2)),
            absoluteSavings: parseFloat(savings.toFixed(2)),
            percentageSavings: parseFloat(savingsPercentage.toFixed(2)),
            isCheaper: targetCost < awsCost,
            costDifference: parseFloat(Math.abs(savings).toFixed(2))
        };
    }

    // Region Mapping
    static get REGION_MAPPINGS() {
        return {
            'us-east-1': { // AWS US East (N. Virginia)
                oci: 'us-ashburn-1',
                azure: 'eastus',
                gcp: 'us-east1'
            },
            'us-west-2': { // AWS US West (Oregon)
                oci: 'us-phoenix-1',
                azure: 'westus2',
                gcp: 'us-west1'
            },
            'eu-west-1': { // AWS EU (Ireland)
                oci: 'eu-frankfurt-1',
                azure: 'westeurope',
                gcp: 'europe-west1'
            }
            // Add more region mappings as needed
        };
    }

    mapRegion(awsRegion, targetProvider) {
        const mapping = PricingModel.REGION_MAPPINGS[awsRegion];
        return mapping ? mapping[targetProvider] || 'us-east-1' : 'us-east-1';
    }

    // Validation Methods
    validatePricingData(pricingData) {
        const requiredFields = ['provider_id', 'service_mapping_id', 'region', 'price_per_hour'];
        const errors = [];

        for (const field of requiredFields) {
            if (pricingData[field] === undefined || pricingData[field] === null) {
                errors.push(`Missing required field: ${field}`);
            }
        }

        if (pricingData.price_per_hour < 0) {
            errors.push('Price per hour cannot be negative');
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }
}

module.exports = PricingModel;