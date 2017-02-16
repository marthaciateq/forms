/**
 * This class is the main view for the application. It is specified in app.js as the
 * "mainView" property. That setting causes an instance of this class to be created and
 * added to the Viewport container.
 *
 * TODO - Replace this content of this view to suite the needs of your application.
 */
Ext.define('forms.view.formsApplied.formsApplied', {
    extend: 'Ext.form.Panel'
    , xtype: 'formsApplied'
    , requires: [
        'Ext.MessageBox'

        , 'forms.view.formsApplied.formsAppliedController'
        , 'Ext.form.Panel'

    ]

    , layout: 'vbox'
    , controller: 'formsApplied'
    , reference: 'formsApplied'
    , title: 'Listado de Formularios aplicados'
    , flex: 1

    , listeners: {
        //initialize: 'getList'
    }


    , items: [
            {
                xtype: 'fieldset',
                layout: 'hbox',
                margin: 2,
                padding: 2,
                items: [
                    {
                        xtype: 'spacer'
                    }
                     , {
                         xtype: 'button',
                         iconCls: 'fa fa-edit',
                         text: 'Aplicar formulario',
                         listeners: {
                             'tap': 'applyNewForm'
                         }
                     }
                    , {
                        xtype: 'button',
                        iconCls: 'fa fa-close',
                        listeners: {
                            'tap': 'close'
                        }
                    }
                ]
            }
           , {
                xtype: 'container'
                , reference: 'cntGrid'
                , flex: 1
                , layout: 'fit'
                , items: [
                    {
                        xtype: 'grid'
                        , layout: 'fit'
                        , reference: 'formsAppliedGrid'
                        , itemiId: 'formsAppliedGrid'
                        , emptyText: 'No se ha realizado ninguna aplicación de este formulario.'
                        , store: {}

                        , columns: [
                            {
                                text: ''
                                , width: 32
                                , renderer: function (value, record, index, cell, column, HTML) {
                                    return '<div class="' + (record.get('estatus') == 'C' ? 'x-fa fa-trash-o' : (record.get('estatus') == 'F' ? 'x-fa fa-check-square-o' : '')) + '">' + '</div>';
                                }
                                , cell: {
                                    encodeHtml: false
                                }
                            }
                            , {
                                flex: 1
                                , text: 'Aplicación'
                                , renderer: function (value, record, index, cell, column, HTML) {
                                    return '<div>' + Ext.Date.format(record.get('fecha'), 'd M Y g:i') + ' </div>';
                                }
                                , cell: {
                                    encodeHtml: false
                                }


                            }

                            , {
                                flex: 1
                                , text: 'Finalización'
                                , renderer: function (value, record, index, cell, column, HTML) {
                                    return '<div>' + Ext.Date.format(record.get('fechaFinalizacion'), 'd M Y g:i') + ' </div>';
                                }
                                , cell: {
                                    encodeHtml: false
                                }
                            }

                        ]
                        , flex: 1

                        , listeners: {
                            itemtap: 'formsAppliedGrid_itemtap'

                        }
                    }
                ]
            }

    ]
});
