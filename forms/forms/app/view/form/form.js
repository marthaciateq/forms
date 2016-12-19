Ext.define('forms.view.form.form', {
    extend: 'Ext.panel.Panel'

    , requires: [
       'forms.view.form.formController'
        , 'Ext.form.Panel'
        , 'Ext.form.FieldSet'
        , 'forms.model.element'
        , 'forms.model.option'

        , 'Ext.field.Radio'
        , 'Ext.field.Checkbox'
        , 'Ext.field.Text'
        , 'Ext.field.DatePicker'
        , 'Ext.field.Select'

    ]

    , controller: 'form'
    , title: 'Encuesta - '
    , fullscreen: true
    //, iconCls: 'x-fa fa-pencil-square-o'
    , flex: 1
    , tools: [
        {
            type: 'prev'
            , itemId: 'prev'
            , iconCls: 'fa fa-arrow-circle-left'
            , hidden: true
            , callback: function (panel) {
                var controller = panel.getController();

                // Actualizar los datos de las respuestas
                //controller.updateData(controller.optionsData);

                // Moverse
                controller.previous(this);
            }
        }
        , {
            type: 'next'
            , itemId: 'next'
            , iconCls: 'fa fa-arrow-circle-right'
            , callback: function (panel) {
                var controller = panel.getController();

                // Actualizar los datos de las respuestas
                //controller.updateData(controller.optionsData);

                // Moverse
                controller.next(this);
            }
        }

        , {
            type: 'save',
            itemId: 'save',
            iconCls: 'fa fa-save',
            callback: function (panel) {
                panel.getController().save();
            }
        }


        , {
            type: 'up',
            itemId: 'finish',
            iconCls: 'fa fa-check-square',
            callback: function (panel) {
                //panel.destroy();
                panel.getController().finalize();
            }
        }

        , {
            type: 'close',
            itemId: 'close',
            iconCls: 'fa fa-window-close',
            tooltip: 'close',
            callback: function (panel) {

                panel.getController().close();

            }
        }

        , {
            type: 'close',
            itemId: 'download',
            iconCls: 'fa fa-cloud-download',
            tooltip: 'close',
            callback: function (panel) {

                panel.getController().downloadForm();

            }
        }


    ]


    , listeners: {
        destroy: 'destroy_form'
    }

});