﻿Ext.define('forms.view.form.formController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.form'

    , formModel: null
    , page : 1
    , start: 0
    , limit: 2
    , totalRecords: 0
    , elements: Ext.create('forms.store.localStore', { model: Ext.create('forms.model.element') }) // Mantiene en cache los elementos del form
    , options: Ext.create('forms.store.localStore', { model: Ext.create('forms.model.option') })  // Mantiene en cache las opciones del elemento
    , optionsData: Ext.create('forms.store.localStore', { model: Ext.create('forms.model.option') })  // Mantiene en cache las respuestas de los elementos
    , allElements: Ext.create('forms.store.localStore', { model: Ext.create('forms.model.requiredElement') })

    /**
    * Realiza la acción MOVE del formulario
    */
    , move: function () {
        var hasRecords = null;

        this.start =  ( this.page == 1 ) ? 0 : ( this.limit * ( this.page - 1 ) );

        // Quitar todo el contenido del form
        this.getView().removeAll();
        
        // Detectar si ya hay elementos cacheados de la nueva pagina
        hasRecords = this.elements.findRecord('page', this.page, 0, false, true, true);


        // Obtener los nuevos elementos y renderizarlos
        if (hasRecords == null)
            this.getDetailsById(this.formModel);
        else
            this.getCacheData(this.page);
    }

    /**
    * Realiza la acción: moverse hacia la siguiente página del form
    */
    , next: function (next) {
        var me = this;

        // Incrementar el indicador de pagina
        me.page++;

        // Moverse
        me.move();

        // Actualizar la apariencia de los controles
        if (me.page > 1)
            next.getParent().getItems().getByKey('prev').show();

        var maxRecords = me.start + me.limit;

        var diference = maxRecords - me.totalRecords;


        if (me.start + diference == me.totalRecords)
            next.hide();
    }

    /**
    * Realiza la acción: moverse hacia la página anterior del form
    */
    , previous: function (prev) {
        var me = this;

        // Decrementar el indicador de pagina
        me.page--;

        // Moverse
        me.move();

        // Actualizar aspecto de los controles
        if (me.page == 1) {
            prev.hide();

            if (me.totalRecords > me.start + me.limit)
                prev.getParent().getItems().getByKey('next').show();

        } else {
            prev.getParent().getItems().getByKey('next').show();
        }
    }

    /**
    * Consulta el backend y obtiene la estructura de la encuesta solicitada. La estructura obtenida corresponde al bloque de la página solicitada
    * @param {Ext.data.Model} formModel Es el form del cual se quiere obtener la estructura.
    */
    , getDetailsById: function (formModel) {
        //debugger;
        this.formModel = formModel;
        this.totalRecords = this.formModel.get('numElementos');

        if (this.isDownload(this.formModel))
            this.getLocalData();
        else
            this.getRemoteData();
    }

    , isDownload: function( form ){
        return form.get('fechaDescarga') !== null;
    }
    
    , getRemoteData: function () {
        var me = this
            , modelRequest = Ext.create('forms.model.form', { NAME: 'sps_forms_detalle_buscar', idForm: me.formModel.get('idForm'), start: this.start, limit: this.limit })
            , elementsStore = Ext.create('forms.store.localStore', { model: Ext.create('forms.model.element') })
            , optionsStore = Ext.create('forms.store.localStore', { model: Ext.create('forms.model.option') })
            , loadMask = new Ext.LoadMask({ message: 'Obteniendo encuesta...' });
        ;

        me.getView().add(loadMask);

        loadMask.show();


        forms.utils.common.request(
            modelRequest.getData()
            , function (response, opts) {

                var data = JSON.parse(response.responseText);

                //me.totalRecords = data[0][0].totalRecords;

                // Preguntas
                elementsStore.loadData(data[0]);

                // Posibles respuestas
                optionsStore.loadData(data[1]);

                // Asignar el numero de pagina al que pertenece cada elemento
                elementsStore.each(function (element, index) {
                    element.set('page', me.page);
                });

                // Cachear los nuevos elementos y sus opciones correspondientes
                me.elements.loadData(elementsStore.getRange(0, elementsStore.count()), true);
                me.options.loadData(data[1], true);

                // Respuestas
                me.optionsData.loadData(data[2], true);

                // Elementos preparados para usarse como validaciones

                me.allElements.loadData(data[3]);

                // Dibujar los controles en el formulario
                me.renderControls(elementsStore, optionsStore);



                if (me.totalRecords <= me.limit)
                    me.getView().down('panelheader').getItems().getByKey('next').hide();
            }
            , function (response, opts) {
                alert("Error no controlado");
            });

        loadMask.hide();

    }

    , getLocalData: function () {
        var me = this
            , idForm = this.formModel.get('idForm').trim()
            , elementsStore = Ext.create('forms.store.localStore', { model: Ext.create('forms.model.element') })
            , optionsStore = Ext.create('forms.store.localStore', { model: Ext.create('forms.model.option') })
        ;

        forms.globals.DBManagger.connection.transaction(
            function (tx) {
                var sqlCount = 'SELECT COUNT(idFormElemento) AS totalRecords FROM formsElementos WHERE idForm = ?;';

                tx.executeSql(sqlCount, [idForm], 
                    function (tx, result) {
                        me.totalRecords = result.rows[0].totalRecords;

                        var sql = 'WITH myCTE AS ( ' +
                                    '	SELECT * FROM ' +
                                    '		( ' +
                                    '			SELECT idFormElemento AS id ' +
                                    '				, elemento ' +
                                    "				, '' as pid " +
                                    '				, descripcion ' +
                                    '				, orden ' +
                                    '				, requerido ' +
                                    '				, [min] ' +
                                    '				, ( SELECT COUNT(idFormElemento) FROM formsElementos AS B WHERE A.idFormElemento >= b.idFormElemento) AS row  ' +
                                    '			FROM	formsElementos AS A  ' +
                                    '			WHERE	idForm = ?  ' +
                                    '		) AS C ' +
                                    '	WHERE row > ? AND row <= ? ' +
                                    ') ' +
                                    '	SELECT id, elemento, pid, descripcion, orden, requerido, [min], 0 AS nivel FROM myCTE ' +
                                    '	UNION ALL ' +
                                    '	SELECT idElementoOpcion As id, 0 AS elemento, idformElemento AS pid, felementosOpciones.descripcion, felementosOpciones.orden, 0 AS requerido, 0 as [min], 1 AS nivel FROM felementosOpciones ' +
                                    '	INNER JOIN myCTE ON felementosOpciones.idformElemento = myCTE.id ' +
                                    '   UNION ALL ' +
                                    '   SELECT idElementoOpcion AS id, fecha AS elemento, idFormElemento AS pid, elementsData.descripcion, 0 AS orden, 0 AS requerido, 0 AS [min], 2 AS nivel FROM elementsData ' +
                                    '   INNER JOIN myCTE ON elementsData.idFormElemento = myCTE.id '

                       //sql = 'SELECT idElementoOpcion AS id, fecha AS elemento, idFormElemento AS pid, descripcion, 0 AS orden, 0 AS requerido, 0 AS [min], 2 AS nivel FROM elementsData'

                        tx.executeSql(sql, [idForm, me.start, me.start + me.limit]
                            , function (tx, records) {
                                var model = null;

                                Ext.Array.each(records.rows, function (record, index) {
                                    switch (record.nivel){

                                        case 0:
                                            model = Ext.create('forms.model.element', { idFormElemento: record.id, descripcion: record.descripcion, elemento: record.elemento, requerido: record.requerido, min: record.min, orden: record.orden, page: me.page });
                                            elementsStore.add(model);
                                            break;

                                        case 1:
                                            model = Ext.create('forms.model.option', {idElementoOpcion: record.id, descripcion: record.descripcion, idFormElemento: record.pid, orden: record.orden, action: ''});
                                            optionsStore.add(model);
                                            break;

                                        case 2:
                                            model = Ext.create('forms.model.option', { idElementoOpcion: record.id, descripcion: record.descripcion, idFormElemento: record.pid, fecha: new Date(record.elemento), action: '' });
                                            me.optionsData.add(model);
                                            break;
                                    }

                                });

                                // Cachear los nuevos elementos y sus opciones correspondientes
                                me.elements.loadData(elementsStore.getRange(0, elementsStore.count()), true);
                                me.options.loadData(optionsStore.getRange(0, optionsStore.count()), true);

                                me.renderControls(elementsStore, optionsStore);
                            }
                            
                            , me.selectError)


                       

                    }
                    
                    , me.selectError)
            }
            , function (err) {
                alert(err.message);
            });

        

    }
    /**
    * Consulta el cache y obtiene la estructura de la encuesta solicitada
    * @param {int} page Es el número de página de la encuesta, esta se utiliza para obtener únicamente el bloque de la encuesta que corresponde a la página.
    */
    , getCacheData: function (page) {
        var me = this
            , elementsStore = Ext.create('forms.store.localStore', { model: Ext.create('forms.model.element') })
            , optionsStore = Ext.create('forms.store.localStore', { model: Ext.create('forms.model.option') })
        ;

        // Filtrar unicamente los elementos que pertenecen a la página
        var elementsFilter = new Ext.util.Filter({
            id: 'elementsFilter'
            , property: 'page'
            , value: me.page
        });


        me.elements.addFilter(elementsFilter);

        // Cargar los elementos correspondientes a la pagina solicitada
        elementsStore.loadData(me.elements.getRange(0, me.elements.count()));

        elementsStore.each(function (element, index) {
            // Filtrar unicamente las opciones que pertenecen al elemento
            var optionsFilter = new Ext.util.Filter({
                id: 'optionsFilter'
                , property: 'idFormElemento'
                , value: element.get('idFormElemento')
            });

            me.options.addFilter(optionsFilter);

            optionsStore.loadData( me.options.getRange(0, me.options.count()), true );

        });

        me.elements.clearFilter();
        me.options.clearFilter();

        // Dibujar los controles en el formulario
        me.renderControls(elementsStore, optionsStore);

    }

    /**
    * Dibuja en el form, los controles de la encuesta
    * @param {Ext.data.Store} elementsStore Contiene la lista de preguntas del form.
    * @param {Ext.data.Store} optionsStore Contiene la lista de respuestas de cada pregunta de elementsStore.
    */
    , renderControls: function (elementsStore, optionsStore) {
        var NEW = 'N'
            , DELETE = 'D'
            , ACTIVE = '';

        var me = this
            , WIDTH_FACTOR = 1.1
            , MARGIN = 20
            , tm = new Ext.util.TextMetrics
            , type = null
            , formPanel = this.getView()
            , defaultName = ''
            , currControl = null
        ;

        // Recorrer los elementos del formulario
        elementsStore.each(function (element, index) {

            // Generar un label para cada elemento y mostrar en el la descripcion de la pregunta
            type = forms.utils.common.getControlByCode(element.get('elemento'));

            formPanel.add({ xtype: 'label', name: 'label' + element.get('idFormElemento'), html: element.get('orden') + '.-' + element.get('descripcion') + (element.get('requerido') ? '<span style="background:#FF8000;color:#FFF;font-size:8pt;border:1px solid #FFF;margin:3px;padding:1px;">REQ<span>' : '') });

            // Filtro para obtener unicamente las opciones que pertenecen al elemento
            var optionsFilter = new Ext.util.Filter({
                id: 'elementsFilter'
                , property: 'idFormElemento'
                , value: element.get('idFormElemento')
            });

            // Aplicar el filtro
            optionsStore.addFilter(optionsFilter);

            // Generar una a una las opciones del elemento
            optionsStore.each(function (option, index) {
                defaultName = type + option.get('idElementoOpcion');

                // Si la opcion se debe mostrar como un control de radio, entonces necesita un tratamiento especial, ya que todos los controles generados deben tener el mismo NAME
                if (element.get('elemento') == forms.utils.common.CONTROL_CODES.RADIO) {
                    elementControl = Ext.create({
                        xtype: type
                        , name: type + element.get('idFormElemento')
                        , inputValue: option.get('idElementoOpcion')
                        , labelWidth: tm.getWidth(option.get('descripcion')) * WIDTH_FACTOR + MARGIN
                        , reference: defaultName
                    });
                } else if (element.get('elemento') == forms.utils.common.CONTROL_CODES.DATE) {
                    elementControl = Ext.create({
                        xtype: type
                        , name: defaultName
                        , dateFormat: 'd/m/Y'
                        , labelWidth: tm.getWidth(option.get('descripcion')) * WIDTH_FACTOR + MARGIN
                        , reference: defaultName
                    });
                } else
                    elementControl = Ext.create({
                        xtype: type
                        , name: defaultName
                        , labelWidth: tm.getWidth(option.get('descripcion')) * WIDTH_FACTOR + MARGIN
                        , reference: defaultName
                    });

                elementControl.setLabel(option.get('descripcion'));


                if (element.get('elemento') == forms.utils.common.CONTROL_CODES.TEXT || element.get('elemento') == forms.utils.common.CONTROL_CODES.DATE)
                    elementControl.setValue(option.get('descripcion'));

                // Agregar el control al form
                formPanel.add(elementControl);
            });

            // Quitar el filtro al store de opciones
            optionsStore.clearFilter();



            // Aplicar el filtro de opciones a los respuestas de las opciones

            me.optionsData.addFilter(optionsFilter);

            // Asignar los valores de respuesta a las opciones del elemento
            me.optionsData.each(function (option, index) {

                if (option.get('action') !== DELETE) {
                    defaultName = type + option.get('idElementoOpcion');

                    currControl = me.lookupReference(defaultName)

                    if (type == 'radiofield' || type == 'checkboxfield')
                        currControl.setChecked(true);
                    else
                        if (type == 'datepickerfield')//currControl.setValue(Ext.Date.parse(option.get('descripcion'), 'd-m-Y')option.get('descripcion'));
                            currControl.setValue(option.get('fecha'));
                        else
                            currControl.setValue(option.get('descripcion'));
                }
            });

            // Remover el filtro
            me.optionsData.clearFilter();
        });

    }
    
    /**
    * Remueve los stores ocupados en la vista form
    * @param {Ext.data.Store} elementsStore Contiene la lista de preguntas del form.
    * @param {Ext.data.Store} optionsStore Contiene la lista de respuestas de cada pregunta de elementsStore.
    */
    , destroy_form: function () {
        this.elements.removeAll();
        this.options.removeAll();
        this.optionsData.removeAll();


    }


    , updateData: function () {
        var NEW = 'N'
            , DELETE = 'D'
            , ACTIVE = ''
            , UPDATE = 'U'
        ;

        var me = this
            , elementsStore = Ext.create('forms.store.localStore', { model: Ext.create('forms.model.element') })
            , currControl = null
            , type = null
            , optionData = null
            , currOption = null
        ;

        // Cargar únicamente los elementos renderizados en el form
        elementsStore.loadData(me.elements.getRange( me.start , (me.start + me.limit) - 1));

        //
        elementsStore.each(function (element, index) {
            type = forms.utils.common.getControlByCode(element.get('elemento'));

            // Filtro para obtener unicamente las opciones que pertenecen al elemento
            var optionsFilter = new Ext.util.Filter({
                id: 'elementsFilter'
                , property: 'idFormElemento'
                , value: element.get('idFormElemento')
            });

            me.options.addFilter(optionsFilter);


            if (element.get('elemento') == forms.utils.common.CONTROL_CODES.CHECK || element.get('elemento') == forms.utils.common.CONTROL_CODES.RADIO) {

                
                //// Si se trata de un checkbox, se remueven todas las opciones
                //me.options.remove(me.options.getAt(indexOption));

                me.options.each(function (option, index) {

                    optionData = me.optionsData.getById(option.get('idElementoOpcion'));

                    if (optionData)
                        if (optionData.get('action') == NEW)
                            me.optionsData.remove(optionData);
                        else
                            optionData.set('action', DELETE)

                    //me.optionsData.remove(optionData);

                });
                

                //  y se agregan las respuestas nuevas
                me.options.each(function (option, index) {
                    currControl = me.lookupReference( type + option.get('idElementoOpcion') );

                    if (currControl.isChecked()) {

                        optionData = me.optionsData.getById(option.get('idElementoOpcion'));
                        if (optionData) {
                            if (optionData.get('action') == DELETE)
                                optionData.set('action', ACTIVE);
                        }
                        else
                            me.optionsData.add(Ext.create('forms.model.option', { idElementoOpcion: option.get('idElementoOpcion'), idFormElemento: option.get('idFormElemento'), orden: option.get('orden'), action: NEW }));
                    }
                });

                //me.options.clearFilter();
            } else {

                // Para todos los controles distintos de CHECK u RADIO

                // Remover el unico option que hay el store para este elemento


                //me.optionsData.remove(me.optionsData.getById( me.options.getAt(0).get('idElementoOpcion')));

                currOption = me.optionsData.getById(me.options.getAt(0).get('idElementoOpcion'));

                if (currOption == null || currOption == undefined) {
                    
                    currOption = me.options.getAt(0);

                    currOption = Ext.create('forms.model.option', { idElementoOpcion: currOption.get('idElementoOpcion'), idFormElemento: element.get('idFormElemento'), orden: currOption.get('orden'), action: NEW });

                    me.optionsData.add(currOption);
                }


                currControl = me.lookupReference(type + currOption.get('idElementoOpcion'));

                if (type == 'datepickerfield') {
                    currOption.set('descripcion', Ext.Date.format(currControl.getValue(), 'd/m/Y'));
                    currOption.set('action', UPDATE);
                }
                else {
                    currOption.set('descripcion', currControl.getValue());
                    currOption.set('action', UPDATE);
                }
            }

            me.options.clearFilter();



        });

    }


    // Validacion

    , validateResponse: function () {
        var me = this
            , element = null
            , invalidElements = []
        ;

        me.updateNumResponse();

        // Filtro para obtener unicamente las opciones que pertenecen al elemento
        var optionsFilter = new Ext.util.Filter({
            id: 'elementsFilter'
            , property: 'idFormElemento'
            , value: null
        });

        var deletedFilter = new Ext.util.Filter({
            id: 'deleteFilter',
            filterFn: function (model) {
                return model.get('action') !== 'D';
            }
        })

        me.optionsData.addFilter(deletedFilter);


        me.allElements.each(function (validator, index) {
            //element = me.elements.getById(validator.get('idFormElemento'));

            optionsFilter.setConfig('value', validator.get('idFormElemento'));

            me.optionsData.addFilter(optionsFilter);

            if (validator.get('requerido') && validator.get('numRespuestas') == 0)
                //invalidElements.push( { orden: element.get('orden'), descripcion: element.get('descripcion'), requerido: element.get('requerido'), min: element.get('min'), numRespuestas: validator.get('numRespuestas') });
                invalidElements.push({ orden: index + 1, requerido: validator.get('requerido'), min: validator.get('min'), numRespuestas: validator.get('numRespuestas') });
            else
                if (validator.get('min') > validator.get('numRespuestas')) {
                    //invalidElements.push({ orden: element.get('orden'), descripcion: element.get('descripcion'), requerido: element.get('requerido'), min: element.get('min'), numRespuestas: validator.get('numRespuestas') });
                    invalidElements.push({ orden: index + 1, requerido: validator.get('requerido'), min: validator.get('min'), numRespuestas: validator.get('numRespuestas') });
                }

           

        });

        me.optionsData.clearFilter();

        return invalidElements;
    }


    , updateNumResponse: function () {

        var me = this
            , validator = null
            , option = null
        ;


        // Filtro para obtener unicamente las opciones que pertenecen al elemento
        var optionsFilter = new Ext.util.Filter({
            id: 'elementsFilter'
            , property: 'idFormElemento'
            , value: null
        });

        var deletedFilter = new Ext.util.Filter({
            id: 'deleteFilter',
            filterFn: function (model) {
                return model.get('action') !== 'D';
            }
        })

        me.optionsData.addFilter(deletedFilter);
        me.optionsData.addFilter(optionsFilter);

        me.elements.each(function (element, index) {


            optionsFilter.setConfig('value', element.get('idFormElemento'));

            me.optionsData.addFilter(optionsFilter);

            validator = me.allElements.getById(element.get('idFormElemento'));

            if (element.get('elemento') == forms.utils.common.CONTROL_CODES.TEXT || element.get('elemento') == forms.utils.common.CONTROL_CODES.DATE) {
                option = me.optionsData.getAt(0);

                // Respuestas para el elemento
                validator.set('numRespuestas', (option.get('descripcion') == null || option.get('descripcion') == '') ? 0 : 1 );

            } else
                // Respuestas para el elemento
                validator.set('numRespuestas', me.optionsData.count());
        });

        me.optionsData.clearFilter();
    }

   
    
    , selectError: function (error) {
        alert(error.message);
    }

    , downloadForm: function () {

        var me = this;

        Ext.Msg.confirm("Confirmación", "¿Desea descargar el formulario para trabajar offline?"
            , function (response, eOpts, msg) {
                if (response == 'yes') {

                    me.deleteLocalForm(me.download);
                }
            });

        

    }

    , download: function (me) {

        var me = (me || this)
            , modelRequest = Ext.create('forms.model.form', { NAME: 'sps_forms_download', idForm: me.formModel.get('idForm') })
            , elementsStore = Ext.create('forms.store.localStore', { model: Ext.create('forms.model.element') })
            , optionsStore = Ext.create('forms.store.localStore', { model: Ext.create('forms.model.option') })
            , loadMask = new Ext.LoadMask({ message: 'Obteniendo encuesta...' });
        ;

        me.getView().add(loadMask);

        loadMask.show();


        forms.utils.common.request(
            modelRequest.getData()
            , function (response, opts) {
                var data = JSON.parse(response.responseText);

                var form = Ext.create('forms.model.form', data[0]);

                // Preguntas
                elementsStore.loadData(data[1]);

                // Posibles respuestas
                optionsStore.loadData(data[2]);

                // Respuestas
                me.optionsData.loadData(data[3], true);

                // GUardar los datos en la DB Local


                var sql = ''
                , unionElements = ''
                , unionOptions = ''
                , unionData = ''
                , idForm = modelRequest.get('idForm').trim()
                , arrDataValues = []
                , elementsArguments = []
                , optionsArguments = []
                , dataArguments = []
                , queryElements = 'INSERT INTO formsElementos (idFormElemento, idForm, elemento, descripcion, orden, min, requerido) VALUES'
                , queryOptions = 'INSERT INTO fElementosOpciones (idElementoOpcion, idFormElemento, descripcion, orden) VALUES'
                , queryData = 'INSERT INTO elementsData (idElementoOpcion, idFormElemento, descripcion, fecha) VALUES';


                elementsStore.each(function (element, index) {
                    //unionElements = unionElements + (index > 0 ? ' UNION ALL ' : '') + "SELECT " + element.get('idFormElemento').trim() + ' AS idFormElemento, ' + modelRequest.get('idForm').trim() + ' AS idForm, ' + element.get('elemento') + ' AS elemento, ' + element.get('orden') + ' AS orden, ' + element.get('min') + ' AS min, ' + element.get('requerido') + ' AS requerido'
                    elementsArguments.push('(?, ?, ?, ?, ?, ?, ?)');
                    arrDataValues.push(element.get('idFormElemento').trim());
                    arrDataValues.push(modelRequest.get('idForm').trim());
                    arrDataValues.push(element.get('elemento'));
                    arrDataValues.push(element.get('descripcion'));
                    arrDataValues.push(element.get('orden'));
                    arrDataValues.push(element.get('min'));
                    arrDataValues.push(element.get('requerido'));
                });

                queryElements += elementsArguments.join(', ');


                forms.globals.DBManagger.connection.transaction(
                    function (tx) {
                        tx.executeSql(queryElements, arrDataValues
                             , function (tx, result) {

                                 // vaciar el array de valores
                                 arrDataValues = [];

                                 optionsStore.each(function (option, index) {
                                     //unionOptions = unionOptions + (index > 0 ? ' UNION ALL ' : '') + "SELECT " + option.get('idElementoOpcion').trim() + ' AS idElementoOpcion, ' + option.get('idFormElemento').trim() + ' AS idFormElemento, ' + option.get('descripcion') + ' AS descripcion, ' + option.get('orden') + ' AS orden'
                                     optionsArguments.push('(?, ?, ?, ?)');
                                     arrDataValues.push(option.get('idElementoOpcion').trim());
                                     arrDataValues.push(option.get('idFormElemento').trim());
                                     arrDataValues.push(option.get('descripcion'));
                                     arrDataValues.push(option.get('orden'));
                                 });

                                 queryOptions += optionsArguments.join(',');


                                 tx.executeSql(queryOptions, arrDataValues
                                     , function (tx, result) {

                                         // vaciar el array de valores
                                         arrDataValues = [];

                                         me.optionsData.each(function (option, index) {
                                             //unionData = unionData + (index > 0 ? ' UNION ALL ' : '') + "SELECT " + option.get('idFormElemento').trim() + ' AS idFormElemento, ' + option.get('idElementoOpcion').trim() + ' AS idElementoOpcion, ' + option.get('descripcion') + ' AS descripcion, ' + (option.get('fecha') == null ? null : (forms.utils.common.dateToUnixTime(option.get('fecha')))) + ' AS fecha'
                                             dataArguments.push('(?, ?, ?, ?)');
                                             arrDataValues.push(option.get('idElementoOpcion').trim());
                                             arrDataValues.push(option.get('idFormElemento').trim());
                                             arrDataValues.push(option.get('descripcion'));
                                             arrDataValues.push((option.get('fecha') == null ? null : (forms.utils.common.dateToUnixTime(option.get('fecha')))));
                                         });

                                         queryData += dataArguments.join(',');

                                         tx.executeSql(queryData, arrDataValues
                                             , function (tx, result) {

                                                 Ext.Msg.alert('Dscarga de formulario.', 'La descarga se realizó con exito.', Ext.emptyFn);

                                                 me.getView().destroy();
                                             }

                                             , function (tx, error) {
                                                 alert(error.message);
                                             });


                                     }

                                     , function (tx, error) {
                                         alert(error.message);
                                     });
                             }

                            , function (tx, error) {
                                alert(error.message);
                            });


                    }

                , function (error) {
                    alert(error.message);
                });


            }
            , function (response, opts) {
                alert("Error no controlado");
            });

        loadMask.hide();
    }

    , deleteLocalForm: function (downloadFunction) {
        var sql = 'DELETE FROM forms WHERE idForm = ?; '
            , idForm = this.formModel.get('idForm').trim()
            , me = this;


        forms.globals.DBManagger.connection.transaction(
                  function (tx) {
                      tx.executeSql(sql, [idForm]
                           , function (tx, result) {

                               // Eliminar las posibles opciones
                               sql = 'DELETE FROM felementosOpciones WHERE idFormElemento IN (SELECT idFormElemento FROM formsElementos WHERE idForm = ?)';

                               tx.executeSql(sql, [idForm]
                                   , function (tx, result) {

                                       // Eliminar las respuestas
                                       sql = 'DELETE FROM elementsData WHERE idFormElemento IN (SELECT idFormElemento FROM formsElementos WHERE idForm = ?)';
                                     
                                       tx.executeSql(sql, [idForm]
                                           , function (tx, result) {

                                               sql = 'DELETE FROM formsElementos WHERE idForm = ?';

                                               tx.executeSql(sql, [idForm]
                                                   , function (tx, result) {

                                                       downloadFunction.call(me);

                                                   }

                                                   , function (tx, error) {
                                                       alert(error.message);
                                                   });


                                           }

                                           , function (tx, error) {
                                               alert(error.message);
                                           });


                                   }

                                   , function (tx, error) {
                                       alert(error.message);
                                   });
                           }

                          , function (tx, error) {
                              alert(error.message);
                          });


                  }

              , function (error) {
                  alert(error.message);
              });
    }

    // Metodos para guardado

    , remoteSave: function () {
       
        var me = this
        , loadMask = new Ext.LoadMask({ message: 'Guardado remoto...' });

        me.getView().add(loadMask);

        var data = me.colectData();

        if (data.length > 0) {
            //var request = JSON.stringify(forms.utils.common.robinStringify(data));
            var cm = forms.utils.common.coockiesManagement();
            var modelRequest = Ext.create('forms.model.model', { NAME: 'sps_forms_guardar', idSession: cm.get('idSession'), idForm: me.formModel.get('idForm'), datos: me.colectData() })

            forms.utils.common.request(
                modelRequest.getData()
                , function (response, opts) {

                    var data = JSON.parse((response.responseText == '' ? "{}" : response.responseText));

                    if ( data.type )
                        Ext.Msg.alert('Error al realizar la solicitud', data.mensajeSistema, Ext.emptyFn);
                    else
                        me.getView().destroy();

                }
                , function (response, opts) {
                    alert("Error no controlado");
                });

        }

        loadMask.hide();

    }

    , colectData: function () {

        var me = this
            , loadMask = new Ext.LoadMask({ message: 'Recolectando datos...' })
            , data = []
            , element = null;

        me.getView().add(loadMask);

        loadMask.show();


        this.updateData();

        var optionsFilter = new Ext.util.Filter({
            id: 'unchangeFilter'
            , filterFn: function (model) {
                return model.get('action') !== '';
            }
        });

        // Solo enviar los items que son nuevos o los que se van a eliminar
        this.optionsData.addFilter(optionsFilter);

        this.optionsData.each(function (option, index) {
            element = me.elements.getById(option.get('idFormElemento'));

            data.push([
                option.get('idElementoOpcion')
                , option.get('idFormElemento')
                , ((element.get('elemento') == forms.utils.common.CONTROL_CODES.DATE) ? null : option.get('descripcion'))
                , ((element.get('elemento') == forms.utils.common.CONTROL_CODES.DATE) ? Ext.Date.parse(option.get('descripcion'), 'd/m/Y') : null)
                , option.get('action')
            ]);
        });

        this.optionsData.clearFilter();


        loadMask.hide();

        return data;

    }

    , localSave: function () {

        var me = this
            , data = me.colectData()
            , sql = ''
            , loadMask = new Ext.LoadMask({ message: 'Guardado local...' });

        me.getView().add(loadMask);

        loadMask.show();

        // vaciar el array de valores
        var updateValues = []
            , insertValues = []
            , deleteValues = []
            , updateArguments = []
            , insertArguments = []
            , deleteArguments = [];

        Ext.Array.each(data, function (row, index) {
            switch ( row[4] ) {
            
                case 'U':
                    updateArguments.push('SELECT ? AS idElementoOpcion, ? AS idFormElemento, ? AS descripcion, ? AS fecha ');

                    updateValues.push(row[0].trim());
                    updateValues.push(row[1].trim());
                    updateValues.push(row[2]);
                    updateValues.push(row[3]);

                    break;

                case 'N':
                    insertArguments.push('(?, ?, ?, ?)');

                    insertValues.push(row[0].trim());
                    insertValues.push(row[1].trim());
                    insertValues.push(row[2]);
                    insertValues.push(row[3]);

                    break;

                case 'D':
                    deleteArguments.push('SELECT ? AS idElementoOpcion, ? AS idFormElemento');

                    deleteValues.push(row[0].trim());
                    deleteValues.push(row[1].trim());

                    break;
            }
        });

        // Verificar si hay registros para actualizar
        if (updateArguments.length > 0) {
            sql = updateArguments.join(' UNION ALL ');

            sql = 'WITH myCTE AS ( ' + sql + ') ' +
                                    'UPDATE elementsData SET descripcion = (SELECT descripcion FROM myCTE WHERE idElementoOpcion = elementsData.idElementoOpcion AND idFormElemento = elementsData.idFormElemento) ' +
                                    ', fecha = (SELECT fecha FROM myCTE WHERE idElementoOpcion = elementsData.idElementoOpcion AND idFormElemento = elementsData.idFormElemento )'
        } else {
            // Si no hay, se crea una consulta para obligar a execute de el primer bloque
            sql = 'SELECT ? AS exec;'
            updateValues.push(0);
        }


        forms.globals.DBManagger.connection.transaction(
                    function (tx) {
                        tx.executeSql(sql, updateValues
                             , function (tx, result) {

                                 if (insertArguments.length > 0) {
                                     sql = 'INSERT INTO elementsData (idElementoOpcion, idFormElemento, descripcion, fecha) VALUES' + insertArguments.join(',');
                                 } else {
                                     // Si no hay, se crea una consulta para obligar a execute de el primer bloque
                                     sql = 'SELECT ? AS exec;'
                                     insertValues.push(0);
                                 }



                                 tx.executeSql(sql, insertValues
                                     , function (tx, result) {

                                         if (deleteArguments.length > 0) {
                                             sql = 'WITH myCTE AS ( ' + deleteArguments.join(' UNION ALL ') + ') '+
                                             'DELETE FROM elementsData WHERE idElementoOpcion = ( SELECT idElementoOpcion FROM myCTE WHERE idElementoOpcion = elementsData.idElementoOpcion AND idFormElemento = elementsData.idFormElemento)   AND   idFormElemento = ( SELECT idFormElemento FROM myCTE WHERE idElementoOpcion = elementsData.idElementoOpcion AND idFormElemento = elementsData.idFormElemento)';
                                         } else {
                                             // Si no hay, se crea una consulta para obligar a execute de el primer bloque
                                             sql = 'SELECT ? AS exec;'
                                             deleteValues.push(0);
                                         }


                                         tx.executeSql(sql, deleteValues
                                             , function (tx, result) {

                                                 Ext.Msg.alert('Encuestas', 'La encuesta se guardó correctamente', Ext.emptyFn);

                                                 //me.getView().destroy();

                                             }

                                            , function (tx, error) {
                                                alert(error.message);
                                            });

                                     }

                                    , function (tx, error) {
                                        alert(error.message);
                                    });
                               

                             }

                            , function (tx, error) {
                                alert(error.message);
                            });

                    }

                , function (tx, error) {
                    alert(error.message);
                });

        loadMask.hide();
    }

    , save: function () {
        var me = this;

        Ext.Msg.confirm("Confirmación", "¿Desea guardar los cambios realizados?"
            , function (response, eOpts, msg) {
                if (response == 'yes') {

                    if (me.isDownload(me.formModel))
                        me.localSave();
                    else
                        me.remoteSave();
                }
            });
    }


    , finish: function () {
        var me = this
            text = ''
        ;

        Ext.Msg.confirm("Finalizar encuesta", "Una vez realizada esta acción ya no será posible modificar las respuestas de la encuesta. ¿Esta seguro de finalizar la encuesta?"
                    , function (response, eOpts, msg) {
                        if ( response == 'yes' ) {

                            var invalidElements = me.validateResponse();

                            if (invalidElements.length > 0) {
                                text = '<table style="border-collapse:collapse; border:1px solid #000;"> <tr style="border:1px solid #000;"> <td>N° </td> <td style="border:1px solid #000;">Requerida </td> <td>Min. Resp. </td> <td style="border:1px solid #000;">Num. Resp. </td> <tr>'

                                Ext.Array.each(invalidElements, function (item, index) {
                                    text = text + '<tr style="border:1px solid #000;"> <td>' + item.orden + '</td> <td style="border:1px solid #000;">' + item.requerido + '</td> <td>' + item.min + '</td> <td style="border:1px solid #000;">' + item.numRespuestas + '</td>' + '</tr>';
                                });

                                text = text + '</table>'

                                Ext.Msg.alert('Validacion de la encuesta', text, Ext.emptyFn);


                            } else
                                me.save();
                        }
                    });
    }

    , exit: function () {
        this.getView().destroy();
    }


    , close: function () {
        var me = this;
        
        Ext.Msg.confirm("Cerrar encuesta", "La información que no se haya guardado se perderá. ¿Desea continuar?"
                 , function (response, eOpts, msg) {
                     if (response == 'yes') {
                         me.exit();
                     }
                 });

    }

});