// services/databaseService.js
const db = require('../config/database');
const { CANONICAL, aliasFor, canonicalFrom, typeFor } = require('./serviceDictionary');

class DatabaseService {
  // ✅ NEW: get provider by code
  async getProviderByCode(code) {
    const [rows] = await db.execute(
      'SELECT * FROM cloud_providers WHERE code = ? LIMIT 1',
      [code]
    );
    return rows[0] || null;
  }

  // ✅ NEW: list providers
  async getAllProviders() {
    const [rows] = await db.execute('SELECT * FROM cloud_providers ORDER BY name');
    return rows;
  }

  // 🔧 UPDATED: accepts source provider too and uses aliases/types
  async findServiceMapping(targetProviderCode, sourceServiceName, sourceProviderCode = 'aws') {
    try {
      // 1) Figure out canonical key for the *source* name
      let canonicalKey = sourceProviderCode === 'aws'
        ? sourceServiceName
        : (canonicalFrom(sourceProviderCode, sourceServiceName) || sourceServiceName);

      // If the name is not one of our canonical entries, try to fuzzy match to a canonical key
      if (!CANONICAL[canonicalKey]) {
        const guess = Object.keys(CANONICAL).find(k =>
          k.toLowerCase() === sourceServiceName.toLowerCase() ||
          CANONICAL[k].synonyms?.some(rx => rx.test(sourceServiceName))
        );
        if (guess) canonicalKey = guess;
      }

      const targetAlias = aliasFor(targetProviderCode, canonicalKey) || sourceServiceName;
      const serviceTypeName = typeFor(canonicalKey);

      // 2) Try exact/like match by provider service name/code (target side)
      const [byName] = await db.execute(`
        SELECT sm.*, st.name AS service_type, cp.name AS provider_name
        FROM service_mappings sm
        JOIN service_types st ON sm.service_type_id = st.id
        JOIN cloud_providers cp ON sm.provider_id = cp.id
        WHERE cp.code = ?
          AND (
            sm.provider_service_name LIKE ? OR
            sm.provider_service_code LIKE ?
          )
        ORDER BY sm.id ASC
        LIMIT 1
      `, [targetProviderCode, `%${targetAlias}%`, `%${targetAlias}%`]);

      if (byName.length) return byName[0];

      // 3) Fallback by service type (Compute/Storage/etc.)
      if (serviceTypeName) {
        const [byType] = await db.execute(`
          SELECT sm.*, st.name AS service_type, cp.name AS provider_name
          FROM service_mappings sm
          JOIN service_types st ON sm.service_type_id = st.id
          JOIN cloud_providers cp ON sm.provider_id = cp.id
          WHERE cp.code = ?
            AND st.name = ?
          ORDER BY sm.id ASC
          LIMIT 1
        `, [targetProviderCode, serviceTypeName]);
        if (byType.length) return byType[0];
      }

      // Nothing found
      return null;
    } catch (error) {
      console.error('Database error in findServiceMapping:', error);
      throw new Error(`Failed to find service mapping: ${error.message}`);
    }
  }

  async getCurrentPricing(providerId, serviceMappingId, region = 'us-east-1') {
    try {
      const [rows] = await db.execute(`
        SELECT 
          p.*,
          sm.provider_service_name,
          cp.name as provider_name
        FROM pricing p
        JOIN service_mappings sm ON p.service_mapping_id = sm.id
        JOIN cloud_providers cp ON p.provider_id = cp.id
        WHERE p.provider_id = ? 
          AND p.service_mapping_id = ?
          AND p.region = ?
          AND p.effective_date <= CURDATE()
        ORDER BY p.effective_date DESC
        LIMIT 1
      `, [providerId, serviceMappingId, region]);
      return rows[0] || null;
    } catch (error) {
      console.error('Database error in getCurrentPricing:', error);
      throw new Error(`Failed to fetch pricing: ${error.message}`);
    }
  }

  // Health/debug helpers
  async testConnection() {
    try {
      await db.execute('SELECT 1 as test');
      return { connected: true, message: 'Database connection successful' };
    } catch (error) {
      return { connected: false, message: error.message };
    }
  }

  async debugDatabase() {
    try {
      const [providers] = await db.execute('SELECT * FROM cloud_providers');
      const [mappings]  = await db.execute('SELECT * FROM service_mappings LIMIT 10');
      const [pricing]   = await db.execute('SELECT * FROM pricing LIMIT 10');
      return { providers, mappings, pricing };
    } catch (error) {
      console.error('Debug database error:', error);
      throw error;
    }
  }
}

module.exports = new DatabaseService();
