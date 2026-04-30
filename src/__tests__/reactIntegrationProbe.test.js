import { act } from 'react';
import { readFileSync } from 'node:fs';
import { afterEach, describe, expect, it } from 'vitest';

import { mountReactIntegrationProbe } from '../react/entrypoints/integrationProbe.jsx';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

describe('React integration probe', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('mounts into the isolated React root without replacing the legacy app', async () => {
    document.body.innerHTML = [
      '<div id="app"><span data-legacy-node="true">legacy app</span></div>',
      '<div id="react-integration-root" hidden></div>',
    ].join('');

    const reactRoot = document.getElementById('react-integration-root');

    await act(async () => {
      mountReactIntegrationProbe(reactRoot);
    });

    expect(document.querySelector('[data-legacy-node="true"]')?.textContent).toBe('legacy app');
    expect(reactRoot?.dataset.reactMounted).toBe('true');
    expect(reactRoot?.querySelector('[data-react-integration-probe="true"]')).not.toBeNull();
  });

  it('is not bootstrapped by the production app entry', () => {
    const appEntry = readFileSync('src/app.js', 'utf8');

    expect(appEntry).not.toContain('integrationProbe.jsx');
  });
});
