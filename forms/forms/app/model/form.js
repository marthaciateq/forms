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
             name: 'fecha'
           , type: 'date'
           , format: 'd/m/Y'
           , submitFormat: 'd/m/Y'
           , convert: function (v, rec) {
               return forms.utils.common.robinParse(v, 'MS', 'd/m/Y');
           }
           , defaultValue: null
       }
       , {
           name: 'titulo'
       }
       , {
           name: 'fcaducidad'
           , type: 'date'
           , format: 'd/m/Y'
           , submitFormat: 'd/m/Y'
           , defaultValue: null
           , convert: function (v, rec) {
               return forms.utils.common.robinParse(v, 'MS', 'd/m/Y');
           }
       }

       , {
           name: 'fechaDescarga'
           , type: 'date'
           , format: 'd/m/Y'
           , submitFormat: 'd/m/Y'
           , defaultValue: null
           , convert: function (v, rec) {
               return forms.utils.common.robinParse(v, 'MS', 'd/m/Y');
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
    ]

});

