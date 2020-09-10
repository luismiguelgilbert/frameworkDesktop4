
const routes = [
  { path: '/login', name: 'login', component: () => import('pages/login.vue') },
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
      //ENS
      ,{ path: 'RootENS/Equipistas', component: () => import('pages/RootENS/Equipistas/Equipistas.vue') }
      ,{ path: 'RootENS/Equipista', component: () => import('pages/RootENS/Equipista/Equipista.vue') }
      //RRHH
      ,{ path: 'RootHHRR/Employees', component: () => import('pages/RootHHRR/Employees/Employees.vue') }
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
