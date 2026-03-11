import { test, expect } from '@playwright/test';

/**
 * E2E Tests - Authentication Flow
 * Test complete user authentication workflows
 */

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the login page before each test
    await page.goto('/login');
  });

  test('should display login form', async ({ page }) => {
    // Check if login form is visible
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  test('should show validation errors on invalid credentials', async ({
    page,
  }) => {
    // Try to submit without entering credentials
    await page.getByRole('button', { name: /sign in/i }).click();

    // Check for error messages
    await expect(page.getByText(/email is required/i)).toBeVisible();
    await expect(page.getByText(/password is required/i)).toBeVisible();
  });

  test('should display error for invalid email format', async ({ page }) => {
    // Enter invalid email
    await page.getByLabel(/email/i).fill('invalid-email');
    await page.getByLabel(/password/i).fill('password123');

    // Submit form
    await page.getByRole('button', { name: /sign in/i }).click();

    // Check for error
    await expect(page.getByText(/invalid email/i)).toBeVisible();
  });

  test('should successfully login with valid credentials', async ({
    page,
  }) => {
    // Assume a test user exists with these credentials
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/password/i).fill('password123');

    // Submit form
    await page.getByRole('button', { name: /sign in/i }).click();

    // Wait for navigation to dashboard
    await page.waitForURL('/dashboard');
    await expect(page.url()).toContain('/dashboard');
  });

  test('should have signup link', async ({ page }) => {
    // Check for signup link
    const signupLink = page.getByRole('link', { name: /sign up/i });
    await expect(signupLink).toBeVisible();

    // Click and verify navigation
    await signupLink.click();
    await expect(page.url()).toContain('/signup');
  });

  test('should navigate to forgot password page', async ({ page }) => {
    // Check for forgot password link
    const forgotLink = page.getByRole('link', { name: /forgot password/i });
    await expect(forgotLink).toBeVisible();

    // Click and verify navigation
    await forgotLink.click();
    await expect(page.url()).toContain('/forgot-password');
  });
});

test.describe('Login Page Accessibility', () => {
  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/login');

    // Tab through form elements
    await page.keyboard.press('Tab');
    await expect(page.getByLabel(/email/i)).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(page.getByLabel(/password/i)).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: /sign in/i })).toBeFocused();
  });

  test('should have proper ARIA labels', async ({ page }) => {
    await page.goto('/login');

    const emailInput = page.getByLabel(/email/i);
    const passwordInput = page.getByLabel(/password/i);

    await expect(emailInput).toHaveAttribute('type', 'email');
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });
});
