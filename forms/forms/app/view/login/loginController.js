Ext.define('forms.view.login.loginController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.login',

    require: [
        'forms.view.main.Main'
    ]

    /**
    * Inicia el proceso de inicio de sesión
    */
    , loginButton_tap: function () {

        var me = this
            , user = me.lookupReference('usernameText').getValue()
            , password = me.lookupReference('passwordText').getValue()
            , loadMask = new Ext.LoadMask({ message: 'Iniciando sesion...' });
        ;

        // Hay usuario y clave
        if (user !== null || password !== null) {

            me.getView().add(loadMask);

            loadMask.show();

            // Solicitar al backend el inicio de sesión
            forms.utils.common.request({ "NAME": "spp_autenticar", "login": user, "password": password }
            , function (responseData, opts) { // Success
                var response = JSON.parse(responseData.responseText);


                if (response.type !== 'EXCEPTION') {

                    var login = response[0][0];

                    //// Si los datos de usuario son correctos, se registra el inicio de sesion de manera local.
                    //if (login.idsesion !== null) {

                    var cm = forms.utils.common.coockiesManagement();

                    cm.set('loggedIn', true);
                    cm.set('idSession', login.idsesion);

                    // Crear la vista principal (Listado de encuestas)
                    var main = Ext.create('forms.view.main.Main');


                    // Remove Login Window
                    me.getView().destroy();

                    // Add the main view to the viewport
                    Ext.Viewport.add(main);

                    main.show();
                    //}


                } else
                    Ext.Msg.alert('Error al iniciar sesión', 'No se ha podido iniciar sesión con los datos proporcionados, favor de verificar usuario y clave.', Ext.emptyFn);

                //}



            }
            , function (response, opts) { // failure

                if (response.timedout)
                    Ext.Msg.alert('Tiempo de esperaterminado', response.statusText, Ext.emptyFn);
                else
                    Ext.Msg.alert('Error no esperado', response.statusText, Ext.emptyFn);

            }

            , forms.globals.root + 'pages/login.aspx');

        } else
            Ext.Msg.alert('Error al iniciar sesión', 'Favor de proporcionar la cuenta de usuario y la clave.', Ext.emptyFn);

        // Ocultar mascara
        loadMask.hide();

    }


});