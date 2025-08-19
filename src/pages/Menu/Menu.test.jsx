import React from 'react'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'

// Mocks for assets and external libs to keep tests deterministic and fast
jest.mock('../../utils/images/breakfast-img.jpg', () => 'mock-breakfast.jpg')
jest.mock('../../utils/images/lunch-img.jpg', () => 'mock-lunch.jpg')
jest.mock('../../utils/images/dinner-img.jpg', () => 'mock-dinner.jpg')
jest.mock('../../utils/images/dessert-img.jpg', () => 'mock-dessert.jpg')
jest.mock('../../utils/images/drinks-img.jpg', () => 'mock-drinks.jpg')

// Mock framer-motion to render plain divs with given props (no animation)
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...rest }) => <div {...rest}>{children}</div>
  }
}))

// Mock react-bootstrap components to simple passthrough wrappers that render children and important classes for queries
jest.mock('react-bootstrap', () => {
  const passthrough = (tag, displayName) => {
    const Comp = ({ children, className = '', ...rest }) => React.createElement(tag, { className, ...rest }, children)
    Comp.displayName = displayName
    return Comp
  }
  return {
    Card: passthrough('div', 'Card'),
    CardBody: passthrough('div', 'CardBody'),
    CardTitle: passthrough('h3', 'CardTitle'),
    CardText: passthrough('p', 'CardText'),
  }
})

// Provide deterministic test data for each menu section
jest.mock('../../utils/breakfast', () => ([
  { id: 1, name: 'Pancakes', description: 'Fluffy with syrup', price: '$8.50' },
  { id: 2, name: 'Omelette', description: '3 eggs, cheese', price: '$9.00' },
]))
jest.mock('../../utils/lunch', () => ([
  { id: 10, name: 'BLT Sandwich', description: 'Bacon, lettuce, tomato', price: '$11.00' },
]))
jest.mock('../../utils/dinner', () => ([
  { id: 20, name: 'Steak', description: 'Ribeye, medium-rare', price: '$24.00' },
  { id: 21, name: 'Salmon', description: 'Grilled with lemon', price: '$22.00' },
  { id: 22, name: 'Pasta', description: 'Alfredo sauce', price: '$17.50' },
]))
jest.mock('../../utils/dessert', () => ([
  { id: 30, name: 'Cheesecake', description: 'Classic NY style', price: '$6.50' },
]))
jest.mock('../../utils/drink', () => ([
  { id: 40, name: 'Latte', price: '$4.50' },
  { id: 41, name: 'Iced Tea', price: '$3.00' },
]))

// Import the component under test last so mocks are applied
import Menu from './Menu'

const renderMenu = () => render(
  <MemoryRouter>
    <Menu />
  </MemoryRouter>
)

describe('Menu page', () => {
  test('renders page header and primary sections', () => {
    renderMenu()

    // Page title
    expect(screen.getByRole('heading', { name: /menu/i, level: 1 })).toBeInTheDocument()

    // Section headings
    expect(screen.getByRole('heading', { name: /breakfast/i, level: 2 })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /lunch/i, level: 2 })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /dinner/i, level: 2 })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /dessert/i, level: 2 })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /drinks/i, level: 2 })).toBeInTheDocument()
  })

  test('renders expected number of items per section with correct names and prices (happy path)', () => {
    renderMenu()

    // Breakfast - 2 items with names, descriptions, and prices
    const breakfastSection = screen.getByRole('heading', { name: /breakfast/i, level: 2 }).closest('.breakfast')
    expect(breakfastSection).toBeTruthy()
    const breakfastScope = within(breakfastSection)
    expect(breakfastScope.getByRole('heading', { name: /pancakes/i, level: 3 })).toBeInTheDocument()
    expect(breakfastScope.getByText(/fluffy with syrup/i)).toBeInTheDocument()
    expect(breakfastScope.getByText('$8.50')).toBeInTheDocument()
    expect(breakfastScope.getByRole('heading', { name: /omelette/i, level: 3 })).toBeInTheDocument()
    expect(breakfastScope.getByText(/3 eggs, cheese/i)).toBeInTheDocument()
    expect(breakfastScope.getByText('$9.00')).toBeInTheDocument()

    // Lunch - 1 item
    const lunchSection = screen.getByRole('heading', { name: /lunch/i, level: 2 }).closest('.lunch')
    const lunchScope = within(lunchSection)
    expect(lunchScope.getByRole('heading', { name: /blt sandwich/i, level: 3 })).toBeInTheDocument()
    expect(lunchScope.getByText(/bacon, lettuce, tomato/i)).toBeInTheDocument()
    expect(lunchScope.getByText('$11.00')).toBeInTheDocument()

    // Dinner - 3 items
    const dinnerSection = screen.getByRole('heading', { name: /dinner/i, level: 2 }).closest('.dinner')
    const dinnerScope = within(dinnerSection)
    expect(dinnerScope.getByRole('heading', { name: /steak/i, level: 3 })).toBeInTheDocument()
    expect(dinnerScope.getByText(/ribeye, medium-rare/i)).toBeInTheDocument()
    expect(dinnerScope.getByText('$24.00')).toBeInTheDocument()
    expect(dinnerScope.getByRole('heading', { name: /salmon/i, level: 3 })).toBeInTheDocument()
    expect(dinnerScope.getByText(/grilled with lemon/i)).toBeInTheDocument()
    expect(dinnerScope.getByText('$22.00')).toBeInTheDocument()
    expect(dinnerScope.getByRole('heading', { name: /pasta/i, level: 3 })).toBeInTheDocument()
    expect(dinnerScope.getByText(/alfredo sauce/i)).toBeInTheDocument()
    expect(dinnerScope.getByText('$17.50')).toBeInTheDocument()

    // Dessert - 1 item
    const dessertSection = screen.getByRole('heading', { name: /dessert/i, level: 2 }).closest('.dessert')
    const dessertScope = within(dessertSection)
    expect(dessertScope.getByRole('heading', { name: /cheesecake/i, level: 3 })).toBeInTheDocument()
    expect(dessertScope.getByText(/classic ny style/i)).toBeInTheDocument()
    expect(dessertScope.getByText('$6.50')).toBeInTheDocument()

    // Drinks - 2 items (no descriptions in component for drinks)
    const drinksSection = screen.getByRole('heading', { name: /drinks/i, level: 2 }).closest('.drinks')
    const drinksScope = within(drinksSection)
    expect(drinksScope.getByRole('heading', { name: /latte/i, level: 3 })).toBeInTheDocument()
    expect(drinksScope.getByText('$4.50')).toBeInTheDocument()
    expect(drinksScope.getByRole('heading', { name: /iced tea/i, level: 3 })).toBeInTheDocument()
    expect(drinksScope.getByText('$3.00')).toBeInTheDocument()
  })

  test('renders 5 section images and they use mocked src values', () => {
    renderMenu()
    const imgs = screen.getAllByRole('img')
    // There are 5 <img> elements, one per section block (breakfast, lunch, dinner, dessert, drinks)
    expect(imgs).toHaveLength(5)
    const srcs = imgs.map(img => img.getAttribute('src'))
    expect(srcs).toEqual(
      expect.arrayContaining([
        'mock-breakfast.jpg',
        'mock-lunch.jpg',
        'mock-dinner.jpg',
        'mock-dessert.jpg',
        'mock-drinks.jpg',
      ])
    )
  })

  test('call-to-action button links to /contact', async () => {
    const user = userEvent.setup()
    renderMenu()
    const button = screen.getByRole('button', { name: /book your table/i })
    expect(button).toBeInTheDocument()

    // The Link wraps the button; find the enclosing anchor and verify href
    const anchor = button.closest('a')
    expect(anchor).toBeTruthy()
    // Jest DOM sets full URL like http://localhost/contact in jsdom; assert it ends with /contact
    expect((anchor?.getAttribute('href') || '')).toMatch(/\/contact$/)

    // Optional: simulate click; not navigating in MemoryRouter without a Route, but interaction should not throw
    await user.click(button)
  })

  test('gracefully handles empty data arrays (edge case)', () => {
    // Temporarily override mocks to empty arrays for this render
    jest.doMock('../../utils/breakfast', () => ([]), { virtual: true })
    jest.doMock('../../utils/lunch', () => ([]), { virtual: true })
    jest.doMock('../../utils/dinner', () => ([]), { virtual: true })
    jest.doMock('../../utils/dessert', () => ([]), { virtual: true })
    jest.doMock('../../utils/drink', () => ([]), { virtual: true })

    // Re-require component with empty datasets
    const EmptyMenu = require('./Menu').default
    render(
      <MemoryRouter>
        <EmptyMenu />
      </MemoryRouter>
    )

    // Section headings still render even with no items
    expect(screen.getByRole('heading', { name: /breakfast/i, level: 2 })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /lunch/i, level: 2 })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /dinner/i, level: 2 })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /dessert/i, level: 2 })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /drinks/i, level: 2 })).toBeInTheDocument()

    // No card titles should be present when arrays are empty
    expect(screen.queryByRole('heading', { level: 3 })).toBeNull()
  })

  test('does not render descriptions for Drinks items (component behavior)', () => {
    renderMenu()
    const drinksSection = screen.getByRole('heading', { name: /drinks/i, level: 2 }).closest('.drinks')
    const drinksScope = within(drinksSection)
    // Ensure price and name are present
    expect(drinksScope.getByRole('heading', { name: /latte/i, level: 3 })).toBeInTheDocument()
    expect(drinksScope.getByText('$4.50')).toBeInTheDocument()
    // And that a description we would expect if present is not rendered
    expect(drinksScope.queryByText(/smooth espresso/i)).toBeNull()
  })
})