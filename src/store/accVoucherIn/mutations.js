import typicalInitState from './../typicalInitState'
import Vue from 'vue'

export const updateState = (state, value) => {
    state[value.key] = value.value
}

export const updateEditData = (state, value) => {
    state.editData[value.section][value.key] = value.value
}

export const updateEditDataAttribute = (state, value) => {
    state.editData[value.key] = value.value
}

export const updateEditDataFiles = (state, value) => {
  state.editData.files = value
}

export const resetToDefaultState = (state) => {
    Object.keys(typicalInitState()).forEach(key => {
        Vue.set(state, key, typicalInitState()[key])
    })
}