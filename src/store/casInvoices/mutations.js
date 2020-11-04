import index from './index'
export const updateState = (state, value) => {
    state[value.key] = value.value
}

export const updateEditData = (state, value) => {
    state.editData[value.section][value.key] = value.value
}

export const updateEditDataLookupPayterms = (state, value) => {
    state.editData.lookup_payterms = value
  }

export const updateEditDataPayterms = (state, value) => {
    state.editData.payterms = value
}

export const updateEditDataPayments = (state, value) => {
    state.editData.payments = value
}

export const updateEditDataFiles = (state, value) => {
  state.editData.files = value
}

export const resetToDefaultState = (state) => {
    Object.keys(index.intialState).map(x=>{
        state[x] = index.intialState[x]
    })
}
