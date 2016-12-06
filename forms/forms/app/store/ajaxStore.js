Ext.define('forms.store.ajaxStore', {
    extend: 'Ext.data.Store',

    requires:[
        'Ext.data.proxy.Ajax',
        'Ext.data.reader.Json'
    ]

    , constructor: function (cfg) {
        var me = this;
        cfg = cfg || {};
        me.callParent([Ext.apply({
            storeId: 'ajaxStore',
            pageSize: 20,
            proxy: {
                type: 'ajax',
                actionMethods: {
                    read: 'POST'
                },
                url: forms.globals.root + 'forms/pages/ajax.aspx',
                reader: {
                    type: 'json',
                    messageProperty: 'responseMessage',
                    rootProperty: 'List',
                    totalProperty: '@totalRecords'
                },
                writer: {
                    type: 'json'
                }
            }
        }, cfg)]);
    }
});
