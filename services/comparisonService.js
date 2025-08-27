// services/comparisonService.js
const DatabaseService = require('./databaseService');
const { mapRegion } = require('./serviceDictionary');

class ComparisonService {
  async compareWithProvider(billData, targetProvider) {
    try {
      const sourceProvider = billData.provider || 'aws';
      console.log(`Starting comparison: ${sourceProvider} → ${targetProvider}`);
      console.log(`${sourceProvider.toUpperCase()} services count: ${billData.services.length}`);

      const comparisons = [];
      let totalSourceCost = 0;
      let totalTargetCost = 0;

      const targetProvRow = await DatabaseService.getProviderByCode(targetProvider);
      if (!targetProvRow) throw new Error(`Provider not found: ${targetProvider}`);

      for (const svc of billData.services) {
        const cmp = await this.compareService(
          svc,
          sourceProvider,
          targetProvider,
          targetProvRow.id
        );
        comparisons.push(cmp);
        totalSourceCost += svc.cost || 0;
        totalTargetCost += cmp.estimatedCost || 0;
      }

      const savings = totalSourceCost - totalTargetCost;
      const savingsPct = totalSourceCost > 0 ? (savings / totalSourceCost) * 100 : 0;

      return {
        originalProvider: sourceProvider,
        targetProvider: targetProvider,
        totalOriginalCost: round2(totalSourceCost),
        totalEstimatedCost: round2(totalTargetCost),
        potentialSavings: round2(savings),
        savingsPercentage: round2(savingsPct),
        isCheaper: totalTargetCost < totalSourceCost,
        serviceComparisons: comparisons,
        metadata: billData.metadata,
        comparisonDate: new Date().toISOString(),
        currency: 'USD'
      };
    } catch (error) {
      console.error('Comparison failed:', error);
      throw new Error(`Comparison failed: ${error.message}`);
    }
  }

  async compareService(sourceService, sourceProvider, targetProvider, targetProviderId) {
  try {
    // 1️⃣ Try to find service mapping
    const mapping = await DatabaseService.findServiceMapping(
      targetProvider,
      sourceService.canonical || sourceService.name,
      sourceProvider
    );

    // 2️⃣ If no mapping, use fallback cost (optional)
    if (!mapping) {
      const fallbackCost = sourceService.cost || 0; // could also be some default rate
      return {
        serviceName: sourceService.name,
        mappedService: null,
        serviceType: 'Unknown',
        originalCost: round2(sourceService.cost),
        estimatedCost: round2(fallbackCost),
        absoluteSavings: round2(sourceService.cost - fallbackCost),
        percentageSavings: 100,
        isCheaper: false,
        mappingStatus: 'not_mapped_fallback',
        message: `No equivalent service found for ${sourceService.name} in ${targetProvider}. Using fallback cost.`,
        usageDetails: sourceService.usage
      };
    }

    // 3️⃣ Map region
    const targetRegion = mapRegion(sourceProvider, sourceService.region, targetProvider);

    // 4️⃣ Get pricing from DB
    const pricing = await DatabaseService.getCurrentPricing(
      targetProviderId,
      mapping.id,
      targetRegion
    );

    // 5️⃣ Calculate estimated cost
    let estimatedCost = 0;
    if (pricing) {
      estimatedCost = this.calculateEstimatedCost(sourceService.usage, pricing, mapping.conversion_factor);
    } else {
      // Use fallback pricing if DB pricing missing
      const fallbackPricing = {
        price_per_hour: 0.1,    // example default
        price_per_gb: 0.01,
        price_per_request: 0.001,
        currency: 'USD'
      };
      estimatedCost = this.calculateEstimatedCost(sourceService.usage, fallbackPricing, mapping.conversion_factor);
    }

    // 6️⃣ Calculate savings
    const savings = (sourceService.cost || 0) - estimatedCost;
    const pct = (sourceService.cost || 0) > 0 ? (savings / sourceService.cost) * 100 : 0;

    // 7️⃣ Return final comparison object
    return {
      serviceName: sourceService.name,
      mappedService: mapping.provider_service_name,
      serviceType: mapping.service_type,
      originalCost: round2(sourceService.cost),
      estimatedCost: round2(estimatedCost),
      absoluteSavings: round2(savings),
      percentageSavings: round2(pct),
      isCheaper: estimatedCost < (sourceService.cost || 0),
      mappingStatus: pricing ? 'success' : 'mapped_no_pricing_fallback',
      pricingDetails: pricing
        ? {
            pricePerHour: nullableFloat(pricing.price_per_hour),
            pricePerGB: nullableFloat(pricing.price_per_gb),
            pricePerRequest: nullableFloat(pricing.price_per_request),
            region: pricing.region,
            instanceType: pricing.instance_type,
            currency: pricing.currency || 'USD'
          }
        : null,
      usageDetails: sourceService.usage,
      conversionFactor: mapping.conversion_factor || 1,
      message: pricing
        ? 'Pricing found and applied'
        : `No pricing data for ${mapping.provider_service_name} in ${targetRegion}. Applied fallback rates.`
    };
  } catch (error) {
    console.error('Service comparison error:', error);
    return {
      serviceName: sourceService.name,
      originalCost: round2(sourceService.cost),
      estimatedCost: 0,
      mappingStatus: 'error',
      message: `Error comparing service: ${error.message}`,
      usageDetails: sourceService.usage
    };
  }
}

  calculateEstimatedCost(usage, pricing, conversionFactor = 1.0) {
    const cf = parseFloat(conversionFactor || 1);
    let cost = 0;

    const pph = nullableFloat(pricing.price_per_hour);
    const ppgb = nullableFloat(pricing.price_per_gb);
    const ppreq = nullableFloat(pricing.price_per_request);

    if (usage?.hours && pph) cost += usage.hours * pph;
    if (usage?.vcpuHours && pph) cost += usage.vcpuHours * pph; // optional, if you price vCPU-hours
    if (usage?.gb && ppgb) cost += usage.gb * ppgb;
    if (usage?.requests && ppreq) cost += usage.requests * ppreq;

    if (usage?.instances && usage.instances > 1 && (pph || ppgb || ppreq)) {
      // if instances denote same pattern repeated
      cost *= usage.instances;
    }
    return cost * cf;
  }
}

function round2(n) { return Math.round((Number(n) || 0) * 100) / 100; }
function nullableFloat(x) {
  const n = parseFloat(x);
  return Number.isFinite(n) ? n : null;
}

module.exports = new ComparisonService();
