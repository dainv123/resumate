#!/usr/bin/env node

/**
 * Social Media Content Generator for Resumate
 * Generates viral content for LinkedIn, TikTok, and Instagram
 */

const fs = require('fs');
const path = require('path');

// Content templates
const templates = {
  linkedin: {
    announcement: {
      headline: "Từ nothing → CV chỉ vài giây với AI Resumate",
      content: `🎉 GIỚI THIỆU RESUMATE - AI CV Builder đầu tiên tại Việt Nam!

⚡ Tạo CV chuyên nghiệp từ Job Description chỉ trong 30 giây
🤖 AI thông minh phân tích yêu cầu công việc và tạo CV phù hợp
📄 3 template chuyên nghiệp: Professional, Creative, Technical
🎯 Tối ưu hóa cho ATS systems

Không cần upload CV cũ, chỉ cần paste Job Description là có CV hoàn chỉnh!

#ResumateMagic #AICV #CVBuilder #JobSearch #CareerDevelopment #TechVietnam #AI #Freelancer

Link: [resumate.com]`
    },
    successStory: {
      headline: "Anh Minh tạo CV trong 25 giây và nhận được 3 cuộc phỏng vấn trong 1 tuần",
      content: `📈 CASE STUDY: Từ Job Description → CV hoàn chỉnh → 3 cuộc phỏng vấn

Anh Minh, Frontend Developer:
"Trước đây tôi mất 2-3 giờ để chỉnh sửa CV cho từng công việc. Với Resumate, tôi chỉ cần paste Job Description và có CV mới trong 25 giây!"

Kết quả:
✅ CV được tối ưu hóa 100% cho yêu cầu công việc
✅ Nhận được 3 cuộc phỏng vấn trong 1 tuần đầu
✅ Tăng tỷ lệ response từ 15% lên 45%

Bạn có muốn thử #ResumateMagic không? 🚀

#AICV #CVBuilder #JobSuccess #TechCareer #VietnamTech #Freelancer`
    },
    insights: {
      headline: "5 lý do tại sao 90% CV bị loại bỏ trong 6 giây đầu",
      content: `📊 THỐNG KÊ: 90% CV bị loại bỏ trong 6 giây đầu tiên!

Lý do chính:
❌ CV không phù hợp với Job Description
❌ Thiếu keywords quan trọng
❌ Format không thân thiện với ATS
❌ Thông tin không được tối ưu hóa
❌ CV quá dài hoặc quá ngắn

💡 Giải pháp: Resumate AI
✅ Phân tích Job Description tự động
✅ Tối ưu hóa keywords cho ATS
✅ Format chuẩn chuyên nghiệp
✅ Tạo CV trong 30 giây

Thử ngay: [resumate.com]

#ResumateMagic #AICV #CVTips #JobSearch #CareerAdvice #ATS`
    }
  },

  tiktok: {
    pov: {
      title: "POV: Bạn tạo CV trong 30 giây",
      script: `🎬 POV: Bạn tạo CV trong 30 giây

[Scene 1: 0-5s]
Person đang lo lắng nhìn Job Description dài 2 trang
"Làm sao tạo CV cho công việc này đây? 😰"

[Scene 2: 5-15s]
Mở Resumate, paste Job Description
"Chỉ cần paste JD thôi!"

[Scene 3: 15-25s]
AI đang xử lý với countdown timer
"AI đang tạo CV cho bạn..."

[Scene 4: 25-30s]
CV hoàn chỉnh xuất hiện
"Xong! CV chuyên nghiệp trong 30 giây! 🎉"

[Text overlay]: #ResumateMagic #AICV #CV30giay`
    },
    beforeAfter: {
      title: "CV Before vs After AI",
      script: `🎬 CV Before vs After AI

[Split screen]
Left: CV cũ, format xấu, thiếu thông tin
Right: CV mới từ Resumate AI

[Text overlay]:
"Before: CV tự làm - 2 giờ"
"After: CV từ AI - 30 giây"

[End screen]: "Thử ngay tại resumate.com"
#ResumateMagic #AICV #CVBuilder #TechTok`
    },
    mistakes: {
      title: "5 sai lầm khi tạo CV",
      script: `🎬 5 sai lầm khi tạo CV

[Quick cuts, 6s each]
1. "Sai lầm 1: CV quá dài" 📄
2. "Sai lầm 2: Không có keywords" 🔍
3. "Sai lầm 3: Format xấu" 😵
4. "Sai lầm 4: Không phù hợp JD" ❌
5. "Sai lầm 5: Tạo CV thủ công" ⏰

[Solution screen]:
"Giải pháp: Resumate AI tạo CV trong 30 giây! 🚀"

#ResumateMagic #CVTips #JobSearch #AICV`
    }
  },

  instagram: {
    carousel: {
      title: "5 bước tạo CV với AI",
      caption: `🤖 Tạo CV với AI chỉ trong 5 bước!

Swipe để xem cách Resumate AI giúp bạn tạo CV chuyên nghiệp trong 30 giây! 

⚡ Từ Job Description → CV hoàn chỉnh
🎯 Tối ưu hóa cho ATS systems
📄 3 template đẹp: Professional, Creative, Technical

Thử ngay tại bio link! 👆

#ResumateMagic #AICV #CVBuilder #JobSearch #CareerGoals #TechLife #FreelancerLife #VietnamTech

@resumate.ai`
    },
    story: {
      title: "CV Challenge",
      template: `🎯 CV Challenge với Resumate AI!

"Bạn có thể tạo CV cho vị trí này không?"

[Job Description screenshot]

"Tôi sẽ thử với Resumate AI..."

[Countdown timer: 30 seconds]

"Xong! CV hoàn chỉnh trong 30 giây! 🎉"

[CV preview]

"Bạn có muốn thử không? Link trong bio! 👆"

#ResumateMagic #AICV #CVChallenge #JobSearch`
    },
    reel: {
      title: "CV Transformation",
      script: `🎬 CV Transformation với AI

[0-3s]: CV cũ, format xấu
[3-6s]: Mở Resumate
[6-9s]: Paste Job Description
[9-12s]: AI processing animation
[12-15s]: CV mới hoàn chỉnh

[Text overlay]: "30 giây thay đổi mọi thứ!"

#ResumateMagic #AICV #CVBuilder #Transformation`
    }
  }
};

// Hashtag collections
const hashtags = {
  primary: ['#ResumateMagic', '#AICV', '#CVBuilder', '#CV30giay', '#TaoCVNhanh'],
  secondary: ['#JobSearch', '#CareerDevelopment', '#TechVietnam', '#Freelancer', '#CVTips'],
  trending: ['#AI', '#Automation', '#Productivity', '#CareerAdvice', '#JobHunting']
};

// Generate content for specific platform and type
function generateContent(platform, type) {
  const template = templates[platform][type];
  if (!template) {
    throw new Error(`Template not found: ${platform}.${type}`);
  }

  return {
    platform,
    type,
    title: template.title || template.headline,
    content: template.content || template.script || template.caption || template.template,
    hashtags: [...hashtags.primary, ...hashtags.secondary].slice(0, 10),
    generatedAt: new Date().toISOString()
  };
}

// Generate all content
function generateAllContent() {
  const content = [];
  
  // LinkedIn content
  content.push(generateContent('linkedin', 'announcement'));
  content.push(generateContent('linkedin', 'successStory'));
  content.push(generateContent('linkedin', 'insights'));
  
  // TikTok content
  content.push(generateContent('tiktok', 'pov'));
  content.push(generateContent('tiktok', 'beforeAfter'));
  content.push(generateContent('tiktok', 'mistakes'));
  
  // Instagram content
  content.push(generateContent('instagram', 'carousel'));
  content.push(generateContent('instagram', 'story'));
  content.push(generateContent('instagram', 'reel'));
  
  return content;
}

// Save content to files
function saveContent(content) {
  const outputDir = path.join(__dirname, 'social-content-output');
  
  // Create output directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Save individual files
  content.forEach((item, index) => {
    const filename = `${item.platform}-${item.type}-${index + 1}.json`;
    const filepath = path.join(outputDir, filename);
    
    fs.writeFileSync(filepath, JSON.stringify(item, null, 2));
    console.log(`✅ Generated: ${filename}`);
  });
  
  // Save combined file
  const combinedPath = path.join(outputDir, 'all-content.json');
  fs.writeFileSync(combinedPath, JSON.stringify(content, null, 2));
  console.log(`✅ Generated: all-content.json`);
  
  // Generate markdown summary
  const markdownPath = path.join(outputDir, 'CONTENT_SUMMARY.md');
  const markdown = generateMarkdownSummary(content);
  fs.writeFileSync(markdownPath, markdown);
  console.log(`✅ Generated: CONTENT_SUMMARY.md`);
}

// Generate markdown summary
function generateMarkdownSummary(content) {
  let markdown = `# 📱 Social Media Content Summary\n\n`;
  markdown += `Generated on: ${new Date().toLocaleString()}\n\n`;
  
  const platforms = ['linkedin', 'tiktok', 'instagram'];
  
  platforms.forEach(platform => {
    const platformContent = content.filter(item => item.platform === platform);
    markdown += `## ${platform.toUpperCase()}\n\n`;
    
    platformContent.forEach(item => {
      markdown += `### ${item.title}\n\n`;
      markdown += `\`\`\`\n${item.content}\n\`\`\`\n\n`;
      markdown += `**Hashtags:** ${item.hashtags.join(' ')}\n\n`;
    });
  });
  
  return markdown;
}

// Main execution
if (require.main === module) {
  console.log('🚀 Generating social media content for Resumate...\n');
  
  try {
    const content = generateAllContent();
    saveContent(content);
    
    console.log(`\n🎉 Successfully generated ${content.length} content pieces!`);
    console.log('📁 Check the "social-content-output" directory for all files.');
    
  } catch (error) {
    console.error('❌ Error generating content:', error.message);
    process.exit(1);
  }
}

module.exports = {
  generateContent,
  generateAllContent,
  saveContent,
  templates,
  hashtags
};
