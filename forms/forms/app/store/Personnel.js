Ext.define('forms.store.Personnel', {
    extend: 'Ext.data.Store',

    alias: 'store.personnel',

    fields: [
         'date', 'title', 'sender'
    ],

    data: { items: [
        { sender: 'Jean Luc', title: "Clima organizacional", date: "2016-01-21" },
        { sender: 'Worf', title: "Nivel de Satisfacción transporte", date: "2016-09-25" },
        { sender: 'Deanna', title: "Uso de cafetería", date: "2016-08-30" },
        { sender: 'Data', title: "Servicio de limpieza", date: "2016-09-19" },

    { sender: 'Jean Luc', title: "Clima organizacional", date: "2016-01-21" },
{ sender: 'Worf', title: "Nivel de Satisfacción transporte", date: "2016-09-25" },
{ sender: 'Deanna', title: "Uso de cafetería", date: "2016-08-30" },
{ sender: 'Data', title: "Servicio de limpieza", date: "2016-09-19" },

{ sender: 'Jean Luc', title: "Clima organizacional", date: "2016-01-21" },
{ sender: 'Worf', title: "Nivel de Satisfacción transporte", date: "2016-09-25" },
{ sender: 'Deanna', title: "Uso de cafetería", date: "2016-08-30" },
{ sender: 'Data', title: "Servicio de limpieza", date: "2016-09-19" },

{ sender: 'Jean Luc', title: "Clima organizacional", date: "2016-01-21" },
{ sender: 'Worf', title: "Nivel de Satisfacción transporte", date: "2016-09-25" },
{ sender: 'Deanna', title: "Uso de cafetería", date: "2016-08-30" },
{ sender: 'Data', title: "Servicio de limpieza", date: "2016-09-19" }
    ]},

    proxy: {
        type: 'memory',
        reader: {
            type: 'json',
            rootProperty: 'items'
        }
    }
});
