import { create } from 'zustand'

const useEditorStore = create((set) => ({
  templateType: 'post',       // 'post' | 'story'
  templateName: 'producto',   // 'producto' | 'oferta' | 'tip'

  fields: {
    nombre: 'iPhone 15 Pro',
    precio: '$999',
    specs: ['128GB', 'Titanio', 'USB-C'],
    descuento: '20%',
    codigo: 'FEB20',
    vigencia: 'Hasta el 31/03',
    tip: '',
    badge: 'NUEVO',
  },

  selectedNetworks: ['instagram'],
  caption: '',
  scheduledAt: null,

  setTemplate: (type, name) =>
    set({ templateType: type, templateName: name }),

  setField: (key, value) =>
    set((state) => ({
      fields: { ...state.fields, [key]: value },
    })),

  addSpec: (spec) =>
    set((state) => ({
      fields: {
        ...state.fields,
        specs: [...(state.fields.specs || []), spec],
      },
    })),

  removeSpec: (index) =>
    set((state) => ({
      fields: {
        ...state.fields,
        specs: state.fields.specs.filter((_, i) => i !== index),
      },
    })),

  toggleNetwork: (network) =>
    set((state) => {
      const selected = state.selectedNetworks
      const exists = selected.includes(network)
      return {
        selectedNetworks: exists
          ? selected.filter((n) => n !== network)
          : [...selected, network],
      }
    }),

  setCaption: (text) => set({ caption: text }),

  setScheduledAt: (date) => set({ scheduledAt: date }),

  resetEditor: () =>
    set({
      templateType: 'post',
      templateName: 'producto',
      fields: {
        nombre: 'iPhone 15 Pro',
        precio: '$999',
        specs: ['128GB', 'Titanio', 'USB-C'],
        descuento: '20%',
        codigo: 'FEB20',
        vigencia: 'Hasta el 31/03',
        tip: '',
        badge: 'NUEVO',
      },
      selectedNetworks: ['instagram'],
      caption: '',
      scheduledAt: null,
    }),
}))

export default useEditorStore
