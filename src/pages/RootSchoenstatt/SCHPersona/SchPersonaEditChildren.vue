<template>
<q-table
      :data="children"
      :class="userColor=='blackDark'?'my-sticky-header-usercompany-dark bg-grey-10 ':'my-sticky-header-usercompany'"
      table-style="min-height: 150px; max-height: calc(100vh - 225px)"
      row-key="sys_user_code"
      virtual-scroll
      :rows-per-page-options="[0]"
      hide-bottom dense
      :filter="filterString"
      :columns="[
        //{ name: 'phoneID', required: true, label: 'ID', align: 'left', field: row => row.phoneID, sortable: true },
        { name: 'childrenName', required: true, label: 'Nombre Completo', align: 'left', field: row => row.childrenName, sortable: true },
        { name: 'sexo', required: true, label: 'Sexo', align: 'left', field: row => row.sexo, sortable: true },
        { name: 'birthday', required: true, label: 'Fecha Nacimiento', align: 'left', field: row => row.birthday, sortable: true },
        { name: 'computedAge', required: true, label: 'Edad', align: 'left', field: row => row.computedAge, sortable: true },
        { name: 'estado', required: true, label: 'Activo?', align: 'left', field: row => row.estado, sortable: true },
      ]"


>
  <template v-slot:body="props">
        <q-tr :props="props">
          <q-td key="childrenName" :props="props">
            {{ props.row.childrenName }}
            <q-popup-edit :value="props.row.childrenName" >
              <q-input :value="props.row.childrenName" dense autofocus counter @input="(value)=>{updateRow(value,'childrenName',props.row)}" />
            </q-popup-edit>
          </q-td>
          <q-td key="sexo" :props="props">
            {{ lookup_sexo.find(x=>x.value==props.row.sexo).label }}
            <q-popup-edit :value="props.row.sexo">
              <q-select :value="props.row.sexo" dense map-options :options="lookup_sexo" @input="(value)=>{updateRow(value.value,'sexo',props.row)}" />
            </q-popup-edit>
          </q-td>
          <q-td key="birthday" :props="props">
            {{ props.row.birthday }}
            <q-popup-edit :value="props.row.birthday" class="no-padding">
              <q-date :value="props.row.birthday" @input="(value)=>{updateRow(value,'birthday',props.row)}" >
                <div class="row items-center justify-end">
                  <q-btn v-close-popup label="Seleccionar" color="primary" flat />
                </div>
              </q-date>
            </q-popup-edit>
          </q-td>
          <q-td key="computedAge" :props="props">
            {{ getAge(props.row.birthday) }}
          </q-td>
          <q-td key="estado" :props="props">
            <q-toggle :value="props.row.estado" dense @input="updateRow(!props.row.estado,'estado',props.row)" />
          </q-td>
        </q-tr>
  </template>
    <template v-slot:top>
        <q-btn label="Agregar Hijo/Hija" @click="addRow" icon="fas fa-plus" color="primary" no-caps />
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
        let newRows = JSON.parse(JSON.stringify(this.children))
        newRows.find(x=>x.childrenID==row.childrenID)[colName] = newVal
        this.children = newRows
      },
      addRow(){
        let max_id = 1
        if(this.children.length > 0){
            let temp = this.getMax(this.children, "childrenID");
            max_id = parseInt(temp.childrenID) + parseInt(1);
        }
        let newRows = JSON.parse(JSON.stringify(this.children))
        newRows.push({
           childrenID: max_id
          ,childrenName: 'NombreApellidos'
          ,sexo: this.lookup_sexo[0].value
          ,birthday: ''
          ,computedAge: 0
          ,estado: true
        })
        this.children = newRows
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
        children: {
            get () { return this.$store.state[this.moduleName].editData.children },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditDataChildren', val) }
            //set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'system', key: 'table_lines', value: val}) }
        },
        sys_user_color: {
            get () { return this.$store.state[this.moduleName].editData.basic.sys_user_color },
        },
        lookup_sexo: {
            get () { return this.$store.state[this.moduleName].editData.lookup_sexo },
        },
    }
})
</script>
