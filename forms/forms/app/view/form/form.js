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
    , border: '10'
    //, iconCls: 'x-fa fa-pencil-square-o'
    , flex: 1

    , items: [
        {
            xtype: 'container'
            , layout: 'vbox'
            , flex: 1
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
                        hidden: false,
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