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
       ,coordinates: []
       ,lookup_bitaPlaces: []
       ,lookup_bitaRoutes: []
       ,lookup_bitaRoutesFreq: []
       ,lookup_bitaRoundsFreqCycle: []
       ,history: []
     }
     ,moduleReports: []
  }
}