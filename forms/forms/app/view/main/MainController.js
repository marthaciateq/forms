/**
 * This class is the controller for the main view for the application. It is specified as
 * the "controller" of the Main view class.
 *
 * TODO - Replace this content of this view to suite the needs of your application.
 */
Ext.define('forms.view.main.MainController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.main',

    require:[
        'forms.view.form.form'
    ]

    /**
    * Si el usuario presionó el botón descargar, se muestra la opción para descargar el form, de otro modo se muestra el detalle del form seleccionado
    * @param {Ext.grid.Grid} Grid Es el grid que lanza el evento select.
    * @param {int} index Es el indice el elemento seleccionado en el Grid.
    * @param {Ext.data.Model} record Es el modelo correspondiente al elemento seleccionado en el Grid.
    */
    , encuestasGrid_itemtap: function (grid, index, target, record, e, eOpts) {
        var MSG = { YES: 'yes' };

        if (this.isActionButton(e)) {

            Ext.Msg.confirm("Descargar encuesta", "¿Desea descargar la encuesta a su dispositivo movil?"
                , function (response, eOpts, msg) {
                    if (MSG.YES == response) {

                        alert('download...');
                    }
                });
        }
        else {
            // Crear la vista de detalle
            var form = Ext.create('forms.view.form.form', { title: record.get('titulo'), tooltip: record.get('titulo'), iconCls: record.get('fechaDescarga') == null ? 'x-fa fa-cloud' : 'x-fa fa-unlink' });

            Ext.Viewport.add(form);

            form.show();
            form.getController().formModel = record;
            form.getController().move();
        }
        
    }

    /**
    * Evalua el destino del evento tap accionado por el usuario sobre el item seleccionado en el grid
    * @param {Ext.event.Event} event Es el que se va a evaluar.
    * @return {boolean} Indica si el destino del evento es el boton Download del item seleccionado.
    */
    , isActionButton: function (event) {
        var targetClass = event.getTarget().getAttribute('class');

        targetClass = (targetClass == null) ? '' : targetClass;

        return !(targetClass.lastIndexOf('button') == -1);
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

    /**
    * Obtiene un listado de los encuestas asignadas al usuario y las asigna al store de la vista principal
    */
    , getList: function () {
       // debugger;
        var   cm        = forms.utils.common.coockiesManagement()
            , idSession = cm.get('idSession');

        var service = Ext.create('forms.model.model', { NAME: 'sps_forms_listar', idSession: idSession, start: 0, limit: 20 })
            , formsStore = Ext.create('forms.store.localStore', { model: Ext.create('forms.model.form') })
            , me = this

        me.lookupReference('encuestasGrid').setStore(formsStore)
        //me.lookupReference('encuestasGrid').getViewModel().getStore('{encuestas}').loadData(formsStore.data);

        forms.utils.common.request(
            service.getData()
            , function (response, opts) {
                var data = JSON.parse(response.responseText)
                ;

                if (data.type !== 'EXCEPTION')

                    me.lookupReference('encuestasGrid').getStore().loadData(data);
                else
                    Ext.Msg.alert('Error', data.mensajeUsuario, Ext.emptyFn);
            }
            , function (response, opts) {
                alert('Error no controlado');
            }
        );
    }
});
