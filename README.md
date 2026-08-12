# Run and test 舞伴

## Local development

1. Use Node.js `24.18.0` and npm `11.16.0`:

   ```bash
   nvm use
   npm install -g npm@11.16.0
   ```

2. Install dependencies:

   ```bash
   npm ci
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open the app:

   - Normal camera flow: [http://localhost:5173](http://localhost:5173)
   - Accelerated camera-free simulation: [http://localhost:5173/?fast=1](http://localhost:5173/?fast=1)
   - Development camera diagnostics: [http://localhost:5173/?debug=1](http://localhost:5173/?debug=1)

5. Run the complete automated test suite in Chrome:

   ```bash
   npm run verify:full
   ```

6. Test the production build locally:
****
   ```bash
   npm run preview
   ```

   Open the URL printed by Vite, normally [http://localhost:4173](http://localhost:4173).

## Deployed production

1. Sign in to the ChatGPT account that owns the deployment.

2. Open [https://wuban-dance-companion.hello18528.chatgpt.site](https://wuban-dance-companion.hello18528.chatgpt.site).

3. Run a camera-free smoke test at [https://wuban-dance-companion.hello18528.chatgpt.site/?fast=1](https://wuban-dance-companion.hello18528.chatgpt.site/?fast=1):

   - Complete both the standing and seated routes.
   - Confirm the gameplay and result screens remain clearly labelled `SIMULATED`.
   - Open Progress and confirm the simulated session is not presented as real history.

4. Run the real-device flow from the production base URL:

   - Confirm the in-app camera disclosure appears before the browser permission prompt.
   - Grant camera access and complete a session.
   - Check tracking, audio, scoring, results, and progress history.

5. Test local-data controls:

   - Grant and revoke caregiver sharing.
   - Clear local history and confirm the empty state appears.
