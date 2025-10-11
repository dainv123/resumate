import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import SectionCustomizer from "../SectionCustomizer";
import type { TemplateConfig } from "../TemplateSelector";

describe("SectionCustomizer", () => {
  const mockTemplateConfig: TemplateConfig = {
    id: "modern",
    name: "Modern",
    description: "Modern professional template",
    sections: {
      hero: true,
      about: true,
      skills: true,
      experience: true,
      education: true,
      projects: true,
      certifications: false,
      awards: false,
      contact: true,
    },
    allowCustomization: true,
  };

  const nonCustomizableTemplate: TemplateConfig = {
    ...mockTemplateConfig,
    id: "muhammad_ismail",
    name: "Muhammad Ismail",
    allowCustomization: false,
  };

  const mockOnCustomSectionsChange = jest.fn();

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should render section customization UI", () => {
    render(
      <SectionCustomizer
        templateConfig={mockTemplateConfig}
        onCustomSectionsChange={mockOnCustomSectionsChange}
      />
    );

    expect(screen.getByText("Customize Sections")).toBeInTheDocument();
  });

  it("should show all section options", () => {
    render(
      <SectionCustomizer
        templateConfig={mockTemplateConfig}
        onCustomSectionsChange={mockOnCustomSectionsChange}
      />
    );

    expect(screen.getByText("Hero Section")).toBeInTheDocument();
    expect(screen.getByText("About Me")).toBeInTheDocument();
    expect(screen.getByText("Skills")).toBeInTheDocument();
    expect(screen.getByText("Work Experience")).toBeInTheDocument();
    expect(screen.getByText("Education")).toBeInTheDocument();
    expect(screen.getByText("Projects")).toBeInTheDocument();
    expect(screen.getByText("Certifications")).toBeInTheDocument();
    expect(screen.getByText("Awards")).toBeInTheDocument();
    expect(screen.getByText("Contact Links")).toBeInTheDocument();
  });

  it("should display correct initial state based on template config", () => {
    render(
      <SectionCustomizer
        templateConfig={mockTemplateConfig}
        onCustomSectionsChange={mockOnCustomSectionsChange}
      />
    );

    // Enabled sections should have active styling
    const heroSection = screen.getByText("Hero Section").closest("div");
    expect(heroSection).toHaveClass("border-blue-500");

    // Disabled sections should have inactive styling
    const certificationsSection = screen
      .getByText("Certifications")
      .closest("div");
    expect(certificationsSection).toHaveClass("opacity-60");
  });

  it("should toggle section when clicked", () => {
    render(
      <SectionCustomizer
        templateConfig={mockTemplateConfig}
        onCustomSectionsChange={mockOnCustomSectionsChange}
      />
    );

    // Click on Awards section (initially disabled)
    const awardsSection = screen
      .getByText("Awards")
      .closest('div[role="button"]');
    fireEvent.click(awardsSection!);

    expect(mockOnCustomSectionsChange).toHaveBeenCalledWith({ awards: true });
  });

  it("should toggle section off when already enabled", () => {
    render(
      <SectionCustomizer
        templateConfig={mockTemplateConfig}
        onCustomSectionsChange={mockOnCustomSectionsChange}
      />
    );

    // Click on Skills section (initially enabled)
    const skillsSection = screen
      .getByText("Skills")
      .closest('div[role="button"]');
    fireEvent.click(skillsSection!);

    expect(mockOnCustomSectionsChange).toHaveBeenCalledWith({ skills: false });
  });

  it('should show "Added" badge for custom-enabled sections', () => {
    render(
      <SectionCustomizer
        templateConfig={mockTemplateConfig}
        customSections={{ certifications: true }}
        onCustomSectionsChange={mockOnCustomSectionsChange}
      />
    );

    // Certifications is not in template default but enabled by user
    const badges = screen.getAllByText("Added");
    expect(badges.length).toBeGreaterThan(0);
  });

  it("should not show customization UI for non-customizable templates", () => {
    render(
      <SectionCustomizer
        templateConfig={nonCustomizableTemplate}
        onCustomSectionsChange={mockOnCustomSectionsChange}
      />
    );

    expect(screen.getByText("Fixed Template")).toBeInTheDocument();
    expect(screen.getByText(/cannot be customized/)).toBeInTheDocument();
    expect(screen.queryByText("Customize Sections")).not.toBeInTheDocument();
  });

  it("should merge custom sections with template defaults", () => {
    const customSections = {
      certifications: true,
      education: false,
    };

    render(
      <SectionCustomizer
        templateConfig={mockTemplateConfig}
        customSections={customSections}
        onCustomSectionsChange={mockOnCustomSectionsChange}
      />
    );

    // Certifications should be enabled (custom override)
    const certificationsSection = screen
      .getByText("Certifications")
      .closest("div");
    expect(certificationsSection).toHaveClass("border-blue-500");

    // Education should be disabled (custom override)
    const educationSection = screen.getByText("Education").closest("div");
    expect(educationSection).toHaveClass("opacity-60");
  });

  it("should show tip about data-dependent sections", () => {
    render(
      <SectionCustomizer
        templateConfig={mockTemplateConfig}
        onCustomSectionsChange={mockOnCustomSectionsChange}
      />
    );

    expect(
      screen.getByText(/only appear if you have data/)
    ).toBeInTheDocument();
  });

  it("should have toggle switches for each section", () => {
    render(
      <SectionCustomizer
        templateConfig={mockTemplateConfig}
        onCustomSectionsChange={mockOnCustomSectionsChange}
      />
    );

    // Count toggle switches (rounded divs with transition)
    const toggles = document.querySelectorAll(
      "div.rounded-full.transition-colors"
    );
    expect(toggles.length).toBe(9); // 9 sections
  });

  it("should update UI when customSections prop changes", () => {
    const { rerender } = render(
      <SectionCustomizer
        templateConfig={mockTemplateConfig}
        customSections={{}}
        onCustomSectionsChange={mockOnCustomSectionsChange}
      />
    );

    // Initially awards is disabled
    let awardsSection = screen.getByText("Awards").closest("div");
    expect(awardsSection).toHaveClass("opacity-60");

    // Update customSections to enable awards
    rerender(
      <SectionCustomizer
        templateConfig={mockTemplateConfig}
        customSections={{ awards: true }}
        onCustomSectionsChange={mockOnCustomSectionsChange}
      />
    );

    // Awards should now be enabled
    awardsSection = screen.getByText("Awards").closest("div");
    expect(awardsSection).toHaveClass("border-blue-500");
  });

  it("should show icons for each section type", () => {
    render(
      <SectionCustomizer
        templateConfig={mockTemplateConfig}
        onCustomSectionsChange={mockOnCustomSectionsChange}
      />
    );

    // Check for section icons (emojis)
    expect(screen.getByText("🎯")).toBeInTheDocument(); // Hero
    expect(screen.getByText("📝")).toBeInTheDocument(); // About
    expect(screen.getByText("💡")).toBeInTheDocument(); // Skills
    expect(screen.getByText("💼")).toBeInTheDocument(); // Experience
    expect(screen.getByText("🎓")).toBeInTheDocument(); // Education
    expect(screen.getByText("🚀")).toBeInTheDocument(); // Projects
    expect(screen.getByText("📜")).toBeInTheDocument(); // Certifications
    expect(screen.getByText("🏆")).toBeInTheDocument(); // Awards
    expect(screen.getByText("📧")).toBeInTheDocument(); // Contact
  });
});
