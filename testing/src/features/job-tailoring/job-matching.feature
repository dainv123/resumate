Feature: Job Tailoring and Matching
  As a job seeker
  I want to tailor my CV for specific job applications
  So that I can increase my chances of getting hired

  Background:
    Given I am logged into the Resumate application
    And I have an existing CV

  @smoke @critical
  Scenario: Tailor CV for specific job
    Given I have a job description
    When I upload the job description
    And I click "Tailor My CV"
    Then my CV should be optimized for the job
    And I should see highlighted keyword matches
    And I should be able to download the tailored CV

  @performance
  Scenario: Bulk CV tailoring
    Given I have multiple job descriptions
    When I upload multiple job descriptions
    And I select bulk tailoring
    Then all CVs should be processed efficiently
    And I should receive an email notification when complete

  @ui
  Scenario: Keyword matching visualization
    Given I have tailored a CV for a job
    Then I should see keyword match percentages
    And I should see color-coded highlighting
    And I should see suggestions for missing keywords
