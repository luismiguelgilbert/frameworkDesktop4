<template>
  <!--<q-page class="flex flex-center">-->
  <q-page>
    <q-tabs
        v-model="currentHomeTab" align="justify"
        :class="userColor=='default'?'bg-white text-primary':'bg-grey-10 text-white'"
        :breakpoint="0" animated
      >
        <q-tab animated
          v-for="root in menuData.filter(x=>!x.parent&&x.sys_link_id!=99&&x.sys_link_id!=98)" 
          :key="root.sys_link_id" :name="root.sys_link_id" :icon="root.icon" :label="root.label" />
    </q-tabs>
    <q-separator />
    

    <div style="height: calc(100vh - 123px); overflow-y: scroll;" :class="userColor=='default'?'bg-grey-2':'bg-grey-9'">
      <q-page-sticky position="bottom-right" :offset="[18, 18]">
        <q-btn color="transparent" flat @click="openBittWebsite">
          <img height="25" src="/logoTransparent.png">
        </q-btn>
      </q-page-sticky>

      <q-page-sticky position="bottom-left" :offset="[10, 10]" v-if="currentHomeTab=='97'" class="no-padding">
          <q-btn  
            style="width: 100%; max-width: 100px;"
            no-caps padding="none" flat color="red" @click="helpDialog=true"
            >
            <q-card flat bordered class="no-padding">
              <q-card-section class="text-center text-subtitle2 q-pt-sm q-pb-none q-pl-none q-pr-none">
                <q-icon name="fab fa-youtube" color="red" size="1.5rem" />
                Video
              </q-card-section>
              <q-card-section class="no-padding" style="font-size: 9px;">
                Cómo usar la Nueva Plataforma ENS?
              </q-card-section>
            </q-card>
          </q-btn>
      </q-page-sticky>

      <div class="q-pa-md row justify-center q-gutter-lg q-mb-xl">
        <q-btn  
          v-for="modulo in menuData.filter(x=>x.parent==currentHomeTab)" :key="modulo.sys_link_id" 
          style="width: 100%; max-width: 300px;"
          no-caps padding="none" flat :color="userColor=='default'?'primary':undefined"
          :to="'/'+modulo.link_name"
          >
          <q-card flat bordered class="full-width full-height">
            <q-card-section class="text-center">
              <q-icon :name="modulo.icon" :color="userColor=='default'?'primary':undefined" size="4rem" />
            </q-card-section>
            <q-card-section>
              <div :class="userColor=='default'?'text-primary text-h6':'text-white text-h6'">{{modulo.label}}</div>
            </q-card-section>
            <q-card-section class="q-pt-none">
              {{modulo.comment}}
            </q-card-section>
          </q-card>
        </q-btn>
      </div>
    </div>

    <q-dialog v-model="helpDialog">
        <q-card class="no-padding" style="height: 315px; width: 560px;">
            <q-video :ratio="16/9" src="https://www.youtube.com/embed/_FDtTrHlCgc?autoplay=1" />
        </q-card>
    </q-dialog>

  </q-page>
</template>

<script>
export default {
  name: 'PageIndex',
  data() {
    return {
      helpDialog: false,
    }
  },
  
  mounted(){
    try{
      if(this.currentHomeTab==null){
        this.currentHomeTab = this.menuData.find(x=>!x.parent).sys_link_id
      }
    }catch(ex){}
  },
  methods:{
    openBittWebsite(){
      window.open("https://bitt.com.ec", "_blank");
    }
  },
  computed:{
    userColor: { get () { return this.$store.state.main.userColor }, },
    menuData: { 
      get () { return this.$store.state.main.menuData }, 
    },
    currentHomeTab: { 
      get () { return this.$store.state.main.currentHomeTab },
      set (val) { this.$store.commit('main/updateState', {key: 'currentHomeTab', value: val}) }
    },
  },
  watch: {
        currentHomeTab: function (val) {
          this.$q.loading.show()

          // hiding in 2s
          setTimeout(() => {
            this.$q.loading.hide()
          }, 200)
        },
    }
}
</script>