import index from './index'
export const updateState = (state, value) => {
    state[value.key] = value.value
}

export const updateEditData = (state, value) => {
    state.editData[value.section][value.key] = value.value
}

export const updateEditDataPartners = (state, value) => {
    state.editData.partners = value
}

export const updateEditDataFiles = (state, value) => {
  state.editData.files = value
}

export const updateEditDataPricelists = (state, value) => {
  state.editData.pricelists = value
}

export const updateEditDataBins = (state, value) => {
  state.editData.bins = value
}

export const updateEditDataTaxes = (state, value) => {
  state.editData.taxes = value
}

export const updateEditDataBoM = (state, value) => {
  state.editData.bom = value
}


export const resetToDefaultState = (state) => {
    Object.keys(index.intialState).map(x=>{
        state[x] = index.intialState[x]
    })
}
