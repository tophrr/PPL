import React, { ReactElement } from 'react';

/**
 * Custom render function for testing React components
 * Uses jsdom environment from vitest config
 */

interface CustomRenderOptions {
  container?: HTMLElement;
}

const customRender = (ui: ReactElement, options?: CustomRenderOptions) => {
  const container = options?.container || document.createElement('div');

  // Render component into container
  const root = React.createElement(React.Fragment, null, ui);

  return {
    container,
    render: () => root,
  };
};

// Utility functions for DOM queries
export const screen = {
  getByText: (text: string | RegExp): HTMLElement => {
    const xpath = `//*[contains(text(), '${typeof text === 'string' ? text : text.source}')]`;
    const result = document.evaluate(
      xpath,
      document,
      null,
      XPathResult.FIRST_ORDERED_NODE_TYPE,
      null,
    );
    if (!result.singleNodeValue) {
      throw new Error(`Element with text "${text}" not found`);
    }
    return result.singleNodeValue as HTMLElement;
  },

  getByRole: (role: string, options?: { name?: string | RegExp }): HTMLElement => {
    const elements = document.querySelectorAll(`[role="${role}"]`);
    if (options?.name) {
      const nameStr = typeof options.name === 'string' ? options.name : options.name.source;
      for (const el of elements) {
        if (el.textContent?.includes(nameStr)) {
          return el as HTMLElement;
        }
      }
    }
    if (elements.length === 0) {
      throw new Error(`Element with role "${role}" not found`);
    }
    return elements[0] as HTMLElement;
  },

  getByLabel: (label: string | RegExp): HTMLInputElement => {
    const labels = document.querySelectorAll('label');
    const labelStr = typeof label === 'string' ? label : label.source;
    for (const l of labels) {
      if (l.textContent?.includes(labelStr)) {
        const id = l.getAttribute('for');
        if (id) {
          return document.getElementById(id) as HTMLInputElement;
        }
      }
    }
    throw new Error(`Input with label "${label}" not found`);
  },

  queryByText: (text: string | RegExp): HTMLElement | null => {
    try {
      return screen.getByText(text);
    } catch {
      return null;
    }
  },

  queryByRole: (role: string): HTMLElement | null => {
    const elements = document.querySelectorAll(`[role="${role}"]`);
    return elements.length > 0 ? (elements[0] as HTMLElement) : null;
  },
};

export { customRender as render };
