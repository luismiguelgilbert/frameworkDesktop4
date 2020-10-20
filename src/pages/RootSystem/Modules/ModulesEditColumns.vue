<template>

<div class="row">
  <div class="col-auto">
    <q-toolbar>
      <q-btn label="Agregar Columnas" no-caps icon="fas fa-plus" color="primary" :disable="db_table?false:true" @click="dialogColumns=true" />
    </q-toolbar>

    <q-list bordered separator class="scroll" style="height: calc(100vh - 230px)">

      <q-item clickable v-ripple v-for="columna in columns" :key="columna.db_column" @click="selectedColumn = columna"
        :class="selectedColumn==columna?'bg-blue-5':undefined">
        <q-item-section>
          <q-item-label>{{columna.db_column}}</q-item-label>
          <q-item-label caption>{{columna.db_type}}</q-item-label>
        </q-item-section>
        <q-menu touch-position context-menu>
          <q-item clickable v-close-popup @click="removeColumn(columna)">
            <q-item-section>Quitar</q-item-section>
            <q-item-section avatar>
              <q-avatar>
                <q-icon name="fas fa-trash-alt" color="red" />
              </q-avatar>
            </q-item-section>
          </q-item>
        </q-menu>
      </q-item>
    </q-list>
  </div>
  <div class="col">
    <q-form v-if="selectedColumn" ref="formulario" greedy spellcheck="false" autocorrect="off" autocapitalize="off" class="q-pa-sm scroll" style="height: calc(100vh - 180px)">

      <div class="row wrap">
        <div class="col-sm-12 col-md-6">
            <div>
              <q-toggle
                v-model="selectedColumn.is_key" color="positive" label="Clave Primaria?" :disable="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
                />
            </div>
            <!--<div>
              <q-toggle
                v-model="selectedColumn.isOpenButton" color="positive" label="Botón Edición?" :disable="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
                />
            </div>-->
            <div>
              <q-toggle
                v-model="selectedColumn.is_required" color="positive" label="Siempre Visible?" :disable="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
                />
            </div>
            <div>
              <q-toggle
                v-model="selectedColumn.default_is_visible" color="positive" label="Se muestra en tabla (default)?" :disable="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
                />
            </div>
        </div>
        <div class="col-sm-12 col-md-6">
            <div>
              <q-toggle
                v-model="selectedColumn.is_sortable" color="positive" label="Se puede ordenar?" :disable="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
                />
            </div>
            <div>
              <q-toggle
                v-model="selectedColumn.is_filterable" color="positive" label="Se puede filtrar?" :disable="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
                />
            </div>
            <div>
              <q-toggle
                v-model="selectedColumn.is_searchable" color="positive" label="Se usa en búsqueda rápida?" :disable="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
                />
            </div>

        </div>
      </div>


      <q-select
          label="Posición de la columna (*)" placeholder="Seleccione la ubicación (inicial) de la columna en la tabla" emit-value map-options filled
          :options="[
                     {value: 1, label: 'Posición 1'}
                    ,{value: 2, label: 'Posición 2'}
                    ,{value: 3, label: 'Posición 3'}
                    ,{value: 4, label: 'Posición 4'}
                    ,{value: 5, label: 'Posición 5'}
                    ,{value: 6, label: 'Posición 6'}
                    ,{value: 7, label: 'Posición 7'}
                    ,{value: 8, label: 'Posición 8'}
                    ,{value: 9, label: 'Posición 9'}
                    ,{value: 10, label: 'Posición 10'}
                    ,{value: 11, label: 'Posición 11'}
                    ,{value: 12, label: 'Posición 12'}
                    ,{value: 13, label: 'Posición 13'}
                    ,{value: 14, label: 'Posición 14'}
                    ,{value: 15, label: 'Posición 15'}
                    ,{value: 16, label: 'Posición 16'}
                    ,{value: 17, label: 'Posición 17'}
                    ,{value: 18, label: 'Posición 18'}
                    ,{value: 19, label: 'Posición 19'}
                    ,{value: 20, label: 'Posición 20'}
                  ]"
          :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
          v-model="selectedColumn.default_position"
          ref="default_position"
          :rules="[
            val => !!val || '* Requerido'
          ]">
          <template v-slot:prepend><q-icon name="fas fa-columns" /></template>
      </q-select>


      <q-input
        ref="label" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        placeholder="Ingrese el nombre del campo (*)" label="Nombre (*)" filled
        v-model="selectedColumn.label"
        :rules="[
                val => !!val || '* Requerido',
                val => val.length > 0 || 'Campo debe tener al menos 1 caracter',
        ]"
        >
        <template v-slot:prepend><q-icon name="fas fa-tag" /></template>
      </q-input>
      <q-input
        ref="label" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        placeholder="Ingrese longitud mínima del campo (*)" label="Ancho mínimo de columna (*)" filled type="number"
        v-model="selectedColumn.default_min_width"
        :rules="[
                val => !!val || '* Requerido',
        ]"
        >
        <template v-slot:prepend><q-icon name="fas fa-text-width" /></template>
      </q-input>
      <q-select
          label="Tipo de Dato en Interface (*)" placeholder="Seleccione el tipo de datos en interface" emit-value map-options filled
          :options="[{value: 'bool', label: 'bool'}
                    ,{value: 'date', label: 'date'}
                    ,{value: 'datetime', label: 'datetime'}
                    ,{value: 'lookup', label: 'lookup'}
                    ,{value: 'money', label: 'money'}
                    ,{value: 'numeric', label: 'numeric'}
                    ,{value: 'quantity', label: 'quantity'}
                    ,{value: 'string', label: 'string'}
                    ,{value: 'user', label: 'user'}
                  ]"
          :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
          v-model="selectedColumn.ux_type"
          ref="ux_type"
          :rules="[
            val => !!val || '* Requerido'
          ]">
          <template v-slot:prepend><q-icon name="fas fa-keyboard" /></template>
      </q-select>
      <q-select v-if="selectedColumn.ux_type=='lookup'"
          label="Tipo de Join (*)" placeholder="Seleccione el tipo de join" emit-value map-options filled
          :options="[{value: 'INNER JOIN', label: 'INNER JOIN'}
                    ,{value: 'LEFT JOIN', label: 'LEFT JOIN'}
                  ]"
          :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
          v-model="selectedColumn.lookup_join"
          ref="lookup_join">
          <template v-slot:prepend><q-icon name="far fa-object-ungroup" /></template>
      </q-select>
      <q-select v-if="selectedColumn.ux_type=='lookup'&&selectedColumn.lookup_join" class="q-mt-md"
          label="Tabla usada en JOIN (*)" placeholder="Seleccione la tabla de datos" emit-value map-options filled
          :options="lookup_tables"
          :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
          v-model="selectedColumn.lookup_table"
          ref="lookup_table">
          <template v-slot:prepend><q-icon name="fas fa-table" /></template>
      </q-select>
      <q-select v-if="selectedColumn.ux_type=='lookup'&&selectedColumn.lookup_join&&selectedColumn.lookup_table" class="q-mt-md"
          :label="'Columna de tabla [' + selectedColumn.lookup_table + '] para usar en JOIN (*)'" placeholder="Seleccione la tabla de datos" emit-value map-options filled
          :options="lookup_cols.filter(x=>x.table_name==selectedColumn.lookup_table)"
          :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
          v-model="selectedColumn.lookup_field"
          ref="lookup_field">
          <template v-slot:prepend><q-icon name="fas fa-columns" /></template>
      </q-select>
      <q-select v-if="selectedColumn.ux_type=='lookup'&&selectedColumn.lookup_join" class="q-mt-md"
          :label="'Columna de tabla [' + selectedColumn.lookup_table + '] para mostrar etiqueta del JOIN (*)'" placeholder="Seleccione la tabla de datos" emit-value map-options filled
          :options="lookup_cols.filter(x=>x.table_name==selectedColumn.lookup_table)"
          :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
          v-model="selectedColumn.lookup_displayField"
          ref="lookup_displayField">
          <template v-slot:prepend><q-icon name="fas fa-columns" /></template>
      </q-select>
      <div>
        <q-toggle  v-if="selectedColumn.ux_type=='lookup'&&selectedColumn.lookup_join"
          v-model="selectedColumn.lookup_is_company_filtered" color="positive" label="Filtrado por compañía?" :disable="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
          />
      </div>
      <q-select
          label="Tipo de Celda usada en Interface (*)" placeholder="Seleccione el tipo de celda en interface" emit-value map-options filled
          :options="[{value: 'div', label: 'div'}
                    ,{value: 'estado', label: 'estado'}
                    ,{value: 'image', label: 'image'}
                    ,{value: 'bool', label: 'bool'}
                  ]"
          :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
          v-model="selectedColumn.cellComponent"
          ref="cellComponent"
          :rules="[
            val => !!val || '* Requerido'
          ]">
          <template v-slot:prepend><q-icon name="fas fa-vector-square" /></template>
      </q-select>
      <q-input class="q-mt-md"
        label="Atributos para celda" placeholder='Ingrese atributos usados en la celda. Ejemplo: {"color": [{"value": "Inactivo", "result": "red-7"},{"value": "Activo", "result": "green-13"}] }' filled
        type="textarea" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        v-model="selectedColumn.cellAttributes"
        />

      <q-select class="q-mt-md"
          label="Alinear datos de la columna (*)" placeholder="Seleccione el tipo de alineación del dato en la columna" emit-value map-options filled
          :options="[{value: 'left', label: 'left'}
                    ,{value: 'center', label: 'center'}
                    ,{value: 'right', label: 'right'}
                  ]"
          :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
          v-model="selectedColumn.align"
          ref="ux_type"
          :rules="[
            val => !!val || '* Requerido'
          ]">
          <template v-slot:prepend><q-icon name="fas fa-align-left" /></template>
      </q-select>

      <q-input class="q-mt-md"
        label="Query para obtener lista de valores al filtrar" placeholder="Ingrese sentencia SQL usada en la Lista en Filtro. Ejemplo: select estado as value, name_es as Estado from sys_users_status order by estado" filled
        type="textarea" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        v-model="selectedColumn.lookup_search_data_query"
        />

      <br><br>

    </q-form>
  </div>

  <q-dialog v-model="dialogColumns">
    <q-card style="min-width: 500px">
      <q-toolbar>
        <q-btn label="Agregar" color="positive" no-caps icon="fas fa-plus" :disable="(db_table&&addedColumns.length>0)?false:true" @click="addColumns" />
      </q-toolbar>
      <q-table
        dense
        :data="lookup_cols.filter(x=>x.table_name==db_table)"
        selection="multiple" :selected.sync="addedColumns" row-key="value"
        virtual-scroll :rows-per-page-options="[0]" :pagination.sync="pagination"
        :columns="[
            { name: 'column_id', field: 'column_id', label: 'Posición', sortable: true, align: 'left'  },
            { name: 'value', field: 'value', label: 'Campo', sortable: true, align: 'left'  },
            { name: 'data_type', field: 'data_type', label: 'Tipo', sortable: true, align: 'left'  },
          ]"
        >
      </q-table>
    </q-card>
  </q-dialog>

</div>



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

export default ({
    data () {
        return {
            moduleName: "Modules", filterString: '', selectedColumn: null, dialogColumns: false,
            addedColumns: [], pagination: { rowsPerPage: 0 },
        }
    },
    methods:{
        addColumns(){
          //console.dir(this.columns)
          let contador = this.columns.length;
          //let newAddedColumns = []
          let newAddedColumns = JSON.parse(JSON.stringify(this.columns));
          this.addedColumns.map(x => {
            if(!this.columns.some(y=>y.db_column==x.value)){
              contador++;
              //console.dir(x)
              let nuevo = {
                align: "left"
                ,cellAttributes: ""
                ,cellComponent: "div"
                ,db_column: x.value
                ,db_type: x.data_type
                ,default_is_visible: true
                ,default_min_width: 120
                ,default_position: contador
                ,icon: ""
                ,isOpenButton: contador==1?true:false
                ,is_filterable: true
                ,is_key: false
                ,is_required: false
                ,is_searchable: true
                ,is_sortable: true
                ,label: x.value
                ,lookup_displayField: ""
                ,lookup_field: ""
                ,lookup_is_company_filtered: false
                ,lookup_join: ""
                ,lookup_search_data_query: "select distinct int1." + x.value + " as value, int1." + x.value + " as " + x.value + " from "+ this.db_table + " int1 where int1.sys_company_id = @sys_company_id order by 1"
                ,lookup_table: ""
                ,ux_type: "string"
              }
              newAddedColumns.push(nuevo)
            }

          })
          this.columns = newAddedColumns
          this.dialogColumns = false
        },
        removeColumn(columna){
          let newColumns = this.columns.filter(x => x.db_column != columna.db_column);
          this.columns = newColumns;
          this.selectedColumn =  null;
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
        columns: {
            get () { return this.$store.state[this.moduleName].editData.columns },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditDataColumns', val) }
            //set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'system', key: 'table_lines', value: val}) }
        },
        lookup_tables: {
            get () { return this.$store.state[this.moduleName].editData.lookup_tables },
        },
        lookup_cols: {
            get () { return this.$store.state[this.moduleName].editData.lookup_cols },
        },
        db_table: {
            get () { return this.$store.state[this.moduleName].editData.basic.db_table },
        },
        sys_user_color: {
            get () { return this.$store.state[this.moduleName].editData.basic.sys_user_color },
        },
    }
})
</script>
