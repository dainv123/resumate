Feature: CV Creation and Management
  As a user of Resumate
  I want to create and manage my CV
  So that I can present my professional profile effectively

  Background:
    Given I am logged into the Resumate application

  @smoke @critical
  Scenario: Create a new CV from template
    Given I am on the CV dashboard
    When I click "Create New CV"
    And I select a professional template
    And I fill in my personal information
    Then I should see the CV preview
    And I should be able to save the CV

  @functionality
  Scenario: Edit existing CV
    Given I have an existing CV
    When I open the CV editor
    And I update my work experience
    And I add new skills
    Then the changes should be saved
    And I should see the updated CV preview

  @ui
  Scenario: CV template selection
    Given I am on the CV creation page
    Then I should see multiple template options
    And each template should have a preview
    And I should be able to filter templates by category
