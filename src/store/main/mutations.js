import index from './index'
export const updateState = (state, value) => {
    state[value.key] = value.value
}

export const resetToDefaultState = (state) => {
    Object.keys(index.intialState).map(x=>{
        state[x] = index.intialState[x]
    })
}