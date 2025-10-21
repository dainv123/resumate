import { MigrationInterface, QueryRunner } from "typeorm";

export class MigrateCVDataToStandard1704000000000 implements MigrationInterface {
    name = 'MigrateCVDataToStandard1704000000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Get all CVs with old data structure
        const cvs = await queryRunner.query(`
            SELECT id, "parsedData" FROM cvs 
            WHERE "parsedData" IS NOT NULL
        `);

        for (const cv of cvs) {
            const oldData = cv.parsedData;
            
            // Skip if already in new format (has contact object)
            if (oldData.contact && typeof oldData.contact === 'object') {
                continue;
            }

            // Transform old structure to new structure
            const newData = this.transformToStandardStructure(oldData);
            
            // Update the CV with new structure
            await queryRunner.query(`
                UPDATE cvs 
                SET "parsedData" = $1 
                WHERE id = $2
            `, [JSON.stringify(newData), cv.id]);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Get all CVs with new data structure
        const cvs = await queryRunner.query(`
            SELECT id, "parsedData" FROM cvs 
            WHERE "parsedData" IS NOT NULL 
            AND "parsedData"->>'contact' IS NOT NULL
        `);

        for (const cv of cvs) {
            const newData = cv.parsedData;
            
            // Transform new structure back to old structure
            const oldData = this.transformToLegacyStructure(newData);
            
            // Update the CV with old structure
            await queryRunner.query(`
                UPDATE cvs 
                SET "parsedData" = $1 
                WHERE id = $2
            `, [JSON.stringify(oldData), cv.id]);
        }
    }

    private transformToStandardStructure(oldData: any): any {
        return {
            // Metadata
            id: oldData.id,
            version: oldData.version || '1.0',
            createdAt: oldData.createdAt || new Date().toISOString(),
            updatedAt: oldData.updatedAt || new Date().toISOString(),
            lastModified: oldData.lastModified || new Date().toISOString(),

            // Contact information (grouped)
            contact: {
                name: oldData.name || '',
                email: oldData.email || '',
                phone: oldData.phone || '',
                address: oldData.address || '',
                linkedin: oldData.linkedin || '',
                github: oldData.github || '',
                website: oldData.website || '',
                location: oldData.location || ''
            },

            // Summary
            summary: oldData.summary || '',

            // Core sections with normalized structure
            experience: this.normalizeExperience(oldData.experience || []),
            education: this.normalizeEducation(oldData.education || []),
            skills: this.normalizeSkills(oldData.skills || {}),
            projects: this.normalizeProjects(oldData.projects || []),

            // Optional sections
            certifications: this.normalizeCertifications(oldData.certifications || []),
            awards: this.normalizeAwards(oldData.awards || []),
            publications: this.normalizePublications(oldData.publications || []),
            volunteer: this.normalizeVolunteer(oldData.volunteer || []),
            languages: this.normalizeLanguages(oldData.languages || []),

            // Template configuration
            template: oldData.template || this.getDefaultTemplateConfig()
        };
    }

    private transformToLegacyStructure(newData: any): any {
        return {
            // Flatten contact information
            name: newData.contact?.name || '',
            email: newData.contact?.email || '',
            phone: newData.contact?.phone || '',
            address: newData.contact?.address || '',
            linkedin: newData.contact?.linkedin || '',
            github: newData.contact?.github || '',
            website: newData.contact?.website || '',
            location: newData.contact?.location || '',

            // Other fields
            summary: newData.summary || '',
            education: this.denormalizeEducation(newData.education || []),
            experience: this.denormalizeExperience(newData.experience || []),
            skills: this.denormalizeSkills(newData.skills || {}),
            projects: this.denormalizeProjects(newData.projects || []),
            certifications: this.denormalizeCertifications(newData.certifications || []),
            awards: this.denormalizeAwards(newData.awards || []),
            publications: this.denormalizePublications(newData.publications || []),
            volunteer: this.denormalizeVolunteer(newData.volunteer || [])
        };
    }

    // Normalization methods
    private normalizeExperience(experience: any[]): any[] {
        return experience.map((exp, index) => ({
            id: exp.id || `exp_${index}`,
            title: exp.title || '',
            company: exp.company || '',
            location: exp.location || '',
            startDate: this.extractStartDate(exp.duration || exp.startDate || ''),
            endDate: this.extractEndDate(exp.duration || exp.endDate || ''),
            current: this.isCurrent(exp.duration || exp.endDate || ''),
            description: exp.description || '',
            responsibilities: exp.responsibilities || [],
            achievements: exp.achievements || [],
            technologies: exp.technologies || [],
            teamSize: exp.teamSize ? parseInt(exp.teamSize) : undefined,
            companyDescription: exp.companyDescription || ''
        }));
    }

    private normalizeEducation(education: any[]): any[] {
        return education.map((edu, index) => ({
            id: edu.id || `edu_${index}`,
            institution: edu.school || edu.institution || '',
            degree: edu.degree || '',
            field: edu.field || '',
            startDate: this.extractStartDate(edu.year || edu.startDate || ''),
            endDate: this.extractEndDate(edu.year || edu.endDate || ''),
            gpa: edu.gpa || '',
            description: edu.description || '',
            location: edu.location || ''
        }));
    }

    private normalizeSkills(skills: any): any {
        return {
            technical: skills.technical || [],
            tools: skills.tools || [],
            languages: skills.languages || [],
            soft: skills.soft || []
        };
    }

    private normalizeProjects(projects: any[]): any[] {
        return projects.map((project, index) => ({
            id: project.id || `proj_${index}`,
            name: project.name || '',
            description: project.description || '',
            startDate: this.extractStartDate(project.duration || project.startDate || ''),
            endDate: this.extractEndDate(project.duration || project.endDate || ''),
            technologies: project.techStack || project.technologies || [],
            role: project.role || '',
            teamSize: project.teamSize ? parseInt(project.teamSize) : undefined,
            results: Array.isArray(project.results) ? project.results : (project.results ? [project.results] : []),
            link: project.link || '',
            repository: project.repository || '',
            duration: project.duration || ''
        }));
    }

    private normalizeCertifications(certifications: any[]): any[] {
        return certifications.map((cert, index) => ({
            id: cert.id || `cert_${index}`,
            name: cert.name || '',
            issuer: cert.issuer || '',
            date: cert.date || '',
            expirationDate: cert.expirationDate || '',
            credentialId: cert.credentialId || '',
            credentialUrl: cert.link || cert.credentialUrl || '',
            description: cert.description || ''
        }));
    }

    private normalizeAwards(awards: any[]): any[] {
        return awards.map((award, index) => ({
            id: award.id || `award_${index}`,
            title: award.name || award.title || '',
            issuer: award.issuer || '',
            date: award.date || '',
            description: award.description || '',
            category: award.category || ''
        }));
    }

    private normalizePublications(publications: any[]): any[] {
        return publications.map((pub, index) => ({
            id: pub.id || `pub_${index}`,
            title: pub.title || '',
            authors: Array.isArray(pub.authors) ? pub.authors : (pub.authors ? [pub.authors] : []),
            publicationDate: pub.date || pub.publicationDate || '',
            journal: pub.journal || '',
            conference: pub.conference || '',
            doi: pub.doi || '',
            url: pub.url || '',
            description: pub.description || ''
        }));
    }

    private normalizeVolunteer(volunteer: any[]): any[] {
        return volunteer.map((vol, index) => ({
            id: vol.id || `vol_${index}`,
            organization: vol.organization || '',
            role: vol.role || '',
            startDate: this.extractStartDate(vol.duration || vol.startDate || ''),
            endDate: this.extractEndDate(vol.duration || vol.endDate || ''),
            current: this.isCurrent(vol.duration || vol.endDate || ''),
            description: vol.description || '',
            responsibilities: vol.responsibilities || [],
            achievements: vol.achievements || [],
            location: vol.location || ''
        }));
    }

    private normalizeLanguages(languages: any[]): any[] {
        return languages.map((lang, index) => ({
            name: lang.name || lang.language || '',
            proficiency: lang.proficiency || 'Intermediate',
            certifications: lang.certifications || []
        }));
    }

    // Denormalization methods (for rollback)
    private denormalizeExperience(experience: any[]): any[] {
        return experience.map(exp => ({
            title: exp.title,
            company: exp.company,
            duration: this.formatDuration(exp.startDate, exp.endDate, exp.current),
            location: exp.location,
            teamSize: exp.teamSize?.toString(),
            companyDescription: exp.companyDescription,
            responsibilities: exp.responsibilities,
            achievements: exp.achievements,
            technologies: exp.technologies
        }));
    }

    private denormalizeEducation(education: any[]): any[] {
        return education.map(edu => ({
            degree: edu.degree,
            school: edu.institution,
            year: this.formatDuration(edu.startDate, edu.endDate),
            location: edu.location,
            gpa: edu.gpa,
            description: edu.description
        }));
    }

    private denormalizeSkills(skills: any): any {
        return {
            technical: skills.technical,
            soft: skills.soft,
            languages: skills.languages,
            tools: skills.tools
        };
    }

    private denormalizeProjects(projects: any[]): any[] {
        return projects.map(project => ({
            name: project.name,
            description: project.description,
            techStack: project.technologies,
            results: Array.isArray(project.results) ? project.results.join(', ') : project.results,
            link: project.link,
            duration: project.duration || this.formatDuration(project.startDate, project.endDate)
        }));
    }

    private denormalizeCertifications(certifications: any[]): any[] {
        return certifications.map(cert => ({
            name: cert.name,
            issuer: cert.issuer,
            date: cert.date,
            link: cert.credentialUrl
        }));
    }

    private denormalizeAwards(awards: any[]): any[] {
        return awards.map(award => ({
            name: award.title,
            issuer: award.issuer,
            date: award.date
        }));
    }

    private denormalizePublications(publications: any[]): any[] {
        return publications.map(pub => ({
            title: pub.title,
            journal: pub.journal,
            date: pub.publicationDate,
            authors: Array.isArray(pub.authors) ? pub.authors.join(', ') : pub.authors
        }));
    }

    private denormalizeVolunteer(volunteer: any[]): any[] {
        return volunteer.map(vol => ({
            role: vol.role,
            organization: vol.organization,
            duration: this.formatDuration(vol.startDate, vol.endDate, vol.current),
            description: vol.description
        }));
    }

    // Helper methods
    private extractStartDate(duration: string): string {
        if (!duration) return '';
        const parts = duration.split(' - ');
        return parts[0] || '';
    }

    private extractEndDate(duration: string): string {
        if (!duration) return '';
        const parts = duration.split(' - ');
        return parts[1] || '';
    }

    private isCurrent(duration: string): boolean {
        return duration.toLowerCase().includes('present') || 
               duration.toLowerCase().includes('current') ||
               duration.toLowerCase().includes('now');
    }

    private formatDuration(startDate: string, endDate: string, current?: boolean): string {
        if (current || !endDate) {
            return `${startDate} - Present`;
        }
        return `${startDate} - ${endDate}`;
    }

    private getDefaultTemplateConfig(): any {
        return {
            layout: 'single-column',
            sections: {
                contact: true,
                summary: true,
                experience: true,
                education: true,
                skills: true,
                projects: true,
                certifications: true,
                awards: true,
                publications: true,
                volunteer: true,
                languages: true
            },
            styling: {
                primaryColor: '#2c3e50',
                secondaryColor: '#34495e',
                fontFamily: 'Arial, sans-serif',
                fontSize: 'medium'
            }
        };
    }
}
