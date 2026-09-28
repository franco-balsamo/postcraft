import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,

      setAuth: (user, token) => {
        window.localStorage.setItem('postcraft_token', token)
        set({ user, token })
      },

      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),

      logout: () => {
        window.localStorage.removeItem('postcraft_token')
        window.localStorage.removeItem('postcraft_user')
        set({ user: null, token: null })
      },
    }),
    {
      name: 'postcraft_auth',
      storage: createJSONStorage(() => window.localStorage),
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
)

export default useAuthStore
