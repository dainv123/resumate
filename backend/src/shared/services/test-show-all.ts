import { DynamicTemplateService } from './dynamic-template.service';

// Test data từ CV của bạn
const testCvData = {
    contact: {
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+1 (555) 123-4567',
      address: '123 Main St, City, State 12345',
      linkedin: 'linkedin.com/in/johndoe',
      github: 'github.com/johndoe',
      website: 'johndoe.com'
    },
    summary: 'Experienced software engineer with 5+ years of experience in full-stack development.',
    experience: [
      {
        id: 'exp_1',
        title: 'Senior Software Engineer',
        company: 'Tech Corp',
        location: 'San Francisco, CA',
        startDate: '2020-01-01',
        endDate: '',
        current: true,
        description: 'Led development of microservices architecture',
        responsibilities: ['Architected scalable systems', 'Mentored junior developers'],
        achievements: ['Reduced system latency by 40%', 'Improved team productivity'],
        technologies: ['Node.js', 'React', 'AWS'],
        teamSize: 8,
        companyDescription: 'Leading technology company'
      }
    ],
    education: [
      {
        id: 'edu_1',
        institution: 'University of Technology',
        degree: 'Bachelor of Computer Science',
        field: 'Computer Science',
        startDate: '2016-09-01',
        endDate: '2020-05-31',
        gpa: '3.8',
        description: 'Graduated with honors',
        location: 'Boston, MA'
      }
    ],
    skills: {
      technical: ['JavaScript', 'TypeScript', 'Python', 'Java'],
      tools: ['Git', 'Docker', 'Kubernetes'],
      languages: ['English', 'Spanish'],
      soft: ['Leadership', 'Communication', 'Problem Solving']
    },
    projects: [
      {
        id: 'proj_1',
        name: 'E-commerce Platform',
        description: 'Built a full-stack e-commerce platform',
        startDate: '2021-01-01',
        endDate: '2021-06-30',
        technologies: ['React', 'Node.js', 'MongoDB'],
        role: 'Full-stack Developer',
        teamSize: 4,
        results: ['Increased sales by 25%', 'Improved user experience'],
        link: 'https://example.com',
        repository: 'https://github.com/example/ecommerce'
      }
    ],
    certifications: [],
    awards: [],
    publications: [],
    volunteer: [],
    languages: []
  };

// Test function
export function testShowAllTemplate() {
  const dynamicTemplateService = new DynamicTemplateService();
  
  console.log("=== Testing Show All Template ===");
  
  // Test với show-all config
  const showAllConfig = dynamicTemplateService.getShowAllConfig();
  const htmlContent = dynamicTemplateService.generateDynamicTemplate(testCvData, showAllConfig, true);
  
  console.log("Generated HTML length:", htmlContent.length);
  console.log("HTML preview:", htmlContent.substring(0, 500) + "...");
  
  // Test detectAvailableSections với showEmptySections = true
  const allSections = dynamicTemplateService.detectAvailableSections(testCvData, true);
  console.log("\n=== All Sections (including empty) ===");
  allSections.forEach(section => {
    console.log(`- ${section.title}: ${section.hasData ? 'HAS DATA' : 'EMPTY'}`);
  });
  
  // Test detectAvailableSections với showEmptySections = false (default)
  const availableSections = dynamicTemplateService.detectAvailableSections(testCvData, false);
  console.log("\n=== Available Sections (only with data) ===");
  availableSections.forEach(section => {
    console.log(`- ${section.title}: HAS DATA`);
  });
  
  return htmlContent;
}

// Uncomment để chạy test
// testShowAllTemplate();
