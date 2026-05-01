class QueryExpansionService {
  
  expandQuery(query, patientContext) {
    let expanded = query;
    
    // Add disease context if available
    if (patientContext && patientContext.disease) {
      // Check if query already contains disease
      if (!query.toLowerCase().includes(patientContext.disease.toLowerCase())) {
        expanded = `${query} + ${patientContext.disease}`;
      }
    }
    
    return expanded;
  }
  
  buildSearchTerms(disease, intent, location) {
    const terms = [];
    
    if (disease) terms.push(disease);
    if (intent) terms.push(intent);
    if (location) terms.push(location);
    
    // Add synonyms and related terms
    const expansions = this.getExpansions(disease);
    terms.push(...expansions);
    
    return terms;
  }
  
  getExpansions(disease) {
    const expansionsMap = {
      'cancer': ['oncology', 'malignancy', 'tumor', 'neoplasm'],
      'diabetes': ['diabetes mellitus', 'hyperglycemia', 'insulin resistance'],
      'parkinson': ['parkinson disease', 'pd', 'movement disorder'],
      'alzheimer': ['alzheimers disease', 'ad', 'dementia'],
      'heart disease': ['cardiovascular disease', 'cardiac', 'coronary artery']
    };
    
    const lowerDisease = disease.toLowerCase();
    for (const [key, expansions] of Object.entries(expansionsMap)) {
      if (lowerDisease.includes(key)) {
        return expansions;
      }
    }
    
    return [];
  }
  
  generatePubMedQuery(disease, intent) {
    let query = disease;
    if (intent && intent !== 'general') {
      query = `(${disease}) AND (${intent})`;
    }
    query = `${query} AND (clinical trial[pt] OR review[pt])`;
    return encodeURIComponent(query);
  }
}

module.exports = new QueryExpansionService();