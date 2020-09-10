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
import BitaCars from './BitaCars' //Bitacora Rounds
import BitacoraPeople from './BitacoraPeople' //Bitacora Rounds
import Notifications from './Notifications' //Bitacora Rounds
import Employees from './Employees' //Bitacora Rounds
import Equipistas from './Equipistas' //Equipistas
import Equipista from './Equipista' //Equipista

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
    },

    // enable strict mode (adds overhead!)
    // for dev mode only
    strict: process.env.DEV
  })

  return Store
}
