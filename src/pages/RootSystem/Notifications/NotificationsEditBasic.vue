<template>
<q-form style="margin: -16px;" ref="formulario" greedy autofocus no-error-focus spellcheck="false" autocorrect="off" autocapitalize="off" class="q-gutter-sm q-pa-md">
    <q-input 
        ref="title" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        placeholder="Ingrese el título del mensaje (*)" label="Título(*)" filled
        v-model="title"
        :rules="[
                val => !!val || '* Requerido',
                val => val.length > 2 || 'Campo debe tener al menos 3 carateres',
        ]"
        >
        <template v-slot:prepend><q-icon name="fas fa-mail-bulk" /></template>
    </q-input>
    <q-input
        label="Mensaje(*)" placeholder="Ingrese el mensaje que será enviado (*)" filled
        type="textarea" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        v-model="message"
        :rules="[
                val => !!val || '* Requerido',
                val => val.length > 2 || 'Campo debe tener al menos 3 carateres',
        ]"
        >
        <template v-slot:prepend><q-icon name="fas fa-align-justify" /></template>
    </q-input>
    <q-markup-table dense>
      <thead>
        <th colspan="3">
            <div class="row no-wrap items-center">
              <div class="text-h6 text-primary">Variables Dinámicas</div>
            </div>
          </th>
        <tr>
            <th class="text-left">Variable</th>
            <th class="text-left">Código</th>
            <th class="text-right"></th>
        </tr>
      </thead>
      <tbody>
        <tr>
            <td class="text-left">Nombres del Remitente</td>
            <td class="text-left text-primary">%sender_sys_user_name%</td>
            <td class="text-right"><q-icon name="fas fa-user"/></td>
        </tr>
        <tr>
            <td class="text-left">Apellidos del Remitente</td>
            <td class="text-left text-primary">%sender_sys_user_lastname%</td>
            <td class="text-right"><q-icon name="fas fa-user"/></td>
        </tr>
        <tr>
            <td class="text-left">Mail del Remitente</td>
            <td class="text-left text-primary">%sender_sys_user_mail%</td>
            <td class="text-right"><q-icon name="fas fa-user"/></td>
        </tr>
        <tr>
            <td class="text-left">Nombres del Destinatario</td>
            <td class="text-left text-primary">%sys_user_name%</td>
            <td class="text-right"><q-icon name="fas fa-user-check"/></td>
        </tr>
        <tr>
            <td class="text-left">Apellidos del Destinatario</td>
            <td class="text-left text-primary">%sys_user_lastname%</td>
            <td class="text-right"><q-icon name="fas fa-user-check"/></td>
        </tr>
        <tr>
            <td class="text-left">ID del Destinatario</td>
            <td class="text-left text-primary">%sys_user_id%</td>
            <td class="text-right"><q-icon name="fas fa-user-check"/></td>
        </tr>
        <tr>
            <td class="text-left">Correo del Destinatario</td>
            <td class="text-left text-primary">%sys_user_mail%</td>
            <td class="text-right"><q-icon name="fas fa-envelope"/></td>
        </tr>
        <tr>
            <td class="text-left">Compañía</td>
            <td class="text-left text-primary">%short_name_es%</td>
            <td class="text-right"><q-icon name="fas fa-building"/></td>
        </tr>
        <tr>
            <td class="text-left">RUC</td>
            <td class="text-left text-primary">%company_number%</td>
            <td class="text-right"><q-icon name="fas fa-building"/></td>
        </tr>
        <tr>
            <td class="text-left">Nombre del Canal</td>
            <td class="text-left text-primary">%label%</td>
            <td class="text-right"><q-icon name="fas fa-mail-bulk"/></td>
        </tr>
        <th colspan="3">
            <div class="row no-wrap items-center">
              <div class="text-primary"><b>Este texto: </b>Mensaje desde %short_name_es% con RUC %company_number%</div>
            </div>
            <div class="row no-wrap items-center">
              <div class="text-positive"><b>Se envía: </b>Mensaje desde BITT con RUC 0918715350001</div>
            </div>
        </th>
      </tbody>
    </q-markup-table>
    <br><br>
</q-form>
</template>
<script>
import Vue from 'vue';
import Vuex from 'vuex';


export default ({
    data () {
        return {
            moduleName: "Notifications"
        }
    },
    mounted(){
        this.$refs.formulario.validate()
    },
    methods:{
        /*isFieldErrorBG(fieldName) {
            console.dir('isFieldErrorBG: '+fieldName)
            console.dir(this.$refs.length)
            if(Object.keys(this.$refs).length>0){//espera que existan datos 
                return this.$refs[fieldName].hasError?'red':undefined
            }
        },
        isFieldErrorText(fieldName) {
            if(Object.keys(this.$refs).length>0){//espera que existan datos 
                return this.$refs[fieldName].hasError?'text-white':undefined
            }
        },
        isFieldErrorLabel(fieldName) {
            if(Object.keys(this.$refs).length>0){//espera que existan datos 
                return this.$refs[fieldName].hasError?'white':undefined
            }
        },*/
        
    },
    computed:{
        userColor: { get () { return this.$store.state.main.userColor }  },
        allow_edit: { get () { 
            let resultado = false;
            this.$store.state[this.moduleName].editData.security.filter(x=>x.label=='allow_edit').map(y=>{
              resultado = y.value;  
            }).value; 
            return resultado }, 
        },
        allow_insert: { get () { 
            let resultado = false;
            this.$store.state[this.moduleName].editData.security.filter(x=>x.label=='allow_insert').map(y=>{
              resultado = y.value;  
            }).value; 
            return resultado }, 
        },
        allow_disable: { get () { 
            let resultado = false;
            this.$store.state[this.moduleName].editData.security.filter(x=>x.label=='allow_disable').map(y=>{
              resultado = y.value;  
            }).value; 
            return resultado }, 
        },
        editMode: { get () { return this.$store.state[this.moduleName].editMode }, },
        title: { 
            get () { return this.$store.state[this.moduleName].editData.basic.title }, 
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'title', value: val}) }  
        },
        message: { 
            get () { return this.$store.state[this.moduleName].editData.basic.message }, 
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'message', value: val}) }  
        },
    },
})
</script>