import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import Register from '../pages/Register'

vi.mock('../api/auth', () => ({ register: vi.fn() }))
vi.mock('../store/authStore', () => ({
  default: vi.fn(() => ({
    setAuth: vi.fn(),
    token: null,
  })),
}))

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal()
  return { ...actual, useNavigate: () => mockNavigate }
})

function renderRegister() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    </QueryClientProvider>
  )
}

describe('Register', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renderiza todos los campos del formulario', () => {
    renderRegister()
    expect(screen.getByLabelText(/nombre/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^contraseña$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/confirmar/i)).toBeInTheDocument()
  })

  it('muestra error si las contraseñas no coinciden', async () => {
    renderRegister()
    await userEvent.type(screen.getByLabelText(/nombre/i), 'Franco')
    await userEvent.type(screen.getByLabelText(/email/i), 'franco@test.com')
    await userEvent.type(screen.getByLabelText(/^contraseña$/i), 'Password1')
    await userEvent.type(screen.getByLabelText(/confirmar/i), 'Password2')
    await userEvent.click(screen.getByRole('button', { name: /crear cuenta/i }))

    expect(await screen.findByText(/no coinciden/i)).toBeInTheDocument()
  })

  it('rechaza password sin mayúscula', async () => {
    renderRegister()
    await userEvent.type(screen.getByLabelText(/nombre/i), 'Franco')
    await userEvent.type(screen.getByLabelText(/email/i), 'franco@test.com')
    await userEvent.type(screen.getByLabelText(/^contraseña$/i), 'password1')
    await userEvent.type(screen.getByLabelText(/confirmar/i), 'password1')
    await userEvent.click(screen.getByRole('button', { name: /crear cuenta/i }))

    expect(await screen.findByText(/mayúscula/i)).toBeInTheDocument()
  })

  it('rechaza password sin número', async () => {
    renderRegister()
    await userEvent.type(screen.getByLabelText(/nombre/i), 'Franco')
    await userEvent.type(screen.getByLabelText(/email/i), 'franco@test.com')
    await userEvent.type(screen.getByLabelText(/^contraseña$/i), 'Passworddd')
    await userEvent.type(screen.getByLabelText(/confirmar/i), 'Passworddd')
    await userEvent.click(screen.getByRole('button', { name: /crear cuenta/i }))

    expect(await screen.findByText(/número/i)).toBeInTheDocument()
  })

  it('llama a la api con los datos correctos', async () => {
    const { register } = await import('../api/auth')
    register.mockResolvedValueOnce({
      token: 'tok',
      user: { id: '1', email: 'franco@test.com', plan: 'free' },
    })

    renderRegister()
    await userEvent.type(screen.getByLabelText(/nombre/i), 'Franco')
    await userEvent.type(screen.getByLabelText(/email/i), 'franco@test.com')
    await userEvent.type(screen.getByLabelText(/^contraseña$/i), 'Password1')
    await userEvent.type(screen.getByLabelText(/confirmar/i), 'Password1')
    await userEvent.click(screen.getByRole('button', { name: /crear cuenta/i }))

    await waitFor(() => {
      // React Query v5 passes a context object as second arg to mutationFn
      expect(register.mock.calls[0][0]).toEqual({
        name: 'Franco',
        email: 'franco@test.com',
        password: 'Password1',
      })
    })
  })
})
