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

        ,'forms.view.main.MainController'
        , 'forms.view.main.MainModel'
        , 'Ext.form.Panel'
    ]

    , layout: 'fit' 
    , controller: 'main'
    , reference: 'main'
    , title: 'Encuestas'
    , flex: 1

    , listeners: {
        initialize: 'getList'
    }

   

    , tools:[
        {
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
                        //, viewModel: {
                        //    type: 'main'
                        //}
                        , store: {}
                        //, bind: '{encuestas}'
                        
                        , columns: [
                            {
                                text: ''
                                //, xtype: 'gridcell'
                                , width: 64
                                , renderer: function (value, record, index, cell, column, HTML) {
                                    //debugger;

                                    return HTML;
                                }
                                , cell: {
                                    encodeHtml: false
                                }
                                //    //xtype: 'widgetcell'
                                //    itemId: 'download'
                                ////    , widget: {
                                        
                                ////       iconCls: 'x-fa fa-cloud-download'
                                ////    }
                                //}
                            }
                            , {
                                flex: 1
                                , text: 'Encuesta'
                                , xtype: 'templatecolumn'
                                , cell: { encodeHtml: false }
                                , tpl: new Ext.XTemplate(
                                                              '<div style="border:0px solid #000;">',
                                                                '<b style="border:0px solid #000;display:block;float:left;">{titulo}</b> <span style="font-size:10px;border:0px solid #000;display:block;float:right;">{[Ext.Date.format(values.fecha, "d M Y H:m")]}</span></div>',
                                                            '<div style=display:block;float:left;><p>Envia: {nombreCompletoCreo}</p></div> '
                                                            
                                                        )

                                
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
