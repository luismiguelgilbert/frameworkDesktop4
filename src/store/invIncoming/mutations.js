import index from './index'
export const updateState = (state, value) => {
    state[value.key] = value.value
}

export const updateEditData = (state, value) => {
    state.editData[value.section][value.key] = value.value
}

export const updateEditDataLines = (state, value) => {
    let contador = 1
    state.editData.lines = value
    state.editData.accountLines = []
    state.editData.lines.filter(x=>x.newQuantity>0).map(linea=>{
        state.editData.accountLines.push({
             lineID: contador
            ,accountID: linea.accInventory
            ,partnerID: state.editData.basic.partnerID
            ,invID: linea.invID
            ,debit: linea.newQuantity * linea.price
            ,credit: 0
            ,prjID: linea.prjID
            ,stockID: linea.stockID
            ,comments: linea.invName
        })
        contador++;
        state.editData.accountLines.push({
            lineID: contador
           ,accountID: linea.accAllocation
           ,partnerID: state.editData.basic.partnerID
           ,invID: linea.invID
           ,debit: 0
           ,credit: linea.newQuantity * linea.price
           ,prjID: linea.prjID
           ,stockID: linea.stockID
           ,comments: linea.invName
       })
       contador++;
    })
}

export const updateEditDataFiles = (state, value) => {
  state.editData.files = value
}

export const resetToDefaultState = (state) => {
    Object.keys(index.intialState).map(x=>{
        state[x] = index.intialState[x]
    })
}
