import { test, expect } from '@playwright/test';

/**
 * E2E Tests - User Navigation Flow
 * Test complete user journeys and page navigation
 */

test.describe('User Navigation Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to homepage
    await page.goto('/');
  });

  test('should navigate through main menu', async ({ page }) => {
    // Click on About link
    const aboutLink = page.getByRole('link', { name: /about/i });
    await expect(aboutLink).toBeVisible();
    await aboutLink.click();

    // Verify navigation
    await expect(page.url()).toContain('/about');
    await expect(page.getByRole('heading', { name: /about/i })).toBeVisible();
  });

  test('should display responsive menu on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Check for hamburger menu
    const mobileMenu = page.getByRole('button', { name: /menu/i });
    await expect(mobileMenu).toBeVisible();

    // Open menu
    await mobileMenu.click();

    // Check for menu items
    await expect(page.getByRole('link', { name: /home/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /about/i })).toBeVisible();
  });

  test('should display all main sections', async ({ page }) => {
    // Scroll down to see all sections
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    // Verify footer is visible
    await expect(page.locator('footer')).toBeVisible();
  });
});

test.describe('Product Browse Flow', () => {
  test('should display product list', async ({ page }) => {
    await page.goto('/products');

    // Check for product items
    const products = page.locator('[data-testid="product-card"]');
    const count = await products.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should filter products by category', async ({ page }) => {
    await page.goto('/products');

    // Select a category filter
    const categoryFilter = page.getByRole('button', { name: /electronics/i });
    await expect(categoryFilter).toBeVisible();
    await categoryFilter.click();

    // Wait for products to load
    await page.waitForLoadState('networkidle');

    // Verify filtered results
    const products = page.locator('[data-testid="product-card"]');
    const count = await products.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should display product detail page', async ({ page }) => {
    await page.goto('/products');

    // Click first product
    const firstProduct = page.locator('[data-testid="product-card"]').first();
    await firstProduct.click();

    // Wait for product detail page
    await page.waitForURL('/products/*');

    // Check for product details
    await expect(page.getByRole('heading')).toBeVisible();
    await expect(page.getByRole('button', { name: /add to cart/i })).toBeVisible();
  });

  test('should add product to cart', async ({ page }) => {
    await page.goto('/products');

    // Click first product
    await page.locator('[data-testid="product-card"]').first().click();

    // Add to cart
    await page.getByRole('button', { name: /add to cart/i }).click();

    // Check for success message
    await expect(page.getByText(/added to cart/i)).toBeVisible();
  });
});

test.describe('Checkout Flow', () => {
  test('should complete checkout process', async ({ page }) => {
    // Simulate having items in cart
    await page.goto('/cart');

    // Verify cart items
    await expect(page.getByText(/cart/i)).toBeVisible();

    // Proceed to checkout
    await page.getByRole('button', { name: /proceed to checkout/i }).click();

    // Verify checkout page
    await expect(page.url()).toContain('/checkout');
    await expect(page.getByText(/shipping/i)).toBeVisible();
  });
});
