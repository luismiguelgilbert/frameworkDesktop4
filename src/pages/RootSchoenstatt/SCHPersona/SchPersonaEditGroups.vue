<template>
<q-table
      :data="groups"
      :class="userColor=='blackDark'?'my-sticky-header-usercompany-dark bg-grey-10 ':'my-sticky-header-usercompany'"
      table-style="min-height: 150px; max-height: calc(100vh - 225px)"
      row-key="sys_user_code"
      virtual-scroll
      :rows-per-page-options="[0]"
      hide-bottom dense
      :filter="filterString"
      :columns="[
        { name: 'groupID', required: true, label: 'Grupo', align: 'left', field: row => row.groupID, sortable: true },
        { name: 'fechaIngreso', required: true, label: 'Fecha Ingreso', align: 'left', field: row => row.fechaIngreso, sortable: true },
        { name: 'computedAgeIngreso', required: true, label: 'Años', align: 'left', field: row => row.computedAgeIngreso, sortable: true },
        { name: 'fechaAlianza', required: true, label: 'Fecha Alianza', align: 'left', field: row => row.fechaAlianza, sortable: true },
        { name: 'computedAgeAlianza', required: true, label: 'Años', align: 'left', field: row => row.computedAgeAlianza, sortable: true },
        { name: 'fechaSantuario', required: true, label: 'Fecha Santuario', align: 'left', field: row => row.fechaSantuario, sortable: true },
        { name: 'nombreSantuario', required: true, label: 'Nombre Santuario', align: 'left', field: row => row.nombreSantuario, sortable: true },
        { name: 'computedAgeSantuario', required: true, label: 'Años', align: 'left', field: row => row.computedAgeSantuario, sortable: true },
        { name: 'fechaSalida', required: true, label: 'Fecha Salida', align: 'left', field: row => row.fechaSalida, sortable: true },
        { name: 'estado', required: true, label: 'Activo?', align: 'left', field: row => row.estado, sortable: true },
      ]"


>
  <template v-slot:body="props">
        <q-tr :props="props">
          <q-td key="groupID" :props="props">
            {{ lookup_groups.find(x=>x.value==props.row.groupID).label }}
            <q-popup-edit :value="props.row.groupID">
              <q-select :value="props.row.groupID" dense map-options :options="lookup_groups"
                :option-disable="opt => !opt.estado"
                @input="(value)=>{updateRow(value.value,'groupID',props.row)}" />
            </q-popup-edit>
          </q-td>
          <q-td key="fechaIngreso" :props="props">
            {{ props.row.fechaIngreso }}
            <q-popup-edit :value="props.row.fechaIngreso" class="no-padding">
              <q-date :value="props.row.fechaIngreso" @input="(value)=>{updateRow(value,'fechaIngreso',props.row)}" >
                <div class="row items-center justify-end">
                  <q-btn v-close-popup label="Seleccionar" color="primary" flat />
                </div>
              </q-date>
            </q-popup-edit>
          </q-td>
          <q-td key="computedAgeIngreso" :props="props">
            {{ getAge(props.row.fechaIngreso) }}
          </q-td>
          <q-td key="fechaAlianza" :props="props">
            {{ props.row.fechaAlianza }}
            <q-popup-edit :value="props.row.fechaAlianza" class="no-padding">
              <q-date :value="props.row.fechaAlianza" @input="(value)=>{updateRow(value,'fechaAlianza',props.row)}" >
                <div class="row items-center justify-end">
                  <q-btn v-close-popup label="Seleccionar" color="primary" flat />
                </div>
              </q-date>
            </q-popup-edit>
          </q-td>
          <q-td key="computedAgeAlianza" :props="props">
            {{ getAge(props.row.fechaAlianza) }}
          </q-td>
          <q-td key="fechaSantuario" :props="props">
            {{ props.row.fechaSantuario }}
            <q-popup-edit :value="props.row.fechaSantuario" class="no-padding">
              <q-date :value="props.row.fechaSantuario" @input="(value)=>{updateRow(value,'fechaSantuario',props.row)}" >
                <div class="row items-center justify-end">
                  <q-btn v-close-popup label="Seleccionar" color="primary" flat />
                </div>
              </q-date>
            </q-popup-edit>
          </q-td>
          <q-td key="nombreSantuario" :props="props">
            {{ props.row.nombreSantuario }}
            <q-popup-edit :value="props.row.nombreSantuario" >
              <q-input :value="props.row.nombreSantuario" dense autofocus counter @input="(value)=>{updateRow(value,'nombreSantuario',props.row)}" />
            </q-popup-edit>
          </q-td>
          <q-td key="computedAgeSantuario" :props="props">
            {{ getAge(props.row.fechaSantuario) }}
          </q-td>
          <q-td key="fechaSalida" :props="props">
            {{ props.row.fechaSalida }}
            <q-popup-edit :value="props.row.sexo" class="no-padding">
              <q-date :value="props.row.fechaSalida" @input="(value)=>{updateRow(value,'fechaSalida',props.row)}" >
                <div class="row items-center justify-end">
                  <q-btn v-close-popup label="Seleccionar" color="primary" flat />
                </div>
              </q-date>
            </q-popup-edit>
          </q-td>
          <q-td key="estado" :props="props">
            <q-toggle :value="props.row.estado" dense @input="updateRow(!props.row.estado,'estado',props.row)" />
          </q-td>
        </q-tr>
  </template>
    <template v-slot:top>
        <q-btn label="Agregar Grupo" @click="addRow" icon="fas fa-plus" color="primary" no-caps />
        <q-space />
        <q-input borderless dense v-model="filterString" placeholder="Buscar...">
          <template v-slot:append>
            <q-icon name="fas fa-search" />
          </template>
        </q-input>
    </template>
    <!--<template v-slot:body-cell-is_profile="props">
        <q-td :props="props">
            <q-toggle size="sm" dense color="positive" :value="props.value" @input="changeProfileforUser(props)" :disable="(!editMode&&!allow_edit)||(editMode&&!allow_insert)" />
        </q-td>
    </template>
    -->
</q-table>

</template>
<style lang="sass">
.q-table__bottom
    padding: 0px
.my-sticky-header-usercompany
  /* max height is important */
  .q-table__middle
    max-height: 50px

  .q-table__top,
  .q-table__bottom,
  thead tr:first-child th /* bg color is important for th; just specify one */
    background-color: white

  thead tr:first-child th
    position: sticky
    top: 0
    opacity: 1
    z-index: 2

.my-sticky-header-usercompany-dark
  /* max height is important */
  .q-table__middle
    max-height: 50px

  .q-table__top,
  .q-table__bottom,
  thead tr:first-child th /* bg color is important for th; just specify one */
    background-color: $grey-10

  thead tr:first-child th
    position: sticky
    top: 0
    opacity: 1
    z-index: 2
</style>
<script>
import Vue from 'vue';
import Vuex from 'vuex';
import { date } from 'quasar';

export default ({
    data () {
        return {
            moduleName: "SCHPersona", filterString: ''
        }
    },
    methods:{
      getMax(arr, prop) {
          var max;
          for (var i=0 ; i<arr.length ; i++) {
              if (max == null || parseInt(arr[i][prop]) > parseInt(max[prop]))
                  max = arr[i];
          }
          return max;
      },
      updateRow(newVal, colName, row){
        let newRows = JSON.parse(JSON.stringify(this.groups))
        newRows.find(x=>x.groupID==row.groupID)[colName] = newVal
        this.groups = newRows
      },
      addRow(){
        let newRows = JSON.parse(JSON.stringify(this.groups))
        newRows.push({
           groupID: this.lookup_groups[0].value
          ,fechaIngreso: ''
          ,computedAgeIngreso: 0
          ,fechaAlianza: ''
          ,computedAgeAlianza: 0
          ,fechaSantuario: ''
          ,nombreSantuario: 'NombreSantuario'
          ,computedAgeSantuario: 0
          ,fechaSalida: ''
          ,estado: true
        })
        this.groups = newRows
      },
      getAge(fecha){
        return date.getDateDiff(new Date(), fecha, 'years')
      }
    },
    computed:{
        userColor: { get () { return this.$store.state.main.userColor }  },
        allow_view: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_view').value }, },
        allow_edit: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_edit').value }, },
        allow_insert: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_insert').value }, },
        allow_report: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_report').value }, },
        allow_disable: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_disable').value }, },
        editMode: { get () { return this.$store.state[this.moduleName].editMode }, },
        groups: {
            get () { return this.$store.state[this.moduleName].editData.groups },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditDataGroups', val) }
            //set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'system', key: 'table_lines', value: val}) }
        },
        sys_user_color: {
            get () { return this.$store.state[this.moduleName].editData.basic.sys_user_color },
        },
        lookup_groups: {
            get () { return this.$store.state[this.moduleName].editData.lookup_groups },
        },
    }
})
</script>
