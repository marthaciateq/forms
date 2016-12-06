
Ext.define('user', {
    extend: 'forms.model.model'

    , requires: [
        'Ext.data.Field'
        , 'Ext.data.validator.Length'
        //, 'Ext.data.validator.Presence'
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
           , validators: [
                {
                    type: 'length'
                    , min: 3
                    , minOnlyMessage: 'El nombre de usuario es de 3 caracteres como mínimo'
                }

           ]
       }

    ]

});


/**
 * This class is the view model for the Main view of the application.
 */
Ext.define('forms.view.login.loginModel', {
    extend: 'Ext.app.ViewModel',

    alias: 'viewmodel.loginm',

    //data: {
    //    login: Ext.create('forms.model.login')
    //}



    links: {
        user: {
            reference: 'user'
            , create: true
        }
    }

    //TODO - add data, formulas and/or methods to support your view
});
