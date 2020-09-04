<template>
<center class="q-gutter-md">
    <q-toolbar >
        <q-btn icon="fas fa-plus" color="primary" label="Agregar Items" />
    </q-toolbar>
    <q-table
      rows-per-page-label= "Registros por Página"
      no-data-label= "No hay registros"
      no-results-label= "No se encontraron registros"
      loading-label= "Cargando datos"
      :class="userColor=='blackDark'?'my-sticky-header-details-table-dark bg-grey-10 ':'my-sticky-header-details-table '"
      table-style="max-height: calc(100vh - 290px)"
      :data="data"
      :columns="columns"
      :pagination.sync="pagination"
      row-key="name"
        />
</center>
</template>
<style lang="sass">
.q-table__bottom
    padding: 0px
.my-sticky-header-details-table
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

.my-sticky-header-details-table-dark
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
        columns: [
            {
            name: 'name',
            required: true,
            label: 'Dessert (100g serving)',
            align: 'left',
            field: row => row.name,
            format: val => `${val}`,
            sortable: true
            },
            { name: 'calories', align: 'center', label: 'Calories', field: 'calories', sortable: true },
            { name: 'fat', label: 'Fat (g)', field: 'fat', sortable: true },
            { name: 'carbs', label: 'Carbs (g)', field: 'carbs' },
            { name: 'protein', label: 'Protein (g)', field: 'protein' },
            { name: 'sodium', label: 'Sodium (mg)', field: 'sodium' },
            { name: 'calcium', label: 'Calcium (%)', field: 'calcium', sortable: true, sort: (a, b) => parseInt(a, 10) - parseInt(b, 10) },
            { name: 'iron', label: 'Iron (%)', field: 'iron', sortable: true, sort: (a, b) => parseInt(a, 10) - parseInt(b, 10) }
        ],
        data: [
            { name: 'KitKat', calories: 518, fat: 26.0, carbs: 65, protein: 7, sodium: 54, calcium: '12%', iron: '6%' }
            ,{ name: 'KitKat1', calories: 518, fat: 26.0, carbs: 65, protein: 7, sodium: 54, calcium: '12%', iron: '6%' }
            ,{ name: 'KitKat2', calories: 518, fat: 26.0, carbs: 65, protein: 7, sodium: 54, calcium: '12%', iron: '6%' }
            ,{ name: 'KitKat3', calories: 518, fat: 26.0, carbs: 65, protein: 7, sodium: 54, calcium: '12%', iron: '6%' }
            ,{ name: 'KitKat4', calories: 518, fat: 26.0, carbs: 65, protein: 7, sodium: 54, calcium: '12%', iron: '6%' }
            ,{ name: 'KitKat5', calories: 518, fat: 26.0, carbs: 65, protein: 7, sodium: 54, calcium: '12%', iron: '6%' }
            ,{ name: 'KitKat6', calories: 518, fat: 26.0, carbs: 65, protein: 7, sodium: 54, calcium: '12%', iron: '6%' }
            ,{ name: 'KitKat7', calories: 518, fat: 26.0, carbs: 65, protein: 7, sodium: 54, calcium: '12%', iron: '6%' }
            ,{ name: 'KitKat8', calories: 518, fat: 26.0, carbs: 65, protein: 7, sodium: 54, calcium: '12%', iron: '6%' }
            ,{ name: 'KitKat9', calories: 518, fat: 26.0, carbs: 65, protein: 7, sodium: 54, calcium: '12%', iron: '6%' }
            ,{ name: 'KitKat10', calories: 518, fat: 26.0, carbs: 65, protein: 7, sodium: 54, calcium: '12%', iron: '6%' }
            ,{ name: 'KitKat11', calories: 518, fat: 26.0, carbs: 65, protein: 7, sodium: 54, calcium: '12%', iron: '6%' }
            ,{ name: 'KitKat12', calories: 518, fat: 26.0, carbs: 65, protein: 7, sodium: 54, calcium: '12%', iron: '6%' }
            ,{ name: 'KitKat13', calories: 518, fat: 26.0, carbs: 65, protein: 7, sodium: 54, calcium: '12%', iron: '6%' }
            ,{ name: 'KitKat14', calories: 518, fat: 26.0, carbs: 65, protein: 7, sodium: 54, calcium: '12%', iron: '6%' }
            ,{ name: 'KitKat15', calories: 518, fat: 26.0, carbs: 65, protein: 7, sodium: 54, calcium: '12%', iron: '6%' }
            ,{ name: 'KitKat16', calories: 518, fat: 26.0, carbs: 65, protein: 7, sodium: 54, calcium: '12%', iron: '6%' }
            ,{ name: 'KitKat17', calories: 518, fat: 26.0, carbs: 65, protein: 7, sodium: 54, calcium: '12%', iron: '6%' }
            ,{ name: 'KitKat18', calories: 518, fat: 26.0, carbs: 65, protein: 7, sodium: 54, calcium: '12%', iron: '6%' }
            ,{ name: 'KitKat19', calories: 518, fat: 26.0, carbs: 65, protein: 7, sodium: 54, calcium: '12%', iron: '6%' }
            ,{ name: 'KitKat20', calories: 518, fat: 26.0, carbs: 65, protein: 7, sodium: 54, calcium: '12%', iron: '6%' }
        ],
        pagination: {
            descending: false,
            page: 1,
            rowsPerPage: 0,
            sortBy: null
        }
    }      
  },
  computed:{
    userColor: { get () { return this.$store.state.main.userColor }  },
  }
})
</script>