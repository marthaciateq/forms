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
           name: 'requerido'
           , type: 'boolean'
       }

       , {
           name: 'respuestaValida'
           , type: 'boolean'
       }
    ]


});

