export default function () {
    return {
      //Nuevos
       toolbarSearchString: ''          //mainView                    =>  Campo de texto de Búsqueda del Toolbar
      ,isFiltersDrawerVisible: false    //mainViewFilter              =>  Muestra/Oculta Dialog de Filtros
      ,isColumnsDrawerVisible: false    //mainViewColumns             =>  Muestra/Oculta Dialog de Columnas
      ,isColumnsDrawerVisible: false    //mainViewColumns             =>  Muestra/Oculta Dialog de Columnas
      ,defaultSortColumn: ''            //mainView, mainViewColumns   =>  Muestra/Oculta Dialog de Columnas
      ,defaultSortDescending: false     //mainView, mainViewColumns   =>  Muestra/Oculta Dialog de Columnas
      ,columnsSystem: []                //mainView, mainViewColumns   =>  Sirve para configurar columnas
      ,columnsUser: []                  //mainView, mainViewColumns   =>  Sirve para mostrar/ocultar/ordenar columnas por usuario
      ,columnKeyName: ''                //mainViewTable               =>  Se guarda el PK de la tabla (es 1 columna)
      ,columnsLookupData: {}            //mainView, mainViewTable     =>  Sirve para traducir HeaderFilters a Datos (en vez de texto)
      ,security: []                     //mainView, mainViewToolbar   =>  Controla permisos
      ,moduleReports: []                //mainViewToolbar             =>  Lista de Reportes del Sistema
      ,isLookupDataLoaded: false          //mainView                    =>  Controla si es la 1a carga (x ejemplo, se carga filtro predeterminado, se actualizan columnas, etc)
      ,isModuleDataLoaded: false          //mainView                    =>  Controla si es la 1a carga (x ejemplo, se carga filtro predeterminado, se actualizan columnas, etc)
      ,isFirstOpen: true                //mainView                    =>  Controla si es la 1a carga (x ejemplo, se carga filtro predeterminado, se actualizan columnas, etc)
      ,dxdatagridState: null            //mainViewTable               =>  Guarda el state del grid
      ,editStatus: { 
        editMode: 'create', 
        copyRecord: 0,
        navigateToRecord: 0
      },
      editConfig: { 
        spSelectName: null,
        spUpdateName: null,
        toolbarTitle: null,
        startTab: null,
        moduleTabs: [],
        editDataSaveProperties: []
      }
      ,editData: {}
      ,filters: []
      ,rptName: ''
      ,rptLink: ''
      ,rptLinkCompany: false
      ,rptType: 'ssrs'
      ,isFilterApplied: false
      ,toolbarExtraButtons: []

     
       
    }
  }
  