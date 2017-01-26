Ext.define('forms.view.form.form', {
    extend: 'Ext.panel.Panel'

    , requires: [
       'forms.view.form.formController'
        , 'Ext.form.Panel'
        , 'Ext.form.FieldSet'
        , 'forms.model.element'
        , 'forms.model.option'
        , 'forms.model.requiredElement'

        , 'Ext.field.Radio'
        , 'Ext.field.Checkbox'
        , 'Ext.field.Text'
        , 'Ext.field.DatePicker'
        , 'Ext.field.Select'
        , 'forms.store.localStore'
    ]

    , controller: 'form'
    , title: 'Encuesta - '
    , fullscreen: true
    , layout: 'fit'
    //, iconCls: 'x-fa fa-pencil-square-o'
    , flex: 1
    //, tools: [
    //    {
    //        type: 'prev'
    //        , itemId: 'prev'
    //        , iconCls: 'fa fa-arrow-circle-left'
    //        , hidden: true
    //        , callback: function (panel) {
    //            var controller = panel.getController();

    //            // Actualizar los datos de las respuestas
    //            //controller.updateData(controller.optionsData);

    //            // Moverse
    //            controller.previous(this);
    //        }
    //    }
    //    , {
    //        type: 'next'
    //        , itemId: 'next'
    //        , iconCls: 'fa fa-arrow-circle-right'
    //        , callback: function (panel) {
    //            var controller = panel.getController();

    //            // Actualizar los datos de las respuestas
    //            //controller.updateData(controller.optionsData);

    //            // Moverse
    //            controller.next(this);
    //        }
    //    }

    //    , {
    //        type: 'save',
    //        itemId: 'save',
    //        iconCls: 'fa fa-save',
    //        callback: function (panel) {
    //            panel.getController().save();
    //        }
    //    }


    //    , {
    //        type: 'up',
    //        itemId: 'finish',
    //        iconCls: 'fa fa-check-square',
    //        callback: function (panel) {
    //            //panel.destroy();
    //            panel.getController().finalize();
    //        }
    //    }

    //    , {
    //        type: 'close',
    //        itemId: 'close',
    //        iconCls: 'fa fa-window-close',
    //        tooltip: 'close',
    //        callback: function (panel) {

    //            panel.getController().close();

    //        }
    //    }

    //]


    , items: [
        {
            xtype: 'container'
            , layout: 'vbox'
            , items:[
            {
                xtype: 'fieldset',
                itemId: 'cntButtons',
                layout: 'hbox',
                margin: 2,
                padding: 2,
                items: [
                    {
                        xtype: 'spacer'
                    }
                     , {
                         xtype: 'button',
                         reference: 'cmdPrevious',
                         itemId: 'cmdPrevious',
                         //text: 'Anterior',
                         iconCls: 'fa fa-arrow-circle-left',
                         listeners: {
                             'tap': 'bPrevious'
                         }
                     }
                    , {
                        xtype: 'button',
                        reference: 'cmdNext',
                        //text: 'Siguiente',
                        itemId: 'cmdNext',
                        iconCls: 'fa fa-arrow-circle-right',
                        listeners: {
                            'tap': 'bNext'
                        }
                    }
                    , {
                        xtype: 'button',
                        //text: 'Guardar',
                        itemId: 'cmdSave',
                        iconCls: 'fa fa-save',
                        listeners: {
                            'tap': 'save'
                        }
                    }
                    , {
                        xtype: 'button',
                        text: 'Finalizar',
                        itemId: 'cmdFinish',
                        iconCls: 'fa fa-check-square',
                        listeners: {
                            'tap': 'finalize'
                        }
                    }
                    , {
                        xtype: 'button',
                        //text: 'Cerrar',
                        iconCls: 'fa fa-close',
                        listeners: {
                            'tap': 'close'
                        }
                    }
                ]
            }
        , {
            xtype: 'fieldset'
            , layout: 'vbox'
            , margin: 1
            , padding: 1
            , scrollable: 'vertical'
            , flex: 1
            , itemId: 'cntControls'
            , reference: 'cntControls'

        }
            ]
        }
    ]


    , listeners: {
        destroy: 'destroy_form'
    }

});