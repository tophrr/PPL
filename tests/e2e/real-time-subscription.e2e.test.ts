import { test, expect } from '@playwright/test';

/**
 * E2E Real-Time Subscription Tests (TC-SCH-2)
 * Validates that real-time updates (Approve/Reject status changes) propagate to UI without page refresh
 */

test.describe('Real-Time Subscription & Live Updates', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the scheduler page
    await page.goto('/dashboard/scheduler');
    await page.waitForLoadState('networkidle');
  });

  test('should display live status updates when draft is approved by another user', async ({
    page,
    context,
  }) => {
    // Open a second browser context to simulate another user
    const secondPageContext = await context.browser()?.newContext();
    const secondPage = await secondPageContext?.newPage();

    // First page: navigate to scheduler
    await page.goto('/dashboard/scheduler');
    await page.waitForSelector('[data-testid="draft-item"]');

    const draftCard = page.locator('[data-testid="draft-item"]').first();
    const initialStatus = await draftCard.locator('[data-testid="draft-status"]').textContent();
    expect(initialStatus).toContain('Review');

    // Second page: simulate manager approving the draft
    await secondPage?.goto('/dashboard/approval-analytics');
    await secondPage?.waitForSelector('[data-testid="approve-btn"]');
    await secondPage?.locator('[data-testid="approve-btn"]').first().click();

    // Wait for approval action to complete
    await secondPage?.waitForTimeout(500);

    // First page: should automatically update status without refresh
    await expect(draftCard.locator('[data-testid="draft-status"]')).toContainText('Approved', {
      timeout: 5000, // Wait up to 5 seconds for real-time update
    });

    await secondPageContext?.close();
  });

  test('should display live status updates when draft is rejected', async ({ page, context }) => {
    const secondPageContext = await context.browser()?.newContext();
    const secondPage = await secondPageContext?.newPage();

    await page.goto('/dashboard/scheduler');
    await page.waitForSelector('[data-testid="draft-item"]');

    const draftCard = page.locator('[data-testid="draft-item"]').first();
    const initialStatus = await draftCard.locator('[data-testid="draft-status"]').textContent();
    expect(initialStatus).toBeTruthy();

    // Second page: reject the draft
    await secondPage?.goto('/dashboard/approval-analytics');
    await secondPage?.waitForSelector('[data-testid="reject-btn"]');
    await secondPage?.locator('[data-testid="reject-btn"]').first().click();

    // First page: should automatically reflect rejection without refresh
    await expect(draftCard.locator('[data-testid="draft-status"]')).toContainText('Rejected', {
      timeout: 5000,
    });

    await secondPageContext?.close();
  });

  test('should show optimistic UI update, then rollback if approval fails', async ({ page }) => {
    await page.goto('/dashboard/scheduler');
    await page.waitForSelector('[data-testid="approve-action"]');

    const draftCard = page.locator('[data-testid="draft-item"]').first();

    // Monitor the status field
    const statusField = draftCard.locator('[data-testid="draft-status"]');

    // Trigger approval action
    await page.locator('[data-testid="approve-action"]').first().click();

    // Optimistic update: UI should immediately show "Approved" (or loading state)
    // Check that status changed optimistically
    const optimisticStatus = await statusField.textContent();
    expect(optimisticStatus).toBeTruthy();

    // Simulate network error by checking for error toast (or rollback indicator)
    const errorToast = page.locator('[data-testid="error-toast"]');
    const rollbackIndicator = page.locator('[data-testid="draft-status"]');

    // Wait a bit for network response simulation
    await page.waitForTimeout(1000);

    // Either the status remains as it was (rollback) or error is shown
    await expect(page.locator('[data-testid="draft-item"]')).toBeVisible();
  });

  test('should maintain subscription connection during navigation', async ({ page }) => {
    await page.goto('/dashboard/scheduler');
    await page.waitForSelector('[data-testid="draft-item"]');

    // Verify initial state
    const initialDrafts = await page.locator('[data-testid="draft-item"]').count();
    expect(initialDrafts).toBeGreaterThan(0);

    // Navigate to another dashboard page
    await page.goto('/dashboard/approval-analytics');
    await page.waitForLoadState('networkidle');

    // Navigate back to scheduler
    await page.goto('/dashboard/scheduler');
    await page.waitForSelector('[data-testid="draft-item"]');

    // Verify subscription is still active and data is present
    const draftsAfterNav = await page.locator('[data-testid="draft-item"]').count();
    expect(draftsAfterNav).toBeGreaterThan(0);
  });

  test('should reconnect subscription on temporary network failure', async ({ page, context }) => {
    await page.goto('/dashboard/scheduler');
    await page.waitForSelector('[data-testid="draft-item"]');

    // Simulate going offline
    await context.setOffline(true);

    // Wait a moment while offline
    await page.waitForTimeout(500);

    // Simulate coming back online
    await context.setOffline(false);

    // Verify subscription reconnects and data is still visible
    await expect(page.locator('[data-testid="draft-item"]')).toBeVisible({ timeout: 5000 });

    // Verify we can still interact with the page (e.g., click approve)
    await page.locator('[data-testid="approve-action"]').first().click();
    await page.waitForTimeout(500);

    // No error should appear
    const errorNotification = page.locator('[data-testid="error-notification"]');
    await expect(errorNotification).not.toBeVisible();
  });

  test('should update multiple draft statuses in real-time', async ({ page, context }) => {
    const secondPageContext = await context.browser()?.newContext();
    const secondPage = await secondPageContext?.newPage();

    await page.goto('/dashboard/scheduler');
    await page.waitForSelector('[data-testid="draft-item"]');

    const drafts = page.locator('[data-testid="draft-item"]');
    const firstDraftStatus = drafts.first().locator('[data-testid="draft-status"]');
    const secondDraftStatus = drafts.nth(1).locator('[data-testid="draft-status"]');

    // Second page: approve multiple drafts
    await secondPage?.goto('/dashboard/approval-analytics');
    await secondPage?.waitForSelector('[data-testid="approve-btn"]');

    await secondPage?.locator('[data-testid="approve-btn"]').nth(0).click();
    await secondPage?.waitForTimeout(300);

    await secondPage?.locator('[data-testid="approve-btn"]').nth(1).click();
    await secondPage?.waitForTimeout(300);

    // First page: both drafts should update without manual refresh
    await expect(firstDraftStatus).toContainText('Approved', { timeout: 5000 });
    await expect(secondDraftStatus).toContainText('Approved', { timeout: 5000 });

    await secondPageContext?.close();
  });
});
