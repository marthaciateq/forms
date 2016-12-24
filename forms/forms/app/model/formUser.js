Ext.define('forms.model.formUser', {
    extend: 'forms.model.model'

    , requires: [
        'Ext.data.Field'
    ]

    , fields: [
        {
            name: 'idFormUsuario'
        }
       , {
           name: 'idForm'
       }

       , {
           name: 'idUsuario'
           , type: 'string'
       }

       , {
           name: 'fecha'
           , type: 'date'
           , format: 'd/m/Y'
           , submitFormat: 'd/m/Y'
           , defaultValue: null
           , convert: function (v, rec) {
               return forms.utils.common.unixTimeToDate(v);
           }
       }

       , {
           name: 'latitud'
           , type: 'number'
       }
        , {
            name: 'longitud'
            , type: 'number'
        }
    ]

});

