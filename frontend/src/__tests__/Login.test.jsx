import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import Login from '../pages/Login'

// mock del api y del store
vi.mock('../api/auth', () => ({ login: vi.fn() }))
vi.mock('../store/authStore', () => ({
  default: vi.fn(() => ({
    setAuth: vi.fn(),
    token: null,
  })),
}))

// react-router navigate mock
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal()
  return { ...actual, useNavigate: () => mockNavigate }
})

function renderLogin() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    </QueryClientProvider>
  )
}

describe('Login', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renderiza el formulario', () => {
    renderLogin()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument()
  })

  it('muestra error si el email está vacío', async () => {
    renderLogin()
    await userEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }))
    expect(await screen.findByText(/email es requerido/i)).toBeInTheDocument()
  })

  it('muestra error si la contraseña tiene menos de 8 caracteres', async () => {
    renderLogin()
    await userEvent.type(screen.getByLabelText(/email/i), 'test@test.com')
    await userEvent.type(screen.getByLabelText(/contraseña/i), 'abc')
    await userEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }))
    expect(await screen.findByText(/mínimo 8/i)).toBeInTheDocument()
  })

  it('llama al api login con los datos correctos', async () => {
    const { login } = await import('../api/auth')
    login.mockResolvedValueOnce({ token: 'tok', user: { id: '1', email: 'test@test.com', plan: 'free' } })

    renderLogin()
    await userEvent.type(screen.getByLabelText(/email/i), 'test@test.com')
    await userEvent.type(screen.getByLabelText(/contraseña/i), 'Password1')
    await userEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }))

    await waitFor(() => {
      // React Query v5 passes a context object as second arg to mutationFn
      expect(login.mock.calls[0][0]).toEqual({ email: 'test@test.com', password: 'Password1' })
    })
  })

  it('muestra el error de la api si el login falla', async () => {
    const { login } = await import('../api/auth')
    login.mockRejectedValueOnce(new Error('Unauthorized'))

    renderLogin()
    await userEvent.type(screen.getByLabelText(/email/i), 'test@test.com')
    await userEvent.type(screen.getByLabelText(/contraseña/i), 'Password1')
    await userEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }))

    expect(await screen.findByText(/credenciales incorrectas/i)).toBeInTheDocument()
  })
})
