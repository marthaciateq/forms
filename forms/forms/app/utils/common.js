/**
* @author Ángel Hernández
* Clase con funciones útiles para diferentes propósitos
* 
*/
Ext.define('forms.utils.common',
    {
        /**
        *@singleton
        */
        singleton: true


        /**
        * Contienen los KEYs para asociar el valor numérico de cada control una clave String, este valor numérico está definido en la DB
        */
        , CONTROL_CODES: {
            'TEXT': 0
            , 'RADIO': 1
            , 'CHECK': 2
            , 'DATE': 3
            , 'TIME': 4
            , 'SELECT' : 5
        }

        /**
        * Parsea una fecha a un formato especificado.
        * @param {Date} date Fecha.
        * @param {String} dateFormatServer Formato fecha específicado en un String.
        * @param {String} dateFormatToServer Formato fecha específicado en un String.
        * @return {Date} Fecha parseada.
        */
        , parseDate: function (date, dateFormatServer, dateFormatToServer) {
            if (Ext.isDate(date))
                return date;
            else {
                var d = Ext.Date.parse(date, dateFormatServer, true);
                if (d == null)
                    return Ext.Date.parse(date, dateFormatToServer, true);
                else
                    return d;
            }
        }

        /**
        * Ejecuta una consulta AJAX
        * @param {Date} params Object Contiene los parametros adicionales que desean enviarse a la consulta AJAX.
        * @param {function} success función que se ejecuta cuando la solicitud se realizó con exito.
        * @param {function} failure funcion que se ejecuta cuando ocurre un fallo no controlado.
        * @param {function} url al URL que va a responder a la solicitud, este valor reempleza al valor predeterminado de la configuración.
        * @param {function} method el método que se desea definir para la llamda. Valor default:  POST.
        */
        , request: function (params, success, failure, url, method) {
            url || (url = forms.globals.root + 'pages/ajax.aspx');
            method || (method = 'post');

            Ext.Ajax.request({
                url: url
                , params: {
                    DATA: Ext.encode(params)
                }
                , method: method
                , scope: this
                , success: success
                , failure: failure
            });

        }

        /**
        * Es un gestionador para el objeto sessionStorage
        */
        , coockiesManagement: function () {
            me = this;
            return {

                get: function (name) {
                    if (this.exist(name))
                        return JSON.parse(sessionStorage.getItem(name));
                    else
                        return null;
                }
                , set: function (name, value) {
                    sessionStorage.setItem(name, JSON.stringify(value));
                }
                , exist: function (name) {
                    return (sessionStorage.getItem(name) !== null);
                }

                , remove: function (name) {
                    if (this.exist(name))
                        sessionStorage.removeItem(name);
                }

            }

        }

        /**
        * Obtiene el type control de ExtJs de acuerdo a un string KEY
        * @param {String} code La clave del type control que se quiere obtener.
        * @return {String} El type control equivalente.
        */
        , getControlByCode: function (code) {
            var CODES = this.CONTROL_CODES;

            switch (code) {

                case CODES.RADIO:
                    return 'radiofield';


                case CODES.CHECK:
                    return 'checkboxfield';


                case CODES.DATE:
                    return 'datepickerfield';


                case CODES.TIME:
                    return 'textfield';


                case CODES.SELECT:
                    return 'selectfield';

                case CODES.TEXT: 
                    return 'textfield';

             
                
            }
        }

        , dateToUnixTime: function (date) {
            if (Ext.isDate(date))
                return date.getTime() / 1000;
        }


        , unixTimeToDate: function (unixTime) {
            if (unixTime == null || unixTime == undefined || unixTime == 'undefined')
                return

            return new Date(unixTime * 1000);
        }

        , serialize: function (o) {
            me = this;

            if (Ext.isArray(o)) {
                var a = [];
                for (var i = 0; i < o.length; i++) a.push(me.serialize(o[i]));
                return a;
            }
            if (Ext.isObject(o)) {
                var l = {}
                for (var i in o) l[i] = me.serialize(o[i]);
                return l;
            }
            if (Ext.typeOf(o) == 'date') return 'UTC:' + o.getUTCFullYear() + '-' + (o.getUTCMonth() + 1) + '-' + o.getUTCDate() + ',' + o.getUTCHours() + '.' + o.getUTCMinutes() + '.' + o.getUTCSeconds() + '.' + o.getUTCMilliseconds();
            return o;
        }

        // Parsea el formato JSON que envía el backend
        , deserialize: function (o) {
            if (Ext.isArray(o)) for (var i = 0; i < o.length; i++) o[i] = deserialize(o[i]);
            else if (Ext.isObject(o)) for (var i in o) o[i] = deserialize(o[i]);
            else if (Ext.typeOf(o) == 'string') {
                if (o.match(/^UTC:\d*,\d*,\d*,\d*,\d*,\d*,\d*$/)) {
                    var a = o.substr(4).split(',');
                    var d = new Date();
                    d.setUTCFullYear(a[0]);
                    d.setUTCMonth(a[1] - 1);
                    d.setUTCDate(a[2]);
                    d.setUTCHours(a[3]);
                    d.setUTCMinutes(a[4]);
                    d.setUTCSeconds(a[5]);
                    d.setUTCMilliseconds(a[6]);
                    return d;
                }
            }
            return o;
        }

        , guid: function () {
            function s4() {
                return Math.floor((1 + Math.random()) * 0x10000)
                  .toString(16)
                  .substring(1);
            }

            return s4() + s4() + s4() + s4() + 
              s4() + s4() + s4() + s4();
        }



    });
