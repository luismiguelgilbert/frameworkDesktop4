import index from './index'
export const updateState = (state, value) => {
    state[value.key] = value.value
}

export const updateEditData = (state, value) => {
    state.editData[value.section][value.key] = value.value
}

export const updateEditDataPricelists = (state, value) => {
    state.editData.pricelists = value
}

export const updateEditDataPaytermns = (state, value) => {
    state.editData.payterms = value
}
  

export const resetToDefaultState = (state) => {
    Object.keys(index.intialState).map(x=>{
        state[x] = index.intialState[x]
    })
}
