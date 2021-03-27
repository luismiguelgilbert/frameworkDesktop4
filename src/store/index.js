import Vue from 'vue'
import Vuex from 'vuex'
//import { store } from 'quasar/wrappers'

import main from './main'
import Items from './Items'
import Partners from './Partners'
import Users from './Users' //Users Module
import Roles from './Roles' //Roles Module
import Companies from './Companies' //Roles Companies
import Modules from './Modules' //Roles Companies
import Bitaplaces from './Bitaplaces' //Bitacora Places Companies
import Bitacars from './Bitacars' //Bitacars
import Bitaevents from './Bitaevents' //Bitacora
import Bitapeople from './Bitapeople' //Ingresos y Salidas
import Bitarides from './Bitarides' //Ingresos y Salidas
//import Bitaconsola from './Bitaconsola' //Bitacora Consola
//import BitaRoutes from './BitaRoutes' //Bitacora Routes GPS
//import BitaRounds from './BitaRounds' //Bitacora Rounds
import Notifications from './Notifications' //Notifications
import Employees from './Employees' //Employees
import Equipistas from './Equipistas' //Equipistas
import Equipista from './Equipista' //Equipista
import ChartAccount from './ChartAccount' //ChartAccount
import Taxes from './Taxes' //Taxes
import TaxesMaster from './TaxesMaster' //TaxesMaster
import AccPeriods from './AccPeriods' //AccPeriods
import accPaymentMethods from './accPaymentMethods' //accPaymentMethods
import AccMoves from './AccMoves' //AccMoves
import SCHPersonas from './SCHPersonas' //SCHPersonas
import SCHPersona from './SCHPersona' //SCHPersona
import SCHApostolados from './SCHApostolados' //SCHApostolados
import SCHFormaciones from './SCHFormaciones' //SCHFormaciones
import SCHGroups from './SCHGroups' //SCHGroups
import SCHSectores from './SCHSectores' //SCHSectores
import Warehouses from './Warehouses' //Warehouses
import UoM from './UoM' //UoM
import Brands from './Brands' //Brands
import InvTypes from './InvTypes' //InvTypes
import mktPR from './mktPR' //mktPR
import mktPO from './mktPO' //mktPO
import mktPORet from './mktPORet' //mktPORet
import casCasesTypes from './casCasesTypes' //casCasesTypes
import casCasos from './casCasos' //casCasos
import casClientes from './casClientes' //casClientes
import casContracts from './casContracts' //casContracts
import casInvoices from './casInvoices' //casInvoices
import casLocations from './casLocations' //casLocations
import casTasks from './casTasks' //casTasks
import casTasksTypes from './casTasksTypes' //casTasksTypes
import invIncoming from './invIncoming' //invIncoming
import invOutgoing from './invOutgoing' //invOutgoing
import invQuery from './invQuery' //invQuery
import Payterms from './Payterms' //Payterms
import partnerMasterGroups from './partnerMasterGroups' //partnerMasterGroups
import accVoucherOut from './accVoucherOut' //partnerMasterGroups
import accVoucherIn from './accVoucherIn' //partnerMasterGroups
import invMasterGroups from './invMasterGroups' //invMasterGroups
import Locations from './Locations' //Locations
import accAP from './accAP' //Cuentas x Pagar
import accRet from './accRet' //Retenciones en Compra
import mfgOrders from './mfgOrders' //mfgOrders
import mktMFG from './mktMFG' //mktMFG
import mktMFGreturn from './mktMFGreturn' //mktMFGreturn
import mktPRD from './mktPRD' //mktPRD
import mktPRDreturn from './mktPRDreturn' //mktPRDreturn
import mfgLocations from './mfgLocations' //mfgLocations
import mfgTypes from './mfgTypes' //mfgTypes
import mfgBOM from './mfgBOM' //mfgBOM

Vue.use(Vuex)

export default function (/* { ssrContext } */) {
  const Store = new Vuex.Store({
    modules: {
      main,
      Items,
      Partners
      //System
      ,Users
      ,Roles
      ,Companies
      ,Modules
      //Bitacora
      ,Bitaplaces
      ,Bitacars
      ,Bitaevents
      ,Bitapeople
      ,Bitarides
      /*
      ,Bitaconsola
      ,BitaRoutes
      ,BitaRounds
      */

      //Others
      ,Notifications
      ,Employees
      ,Equipista
      ,Equipistas
      //FINANCES
      ,ChartAccount
      ,Taxes
      ,TaxesMaster
      ,AccPeriods
      ,AccMoves
      ,accPaymentMethods
      ,partnerMasterGroups
      ,invMasterGroups
      ,Payterms
      ,Locations
      //Bank
      ,accVoucherIn
      ,accVoucherOut
      //Schoenstatt
      ,SCHPersonas
      ,SCHPersona
      ,SCHApostolados
      ,SCHFormaciones
      ,SCHGroups
      ,SCHSectores
      //Master
      ,Warehouses
      ,UoM
      ,Brands
      ,InvTypes
      //mkt PURCHASE
      ,mktPR
      ,mktPO
      ,mktPORet
      ,accAP
      ,accRet
      //Inventory
      ,invIncoming
      ,invOutgoing
      ,invQuery
      //Cases
      ,casCasesTypes
      ,casCasos
      ,casClientes
      ,casLocations
      ,casTasks
      ,casTasksTypes
      ,casContracts
      ,casInvoices
      //MFG
      ,mfgOrders
      ,mktMFG
      ,mktMFGreturn
      ,mktPRD
      ,mktPRDreturn
      ,mfgLocations
      ,mfgTypes
      ,mfgBOM
    },
    // enable strict mode (adds overhead!)
    // for dev mode only
    strict: process.env.DEV
  })
  return Store
}