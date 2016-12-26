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
        
        }

        else if (e.getTarget().className == 'x-fa fa-download'){
        
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
        // debugger;
        var cm = forms.utils.common.coockiesManagement()
            , idSession = cm.get('idSession')
        ;

        var service = Ext.create('forms.model.model', { NAME: 'sps_forms_listar', idSession: idSession, start: 0, limit: 20 })
            , formsStore = Ext.create('forms.store.localStore', { model: Ext.create('forms.model.form') })
            , me = this

        me.lookupReference('encuestasGrid').setStore(formsStore)
        //me.lookupReference('encuestasGrid').getViewModel().getStore('{encuestas}').loadData(formsStore.data);

        forms.utils.common.request(
            service.getData()
            , function (response, opts) {
                var data = JSON.parse(response.responseText)
                remoteData = [];
                ;

                if (data.type !== 'EXCEPTION') {

                    Ext.Array.each(localData, function (data, index) {
                        me.lookupReference('encuestasGrid').getStore().add(Ext.create('forms.model.form', {idForm: data.idForm, titulo: data.titulo, fCaducidad: forms.utils.common.unixTimeToDate(data.fCaducidad), descripcion: data.descripcion, estatus: data.estatus, origen: data.origen, minimo: data.minimo, numElementos: data.numElementos, nombreCompleto: data.nombreCompleto}));


                    });
                    

                    var exist = false;

                    Ext.Array.each(data, function (item, index) {

                        exist = me.lookupReference('encuestasGrid').getStore().findRecord('idForm', item.idForm, 0, false, true, true);

                        if (!exist)
                            remoteData.push(item);
                    });

                    if (remoteData.length > 0)
                        me.lookupReference('encuestasGrid').getStore().loadData(remoteData, true);


                    me.lookupReference('encuestasGrid').getStore().sort('fCaducidad', 'DESC')
                }
                else {
                    Ext.Msg.alert('Error no esperado', data.mensajeUsuario, Ext.emptyFn);
                    me.lookupReference('encuestasGrid').getStore().loadData(localData);
                }
            }
            , function (response, opts) {
                Ext.Msg.alert('Error de comunicación', 'Ocurrio un error al tratar de obtener los formularios del servidor, solo se muestran los formularios que se encuentran almacenados en el dispositivo movil.', Ext.emptyFn);

                me.lookupReference('encuestasGrid').getStore().loadData(localData);
            }
        );
    }


    , getLocalData: function () {
        var me = this
            , formsStore = Ext.create('forms.store.localStore', { model: Ext.create('forms.model.form') })
        ;

        var _1KB = 1024 // bytes
        _1MB = _1KB * 1024 // 1024 kbytes
        DB_SIZE = _1MB * 2;  // 2 MB

        if (!forms.globals.DBManagger.connection)
            forms.globals.DBManagger.connection = window.openDatabase("forms", "1.0", "forms DB", DB_SIZE);

        forms.globals.DBManagger.connection.transaction(
            function (tx) {
                var cm = forms.utils.common.coockiesManagement()
                var sql = "SELECT forms.idForm, titulo, descripcion, minimo, estatus, fcaducidad AS 'fCaducidad', 'L' AS origen  FROM forms INNER JOIN formsUsuarios ON forms.idForm = formsUsuarios.idForm WHERE idUsuario = ?;";
                //var sql ="SELECT * FROM forms;"

                tx.executeSql(sql, [cm.get('idUsuario')],
                    function (tx, result) {
                        //formsStore.loadData(result.rows);

                        me.getRemoteData(result.rows);

                    }

                    , me.selectError)
            }
            , function (err) {
                alert(err.message);
            });

    }


    , download: function (idForm) {
        var me = this

        navigator.geolocation.getCurrentPosition(function (position) {
          
            var cm = forms.utils.common.coockiesManagement()
           , modelRequest = Ext.create('forms.model.form', { NAME: 'sps_forms_download', idForm: idForm, idSession: cm.get('idSession'), latitud: position.coords.latitude, longitud: position.coords.longitude  })
           , elementsStore = Ext.create('forms.store.localStore', { model: Ext.create('forms.model.element') })
           , optionsStore = Ext.create('forms.store.localStore', { model: Ext.create('forms.model.option') })
           , loadMask = new Ext.LoadMask({ message: 'Obteniendo formularios...' });
            ;

            me.getView().add(loadMask);

            loadMask.show();

            
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
                                                 , queryElements = 'INSERT INTO formsElementos (idFormElemento, idForm, elemento, descripcion, orden, minimo, requerido) VALUES'
                                                 , queryOptions = 'INSERT INTO fElementosOpciones (idFelementoOpcion, idFormElemento, descripcion, orden) VALUES'


                                                 elementsStore.each(function (element, index) {
                                                     elementsArguments.push('(?, ?, ?, ?, ?, ?, ?)');

                                                     arrDataValues.push(element.get('idFormElemento').trim());
                                                     arrDataValues.push(modelRequest.get('idForm').trim());
                                                     arrDataValues.push(element.get('elemento'));
                                                     arrDataValues.push(element.get('descripcion'));
                                                     arrDataValues.push(element.get('orden'));
                                                     arrDataValues.push(element.get('minimo'));
                                                     arrDataValues.push(element.get('requerido'));
                                                 });


                                                 queryElements += elementsArguments.join(', ');


                                                 tx.executeSql(queryElements, arrDataValues
                                                     , function (tx, result) {


                                                         // vaciar el array de valores
                                                         arrDataValues = [];

                                                         optionsStore.each(function (option, index) {
                                                             optionsArguments.push('(?, ?, ?, ?)');
                                                             arrDataValues.push(option.get('idFelementoOpcion').trim());
                                                             arrDataValues.push(option.get('idFormElemento').trim());
                                                             arrDataValues.push(option.get('descripcion'));
                                                             arrDataValues.push(option.get('orden'));
                                                         });

                                                         queryOptions += optionsArguments.join(',');


                                                         tx.executeSql(queryOptions, arrDataValues
                                                             , function (tx, result) {


                                                                 // Registrar la descarga exitosa
                                                                 var modelRequest = Ext.create('forms.model.form', { NAME: 'sps_forms_download_commit', idForm: idForm, idSession: cm.get('idSession'), latitud: position.coords.latitude, longitud: position.coords.longitude });

                                                                 forms.utils.common.request(
                                                                    modelRequest.getData()
                                                                    , function (response, opts) {
                                                                        var data = JSON.parse((response.responseText == '') ? '{}' : response.responseText);

                                                                        if (data.type !== 'EXCEPTION') {

                                                                            Ext.Msg.alert('Proceso de descarga.', 'La descarga se realizó con exito.', Ext.emptyFn);

                                                                            me.getList();

                                                                        } else
                                                                            Ext.Msg.alert('Error al realizar la solicitud', data.mensajeUsuario, Ext.emptyFn);
                                                                    }
                                                                    , function (response, opts) {
                                                                        alert("Error no esperado");
                                                                    });


                                                             }

                                                             , function (tx, error) {
                                                                 alert(error.message);
                                                             });

                                                     }

                                                    , function (tx, error) {
                                                        alert(error.message);
                                                    });


                                             }

                                             , function (tx, error) {
                                                 alert(error.message);
                                             });



                                     }

                                    , function (tx, error) {
                                        alert(error.message);
                                    });

                            }

                        , function (error) {
                            alert(error.message);
                        });

                        
                    } else
                        Ext.Msg.alert('Error al realizar la solicitud', data.mensajeUsuario, Ext.emptyFn);

                }
                , function (response, opts) {
                    alert("Error no esperado");
                });


            loadMask.hide();

        }
        ,
        function (error) {
            alert(' código: ' + error.code + '\n' + ' mensaje: ' + error.message + '\n');

            latitud = null;
            longitud = null;
        });

        
            

        
    }

    , deleteLocalForm: function (idForm) {
        var sql = 'DELETE FROM forms WHERE idForm = ?; '
            //, idForm = this.formModel.get('idForm').trim()
            , me = this;


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

                                                //if (downloadFunction)
                                                me.download(idForm);

                                            }

                                            , function (tx, error) {
                                                alert(error.message);
                                            });

                                   }

                                   , function (tx, error) {
                                       alert(error.message);
                                   });
                           }

                          , function (tx, error) {
                              alert(error.message);
                          });


                  }

              , function (error) {
                  alert(error.message);
              });
    }

    , depurate: function () {
        var me = this;
        Ext.Msg.confirm("Depuración de formularios", "Este proceso eliminará del dispositivo movil los formularios que están caducados y/o canceladas. <br>Las aplicaciones finalizadas no son afectadas. <br> <br> ¿Desea continuar?"
           , function (response, eOpts, msg) {
               if ('yes' == response) {



                   // debugger;
                   var cm = forms.utils.common.coockiesManagement()
                       , idSession = cm.get('idSession')
                   ;

                   var service = Ext.create('forms.model.model', { NAME: 'sps_forms_inactive', idSession: idSession })
                       , formsStore = Ext.create('forms.store.localStore', { model: Ext.create('forms.model.form') })

                   forms.utils.common.request(
                       service.getData()
                       , function (response, opts) {
                           var data = JSON.parse(response.responseText)
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
                                       sql = 'WITH myCTE AS ( ' + deleteArguments.join(' UNION ALL ') + ') ' +
                                        'DELETE FROM forms WHERE idForm = ( SELECT idForm FROM myCTE WHERE idForm = forms.idForm) ';
                                   } else {
                                       // Si no hay, se crea una consulta para obligar a execute a ejecutar el bloque
                                       sql = 'SELECT ? AS exec;'
                                       deleteValues.push(0);
                                   }


                                   forms.globals.DBManagger.connection.transaction(
                                      function (tx) {
                                          tx.executeSql(sql, deleteValues
                                               , function (tx, result) {

                                                   if (deleteValues.length > 0) {
                                                       sql = 'WITH myCTE AS ( ' + deleteArguments.join(' UNION ALL ') + ') ' +
                                                        'DELETE FROM formsElementos WHERE idForm = ( SELECT idForm FROM myCTE WHERE idForm = formsElementos.idForm) ';
                                                   } else {
                                                       // Si no hay, se crea una consulta para obligar a execute a ejecutar el bloque
                                                       sql = 'SELECT ? AS exec;'
                                                       deleteValues.push(0);
                                                   }


                                                   tx.executeSql(sql, deleteValues
                                                       , function (tx, result) {


                                                           if (deleteValues.length > 0) {
                                                               sql = 'WITH myCTE AS ( ' + deleteArguments.join(' UNION ALL ') + ') ' +
                                                                'DELETE FROM formsUsuarios WHERE idForm = ( SELECT idForm FROM myCTE WHERE idForm = formsUsuarios.idForm) ';
                                                           } else {
                                                               // Si no hay, se crea una consulta para obligar a execute a ejecutar el bloque
                                                               sql = 'SELECT ? AS exec;'
                                                               deleteValues.push(0);
                                                           }

                                                           tx.executeSql(sql, deleteValues
                                                               , function (tx, result) {

                                                                   if (deleteValues.length > 0) {
                                                                       sql = 'WITH myCTE AS ( ' + deleteArguments.join(' UNION ALL ') + ') ' +
                                                                        'DELETE FROM fElementosOpciones WHERE idFelementoOpcion = ( ' + 
                                                                        ' SELECT DISTINCT idFelementoOpcion ' +
                                                                        ' FROM myCTE ' +
                                                                        '     INNER JOIN formsElementos ON myCTE.idForm = formsElementos.idForm ' +
                                                                        '     INNER JOIN fElementosOpciones ON formsElementos.idFormElemento = fElementosOpciones.idFormElemento ' +
                                                                        ') ';
                                                                   } else {
                                                                       // Si no hay, se crea una consulta para obligar a execute a ejecutar el bloque
                                                                       sql = 'SELECT ? AS exec;'
                                                                       deleteValues.push(0);
                                                                   }

                                                                   tx.executeSql(sql, deleteValues
                                                                       , function (tx, result) {

                                                                           if (deleteValues.length > 0) {
                                                                               sql = 'WITH myCTE AS ( ' + deleteArguments.join(' UNION ALL ') + ') ' +
                                                                                'DELETE FROM bformsUsuarios WHERE idForm = ( SELECT idForm FROM myCTE WHERE idForm = bformsUsuarios.idForm) ';
                                                                           } else {
                                                                               // Si no hay, se crea una consulta para obligar a execute a ejecutar el bloque
                                                                               sql = 'SELECT ? AS exec;'
                                                                               deleteValues.push(0);
                                                                           }

                                                                           tx.executeSql(sql, deleteValues
                                                                               , function (tx, result) {

                                                                                   Ext.Msg.alert('Depuración de formularios.', 'La depuración se realizó con exito.', Ext.emptyFn);

                                                                                   me.getLocalData();

                                                                               }

                                                                              , function (tx, error) {
                                                                                  alert(error.message);
                                                                              });

                                                                       }

                                                                      , function (tx, error) {
                                                                          alert(error.message);
                                                                      });


                                                               }

                                                              , function (tx, error) {
                                                                  alert(error.message);
                                                              });
                                                        


                                                       }

                                                      , function (tx, error) {
                                                          alert(error.message);
                                                      });

                                               }

                                              , function (tx, error) {
                                                  alert(error.message);
                                              });


                                      }

                                  , function (error) {
                                      alert(error.message);
                                  });

                               } else {

                                   Ext.Msg.alert('Depuración de formularios.', 'No se detectaron formularios para ser depurados.', Ext.emptyFn);
                               }



                           }
                           else
                               Ext.Msg.alert('Error', data.mensajeUsuario, Ext.emptyFn);
                       }
                       , function (response, opts) {
                           alert('Error no controlado');
                       }
                   );



               
                   
               }
           });

    }





});
