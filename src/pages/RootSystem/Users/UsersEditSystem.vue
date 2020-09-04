<template>
<q-form ref="formulario" class="q-gutter-sm" spellcheck="false" autocorrect="off" autocapitalize="off">    
    <q-select 
        label="Cantidad de Registros por cada lectura de base de datos (*)" placeholder="Seleccione el número" 
        emit-value map-options filled :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        :options="[
                { label: '17 (Más Rápido, ideal 1366x768)', value: 17, icon: 'fas fa-bolt' },
                { label: '27 (Más Rápido, ideal 1920x1080)', value: 27, icon: 'fas fa-bolt' },
                { label: '50 (Rápido)', value: 50, icon: 'fas fa-bolt' },
                { label: '100 (Normal)', value: 100, icon: 'far fa-hourglass' },
                { label: '250 (Lento)', value: 250, icon: 'fas fa-clock' },
                { label: '1000 (Muy Lento)', value: 1000, icon: 'fas fa-clock' },
                { label: 'Todos (Más Lento)', value: 1000000, icon: 'fas fa-clock' },
            ]"
        v-model="rows_per_page"
        :rules="[
                val => !!val || '* Requerido',
        ]"
        >
        <template v-slot:prepend><q-icon name="fas fa-database" /></template>
    </q-select>
    <q-select 
        label="Estilo de Tabla (*)" placeholder="Seleccione el número" emit-value map-options filled
        :options="[
                { label: 'Horizontal (default)', value: 'horizontal' },
                { label: 'Vertical', value: 'vertical' },
                { label: 'Celdas', value: 'cell' },
                { label: 'Ninguno', value: 'none' },
            ]"
        v-model="table_lines" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        :rules="[
                val => !!val || '* Requerido',
        ]"
        >
        <template v-slot:prepend><q-icon name="fas fa-table" /></template>
    </q-select>
    <q-select 
        label="Formato usado para mostrar Dinero (guarde para aplicar cambios) (*)" placeholder="Seleccione el formato" emit-value map-options filled
        :options="[
                { label: '0 Decimales', value: 0},
                { label: '1 Decimal', value: 1},
                { label: '2 Decimales', value: 2},
                { label: '3 Decimales', value: 3},
                { label: '4 Decimales', value: 4},
                { label: '5 Decimales', value: 5},
                { label: '6 Decimales', value: 6},
            ]"
        v-model="sys_user_moneyFormat" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        :rules="[
                val => !!val || '* Requerido',
        ]"
        >
        <template v-slot:prepend><q-icon name="fas fa-dollar-sign" /></template>
    </q-select>
    <q-select 
        label="Formato usado para mostrar fechas (guarde para aplicar cambios) (*)" placeholder="Seleccione el formato" emit-value map-options filled
        :options="[
                { label: '30/01/2000', value: 'dd/MM/yyyy'},
                { label: '30 ene. 2000', value: 'dd MMM yyyy'},
                { label: '30 enero 2000', value: 'dd MMMM yyyy'},
                { label: 'domingo, 30 enero 2000', value: 'dddd, dd MMMM yyyy'}
            ]"
        v-model="sys_user_dateformat" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        :rules="[
                val => !!val || '* Requerido',
        ]"
        >
        <template v-slot:prepend><q-icon name="fas fa-calendar" /></template>
    </q-select>
    <q-select 
        label="Formato usado para mostrar horas (guarde para aplicar cambios) (*)" placeholder="Seleccione el formato" emit-value map-options filled
        :options="[
                { label: '20:01', value: 'HH:mm'},
                { label: '20:01:20', value: 'HH:mm:ss'},
            ]"
        v-model="sys_user_timeformat" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        :rules="[
                val => !!val || '* Requerido',
        ]"
        >
        <template v-slot:prepend><q-icon name="fas fa-clock" /></template>
    </q-select>
    <q-select 
        label="Formato usado para mostrar Usuario (guarde para aplicar cambios) (*)" placeholder="Seleccione el formato" emit-value map-options filled
        :options="[
                { label: 'lgilbert@bitt.com.ec (ID de Usuario)', value: 'sys_user_id'},
                { label: 'LUIS (Nombres de Usuario)', value: 'sys_user_name'},
                { label: 'GILBERT (Apellidos de Usuario)', value: 'sys_user_lastname' },
                { label: 'LUIS GILBERT (Nombres y Apellidos de Usuario)', value: 'sys_user_name,sys_user_lastname'},
            ]"
        v-model="sys_user_usersFormat" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        :rules="[
                val => !!val || '* Requerido',
        ]"
        >
        <template v-slot:prepend><q-icon name="fas fa-users" /></template>
    </q-select>
    <br><br>
</q-form>
</template>
<script>
import Vue from 'vue';
import Vuex from 'vuex';

export default ({
    data () {
        return {
            moduleName: "Users"
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
        rows_per_page: { 
            get () { return this.$store.state[this.moduleName].editData.system.rows_per_page }, 
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'system', key: 'rows_per_page', value: val}) }  
        },
        table_lines: { 
            get () { return this.$store.state[this.moduleName].editData.system.table_lines }, 
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'system', key: 'table_lines', value: val}) }  
        },
        sys_user_moneyFormat: { 
            get () { return this.$store.state[this.moduleName].editData.system.sys_user_moneyFormat }, 
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'system', key: 'sys_user_moneyFormat', value: val}) }  
        },
        sys_user_dateformat: { 
            get () { return this.$store.state[this.moduleName].editData.system.sys_user_dateformat }, 
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'system', key: 'sys_user_dateformat', value: val}) }  
        },
        sys_user_timeformat: { 
            get () { return this.$store.state[this.moduleName].editData.system.sys_user_timeformat }, 
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'system', key: 'sys_user_timeformat', value: val}) }  
        },
        sys_user_usersFormat: { 
            get () { return this.$store.state[this.moduleName].editData.system.sys_user_usersFormat }, 
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'system', key: 'sys_user_usersFormat', value: val}) }  
        },
        /*sys_link_id: { 
            get () { return this.$store.state[this.moduleName].editData.system.sys_link_id }, 
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'system', key: 'sys_link_id', value: val}) }  
        },
        lookup_links: {
            get () { 
                let allLinks = this.$store.state[this.moduleName].editData.lookup_links
                let allowedLinks = [];
                let allowedID = []
                this.$store.state[this.moduleName].editData.lookup_profiles_links.filter(p=>p.sys_profile_id==this.sys_profile_id).map(item=>{
                    allowedID.push(item.sys_link_id.substring(0,2))
                    allowedID.push(item.sys_link_id.substring(0,4))
                })
                allowedID = Array.from(new Set(allowedID))
                allowedID.filter(x=>x.length==2).map(item=>{
                    let rootNode = allLinks.find(root => root.sys_link_id == item);
                    rootNode['children'] = allLinks.filter(modules=> allowedID.filter(int=>int.length==4&&int.substring(0,2)==item).some(existe => existe==modules.sys_link_id) )
                    allowedLinks.push(rootNode)
                })
                return allowedLinks
            }
        },
        sys_profile_id: { 
            get () { return this.$store.state[this.moduleName].editData.basic.sys_profile_id }, 
        },*/
    }
})
</script>