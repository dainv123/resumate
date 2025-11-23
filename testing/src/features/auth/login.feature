Feature: User Authentication
  As a user of Resumate
  I want to be able to login and register
  So that I can access my CV management features

  Background:
    Given I am on the Resumate application

  @smoke @critical
  Scenario: Successful login with valid credentials
    Given I am on the login page
    When I enter valid email and password
    And I click the login button
    Then I should be redirected to the dashboard
    And I should see my account information

  @smoke @critical
  Scenario: Navigate to registration from login page
    Given I am on the login page
    When I click the "Register" link
    Then I should be redirected to the registration page

  @smoke
  Scenario: Navigate to login from registration page
    Given I am on the registration page
    When I click the "Login" link
    Then I should be redirected to the login page

  @validation
  Scenario: Login form validation - empty fields
    Given I am on the login page
    When I click the login button without entering credentials
    Then I should see validation errors for required fields

  @validation
  Scenario: Login form validation - invalid email
    Given I am on the login page
    When I enter an invalid email format
    And I enter a valid password
    And I click the login button
    Then I should see an email validation error

  @validation
  Scenario: Login form validation - wrong password
    Given I am on the login page
    When I enter a valid email
    And I enter an incorrect password
    And I click the login button
    Then I should see an authentication error message

  @ui
  Scenario: Login page UI elements
    Given I am on the login page
    Then I should see the login form with email and password fields
    And I should see the login button
    And I should see the "Register" link
    And I should see the "Forgot Password" link
    And I should see the Google login option

  @ui
  Scenario: Registration page UI elements
    Given I am on the registration page
    Then I should see the registration form
    And I should see name, email, password, and confirm password fields
    And I should see the terms and conditions checkbox
    And I should see the registration button
    And I should see the "Login" link
    And I should see the Google registration option

  @accessibility
  Scenario: Keyboard navigation on login page
    Given I am on the login page
    When I use Tab key to navigate through form fields
    Then all form elements should be accessible via keyboard
    And I should be able to submit the form with Enter key

  @mobile
  Scenario: Login page on mobile device
    Given I am on the login page using a mobile device
    Then the login form should be properly sized for mobile
    And all elements should be touch-friendly
    And the form should scroll properly on small screens
