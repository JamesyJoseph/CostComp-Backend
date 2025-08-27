// routes/bills.js
const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const PDFProcessor = require('../services/pdfProcessor');
const ComparisonService = require('../services/comparisonService');
const fs = require('fs').promises;

router.post('/compare', upload.single('bill'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No PDF file uploaded' });

    const { targetProvider } = req.body;
    if (!targetProvider) return res.status(400).json({ error: 'Target provider is required' });

    const billData = await PDFProcessor.extractTextFromPDF(req.file.path);
    const comparisonResult = await ComparisonService.compareWithProvider(billData, targetProvider);

    await fs.unlink(req.file.path);

    const formatted = {
      success: true,
      comparison: formatComparisonResponse(comparisonResult),
      tables: {
        extractedBill: formatExtractedBillTable(billData),
        comparisonSummary: formatComparisonSummaryTable(comparisonResult),
        serviceComparison: formatServiceComparisonTable(comparisonResult),
        savingsBreakdown: formatSavingsBreakdownTable(comparisonResult)
      }
    };

    res.json(formatted);
  } catch (error) {
    console.error('Comparison error:', error);
    if (req.file) {
      try { await fs.unlink(req.file.path); } catch {}
    }
    res.status(500).json({ error: 'Failed to process comparison', message: error.message });
  }
});

router.post('/compare-multiple', upload.single('bill'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No PDF file uploaded' });

    const { providers } = req.body;
    if (!providers || !Array.isArray(providers)) {
      return res.status(400).json({ error: 'Providers array is required' });
    }

    const billData = await PDFProcessor.extractTextFromPDF(req.file.path);
    const comparisons = {};
    for (const p of providers) {
      comparisons[p] = await ComparisonService.compareWithProvider(billData, p);
    }

    await fs.unlink(req.file.path);

    res.json({
      success: true,
      comparisons,
      extractedBill: formatExtractedBillTable(billData)
    });
  } catch (error) {
    console.error('Multiple comparison error:', error);
    res.status(500).json({ error: 'Failed to process multiple comparisons', message: error.message });
  }
});

function formatComparisonResponse(r) {
  return {
    originalProvider: r.originalProvider,
    targetProvider: r.targetProvider,
    totalOriginalCost: r.totalOriginalCost,
    totalEstimatedCost: r.totalEstimatedCost,
    potentialSavings: r.potentialSavings,
    savingsPercentage: r.savingsPercentage,
    isCheaper: r.isCheaper,
    currency: r.currency,
    comparisonDate: r.comparisonDate,
    metadata: r.metadata
  };
}

function formatExtractedBillTable(billData) {
  return {
    title: `Extracted ${billData.provider.toUpperCase()} Bill Details`,
    columns: [
      { key: 'serviceName', title: 'Service Name' },
      { key: 'cost', title: 'Cost (USD)', type: 'currency' },
      { key: 'usageHours', title: 'Usage Hours', type: 'number' },
      { key: 'usageGB', title: 'Usage GB', type: 'number' },
      { key: 'usageRequests', title: 'Requests', type: 'number' },
      { key: 'region', title: 'Region' },
      { key: 'instanceType', title: 'Instance Type' }
    ],
    rows: billData.services.map(s => ({
      serviceName: s.name,
      cost: s.cost,
      usageHours: s.usage?.hours || 0,
      usageGB: s.usage?.gb || 0,
      usageRequests: s.usage?.requests || 0,
      region: s.region || 'N/A',
      instanceType: s.instanceType || 'N/A'
    })),
    summary: {
      totalCost: billData.totalAmount,
      totalServices: billData.services.length,
      billingPeriod: billData.metadata?.billingPeriod
    }
  };
}

function formatComparisonSummaryTable(r) {
  return {
    title: 'Cost Comparison Summary',
    columns: [
      { key: 'metric', title: 'Metric' },
      { key: 'source', title: r.originalProvider.toUpperCase(), type: 'currency' },
      { key: 'target', title: r.targetProvider.toUpperCase(), type: 'currency' },
      { key: 'difference', title: 'Difference', type: 'currency' }
    ],
    rows: [
      { metric: 'Total Monthly Cost', source: r.totalOriginalCost, target: r.totalEstimatedCost, difference: r.potentialSavings },
      { metric: 'Savings Percentage', source: '-', target: '-', difference: `${r.savingsPercentage}%` }
    ]
  };
}

function formatServiceComparisonTable(r) {
  return {
    title: 'Service-by-Service Comparison',
    columns: [
      { key: 'srcService', title: `${r.originalProvider.toUpperCase()} Service` },
      { key: 'targetService', title: `${r.targetProvider.toUpperCase()} Service` },
      { key: 'srcCost', title: `${r.originalProvider.toUpperCase()} Cost`, type: 'currency' },
      { key: 'targetCost', title: 'Target Cost', type: 'currency' },
      { key: 'savings', title: 'Savings', type: 'currency' },
      { key: 'status', title: 'Status' }
    ],
    rows: r.serviceComparisons.map(s => ({
      srcService: s.serviceName,
      targetService: s.mappedService || 'Not Available',
      srcCost: s.originalCost,
      targetCost: s.estimatedCost,
      savings: (s.originalCost || 0) - (s.estimatedCost || 0),
      status: s.mappingStatus,
      hasSavings: (s.estimatedCost || 0) < (s.originalCost || 0)
    }))
  };
}

function formatSavingsBreakdownTable(r) {
  const rows = r.serviceComparisons
    .filter(s => s.mappingStatus === 'success' && (s.estimatedCost || 0) < (s.originalCost || 0))
    .sort((a, b) => ((b.originalCost - b.estimatedCost) - (a.originalCost - a.estimatedCost)))
    .map(s => {
      const monthly = (s.originalCost || 0) - (s.estimatedCost || 0);
      return {
        service: s.serviceName,
        awsCost: s.originalCost,
        targetCost: s.estimatedCost,
        monthlySavings: monthly,
        annualSavings: monthly * 12,
        savingsPercentage: `${(s.percentageSavings || 0).toFixed(1)}%`
      };
    });

  return {
    title: 'Top Savings Opportunities',
    columns: [
      { key: 'service', title: 'Service' },
      { key: 'awsCost', title: 'Source Cost', type: 'currency' },
      { key: 'targetCost', title: 'Target Cost', type: 'currency' },
      { key: 'monthlySavings', title: 'Monthly Savings', type: 'currency' },
      { key: 'annualSavings', title: 'Annual Savings', type: 'currency' },
      { key: 'savingsPercentage', title: 'Savings %' }
    ],
    rows
  };
}

module.exports = router;
