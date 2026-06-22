# Publishing the VS Code Extension to the Marketplace

This guide outlines how to package and publish the **AI Typing Simulator** extension to the official Visual Studio Code Marketplace under any Microsoft/developer account.

---

## Step 1: Create a Personal Access Token (PAT)
To publish extensions, VS Code Marketplace uses a Personal Access Token (PAT) generated via Microsoft Azure DevOps.

1. Go to [Azure DevOps (dev.azure.com)](https://dev.azure.com) and sign in/sign up with the **Microsoft Account** you wish to publish under.
2. If prompted, create a new DevOps Organization (e.g., `your-name-org`).
3. Click on the **User Settings** (avatar icon) in the top-right corner, and select **Personal Access Tokens**.
4. Click **New Token**:
   * **Name**: `vsce-publisher` (or any description)
   * **Organization**: Select **All accessible organizations** (Crucial! Do not leave it set to just your current org).
   * **Expiration**: Choose a duration (e.g., 90 days or custom).
   * **Scopes**: Scroll down, click **Show all scopes** (at the bottom), find **Marketplace**, and select **Acquire** and **Manage** permissions.
5. Click **Create** and **Copy the Token**. *Note: Save this securely; you won't be able to see it again.*

---

## Step 2: Create a Publisher Profile
A publisher is a unique identifier required for every extension on the Marketplace.

1. Go to the [Visual Studio Marketplace Management Portal](https://marketplace.visualstudio.com/manage).
2. Sign in with the **same Microsoft Account**.
3. Create a new publisher profile:
   * **ID**: This must be a unique, URL-safe identifier (e.g., `antigravity-ai`).
   * **Name**: The display name of the publisher (e.g., `Antigravity AI`).
4. Save the profile.
5. Open `/home/qoneqo/.antigravity-ide/extensions/ai-typing-simulator/package.json` and make sure the `"publisher"` field matches your publisher ID exactly:
   ```json
   "publisher": "your-publisher-id-here"
   ```

---

## Step 3: Package the Extension locally
We have already verified the packaging setup, but to rebuild a clean `.vsix` archive locally:

1. Open your terminal in the extension folder:
   ```bash
   cd /home/qoneqo/.antigravity-ide/extensions/ai-typing-simulator
   ```
2. Build the `.vsix` file:
   ```bash
   npx @vscode/vsce package --allow-missing-repository
   ```
   This generates `ai-typing-simulator-0.0.1.vsix` in the root of the folder.

---

## Step 4: Login and Publish using VSCE CLI

### A. Login to your Publisher Profile
In your terminal, run the login command using your publisher ID:
```bash
npx @vscode/vsce login <your-publisher-id>
```
*It will prompt you to enter the **Personal Access Token** you copied in Step 1. Paste it and press Enter.*

### B. Publish the Extension
Once logged in, publish the extension directly to the Marketplace:
```bash
npx @vscode/vsce publish --allow-missing-repository
```
*Note: The Marketplace can take a few minutes to verify and index your extension before it appears in searches.*

---

## Alternative: Publishing via the Web Portal
If you prefer not to use the command line for publishing, you can upload the packaged file manually:
1. Go to the [Visual Studio Marketplace Management Portal](https://marketplace.visualstudio.com/manage).
2. Select your publisher.
3. Click **New Extension** -> **Visual Studio Code**.
4. Drag and drop the generated `ai-typing-simulator-0.0.1.vsix` file.
5. Click **Upload**.

---

## How to Test the Extension Locally
You can install the `.vsix` directly into your VS Code (or Antigravity IDE) to test it before publishing:
1. In VS Code, open the Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`).
2. Search for `Extensions: Install from VSIX...`
3. Browse and select the file `ai-typing-simulator-0.0.1.vsix`.
4. Reload the window to activate it.
