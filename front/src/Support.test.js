import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Support from '../pages/Support/Support';
import { AuthContext } from '../context/AuthContext';

// Mock user data
const mockUser = {
  id: 1,
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  club: 'Test Club',
  role: 'user'
};

const mockAuthContext = {
  user: mockUser,
  isAuthenticated: true,
  login: jest.fn(),
  logout: jest.fn(),
  userRole: 'user'
};

const renderWithContext = (component) => {
  return render(
    <BrowserRouter>
      <AuthContext.Provider value={mockAuthContext}>
        {component}
      </AuthContext.Provider>
    </BrowserRouter>
  );
};

describe('Support Component', () => {
  test('renders support page header', () => {
    renderWithContext(<Support />);
    const headerElement = screen.getByText(/Centre de Support/i);
    expect(headerElement).toBeInTheDocument();
  });

  test('displays user information', () => {
    renderWithContext(<Support />);
    expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
    expect(screen.getByText(/john.doe@example.com/i)).toBeInTheDocument();
    expect(screen.getByText(/Test Club/i)).toBeInTheDocument();
  });

  test('renders support categories', () => {
    renderWithContext(<Support />);
    expect(screen.getByText(/Problèmes techniques/i)).toBeInTheDocument();
    expect(screen.getByText(/Gestion de compte/i)).toBeInTheDocument();
    expect(screen.getByText(/Tournois/i)).toBeInTheDocument();
    expect(screen.getByText(/Question générale/i)).toBeInTheDocument();
  });

  test('renders FAQ section', () => {
    renderWithContext(<Support />);
    expect(screen.getByText(/Questions fréquentes/i)).toBeInTheDocument();
    expect(screen.getByText(/Comment créer un tournoi/i)).toBeInTheDocument();
  });
});
