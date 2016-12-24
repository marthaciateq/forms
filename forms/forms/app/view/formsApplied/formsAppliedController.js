/**
 * This class is the controller for the main view for the application. It is specified as
 * the "controller" of the Main view class.
 *
 * TODO - Replace this content of this view to suite the needs of your application.
 */
Ext.define('forms.view.formsApplied.formsAppliedController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.formsApplied',

    require: [
        'forms.view.form.form'
        , 'forms.store.localStore'
        , 'forms.model.form'
        , 'forms.model.element'
        , 'forms.model.option'
    ]

    , formModel: null

   
    , formsAppliedGrid_itemtap: function (grid, index, target, record, e, eOpts) {
        var me = this;

        if (e.getTarget().className == 'x-fa fa-trash-o') {
            Ext.Msg.confirm("Forms", "¿Desea eliminar la aplicación de encuesta seleccionada?"
                    , function (response, eOpts, msg) {
                        if ('yes' == response) {

                            me.deleteAppliedForm(record.get('idFormUsuario'));

                        }
                    });
        } else if (e.getTarget().className == 'x-fa fa-check-square-o' ||  record.get('estatus') == 'F' ) {

        }else{

            var form = Ext.create('forms.view.form.form', { title: this.formModel.get('titulo'), tooltip: this.formModel.get('titulo'), iconCls: 'x-fa fa-unlink' });

            Ext.Viewport.add(form);

            form.show();
            form.getController().formUserModel = record;
            form.getController().move();
        }
    }

    , applyNewForm: function () {
        // Crear la vista de detalle
        var form = Ext.create('forms.view.form.form', { title: this.formModel.get('titulo'), tooltip: this.formModel.get('titulo'), iconCls: 'x-fa fa-unlink' });

        Ext.Viewport.add(form);

        form.show();
        form.getController().formModel = this.formModel;
        form.getController().move();
    }
    
    
    ///**
    //* Obtiene un listado de los encuestas asignadas al usuario y las asigna al store de la vista principal
    //*/
    //, getList: function () {
    //    // debugger;
    //    var cm = forms.utils.common.coockiesManagement()
    //        , idSession = cm.get('idSession');

    //    var service = Ext.create('forms.model.model', { NAME: 'sps_forms_listar', idSession: idSession, start: 0, limit: 20 })
    //        , formsStore = Ext.create('forms.store.localStore', { model: Ext.create('forms.model.form') })
    //        , me = this

    //    me.lookupReference('encuestasGrid').setStore(formsStore)
    //    //me.lookupReference('encuestasGrid').getViewModel().getStore('{encuestas}').loadData(formsStore.data);

    //    forms.utils.common.request(
    //        service.getData()
    //        , function (response, opts) {
    //            var data = JSON.parse(response.responseText)
    //            ;

    //            if (data.type !== 'EXCEPTION')

    //                me.lookupReference('encuestasGrid').getStore().loadData(data);
    //            else
    //                Ext.Msg.alert('Error', data.mensajeUsuario, Ext.emptyFn);
    //        }
    //        , function (response, opts) {
    //            alert('Error no controlado');
    //        }
    //    );
    //}

    , getList: function () {
        var me = this
            , formsStore = Ext.create('forms.store.localStore', { model: Ext.create('forms.model.formUser') })
        ;

        var _1KB = 1024 // bytes
        _1MB = _1KB * 1024 // 1024 kbytes
        DB_SIZE = _1MB * 2;  // 2 MB

        me.lookupReference('formsAppliedGrid').setStore(formsStore)

        forms.globals.DBManagger.connection.transaction(
            function (tx) {
                var cm = forms.utils.common.coockiesManagement()
                var sql = 'SELECT bformsUsuarios.*, forms.minimo FROM bformsUsuarios INNER JOIN forms ON bformsUsuarios.idForm = forms.idForm WHERE idUsuario = ? and bformsUsuarios.idForm = ?;';

                tx.executeSql(sql, [cm.get('idUsuario'), me.formModel.get('idForm')],
                    function (tx, result) {

                        me.lookupReference('formsAppliedGrid').getStore().loadData(result.rows)
                    }

                    , me.selectError)
            }
            , function (err) {
                alert(err.message);
            });

    }

    , deleteAppliedForm: function (idFormUsuario) {
        var sql = 'DELETE FROM elementsData WHERE idFormUsuario = ?; '
            , me = this;


        forms.globals.DBManagger.connection.transaction(
                  function (tx) {
                      tx.executeSql(sql, [idFormUsuario]
                           , function (tx, result) {

                               // Eliminar las posibles opciones
                               sql = 'DELETE FROM bformsUsuarios WHERE idFormUsuario = ?;';

                               tx.executeSql(sql, [idFormUsuario]
                                   , function (tx, result) {

                                       Ext.Msg.alert('Forms', 'La aplicación de la encuesta se eliminó correctamente.', Ext.emptyFn);

                                       me.getList();

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

    , close: function () {
        this.getView().destroy();
    }

});
