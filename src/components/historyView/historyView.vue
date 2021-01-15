<template>
<div style="margin: -16px;">

  <q-table
    :data="history"
    table-style="min-height: calc(100vh - 140px); max-height: calc(100vh - 140px);"
    row-key="record_id"
    :separator="userTableLines"
    :rows-per-page-options="[0]"
    hide-bottom dense flat
    virtual-scroll
    :class="tableLastLine"
    :columns="[
        { name: 'icon', label: 'Acción', field: 'icon', sortable: true, align: 'left', style: 'width: 30px', },
        { name: 'fecha', label: 'Fecha', field: 'fecha', sortable: true, align: 'left' },
        { name: 'title', label: 'Evento', field: 'title', sortable: true, align: 'left' },
        { name: 'usuario', label: 'Usuario', field: 'usuario', sortable: true, align: 'left' },
        { name: 'body', label: 'Ver log', field: 'body', sortable: true, align: 'center' },
      ]"
    >
    <template v-slot:body-cell-icon="props">
      <q-td :props="props">
        <q-icon :name="props.value" dense :color="userColor=='blackDark'?'white':'primary'" />
      </q-td>
    </template>
    <template v-slot:body-cell-fecha="props">
      <q-td :props="props" :title="props.row.fechaTitle">
        {{props.value}}
      </q-td>
    </template>
    <template v-slot:body-cell-body="props" >
      <q-td :props="props">
        <q-btn icon="fas fa-search"  size="xs" color="primary" v-if="props.value">
          <q-tooltip>
            <div v-if="Array.isArray(JSON.parse(props.value))">
              <q-table dense
                :data="JSON.parse(props.value)"
                virtual-scroll
                :pagination.sync="pagination"
                :rows-per-page-options="[0]"
                />
            </div>
            <div v-if="!Array.isArray(JSON.parse(props.value))">
              <q-markup-table dense>
                <tbody v-for="(columna, index) in JSON.parse(props.value)" :key="index">
                  <tr>
                    <td class="text-subtitle2">{{index}}</td>
                    <td class="text-caption">{{columna}}</td>
                  </tr>
                </tbody>
              </q-markup-table>
            </div>
          </q-tooltip>
        </q-btn>
      </q-td>
    </template>
    <template v-slot:bottom-row >
      <q-tr></q-tr>
    </template>
  </q-table>

</div>

</template>


<style lang="scss">
  .q-table__bottom{ padding: 0px; padding-left: 10px; padding-right: 10px; }
  .q-virtual-scroll__padding{ visibility: hidden;}
  .q-table thead tr:first-child th{ position: sticky; top: 0; opacity: 1; z-index: 1; padding-left: 5px; font-weight: bolder; color: $primary; }
  .my-sticky-header-table{
    .q-table thead tr:first-child th{ background-color: white }
  }
  .my-sticky-header-table-LastLine{
    .q-table thead tr:first-child th{ background-color: white }
    .q-table .q-virtual-scroll__content td{ border-bottom-width: 1px }
  }
  .my-sticky-header-table-dark{
    .q-table thead tr:first-child th{ background-color: $grey-10 }
  }
  .my-sticky-header-table-dark-LastLine{
    .q-table thead tr:first-child th{ background-color: $grey-10 }
    .q-table td{ border-bottom-width: 1px }
  }
</style>


<script>
import Vue from 'vue';
import Vuex from 'vuex';
export default ({
    props: {
        moduleName: { type: String, required: true },
    },
    data () {
        return {
            pagination: { rowsPerPage: 0 },
        }
    },
    methods:{
    },
    computed:{
        userColor: { get () { return this.$store.state.main.userColor }  },
        userTableLines: { get () { return this.$store.state.main.userTableLines } },
        tableLastLine: {
        get () { 
            let resultado = ''
            if(this.userColor=='blackDark'){
              if(this.userTableLines=='horizontal'||this.userTableLines=='cell')
              {
                  resultado = 'my-sticky-header-table-dark-LastLine bg-grey-10 '
              }else{
                  resultado = 'my-sticky-header-table-dark bg-grey-10 '
              }
              }
              if(this.userColor!='blackDark'){
                  if(this.userTableLines=='horizontal'||this.userTableLines=='cell')
                  {
                      resultado = 'my-sticky-header-table-LastLine '
                  }else{
                      resultado = 'my-sticky-header-table '
                  }
              }
              return resultado
          }
        },
        history: {
          get () { return this.$store.state[this.moduleName].editData.history },
        },
    }
})

</script>
