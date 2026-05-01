class RankingUtils {
  
  rankPublications(publications, query, disease, boostFactors = {}) {
    const scored = publications.map(pub => {
      let score = 0;
      
      // Relevance to query (0-50 points)
      const titleLower = pub.title?.toLowerCase() || '';
      const abstractLower = pub.abstract?.toLowerCase() || '';
      const queryTerms = query?.toLowerCase().split(' ') || [];
      
      for (const term of queryTerms) {
        if (titleLower.includes(term)) score += 10;
        if (abstractLower.includes(term)) score += 3;
      }
      
      // Disease relevance (0-30 points)
      if (disease && titleLower.includes(disease.toLowerCase())) score += 15;
      if (disease && abstractLower.includes(disease.toLowerCase())) score += 5;
      
      // Recency (2024: 15, 2023: 10, 2022: 5, older: 0)
      const year = parseInt(pub.year);
      if (year >= 2024) score += 15;
      else if (year >= 2023) score += 10;
      else if (year >= 2022) score += 5;
      else if (year >= 2020) score += 2;
      
      // Citation count (0-10 points)
      const citationScore = Math.min(pub.citedByCount || 0, 100) / 10;
      score += citationScore;
      
      // Source credibility
      if (pub.source === 'PubMed') score += 5;
      if (pub.source === 'OpenAlex' && pub.relevanceScore > 0.5) score += 3;
      
      // Apply boost factors
      if (boostFactors.recency && year >= 2023) score *= 1.2;
      
      return { ...pub, rankScore: score };
    });
    
    // Sort by rank score descending
    const ranked = scored.sort((a, b) => b.rankScore - a.rankScore);
    
    return {
      rankedPublications: ranked.slice(0, 8),
      totalRetrieved: publications.length,
      rankingMetadata: {
        highestScore: ranked[0]?.rankScore || 0,
        averageScore: ranked.reduce((sum, p) => sum + (p.rankScore || 0), 0) / (ranked.length || 1)
      }
    };
  }
  
  rankClinicalTrials(trials, disease, location) {
    const scored = (trials || []).map(trial => {
      let score = 0;
      
      // Disease relevance (0-40 points)
      const titleLower = trial.title?.toLowerCase() || '';
      if (disease && titleLower.includes(disease.toLowerCase())) score += 30;
      
      // Active recruiting (bonus)
      if (trial.status === 'RECRUITING') score += 20;
      
      // Location proximity (0-20 points)
      if (location && trial.locations) {
        for (const loc of trial.locations) {
          if (loc.city && loc.city.toLowerCase().includes(location.toLowerCase())) {
            score += 20;
            break;
          }
          if (loc.country && loc.country.toLowerCase().includes(location.toLowerCase())) {
            score += 10;
            break;
          }
        }
      } else {
        score += 10;
      }
      
      // Phase (later phases = more established)
      if (trial.phase === 'Phase 3') score += 15;
      else if (trial.phase === 'Phase 2') score += 10;
      else if (trial.phase === 'Phase 1') score += 5;
      else if (trial.phase === 'Phase 4') score += 12;
      
      return { ...trial, rankScore: score };
    });
    
    return scored.sort((a, b) => b.rankScore - a.rankScore).slice(0, 6);
  }
  
  mergeResults(publications, trials, query) {
    return {
      retrievedCount: {
        publications: publications?.length || 0,
        clinicalTrials: trials?.length || 0
      },
      topPublications: (publications || []).slice(0, 6),
      topClinicalTrials: (trials || []).slice(0, 4),
      summary: `Found ${publications?.length || 0} research papers and ${trials?.length || 0} clinical trials. Top results ranked by relevance, recency, and authority.`
    };
  }
}

module.exports = new RankingUtils();