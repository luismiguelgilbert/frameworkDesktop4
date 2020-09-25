
const routes = [
  { path: '/login', name: 'login', component: () => import('pages/login.vue') },
  { path: '/loginENS', name: 'login', component: () => import('pages/loginENS.vue') },
  { path: '/loginSchoenstatt', name: 'login', component: () => import('pages/loginSchoenstatt.vue') },
  {
    path: '/', component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/Index.vue') }
      //system Routes
      ,{ path: 'RootPreferences', component: () => import('pages/RootPreferences/RootPreferences.vue') }
      ,{ path: 'RootNotifications', component: () => import('pages/RootNotifications/RootNotifications.vue') }
      ,{ path: 'mainReport', component: () => import('components/mainReport/reportComponent.vue') }
      //transactional Routes
      //SYSTEM
      ,{ path: 'RootSystem/Users', component: () => import('pages/RootSystem/Users/Users.vue') }
      ,{ path: 'RootSystem/UsersEdit', component: () => import('pages/RootSystem/Users/UsersEdit.vue') }
      ,{ path: 'RootSystem/Roles', component: () => import('pages/RootSystem/Roles/Roles.vue') }
      ,{ path: 'RootSystem/RolesEdit', component: () => import('pages/RootSystem/Roles/RolesEdit.vue') }
      ,{ path: 'RootSystem/Companies', component: () => import('pages/RootSystem/Companies/Companies.vue') }
      ,{ path: 'RootSystem/CompaniesEdit', component: () => import('pages/RootSystem/Companies/CompaniesEdit.vue') }
      ,{ path: 'RootSystem/Modules', component: () => import('pages/RootSystem/Modules/Modules.vue') }
      ,{ path: 'RootSystem/ModulesEdit', component: () => import('pages/RootSystem/Modules/ModulesEdit.vue') }
      ,{ path: 'RootSystem/Notifications', component: () => import('pages/RootSystem/Notifications/Notifications.vue') }
      ,{ path: 'RootSystem/NotificationsEdit', component: () => import('pages/RootSystem/Notifications/NotificationsEdit.vue') }
      ,{ path: 'RootSystem/TaxesMaster', component: () => import('pages/RootSystem/TaxesMaster/TaxesMaster.vue') }
      ,{ path: 'RootSystem/TaxesMasterEdit', component: () => import('pages/RootSystem/TaxesMaster/TaxesMasterEdit.vue') }
      //BITACORA
      ,{ path: 'RootBitacora/Bitaplaces', component: () => import('pages/RootBitacora/Bitaplaces/Bitaplaces.vue') }
      ,{ path: 'RootBitacora/BitaplacesEdit', component: () => import('pages/RootBitacora/Bitaplaces/BitaplacesEdit.vue') }
      ,{ path: 'RootBitacora/Bitacars', component: () => import('pages/RootBitacora/Bitacars/Bitacars.vue') }
      ,{ path: 'RootBitacora/BitacarsEdit', component: () => import('pages/RootBitacora/Bitacars/BitacarsEdit.vue') }
      ,{ path: 'RootBitacora/BitaRoutes', component: () => import('pages/RootBitacora/BitaRoutes/BitaRoutes.vue') }
      ,{ path: 'RootBitacora/BitaRoutesEdit', component: () => import('pages/RootBitacora/BitaRoutes/BitaRoutesEdit.vue') }
      ,{ path: 'RootBitacora/BitaRounds', component: () => import('pages/RootBitacora/BitaRounds/BitaRounds.vue') }
      ,{ path: 'RootBitacora/BitaRoundsEdit', component: () => import('pages/RootBitacora/BitaRounds/BitaRoundsEdit.vue') }
      ,{ path: 'RootBitacora/Bitaconsola', component: () => import('pages/RootBitacora/Bitaconsola/Bitaconsola.vue') }
      ,{ path: 'RootBitacora/BitaconsolaEdit', component: () => import('pages/RootBitacora/Bitaconsola/BitaconsolaEdit.vue') }
      ,{ path: 'RootBitacora/BitacoraPeople', component: () => import('pages/RootBitacora/UserBitacoraPeople/BitacoraPeople.vue') }
      ,{ path: 'RootBitacora/BitacoraEvents', component: () => import('pages/RootBitacora/UserBitacoraEvents/BitacoraEvents.vue') }
      ,{ path: 'RootBitacora/BitacoraCars', component: () => import('pages/RootBitacora/UserBitacoraCars/BitacoraCars.vue') }
      ,{ path: 'RootBitacora/BitacoraRounds', component: () => import('pages/RootBitacora/UserBitacoraRounds/BitacoraRounds.vue') }
      ,{ path: 'RootPurchase', component: () => import('pages/RootPurchase/RootPurchase.vue') }
      ,{ path: 'RootPurchase/PurchaseRequisition', component: () => import('pages/RootPurchase/PurchaseRequisition/PurchaseRequisition.vue') }
      ,{ path: 'RootPurchase/PurchaseRequisitionEdit', component: () => import('pages/RootPurchase/PurchaseRequisition/PurchaseRequisitionEdit.vue') }
      ,{ path: 'RootPurchase/PurchaseQuotes', component: () => import('pages/RootPurchase/PurchaseQuotes/PurchaseQuotes.vue') }
      //ROOT_MASTER
      ,{ path: 'RootMaster/Partners', component: () => import('pages/RootMaster/Partners/Partners.vue') }
      ,{ path: 'RootMaster/PartnersEdit', component: () => import('pages/RootMaster/Partners/PartnersEdit.vue') }
      ,{ path: 'RootMaster/Items', component: () => import('pages/RootMaster/Items/Items.vue') }
      ,{ path: 'RootMaster/ItemsEdit', component: () => import('pages/RootMaster/Items/ItemsEdit.vue') }
      ,{ path: 'RootMaster/Warehouses', component: () => import('pages/RootMaster/Warehouses/Warehouses.vue') }
      ,{ path: 'RootMaster/WarehousesEdit', component: () => import('pages/RootMaster/Warehouses/WarehousesEdit.vue') }
      ,{ path: 'RootMaster/UoM', component: () => import('pages/RootMaster/UoM/UoM.vue') }
      ,{ path: 'RootMaster/UoMEdit', component: () => import('pages/RootMaster/UoM/UoMEdit.vue') }
      ,{ path: 'RootMaster/Brands', component: () => import('pages/RootMaster/Brands/Brands.vue') }
      ,{ path: 'RootMaster/BrandsEdit', component: () => import('pages/RootMaster/Brands/BrandsEdit.vue') }
      //ENS
      ,{ path: 'RootENS/Equipistas', component: () => import('pages/RootENS/Equipistas/Equipistas.vue') }
      ,{ path: 'RootENS/Equipista', component: () => import('pages/RootENS/Equipista/Equipista.vue') }
      //FINANZAS
      ,{ path: 'RootAccounting/ChartAccount', component: () => import('pages/RootAccounting/ChartAccount/ChartAccount.vue') }
      ,{ path: 'RootAccounting/ChartAccountEdit', component: () => import('pages/RootAccounting/ChartAccount/ChartAccountEdit.vue') }
      ,{ path: 'RootAccounting/Taxes', component: () => import('pages/RootAccounting/Taxes/Taxes.vue') }
      ,{ path: 'RootAccounting/TaxesEdit', component: () => import('pages/RootAccounting/Taxes/TaxesEdit.vue') }
      ,{ path: 'RootAccounting/AccPeriods', component: () => import('pages/RootAccounting/AccPeriods/AccPeriods.vue') }
      ,{ path: 'RootAccounting/AccPeriodsEdit', component: () => import('pages/RootAccounting/AccPeriods/AccPeriodsEdit.vue') }
      //RRHH
      ,{ path: 'RootHHRR/Employees', component: () => import('pages/RootHHRR/Employees/Employees.vue') }
      //SCHOENSTATT
      ,{ path: 'RootSchoenstatt/SCHPersonas', component: () => import('pages/RootSchoenstatt/SCHPersonas/SCHPersonas.vue') }
      ,{ path: 'RootSchoenstatt/SCHPersonasEdit', component: () => import('pages/RootSchoenstatt/SCHPersonas/SCHPersonasEdit.vue') }
      ,{ path: 'RootSchoenstatt/SCHPersona', component: () => import('pages/RootSchoenstatt/SCHPersona/SCHPersona.vue') }
      ,{ path: 'RootSchoenstatt/SCHGroups', component: () => import('pages/RootSchoenstatt/SCHGroups/SCHGroups.vue') }
      ,{ path: 'RootSchoenstatt/SCHGroupsEdit', component: () => import('pages/RootSchoenstatt/SCHGroups/SCHGroupsEdit.vue') }
      ,{ path: 'RootSchoenstatt/SCHSectores', component: () => import('pages/RootSchoenstatt/SCHSectores/SCHSectores.vue') }
      ,{ path: 'RootSchoenstatt/SCHSectoresEdit', component: () => import('pages/RootSchoenstatt/SCHSectores/SCHSectoresEdit.vue') }
      ,{ path: 'RootSchoenstatt/SCHApostolados', component: () => import('pages/RootSchoenstatt/SCHApostolados/SCHApostolados.vue') }
      ,{ path: 'RootSchoenstatt/SCHApostoladosEdit', component: () => import('pages/RootSchoenstatt/SCHApostolados/SCHApostoladosEdit.vue') }
      ,{ path: 'RootSchoenstatt/SCHFormaciones', component: () => import('pages/RootSchoenstatt/SCHFormaciones/SCHFormaciones.vue') }
      ,{ path: 'RootSchoenstatt/SCHFormacionesEdit', component: () => import('pages/RootSchoenstatt/SCHFormaciones/SCHFormacionesEdit.vue') }
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
