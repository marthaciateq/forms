Ext.define('forms.model.option', {
    extend: 'forms.model.model'

    , requires: [
        'Ext.data.Field'
    ]

    , idProperty: 'idElementoOpcion'

    , fields: [
       {
           name: 'idElementoOpcion'

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
            , convert: function (value, record) {
                return forms.utils.common.robinParse(value)
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

