/**
 * This class is the controller for the main view for the application. It is specified as
 * the "controller" of the Main view class.
 *
 * TODO - Replace this content of this view to suite the needs of your application.
 */
 //
 
Ext.define('forms.view.main.MainController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.main',

    require: [
          'forms.view.formsApplied.formsApplied'
        , 'forms.store.localStore'
        , 'forms.model.form'
        , 'forms.model.element'
        , 'forms.model.option'
    ]


    , isLocal: function (form) {
        return form.get('origen') == 'L';
    }

    , encuestasGrid_itemtap: function (grid, index, target, record, e, eOpts) {
        var me = this;
        
        if (e.getTarget().className == 'x-fa fa-cloud' || e.getTarget().className == 'x-fa fa-unlink'){
        
        }else if (e.getTarget().className == 'x-fa fa-download'){
        
            Ext.Msg.confirm("Descargar formulario", "Se va a descargar el formulario al dispositivo. ¿Desea continuar?"
                , function (response, eOpts, msg) {
                    if ('yes' == response) {

                        me.deleteLocalForm(record.get('idForm'));
                    }
                });
        } else {

            if (me.isLocal(record)) {
                //Crear la vista de detalle
                var formsApplied = Ext.create('forms.view.formsApplied.formsApplied', { title: record.get('titulo'), tooltip: 'Formularios aplicados', iconCls: 'x-fa fa-unlink' });

                Ext.Viewport.add(formsApplied);

                formsApplied.show();
                formsApplied.getController().formModel = record;
                formsApplied.getController().getList(record.get('idForm'));
            } else {
                Ext.Msg.confirm("Descargar formulario", "Se va a descargar el formulario al dispositivo. ¿Desea continuar?"
                , function (response, eOpts, msg) {
                    if ('yes' == response) {

                        me.deleteLocalForm(record.get('idForm'));
                    }
                });

            }

        } 

    }

    /**
    * Finaliza la sesión del usuario
    */
    , logout: function () {
        // Eliminar las KEYs de sesion locales
        sessionStorage.removeItem('loggedIn');
        sessionStorage.removeItem('idSession');

        // Destruir la vista principal (Listado de encuestas)
        this.getView().destroy();

        // Mostrar la vista lo login
        Ext.create({
            xtype: 'login'
        });
    }

    , getList: function () {
        this.getLocalData();
    }

    /**
    * Obtiene un listado de los encuestas asignadas al usuario y las asigna al store de la vista principal
    */
    , getRemoteData: function (localData) {
        var me = this
            , cm = forms.utils.common.coockiesManagement()
            , idSession = cm.get('idSession')
            , loadMask = new Ext.LoadMask({ message: 'Obteniendo datos remotos...' })
        ;

        me.getView().add(loadMask);
        loadMask.show();

        var service = Ext.create('forms.model.model', { NAME: 'sps_forms_listar', idSession: idSession, start: 0, limit: 20 })
            , formsStore = Ext.create('forms.store.localStore', { model: Ext.create('forms.model.form') })
            , me = this;

        me.lookupReference('encuestasGrid').setStore(formsStore);
        
        forms.utils.common.request(
            service.getData()
            , function (response, opts) {
                var data = JSON.parse((response.responseText == '') ? '{}' : response.responseText)
                , remoteData = []
                , text = ''
                , localItem = null;
                

                if (data.type !== 'EXCEPTION') {
                    
                    // Por alguna razón, en Android 4.4 kitkat, el Ext.Array.each ni el Ext.Object.each funcionan sobre el resultado devuelto por SQLite SQLResultSetRowList
                    // y no agrega los items que se recuperan del dispositivo local
                    for (var index = 0; index < localData.length; index++) {
                        localItem = localData.item(index);

                        me.lookupReference('encuestasGrid').getStore().add(Ext.create('forms.model.form', { idForm: localItem.idForm, titulo: localItem.titulo, fCaducidad: forms.utils.common.unixTimeToDate(localItem.fCaducidad), descripcion: localItem.descripcion, estatus: localItem.estatus, origen: localItem.origen, minimo: localItem.minimo, numElementos: localItem.numElementos, nombreCompleto: localItem.nombreCompleto }));
                    }
                    

                    var exist = false;
                    
                    Ext.Array.each(data, function (item, index) {

                        exist = me.lookupReference('encuestasGrid').getStore().findRecord('idForm', item.idForm, 0, false, true, true);

                        if (!exist)
                            remoteData.push(item);
                    });


                    me.lookupReference('encuestasGrid').getStore().loadData(remoteData, true);

                    
                    
                    me.lookupReference('encuestasGrid').getStore().sort('fCaducidad', 'DESC');

                    // Ocultar mascara
                    loadMask.hide();
                }
                else {

                    // Ocultar mascara
                    loadMask.hide();
                    Ext.Msg.alert('Error no esperado', data.mensajeUsuario, Ext.emptyFn);
                    me.lookupReference('encuestasGrid').getStore().loadData(localData);
                }
            }
            , function (response, opts) {
                // Ocultar mascara
                loadMask.hide();

                Ext.Msg.alert('Error de comunicación', 'Ocurrio un error al tratar de obtener los formularios del servidor, solo se muestran los formularios que se encuentran almacenados en el dispositivo movil.', Ext.emptyFn);

                me.lookupReference('encuestasGrid').getStore().loadData(localData);
            }
        );
    }

    
    , getLocalData: function () {

        var me = this
            , formsStore = Ext.create('forms.store.localStore', { model: Ext.create('forms.model.form') })
            , loadMask = new Ext.LoadMask({ message: 'Obteniendo datos locales...' });
        ;

        me.getView().add(loadMask);
        loadMask.show();

        var _1KB = 1024 // bytes
        , _1MB = _1KB * 1024 // 1024 kbytes
        , DB_SIZE = _1MB * 2;  // 2 MB

        if (!forms.globals.DBManagger.connection)
            forms.globals.DBManagger.connection = window.openDatabase("forms", "1.0", "forms DB", DB_SIZE);

        forms.globals.DBManagger.connection.transaction(
            function (tx) {
                var cm = forms.utils.common.coockiesManagement();
                var sql = "SELECT forms.idForm, titulo, descripcion, minimo, estatus, fcaducidad AS 'fCaducidad', 'L' AS origen  FROM forms INNER JOIN formsUsuarios ON forms.idForm = formsUsuarios.idForm WHERE idUsuario = ?;";

                tx.executeSql(sql, [cm.get('idUsuario')],
                    function (tx, result) {
                        loadMask.hide();
                        me.getRemoteData(result.rows);
                    }

                    , function (tx, error) {
                        loadMask.hide();
                        Ext.Msg.alert('Formularios', error.message, Ext.emptyFn);
                    })
            }
            , function (error) {
                loadMask.hide();

                Ext.Msg.alert('Formularios', error.message, Ext.emptyFn);
            });

    }


    , initDownload: function (idForm, latitud, longitud) {
        var me = this
         , loadMask = new Ext.LoadMask({ message: 'Iniciando la descarga...' });

        me.getView().add(loadMask);

        loadMask.show();


        var cm = forms.utils.common.coockiesManagement()
       , modelRequest = Ext.create('forms.model.form', { NAME: 'sps_forms_download', idForm: idForm, idSession: cm.get('idSession'), latitud: latitud, longitud: longitud })
       , elementsStore = Ext.create('forms.store.localStore', { model: Ext.create('forms.model.element') })
       , optionsStore = Ext.create('forms.store.localStore', { model: Ext.create('forms.model.option') })
        ;

        forms.utils.common.request(
            modelRequest.getData()
            , function (response, opts) {
                var data = JSON.parse((response.responseText == '') ? '{}' : response.responseText);

                if (data.type !== 'EXCEPTION') {
                    var form = Ext.create('forms.model.form', data[0][0]);

                    // Preguntas
                    elementsStore.loadData(data[1]);

                    // Posibles respuestas
                    optionsStore.loadData(data[2]);

                    arrDataValues = [form.get('idForm'), form.get('titulo'), form.get('descripcion'), form.get('minimo'), '1', forms.utils.common.dateToUnixTime(form.get('fCaducidad'))];
                    forms.globals.DBManagger.connection.transaction(
                        function (tx) {
                            tx.executeSql('INSERT INTO forms (idForm, titulo, descripcion, minimo, estatus, fcaducidad) VALUES (?, ?, ?, ?, ?, ?)', arrDataValues
                                 , function (tx, result) {

                                     var idFormUsuario = forms.utils.common.guid();
                                     var values = [idForm, cm.get('idUsuario')];

                                     sql = "INSERT INTO formsUsuarios( idForm, idUsuario ) VALUES (?, ?)";
                                     tx.executeSql(sql, values
                                         , function (tx, result) {
                                             // Guardar los datos en la DB Local
                                             var sql = ''
                                             , idForm = modelRequest.get('idForm').trim()
                                             , arrDataValues = []
                                             , elementsArguments = []
                                             , optionsArguments = []
                                             , dataArguments = []
                                             , queryElements = ''//'INSERT INTO formsElementos (idFormElemento, idForm, elemento, descripcion, orden, minimo, requerido) VALUES '
                                             , queryOptions = 'INSERT INTO fElementosOpciones (idFelementoOpcion, idFormElemento, descripcion, orden) VALUES ';


                                             elementsStore.each(function (element, index) {
                                                 elementsArguments.push('SELECT ? AS idFormElemento, ? AS idForm, ? AS elemento, ? AS descripcion, ? AS orden, ? AS minimo, ? AS requerido');

                                                 arrDataValues.push(element.get('idFormElemento').trim());
                                                 arrDataValues.push(modelRequest.get('idForm').trim());
                                                 arrDataValues.push(element.get('elemento'));
                                                 arrDataValues.push(element.get('descripcion'));
                                                 arrDataValues.push(element.get('orden'));
                                                 arrDataValues.push(element.get('minimo'));
                                                 arrDataValues.push(element.get('requerido'));
                                             });

                                             queryElements = 'INSERT INTO formsElementos (idFormElemento, idForm, elemento, descripcion, orden, minimo, requerido) SELECT idFormElemento, idForm, elemento, descripcion, orden, minimo, requerido FROM (' + elementsArguments.join(' UNION ') + ')';

                                             tx.executeSql(queryElements, arrDataValues
                                                 , function (tx, result) {
                                                     // vaciar el array de valores
                                                     arrDataValues = [];

                                                     optionsStore.each(function (option, index) {
                                                         optionsArguments.push('SELECT ? AS idFelementoOpcion, ? AS idFormElemento, ? AS descripcion, ? AS orden');

                                                         arrDataValues.push(option.get('idFelementoOpcion').trim());
                                                         arrDataValues.push(option.get('idFormElemento').trim());
                                                         arrDataValues.push(option.get('descripcion'));
                                                         arrDataValues.push(option.get('orden'));
                                                     });

                                                     queryOptions = 'INSERT INTO fElementosOpciones (idFelementoOpcion, idFormElemento, descripcion, orden) SELECT idFelementoOpcion, idFormElemento, descripcion, orden FROM (' + optionsArguments.join(' UNION ') + ')';

                                                     tx.executeSql(queryOptions, arrDataValues
                                                         , function (tx, result) {

                                                             // Registrar la descarga exitosa
                                                             var modelRequest = Ext.create('forms.model.form', { NAME: 'sps_forms_download_commit', idForm: idForm, idSession: cm.get('idSession'), latitud: 0, longitud: 0 });

                                                             forms.utils.common.request(
                                                                modelRequest.getData()
                                                                , function (response, opts) {

                                                                    var data = JSON.parse((response.responseText == '') ? '{}' : response.responseText);

                                                                    if (data.type !== 'EXCEPTION') {

                                                                        loadMask.hide();

                                                                        Ext.Msg.alert('Proceso de descarga.', 'La descarga se realizó con exito.', Ext.emptyFn);

                                                                        me.getList();

                                                                    } else {
                                                                        loadMask.hide();
                                                                        Ext.Msg.alert('Error al realizar la solicitud', data.mensajeUsuario, Ext.emptyFn);
                                                                    }

                                                                }
                                                                , function (response, opts) {
                                                                    // Ocultar mascara
                                                                    loadMask.hide();
                                                                    Ext.Msg.alert('Formularios', 'Error no esperado.', Ext.emptyFn);
                                                                });


                                                         }

                                                         , function (tx, error) {
                                                             // Ocultar mascara
                                                             loadMask.hide();
                                                             Ext.Msg.alert('Formularios', error.message, Ext.emptyFn);
                                                         });

                                                 }

                                                , function (tx, error) {
                                                    // Ocultar mascara
                                                    loadMask.hide();
                                                    Ext.Msg.alert('Formularios', error.message, Ext.emptyFn);
                                                });


                                         }

                                         , function (tx, error) {
                                             // Ocultar mascara
                                             loadMask.hide();
                                             Ext.Msg.alert('Formularios', error.message, Ext.emptyFn);
                                         });


                                 }

                                , function (tx, error) {
                                    // Ocultar mascara
                                    loadMask.hide();
                                    Ext.Msg.alert('Formularios', error.message, Ext.emptyFn);
                                });

                        }

                    , function (error) {
                        // Ocultar mascara
                        loadMask.hide();
                        Ext.Msg.alert('Formularios', error.message, Ext.emptyFn);
                    });


                } else {
                    // Ocultar mascara
                    loadMask.hide();
                    Ext.Msg.alert('Error al realizar la solicitud', data.mensajeUsuario, Ext.emptyFn);
                }


            }
            , function (response, opts) {
                // Ocultar mascara
                loadMask.hide();
                Ext.Msg.alert('Formularios', 'Error no esperado.', Ext.emptyFn);
            });

    }



    , download: function (idForm) {
        var me = this
         , loadMask = new Ext.LoadMask({ message: 'Obteniendo información del GPS...' });

        // La verificacion de la configuración del GPS solo corre sobre Android y no se puede emular en web
        if (forms.getApplication().MODE == forms.getApplication().RUN_MODES.PRODUCTION) {
            me.getView().add(loadMask);

            loadMask.show();
            cordova.plugins.diagnostic.isGpsLocationEnabled(function (enabled) {
                
                if (enabled) {
                    navigator.geolocation.getCurrentPosition(function (position) {
                        loadMask.hide();
                        me.initDownload(idForm, position.coords.latitude, position.coords.longitude);
                    }
                    , function (error) {
                        loadMask.hide();
                        Ext.Msg.alert('Formularios', error.message, Ext.emptyFn);
                    }
                    , {
                        enableHighAccuracy: true
                        , maxAge: 30000
                        , timeout: 60000
                    });
                } else {
                    loadMask.hide();

                    Ext.Msg.confirm("Descargar formulario", "Es necesario tener activo el GPS del dispositivo para realizar esta acción. <br> ¿Desea activarlo ahora?"
                    , function (response, eOpts, msg) {
                        if ('yes' == response) {
                            cordova.plugins.diagnostic.switchToLocationSettings();
                        }
                    });

                }


            }, function (error) {

                loadMask.hide();
                Ext.Msg.alert('Formularios', "Ocurrió el siguiente error al intentar accesar a la configuración del GPS: " + error, Ext.emptyFn);
                
            });

        }else
            me.initDownload(idForm, 0, 0);
        
            
    }

    , deleteLocalForm: function (idForm) {
        var me = this
            , sql = 'DELETE FROM forms WHERE idForm = ?; '
            , loadMask = new Ext.LoadMask({ message: 'Eliminando formulario...' });


        me.getView().add(loadMask);

        loadMask.show();

        forms.globals.DBManagger.connection.transaction(
                  function (tx) {
                      tx.executeSql(sql, [idForm]
                           , function (tx, result) {

                               // Eliminar las posibles opciones
                               sql = 'DELETE FROM felementosOpciones WHERE idFormElemento IN (SELECT idFormElemento FROM formsElementos WHERE idForm = ?);';

                               tx.executeSql(sql, [idForm]
                                   , function (tx, result) {

                                        sql = 'DELETE FROM formsElementos WHERE idForm = ?';

                                        tx.executeSql(sql, [idForm]
                                            , function (tx, result) {
                                                loadMask.hide();
                                                //if (downloadFunction)
                                                me.download(idForm);

                                            }

                                            , function (tx, error) {
                                                loadMask.hide();
                                                Ext.Msg.alert('Formularios', error.message, Ext.emptyFn);
                                            });

                                   }

                                   , function (tx, error) {
                                       loadMask.hide();
                                       Ext.Msg.alert('Formularios', error.message, Ext.emptyFn);
                                   });
                           }

                          , function (tx, error) {
                              loadMask.hide();
                              Ext.Msg.alert('Formularios', error.message, Ext.emptyFn);
                          });
                  }

              , function (error) {
                  loadMask.hide();
                  Ext.Msg.alert('Formularios', error.message, Ext.emptyFn);
              });
    }

    , depurate: function () {
        var me = this;


        Ext.Msg.confirm("Depuración de formularios", "Este proceso eliminará del dispositivo movil los formularios que están caducados y/o los que fueron cancelados por el enviador. <br>Esto no afecta las aplicaciones finalizadas de los demas formularios. <br> <br> ¿Desea continuar?"
           , function (response, eOpts, msg) {
               if ('yes' == response) {
                   var loadMask = new Ext.LoadMask({ message: 'Eliminando formularios caducados...' });


                   me.getView().add(loadMask);

                   loadMask.show();


                   // debugger;
                   var cm = forms.utils.common.coockiesManagement()
                       , idSession = cm.get('idSession')
                   ;

                   var service = Ext.create('forms.model.model', { NAME: 'sps_forms_inactive', idSession: idSession })
                       , formsStore = Ext.create('forms.store.localStore', { model: Ext.create('forms.model.form') });

                   forms.utils.common.request(
                       service.getData()
                       , function (response, opts) {
                           var data = JSON.parse((response.responseText == '') ? '{}' : response.responseText)
                           , deleteValues = []
                           , deleteArguments = [];

                           if (data.type !== 'EXCEPTION') {
                               // 

                               if (data.length > 0) {

                                   Ext.Array.each(data, function (item, index) {

                                       deleteValues.push(item.idForm);

                                       deleteArguments.push(" SELECT ? AS idForm");

                                   });


                                   if (deleteValues.length > 0) {
                                       sql = 'DELETE FROM forms WHERE idForm = ( SELECT idForm FROM (' + deleteArguments.join(' UNION ALL ') + ') AS myCTE WHERE idForm = forms.idForm) ';
                                   } else {
                                       // Si no hay, se crea una consulta para obligar a execute a ejecutar el bloque
                                       sql = 'SELECT ? AS exec;';
                                       deleteValues.push(0);
                                   }


                                   forms.globals.DBManagger.connection.transaction(
                                      function (tx) {
                                          tx.executeSql(sql, deleteValues
                                               , function (tx, result) {

                                                   if (deleteValues.length > 0) {
                                                       sql = 'DELETE FROM formsElementos WHERE idForm = ( SELECT idForm FROM (' + deleteArguments.join(' UNION ALL ')  + ') AS myCTE WHERE idForm = formsElementos.idForm) ';
                                                   } else {
                                                       // Si no hay, se crea una consulta para obligar a execute a ejecutar el bloque
                                                       sql = 'SELECT ? AS exec;'
                                                       deleteValues.push(0);
                                                   }


                                                   tx.executeSql(sql, deleteValues
                                                       , function (tx, result) {


                                                           if (deleteValues.length > 0) {
                                                               sql = 'DELETE FROM formsUsuarios WHERE idForm = ( SELECT idForm FROM (' + deleteArguments.join(' UNION ALL ') + ') AS myCTE WHERE idForm = formsUsuarios.idForm) ';
                                                           } else {
                                                               // Si no hay, se crea una consulta para obligar a execute a ejecutar el bloque
                                                               sql = 'SELECT ? AS exec;';
                                                               deleteValues.push(0);
                                                           }

                                                           tx.executeSql(sql, deleteValues
                                                               , function (tx, result) {

                                                                   if (deleteValues.length > 0) {
                                                                       sql = 'DELETE FROM fElementosOpciones WHERE idFelementoOpcion = ( ' +
                                                                        ' SELECT DISTINCT idFelementoOpcion ' +
                                                                        ' FROM (' + deleteArguments.join(' UNION ALL ') + ') AS myCTE ' +
                                                                        '     INNER JOIN formsElementos ON myCTE.idForm = formsElementos.idForm ' +
                                                                        '     INNER JOIN fElementosOpciones ON formsElementos.idFormElemento = fElementosOpciones.idFormElemento ' +
                                                                        ') ';
                                                                   } else {
                                                                       // Si no hay, se crea una consulta para obligar a execute a ejecutar el bloque
                                                                       sql = 'SELECT ? AS exec;';
                                                                       deleteValues.push(0);
                                                                   }

                                                                   tx.executeSql(sql, deleteValues
                                                                       , function (tx, result) {

                                                                           if (deleteValues.length > 0) {
                                                                               sql = 'DELETE FROM bformsUsuarios WHERE idForm = ( SELECT idForm FROM (' + deleteArguments.join(' UNION ALL ') + ') AS myCTE WHERE idForm = bformsUsuarios.idForm) ';
                                                                           } else {
                                                                               // Si no hay, se crea una consulta para obligar a execute a ejecutar el bloque
                                                                               sql = 'SELECT ? AS exec;';
                                                                               deleteValues.push(0);
                                                                           }

                                                                           tx.executeSql(sql, deleteValues
                                                                               , function (tx, result) {
                                                                                   loadMask.hide();

                                                                                   Ext.Msg.alert('Formularios', 'La depuración se realizó con exito.', Ext.emptyFn);

                                                                                   me.getLocalData();

                                                                               }

                                                                              , function (tx, error) {
                                                                                  loadMask.hide();
                                                                                  Ext.Msg.alert('Formularios', error.message, Ext.emptyFn);
                                                                              });

                                                                       }

                                                                      , function (tx, error) {
                                                                          loadMask.hide();
                                                                          Ext.Msg.alert('Formularios', error.message, Ext.emptyFn);
                                                                      });


                                                               }

                                                              , function (tx, error) {
                                                                  loadMask.hide();
                                                                  Ext.Msg.alert('Formularios', error.message, Ext.emptyFn);
                                                              });


                                                       }

                                                      , function (tx, error) {
                                                          loadMask.hide();
                                                          Ext.Msg.alert('Formularios', error.message, Ext.emptyFn);
                                                      });

                                               }

                                              , function (tx, error) {
                                                  loadMask.hide();
                                                  Ext.Msg.alert('Formularios', error.message, Ext.emptyFn);
                                              });

                                      }

                                  , function (error) {
                                      loadMask.hide();
                                      Ext.Msg.alert('Formularios', error.message, Ext.emptyFn);
                                  });

                               } else {
                                   loadMask.hide();
                                   Ext.Msg.alert('Formularios', 'No se detectaron formularios para ser depurados.', Ext.emptyFn);
                               }


                           } else {
                               loadMask.hide();
                               Ext.Msg.alert('Error', data.mensajeUsuario, Ext.emptyFn);
                           }
                       }
                       , function (response, opts) {
                           loadMask.hide();
                           Ext.Msg.alert('Formularios', 'Error no esperado.', Ext.emptyFn);
                       });

               }
           });

    }

});
