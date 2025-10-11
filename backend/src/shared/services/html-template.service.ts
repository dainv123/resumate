import { Injectable, Logger } from '@nestjs/common';
import { CVData } from '../../modules/cv/entities/cv.entity';

@Injectable()
export class HtmlTemplateService {
  private readonly logger = new Logger(HtmlTemplateService.name);

  async generateTwoColumnHtml(cvData: CVData): Promise<string> {
    this.logger.log('Generating two-column HTML template...');

    const template = `
<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <style>
        :root {
            --primaryColor: #fff;
            --secondaryColor: #333;
            --chineseBlue55: #4253D7;
            --chineseBlue25: #162069;
            --chineseBlue15: #0D133F;
            --gray: #808080;
        }

        body {
            background: #F2F2F2;
            margin: 0;
            padding: 0;
        }

        * {
            font-family: Geist, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            font-size: 1rem;
            color: var(--chineseBlue25);
        }

        hr {
            width: 100%;
            height: 1px;
            background: transparent;
            border: none;
            border-bottom: dashed 1px var(--gray);
        }

        h1 {
            font-weight: 600;
            font-size: 1.4em;
            margin: .2rem 0;
        }

        h2 {
            font-weight: 700;
            font-size: 1.45rem;
            margin: 0 0 .5rem 0;
            padding-bottom: .1rem;
            border: solid 0 var(--chineseBlue55);
            border-bottom-width: 2px;
        }

        h3 {
            margin: 0 0 .3rem 0;
            border: solid 0 var(--chineseBlue55);
            border-left-width: 3px;
            padding-left: .5rem;
        }

        h4 {
            margin: 0;
        }

        span {
            margin: .1rem 0;
        }

        i {
            font-size: 1.2rem !important;
        }

        h1, h2, h3 {
            color: var(--chineseBlue55);
        }

        nav {
            --icon-size: 1rem;
            position: relative;
            padding-left: var(--icon-size);
            margin-top: .3rem;
            font-weight: 500;
            font-size: .9rem;
            color: var(--chineseBlue55);
        }

        a {
            display: flex;
            width: fit-content;
            align-items: center;
            font-size: .8rem;
            text-decoration: none;
        }

        .custom-link::before {
            content: '\\f35d';
            display: block;
            font-family: 'Font Awesome 5 Free';
            font-weight: 900;
            color: var(--chineseBlue55);
            margin-right: .2rem;
            font-size: inherit;
        }

        .custom-link::after {
            content: "(" attr(href) ")";
            display: block;
            margin-left: .4rem;
            color: var(--gray);
            font-weight: 300;
            font-size: 95%;
            text-decoration: none;
            border-bottom: solid 1px var(--gray);
        }

        b {
            font-weight: 600;
        }

        small {
            display: flex;
            font-size: .8rem;
            color: var(--chineseBlue55);
            margin: .1rem 0 0 0;
        }

        small::before {
            display: block;
            content: 'Stack:';
            margin-right: .2rem;
        }

        main {
            display: flex;
            width: 100%;
            flex-direction: column;
            align-self: center;
            align-items: center;
        }

        #resume-wrapper {
            display: flex;
            flex-direction: row;
            width: 205mm;
            min-height: 296mm;
            background: var(--primaryColor);
            /* overflow: hidden; */
            margin: 0 auto;
        }

        #resume-wrapper>.main-part,
        #resume-wrapper>.side-part {
            margin-top: 5mm;
            margin-bottom: 5mm;
        }

        .main-part,
        .side-part {
            display: flex;
            flex-direction: column;
        }

        .main-part {
            flex: 1.9;
            justify-content: flex-start;
            margin-right: .3rem;
            margin-left: 5mm;
            padding-bottom: 3rem;
            /* overflow: hidden; */
        }

        .main-part>section {
            display: flex;
            width: 95%;
            flex-direction: column;
            justify-content: center;
            align-items: flex-start;
            padding: .6rem 0;
        }

        .main-part>section>h4 {
            color: var(--chineseBlue55);
        }

        .main-part>section:nth-of-type(1) {
            padding-top: 0;
            padding-bottom: 0;
        }

        .main-part>section:nth-of-type(1)>span,
        i {
            font-size: .85rem !important;
        }

        .main-part>section:nth-of-type(1)>span:nth-of-type(2) {
            margin-top: 5px;
        }

        #xp>div {
            padding: .1rem 0;
        }

        .main-part>section>div {
            row-gap: .2rem;
        }

        .main-part>section>div b {
            font-size: 0.9rem;
            font-weight: 400;
        }

        .main-part>section>div,
        .main-part>section>section {
            display: flex;
            flex-direction: column;
            margin-bottom: .4rem;
        }

        #formation>div:first-of-type {
            margin-top: .7rem;
        }

        #formation>div {
            margin-left: 1rem;
        }

        .main-part>section>div:last-of-type {
            margin-bottom: 0;
        }

        .main-part>section>section {
            padding: .2rem 0;
            margin-bottom: 0;
        }

        .main-part>section>*:not(h3, h2) {
            margin-left: .6rem;
        }

        .main-part>section span,
        i {
            font-size: .85rem;
            color: var(--gray);
        }

        .main-part>section:first-of-type i {
            color: var(--chineseBlue15);
        }

        .main-part>section h3 {
            font-size: 1.2rem;
            font-weight: 600;
        }

        .main-part>section h4 {
            display: flex;
            font-size: 1rem;
            font-weight: 500;
        }

        .main-part>section p {
            font-size: 0.8rem;
            font-weight: 300;
            margin: .1rem .2rem 0 0;
        }

        .main-part>section ul {
            margin: 0;
            padding-left: 1.5rem;
        }

        .main-part>section ul li {
            font-weight: 300;
            padding: .1rem 0;
            font-size: .9rem;
        }

        .side-part {
            flex: 1;
            justify-content: flex-start;
            border-right: solid 2px var(--secondaryColor);
            padding: 0 1.5rem 0 1.5rem;
            margin-right: 2mm;
            row-gap: 2.5rem;
            overflow: hidden;
        }

        .side-part>section {
            display: flex;
            flex-direction: column;
        }

        .side-part>section:nth-of-type(1) {
            margin-top: 0.5rem;
            justify-content: flex-start;
        }

        .side-part>section:nth-of-type(1) span {
            display: flex;
            flex-direction: row;
            justify-content: flex-start;
            align-items: center;
            font-size: .95rem;
            column-gap: .3rem;
        }

        .side-part>section:nth-of-type(1) span>i {
            width: 9%;
        }

        .side-part>section:nth-of-type(2) {
            flex: 1;
            justify-content: space-between;
        }

        .side-part>section:nth-of-type(2)>div h3 {
            margin-bottom: .5rem;
            font-weight: bold;
        }

        .side-part>section:nth-of-type(2)>div ul {
            display: block;
            margin: 0;
            padding-left: 1.2rem;
            list-style-type: disc;
        }

        .side-part>section:nth-of-type(2)>div ul li {
            display: list-item;
            margin: .15rem 0;
            font-weight: 500;
            font-size: .78rem;
            line-height: 1.4;
        }

        #languages>ul {
            display: block;
            list-style-type: disc;
        }

        .side-part>section h3 {
            font-weight: 400;
            border-color: var(--chineseBlue55);
            font-size: .95rem;
            margin: .3rem 0;
        }


        @media print {
            body {
                background: white;
            }
        }
    </style>
</head>

<body id="body">
    <main>
        <div id="resume-wrapper">
            <!-- SIDE PART (LEFT COLUMN) -->
            <div class="side-part">
                <!-- Contact Information -->
                <section>
                    <span><i>👤</i> ${cvData.name}</span>
                    ${cvData.dateOfBirth ? `<span><i>🎂</i> ${cvData.dateOfBirth}</span>` : ""}
                    <span><i>✉️</i> ${cvData.email}</span>
                    <span><i>📞</i> ${cvData.phone}</span>
                    ${cvData.address ? `<span><i>📍</i> ${cvData.address}</span>` : ''}
                    ${cvData.linkedin ? `<span><i>💼</i> <a target="_blank" rel="noopener noreferrer" href="${cvData.linkedin}">LinkedIn</a></span>` : ''}
                </section>

                <!-- Skills and Languages -->
                <section>
                    ${(cvData.skills?.technical && cvData.skills.technical.length > 0) ? `
                    <div>
                        <h3>Skills</h3>
                        <ul>
                            ${cvData.skills.technical.map(skill => `<li>${skill}</li>`).join('')}
                        </ul>
                    </div>
                    ` : ''}

                    ${(cvData.skills?.soft && cvData.skills.soft.length > 0) ? `
                    <div>
                        <h3>Soft Skills</h3>
                        <ul>
                            ${cvData.skills.soft.map(skill => `<li>${skill}</li>`).join('')}
                        </ul>
                    </div>

                    ${(cvData.skills?.tools && cvData.skills.tools.length > 0) ? `
                    <div>
                        <h3>Tools</h3>
                        <ul>
                            ${cvData.skills.tools.map(tool => `<li>${tool}</li>`).join("")}
                        </ul>
                    </div>
                    ` : ""}
                    ` : ''}

                    ${(cvData.skills?.languages && cvData.skills.languages.length > 0) ? `
                    <div id="languages">
                        <h3>Languages</h3>
                        <ul>
                            ${cvData.skills.languages.map(lang => `<li>${lang}</li>`).join('')}
                        </ul>
                    </div>
                    ` : ''}
                </section>
            </div>

            <!-- MAIN PART (RIGHT COLUMN) -->
            <div class="main-part">
                <!-- Title / Role -->
                <section>
                    <h2>${cvData.experience.length > 0 ? cvData.experience[0].title : 'Professional'}</h2>
                    ${cvData.summary ? `<p>${cvData.summary}</p>` : ''}
                </section>

                <!-- Experience -->
                ${cvData.experience.length > 0 ? `
                <section id="xp">
                    <h3>Professional experiences</h3>
                    ${cvData.experience.map(exp => `
                        <h4>${exp.title} - ${exp.company}</h4>
                        <div>
                            <p>${exp.duration}</p>
                            ${exp.teamSize ? `<p><b>Team Size:</b> ${exp.teamSize}</p>` : ""}
                            ${exp.companyDescription ? `<p><i>${exp.companyDescription}</i></p>` : ""}
                            ${exp.responsibilities && exp.responsibilities.length > 0 ? `
                                <ul>
                                    ${exp.responsibilities.map(resp => `<li>${resp}</li>`).join('')}
                                </ul>
                            ` : ''}
                            ${exp.achievements && exp.achievements.length > 0 ? `
                                <ul>
                                    ${exp.achievements.map(ach => `<li>${ach}</li>`).join('')}
                                </ul>
                            ` : ''}
                            ${exp.subProjects && exp.subProjects.length > 0 ? `
                                <div style="margin-left: 1rem; margin-top: 0.5rem;">
                                    <p style="font-weight: 600; color: var(--chineseBlue55); margin-bottom: 0.3rem;">Sub-Projects:</p>
                                    ${exp.subProjects.map(sub => `
                                        <div style="margin-bottom: 0.5rem; padding-left: 0.5rem; border-left: 2px solid var(--chineseBlue55);">
                                            <p style="font-weight: 500;">${sub.name}${sub.role ? ` - ${sub.role}` : ''}</p>
                                            ${sub.responsibilities && sub.responsibilities.length > 0 ? `
                                                <ul style="margin: 0.2rem 0;">
                                                    ${sub.responsibilities.map(resp => `<li>${resp}</li>`).join('')}
                                                </ul>
                                            ` : ''}
                                            ${sub.techStack && sub.techStack.length > 0 ? `
                                                <small>${sub.techStack.join(', ')}</small>
                                            ` : ''}
                                        </div>
                                    `).join('')}
                                </div>
                            ` : ''}
                            ${exp.technologies && exp.technologies.length > 0 ? `
                                <small>${exp.technologies.join(', ')}</small>
                            ` : ''}
                        </div>
                    `).join('<hr style="opacity: 30%;">')}
                </section>
                ` : ''}

                <hr>

                <!-- Education -->
                ${cvData.education.length > 0 ? `
                <section id="formation">
                    <h3>Education</h3>
                    ${cvData.education.map(edu => `
                        <h4>${edu.school}</h4>
                        <div>
                            <p>${edu.year}</p>
                            <h4>${edu.degree}</h4>
                            ${edu.gpa ? `<span>GPA: ${edu.gpa}</span>` : ''}
                            ${edu.location ? `<span>📍 ${edu.location}</span>` : ""}
                            ${edu.honors ? `<p><i>🏆 ${edu.honors}</i></p>` : ""}
                        </div>
                    `).join('')}
                </section>
                <hr>
                ` : ''}

                <!-- Projects -->
                ${cvData.projects && cvData.projects.length > 0 ? `
                <section>
                    <h3>Projects</h3>
                    ${cvData.projects.map(project => `
                        <section>
                            <h4>${project.name}</h4>
                            <p>${project.description}</p>
                            ${project.techStack && project.techStack.length > 0 ? `
                                <small>${project.techStack.join(', ')}</small>
                            ` : ''}
                            ${project.link ? `
                                <nav>
                                    <ul>
                                        <li>
                                            <a target="_blank" rel="noopener noreferrer" class="custom-link" href="${project.link}">GitHub</a>
                                        </li>
                                    </ul>
                                </nav>
                            ` : ''}
                        </section>
                    `).join('')}
                </section>

                <!-- Certifications -->
                ${cvData.certifications && cvData.certifications.length > 0 ? `
                <section>
                    <h3>Certifications</h3>
                    ${cvData.certifications.map(cert => `
                        <div>
                            <h4>${cert.name}</h4>
                            <p>${cert.issuer} - ${cert.date}</p>
                            ${cert.link ? `<a href="${cert.link}" target="_blank" class="custom-link">View Certificate</a>` : ''}
                        </div>
                    `).join('')}
                </section>
                <hr>
                ` : ''}

                <!-- Awards -->
                ${cvData.awards && cvData.awards.length > 0 ? `
                <section>
                    <h3>Awards</h3>
                    ${cvData.awards.map(award => `
                        <div>
                            <h4>${award.name}</h4>
                            <p>${award.issuer} - ${award.date}</p>
                        </div>
                    `).join('')}
                </section>
                <hr>
                ` : ''}

                <!-- Publications -->
                ${cvData.publications && cvData.publications.length > 0 ? `
                <section>
                    <h3>Publications</h3>
                    ${cvData.publications.map(pub => `
                        <div>
                            <h4>${pub.title}</h4>
                            <p>${pub.journal} - ${pub.date}</p>
                            <p><i>Authors: ${pub.authors}</i></p>
                        </div>
                    `).join('')}
                </section>
                <hr>
                ` : ''}

                <!-- Volunteer Experience -->
                ${cvData.volunteer && cvData.volunteer.length > 0 ? `
                <section>
                    <h3>Volunteer Experience</h3>
                    ${cvData.volunteer.map(vol => `
                        <div>
                            <h4>${vol.role} - ${vol.organization}</h4>
                            <p>${vol.duration}</p>
                            <p>${vol.description}</p>
                        </div>
                    `).join('')}
                </section>
                ` : ''}
                ` : ''}
            </div>
        </div>
    </main>
</body>
</html>`;

    return template;
  }
}
