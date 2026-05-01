const axios = require('axios');

class LLMService {
  
  constructor() {
    this.apiKey = process.env.HUGGINGFACE_API_KEY;
    this.model = 'microsoft/phi-2'; // Small, fast, good for reasoning
  }
  
  async generateResponse(patientContext, query, publications, clinicalTrials, conversationHistory) {
    const prompt = this.buildPrompt(patientContext, query, publications, clinicalTrials, conversationHistory);
    
    try {
      // Using Hugging Face Inference API
      const response = await axios.post(
        `https://api-inference.huggingface.co/models/${this.model}`,
        {
          inputs: prompt,
          parameters: {
            max_new_tokens: 1000,
            temperature: 0.7,
            do_sample: true,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      const generatedText = response.data[0]?.generated_text || '';
      const structuredOutput = this.parseAndStructureOutput(generatedText, publications, clinicalTrials);
      
      return structuredOutput;
      
    } catch (error) {
      console.error('LLM API Error:', error.message);
      // Fallback response if LLM fails
      return this.generateFallbackResponse(patientContext, query, publications, clinicalTrials);
    }
  }
  
  buildPrompt(patientContext, query, publications, clinicalTrials, history) {
    let prompt = `You are Curalink, an AI Medical Research Assistant. You provide structured, evidence-based answers.

PATIENT CONTEXT:
- Disease: ${patientContext?.disease || 'Not specified'}
- Location: ${patientContext?.location || 'Not specified'}

USER QUERY: ${query}

PUBLICATIONS (${publications.length} found):
`;
    
    for (let i = 0; i < Math.min(publications.length, 5); i++) {
      const pub = publications[i];
      prompt += `${i+1}. "${pub.title}" (${pub.year}) - ${pub.source}\n   Snippet: ${pub.abstract.substring(0, 200)}...\n`;
    }
    
    prompt += `\nCLINICAL TRIALS (${clinicalTrials.length} found):\n`;
    
    for (let i = 0; i < Math.min(clinicalTrials.length, 3); i++) {
      const trial = clinicalTrials[i];
      prompt += `${i+1}. ${trial.title} - Status: ${trial.status}\n   Phase: ${trial.phase}\n`;
    }
    
    if (history && history.length > 0) {
      prompt += `\nPREVIOUS CONVERSATION CONTEXT:\n`;
      const lastMessages = history.slice(-4);
      for (const msg of lastMessages) {
        if (msg.role === 'user') {
          prompt += `User previously asked: ${JSON.stringify(msg.content).substring(0, 200)}\n`;
        }
      }
    }
    
    prompt += `\nGenerate a response with these sections:
1. Condition Overview (based on patient's disease)
2. Research Insights (cite specific publications with years)
3. Clinical Trials (list relevant trials with status and locations)
4. Source Attribution (list all sources used)

Be accurate, cite sources, and personalize based on patient context.`;
    
    return prompt;
  }
  
  parseAndStructureOutput(llmOutput, publications, clinicalTrials) {
    // Create structured response with or without proper LLM parsing
    return {
      conditionOverview: this.extractSection(llmOutput, 'Condition Overview', publications),
      researchInsights: {
        summary: this.extractSection(llmOutput, 'Research Insights', publications),
        publications: publications.slice(0, 6).map(p => ({
          title: p.title,
          authors: p.authors?.slice(0, 3).join(', ') || 'Various',
          year: p.year,
          source: p.source,
          url: p.url,
          keyFindings: p.abstract?.substring(0, 200) || ''
        }))
      },
      clinicalTrials: clinicalTrials.slice(0, 4).map(t => ({
        title: t.title,
        status: t.status,
        phase: t.phase,
        eligibility: t.eligibility?.substring(0, 300) || 'Contact site for details',
        locations: t.locations?.slice(0, 2) || [],
        contact: {
          name: t.contactName,
          phone: t.contactPhone,
          email: t.contactEmail
        }
      })),
      sourceAttribution: this.buildSourceAttribution(publications, clinicalTrials),
      personalizedNote: this.generatePersonalizedNote(publications, clinicalTrials)
    };
  }
  
  extractSection(text, sectionName, defaultData) {
    const regex = new RegExp(`${sectionName}[\\s\\S]*?(?=\\n\\n|\\n[A-Z]|$)`, 'i');
    const match = text.match(regex);
    if (match && match[0]) {
      return match[0].replace(`${sectionName}:`, '').trim();
    }
    
    // Fallback sections
    const fallbacks = {
      'Condition Overview': 'Based on current medical literature, this condition requires comprehensive management. Always consult healthcare providers for personalized advice.',
      'Research Insights': 'Recent studies continue to advance our understanding of treatment options. The publications below provide current evidence.'
    };
    
    return fallbacks[sectionName] || 'Information available in cited sources below.';
  }
  
  buildSourceAttribution(publications, clinicalTrials) {
    const sources = [];
    
    for (const pub of publications.slice(0, 6)) {
      sources.push({
        title: pub.title,
        authors: Array.isArray(pub.authors) ? pub.authors.slice(0, 3).join(', ') : pub.authors,
        year: pub.year,
        platform: pub.source,
        url: pub.url,
        snippet: pub.abstract?.substring(0, 150) || ''
      });
    }
    
    for (const trial of clinicalTrials.slice(0, 3)) {
      sources.push({
        title: trial.title,
        platform: 'ClinicalTrials.gov',
        url: `https://clinicaltrials.gov/ct2/show/${trial.id}`,
        status: trial.status,
        snippet: `Phase ${trial.phase} trial - ${trial.locations?.length || 0} locations`
      });
    }
    
    return sources;
  }
  
  generatePersonalizedNote(publications, clinicalTrials) {
    let note = "💡 Personalized Insight: ";
    
    if (clinicalTrials.length > 0) {
      note += `There are ${clinicalTrials.length} active clinical trials related to your query. `;
    }
    
    if (publications.length > 0) {
      const recentPubs = publications.filter(p => p.year >= 2023);
      if (recentPubs.length > 0) {
        note += `${recentPubs.length} recent publications (2023-2024) provide updated research findings. `;
      }
    }
    
    note += "Always discuss these findings with your healthcare provider before making any medical decisions.";
    
    return note;
  }
  
  generateFallbackResponse(patientContext, query, publications, clinicalTrials) {
    return {
      conditionOverview: `Based on research for ${patientContext?.disease || 'your condition'}, we found ${publications.length} relevant publications and ${clinicalTrials.length} clinical trials.`,
      researchInsights: {
        summary: publications.length > 0 
          ? `Key findings from recent studies include ${publications.slice(0, 3).map(p => p.title).join(', ')}.`
          : 'No publications found for this specific query. Try broadening your search terms.',
        publications: publications.slice(0, 6)
      },
      clinicalTrials: clinicalTrials.slice(0, 4),
      sourceAttribution: this.buildSourceAttribution(publications, clinicalTrials),
      personalizedNote: "⚠️ This is AI-generated research assistance. Always consult medical professionals."
    };
  }
}

module.exports = new LLMService();