/**
 * The main application class. An instance of this class is created by app.js when it
 * calls Ext.application(). This is the ideal place to handle application launch and
 * initialization details.
 */
Ext.define('forms.Application', {
    extend: 'Ext.app.Application'

    , name: 'forms'
    , MODE: null // El modo en el que va a correr la APP (se establece en el método init)
    , stores: [
        // TODO: add global / shared stores here
    ]

    , quickTips: true

    , require: [
        'forms.view.login.login'
        , 'forms.view.main.Main'
    ]

    , views: [
        'forms.view.login.login'
        , 'forms.view.main.Main'

    ]

    /**
    * Se aprovecha este evento para inicializar variables propias para configurar la app.
    */
    , init: function (app) {
        var SERVER = 'http://172.16.5.110' // Es la IP del Servidor de DB al que se va a conectar la APP
            , RUN_MODES = { DEVELOPMENT: /forms/, PRODUCTION: SERVER + '/forms/' } // Los modos en los que puede correr la APP, este objeto se inicializa en el metodo init de la app
        ;

        /*
                IMPORTANTE: Cambiar el valor de DEVELOPMENT a PRODUCTION cuando se vaya a compilar la APP
        */
        this.MODE = RUN_MODES.DEVELOPMENT; // El modo en el que va a correr la APP
    }

    /**
    * Se configura la app y se lanza 
    */
    , launch: function () {
        // Definir el modo en el que va a correr la APP
        forms.globals = {
            root: this.MODE
            , DBManagger: {
                connection: null
                , code: null
                , message: null

            }
        };


        var cm = forms.utils.common.coockiesManagement();
        var loggedIn = cm.get('loggedIn')

        // Evaluar la llave loggedIn y mostrar la vista adecuada
        Ext.Viewport.add({
            xtype: loggedIn ? 'app-main' : 'login'
        });

        this.createFormsDB();

    }

    , createFormsDB: function () {
        var _1KB = 1024 // bytes
        _1MB = _1KB * 1024 // 1024 kbytes
        DB_SIZE = _1MB * 2;  // 2 MB

        forms.globals.DBManagger.connection = window.openDatabase("forms", "1.0", "forms DB", DB_SIZE);
        forms.globals.DBManagger.connection.transaction(this.createTablesDB, this.errorCreate, this.successCreate);
    }

      , createTablesDB: function (tx) {

          //SQLite does not have a storage class set aside for storing dates and/or times. Instead, the built-in Date And Time Functions of SQLite are capable of storing dates and times as TEXT, REAL, or INTEGER values:

          //TEXT as ISO8601 strings ("YYYY-MM-DD HH:MM:SS.SSS").
          //REAL as Julian day numbers, the number of days since noon in Greenwich on November 24, 4714 B.C. according to the proleptic Gregorian calendar.
          //INTEGER as Unix Time, the number of seconds since 1970-01-01 00:00:00 UTC.


          tx.executeSql('CREATE TABLE IF NOT EXISTS forms (idForm TEXT PRIMARY KEY, descripcion TEXT, estatus TEXT, fecha TEXT, titulo TEXT, fcaducidad TEXT);');
          tx.executeSql('CREATE TABLE IF NOT EXISTS formsElementos (idFormElemento TEXT PRIMARY KEY, idForm TEXT, elemento INT, descripcion TEXT, orden INT, minimo INT, requerido TEXT);');
          tx.executeSql('CREATE TABLE IF NOT EXISTS fElementosOpciones (idFelementoOpcion TEXT PRIMARY KEY, idFormElemento TEXT, descripcion TEXT, orden INT);');
          tx.executeSql('CREATE TABLE IF NOT EXISTS elementsData (idFelementoOpcion TEXT, idFormElemento TEXT, descripcion TEXT, fecha TEXT);');

      }

    , errorCreate: function (err) {
        forms.globals.DBManagger.connection = null;
        forms.globals.DBManagger.code = err.code;
        forms.globals.DBManagger.message = err.message;

        Ext.Msg.alert('Iniciando la aplicación', "Ocurrio un error al intentar comunicarse con la DB. Favor de contactar al administrador de la App.", Ext.emptyFn);
    }

    , successCreate: function () {
        //alert("DB creada¡¡¡¡");
    }
    , onAppUpdate: function () {
        Ext.Msg.confirm('Application Update', 'This application has an update, reload?',
            function (choice) {
                if (choice === 'yes') {
                    window.location.reload();
                }
            }
        );
    }
});
