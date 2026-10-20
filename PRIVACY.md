# Privacy Policy — OpenAI Status Monitor

**Version:** 0.1.3  
**Last updated:** 20 October 2026

OpenAI Status Monitor is an independent, unofficial Google Chrome extension that displays the public status of OpenAI services. It does not require registration or an API key.

## Information handled

The extension stores the following data locally via `chrome.storage.local`:

- Which public OpenAI service components are selected for display.
- The selected refresh interval (5, 30, or 60 minutes; or manual mode).
- The latest status and component information returned by the OpenAI Status service, including timestamps and any fetch errors.

These settings and cached status data are not sent to the extension developer or to a developer-operated backend.

## Network requests

The extension requests public machine-readable data only from:

- `https://status.openai.com/api/v2/status.json`
- `https://status.openai.com/api/v2/components.json`

These requests necessarily reach the external OpenAI Status infrastructure, which may process normal connection metadata such as IP addresses under its own terms and privacy practices. Clicking the **Source** link opens `https://status.openai.com/` in a browser tab.

## No tracking or monetization

The extension contains no analytics SDK, advertising, telemetry, account sign-in, or code that reads browsing history or user page content. It does not sell or share personal data with the developer or advertisers.

## Data control

You can change the settings in the extension's options page. Removing the extension from Chrome removes its locally stored extension data in the normal Chrome extension lifecycle.

## Independence

This extension is not affiliated with, endorsed by, or sponsored by OpenAI. The published overall status is not a guarantee of availability for an individual account or region.

This document describes extension version 0.1.3. If the functionality changes, this policy will need to be reviewed and updated before distribution.
