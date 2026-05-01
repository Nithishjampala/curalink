const openalexService = require('../services/openalexService');
const pubmedService = require('../services/pubmedService');
const clinicalTrialsService = require('../services/clinicalTrialsService');
const queryExpansionService = require('../services/queryExpansionService');
const rankingUtils = require('../utils/rankingUtils');

class ResearchController {
  
  async fetchResearch(req, res) {
    try {
      const { disease, intent, location, maxResults = 50 } = req.body;
      
      if (!disease) {
        return res.status(400).json({ error: 'Disease is required' });
      }
      
      // Expand query
      const expandedQuery = queryExpansionService.expandQuery(intent || 'treatment', { disease });
      const pubmedQuery = queryExpansionService.generatePubMedQuery(disease, intent);
      
      console.log(`🔄 Searching for: ${expandedQuery}`);
      
      // Fetch from all sources in parallel
      const [openAlexResults, pubmedResults, clinicalTrials] = await Promise.all([
        openalexService.searchPublications(expandedQuery, disease, maxResults),
        pubmedService.searchPublications(pubmedQuery, disease, maxResults),
        clinicalTrialsService.searchTrials(disease, intent, location)
      ]);
      
      // Combine publications from both sources
      let allPublications = [...openAlexResults, ...pubmedResults];
      
      // Remove duplicates by title (simple deduplication)
      const uniquePublications = [];
      const titles = new Set();
      
      for (const pub of allPublications) {
        const normalizedTitle = pub.title.toLowerCase().trim();
        if (!titles.has(normalizedTitle)) {
          titles.add(normalizedTitle);
          uniquePublications.push(pub);
        }
      }
      
      // Rank results
      const ranked = rankingUtils.rankPublications(uniquePublications, intent || 'treatment', disease);
      const rankedTrials = rankingUtils.rankClinicalTrials(clinicalTrials, disease, location);
      
      // Final merged results
      const results = rankingUtils.mergeResults(ranked.rankedPublications, rankedTrials, intent);
      
      res.json({
        success: true,
        query: {
          original: intent,
          expanded: expandedQuery,
          disease,
          location
        },
        results: {
          publications: results.topPublications,
          clinicalTrials: results.topClinicalTrials,
          metadata: {
            totalRetrieved: uniquePublications.length,
            totalTrialsFound: clinicalTrials.length,
            rankingMetadata: ranked.rankingMetadata
          }
        }
      });
      
    } catch (error) {
      console.error('Research fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch research data' });
    }
  }
  
  async getPublicationDetails(req, res) {
    try {
      const { id, source } = req.query;
      
      if (!id || !source) {
        return res.status(400).json({ error: 'ID and source required' });
      }
      
      // Fetch detailed publication data
      // For brevity, returning mock but can be extended
      res.json({
        success: true,
        publication: {
          id,
          source,
          details: 'Full details available from original source'
        }
      });
      
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch publication details' });
    }
  }
}

module.exports = new ResearchController();