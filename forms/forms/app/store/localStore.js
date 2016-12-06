Ext.define('forms.store.localStore', {
    extend: 'Ext.data.Store',
    autoLoad: true,
    requires: [
        'Ext.data.proxy.Memory',
        'Ext.data.reader.Json'
    ],
    constructor: function (cfg) {
        var me = this;
        cfg = cfg || {};
        me.callParent([Ext.apply({
            storeId: 'localStore',
            proxy: {
                type: 'memory',
                reader: {
                    type: 'json',
                    rootProperty: 'List'
                }
            }
        }, cfg)]);
    }
});