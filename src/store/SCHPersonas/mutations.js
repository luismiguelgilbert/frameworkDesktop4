import index from './index'
export const updateState = (state, value) => {
    state[value.key] = value.value
}

export const updateEditData = (state, value) => {
    state.editData[value.section][value.key] = value.value
}

export const updateEditDataPhones = (state, value) => {
    state.editData.phones = value
}

export const updateEditDataAddress = (state, value) => {
  state.editData.address = value
}

export const updateEditDataMails = (state, value) => {
  state.editData.mails = value
}

export const updateEditDataChildren = (state, value) => {
  state.editData.children = value
}

export const updateEditDataGroups = (state, value) => {
  state.editData.groups = value
}

export const updateEditDataApostolados = (state, value) => {
  state.editData.apostolados = value
}

export const updateEditDataFormaciones = (state, value) => {
  state.editData.formaciones = value
}

export const updateEditDataJobs = (state, value) => {
  state.editData.jobs = value
}
export const resetToDefaultState = (state) => {
    Object.keys(index.intialState).map(x=>{
        state[x] = index.intialState[x]
    })
}
