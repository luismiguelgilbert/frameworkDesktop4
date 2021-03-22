<template>
  <div class="fixed-center text-center">
    <p>
      <img
        src="sad.svg"
        style="width:30vw;max-width:150px;"
      >
    </p>
    <p class="text-faded">
            Sorry, that modules doesn't exist...<strong>(404)</strong> Click the button to go back
      <br>  Lo sentimos, ese módulo no existe...<strong>(404)</strong> Clic en el botón para regresar
    </p>
    <q-btn
      color="primary"
      style="width:200px;"
      @click="goHome"
      icon="fas fa-arrow-circle-left"
    />
  </div>
</template>

<script>
import Vue from 'vue'
import Vuex from 'vuex'
Vue.use(Vuex)

export default {
  name: 'Error404',
  data () {
    return {
      router: this.$router,
    }
  },
  methods:{
    goHome(){
      /*
      //this.currentPath = 'RootHome';
      this.currentPath = null;
      this.currentPathModule = null;
      //this.router.push('/RootHome');//this.router.back();
      this.router.push('/');//this.router.back();
      */
     //$router.go(-1)
      this.router.push('/');//this.router.back();
    }
  },
  computed:{
    currentPath: { get () { return this.$store.state.main.currentPath }, set (val) { this.$store.commit('main/updateState', {key: 'currentPath', value: val}) } },
    currentPathModule: { get () { return this.$store.state.main.currentPathModule }, set (val) { this.$store.commit('main/updateState', {key: 'currentPathModule', value: val}) } },
    /*userColor: { get () { return this.$store.state.main.userColor }, set (val) { this.$store.commit('main/updateState', {key: 'userColor', value: val}) } },
    userPhoto: { get () { return this.$store.state.main.userPhoto }, set (val) { this.$store.commit('main/updateState', {key: 'userPhoto', value: val}) } },
    userID: { get () { return this.$store.state.main.userID }, set (val) { this.$store.commit('main/updateState', {key: 'userID', value: val}) } },
    userMail: { get () { return this.$store.state.main.userMail }, set (val) { this.$store.commit('main/updateState', {key: 'userMail', value: val}) } },
    userName: { get () { return this.$store.state.main.userName }, set (val) { this.$store.commit('main/updateState', {key: 'userName', value: val}) } },
    userLastName: { get () { return this.$store.state.main.userLastName }, set (val) { this.$store.commit('main/updateState', {key: 'userLastName', value: val}) } },
    userProfileName: { get () { return this.$store.state.main.userProfileName }, set (val) { this.$store.commit('main/updateState', {key: 'userProfileName', value: val}) } },
    userRowsPerPage: { get () { return this.$store.state.main.userRowsPerPage }, set (val) { this.$store.commit('main/updateState', {key: 'userRowsPerPage', value: val}) } },
    userRowsToRender: { get () { return this.$store.state.main.userRowsToRender }, set (val) { this.$store.commit('main/updateState', {key: 'userRowsToRender', value: val}) } },
    userTableLines: { get () { return this.$store.state.main.userTableLines }, set (val) { this.$store.commit('main/updateState', {key: 'userTableLines', value: val}) } },
    userTableDense: { get () { return this.$store.state.main.userTableDense }, set (val) { this.$store.commit('main/updateState', {key: 'userTableDense', value: val}) } },
    userDateFormat: { get () { return this.$store.state.main.userDateFormat }, set (val) { this.$store.commit('main/updateState', {key: 'userDateFormat', value: val}) } },
    userTimeFormat: { get () { return this.$store.state.main.userTimeFormat }, set (val) { this.$store.commit('main/updateState', {key: 'userTimeFormat', value: val}) } },
    userMoneyFormat: { get () { return this.$store.state.main.userMoneyFormat }, set (val) { this.$store.commit('main/updateState', {key: 'userMoneyFormat', value: val}) } },
    userUsersFormat: { get () { return this.$store.state.main.userUsersFormat }, set (val) { this.$store.commit('main/updateState', {key: 'userUsersFormat', value: val}) } },
    userCompanies: { get () { return this.$store.state.main.userCompanies }, set (val) { this.$store.commit('main/updateState', {key: 'userCompanies', value: val}) } },
    userCompany: { get () { return this.$store.state.main.userCompany }, set (val) { this.$store.commit('main/updateState', {key: 'userCompany', value: val}) } },
    menuData: { get () { return this.$store.state.main.menuData }, set (val) { this.$store.commit('main/updateState', {key: 'menuData', value: val}) } },
    currentPath: { get () { return this.$store.state.main.currentPath }, set (val) { this.$store.commit('main/updateState', {key: 'currentPath', value: val}) } },
    currentPathModule: { get () { return this.$store.state.main.currentPathModule }, set (val) { this.$store.commit('main/updateState', {key: 'currentPathModule', value: val}) } },
    */
  }
}
</script>
