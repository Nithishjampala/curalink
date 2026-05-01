const axios = require('axios');
const xml2js = require('xml2js');

class PubMedService {
  
  async searchPublications(query, disease, maxResults = 50) {
    try {
      // Step 1: Search for IDs
      const searchQuery = `${query} ${disease}`;
      const searchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(searchQuery)}&retmax=${maxResults}&sort=pub+date&retmode=json`;
      
      const searchResponse = await axios.get(searchUrl);
      const ids = searchResponse.data.esearchresult?.idlist || [];
      
      if (ids.length === 0) return [];
      
      // Step 2: Fetch details
      const fetchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=${ids.join(',')}&retmode=xml`;
      const fetchResponse = await axios.get(fetchUrl);
      
      // Step 3: Parse XML
      const parser = new xml2js.Parser({ explicitArray: false });
      const result = await parser.parseStringPromise(fetchResponse.data);
      
      return this.formatResults(result, ids);
      
    } catch (error) {
      console.error('PubMed API Error:', error.message);
      return [];
    }
  }
  
  formatResults(xmlData, ids) {
    const articles = [];
    const pubmedArticles = xmlData.PubmedArticleSet?.PubmedArticle || [];
    const articlesArray = Array.isArray(pubmedArticles) ? pubmedArticles : [pubmedArticles];
    
    for (const article of articlesArray) {
      const medlineCitation = article.MedlineCitation;
      if (!medlineCitation) continue;
      
      const articleData = medlineCitation.Article;
      const abstract = articleData?.Abstract?.AbstractText || 'Abstract not available';
      const abstractText = Array.isArray(abstract) ? abstract.join(' ') : abstract;
      
      articles.push({
        id: medlineCitation.PMID?._ || 'N/A',
        title: articleData?.ArticleTitle || 'No Title',
        abstract: typeof abstractText === 'string' ? abstractText.substring(0, 500) : 'Abstract not available',
        authors: this.extractAuthors(articleData?.AuthorList),
        year: articleData?.Journal?.JournalIssue?.PubDate?.Year || 'N/A',
        source: 'PubMed',
        url: `https://pubmed.ncbi.nlm.nih.gov/${medlineCitation.PMID?._ || ''}/`,
        journal: articleData?.Journal?.Title || 'Unknown Journal'
      });
    }
    
    return articles.slice(0, 20);
  }
  
  extractAuthors(authorList) {
    if (!authorList) return [];
    
    const authors = [];
    const authorArray = Array.isArray(authorList.Author) ? authorList.Author : [authorList.Author];
    
    for (const author of authorArray) {
      if (author) {
        const lastName = author.LastName || '';
        const firstName = author.ForeName || '';
        authors.push(`${firstName} ${lastName}`.trim());
      }
    }
    
    return authors.slice(0, 5);
  }
}

module.exports = new PubMedService();