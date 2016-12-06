Ext.define('forms.model.model', {
    extend: 'Ext.data.Model'

    , requires: [
        'Ext.data.Field'
    ]

    , fields: [
       {
           name: 'NAME'
           , convert: function (value, record) {
               return value;
           }
           , useNullValue: null
       }
    ]

    , schema: {
        namespace: 'forms.model'
    }

});

