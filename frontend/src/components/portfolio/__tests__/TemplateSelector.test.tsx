import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import TemplateSelector from "../TemplateSelector";

describe("TemplateSelector", () => {
  const mockTemplates = [
    {
      id: "basic",
      name: "Basic",
      description: "Simple and professional",
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
    },
    {
      id: "creative",
      name: "Creative",
      description: "Eye-catching design",
      sections: {
        hero: true,
        about: false,
        skills: true,
        experience: false,
        education: false,
        projects: true,
        certifications: false,
        awards: false,
        contact: true,
      },
      allowCustomization: true,
    },
  ];

  const mockOnSelectTemplate = jest.fn();

  beforeEach(() => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ templates: mockTemplates }),
      })
    ) as jest.Mock;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should render loading state initially", () => {
    render(<TemplateSelector onSelectTemplate={mockOnSelectTemplate} />);

    expect(screen.getByRole("status", { hidden: true })).toBeInTheDocument();
  });

  it("should render templates after fetching", async () => {
    render(<TemplateSelector onSelectTemplate={mockOnSelectTemplate} />);

    await waitFor(() => {
      expect(screen.getByText("Basic")).toBeInTheDocument();
      expect(screen.getByText("Creative")).toBeInTheDocument();
    });
  });

  it("should display template descriptions", async () => {
    render(<TemplateSelector onSelectTemplate={mockOnSelectTemplate} />);

    await waitFor(() => {
      expect(screen.getByText("Simple and professional")).toBeInTheDocument();
      expect(screen.getByText("Eye-catching design")).toBeInTheDocument();
    });
  });

  it("should display included sections for each template", async () => {
    render(<TemplateSelector onSelectTemplate={mockOnSelectTemplate} />);

    await waitFor(() => {
      expect(screen.getByText("Hero")).toBeInTheDocument();
      expect(screen.getByText("Skills")).toBeInTheDocument();
      expect(screen.getByText("Projects")).toBeInTheDocument();
    });
  });

  it("should call onSelectTemplate when template is clicked", async () => {
    render(<TemplateSelector onSelectTemplate={mockOnSelectTemplate} />);

    await waitFor(() => {
      expect(screen.getByText("Basic")).toBeInTheDocument();
    });

    const basicTemplate = screen
      .getByText("Basic")
      .closest('div[role="button"]');
    fireEvent.click(basicTemplate!);

    expect(mockOnSelectTemplate).toHaveBeenCalledWith(
      "basic",
      mockTemplates[0]
    );
  });

  it("should highlight selected template", async () => {
    render(
      <TemplateSelector
        selectedTemplate="basic"
        onSelectTemplate={mockOnSelectTemplate}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("Selected")).toBeInTheDocument();
    });
  });

  it("should show customization badge for customizable templates", async () => {
    render(<TemplateSelector onSelectTemplate={mockOnSelectTemplate} />);

    await waitFor(() => {
      const badges = screen.getAllByText("Customizable sections");
      expect(badges).toHaveLength(2); // Both templates are customizable
    });
  });

  it("should handle fetch error gracefully", async () => {
    global.fetch = jest.fn(() => Promise.reject("API error")) as jest.Mock;

    const consoleSpy = jest.spyOn(console, "error").mockImplementation();

    render(<TemplateSelector onSelectTemplate={mockOnSelectTemplate} />);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        "Failed to fetch templates:",
        "API error"
      );
    });

    consoleSpy.mockRestore();
  });

  it("should show correct sections for Basic template", async () => {
    render(<TemplateSelector onSelectTemplate={mockOnSelectTemplate} />);

    await waitFor(() => {
      const basicCard = screen.getByText("Basic").closest("div");
      expect(basicCard).toHaveTextContent("Hero");
      expect(basicCard).toHaveTextContent("About");
      expect(basicCard).toHaveTextContent("Skills");
      expect(basicCard).toHaveTextContent("Experience");
      expect(basicCard).toHaveTextContent("Education");
      expect(basicCard).toHaveTextContent("Projects");
      expect(basicCard).toHaveTextContent("Contact");
    });
  });

  it("should show correct sections for Creative template", async () => {
    render(<TemplateSelector onSelectTemplate={mockOnSelectTemplate} />);

    await waitFor(() => {
      const cards = screen.getAllByText("Creative");
      const creativeCard = cards[0].closest("div");

      expect(creativeCard).toHaveTextContent("Hero");
      expect(creativeCard).toHaveTextContent("Skills");
      expect(creativeCard).toHaveTextContent("Projects");
      expect(creativeCard).toHaveTextContent("Contact");

      // Should not show disabled sections
      expect(creativeCard).not.toHaveTextContent("About");
      expect(creativeCard).not.toHaveTextContent("Experience");
      expect(creativeCard).not.toHaveTextContent("Education");
    });
  });
});
