Ext.define('forms.model.option', {
    extend: 'forms.model.model'

    , requires: [
        'Ext.data.Field'
    ]

    , idProperty: 'idFelementoOpcion'

    , fields: [
       {
           name: 'idFelementoOpcion'

       }

       , {
           name: 'idFormElemento'
       }

       , {
           name: 'descripcion'
           , type: 'string'
       }
       , {
           name: 'fecha'
            , type: 'date'
            , format: 'd/m/Y'
            , submitFormat: 'd/m/Y'
           , defaultValue: null
            , convert: function (value, record) {
                //debugger
                return forms.utils.common.deserialize(value)
            }
       }


       , {
           name: 'orden'
           , type: 'int'
       }
        , {
            name: 'action' // N = New, D = Deleted, '' = No Changes
           , type: 'string'
           , defaultValue: ''
        }

    ]

});

