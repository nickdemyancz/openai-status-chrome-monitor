# Installing OpenAI Status Monitor from GitHub

The Chrome Web Store listing is **planned but not yet available**. Until publication, install the extension manually as an **unpacked extension**.

## 1. Choose a ZIP archive

- **[v0.1.3 — stable](downloads/openai-status-chrome-monitor-v0.1.3.zip)**: Matches the currently published source code in the `main` branch; Russian interface.
- **[v0.1.4 — preview](downloads/openai-status-chrome-monitor-v0.1.4-preview.zip)**: Preview build with English, Russian and Czech, automatic browser-language detection and a manual language selector. The corresponding source integration into `main` is pending.

These ZIPs contain the unpacked extension files, including `manifest.json` at the archive root. They are **not executables or one-click installers**.

## 2. Install in Google Chrome

1. Download the chosen ZIP to your computer.
2. **Extract** it into a permanent folder (for example, `Documents/OpenAI-Status-Monitor`). Do not open the ZIP directly in Chrome.
3. Type `chrome://extensions` in Chrome's address bar and press Enter.
4. Enable **Developer mode** (upper-right corner).
5. Click **Load unpacked**.
6. Select the **extracted folder containing `manifest.json`**, not the ZIP file itself. If your extraction tool created an additional parent folder, open it first.
7. Open Chrome's Extensions menu (puzzle icon) and pin **OpenAI Status Monitor** to the toolbar.
8. Click the extension icon to open the service-status popup; use the gear button for component and update settings.

On first run, the extension will retrieve public data from `https://status.openai.com/`. If network access is unavailable, its icon may remain gray.

## 3. Update an existing unpacked installation

1. Download the new ZIP and extract its contents into the **same folder** from which Chrome loaded the extension. Make a backup of that folder first.
2. In `chrome://extensions`, find OpenAI Status Monitor and click **Reload**.
3. Verify the version shown on the extension card.

**Important:** When replacing an unpacked extension, keep the original installation directory. Loading a second copy from another folder may create another extension identity, with separate settings. Your chosen services and interval are saved in Chrome's local extension storage, not in the extracted files.

GitHub ZIP installations **do not update automatically**. When a newer version becomes available, repeat the steps above.

## 4. Troubleshooting

- **"Manifest file is missing or unreadable"**: Confirm you selected the extracted directory containing `manifest.json`; the file must be at that folder's root.
- **Gray status icon**: Check your connection to `status.openai.com`, then click the refresh button in the popup.
- **Toolbar icon is hidden**: Open Chrome's Extensions menu and pin OpenAI Status Monitor.
- **No service list**: Open settings and allow the public OpenAI Status component list to load.
- **Switching versions**: v0.1.4 is a preview. For a stable installation use v0.1.3.

## 5. Chrome Web Store

A Chrome Web Store listing is **planned**, but has not been published or approved. Installation from GitHub requires Developer mode. A future Chrome Web Store installation is a different distribution method and may not share settings with a manually loaded copy.

See [ROADMAP.md](ROADMAP.md) for the publication plan.

This extension is independently developed and is **not affiliated with or endorsed by OpenAI**.
