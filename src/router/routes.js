
const routes = [
  { path: '/login', name: 'login', component: () => import('pages/login.vue') },
  { path: '/loginENS', name: 'loginENS', component: () => import('pages/loginENS.vue') },
  { path: '/loginSchoenstatt', name: 'loginSchoenstatt', component: () => import('pages/loginSchoenstatt.vue') },
  { path: '/forgotPassword', name: 'forgotPassword', component: () => import('pages/forgotPassword.vue') },
  {
    path: '/', component: () => import('layouts/MainLayout.vue'), meta:{ breadcrumb: [ {name: 'Inicio', icon: 'fas fa-home' } ] },
    children: [
      { path: '', component: () => import('pages/Index.vue') }
      //system Routes
      ,{ path: 'RootPreferences', component: () => import('pages/RootPreferences/RootPreferences.vue') }
      
      ,{ path: 'mainReport', component: () => import('components/mainReport/reportComponent.vue') }
      
      //Notifications
      //,{ path: 'RootNotifications', component: () => import('pages/RootNotifications/RootNotifications.vue') }
      ,{ path: 'RootNotifications', component: () => import('pages/RootNotifications/main.vue')
        ,children: [
           { path: '/', component: () => import('../components/mainView/mainView.vue') }
          ,{ path: ':id', component: () => import('pages/RootNotifications/edit.vue') }
        ] 
      }
      //RootSystem
      ,{ path: 'RootSystem/Users', component: () => import('pages/RootSystem/Users/main.vue')
        ,children: [
           { path: '/', component: () => import('../components/mainView/mainView.vue') }
          ,{ path: ':id', component: () => import('pages/RootSystem/Users/edit.vue') }
        ] 
      }
      ,{ path: 'RootSystem/Roles', component: () => import('pages/RootSystem/Roles/main.vue')
        ,children: [
           { path: '/', component: () => import('../components/mainView/mainView.vue') }
          ,{ path: ':id', component: () => import('pages/RootSystem/Roles/edit.vue') }
        ] 
      }
      ,{ path: 'RootSystem/Companies', component: () => import('pages/RootSystem/Companies/main.vue')
        ,children: [
           { path: '/', component: () => import('../components/mainView/mainView.vue') }
          ,{ path: ':id', component: () => import('pages/RootSystem/Companies/edit.vue') }
        ] 
      }
      ,{ path: 'RootSystem/Modules', component: () => import('pages/RootSystem/Modules/main.vue')
        ,children: [
           { path: '/', component: () => import('../components/mainView/mainView.vue') }
          ,{ path: ':id', component: () => import('pages/RootSystem/Modules/edit.vue') }
        ] 
      }
      ,{ path: 'RootSystem/Notifications', component: () => import('pages/RootSystem/Notifications/main.vue')
        ,children: [
           { path: '/', component: () => import('../components/mainView/mainView.vue') }
          ,{ path: ':id', component: () => import('pages/RootSystem/Notifications/edit.vue') }
        ] 
      }
      ,{ path: 'RootSystem/TaxesMaster', component: () => import('pages/RootSystem/TaxesMaster/main.vue')
        ,children: [
           { path: '/', component: () => import('../components/mainView/mainView.vue') }
          ,{ path: ':id', component: () => import('pages/RootSystem/TaxesMaster/edit.vue') }
        ] 
      }
      //BITACORA
      ,{ path: 'RootBitacora/Bitaplaces', component: () => import('pages/RootBitacora/Bitaplaces/main.vue')
        ,children: [
           { path: '/', component: () => import('../components/mainView/mainView.vue') }
          ,{ path: ':id', component: () => import('pages/RootBitacora/Bitaplaces/edit.vue') }
        ] 
      }
      ,{ path: 'RootBitacora/Bitacars', component: () => import('pages/RootBitacora/Bitacars/main.vue')
        ,children: [
           { path: '/', component: () => import('../components/mainView/mainView.vue') }
          ,{ path: ':id', component: () => import('pages/RootBitacora/Bitacars/edit.vue') }
        ] 
      }
      ,{ path: 'RootBitacora/Bitaevents', component: () => import('pages/RootBitacora/Bitaevents/main.vue')
        ,children: [
           { path: '/', component: () => import('pages/RootBitacora/Bitaevents/mainView.vue') } /*especial, porque tiene un filtro extra*/
          ,{ path: ':id', component: () => import('pages/RootBitacora/Bitaevents/edit.vue') }
        ] 
      }
      ,{ path: 'RootBitacora/Bitapeople', component: () => import('pages/RootBitacora/Bitapeople/main.vue')
        ,children: [
           { path: '/', component: () => import('pages/RootBitacora/Bitapeople/mainView.vue') } /*especial, porque tiene un filtro extra*/
          ,{ path: ':id', component: () => import('pages/RootBitacora/Bitapeople/edit.vue') }
        ] 
      }
      ,{ path: 'RootBitacora/Bitarides', component: () => import('pages/RootBitacora/Bitarides/main.vue')
        ,children: [
           { path: '/', component: () => import('pages/RootBitacora/Bitarides/mainView.vue') } /*especial, porque tiene un filtro extra*/
          ,{ path: ':id', component: () => import('pages/RootBitacora/Bitarides/edit.vue') }
        ] 
      }
      ,{ path: 'RootBitacora/Bitadashboard', component: () => import('pages/RootBitacora/Bitadashboard/main.vue')
        /*,children: [
           { path: '/', component: () => import('pages/RootBitacora/Bitadashboard/mainView.vue') }
        ]*/
      }
      ,{ path: 'RootBitacora/BitaRoutes', component: () => import('pages/RootBitacora/BitaRoutes/main.vue')
        ,children: [
           { path: '/', component: () => import('../components/mainView/mainView.vue') }
          ,{ path: ':id', component: () => import('pages/RootBitacora/BitaRoutes/edit.vue') }
        ] 
      }
      ,{ path: 'RootBitacora/BitaRounds', component: () => import('pages/RootBitacora/BitaRounds/main.vue')
        ,children: [
           { path: '/', component: () => import('../components/mainView/mainView.vue') }
          ,{ path: ':id', component: () => import('pages/RootBitacora/BitaRounds/edit.vue') }
        ] 
      }
      ,{ path: 'RootBitacora/Bitaconsola', component: () => import('pages/RootBitacora/Bitaconsola/main.vue')
        ,children: [
           { path: '/', component: () => import('../components/mainView/mainView.vue') }
          ,{ path: ':id', component: () => import('pages/RootBitacora/Bitaconsola/edit.vue') }
        ] 
      }
      ,{ path: 'RootBitacora/Bitacars', component: () => import('pages/RootBitacora/Bitacars/main.vue')
        ,children: [
           { path: '/', component: () => import('../components/mainView/mainView.vue') }
          ,{ path: ':id', component: () => import('pages/RootBitacora/Bitacars/edit.vue') }
        ] 
      }
      ,{ path: 'RootBitacora/UserBitacoraRounds', component: () => import('pages/RootBitacora/UserBitacoraRounds/main.vue')
        ,children: [
           { path: '/', component: () => import('../components/mainView/mainView.vue') }
          ,{ path: ':id', component: () => import('pages/RootBitacora/UserBitacoraRounds/edit.vue') }
        ] 
      }
      
      //ROOT_MASTER
      ,{ path: 'RootMaster/Partners', component: () => import('pages/RootMaster/Partners/main.vue')
        ,children: [
           { path: '/', component: () => import('../components/mainView/mainView.vue') }
          ,{ path: ':id', component: () => import('pages/RootMaster/Partners/edit.vue') }
        ] 
      }
      ,{ path: 'RootMaster/Items', component: () => import('pages/RootMaster/Items/main.vue')
        ,children: [
           { path: '/', component: () => import('../components/mainView/mainView.vue') }
          ,{ path: ':id', component: () => import('pages/RootMaster/Items/edit.vue') }
        ] 
      }
      ,{ path: 'RootMaster/Warehouses', component: () => import('pages/RootMaster/Warehouses/main.vue')
        ,children: [
           { path: '/', component: () => import('../components/mainView/mainView.vue') }
          ,{ path: ':id', component: () => import('pages/RootMaster/Warehouses/edit.vue') }
        ] 
      }
      ,{ path: 'RootMaster/UoM', component: () => import('pages/RootMaster/UoM/main.vue')
        ,children: [
           { path: '/', component: () => import('../components/mainView/mainView.vue') }
          ,{ path: ':id', component: () => import('pages/RootMaster/UoM/edit.vue') }
        ] 
      }
      ,{ path: 'RootMaster/Brands', component: () => import('pages/RootMaster/Brands/main.vue')
        ,children: [
           { path: '/', component: () => import('../components/mainView/mainView.vue') }
          ,{ path: ':id', component: () => import('pages/RootMaster/Brands/edit.vue') }
        ] 
      }
      ,{ path: 'RootMaster/InvTypes', component: () => import('pages/RootMaster/InvTypes/main.vue')
        ,children: [
           { path: '/', component: () => import('../components/mainView/mainView.vue') }
          ,{ path: ':id', component: () => import('pages/RootMaster/InvTypes/edit.vue') }
        ] 
      }
      ,{ path: 'RootMaster/InvTypes', component: () => import('pages/RootMaster/InvTypes/main.vue')
        ,children: [
           { path: '/', component: () => import('../components/mainView/mainView.vue') }
          ,{ path: ':id', component: () => import('pages/RootMaster/InvTypes/edit.vue') }
        ] 
      }

      //ENS
      ,{ path: 'RootENS/ENSEquipistas', component: () => import('pages/RootENS/ENSEquipistas/main.vue')
        ,children: [
           { path: '/', component: () => import('../components/mainView/mainView.vue') }
          ,{ path: ':id', component: () => import('pages/RootENS/ENSEquipistas/edit.vue') }
        ] 
      }
      ,{ path: 'RootENS/ENSEquipista', component: () => import('pages/RootENS/ENSEquipista/main.vue')
        ,children: [
          { path: '/', component: () => import('pages/RootENS/ENSEquipista/edit.vue') }
        ] 
      }
      ,{ path: 'RootENS/ENSTeams', component: () => import('pages/RootENS/ENSTeams/main.vue')
        ,children: [
           { path: '/', component: () => import('../components/mainView/mainView.vue') }
          ,{ path: ':id', component: () => import('pages/RootENS/ENSTeams/edit.vue') }
        ] 
      }
      ,{ path: 'RootENS/ENSServicios', component: () => import('pages/RootENS/ENSServicios/main.vue')
        ,children: [
           { path: '/', component: () => import('../components/mainView/mainView.vue') }
          ,{ path: ':id', component: () => import('pages/RootENS/ENSServicios/edit.vue') }
        ] 
      }
      ,{ path: 'RootENS/ENSLibros', component: () => import('pages/RootENS/ENSLibros/main.vue')
        ,children: [
           { path: '/', component: () => import('../components/mainView/mainView.vue') }
          ,{ path: ':id', component: () => import('pages/RootENS/ENSLibros/edit.vue') }
        ] 
      }
      ,{ path: 'RootENS/ENSMeet', component: () => import('pages/RootENS/ENSMeet/main.vue')
        ,children: [
           { path: '/', component: () => import('../components/mainView/mainView.vue') }
          ,{ path: ':id', component: () => import('pages/RootENS/ENSMeet/edit.vue') }
        ] 
      }
      ,{ path: 'RootENS/ENSMeetPilot', component: () => import('pages/RootENS/ENSMeetPilot/main.vue')
        ,children: [
           { path: '/', component: () => import('../components/mainView/mainView.vue') }
          ,{ path: ':id', component: () => import('pages/RootENS/ENSMeetPilot/edit.vue') }
        ] 
      }
      ,{ path: 'RootENS/ENSMeetWork', component: () => import('pages/RootENS/ENSMeetWork/main.vue')
        ,children: [
           { path: '/', component: () => import('../components/mainView/mainView.vue') }
          ,{ path: ':id', component: () => import('pages/RootENS/ENSMeetWork/edit.vue') }
        ] 
      }
      ,{ path: 'RootENS/ENSJobSearch', component: () => import('pages/RootENS/ENSJobSearch/main.vue')
        ,children: [
          { path: '/', component: () => import('pages/RootENS/ENSJobSearch/edit.vue') }
        ] 
      }
      ,{ path: 'RootENS/ENSCalendar', component: () => import('pages/RootENS/ENSCalendar/main.vue')
        ,children: [
          { path: '/', component: () => import('pages/RootENS/ENSCalendar/edit.vue') }
        ] 
      }
      ,{ path: 'RootENS/ENSDashboard', component: () => import('pages/RootENS/ENSDashboard/main.vue')
        /*,children: [
           { path: '/', component: () => import('pages/RootBitacora/Bitadashboard/mainView.vue') }
        ]*/
      }
      
      
      //FINANZAS
      ,{ path: 'RootAccounting/ChartAccount', component: () => import('pages/RootAccounting/ChartAccount/main.vue')
        ,children: [
           { path: '/', component: () => import('../components/mainView/mainView.vue') }
          ,{ path: ':id', component: () => import('pages/RootAccounting/ChartAccount/edit.vue') }
        ] 
      }
      ,{ path: 'RootAccounting/Taxes', component: () => import('pages/RootAccounting/Taxes/main.vue')
        ,children: [
           { path: '/', component: () => import('../components/mainView/mainView.vue') }
          ,{ path: ':id', component: () => import('pages/RootAccounting/Taxes/edit.vue') }
        ] 
      }
      ,{ path: 'RootAccounting/AccPeriods', component: () => import('pages/RootAccounting/AccPeriods/main.vue')
        ,children: [
           { path: '/', component: () => import('../components/mainView/mainView.vue') }
          ,{ path: ':id', component: () => import('pages/RootAccounting/AccPeriods/edit.vue') }
        ] 
      }
      ,{ path: 'RootAccounting/AccMoves', component: () => import('pages/RootAccounting/AccMoves/main.vue')
        ,children: [
           { path: '/', component: () => import('../components/mainView/mainView.vue') }
          ,{ path: ':id', component: () => import('pages/RootAccounting/AccMoves/edit.vue') }
        ] 
      }
      ,{ path: 'RootAccounting/invMasterGroups', component: () => import('pages/RootAccounting/invMasterGroups/main.vue')
        ,children: [
           { path: '/', component: () => import('../components/mainView/mainView.vue') }
          ,{ path: ':id', component: () => import('pages/RootAccounting/invMasterGroups/edit.vue') }
        ] 
      }
      ,{ path: 'RootAccounting/partnerMasterGroups', component: () => import('pages/RootAccounting/partnerMasterGroups/main.vue')
        ,children: [
           { path: '/', component: () => import('../components/mainView/mainView.vue') }
          ,{ path: ':id', component: () => import('pages/RootAccounting/partnerMasterGroups/edit.vue') }
        ] 
      }
      ,{ path: 'RootAccounting/accPaymentMethods', component: () => import('pages/RootAccounting/accPaymentMethods/main.vue')
        ,children: [
           { path: '/', component: () => import('../components/mainView/mainView.vue') }
          ,{ path: ':id', component: () => import('pages/RootAccounting/accPaymentMethods/edit.vue') }
        ] 
      }
      ,{ path: 'RootAccounting/Payterms', component: () => import('pages/RootAccounting/Payterms/main.vue')
        ,children: [
           { path: '/', component: () => import('../components/mainView/mainView.vue') }
          ,{ path: ':id', component: () => import('pages/RootAccounting/Payterms/edit.vue') }
        ] 
      }
      ,{ path: 'RootAccounting/Locations', component: () => import('pages/RootAccounting/Locations/main.vue')
        ,children: [
           { path: '/', component: () => import('../components/mainView/mainView.vue') }
          ,{ path: ':id', component: () => import('pages/RootAccounting/Locations/edit.vue') }
        ] 
      }
      ,{ path: 'RootAccounting/Locations', component: () => import('pages/RootAccounting/Locations/main.vue')
        ,children: [
           { path: '/', component: () => import('../components/mainView/mainView.vue') }
          ,{ path: ':id', component: () => import('pages/RootAccounting/Locations/edit.vue') }
        ] 
      }
      
      //COMPRAS
      ,{ path: 'RootPurchase/mktPR', component: () => import('pages/RootPurchase/mktPR/main.vue')
        ,children: [
           { path: '/', component: () => import('../components/mainView/mainView.vue') }
          ,{ path: ':id', component: () => import('pages/RootPurchase/mktPR/edit.vue') }
        ] 
      }
      ,{ path: 'RootPurchase/mktPO', component: () => import('pages/RootPurchase/mktPO/main.vue')
        ,children: [
           { path: '/', component: () => import('../components/mainView/mainView.vue') }
          ,{ path: ':id', component: () => import('pages/RootPurchase/mktPO/edit.vue') }
        ] 
      }
      ,{ path: 'RootPurchase/mktPORet', component: () => import('pages/RootPurchase/mktPORet/main.vue')
        ,children: [
           { path: '/', component: () => import('../components/mainView/mainView.vue') }
          ,{ path: ':id', component: () => import('pages/RootPurchase/mktPORet/edit.vue') }
        ] 
      }
      ,{ path: 'RootPurchase/mktPORet', component: () => import('pages/RootPurchase/mktPORet/main.vue')
        ,children: [
           { path: '/', component: () => import('../components/mainView/mainView.vue') }
          ,{ path: ':id', component: () => import('pages/RootPurchase/mktPORet/edit.vue') }
        ] 
      }
      ,{ path: 'RootPurchase/accAP', component: () => import('pages/RootPurchase/accAP/main.vue')
        ,children: [
           { path: '/', component: () => import('../components/mainView/mainView.vue') }
          ,{ path: ':id', component: () => import('pages/RootPurchase/accAP/edit.vue') }
        ] 
      }
      ,{ path: 'RootPurchase/accRet', component: () => import('pages/RootPurchase/accRet/main.vue')
        ,children: [
           { path: '/', component: () => import('../components/mainView/mainView.vue') }
          ,{ path: ':id', component: () => import('pages/RootPurchase/accRet/edit.vue') }
        ] 
      }

      //BANK
      ,{ path: 'RootBank/accVoucherOut', component: () => import('pages/RootBank/accVoucherOut/main.vue')
        ,children: [
           { path: '/', component: () => import('../components/mainView/mainView.vue') }
          ,{ path: ':id', component: () => import('pages/RootBank/accVoucherOut/edit.vue') }
        ] 
      }
      ,{ path: 'RootBank/accVoucherIn', component: () => import('pages/RootBank/accVoucherIn/main.vue')
        ,children: [
           { path: '/', component: () => import('../components/mainView/mainView.vue') }
          ,{ path: ':id', component: () => import('pages/RootBank/accVoucherIn/edit.vue') }
        ] 
      }

      //INVENTORY
      //,{ path: 'RootInventory/invQuery', component: () => import('pages/RootInventory/invQuery/invQuery.vue') }
      ,{ path: 'RootInventory/invQuery', component: () => import('pages/RootInventory/invQuery/main.vue') }
      ,{ path: 'RootInventory/invIncoming', component: () => import('pages/RootInventory/invIncoming/main.vue')
        ,children: [
           { path: '/', component: () => import('../components/mainView/mainView.vue') }
          ,{ path: ':id', component: () => import('pages/RootInventory/invIncoming/edit.vue') }
        ] 
      }
      ,{ path: 'RootInventory/invOutgoing', component: () => import('pages/RootInventory/invOutgoing/main.vue')
        ,children: [
           { path: '/', component: () => import('../components/mainView/mainView.vue') }
          ,{ path: ':id', component: () => import('pages/RootInventory/invOutgoing/edit.vue') }
        ] 
      }

      //CASES_LEGAL
      ,{ path: 'RootCases/casClientes', component: () => import('pages/RootCases/casClientes/main.vue')
        ,children: [
           { path: '/', component: () => import('../components/mainView/mainView.vue') }
          ,{ path: ':id', component: () => import('pages/RootCases/casClientes/edit.vue') }
        ] 
      }
      ,{ path: 'RootCases/casCasos', component: () => import('pages/RootCases/casCasos/main.vue')
        ,children: [
           { path: '/', component: () => import('../components/mainView/mainView.vue') }
          ,{ path: ':id', component: () => import('pages/RootCases/casCasos/edit.vue') }
        ] 
      }
      ,{ path: 'RootCases/casTasks', component: () => import('pages/RootCases/casTasks/main.vue')
        ,children: [
           { path: '/', component: () => import('../components/mainView/mainView.vue') }
          ,{ path: ':id', component: () => import('pages/RootCases/casTasks/edit.vue') }
        ] 
      }
      ,{ path: 'RootCases/casCasesTypes', component: () => import('pages/RootCases/casCasesTypes/main.vue')
        ,children: [
           { path: '/', component: () => import('../components/mainView/mainView.vue') }
          ,{ path: ':id', component: () => import('pages/RootCases/casCasesTypes/edit.vue') }
        ] 
      }
      ,{ path: 'RootCases/casTasksTypes', component: () => import('pages/RootCases/casTasksTypes/main.vue')
        ,children: [
           { path: '/', component: () => import('../components/mainView/mainView.vue') }
          ,{ path: ':id', component: () => import('pages/RootCases/casTasksTypes/edit.vue') }
        ] 
      }
      ,{ path: 'RootCases/casLocations', component: () => import('pages/RootCases/casLocations/main.vue')
        ,children: [
           { path: '/', component: () => import('../components/mainView/mainView.vue') }
          ,{ path: ':id', component: () => import('pages/RootCases/casLocations/edit.vue') }
        ] 
      }
      ,{ path: 'RootCases/casContracts', component: () => import('pages/RootCases/casContracts/main.vue')
        ,children: [
           { path: '/', component: () => import('../components/mainView/mainView.vue') }
          ,{ path: ':id', component: () => import('pages/RootCases/casContracts/edit.vue') }
        ] 
      }
      ,{ path: 'RootCases/casInvoices', component: () => import('pages/RootCases/casInvoices/main.vue')
        ,children: [
           { path: '/', component: () => import('../components/mainView/mainView.vue') }
          ,{ path: ':id', component: () => import('pages/RootCases/casInvoices/edit.vue') }
        ] 
      }

      //RRHH
      ,{ path: 'RootHHRR/Employees', component: () => import('pages/RootHHRR/Employees/main.vue')
        ,children: [
           { path: '/', component: () => import('../components/mainView/mainView.vue') }
          ,{ path: ':id', component: () => import('pages/RootHHRR/Employees/edit.vue') }
        ] 
      }
      
      //SCHOENSTATT
      ,{ path: 'RootSchoenstatt/SCHPersonas', component: () => import('pages/RootSchoenstatt/SCHPersonas/main.vue')
        ,children: [
           { path: '/', component: () => import('../components/mainView/mainView.vue') }
          ,{ path: ':id', component: () => import('pages/RootSchoenstatt/SCHPersonas/edit.vue') }
        ] 
      }
      ,{ path: 'RootSchoenstatt/SCHPersona', component: () => import('pages/RootSchoenstatt/SCHPersona/main.vue')
        ,children: [
           //{ path: '/', component: () => import('../components/mainView/mainView.vue') }
           { path: '/', component: () => import('pages/RootSchoenstatt/SCHPersona/edit.vue') }
          //,{ path: ':id', component: () => import('pages/RootSchoenstatt/SCHPersona/edit.vue') }
        ] 
      }
      ,{ path: 'RootSchoenstatt/SCHGroups', component: () => import('pages/RootSchoenstatt/SCHGroups/main.vue')
        ,children: [
           { path: '/', component: () => import('../components/mainView/mainView.vue') }
          ,{ path: ':id', component: () => import('pages/RootSchoenstatt/SCHGroups/edit.vue') }
        ] 
      }
      ,{ path: 'RootSchoenstatt/SCHSectores', component: () => import('pages/RootSchoenstatt/SCHSectores/main.vue')
        ,children: [
           { path: '/', component: () => import('../components/mainView/mainView.vue') }
          ,{ path: ':id', component: () => import('pages/RootSchoenstatt/SCHSectores/edit.vue') }
        ] 
      }
      ,{ path: 'RootSchoenstatt/SCHApostolados', component: () => import('pages/RootSchoenstatt/SCHApostolados/main.vue')
        ,children: [
           { path: '/', component: () => import('../components/mainView/mainView.vue') }
          ,{ path: ':id', component: () => import('pages/RootSchoenstatt/SCHApostolados/edit.vue') }
        ] 
      }
      ,{ path: 'RootSchoenstatt/SCHFormaciones', component: () => import('pages/RootSchoenstatt/SCHFormaciones/main.vue')
        ,children: [
           { path: '/', component: () => import('../components/mainView/mainView.vue') }
          ,{ path: ':id', component: () => import('pages/RootSchoenstatt/SCHFormaciones/edit.vue') }
        ] 
      }

      //MFG
      ,{ path: 'RootMFG/mfgOrders', component: () => import('pages/RootMFG/mfgOrders/main.vue')
        ,children: [
           { path: '/', component: () => import('../components/mainView/mainView.vue') }
          ,{ path: ':id', component: () => import('pages/RootMFG/mfgOrders/edit.vue') }
        ] 
      }
      ,{ path: 'RootMFG/mktMFG', component: () => import('pages/RootMFG/mktMFG/main.vue')
        ,children: [
           { path: '/', component: () => import('../components/mainView/mainView.vue') }
          ,{ path: ':id', component: () => import('pages/RootMFG/mktMFG/edit.vue') }
        ] 
      }
      ,{ path: 'RootMFG/mktMFGreturn', component: () => import('pages/RootMFG/mktMFGreturn/main.vue')
        ,children: [
           { path: '/', component: () => import('../components/mainView/mainView.vue') }
          ,{ path: ':id', component: () => import('pages/RootMFG/mktMFGreturn/edit.vue') }
        ] 
      }
      ,{ path: 'RootMFG/mktPRD', component: () => import('pages/RootMFG/mktPRD/main.vue')
        ,children: [
           { path: '/', component: () => import('../components/mainView/mainView.vue') }
          ,{ path: ':id', component: () => import('pages/RootMFG/mktPRD/edit.vue') }
        ] 
      }
      ,{ path: 'RootMFG/mktPRDreturn', component: () => import('pages/RootMFG/mktPRDreturn/main.vue')
        ,children: [
           { path: '/', component: () => import('../components/mainView/mainView.vue') }
          ,{ path: ':id', component: () => import('pages/RootMFG/mktPRDreturn/edit.vue') }
        ] 
      }
      ,{ path: 'RootMFG/mfgLocations', component: () => import('pages/RootMFG/mfgLocations/main.vue')
        ,children: [
           { path: '/', component: () => import('../components/mainView/mainView.vue') }
          ,{ path: ':id', component: () => import('pages/RootMFG/mfgLocations/edit.vue') }
        ] 
      }
      ,{ path: 'RootMFG/mfgTypes', component: () => import('pages/RootMFG/mfgTypes/main.vue')
        ,children: [
           { path: '/', component: () => import('../components/mainView/mainView.vue') }
          ,{ path: ':id', component: () => import('pages/RootMFG/mfgTypes/edit.vue') }
        ] 
      }
      ,{ path: 'RootMFG/mfgBOM', component: () => import('pages/RootMFG/mfgBOM/main.vue')
        ,children: [
           { path: '/', component: () => import('../components/mainView/mainView.vue') }
          ,{ path: ':id', component: () => import('pages/RootMFG/mfgBOM/edit.vue') }
        ] 
      }
      ,{ path: 'RootMFG/mfgDashboard', component: () => import('pages/RootMFG/mfgDashboard/main.vue')
        /*,children: [
           { path: '/', component: () => import('pages/RootBitacora/Bitadashboard/mainView.vue') }
        ]*/
      }
      
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '*',
    component: () => import('pages/Error404.vue')
  }
]

export default routes
