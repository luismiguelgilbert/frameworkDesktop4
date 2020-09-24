import index from './index'
export const updateState = (state, value) => {
    state[value.key] = value.value
}

export const updateEditData = (state, value) => {
    state.editData[value.section][value.key] = value.value
}

export const updateEditDataTickedLinks = (state, value) => {
    let resultado = []
    value.map(x=>{resultado.push({sys_link_id: x})})
    state.editData.ticked_links = resultado
}

export const updateEditDataTickedLinksMobile = (state, value) => {
    let resultado = []
    value.map(x=>{resultado.push({sys_link_id: x})})
    state.editData.ticked_links_mobile = resultado
}



export const updateEditDataUsers = (state, value) => {
    state.editData.users = value
}

export const updateEditDataRucLengths = (state, value) => {
  state.editData.rucLengths = value
}

export const resetToDefaultState = (state) => {
    Object.keys(index.intialState).map(x=>{
        state[x] = index.intialState[x]
    })
}
