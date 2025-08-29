const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const PDFProcessor = require('../services/pdfProcessor');
const ComparisonService = require('../services/comparisonService');
const fs = require('fs').promises;

/**
 * POST /api/bills/compare
 * multipart/form-data with field 'bill' (pdf file) and form field 'targetProvider' (e.g., 'oci')
 */
router.post('/compare', upload.single('bill'), async (req, res) => {
  let tmpPath = null;
  try {
    if (!req.file) return res.status(400).json({ error: 'No PDF file uploaded (field: bill)' });

    tmpPath = req.file.path;
    const { targetProvider } = req.body;
    if (!targetProvider) return res.status(400).json({ error: 'Target provider is required (form field: targetProvider)' });

    // 1) Extract structured bill from PDF
    const billData = await PDFProcessor.extractTextFromPDF(tmpPath);

    // 2) Compare with target provider
    const comparisonResult = await ComparisonService.compareWithProvider(billData, targetProvider);

    // 3) Only target services (no AWS duplication here)
    const targetServices = (comparisonResult.serviceComparisons || []).map(s => ({
      targetService: s.mappedService || null,
      targetCost: s.estimatedCost,
      mappingStatus: s.mappingStatus,
      pricingDetails: s.pricingDetails || null,
      usageDetails: s.usageDetails || null,
      conversionFactor: s.conversionFactor || 1,
      message: s.message || null
    }));

    // 4) Summary (AWS vs target) → still useful
    const comparisonSummary = (comparisonResult.serviceComparisons || []).map(s => ({
      sourceService: s.serviceName,
      targetService: s.mappedService || null,
      sourceCost: s.originalCost,
      targetCost: s.estimatedCost,
      savings: round2((s.originalCost || 0) - (s.estimatedCost || 0)),
      percentageSavings: s.percentageSavings || null,
      status: s.mappingStatus
    }));

    const response = {
      success: true,
      source_provider: billData.provider || 'aws',
      source_extraction: billData, // ✅ only AWS data
      target_provider_mapping: {
        targetProvider: comparisonResult.targetProvider,
        services: targetServices // ✅ only target info
      },
      comparison_summary: comparisonSummary,
      totals: {
        sourceTotal: comparisonResult.totalOriginalCost,
        targetTotal: comparisonResult.totalEstimatedCost,
        savings: comparisonResult.potentialSavings,
        savingsPercentage: comparisonResult.savingsPercentage,
        isCheaper: comparisonResult.isCheaper
      },
      metadata: comparisonResult.metadata || billData.metadata || {},
      comparisonDate: comparisonResult.comparisonDate,
      currency: comparisonResult.currency || 'USD'
    };

    // delete temp file
    try { await fs.unlink(tmpPath); } catch (e) { /* ignore */ }

    res.json(response);
  } catch (error) {
    console.error('Comparison error:', error);
    if (tmpPath) {
      try { await fs.unlink(tmpPath); } catch (e) { /* ignore */ }
    }
    res.status(500).json({ error: 'Failed to process comparison', message: error.message });
  }
});


/**
 * POST /api/bills/compare-multiple
 * multipart/form-data with field 'bill' and form field 'providers' as JSON string or multiple repeated 'providers' fields
 * Example providers body: providers=["oci","azure"]
 */
router.post('/compare-multiple', upload.single('bill'), async (req, res) => {
  let tmpPath = null;
  try {
    if (!req.file) return res.status(400).json({ error: 'No PDF file uploaded (field: bill)' });

    tmpPath = req.file.path;

    let providers = [];
    if (req.body.providers) {
      try {
        providers = typeof req.body.providers === 'string'
          ? JSON.parse(req.body.providers)
          : req.body.providers;
      } catch {
        providers = (req.body.providers || '').split(',').map(p => p.trim()).filter(Boolean);
      }
    } else if (req.body.provider) {
      providers = [req.body.provider];
    }

    if (!Array.isArray(providers) || providers.length === 0) {
      return res.status(400).json({ error: 'Providers array is required (form field: providers)' });
    }

    // Extract bill once
    const billData = await PDFProcessor.extractTextFromPDF(tmpPath);

    // Run comparisons for each provider
    const comparisons = {};
    for (const p of providers) {
      const cmp = await ComparisonService.compareWithProvider(billData, p);

      // ✅ only target services
      const targetServices = (cmp.serviceComparisons || []).map(s => ({
        targetService: s.mappedService || null,
        targetCost: s.estimatedCost,
        mappingStatus: s.mappingStatus,
        usageDetails: s.usageDetails || null
      }));

      comparisons[p] = {
        targetProvider: p,
        services: targetServices,
        totals: {
          sourceTotal: cmp.totalOriginalCost,
          targetTotal: cmp.totalEstimatedCost,
          savings: cmp.potentialSavings,
          savingsPercentage: cmp.savingsPercentage,
          isCheaper: cmp.isCheaper
        }
      };
    }

    try { await fs.unlink(tmpPath); } catch (e) { /* ignore */ }

    res.json({
      success: true,
      source_provider: billData.provider || 'aws',
      source_extraction: billData, // ✅ AWS data only
      comparisons
    });
  } catch (error) {
    console.error('Multiple comparison error:', error);
    if (tmpPath) {
      try { await fs.unlink(tmpPath); } catch (e) { /* ignore */ }
    }
    res.status(500).json({ error: 'Failed to process multiple comparisons', message: error.message });
  }
});


function round2(n) { return Math.round((Number(n) || 0) * 100) / 100; }

module.exports = router;
