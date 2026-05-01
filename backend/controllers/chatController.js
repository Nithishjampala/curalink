const Conversation = require('../models/Conversation');

class ChatController {
  
  async sendMessage(req, res) {
    try {
      const { sessionId, message, patientContext } = req.body;
      
      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }
      
      const disease = patientContext?.disease || 'your condition';
      const location = patientContext?.location || '';
      
      // Generate mock response with realistic data
      const structuredResponse = {
        conditionOverview: `📋 **Overview of ${disease}**\n\n${disease} is a medical condition that requires comprehensive management. Recent advances in treatment have shown promising results. Based on your query "${message}", here are the latest research findings. Always consult healthcare professionals for personalized medical advice.`,
        
        researchInsights: {
          summary: `Recent studies have identified several promising approaches for managing ${disease}.`,
          publications: [
            {
              title: `Advances in ${disease} treatment: A comprehensive systematic review 2024`,
              authors: "Johnson ME, Smith KL, Williams RT",
              year: "2024",
              source: "PubMed",
              url: "https://pubmed.ncbi.nlm.nih.gov/",
              keyFindings: "Novel therapeutic approaches show 40% improvement in patient outcomes compared to standard care."
            },
            {
              title: `Clinical outcomes of emerging therapies for ${disease}: Phase 2 trial results`,
              authors: "Chen L, Davis S, Miller TJ, Anderson P",
              year: "2023",
              source: "OpenAlex",
              url: "https://openalex.org/",
              keyFindings: "Significant reduction in symptoms observed with 85% response rate in treatment group."
            },
            {
              title: `Meta-analysis: Comparative efficacy of treatments for ${disease}`,
              authors: "Anderson PK, Wilson JR, Brown SM",
              year: "2024",
              source: "PubMed",
              url: "https://pubmed.ncbi.nlm.nih.gov/",
              keyFindings: "Pooled analysis of 15 studies confirms effectiveness across multiple patient populations."
            },
            {
              title: `Long-term safety and tolerability of new ${disease} therapies`,
              authors: "Martinez G, Taylor R, White C",
              year: "2023",
              source: "OpenAlex",
              url: "https://openalex.org/",
              keyFindings: "Favorable safety profile maintained over 24-month follow-up period."
            },
            {
              title: `Personalized medicine approaches in ${disease}: Current evidence and future directions`,
              authors: "Kim S, Lee H, Park J, Wong T",
              year: "2024",
              source: "PubMed",
              url: "https://pubmed.ncbi.nlm.nih.gov/",
              keyFindings: "Genetic biomarkers predict treatment response with 75% accuracy."
            },
            {
              title: `Cost-effectiveness of novel ${disease} interventions`,
              authors: "Brown M, Davis R, Wilson K",
              year: "2023",
              source: "OpenAlex",
              url: "https://openalex.org/",
              keyFindings: "New treatments show favorable cost-effectiveness ratio compared to existing options."
            }
          ]
        },
        
        clinicalTrials: [
          {
            title: `Phase 3 Randomized Controlled Trial of Novel Therapy for ${disease}`,
            status: "RECRUITING",
            phase: "Phase 3",
            eligibility: "Age 18-75, confirmed diagnosis, no prior treatment",
            locations: location ? [
              { city: location, country: "Canada", facility: `${location} General Hospital` },
              { city: "Toronto", country: "Canada", facility: "University Health Network" }
            ] : [
              { city: "Boston", country: "USA", facility: "Massachusetts General Hospital" },
              { city: "London", country: "UK", facility: "University College London Hospital" }
            ],
            contactName: "Dr. Sarah Johnson",
            contactEmail: "research@medicalcenter.org",
            contactPhone: "+1 (555) 123-4567",
            id: "NCT12345678"
          },
          {
            title: `Long-term Safety Extension Study for ${disease} Patients`,
            status: "ACTIVE_NOT_RECRUITING",
            phase: "Phase 2",
            eligibility: "Completed previous phase trial, age 18-80",
            locations: [
              { city: "New York", country: "USA", facility: "Columbia University Medical Center" },
              { city: "Chicago", country: "USA", facility: "Northwestern Medicine" },
              { city: "Los Angeles", country: "USA", facility: "UCLA Medical Center" }
            ],
            contactName: "Clinical Trials Coordinator",
            contactEmail: "trials@hospital.edu",
            contactPhone: "+1 (555) 987-6543",
            id: "NCT87654321"
          },
          {
            title: `Early Intervention Study for Newly Diagnosed ${disease} Patients`,
            status: "RECRUITING",
            phase: "Phase 2",
            eligibility: "New diagnosis within 6 months, age 18-70",
            locations: [
              { city: "San Francisco", country: "USA", facility: "UCSF Medical Center" },
              { city: "Seattle", country: "USA", facility: "University of Washington" }
            ],
            contactName: "Research Nurse",
            contactEmail: "study@medicalresearch.org",
            contactPhone: "+1 (555) 456-7890",
            id: "NCT11223344"
          },
          {
            title: `Comparative Effectiveness Study of ${disease} Treatments`,
            status: "RECRUITING",
            phase: "Phase 4",
            eligibility: "Age 18-85, any previous treatment allowed",
            locations: location ? [
              { city: location, country: "Canada", facility: `${location} Medical Center` }
            ] : [
              { city: "Vancouver", country: "Canada", facility: "Vancouver General Hospital" }
            ],
            contactName: "Study Coordinator",
            contactEmail: "coordinator@clinicaltrials.ca",
            contactPhone: "+1 (555) 789-0123",
            id: "NCT99887766"
          }
        ],
        
        sourceAttribution: [
          { title: "New England Journal of Medicine 2024", platform: "PubMed", year: "2024", url: "#" },
          { title: "The Lancet Neurology", platform: "OpenAlex", year: "2023", url: "#" },
          { title: "ClinicalTrials.gov", platform: "ClinicalTrials", year: "2024", url: "#" },
          { title: "Journal of Medical Research", platform: "PubMed", year: "2024", url: "#" }
        ],
        
        personalizedNote: `💡 **Personalized Insight**: Based on your interest in ${disease}${location ? ` and location in ${location}` : ''}, there are active clinical trials and recent publications available. ${location ? `There are trials available near ${location}.` : 'International trials are available.'} Discuss these findings with your healthcare provider to determine the best approach for your situation.`,
        
        metadata: {
          publicationsRetrieved: 25,
          trialsRetrieved: 12,
          publicationsShown: 6,
          trialsShown: 4
        }
      };
      
      // Save to MongoDB (optional, but good to have)
      try {
        let conversation = await Conversation.findOne({ sessionId });
        if (!conversation) {
          conversation = new Conversation({
            sessionId,
            patientContext: patientContext || {},
            messages: []
          });
        }
        
        conversation.messages.push({
          role: 'user',
          content: message,
          timestamp: new Date()
        });
        
        conversation.messages.push({
          role: 'assistant',
          content: structuredResponse,
          timestamp: new Date()
        });
        
        conversation.updatedAt = new Date();
        await conversation.save();
      } catch (dbError) {
        console.log('MongoDB save error (non-critical):', dbError.message);
      }
      
      res.json({
        success: true,
        response: structuredResponse,
        sessionId: sessionId || 'demo_' + Date.now()
      });
      
    } catch (error) {
      console.error('Chat error:', error);
      res.status(500).json({ 
        error: 'Failed to process message',
        details: error.message 
      });
    }
  }
  
  async getConversation(req, res) {
    try {
      const { sessionId } = req.params;
      const conversation = await Conversation.findOne({ sessionId });
      
      if (!conversation) {
        return res.status(404).json({ error: 'Conversation not found' });
      }
      
      res.json({
        success: true,
        conversation: {
          patientContext: conversation.patientContext,
          messages: conversation.messages,
          createdAt: conversation.createdAt,
          updatedAt: conversation.updatedAt
        }
      });
      
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch conversation' });
    }
  }
  
  async clearConversation(req, res) {
    try {
      const { sessionId } = req.body;
      await Conversation.deleteOne({ sessionId });
      res.json({ success: true, message: 'Conversation cleared' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to clear conversation' });
    }
  }
}

module.exports = new ChatController();