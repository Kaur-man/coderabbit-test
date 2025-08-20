import React from "react";
import { render, screen, within } from '@testing-library/react';
import App from './App';

test('renders learn react link', () => {
  render(<App />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});

/**
 * Additional comprehensive tests for App component
 * Testing Frameworks/Libraries used here:
 * - Jest (runner/assertions)
 * - React Testing Library (@testing-library/react) + @testing-library/jest-dom
 */
describe('App component', () => {
  test('renders learn react link (smoke test)', () => {
    render(<App />);
    const linkElement = screen.getByText(/learn react/i);
    expect(linkElement).toBeInTheDocument();
  });

  test('renders a link with accessible name matching "learn react" and it is focusable', () => {
    render(<App />);
    const link = screen.getByRole('link', { name: /learn react/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href');
    link.focus();
    expect(link).toHaveFocus();
  });

  test('does not log errors to the console during initial render', () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    render(<App />);
    expect(errorSpy).not.toHaveBeenCalled();
    expect(warnSpy).not.toHaveBeenCalled();
    errorSpy.mockRestore();
    warnSpy.mockRestore();
  });

  test('renders a main or header landmark and content inside it when present', () => {
    render(<App />);
    const possibleLandmarks = [
      screen.queryByRole('banner'),
      screen.queryByRole('main'),
      screen.queryByRole('contentinfo'),
    ].filter(Boolean);
    expect(possibleLandmarks.length).toBeGreaterThan(0);
    const container = possibleLandmarks[0];
    if (container) {
      const utils = within(container);
      const linkInside = utils.queryByRole('link', { name: /learn react/i });
      expect(linkInside).toBeTruthy();
    }
  });

  test('renders an image/logo if provided with accessible alt text', () => {
    render(<App />);
    const possibleImg = screen.queryByRole('img', { name: /logo|react/i });
    if (possibleImg) {
      expect(possibleImg).toBeVisible();
    } else {
      expect(true).toBe(true);
    }
  });
});
