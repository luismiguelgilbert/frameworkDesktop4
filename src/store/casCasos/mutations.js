import index from './index'
export const updateState = (state, value) => {
    state[value.key] = value.value
}

export const updateEditData = (state, value) => {
    state.editData[value.section][value.key] = value.value
}

export const updateEditDataUsers = (state, value) => {
    state.editData.users = value
}

export const updateEditDataFiles = (state, value) => {
  state.editData.files = value
}

export const updateEditDataLocations = (state, value) => {
  state.editData.locations = value
}

export const updateEditDataContacts = (state, value) => {
    state.editData.contacts = value
}

export const updateEditDataPayterms = (state, value) => {
    state.editData.payterms = value
}

export const resetToDefaultState = (state) => {
    Object.keys(index.intialState).map(x=>{
        state[x] = index.intialState[x]
    })
}
