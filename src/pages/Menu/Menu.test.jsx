/**
 * Test framework: Jest + React Testing Library
 * These tests focus on the Menu page component behavior including:
 * - Section rendering and CTA
 * - Menu items mapping for breakfast, lunch, dinner, dessert, and drinks
 * - Side-effect: console.info only in non-production environments
 *
 * NOTE: This suite mocks data/image/style dependencies to keep tests isolated and deterministic.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';

// Mock framer-motion to plain divs to avoid animation/in-viewport side effects
jest.mock('./Menu.css', () => ({}));
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...rest }) => <div {...rest}>{children}</div>
  }
}));

// Mock static assets
jest.mock('../../utils/images/breakfast-img.jpg', () => 'BreakfastImg');
jest.mock('../../utils/images/lunch-img.jpg', () => 'LunchImg');
jest.mock('../../utils/images/dinner-img.jpg', () => 'DinnerImg');
jest.mock('../../utils/images/dessert-img.jpg', () => 'DessertImg');
jest.mock('../../utils/images/drinks-img.jpg', () => 'DrinksImg');

// Mock menu datasets
jest.mock('../../utils/breakfast', () => ({
  __esModule: true,
  default: [
    { id: 1, name: 'Pancakes', description: 'Fluffy pancakes with syrup', price: '$5.00' },
    { id: 2, name: 'Omelette', description: 'Cheese omelette', price: '$6.50' }
  ]
}));
jest.mock('../../utils/lunch', () => ({
  __esModule: true,
  default: [
    { id: 10, name: 'Burger', description: 'Beef burger', price: '$9.50' },
    { id: 11, name: 'Salad', description: 'Caesar salad', price: '$8.00' }
  ]
}));
jest.mock('../../utils/dinner', () => ({
  __esModule: true,
  default: [
    { id: 20, name: 'Steak', description: 'Grilled steak', price: '$18.00' },
    { id: 21, name: 'Pasta', description: 'Marinara pasta', price: '$12.00' }
  ]
}));
jest.mock('../../utils/dessert', () => ({
  __esModule: true,
  default: [
    { id: 30, name: 'Cheesecake', description: 'Creamy', price: '$6.00' },
    { id: 31, name: 'Ice Cream', description: 'Vanilla', price: '$4.00' }
  ]
}));
jest.mock('../../utils/drink', () => ({
  __esModule: true,
  default: [
    { id: 40, name: 'Coffee', price: '$3.00' },
    { id: 41, name: 'Tea', price: '$2.50' }
  ]
}));

// Import after mocks
import Menu from './Menu';

describe('Menu page', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const renderMenu = () =>
    render(
      <MemoryRouter>
        <Menu />
      </MemoryRouter>
    );

  it('renders main and section headings plus CTA link', () => {
    renderMenu();

    expect(screen.getByRole('heading', { level: 1, name: /menu/i })).toBeInTheDocument();

    for (const section of ['Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Drinks']) {
      expect(screen.getByRole('heading', { level: 2, name: section })).toBeInTheDocument();
    }

    const ctaButton = screen.getByRole('button', { name: /book your table/i });
    expect(ctaButton).toBeInTheDocument();

    const ctaLink = screen.getByRole('link', { name: /book your table/i });
    expect(ctaLink).toHaveAttribute('href');
    expect(ctaLink.getAttribute('href')).toContain('/contact');
  });

  it('renders breakfast items with description and price', () => {
    renderMenu();

    expect(screen.getByText('Pancakes')).toBeInTheDocument();
    expect(screen.getByText('Fluffy pancakes with syrup')).toBeInTheDocument();
    expect(screen.getByText('$5.00')).toBeInTheDocument();

    expect(screen.getByText('Omelette')).toBeInTheDocument();
    expect(screen.getByText('Cheese omelette')).toBeInTheDocument();
    expect(screen.getByText('$6.50')).toBeInTheDocument();
  });

  it('renders lunch, dinner, dessert, and drinks correctly', () => {
    renderMenu();

    // lunch
    expect(screen.getByText('Burger')).toBeInTheDocument();
    expect(screen.getByText('Beef burger')).toBeInTheDocument();
    expect(screen.getByText('$9.50')).toBeInTheDocument();

    // dinner
    expect(screen.getByText('Steak')).toBeInTheDocument();
    expect(screen.getByText('Grilled steak')).toBeInTheDocument();
    expect(screen.getByText('$18.00')).toBeInTheDocument();

    // dessert
    expect(screen.getByText('Cheesecake')).toBeInTheDocument();
    expect(screen.getByText('Creamy')).toBeInTheDocument();
    expect(screen.getByText('$6.00')).toBeInTheDocument();

    // drinks (no description)
    expect(screen.getByText('Coffee')).toBeInTheDocument();
    expect(screen.getByText('$3.00')).toBeInTheDocument();
    expect(screen.getByText('Tea')).toBeInTheDocument();
    expect(screen.getByText('$2.50')).toBeInTheDocument();
  });

  it('logs a review hint in non-production environments', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'test';
    const infoSpy = jest.spyOn(console, 'info').mockImplementation(() => {});

    renderMenu();

    expect(infoSpy).toHaveBeenCalledWith('CodeRabbit should review this change!');
    infoSpy.mockRestore();
    process.env.NODE_ENV = originalEnv;
  });

  it('does not log in production environment', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    const infoSpy = jest.spyOn(console, 'info').mockImplementation(() => {});

    renderMenu();

    expect(infoSpy).not.toHaveBeenCalled();
    infoSpy.mockRestore();
    process.env.NODE_ENV = originalEnv;
  });

  it('renders without crashing when menu datasets are empty', () => {
    jest.resetModules();

    jest.doMock('./Menu.css', () => ({}));
    jest.doMock('framer-motion', () => ({
      motion: {
        div: ({ children, ...rest }) => <div {...rest}>{children}</div>
      }
    }));
    jest.doMock('../../utils/images/breakfast-img.jpg', () => 'BreakfastImg');
    jest.doMock('../../utils/images/lunch-img.jpg', () => 'LunchImg');
    jest.doMock('../../utils/images/dinner-img.jpg', () => 'DinnerImg');
    jest.doMock('../../utils/images/dessert-img.jpg', () => 'DessertImg');
    jest.doMock('../../utils/images/drinks-img.jpg', () => 'DrinksImg');

    jest.doMock('../../utils/breakfast', () => ({ __esModule: true, default: [] }));
    jest.doMock('../../utils/lunch',     () => ({ __esModule: true, default: [] }));
    jest.doMock('../../utils/dinner',    () => ({ __esModule: true, default: [] }));
    jest.doMock('../../utils/dessert',   () => ({ __esModule: true, default: [] }));
    jest.doMock('../../utils/drink',     () => ({ __esModule: true, default: [] }));

    jest.isolateModules(() => {
      // Import inside isolated context after mocks
      const MenuEmpty = require('./Menu').default;
      render(
        <MemoryRouter>
          <MenuEmpty />
        </MemoryRouter>
      );

      expect(screen.getByRole('heading', { name: /menu/i })).toBeInTheDocument();
      expect(screen.queryByText('Pancakes')).not.toBeInTheDocument();
      expect(screen.queryByText('Coffee')).not.toBeInTheDocument();
    });
  });
});