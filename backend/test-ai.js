// Simple test script for Google AI Studio integration
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Test configuration
const API_KEY = process.env.GOOGLE_AI_API_KEY || 'your_api_key_here';
const MODEL_NAME = process.env.GOOGLE_AI_MODEL || 'gemini-1.5-flash';

async function testGoogleAI() {
  try {
    console.log('🚀 Testing Google AI Studio integration...');
    
    if (!API_KEY || API_KEY === 'your_api_key_here') {
      console.error('❌ Please set GOOGLE_AI_API_KEY environment variable');
      return;
    }

    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    // Test 1: Simple text generation
    console.log('\n📝 Test 1: Simple text generation');
    const result1 = await model.generateContent('Hello, how are you?');
    const response1 = await result1.response;
    console.log('Response:', response1.text());

    // Test 2: CV parsing
    console.log('\n📄 Test 2: CV parsing');
    const cvText = `
      John Doe
      john.doe@email.com
      (555) 123-4567
      
      Software Engineer with 5 years of experience in web development.
      
      Experience:
      - Senior Developer at Tech Corp (2020-2023)
      - Junior Developer at Startup Inc (2018-2020)
      
      Skills: JavaScript, React, Node.js, Python, SQL
    `;

    const cvPrompt = `
      Parse this CV text and extract structured information:
      
      CV Text:
      ${cvText}
      
      Extract and return a JSON object with this structure:
      {
        "name": "Full Name",
        "email": "email@example.com",
        "phone": "phone number",
        "summary": "professional summary",
        "experience": [
          {
            "role": "Job Title",
            "company": "Company Name",
            "duration": "Start Date - End Date",
            "description": "Job description"
          }
        ],
        "skills": ["skill1", "skill2", "skill3"]
      }
      
      Return only the JSON object, no additional text.
    `;

    const result2 = await model.generateContent(cvPrompt);
    const response2 = await result2.response;
    console.log('CV Parsing Response:', response2.text());

    // Test 3: Project bullet generation
    console.log('\n💼 Test 3: Project bullet generation');
    const bulletPrompt = `
      Generate 3 professional bullet points for a CV based on this project:
      
      Role: Frontend Developer
      Technologies: React, TypeScript, Tailwind CSS
      Description: Built a responsive e-commerce website with shopping cart functionality
      
      Requirements:
      - Start with action verbs
      - Include quantifiable results if possible
      - Focus on technical achievements
      - Keep each bullet point concise (1-2 lines)
      - Make them ATS-friendly
      
      Return as a JSON array of strings.
    `;

    const result3 = await model.generateContent(bulletPrompt);
    const response3 = await result3.response;
    console.log('Bullet Points Response:', response3.text());

    console.log('\n✅ All tests completed successfully!');
    console.log('🎉 Google AI Studio integration is working properly');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Full error:', error);
  }
}

// Run the test
testGoogleAI();