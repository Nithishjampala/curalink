const axios = require('axios');

class OpenAlexService {
  
  async searchPublications(query, disease, pageSize = 50) {
    try {
      const searchQuery = `${query} ${disease}`;
      const url = `https://api.openalex.org/works?search=${encodeURIComponent(searchQuery)}&per-page=${pageSize}&page=1&sort=relevance_score:desc`;
      
      const response = await axios.get(url);
      
      if (response.data && response.data.results) {
        return this.formatResults(response.data.results);
      }
      
      return [];
    } catch (error) {
      console.error('OpenAlex API Error:', error.message);
      return [];
    }
  }
  
  formatResults(results) {
    return results.map(paper => ({
      id: paper.id,
      title: paper.title || 'No Title',
      abstract: paper.abstract_inverted_index ? this.extractAbstract(paper.abstract_inverted_index) : 'Abstract not available',
      authors: paper.authorships ? paper.authorships.map(a => a.author.display_name).slice(0, 5) : [],
      year: paper.publication_year || 'N/A',
      source: 'OpenAlex',
      url: paper.doi ? `https://doi.org/${paper.doi}` : paper.id,
      citedByCount: paper.cited_by_count || 0,
      relevanceScore: paper.relevance_score || 0
    }));
  }
  
  extractAbstract(abstractIndex) {
    if (!abstractIndex) return 'Abstract not available';
    
    const words = [];
    const indices = Object.keys(abstractIndex).sort((a, b) => parseInt(a) - parseInt(b));
    
    for (const index of indices) {
      const wordArray = abstractIndex[index];
      if (wordArray) {
        words.push(...wordArray);
      }
    }
    
    return words.join(' ').substring(0, 500) + '...';
  }
}

module.exports = new OpenAlexService();