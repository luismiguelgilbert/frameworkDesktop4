export default function () {
  return {
      loadingData: true
     ,isFiltersDrawerVisible: false
     ,isColumnsDrawerVisible: false
     ,columnsSystem: []
     ,columnsUser: []
     ,filters: []
     ,filtersDetails: []
     ,currentFilter: []
     ,currentFilterSearch: ''
     ,selectedRows: []
     ,pagination: {
       descending: false,
       page: 1,
       rowsNumber: 0,
       rowsPerPage: 50,
       sortBy: ''
     }
     ,security: []
     ,editRecord: null
     ,editMode: false //false = edit || new = new
     ,editData: {
        basic: {}
       ,lines: []
       ,linesTaxes: []
       ,requisiciones: []
       ,files: []
       ,history: []
     }
     ,moduleReports: []
     ,tableContextMenu: [
      {
        id: 1
       ,menuText: 'Documento'
       ,menuTitle: 'Ver Documento'
       ,menuAction: 'downloadReportForm'
       ,menuIcon: 'fas fa-print'
      },
      {
        id: 2
       ,menuText: 'Enviar Documento'
       ,menuTitle: 'Enviar por Correo'
       ,menuAction: 'openSendMail'
       ,menuIcon: 'fas fa-envelope'
      }
    ]
  }
}
