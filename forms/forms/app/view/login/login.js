Ext.define('forms.view.login.login', {
    extend: 'Ext.Panel'
    , xtype: 'login'

    , requires: [
        'forms.view.login.loginController'
        , 'Ext.form.Panel'
    ]

    , controller: 'login'
    , title: 'Inicio de sesión'
    , bodyPadding: 10
    , header: true
    , fullscreen: true
    , iconCls: 'x-fa fa-users'
    

    , items: [
        {
            xtype: 'fieldset'
            , centered: true
            , title: 'Datos de Usuario'
            , instructions: 'Indique su nombre de usuario y clave.'
            , items: [
                {

                    xtype: 'formpanel'
                    , reference: 'formpanel'
                    , items: [
                           {
                               xtype: 'textfield',
                               name: 'usernameText',
                               reference: 'usernameText',
                               label: 'Usuario',
                               allowBlank: false

                           }
                           , {
                               xtype: 'textfield',
                               name: 'passwordText',
                               reference: 'passwordText',
                               inputType: 'password',
                               label: 'Clave',
                               allowBlank: false
                           }
                           , {
                               xtype: 'button',
                               text: 'Iniciar Sesión',
                               formBind: true,
                               listeners: {
                                   tap: 'loginButton_tap'
                               }
                           }

                    ]



                }

            ]
        }

        
    ]


    
});