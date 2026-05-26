import { test, expect } from '@playwright/test';

test.describe('TodoList Frontend (Mock API)', () => {
    test.beforeEach(async ({ page }) => {
        // ========== AUTH ==========

        await page.route('**/me', async (route) => {
            await route.fulfill({
                status: 401,
                contentType: 'application/json',
                body: JSON.stringify({}),
            });
        });

        await page.route('**/login', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                headers: {
                    'set-cookie': 'token=fake',
                },
                body: JSON.stringify({
                    id: 'user-1',
                    username: 'test',
                }),
            });
        });

        await page.route('**/logout', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({}),
            });
        });

        // ========== PROJECTS ==========

        let projects = [
            {
                id: 'p1',
                name: 'Projet Mock',
                description: 'desc',
            },
        ];

        await page.route('**/projects', async (route) => {
            if (route.request().method() === 'GET') {
                return route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify(projects),
                });
            }

            if (route.request().method() === 'POST') {
                const body = await route.request().postDataJSON();

                const newProject = {
                    id: `p-${Date.now()}`,
                    name: body.name,
                    description: body.description,
                };

                projects.push(newProject);

                return route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify(newProject),
                });
            }
        });

        await page.route('**/projects/*/close', async (route) => {
            const id = route.request().url().split('/projects/')[1].split('/close')[0];

            projects = projects.map((p) =>
                p.id === id ? { ...p, closed: true } : p
            );

            return route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ success: true }),
            });
        });

        // ========== TASKS ==========

        let tasks = [
            {
                id: 't1',
                title: 'Task Mock',
                status: 'OPEN',
                projectId: 'p1',
            },
        ];

        await page.route('**/tasks', async (route) => {
            if (route.request().method() === 'GET') {
                return route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify(tasks),
                });
            }

            if (route.request().method() === 'POST') {
                const body = await route.request().postDataJSON();

                const newTask = {
                    id: `t-${Date.now()}`,
                    name: body.title,
                    status: 'OPEN',
                    projectId: body.projectId,
                };

                tasks.push(newTask);

                return route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify(newTask),
                });
            }
        });

        await page.route('**/tasks/*/close', async (route) => {
            const id = route.request().url().split('/tasks/')[1].split('/close')[0];

            tasks = tasks.map((t) =>
                t.id === id ? { ...t, status: 'CLOSED' } : t
            );

            return route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ success: true }),
            });
        });
    });

    // =========================
    // TESTS
    // =========================

    const URL = 'http://localhost:5173';

    async function login(page) {
        await page.goto(URL);

        await expect(page.getByPlaceholder('Username')).toBeVisible();
        await page.getByPlaceholder('Username').fill('test');
        await page.getByPlaceholder('Password').fill('test');

        await page.getByRole('button', { name: /login/i }).click();

        await expect(page.getByRole('heading', { name: /projects/i })).toBeVisible();
    }

    test.describe('TodoList Frontend (Mock API)', () => {

        test('Connexion utilisateur', async ({ page }) => {
            await login(page);
        });

        test('Création d’un projet', async ({ page }) => {
            await login(page);

            const projectName = `Projet Mock ${Date.now()}`;

            await page.getByPlaceholder('Nom du projet').fill(projectName);
            await page.getByPlaceholder('Description').fill('Description mock');

            await page.getByRole('button', { name: /créer/i }).click();

            const projectCard = page.locator('.card').filter({ hasText: projectName });

            await expect(projectCard).toBeVisible();
        });

        test('Sélection projet + création tâche', async ({ page }) => {
            await login(page);

            const projectName = `Projet Mock ${Date.now()}`;
            const taskName = `Task ${Date.now()}`;

            const nameInput = page.getByPlaceholder('Nom du projet');
            const descInput = page.getByPlaceholder('Description');
            const submitBtn = page.getByRole('button', { name: /créer le projet/i });

            await expect(nameInput).toBeVisible();

            await nameInput.fill(projectName);
            await descInput.fill('desc');

            await expect(submitBtn).toBeEnabled();
            await submitBtn.click();

            const projectCard = page.locator('.card').filter({ hasText: projectName });
            await expect(projectCard).toBeVisible();

            await projectCard.click();

            await page.getByPlaceholder('New task').fill(taskName);
            await page.getByRole('button', { name: /ajouter/i }).click();

            const taskRow = page.locator('.item', {
                hasText: taskName,
            });

            await expect(taskRow).toBeVisible();
        });

        test('Close task', async ({ page }) => {
            await login(page);

            const projectName = `Projet Close ${Date.now()}`;
            const taskName = `Task Mock ${Date.now()}`;

            await page.getByPlaceholder('Nom du projet').fill(projectName);
            await page.getByPlaceholder('Description').fill('desc');
            await page.getByRole('button', { name: /créer/i }).click();

            const projectCard = page.locator('.card').filter({ hasText: projectName });
            await projectCard.click();

            await page.getByPlaceholder('New task').fill(taskName);
            await page.getByRole('button', { name: /ajouter/i }).click();

            const taskRow = page.locator('.item').filter({ hasText: taskName });

            await expect(taskRow).toBeVisible();

            await taskRow.getByRole('button', { name: /close/i }).click();

            await expect(taskRow).toContainText(/closed/i);
        });

    });
});