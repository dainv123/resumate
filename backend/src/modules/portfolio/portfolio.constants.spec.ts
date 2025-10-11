import { PortfolioTemplate } from './dto/portfolio.dto';
import { getTemplateConfig, getAllTemplateConfigs, TEMPLATE_CONFIGS } from './portfolio.constants';

describe('Portfolio Constants', () => {
  describe('TEMPLATE_CONFIGS', () => {
    it('should have configurations for all template types', () => {
      const templateTypes = Object.values(PortfolioTemplate);
      
      templateTypes.forEach((template) => {
        expect(TEMPLATE_CONFIGS[template]).toBeDefined();
        expect(TEMPLATE_CONFIGS[template].id).toBe(template);
      });
    });

    it('should have valid section configurations for each template', () => {
      Object.values(TEMPLATE_CONFIGS).forEach((config) => {
        // Verify sections object exists and has all required fields
        expect(config.sections).toBeDefined();
        expect(typeof config.sections.hero).toBe('boolean');
        expect(typeof config.sections.about).toBe('boolean');
        expect(typeof config.sections.skills).toBe('boolean');
        expect(typeof config.sections.experience).toBe('boolean');
        expect(typeof config.sections.education).toBe('boolean');
        expect(typeof config.sections.projects).toBe('boolean');
        expect(typeof config.sections.certifications).toBe('boolean');
        expect(typeof config.sections.awards).toBe('boolean');
        expect(typeof config.sections.contact).toBe('boolean');
      });
    });

    it('should have required metadata for each template', () => {
      Object.values(TEMPLATE_CONFIGS).forEach((config) => {
        expect(config.name).toBeDefined();
        expect(config.name.length).toBeGreaterThan(0);
        expect(config.description).toBeDefined();
        expect(config.description.length).toBeGreaterThan(0);
        expect(typeof config.allowCustomization).toBe('boolean');
      });
    });
  });

  describe('Template Specific Configurations', () => {
    it('BASIC template should have expected sections', () => {
      const config = TEMPLATE_CONFIGS[PortfolioTemplate.BASIC];
      
      expect(config.sections.hero).toBe(true);
      expect(config.sections.about).toBe(true);
      expect(config.sections.skills).toBe(true);
      expect(config.sections.experience).toBe(true);
      expect(config.sections.education).toBe(true);
      expect(config.sections.projects).toBe(true);
      expect(config.sections.contact).toBe(true);
      expect(config.allowCustomization).toBe(true);
    });

    it('CREATIVE template should be minimal (no experience/education by default)', () => {
      const config = TEMPLATE_CONFIGS[PortfolioTemplate.CREATIVE];
      
      expect(config.sections.hero).toBe(true);
      expect(config.sections.skills).toBe(true);
      expect(config.sections.projects).toBe(true);
      expect(config.sections.experience).toBe(false);
      expect(config.sections.education).toBe(false);
      expect(config.allowCustomization).toBe(true);
    });

    it('MUHAMMAD_ISMAIL template should be comprehensive', () => {
      const config = TEMPLATE_CONFIGS[PortfolioTemplate.MUHAMMAD_ISMAIL];
      
      expect(config.sections.hero).toBe(true);
      expect(config.sections.about).toBe(true);
      expect(config.sections.skills).toBe(true);
      expect(config.sections.experience).toBe(true);
      expect(config.sections.education).toBe(true);
      expect(config.sections.projects).toBe(true);
      expect(config.sections.certifications).toBe(true);
      expect(config.sections.awards).toBe(true);
      expect(config.allowCustomization).toBe(false);
    });

    it('MODERN template should have professional sections', () => {
      const config = TEMPLATE_CONFIGS[PortfolioTemplate.MODERN];
      
      expect(config.sections.hero).toBe(true);
      expect(config.sections.about).toBe(true);
      expect(config.sections.skills).toBe(true);
      expect(config.sections.experience).toBe(true);
      expect(config.sections.education).toBe(true);
      expect(config.sections.projects).toBe(true);
      expect(config.allowCustomization).toBe(true);
    });
  });

  describe('getTemplateConfig', () => {
    it('should return correct config for BASIC template', () => {
      const config = getTemplateConfig(PortfolioTemplate.BASIC);
      
      expect(config).toBeDefined();
      expect(config.id).toBe(PortfolioTemplate.BASIC);
      expect(config.name).toBe('Basic');
    });

    it('should return correct config for CREATIVE template', () => {
      const config = getTemplateConfig(PortfolioTemplate.CREATIVE);
      
      expect(config).toBeDefined();
      expect(config.id).toBe(PortfolioTemplate.CREATIVE);
      expect(config.name).toBe('Creative');
    });

    it('should return correct config for MODERN template', () => {
      const config = getTemplateConfig(PortfolioTemplate.MODERN);
      
      expect(config).toBeDefined();
      expect(config.id).toBe(PortfolioTemplate.MODERN);
      expect(config.name).toBe('Modern');
    });

    it('should return correct config for MUHAMMAD_ISMAIL template', () => {
      const config = getTemplateConfig(PortfolioTemplate.MUHAMMAD_ISMAIL);
      
      expect(config).toBeDefined();
      expect(config.id).toBe(PortfolioTemplate.MUHAMMAD_ISMAIL);
      expect(config.name).toBe('Developer Pro');
    });
  });

  describe('getAllTemplateConfigs', () => {
    it('should return all template configurations', () => {
      const configs = getAllTemplateConfigs();
      
      expect(configs).toBeInstanceOf(Array);
      expect(configs.length).toBe(4); // We have 4 templates
    });

    it('should return configs with all required fields', () => {
      const configs = getAllTemplateConfigs();
      
      configs.forEach((config) => {
        expect(config.id).toBeDefined();
        expect(config.name).toBeDefined();
        expect(config.description).toBeDefined();
        expect(config.sections).toBeDefined();
        expect(typeof config.allowCustomization).toBe('boolean');
      });
    });

    it('should include all template types', () => {
      const configs = getAllTemplateConfigs();
      const templateIds = configs.map((c) => c.id);
      
      expect(templateIds).toContain(PortfolioTemplate.BASIC);
      expect(templateIds).toContain(PortfolioTemplate.MODERN);
      expect(templateIds).toContain(PortfolioTemplate.CREATIVE);
      expect(templateIds).toContain(PortfolioTemplate.MUHAMMAD_ISMAIL);
    });
  });

  describe('Template Customization', () => {
    it('should allow customization for BASIC, MODERN, CREATIVE templates', () => {
      expect(TEMPLATE_CONFIGS[PortfolioTemplate.BASIC].allowCustomization).toBe(true);
      expect(TEMPLATE_CONFIGS[PortfolioTemplate.MODERN].allowCustomization).toBe(true);
      expect(TEMPLATE_CONFIGS[PortfolioTemplate.CREATIVE].allowCustomization).toBe(true);
    });

    it('should not allow customization for MUHAMMAD_ISMAIL template', () => {
      expect(TEMPLATE_CONFIGS[PortfolioTemplate.MUHAMMAD_ISMAIL].allowCustomization).toBe(false);
    });
  });

  describe('Sections Logic', () => {
    it('should have at least hero and projects sections enabled for all templates', () => {
      Object.values(TEMPLATE_CONFIGS).forEach((config) => {
        expect(config.sections.hero).toBe(true);
        expect(config.sections.projects).toBe(true);
      });
    });

    it('should have contact section enabled for all templates', () => {
      Object.values(TEMPLATE_CONFIGS).forEach((config) => {
        expect(config.sections.contact).toBe(true);
      });
    });

    it('MUHAMMAD_ISMAIL should be the only template with certifications and awards enabled by default', () => {
      Object.values(PortfolioTemplate).forEach((template) => {
        const config = TEMPLATE_CONFIGS[template];
        
        if (template === PortfolioTemplate.MUHAMMAD_ISMAIL) {
          expect(config.sections.certifications).toBe(true);
          expect(config.sections.awards).toBe(true);
        } else {
          expect(config.sections.certifications).toBe(false);
          expect(config.sections.awards).toBe(false);
        }
      });
    });
  });
});

