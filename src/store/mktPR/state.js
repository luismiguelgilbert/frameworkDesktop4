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
       ,files: []
       ,history: []
     }
     ,moduleReports: []
  }
}
