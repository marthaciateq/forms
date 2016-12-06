Ext.define('forms.model.element', {
    extend: 'forms.model.model'

    , requires: [
        'Ext.data.Field'
    ]

    , idProperty: 'idFormElemento'

    , fields: [
       {
           name: 'idFormElemento'

       }

       , {
           name: 'descripcion'
           , type: 'string'
       }

       , {
           name: 'elemento'
           , type: 'int'
       }
       , {
           name: 'requerido'
           , type: 'boolean'
        
       }
       , {
           name: 'min'
           , type: 'int'
       }
       , {
           name: 'orden'
           , type: 'int'
          
       }

       , {
           name: 'row'
           , type: 'int'
       }


       // Atributos locales
        , {
            name: 'page'
            , type: 'int'

        }
    ]

});

