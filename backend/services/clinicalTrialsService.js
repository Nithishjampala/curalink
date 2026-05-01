const axios = require('axios');

class ClinicalTrialsService {
  
  async searchTrials(disease, intent, location = null) {
    try {
      let url = `https://clinicaltrials.gov/api/v2/studies?query.cond=${encodeURIComponent(disease)}&filter.overallStatus=RECRUITING&pageSize=30&format=json`;
      
      if (intent && intent !== 'general') {
        url = `https://clinicaltrials.gov/api/v2/studies?query.cond=${encodeURIComponent(disease)}&query.titles=${encodeURIComponent(intent)}&filter.overallStatus=RECRUITING&pageSize=30&format=json`;
      }
      
      const response = await axios.get(url);
      
      if (response.data && response.data.studies) {
        return this.formatResults(response.data.studies, location);
      }
      
      return [];
    } catch (error) {
      console.error('ClinicalTrials.gov API Error:', error.message);
      return [];
    }
  }
  
  formatResults(studies, preferredLocation) {
    const trials = [];
    
    for (const study of studies.slice(0, 15)) {
      const protocol = study.protocolSection;
      if (!protocol) continue;
      
      const locations = this.extractLocations(protocol);
      let relevance = this.calculateRelevance(locations, preferredLocation);
      
      trials.push({
        id: study.protocolSection?.identificationModule?.nctId || 'N/A',
        title: protocol.identificationModule?.briefTitle || 'No Title',
        status: protocol.statusModule?.overallStatus || 'Unknown',
        eligibility: protocol.eligibilityModule?.eligibilityCriteria || 'Not specified',
        locations: locations,
        contactName: protocol.contactsLocationsModule?.centralContactName || 'Not provided',
        contactPhone: protocol.contactsLocationsModule?.centralContactPhone || 'Not provided',
        contactEmail: protocol.contactsLocationsModule?.centralContactEmail || 'Not provided',
        phase: protocol.designModule?.phase || 'Not specified',
        relevanceScore: relevance
      });
    }
    
    // Sort by relevance
    trials.sort((a, b) => b.relevanceScore - a.relevanceScore);
    
    return trials.slice(0, 6);
  }
  
  extractLocations(protocol) {
    const locations = [];
    const locationModule = protocol.contactsLocationsModule;
    
    if (locationModule && locationModule.locations) {
      const locationArray = Array.isArray(locationModule.locations) ? locationModule.locations : [locationModule.locations];
      
      for (const loc of locationArray) {
        if (loc.facility) {
          locations.push({
            facility: loc.facility,
            city: loc.city || 'N/A',
            state: loc.state || 'N/A',
            country: loc.country || 'N/A'
          });
        }
      }
    }
    
    return locations.slice(0, 5);
  }
  
  calculateRelevance(locations, preferredLocation) {
    if (!preferredLocation) return 1;
    
    for (const loc of locations) {
      if (loc.city && loc.city.toLowerCase().includes(preferredLocation.toLowerCase())) {
        return 1;
      }
      if (loc.country && loc.country.toLowerCase().includes(preferredLocation.toLowerCase())) {
        return 0.8;
      }
    }
    
    return 0.5;
  }
}

module.exports = new ClinicalTrialsService();