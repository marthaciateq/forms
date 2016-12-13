Ext.define('forms.model.form', {
    extend: 'forms.model.model'

    , requires: [
        'Ext.data.Field'
    ]

    , idProperty: 'idForm'

    , fields: [
       {
           name: 'idForm'
       }

       , {
           name: 'descripcion'
           , type: 'string'
       }

       , {
           name: 'estatus'
       }

       , {
           name: 'titulo'
       }
       , {
           name: 'fCaducidad'
           , type: 'date'
           , format: 'd/m/Y'
           , submitFormat: 'd/m/Y'
           , defaultValue: null
           , convert: function (v, rec) {
               return forms.utils.common.deserialize(v, 'MS', 'd/m/Y');
           }
       }

       , {
           name: 'fechaDescarga'
           , type: 'date'
           , format: 'd/m/Y'
           , submitFormat: 'd/m/Y'
           , defaultValue: null
           , convert: function (v, rec) {
               return forms.utils.common.deserialize(v, 'MS', 'd/m/Y');
           }
       }
       , {
           name: 'finalizado'
           , type: 'boolean'
       }

       , {
           name: 'numElementos'
           , type: 'int'
       }

       // campos de referencia
       , {
           name: 'nombreCompletoCreo'
       }

       , {
           name: 'idFormDescarga'
           , type: 'string'
       }
    ]

});

