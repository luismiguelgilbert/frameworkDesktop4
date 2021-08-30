<template>
<div style="margin: -16px;">

  <DxDataGrid
    ref="mainviewtableDxDataGrid"
    height="calc(100vh - 119px)"
    column-resizing-mode="widget"
    :data-source="history"
    :allow-column-resizing="true" 
    :allow-column-reordering="true"
    :show-borders="false"
    :show-column-lines="userTableLinesDXcols"
    :show-row-lines="userTableLinesDXrows"
    key-expr="record_id"
    >
    <DxScrolling mode="virtual" rowRenderingMode="virtual"  columnRenderingMode="virtual" showScrollbar="always"  :useNative="true"   /> <!--columnRenderingMode="virtual" hace que la última columna tenga un margen-->
    <DxPaging :enabled="true" :page-size="userRowsPerPage" />
    <DxHeaderFilter :visible="true" :allowSearch="true" :texts="{cancel: 'Cancelar', ok: 'Filtrar', emptyValue: '(Vacío)'}" />
    <DxPager :visible="true" :show-page-size-selector="false" :allowed-page-sizes="allowedPageSizes" :show-info="true" :infoText="'Página {0} de {1} ({2} registros)'" :showNavigationButtons="false" :showPageSizeSelector="false" />
    <DxSorting mode="single" ascendingText="Ordenar ascendente" clearText="Limpar orden" descendingText="Ordenar descendente" />
    
    <DxColumn caption="Fecha" data-field="fecha" data-type="date" format="dd MMMM yyyy HH:MM" />
    <DxColumn caption="Evento" data-field="title" data-type="string" />
    <DxColumn caption="Usuario" data-field="usuario" data-type="string" />
    <!--<DxColumn data-field="body" />-->

    <DxMasterDetail
      :enabled="true"
      template="masterDetailTemplate"
    />
    <template #masterDetailTemplate="{ data: fila }">
      <div v-if="fila.data.body" >
        <DxDataGrid v-if="Array.isArray(JSON.parse(fila.data.body))" :data-source="JSON.parse(fila.data.body)" :show-borders="false" />
        <DxDataGrid v-if="!Array.isArray(JSON.parse(fila.data.body))" :data-source="new Array(JSON.parse(fila.data.body))" :show-borders="false" />
      </div>
    </template>
  </DxDataGrid>

</div>

</template>

<script>
import { DxDataGrid, DxColumn, DxButton, DxScrolling, DxPaging, DxPager, DxSorting, DxHeaderFilter, DxMasterDetail } from 'devextreme-vue/data-grid';

export default ({
    name: 'editFormGrid',
    props: {
        moduleName: { type: String, required: true },
    },
    components: {
        DxDataGrid,
        DxColumn,
        DxScrolling,
        DxPager,
        DxSorting,
        DxPaging,
        DxHeaderFilter,
        DxButton,
        DxMasterDetail
    },
    computed:{
        userColor: { get () { return this.$store.state.main.userColor }  },
        userTableLines: { get () { return this.$store.state.main.userTableLines } },
        history: {
          get () { return this.$store.state[this.moduleName].editData.history },
        },
        userTableLines: { get () { return this.$store.state.main.userTableLines } },
        userTableLinesDXcols: { get () { 
                let result = false;
                if(this.userTableLines=='cell'||this.userTableLines=='vertical'){ result = true }
                return result
            } 
        },
        userTableLinesDXrows: { get () { 
                let result = false;
                if(this.userTableLines=='cell'||this.userTableLines=='horizontal'){ result = true }
                return result
            } 
        },
        userRowsPerPage: { get () { return this.$store.state.main.userRowsPerPage }  },
        allowedPageSizes:{
            get () { 
                let resultado = []
                resultado.push(this.userRowsPerPage)
                return resultado
            },
        }
    }
})

</script>
