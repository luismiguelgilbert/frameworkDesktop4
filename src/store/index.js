import Vue from 'vue'
import Vuex from 'vuex'

import main from './main' //session
import Users from './Users' //Users Module
import Roles from './Roles' //Roles Module
import Companies from './Companies' //Roles Companies
import Modules from './Modules' //Roles Companies
import Bitaplaces from './Bitaplaces' //Bitacora Places Companies
import Bitaconsola from './Bitaconsola' //Bitacora Consola
import BitaRoutes from './BitaRoutes' //Bitacora Routes GPS
import BitaRounds from './BitaRounds' //Bitacora Rounds
import BitaCars from './BitaCars' //BitaCars Cars
import BitacoraPeople from './BitacoraPeople' //BitacoraPeople
import Notifications from './Notifications' //Notifications
import Employees from './Employees' //Employees
import Equipistas from './Equipistas' //Equipistas
import Equipista from './Equipista' //Equipista
import ChartAccount from './ChartAccount' //ChartAccount
import Taxes from './Taxes' //Taxes
import TaxesMaster from './TaxesMaster' //TaxesMaster
import AccPeriods from './AccPeriods' //AccPeriods
import SCHPersonas from './SCHPersonas' //SCHPersonas
import SCHPersona from './SCHPersona' //SCHPersona
import SCHApostolados from './SCHApostolados' //SCHApostolados
import SCHFormaciones from './SCHFormaciones' //SCHFormaciones
import SCHGroups from './SCHGroups' //SCHGroups
import SCHSectores from './SCHSectores' //SCHSectores
import Partners from './Partners' //partnerMaster
import Items from './Items' //Items
import Warehouses from './Warehouses' //Warehouses
import UoM from './UoM' //UoM
import Brands from './Brands' //Brands
import InvTypes from './InvTypes' //InvTypes
import mktPR from './mktPR' //mktPR

Vue.use(Vuex)

export default function (/* { ssrContext } */) {
  const Store = new Vuex.Store({
    modules: {
       main
      ,Users
      ,Roles
      ,Companies
      ,Modules
      ,Bitaplaces
      ,Bitaconsola
      ,BitaRoutes
      ,BitaRounds
      ,BitaCars
      ,BitacoraPeople
      ,Notifications
      ,Employees
      ,Equipista
      ,Equipistas
      ,ChartAccount
      ,Taxes
      ,TaxesMaster
      ,AccPeriods
      ,SCHPersonas
      ,SCHPersona
      ,SCHApostolados
      ,SCHFormaciones
      ,SCHGroups
      ,SCHSectores
      ,Partners
      ,Items
      ,Warehouses
      ,UoM
      ,Brands
      ,InvTypes
      ,mktPR
    },

    // enable strict mode (adds overhead!)
    // for dev mode only
    strict: process.env.DEV
  })

  return Store
}
