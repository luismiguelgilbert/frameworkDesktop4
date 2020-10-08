<template>
  <q-page class="flex flex-center">
    {{wsConnection?wsConnection.readyState:'no existe'}}
    <img
      alt="BITT logo"
      src="/logoTransparent.png"
      height="100"
    >
  </q-page>
</template>

<script>
export default {
  name: 'PageIndex'
  ,computed:{
    wsConnection: { get () { return this.$store.state.main.wsConnection }, set (val) { this.$store.commit('main/updateState', {key: 'wsConnection', value: val}) } },
  }
}
</script>