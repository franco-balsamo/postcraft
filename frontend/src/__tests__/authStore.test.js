import { describe, it, expect, beforeEach } from 'vitest'
import { act } from '@testing-library/react'
import useAuthStore from '../store/authStore'

// reset store entre tests
beforeEach(() => {
  act(() => {
    useAuthStore.setState({ user: null, token: null })
  })
})

describe('authStore', () => {
  it('empieza sin usuario ni token', () => {
    const { user, token } = useAuthStore.getState()
    expect(user).toBeNull()
    expect(token).toBeNull()
  })

  it('setAuth guarda el usuario y el token', () => {
    const user = { id: '1', email: 'test@test.com', plan: 'free' }

    act(() => {
      useAuthStore.getState().setAuth(user, 'mi-token')
    })

    const state = useAuthStore.getState()
    expect(state.user).toEqual(user)
    expect(state.token).toBe('mi-token')
  })

  it('logout limpia el estado', () => {
    act(() => {
      useAuthStore.getState().setAuth({ id: '1', email: 'x@x.com' }, 'tok')
    })

    act(() => {
      useAuthStore.getState().logout()
    })

    const { user, token } = useAuthStore.getState()
    expect(user).toBeNull()
    expect(token).toBeNull()
  })

  it('updateUser modifica campos del usuario', () => {
    act(() => {
      useAuthStore.getState().setAuth({ id: '1', email: 'x@x.com', plan: 'free' }, 'tok')
    })

    act(() => {
      useAuthStore.getState().updateUser({ plan: 'pro' })
    })

    expect(useAuthStore.getState().user.plan).toBe('pro')
    expect(useAuthStore.getState().user.email).toBe('x@x.com')
  })
})
