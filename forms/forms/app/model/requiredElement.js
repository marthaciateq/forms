Ext.define('forms.model.requiredElement', {
    extend: 'Ext.data.Model'

    , requires: [
        'Ext.data.Field'
    ]

    , idProperty: 'idFormElemento'

    , fields: [
       {
           name: 'idFormElemento'
       }

       , {
           name: 'numRespuestas'
           , type: 'int'
       }

       , {
           name: 'elemento'
           , type: 'int'
       }

       , {
           name: 'requerido'
           , type: 'string'
       }

       , {
           name: 'respuestaValida'
           , type: 'boolean'
       }
       , {
           name: 'orden'
           , type: 'int'
       }
    ]


});

