/*
  *
  * Test END TO END PLAYWRIGHT
  * 
  * 
import { test, expect } from '@playwright/test';
import { execSync } from 'node:child_process';

function dockerComposeLogs(): string {
  return execSync('docker compose -f ../docker-compose.yml logs notifications --tail 400', {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

function isDockerComposeAvailable(): boolean {
  try {
    execSync('docker compose -f ../docker-compose.yml ps', {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    return true;
  } catch {
    return false;
  }
}

test.describe('TodoList App', () => {
  test('Création d’un projet', async ({ page }) => {
    const projectName = `Projet E2E ${Date.now()}`;

    await page.goto('http://localhost:5173');

    await page.getByPlaceholder('Username').fill('test');
    await page.getByPlaceholder('Password').fill('test');
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page.getByRole('heading', { name: 'Projects' })).toBeVisible();

    await page.getByPlaceholder('Nom du projet').fill(projectName);
    await page.getByPlaceholder('Description').fill('Projet créé par Playwright');
    await page.getByRole('button', { name: 'Créer le projet' }).click();

    await expect(page.getByText(projectName)).toBeVisible();
  });

  test('Création d’une tâche sur un projet', async ({ page }) => {
    const projectName = `Projet Tâches E2E ${Date.now()}`;
    const taskName = `Tâche E2E ${Date.now()}`;

    await page.goto('http://localhost:5173');

    await page.getByPlaceholder('Username').fill('test');
    await page.getByPlaceholder('Password').fill('test');
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page.getByRole('heading', { name: 'Projects' })).toBeVisible();

    await page.getByPlaceholder('Nom du projet').fill(projectName);
    await page.getByPlaceholder('Description').fill('Projet pour test de création de tâche');
    await page.getByRole('button', { name: 'Créer le projet' }).click();

    await expect(page.getByText(projectName)).toBeVisible();

    await page.getByText(projectName).first().click();

    await page.getByPlaceholder('New task').fill(taskName);
    await page.getByRole('button', { name: 'Ajouter' }).click();

    await expect(page.getByText(`${taskName} (OPEN)`)).toBeVisible();
  });

  test('Marquer la tâche comme terminée', async ({ page }) => {
    const projectName = `Projet Close Task E2E ${Date.now()}`;
    const taskName = `Tâche Close E2E ${Date.now()}`;

    await page.goto('http://localhost:5173');

    await page.getByPlaceholder('Username').fill('test');
    await page.getByPlaceholder('Password').fill('test');
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page.getByRole('heading', { name: 'Projects' })).toBeVisible();

    await page.getByPlaceholder('Nom du projet').fill(projectName);
    await page.getByPlaceholder('Description').fill('Projet pour test fermeture de tâche');
    await page.getByRole('button', { name: 'Créer le projet' }).click();

    await expect(page.getByText(projectName)).toBeVisible();
    await page.getByText(projectName).first().click();

    await page.getByPlaceholder('New task').fill(taskName);
    await page.getByRole('button', { name: 'Ajouter' }).click();

    await expect(page.getByText(`${taskName} (OPEN)`)).toBeVisible();

    const createdTaskRow = page.locator('.item').filter({ hasText: taskName }).first();
    await createdTaskRow.getByRole('button', { name: 'Close task' }).click();

    await expect(page.getByText(`${taskName} (CLOSED)`)).toBeVisible();
  });

  test('Vérifier la présence de notification dans les logs', async ({ page }) => {
    test.skip(!isDockerComposeAvailable(), 'Docker Compose non disponible pour lire les logs notifications');

    const projectName = `Projet Notif E2E ${Date.now()}`;

    await page.goto('http://localhost:5173');

    await page.getByPlaceholder('Username').fill('test');
    await page.getByPlaceholder('Password').fill('test');
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page.getByRole('heading', { name: 'Projects' })).toBeVisible();

    await page.getByPlaceholder('Nom du projet').fill(projectName);
    await page.getByPlaceholder('Description').fill('Projet pour test notification logs');
    await page.getByRole('button', { name: 'Créer le projet' }).click();

    const projectCard = page.locator('.card').filter({ hasText: projectName }).first();
    await expect(projectCard).toBeVisible();
    await projectCard.getByRole('button', { name: 'Fermes' }).click();

    await expect
      .poll(
        () => {
          const logs = dockerComposeLogs();
          return logs.includes('[notification]') && logs.includes(projectName);
        },
        { timeout: 20000, intervals: [1000, 2000, 3000] },
      )
      .toBeTruthy();
  });
});

*/