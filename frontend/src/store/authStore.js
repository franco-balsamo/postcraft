import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,

      setAuth: (user, token) => {
        localStorage.setItem('postcraft_token', token)
        set({ user, token })
      },

      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),

      logout: () => {
        localStorage.removeItem('postcraft_token')
        localStorage.removeItem('postcraft_user')
        set({ user: null, token: null })
      },
    }),
    {
      name: 'postcraft_auth',
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
)

export default useAuthStore
