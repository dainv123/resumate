export type Language = 'en' | 'vi';

export interface AIPrompts {
  generateBulletPoints: {
    prompt: string;
  };
  tailorCvContent: {
    prompt: string;
  };
  analyzeCompatibility: {
    prompt: string;
  };
  generateCoverLetter: {
    prompt: string;
  };
  parseCvContent: {
    prompt: string;
  };
  generateSuggestions: {
    prompt: string;
  };
  extractKeywords: {
    prompt: string;
  };
}

export const aiPrompts: Record<Language, AIPrompts> = {
  en: {
    generateBulletPoints: {
      prompt: `
        Generate 3-5 professional bullet points for a CV based on this project:

        Role: {{role}}
        Technologies: {{techStack}}
        Description: {{description}}

        Requirements:
        - Start with action verbs
        - Include quantifiable results if possible
        - Focus on technical achievements
        - Keep each bullet point concise (1-2 lines)
        - Make them ATS-friendly

        IMPORTANT: Optimize CV CONTENT in ENGLISH. All text in the CV (summary, experience descriptions, etc.) must be written in English.

        RESPONSE FORMAT: Return ONLY JSON object, no other text. JSON must start with { and end with }.
      `,
    },
    tailorCvContent: {
      prompt: `
        Tailor this CV data to match the job description:

        Job Description:
        {{jobDescription}}

        Current CV Data:
        {{cvData}}

        Requirements:
        1. Analyze the job requirements and identify key skills, technologies, and experience needed
        2. Reorder and emphasize relevant experience
        3. Add missing keywords from the job description
        4. Optimize the summary to match the role
        5. Highlight relevant projects and achievements
        6. Ensure ATS compatibility

        IMPORTANT: Return the tailored CV data as a JSON object with EXACTLY the same structure as the input.
        - Keep the "contact" object nested (do not flatten it)
        - Maintain all array structures (experience, education, projects, etc.)
        - Preserve the skills object with technical, soft, languages, tools arrays
        - Do not change the top-level structure, only modify the content within each field

        RESPONSE FORMAT: Return ONLY JSON object, no other text. JSON must start with { and end with }.
      `,
    },
    analyzeCompatibility: {
      prompt: `
        Analyze the compatibility between this CV and job description. Provide a detailed assessment.

        Job Description:
        {{jobDescription}}

        CV Data:
        {{cvData}}

        Analyze and return a JSON object with:
        {
          "score": (number 0-10, how well CV matches the job),
          "matchedSkills": (array of skills from CV that match job requirements),
          "missingSkills": (array of important skills mentioned in JD but missing from CV),
          "matchedExperience": (array of relevant experience that matches job requirements),
          "missingRequirements": (array of key requirements from JD that CV doesn't meet),
          "suggestions": (array of 3-5 specific suggestions to improve compatibility),
          "strengths": (array of 3-5 CV strengths that stand out for this role)
        }

        Be specific and actionable in your analysis.

        IMPORTANT: Optimize CV CONTENT in ENGLISH. All text in the CV (summary, experience descriptions, etc.) must be written in English.

        RESPONSE FORMAT: Return ONLY JSON object, no other text. JSON must start with { and end with }.
      `,
    },
    generateCoverLetter: {
      prompt: `
        Generate a professional cover letter based on this CV and job description.

        Job Description:
        {{jobDescription}}

        CV Data:
        Name: {{name}}
        Email: {{email}}
        Summary: {{summary}}
        Skills: {{skills}}
        Experience: {{experience}}
        Education: {{education}}

        Requirements:
        1. Professional tone and format
        2. Address why the candidate is a great fit for this role
        3. Highlight relevant skills and experience from CV
        4. Show enthusiasm for the position
        5. Keep it concise (3-4 paragraphs)
        6. Include proper salutation and closing

        IMPORTANT: Write the cover letter in ENGLISH. All content must be written in English.

        Return ONLY the cover letter text, no JSON, no explanations.
      `,
    },
    parseCvContent: {
      prompt: `
        Parse this CV text and extract **ALL** structured information. Be *extremely* thorough and extract every single detail, no matter how minor. The goal is 100% data fidelity.

        **CV Text:**
        {{cvText}}

        ---

        **CRITICAL EXTRACTION REQUIREMENTS - ENSURE DATA COMPLETENESS:**

        1. **Personal Information**: Name, Email, Phone, Location/Address, **LinkedIn URL**, **Date of Birth**.
        2. **About Me/Summary**: Extract the complete professional summary (exact wording).
        3. **Work Experience**: For **EACH** job, extract:
           * Company Name (exact)
           * Job Title (exact)
           * Employment Period (exact dates/duration)
           * Company Description & **Team Size** (if mentioned)
           * **Tech Stack**: Extract **ALL** technologies mentioned, including specific libraries (e.g., Ant Design, Jest, Cypress).
           * **Responsibilities**: Extract **ALL** bullet points or details.
           * **Achievements**: Extract **ALL** listed achievements, quantifying results (e.g., percentages, metrics).
           * **Special Note for Projects/Sub-roles (e.g., Sutrix):** Treat internal projects or distinct roles within one company's entry as detailed **sub-sections**, ensuring the responsibilities and tech stack for **EACH** sub-section (like Globe, Chugai) are captured.

        4. **Education**: Degree, School, Year/Duration, Location, and any Honors/Awards.
        5. **Skills**: Extract **ALL** skills with **years of experience** if mentioned (e.g., "ReactJS (5 years)"). Organize them into appropriate categories.
        6. **Projects (Highlight)**: Name, Duration, Description, **Comprehensive Tech Stack** (including unique infrastructure tech like MongoDB Atlas, Amazon S3, Route 53, Docusaurus), Results, and Link.
        7. **Certifications**: Name, Issuer, Date/Expiry, and Certificate Links.
        8. **Additional Info**: Any other relevant, uncategorized details.

        ---

        **EXTRACTION RULES & JSON INSTRUCTION:**

        * **Data Integrity:** Extract **EVERY** detail. If dates, team sizes, or specific links (view certificate, view project) are present, **they must be extracted**.
        * **Exact Wording:** Preserve exact wording for job titles, company names, achievements, and the summary.
        * **Handle Ambiguity:** Be flexible with headings (e.g., 'EXPERIENCE' vs 'WORK HISTORY').
        * **JSON Output:** Return **only** the JSON object using the exact structure provided below.
        * **Mandatory Keys:** If a section or field is not present in the CV, use an **empty array \`[]\`** for list fields or **\`null\`** (or empty string \`""\`) for string fields. **DO NOT OMIT ANY TOP-LEVEL KEY OR MANDATORY NESTED KEY**.

        Extract and return a JSON object with this comprehensive structure:
        {
          "contact": {
            "name": "Full Name",
            "email": "email@example.com",
            "phone": "phone number",
            "address": "address",
            "linkedin": "url (optional)",
            "github": "url (optional)",
            "website": "url (optional)",
            "location": "location (optional)"
          },
          "dateOfBirth": "date (optional)",
          "summary": "professional summary",
          "education": [
            {
              "degree": "Degree Name",
              "school": "School Name",
              "year": "Graduation Year/Duration",
              "location": "School Location (optional)",
              "honors": "Honors/Awards (optional)"
            }
          ],
          "experience": [
            {
              "title": "Job Title",
              "company": "Company Name",
              "duration": "Start Date - End Date",
              "teamSize": "Team Size (optional)",
              "companyDescription": "Description (optional)",
              "responsibilities": ["responsibility 1", "responsibility 2"],
              "achievements": ["achievement 1", "achievement 2"],
              "technologies": ["tech1", "tech2"],
              "subProjects": [
                {
                  "name": "Sub Project Name (optional)",
                  "role": "Role in Sub Project (optional)",
                  "techStack": ["tech1"],
                  "responsibilities": ["sub-responsibility 1"]
                }
              ]
            }
          ],
          "skills": {
            "technical": ["skill1 (years)", "skill2 (years)"],
            "soft": ["skill1", "skill2"],
            "tools": ["tool1", "tool2"],
            "languages": ["language1", "language2"]
          },
          "projects": [
            {
              "name": "Project Name",
              "duration": "Duration (optional)",
              "description": "Project description",
              "techStack": ["tech1", "tech2"],
              "results": "Project results",
              "link": "Project link (optional)"
            }
          ],
          "certifications": [
            {
              "name": "Certification Name",
              "issuer": "Issuing Organization",
              "date": "Issue Date/Expiry Date",
              "link": "Certificate Link (optional)"
            }
          ],
          "awards": [],
          "publications": [],
          "volunteer": []
        }

        **CRITICAL EXTRACTION INSTRUCTIONS:**
        - Extract EVERY SINGLE detail from the CV - nothing should be missed
        - If a section is not present, use empty array []
        - Be extremely detailed and thorough
        - Handle different CV formats: chronological, functional, combination, academic, technical, etc.
        - Look for information in headers, bullet points, paragraphs, tables, and any other format
        - If dates are in different formats (MM/YYYY, Month YYYY, etc.), standardize them
        - If skills are listed with years of experience, extract both skill and years
        - Extract ALL technologies mentioned in tech stacks
        - Extract ALL achievements and responsibilities for each job
        - Don't miss any skills, experiences, achievements, or details
        - Extract team sizes, company descriptions, project links, certificate links
        - Focus on extracting detailed tech stack and achievements for work experience
        - Organize skills into technical, soft, languages, and tools categories
        - Extract project details with tech stack, duration, and results
        - Include years of experience for skills if mentioned
        - Extract ALL bullet points under responsibilities and achievements
        - **MOST IMPORTANT**: Extract ALL achievements, responsibilities, and tech stacks for each job
        - Extract company descriptions and team sizes
        - Extract ALL project details including subprojects
        - Extract ALL certification details including issuer and date
        - Extract ALL education details including location
        - Extract ALL personal information including LinkedIn and date of birth
        - Return only the JSON object, no additional text

        **EXAMPLE OF DETAILED EXTRACTION:**
        For a job like "Senior Full Stack Developer at Rakkar Digital (05/2024 - NOW)", extract:
        - Company: "Rakkar Digital"
        - Title: "Senior Full Stack Developer"
        - Period: "05/2024 - NOW"
        - Company Description: "Asia's leading digital asset custodian delivering ultra-secure crypto custody, backed by SCB 10X"
        - Team Size: "4 (Full-stack team)"
        - Tech Stack: ["NestJS", "Node.js", "TypeScript", "Go", "Jest", "WebSockets", "React.js", "TypeScript", "Ant Design", "Redux", "GraphQL", "Jest", "Cypress", "PostgreSQL", "MongoDB", "Redis", "AWS", "GCP", "Kubernetes", "Docker", "Datadog", "CI/CD", "Microservices", "BFF architecture"]
        - Responsibilities: ["Developed new features and enhanced existing functionality", "Built and optimized frontend applications", "Assisted in migrating legacy modules to microservices", "Implemented and maintained automated testing pipelines", "Monitored CI/CD pipelines on AWS/GCP", "Ensured code quality and security compliance", "Collaborated with international teams", "Supported team members and contributed to cross-team knowledge sharing"]
        - Achievements: ["Improved API latency by 32-44% across critical endpoints", "Improved test coverage to 70%+ across core modules", "Supported platform stability for successful Securities and Exchange Commission compliance", "Participated in building the custody product app for Fireblocks MPC-CMP", "Co-developed the BFF layer, enabling decoupled frontend-backend communication", "Built a dynamic report system, allowing the product team to configure and generate reports independently, speeding up development"]

        EXAMPLES OF DIFFERENT FORMATS TO HANDLE:
        - "Work Experience" vs "Professional Experience" vs "Employment History"
        - "Skills" vs "Technical Skills" vs "Core Competencies" vs "Expertise"
        - "Education" vs "Academic Background" vs "Qualifications"
        - "Projects" vs "Portfolio" vs "Key Projects"
        - "Certifications" vs "Licenses" vs "Professional Certifications"

        IMPORTANT: Optimize CV CONTENT in ENGLISH. All text in the CV (summary, experience descriptions, etc.) must be written in English.

        RESPONSE FORMAT: Return ONLY JSON object, no other text. JSON must start with { and end with }.
      `,
    },
    generateSuggestions: {
      prompt: `
        Analyze this CV and provide 5-7 improvement suggestions:

        CV Data:
        {{cvData}}

        Focus on:
        - ATS optimization
        - Keyword enhancement
        - Experience improvement
        - Skills alignment
        - Format and structure

        IMPORTANT: Optimize CV CONTENT in ENGLISH. All text in the CV (summary, experience descriptions, etc.) must be written in English.

        RESPONSE FORMAT: Return ONLY JSON object, no other text. JSON must start with { and end with }.
      `,
    },
    extractKeywords: {
      prompt: `
        Extract key skills, technologies, and requirements from this job description:

        Job Description:
        {{jobDescription}}

        Return a JSON array of the most important keywords, skills, and technologies mentioned.
        Focus on technical skills, soft skills, tools, and frameworks.

        IMPORTANT: Optimize CV CONTENT in ENGLISH. All text in the CV (summary, experience descriptions, etc.) must be written in English.

        RESPONSE FORMAT: Return ONLY JSON object, no other text. JSON must start with { and end with }.
      `,
    },
  },
  vi: {
    generateBulletPoints: {
      prompt: `
        Tạo 3-5 điểm bullet chuyên nghiệp cho CV dựa trên dự án này:

        Vai trò: {{role}}
        Công nghệ: {{techStack}}
        Mô tả: {{description}}

        Yêu cầu:
        - Bắt đầu bằng động từ hành động
        - Bao gồm kết quả định lượng nếu có thể
        - Tập trung vào thành tựu kỹ thuật
        - Giữ mỗi bullet point ngắn gọn (1-2 dòng)
        - Làm cho chúng thân thiện với ATS

        QUAN TRỌNG: Tối ưu hóa NỘI DUNG CV bằng TIẾNG VIỆT. Tất cả văn bản trong CV (tóm tắt, mô tả kinh nghiệm, v.v.) phải được viết bằng tiếng Việt.

        RESPONSE FORMAT: Trả về CHỈ JSON object, không có text khác. JSON phải bắt đầu bằng { và kết thúc bằng }.
      `,
    },
    tailorCvContent: {
      prompt: `
        Tối ưu hóa dữ liệu CV này để phù hợp với mô tả công việc:

        Mô tả công việc:
        {{jobDescription}}

        Dữ liệu CV hiện tại:
        {{cvData}}

        Yêu cầu:
        1. Phân tích yêu cầu công việc và xác định kỹ năng, công nghệ và kinh nghiệm chính cần thiết
        2. Sắp xếp lại và nhấn mạnh kinh nghiệm liên quan
        3. Thêm từ khóa còn thiếu từ mô tả công việc
        4. Tối ưu hóa phần tóm tắt để phù hợp với vai trò
        5. Làm nổi bật các dự án và thành tựu liên quan
        6. Đảm bảo tương thích với ATS

        QUAN TRỌNG: Tối ưu hóa NỘI DUNG CV bằng TIẾNG VIỆT. Tất cả văn bản trong CV (tóm tắt, mô tả kinh nghiệm, v.v.) phải được viết bằng tiếng Việt.

        QUAN TRỌNG: Trả về dữ liệu CV đã được tối ưu hóa dưới dạng đối tượng JSON với CÙNG CẤU TRÚC CHÍNH XÁC như đầu vào.
        - Giữ đối tượng "contact" lồng nhau (không làm phẳng)
        - Duy trì tất cả cấu trúc mảng (experience, education, projects, etc.)
        - Bảo toàn đối tượng skills với các mảng technical, soft, languages, tools
        - Không thay đổi cấu trúc cấp cao, chỉ sửa đổi nội dung trong mỗi trường

        RESPONSE FORMAT: Trả về CHỈ JSON object, không có text khác. JSON phải bắt đầu bằng { và kết thúc bằng }.
      `,
    },
    analyzeCompatibility: {
      prompt: `
        Phân tích mức độ tương thích giữa CV này và mô tả công việc. Cung cấp đánh giá chi tiết.

        Mô tả công việc:
        {{jobDescription}}

        Dữ liệu CV:
        {{cvData}}

        Phân tích và trả về đối tượng JSON với:
        {
          "score": (số 0-10, mức độ CV phù hợp với công việc),
          "matchedSkills": (mảng kỹ năng từ CV phù hợp với yêu cầu công việc),
          "missingSkills": (mảng kỹ năng quan trọng được đề cập trong JD nhưng thiếu trong CV),
          "matchedExperience": (mảng kinh nghiệm liên quan phù hợp với yêu cầu công việc),
          "missingRequirements": (mảng yêu cầu chính từ JD mà CV không đáp ứng),
          "suggestions": (mảng 3-5 gợi ý cụ thể để cải thiện khả năng tương thích),
          "strengths": (mảng 3-5 điểm mạnh của CV nổi bật cho vai trò này)
        }

        Hãy cụ thể và có thể thực hiện được trong phân tích của bạn.

        QUAN TRỌNG: Tối ưu hóa NỘI DUNG CV bằng TIẾNG VIỆT. Tất cả văn bản trong CV (tóm tắt, mô tả kinh nghiệm, v.v.) phải được viết bằng tiếng Việt.

        RESPONSE FORMAT: Trả về CHỈ JSON object, không có text khác. JSON phải bắt đầu bằng { và kết thúc bằng }.
      `,
    },
    generateCoverLetter: {
      prompt: `
        Tạo thư xin việc chuyên nghiệp dựa trên CV và mô tả công việc này.

        Mô tả công việc:
        {{jobDescription}}

        Dữ liệu CV:
        Tên: {{name}}
        Email: {{email}}
        Tóm tắt: {{summary}}
        Kỹ năng: {{skills}}
        Kinh nghiệm: {{experience}}
        Học vấn: {{education}}

        Yêu cầu:
        1. Giọng điệu và định dạng chuyên nghiệp
        2. Giải thích lý do tại sao ứng viên phù hợp với vai trò này
        3. Làm nổi bật kỹ năng và kinh nghiệm liên quan từ CV
        4. Thể hiện sự nhiệt tình với vị trí
        5. Giữ ngắn gọn (3-4 đoạn)
        6. Bao gồm lời chào và kết thúc thích hợp

        QUAN TRỌNG: Viết thư xin việc bằng TIẾNG VIỆT. Tất cả nội dung thư phải được viết bằng tiếng Việt.

        Trả về CHỈ văn bản thư xin việc, không JSON, không giải thích.
      `,
    },
    parseCvContent: {
      prompt: `
        Phân tích văn bản CV này và trích xuất **TẤT CẢ** thông tin có cấu trúc. Hãy *cực kỳ* kỹ lưỡng và trích xuất mọi chi tiết, dù nhỏ đến đâu. Mục tiêu là độ chính xác dữ liệu 100%.

        **Văn bản CV:**
        {{cvText}}

        ---

        **YÊU CẦU TRÍCH XUẤT QUAN TRỌNG - ĐẢM BẢO HOÀN CHỈNH DỮ LIỆU:**

        1. **Thông tin cá nhân**: Tên, Email, Điện thoại, Địa chỉ/Địa điểm, **URL LinkedIn**, **Ngày sinh**.
        2. **Giới thiệu/Tóm tắt**: Trích xuất tóm tắt nghề nghiệp hoàn chỉnh (lời nguyên văn).
        3. **Kinh nghiệm làm việc**: Đối với **MỖI** công việc, trích xuất:
           * Tên công ty (chính xác)
           * Chức danh công việc (chính xác)
           * Thời gian làm việc (ngày chính xác/khoảng thời gian)
           * Mô tả công ty & **Quy mô đội ngũ** (nếu được đề cập)
           * **Công nghệ sử dụng**: Trích xuất **TẤT CẢ** công nghệ được đề cập, bao gồm thư viện cụ thể (ví dụ: Ant Design, Jest, Cypress).
           * **Trách nhiệm**: Trích xuất **TẤT CẢ** điểm bullet hoặc chi tiết.
           * **Thành tựu**: Trích xuất **TẤT CẢ** thành tựu được liệt kê, định lượng kết quả (ví dụ: tỷ lệ phần trăm, số liệu).
           * **Lưu ý đặc biệt cho Dự án/Công việc con (ví dụ: Sutrix):** Xử lý dự án nội bộ hoặc vai trò riêng biệt trong một mục công ty như **phân đoạn chi tiết**, đảm bảo trách nhiệm và công nghệ cho **MỖI** phân đoạn (như Globe, Chugai) được ghi lại.

        4. **Học vấn**: Bằng cấp, Trường học, Năm/Khoảng thời gian, Địa điểm, và bất kỳ Danh dự/Giải thưởng nào.
        5. **Kỹ năng**: Trích xuất **TẤT CẢ** kỹ năng với **số năm kinh nghiệm** nếu được đề cập (ví dụ: "ReactJS (5 năm)"). Phân loại vào các danh mục thích hợp.
        6. **Dự án (Nổi bật)**: Tên, Khoảng thời gian, Mô tả, **Công nghệ toàn diện** (bao gồm công nghệ cơ sở hạ tầng độc đáo như MongoDB Atlas, Amazon S3, Route 53, Docusaurus), Kết quả, và Liên kết.
        7. **Chứng chỉ**: Tên, Tổ chức cấp, Ngày/Cấp hạn, và Liên kết chứng chỉ.
        8. **Thông tin bổ sung**: Bất kỳ chi tiết liên quan, chưa phân loại nào khác.

        ---

        **QUY TẮC & HƯỚNG DẪN JSON TRÍCH XUẤT:**

        * **Tính toàn vẹn dữ liệu:** Trích xuất **MỌI** chi tiết. Nếu ngày, quy mô đội ngũ, hoặc liên kết cụ thể (xem chứng chỉ, xem dự án) có mặt, **chúng phải được trích xuất**.
        * **Lời nguyên văn:** Bảo toàn lời nguyên văn cho chức danh công việc, tên công ty, thành tựu, và phần tóm tắt.
        * **Xử lý mơ hồ:** Linh hoạt với tiêu đề (ví dụ: 'EXPERIENCE' vs 'WORK HISTORY').
        * **Đầu ra JSON:** Trả về **chỉ** đối tượng JSON sử dụng cấu trúc chính xác được cung cấp bên dưới.
        * **Khóa bắt buộc:** Nếu một phần hoặc trường không có trong CV, sử dụng **mảng trống \`[]\`** cho trường danh sách hoặc **\`null\`** (hoặc chuỗi trống \`""\`) cho trường chuỗi. **KHÔNG BỎ QUA BẤT KỲ KHÓA CẤP CAO HOẶC KHÓA LỒNG NÀO**.

        Trích xuất và trả về đối tượng JSON với cấu trúc toàn diện này:
        {
          "contact": {
            "name": "Tên đầy đủ",
            "email": "email@example.com",
            "phone": "số điện thoại",
            "address": "địa chỉ",
            "linkedin": "url (tùy chọn)",
            "github": "url (tùy chọn)",
            "website": "url (tùy chọn)",
            "location": "địa điểm (tùy chọn)"
          },
          "dateOfBirth": "ngày (tùy chọn)",
          "summary": "tóm tắt nghề nghiệp",
          "education": [
            {
              "degree": "Tên bằng cấp",
              "school": "Tên trường học",
              "year": "Năm tốt nghiệp/Khoảng thời gian",
              "location": "Địa điểm trường học (tùy chọn)",
              "honors": "Danh dự/Giải thưởng (tùy chọn)"
            }
          ],
          "experience": [
            {
              "title": "Chức danh công việc",
              "company": "Tên công ty",
              "duration": "Ngày bắt đầu - Ngày kết thúc",
              "teamSize": "Quy mô đội ngũ (tùy chọn)",
              "companyDescription": "Mô tả (tùy chọn)",
              "responsibilities": ["trách nhiệm 1", "trách nhiệm 2"],
              "achievements": ["thành tựu 1", "thành tựu 2"],
              "technologies": ["công nghệ1", "công nghệ2"],
              "subProjects": [
                {
                  "name": "Tên dự án con (tùy chọn)",
                  "role": "Vai trò trong dự án con (tùy chọn)",
                  "techStack": ["công nghệ1"],
                  "responsibilities": ["trách nhiệm con 1"]
                }
              ]
            }
          ],
          "skills": {
            "technical": ["kỹ năng1 (năm)", "kỹ năng2 (năm)"],
            "soft": ["kỹ năng1", "kỹ năng2"],
            "tools": ["công cụ1", "công cụ2"],
            "languages": ["ngôn ngữ1", "ngôn ngữ2"]
          },
          "projects": [
            {
              "name": "Tên dự án",
              "duration": "Khoảng thời gian (tùy chọn)",
              "description": "Mô tả dự án",
              "techStack": ["công nghệ1", "công nghệ2"],
              "results": "Kết quả dự án",
              "link": "Liên kết dự án (tùy chọn)"
            }
          ],
          "certifications": [
            {
              "name": "Tên chứng chỉ",
              "issuer": "Tổ chức cấp",
              "date": "Ngày cấp/Hạn sử dụng",
              "link": "Liên kết chứng chỉ (tùy chọn)"
            }
          ],
          "awards": [],
          "publications": [],
          "volunteer": []
        }

        **HƯỚNG DẪN TRÍCH XUẤT QUAN TRỌNG:**
        - Trích xuất MỌI CHI TIẾT từ CV - không bỏ sót gì
        - Nếu một phần không có mặt, sử dụng mảng trống []
        - Hãy cực kỳ chi tiết và kỹ lưỡng
        - Xử lý các định dạng CV khác nhau: theo thứ tự thời gian, chức năng, kết hợp, học thuật, kỹ thuật, v.v.
        - Tìm kiếm thông tin trong tiêu đề, điểm bullet, đoạn văn, bảng, và bất kỳ định dạng nào khác
        - Nếu ngày ở các định dạng khác nhau (MM/YYYY, Tháng YYYY, v.v.), chuẩn hóa chúng
        - Nếu kỹ năng được liệt kê với số năm kinh nghiệm, trích xuất cả kỹ năng và năm
        - Trích xuất TẤT CẢ công nghệ được đề cập trong tech stacks
        - Trích xuất TẤT CẢ thành tựu và trách nhiệm cho mỗi công việc
        - Đừng bỏ sót bất kỳ kỹ năng, kinh nghiệm, thành tựu, hoặc chi tiết nào
        - Trích xuất quy mô đội ngũ, mô tả công ty, liên kết dự án, liên kết chứng chỉ
        - Tập trung vào việc trích xuất tech stack chi tiết và thành tựu cho kinh nghiệm làm việc
        - Phân loại kỹ năng vào danh mục technical, soft, languages, và tools
        - Trích xuất chi tiết dự án với tech stack, khoảng thời gian, và kết quả
        - Bao gồm số năm kinh nghiệm cho kỹ năng nếu được đề cập
        - Trích xuất TẤT CẢ điểm bullet dưới responsibilities và achievements
        - **QUAN TRỌNG NHẤT**: Trích xuất TẤT CẢ thành tựu, trách nhiệm, và tech stacks cho mỗi công việc
        - Trích xuất mô tả công ty và quy mô đội ngũ
        - Trích xuất TẤT CẢ chi tiết dự án bao gồm subprojects
        - Trích xuất TẤT CẢ chi tiết chứng chỉ bao gồm issuer và date
        - Trích xuất TẤT CẢ chi tiết học vấn bao gồm location
        - Trích xuất TẤT CẢ thông tin cá nhân bao gồm LinkedIn và date of birth
        - Trả về chỉ đối tượng JSON, không văn bản bổ sung

        **VÍ DỤ VỀ VIỆC TRÍCH XUẤT CHI TIẾT:**
        Đối với công việc như "Senior Full Stack Developer tại Rakkar Digital (05/2024 - HIỆN TẠI)", trích xuất:
        - Công ty: "Rakkar Digital"
        - Chức danh: "Senior Full Stack Developer"
        - Khoảng thời gian: "05/2024 - HIỆN TẠI"
        - Mô tả công ty: "Đơn vị giám sát tài sản kỹ thuật số hàng đầu châu Á cung cấp dịch vụ giám sát crypto siêu an toàn, được SCB 10X hậu thuẫn"
        - Quy mô đội ngũ: "4 (đội full-stack)"
        - Tech Stack: ["NestJS", "Node.js", "TypeScript", "Go", "Jest", "WebSockets", "React.js", "TypeScript", "Ant Design", "Redux", "GraphQL", "Jest", "Cypress", "PostgreSQL", "MongoDB", "Redis", "AWS", "GCP", "Kubernetes", "Docker", "Datadog", "CI/CD", "Microservices", "Kiến trúc BFF"]
        - Trách nhiệm: ["Phát triển tính năng mới và nâng cao chức năng hiện có", "Xây dựng và tối ưu hóa ứng dụng frontend", "Hỗ trợ di chuyển các module cũ sang microservices", "Triển khai và duy trì đường ống kiểm thử tự động", "Giám sát đường ống CI/CD trên AWS/GCP", "Đảm bảo chất lượng mã và tuân thủ bảo mật", "Hợp tác với các đội ngũ quốc tế", "Hỗ trợ thành viên đội ngũ và đóng góp kiến thức chia sẻ cross-team"]
        - Thành tựu: ["Cải thiện độ trễ API 32-44% trên các endpoint quan trọng", "Cải thiện độ phủ kiểm thử lên 70%+ trên các module cốt lõi", "Hỗ trợ tính ổn định nền tảng cho việc tuân thủ Ủy ban Chứng khoán và Giao dịch thành công", "Tham gia xây dựng ứng dụng sản phẩm custody cho Fireblocks MPC-CMP", "Đồng phát triển lớp BFF, cho phép giao tiếp frontend-backend tách rời", "Xây dựng hệ thống báo cáo động, cho phép đội sản phẩm cấu hình và tạo báo cáo độc lập, tăng tốc độ phát triển"]

        VÍ DỤ VỀ CÁC ĐỊNH DẠNG KHÁC NHAU CẦN XỬ LÝ:
        - "Work Experience" vs "Professional Experience" vs "Employment History"
        - "Skills" vs "Technical Skills" vs "Core Competencies" vs "Expertise"
        - "Education" vs "Academic Background" vs "Qualifications"
        - "Projects" vs "Portfolio" vs "Key Projects"
        - "Certifications" vs "Licenses" vs "Professional Certifications"

        QUAN TRỌNG: Tối ưu hóa NỘI DUNG CV bằng TIẾNG VIỆT. Tất cả văn bản trong CV (tóm tắt, mô tả kinh nghiệm, v.v.) phải được viết bằng tiếng Việt.

        RESPONSE FORMAT: Trả về CHỈ JSON object, không có text khác. JSON phải bắt đầu bằng { và kết thúc bằng }.
      `,
    },
    generateSuggestions: {
      prompt: `
        Phân tích CV này và đưa ra 5-7 gợi ý cải thiện:

        Dữ liệu CV:
        {{cvData}}

        Tập trung vào:
        - Tối ưu hóa ATS
        - Cải thiện từ khóa
        - Cải thiện kinh nghiệm
        - Căn chỉnh kỹ năng
        - Định dạng và cấu trúc

        QUAN TRỌNG: Tối ưu hóa NỘI DUNG CV bằng TIẾNG VIỆT. Tất cả văn bản trong CV (tóm tắt, mô tả kinh nghiệm, v.v.) phải được viết bằng tiếng Việt.

        RESPONSE FORMAT: Trả về CHỈ JSON object, không có text khác. JSON phải bắt đầu bằng { và kết thúc bằng }.
      `,
    },
    extractKeywords: {
      prompt: `
        Trích xuất kỹ năng chính, công nghệ và yêu cầu từ mô tả công việc này:

        Mô tả công việc:
        {{jobDescription}}

        Trả về mảng JSON của các từ khóa, kỹ năng và công nghệ quan trọng nhất được đề cập.
        Tập trung vào kỹ năng kỹ thuật, kỹ năng mềm, công cụ và framework.

        QUAN TRỌNG: Tối ưu hóa NỘI DUNG CV bằng TIẾNG VIỆT. Tất cả văn bản trong CV (tóm tắt, mô tả kinh nghiệm, v.v.) phải được viết bằng tiếng Việt.

        RESPONSE FORMAT: Trả về CHỈ JSON object, không có text khác. JSON phải bắt đầu bằng { và kết thúc bằng }.
      `,
    },
  },
};

export function getAIPrompt(language: Language, promptKey: keyof AIPrompts): string {
  return aiPrompts[language][promptKey].prompt;
}
