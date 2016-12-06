Ext.define('forms.model.login', {
    extend: 'forms.model.model'

    , requires: [
        'Ext.data.Field'
        , 'Ext.data.validator.Length'
        , 'Ext.data.validator.Email'
    ]

    , idProperty: 'idSesion'

    , fields: [
       {
           name: 'idSesion'

       }

       , {
           name: 'login'
           , type: 'string'
           , validators: [
                {
                    type: 'email'
               
                }

           ]
       }
       , {
           name: 'password'
           , type: 'string'
           
       }
       
    ]

});

