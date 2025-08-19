import { render, screen } from '@testing-library/react';
import App from './App';

test('renders learn react link', () => {
  render(<App />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});

// Additional thorough tests for App component (Jest + React Testing Library)
describe('App component', () => {
  test('renders the "Learn React" link with accessible name', () => {
    render(<App />);
    const link = screen.getByRole('link', { name: /learn react/i });
    expect(link).toBeInTheDocument();
  });

  test('the "Learn React" link points to the React documentation and opens in a new tab', () => {
    render(<App />);
    const link = screen.getByRole('link', { name: /learn react/i });
    // Accept both reactjs.org and react.dev (covers template variations)
    expect(link).toHaveAttribute('href', expect.stringMatching(/^https:\/\/react/));

    // CRA template typically opens in a new tab with security attributes
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', expect.stringMatching(/noopener/));
    expect(link).toHaveAttribute('rel', expect.stringMatching(/noreferrer/));
  });

  test('renders a logo image with descriptive alt text', () => {
    render(<App />);
    // Match common alt text used by templates: "logo" or similar
    const logo = screen.getByAltText(/logo/i);
    expect(logo).toBeInTheDocument();
  });

  test('does not render unrelated content', () => {
    render(<App />);
    // Guard against accidental unrelated content
    expect(screen.queryByText(/learn angular/i)).not.toBeInTheDocument();
  });
});
