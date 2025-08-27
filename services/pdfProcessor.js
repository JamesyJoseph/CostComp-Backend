// services/pdfProcessor.js
const pdf = require('pdf-parse');
const fs = require('fs').promises;
const { canonicalFrom, defaultRegion } = require('./serviceDictionary');

class PDFProcessor {
  async extractTextFromPDF(filePath) {
    try {
      const dataBuffer = await fs.readFile(filePath);
      const data = await pdf(dataBuffer);
      const provider = this.detectProvider(data.text);

      switch (provider) {
        case 'aws':   return this.parseAWS(data.text);
        case 'azure': return this.parseAzure(data.text);
        case 'gcp':   return this.parseGCP(data.text);
        case 'oci':   return this.parseOCI(data.text);
        default:
          // fallback: try generic
          return this.parseGeneric(data.text);
      }
    } catch (error) {
      throw new Error(`PDF processing failed: ${error.message}`);
    }
  }

  detectProvider(text) {
    if (/Amazon Web Services|AWS\s+Billing|aws.amazon.com/i.test(text)) return 'aws';
    if (/Microsoft Azure|azure\.com|Enrollment Number|Resource GUID/i.test(text)) return 'azure';
    if (/Google Cloud|GCP|cloud\.google\.com|BigQuery/i.test(text)) return 'gcp';
    if (/Oracle Cloud|OCI|cloud\.oracle\.com|Autonomous Database/i.test(text)) return 'oci';
    return null;
  }

  // -------- AWS --------
  parseAWS(text) {
    const svcPatterns = {
      'Amazon EC2': /Amazon EC2|Elastic Compute Cloud|EC2\b/i,
      'Amazon S3': /\bAmazon S3\b|Simple Storage Service|S3\b/i,
      'Amazon RDS': /\bAmazon RDS\b|Relational Database Service/i,
      'AWS Lambda': /\bAWS Lambda\b|Lambda\b/i,
      'Amazon CloudFront': /\bCloudFront\b/i,
      'AWS Data Transfer': /Data Transfer|Bandwidth/i,
      'Amazon EBS': /\bEBS\b|Elastic Block Store/i,
      'Amazon VPC': /\bVPC\b|Virtual Private Cloud/i,
      'Amazon CloudWatch': /\bCloudWatch\b/i
    };
    return this.genericParse(text, 'aws', svcPatterns, {
      totalHints: [/Total for this invoice/i, /Total amount due/i, /Grand total/i]
    });
  }

  // -------- Azure --------
  parseAzure(text) {
    const svcPatterns = {
      'Virtual Machines': /Virtual Machines|Microsoft\.Compute\/virtualMachines/i,
      'Blob Storage': /Blob Storage|Microsoft\.Storage\/blob/i,
      'Azure SQL Database': /SQL Database|Microsoft\.Sql/i,
      'Azure Functions': /Azure Functions/i,
      'Azure CDN': /\bAzure CDN\b|Content Delivery Network/i,
      'Data Transfer': /\bData Transfer\b|\bEgress\b/i
    };
    return this.genericParse(text, 'azure', svcPatterns, {
      totalHints: [/Total current charges/i, /Amount due/i, /Grand total/i]
    });
  }

  // -------- GCP --------
  parseGCP(text) {
    const svcPatterns = {
      'Compute Engine': /Compute Engine|GCE VM/i,
      'Cloud Storage': /\bCloud Storage\b/i,
      'Cloud SQL': /\bCloud SQL\b/i,
      'Cloud Functions': /\bCloud Functions\b/i,
      'Cloud CDN': /\bCloud CDN\b/i,
      'Network Egress': /Egress|Data Transfer/i
    };
    return this.genericParse(text, 'gcp', svcPatterns, {
      totalHints: [/Total for this invoice/i, /Amount due/i, /Grand total/i]
    });
  }

  // -------- OCI --------
  parseOCI(text) {
    const svcPatterns = {
      'Compute Instance': /Compute Instance|VM\.Standard/i,
      'Object Storage': /\bObject Storage\b/i,
      'Database Service': /\bAutonomous Database\b|\bDatabase Service\b/i,
      'Functions': /\bFunctions\b/i,
      'Content Delivery': /\bContent Delivery\b|CDN/i,
      'Data Transfer': /\bData Transfer\b|\bEgress\b/i
    };
    return this.genericParse(text, 'oci', svcPatterns, {
      totalHints: [/Total charges/i, /Amount due/i, /Grand total/i]
    });
  }

  // -------- Fallback --------
  parseGeneric(text) {
    const svcPatterns = {
      'Compute': /EC2|Virtual Machines|Compute Engine|Compute Instance/i,
      'Object Storage': /S3|Blob Storage|Cloud Storage|Object Storage/i,
      'Database': /RDS|SQL Database|Cloud SQL|Autonomous Database/i,
      'Functions': /Lambda|Azure Functions|Cloud Functions|Functions/i,
      'CDN': /CloudFront|Azure CDN|Cloud CDN|Content Delivery/i,
      'Data Transfer': /Data Transfer|Bandwidth|Egress/i
    };
    return this.genericParse(text, 'unknown', svcPatterns, {
      totalHints: [/Grand total/i, /Total.*(invoice|charges)/i]
    });
  }

  // -------- Core parser (scoped costs + 3-line lookahead) --------
  genericParse(text, provider, servicePatterns, opts = {}) {
    const lines = text.split('\n').map(s => s.trim()).filter(Boolean);
    const services = [];
    let current = null;
    let lookahead = 0;
    let totalAmount = 0;

    const currencyRe = /(?:USD|INR|EUR|GBP|\$|₹|€|£)\s*([0-9]+(?:[.,][0-9]{2})?)/i;
    const totalHints = opts.totalHints || [/Grand total/i, /Total amount/i, /Amount due/i];

    const setCostFromLine = (line) => {
      const m = line.match(currencyRe);
      if (m) {
        const num = parseFloat(m[1].replace(',', ''));
        if (!isNaN(num)) return num;
      }
      return null;
    };

    const pushIfReady = () => {
      if (current && current.cost > 0) {
        services.push(current);
      }
      current = null;
      lookahead = 0;
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // detect totals once
      if (totalAmount === 0 && totalHints.some(rx => rx.test(line))) {
        const t = setCostFromLine(line);
        if (t !== null) totalAmount = t;
      }

      // service detection
      for (const [name, rx] of Object.entries(servicePatterns)) {
        if (rx.test(line)) {
          // finalize previous
          pushIfReady();

          current = {
            name,
            cost: 0,
            usage: { hours: 0, gb: 0, requests: 0, instances: 0, vcpuHours: 0 },
            description: line,
            region: this.extractRegionForProvider(provider, line) || defaultRegion(provider),
            instanceType: this.extractInstanceTypeForProvider(provider, line)
          };
          lookahead = 3; // capture costs close to the header
          break; // don’t match multiple services on same line
        }
      }

      // scoped cost capture
      if (current && current.cost === 0 && lookahead >= 0) {
        const isTotalLike = /(Total|Subtotal|Charge|Amount)/i.test(line);
        const amt = isTotalLike ? setCostFromLine(line) : null;
        if (amt !== null) {
          current.cost = amt;
          lookahead = -1; // stop looking further for this block
        } else if (lookahead > 0) {
          // also allow costs not labeled "Total" but right after header
          const near = setCostFromLine(line);
          if (near !== null && near > 0) {
            current.cost = near;
            lookahead = -1;
          } else {
            lookahead--;
          }
        }
      }

      // usage extraction (provider-agnostic)
      if (current) this.extractUsage(line, current);
    }

    // finalize last
    pushIfReady();

    // if invoice total didn’t parse, compute from services
    if (!totalAmount) {
      totalAmount = services.reduce((s, x) => s + (x.cost || 0), 0);
    }

    // Try to backfill canonical name if the bill is not AWS (helps mapping)
    const normalizedServices = services.map(s => {
      const canonical = provider === 'aws' ? s.name : (canonicalFrom(provider, s.name) || s.name);
      return { ...s, canonical: canonical || s.name };
    });

    return {
      provider: provider === 'unknown' ? 'aws' : provider,
      totalAmount: parseFloat(totalAmount.toFixed(2)),
      services: normalizedServices.filter(s => s.cost > 0),
      metadata: this.extractMetadata(text, provider)
    };
  }

  // ---------- Usage & metadata ----------
  extractUsage(line, svc) {
    if (!svc) return;
    // hours
    const h = line.match(/(\d+\.?\d*)\s*(Hrs|Hours|Hour|instance hours|vm hours|vCPU hours)/i);
    if (h) {
      const val = parseFloat(h[1]);
      if (/vCPU hours/i.test(h[0])) svc.usage.vcpuHours += val;
      else svc.usage.hours += val;
    }
    // storage GB
    const gb = line.match(/(\d+\.?\d*)\s*(GB|GiB|GB-Mo|TB|TiB)/i);
    if (gb) {
      let val = parseFloat(gb[1]);
      if (/TB|TiB/i.test(gb[2])) val *= 1024;
      svc.usage.gb += val;
    }
    // requests
    const req = line.match(/(\d[\d,\.]*)\s*(Requests?|Ops)/i);
    if (req) {
      const num = parseFloat(String(req[1]).replace(/,/g, ''));
      if (!isNaN(num)) svc.usage.requests += num;
    }
    // instances
    const inst = line.match(/(\d+)\s*(instances?|VMs?|nodes?)/i);
    if (inst) svc.usage.instances += parseInt(inst[1], 10);
  }

  extractRegionForProvider(provider, line) {
    switch (provider) {
      case 'aws': {
        const m = line.match(/\b(us|ap|eu|sa|ca)-(east|west|north|south|central)-\d\b/i);
        return m ? m[0].toLowerCase() : null;
      }
      case 'azure': {
        const m = line.match(/\b(eastus|westus2|westeurope|northeurope|centralus|uksouth|japaneast)\b/i);
        return m ? m[0].toLowerCase() : null;
      }
      case 'gcp': {
        const m = line.match(/\b(us|europe|asia)-(central|east|west|north|south)\d\b/i);
        return m ? m[0].toLowerCase() : null;
      }
      case 'oci': {
        const m = line.match(/\b[a-z]{2}-[a-z]+-\d\b/i); // e.g., us-ashburn-1
        return m ? m[0].toLowerCase() : null;
      }
      default: return null;
    }
  }

  extractInstanceTypeForProvider(provider, line) {
    switch (provider) {
      case 'aws': {
        const m = line.match(/\b([tcmriqgpdzn]\d?[a-z]?\.?(nano|micro|small|medium|large|xlarge|\d+xlarge))\b/i);
        return m ? m[0].toLowerCase() : null;
      }
      case 'azure': {
        const m = line.match(/\bStandard_[A-DF-M][0-9]+[a-z]*_v\d\b/i); // e.g., Standard_D2s_v5
        return m ? m[0] : null;
      }
      case 'gcp': {
        const m = line.match(/\b(n1|n2|e2|c2|c3|t2d)-[a-z]+-\d+\b/i); // e.g., n2-standard-8
        return m ? m[0] : null;
      }
      case 'oci': {
        const m = line.match(/\bVM\.[A-Za-z0-9]+(\.[A-Za-z0-9]+)*\b/i); // e.g., VM.Standard3.Flex
        return m ? m[0] : null;
      }
      default: return null;
    }
  }

  extractMetadata(text, provider) {
    const metadata = { provider };
    const acct = text.match(/Account (ID|Number)\s*[:\-]?\s*(\d+)/i);
    if (acct) metadata.accountId = acct[2];
    const inv = text.match(/Invoice (ID|Number)\s*[:\-]?\s*([A-Za-z0-9\-]+)/i);
    if (inv) metadata.invoiceId = inv[2];

    // Billing period (very loose)
    const period = text.match(/([A-Za-z]{3,9})\s+\d{1,2}\s*[-–]\s*([A-Za-z]{3,9})\s+\d{1,2},?\s*(\d{4})/i);
    if (period) {
      metadata.billingPeriod = { start: period[1], end: `${period[2]} ${period[3]}` };
    }
    return metadata;
  }
}

module.exports = new PDFProcessor();
