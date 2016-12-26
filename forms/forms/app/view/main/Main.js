/**
 * This class is the main view for the application. It is specified in app.js as the
 * "mainView" property. That setting causes an instance of this class to be created and
 * added to the Viewport container.
 *
 * TODO - Replace this content of this view to suite the needs of your application.
 */
Ext.define('forms.view.main.Main', {
    extend: 'Ext.form.Panel'
    , xtype: 'app-main'
    , requires: [
        'Ext.MessageBox'

        , 'forms.view.main.MainController'
        , 'forms.view.main.MainModel'
        , 'Ext.form.Panel'
    ]

    , layout: 'fit'
    , controller: 'main'
    , reference: 'main'
    , title: 'Listado de Formularios'
    , flex: 1

    , listeners: {
        initialize: 'getLocalData'
    }



    , tools: [

        {
            itemId: 'close'
            , type: 'close'
            , hidden: false
            , iconCls: 'xf fa-retweet'
            , callback: function (panel) {
                panel.getController().depurate();
            }
        }
        , {
            itemId: 'close'
            , type: 'close'
            , hidden: false
            , callback: function (panel) {
                panel.getController().logout();
            }
        }

        
        
        
    ]

    , items: [
            {
                xtype: 'container'
                , reference: 'cntGrid'
                , flex: 1
                , layout: 'fit'
                , items: [
                    {
                        xtype: 'grid'
                        , reference: 'encuestasGrid'
                        , itemiId: 'encuestasGrid'
                        , emptyText: 'No se encontraron formularios asignados'
                       
                     
                        , store: {}
              

                        , columns: [
                            {
                                text: ''
                                , width: 32
                                , renderer: function (value, record, index, cell, column, HTML) {
                                    return '<div class="' + (record.get('origen') == 'R' ? 'x-fa fa-cloud' : 'x-fa fa-unlink') + '">' + '</div>';
                                }
                                , cell: {
                                    encodeHtml: false
                                }
                            }
                            , {
                                text: ''
                                , width: 32
                                , renderer: function (value, record, index, cell, column, HTML) {
                                    return '<div class="' + (record.get('origen') == 'L' ? 'x-fa fa-download' : '') + '">' + '</div>';
                                }
                                , cell: {
                                    encodeHtml: false
                                }
                            }
                            , {
                                flex: 1
                                , text: 'Formulario'
                                , cell: { encodeHtml: false }
                                , renderer: function (value, record, index, cell, column, HTML) {
                                    return '<div class="left-panel" style="' + (record.get('fCaducidad').getTime() < new Date().getTime() ? "background-color:#F5BCA9;" : "") + '"> <b class="title"> ' + record.get('titulo') + ' </b> <p class="sender"> Envia: ' + (record.get('nombreCompletoCreo') !== undefined ? record.get('nombreCompletoCreo') : '') + ' </p></div> <div class="date-panel" style="' + (record.get('fCaducidad').getTime() < new Date().getTime() ? "background-color:#F5BCA9;" : "") + '"> <span class="date-value">Fecha de expiración</br>' + Ext.Date.format(record.get('fCaducidad'), "d M Y") + '</span> </div>'

                                }



                            }

                        ]
                        , flex: 1

                        , listeners: {
                            itemtap: 'encuestasGrid_itemtap'

                        }
                    }
                ]
            }

    ]
});
