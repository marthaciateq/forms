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
        , 'forms.model.formUser'

    ]

    , formModel: null

   
    , formsAppliedGrid_itemtap: function (grid, index, target, record, e, eOpts) {
        var me = this
            , form = null;

        if (e.getTarget().className == 'x-fa fa-trash-o') {
            Ext.Msg.confirm("Formularios", "¿Desea eliminar la aplicación del formulario seleccionado?"
                    , function (response, eOpts, msg) {
                        if ('yes' == response) {
                            me.deleteAppliedForm(record.get('idFormUsuario'));
                        }
                    });
        } else if (e.getTarget().className == 'x-fa fa-check-square-o' ||  record.get('estatus') == 'F' ) {
            form = Ext.create('forms.view.form.form', { title: this.formModel.get('titulo'), tooltip: this.formModel.get('titulo'), iconCls: 'x-fa fa-unlink' });

            form.down('container[itemId=cntButtons]').getItems().getByKey('cmdFinish').hide();
            form.down('container[itemId=cntButtons]').getItems().getByKey('cmdSave').hide();

            Ext.Viewport.add(form);

            form.show();
            form.getController().formUserModel = record;
            form.getController().move();
        }else{
            form = Ext.create('forms.view.form.form', { title: this.formModel.get('titulo'), tooltip: this.formModel.get('titulo'), iconCls: 'x-fa fa-unlink' });

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
    
  
    , getList: function () {
        var me = this
            , formsStore = Ext.create('forms.store.localStore', { model: Ext.create('forms.model.formUser') })
            , loadMask = new Ext.LoadMask({ message: 'Obteniendo el listado...' });

        me.getView().add(loadMask);

        loadMask.show();

        var _1KB = 1024 // bytes
        _1MB = _1KB * 1024 // 1024 kbytes
        DB_SIZE = _1MB * 2;  // 2 MB

        me.lookupReference('formsAppliedGrid').setStore(formsStore)

        forms.globals.DBManagger.connection.transaction(
            function (tx) {
                var cm = forms.utils.common.coockiesManagement()
                var sql = 'SELECT bformsUsuarios.*, forms.minimo FROM bformsUsuarios INNER JOIN forms ON bformsUsuarios.idForm = forms.idForm WHERE idUsuario = ? and bformsUsuarios.idForm = ?;';

                tx.executeSql(sql, [cm.get('idUsuario'), me.formModel.get('idForm')],
                    function (tx, records) {

                        var index = 0
                            , record = null
                            , maxRecords = records.rows.length;

                        // IMPORTANTE: Cambiar esto por un for
                        for (index = 0; index < maxRecords; index++) {
                            record = records.rows.item(index);

                            me.lookupReference('formsAppliedGrid').getStore().add(Ext.create('forms.model.formUser', { idFormUsuario: record.idFormUsuario, idForm: record.idForm, fecha: record.fecha, fechaFinalizacion: record.fechaFinalizacion, latitud: record.latitud, longitud: record.longitud, minimo: record.minimo, estatus: record.estatus }));
                        }

                        loadMask.hide();
                        
                    }

                    , function (error) {
                        loadMask.hide();
                        Ext.Msg.alert('Formularios', error.message, Ext.emptyFn);
                    })
            }
            , function (error) {
                loadMask.hide();
                Ext.Msg.alert('Formularios', error.message, Ext.emptyFn);
            });

    }

    , deleteAppliedForm: function (idFormUsuario) {
        var sql = 'DELETE FROM elementsData WHERE idFormUsuario = ?; '
            , me = this
            , loadMask = new Ext.LoadMask({ message: 'Eliminando la aplicación del formulario...' });

        me.getView().add(loadMask);

        loadMask.show();


        forms.globals.DBManagger.connection.transaction(
                  function (tx) {
                      tx.executeSql(sql, [idFormUsuario]
                           , function (tx, result) {

                               // Eliminar las posibles opciones
                               sql = 'DELETE FROM bformsUsuarios WHERE idFormUsuario = ?;';

                               tx.executeSql(sql, [idFormUsuario]
                                   , function (tx, result) {
                                       loadMask.hide();
                                       Ext.Msg.alert('Forms', 'La aplicación del formulario se eliminó correctamente.', Ext.emptyFn);

                                       me.getList();
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

    , close: function () {
        this.getView().destroy();
    }

   

});
