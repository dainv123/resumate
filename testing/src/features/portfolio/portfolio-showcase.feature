Feature: Portfolio Showcase
  As a creative professional
  I want to showcase my work portfolio
  So that employers can see my creative capabilities

  Background:
    Given I am logged into the Resumate application

  @smoke @critical
  Scenario: Create portfolio showcase
    Given I am on the portfolio page
    When I click "Create Portfolio"
    And I upload my project images
    And I add project descriptions
    Then my portfolio should be published
    And I should receive a shareable link

  @functionality
  Scenario: Add multiple project types
    Given I have a portfolio
    When I add different types of projects
    And I categorize them appropriately
    Then all projects should display correctly
    And visitors should be able to filter by category

  @mobile
  Scenario: Portfolio mobile experience
    Given I am viewing a portfolio on mobile
    Then all images should be responsive
    And navigation should work with touch gestures
    And the layout should adapt to small screens
