﻿Ext.define('forms.view.form.formController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.form'

    , formModel: null
    , formUserModel: null
    , page: 1
    , start: 0
    , limit: 2
    , totalRecords: 0
    , elements: Ext.create('forms.store.localStore', { model: Ext.create('forms.model.element') }) // Mantiene en cache los elementos del form
    , options: Ext.create('forms.store.localStore', { model: Ext.create('forms.model.option') })  // Mantiene en cache las opciones del elemento
    , DBOptions: Ext.create('forms.store.localStore', { model: Ext.create('forms.model.option') })  // Mantiene en cache las respuestas de los elementos
    , localOptions: Ext.create('forms.store.localStore', { model: Ext.create('forms.model.option') })  // Mantiene en cache las respuestas de los elementos
    , allElements: Ext.create('forms.store.localStore', { model: Ext.create('forms.model.requiredElement') })

    /**
    * Realiza la acción mover del formulario
    */
    , move: function () {
        var loadMask = new Ext.LoadMask({ message: 'Obteniendo elementos del formulario...' });

        this.getView().setMasked(loadMask);

        var hasRecords = null;

        this.start = (this.page == 1) ? 0 : (this.limit * (this.page - 1));

        // Quitar todo el contenido del form
        this.getView().removeAll();

        // Detectar si ya hay elementos cacheados de la nueva pagina
        hasRecords = this.elements.findRecord('page', this.page, 0, false, true, true);


        // Obtener los nuevos elementos y renderizarlos
        if (hasRecords == null)
            this.getDetailsById(this.formModel);
        else
            this.getCacheData(this.page);

        this.getView().setMasked(false);
    }

    /**
    * Realiza la acción: moverse hacia la siguiente página del form
    */
    , next: function (next) {
        var me = this;

        me.updateData();

        // Incrementar el indicador de pagina
        me.page++;

        // Moverse
        me.move();

        // Actualizar la apariencia de los controles
        if (me.page > 1)
            next.getParent().getItems().getByKey('prev').show();

        var MAX_PAGES = Math.ceil(me.totalRecords / me.limit);

        if (me.page == MAX_PAGES)
            next.hide();
    }

  
    /**
    * Realiza la acción: moverse hacia la página anterior del form
    */
    , previous: function (prev) {
        var me = this;

        me.updateData();

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
        //this.formModel = formModel;
        //this.totalRecords = this.formModel.get('numElementos');

        if (this.formModel !== null )
            this.getFormStructure()
        else
            this.getLocalData();
    }

        
    , getLocalData: function () {
        var me = this
            , idForm = this.formUserModel.get('idForm').trim()
            , idFormUsuario = this.formUserModel.get('idFormUsuario').trim()
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
                                    '			SELECT idFormElemento AS id ' +
                                    '				, elemento ' +
                                    
                                    '				, descripcion ' +
                                    '				, orden ' +
                                    '				, requerido ' +
                                    '				, minimo ' +
                                    '			FROM	formsElementos  ' +
                                    '	WHERE idForm = ? AND orden > ? AND orden <= ? ' +
                                    ') ' +
                                    '	SELECT id, elemento, 0 AS pid, 0 AS gpid, descripcion, orden, requerido, minimo, 0 AS nivel FROM myCTE' +
                                    '	UNION ALL ' +
                                    '	SELECT idFelementoOpcion As id, 0 AS elemento, idformElemento AS pid, 0 AS gpid, felementosOpciones.descripcion, felementosOpciones.orden, "N" AS requerido, 0 as minimo, 1 AS nivel FROM felementosOpciones' +
                                    '	INNER JOIN myCTE ON felementosOpciones.idformElemento = myCTE.id ' +
                                    '   UNION ALL ' +
                                    '   SELECT idElementData AS id, fecha AS elemento, elementsData.idFelementoOpcion AS pid, idformElemento AS gpid, elementsData.descripcion, 0 AS orden, "N" AS requerido, 0 AS minimo, 2 AS nivel ' +
                                    '   FROM MyCTE ' +
                                    '       INNER JOIN felementosOpciones ON myCTE.id = felementosOpciones.idformElemento ' +
                                    '       INNER JOIN elementsData ON felementosOpciones.idFelementoOpcion = elementsData.idFelementoOpcion ' +
                                    ' WHERE idFormUsuario = ?'

                        tx.executeSql(sql, [idForm, me.start, me.start + me.limit, idFormUsuario]
                            , function (tx, records) {
                                var model = null;
                                var DBModel = null;
                                var localModel = null;

                                Ext.Array.each(records.rows, function (record, index) {
                                    switch (record.nivel) {

                                        case 0:
                                            model = Ext.create('forms.model.element', { idFormElemento: record.id, descripcion: record.descripcion, elemento: record.elemento, requerido: record.requerido, minimo: record.minimo, orden: record.orden, page: me.page });
                                            elementsStore.add(model);
                                            break;

                                        case 1:
                                            model = Ext.create('forms.model.option', { idFelementoOpcion: record.id, descripcion: record.descripcion, idFormElemento: record.pid, orden: record.orden, action: '', fecha:null });
                                            optionsStore.add(model);
                                            break;

                                        case 2:
                                            DBOption = Ext.create('forms.model.option', {idElementData: record.id, idFelementoOpcion: record.pid, descripcion: record.descripcion, idFormElemento: record.gpid, fecha: forms.utils.common.unixTimeToDate(record.elemento), action: '' });
                                            localOption = Ext.create('forms.model.option', { idElementData: record.id, idFelementoOpcion: record.pid, descripcion: record.descripcion, idFormElemento: record.gpid, fecha: forms.utils.common.unixTimeToDate(record.elemento), action: '' });
                                            me.DBOptions.add(DBOption);
                                            me.localOptions.add(localOption);
                                            break;
                                    }

                                });

                                // Cachear los nuevos elementos y sus opciones correspondientes
                                me.elements.loadData(elementsStore.getRange(0, elementsStore.count()), true);
                                me.options.loadData(optionsStore.getRange(0, optionsStore.count()), true);

                                //////me.renderControls(elementsStore, optionsStore);

                                // -- Elementos Requeridos, estos solo deben enviarse una vez al cliente
                                sql = "SELECT    trim(formsElementosTable.idFormElemento) AS idFormElemento " +
                                        "		, COUNT(elementsDataTable.idFelementoOpcion)   AS numRespuestas " +
                                        "		, MAX(requerido) AS requerido " +
                                        "		, MAX( " +
                                        "					CASE WHEN LENGTH( IFNULL(elementsDataTable.descripcion, '') + CASE WHEN elementsDataTable.fecha IS NULL THEN " +
                                        "																					'' " +
                                        "																				ELSE " +
                                        "																					CASE WHEN elementsDataTable.fecha = 'undefined' THEN '' ELSE elementsDataTable.fecha END" +
                                        "																				END " +
                                        "									) > 0  THEN " +
                                        "						1 " +
                                        "					ELSE " +
                                        "						0 " +
                                        "					END " +
                                        "				) AS respuestaValida " +
                                        "		, MAX(elementsDataTable.descripcion) AS descripcion " +
                                        "		, MAX(elementsDataTable.fecha) AS fecha " +
                                        "		, MAX(formsElementosTable.minimo) AS minimo " +
                                        "       , MAX(formsElementosTable.orden) AS orden  " +
                                        "       , MAX(formsElementosTable.elemento) AS elemento " +
                                        "FROM formsElementos AS formsElementosTable " +
                                        "   INNER JOIN felementosOpciones ON formsElementosTable.idformElemento = felementosOpciones.idformElemento" +
                                        "	LEFT JOIN elementsData AS elementsDataTable ON felementosOpciones.idfelementoOpcion = elementsDataTable.idFelementoOpcion AND elementsDataTable.idFormUsuario = ? " +
                                        "WHERE " +
                                        "	formsElementosTable.idForm = ? " +
                                        "GROUP BY formsElementosTable.idFormElemento "
                                        "ORDER BY orden;";

                                // Elementos preparados para usarse como validaciones
                                if (me.start == 0) {

                                    tx.executeSql(sql, [idFormUsuario, idForm]
                                        , function (tx, records) {
                                            var model = null;

                                            me.allElements.loadData(records.rows);

                                            me.renderControls(elementsStore, optionsStore);
                                        }

                                        , me.selectError);

                                } else
                                    me.renderControls(elementsStore, optionsStore);


                            }

                            , me.selectError);




                    }

                    , me.selectError)
            }
            , function (err) {
                alert(err.message);
            });



    }



    , getFormStructure: function () {
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
                                    '			SELECT idFormElemento AS id ' +
                                    '				, elemento ' +
                                    
                                    '				, descripcion ' +
                                    '				, orden ' +
                                    '				, requerido ' +
                                    '				, minimo ' +
                                    '			FROM	formsElementos  ' +
                                    '	WHERE idForm = ? AND orden > ? AND orden <= ? ' +
                                    ') ' +
                                    '	SELECT id, elemento, 0 AS pid, 0 AS gpid, descripcion, orden, requerido, minimo, 0 AS nivel FROM myCTE' +
                                    '	UNION ALL ' +
                                    '	SELECT idFelementoOpcion As id, 0 AS elemento, idformElemento AS pid, 0 AS gpid, felementosOpciones.descripcion, felementosOpciones.orden, "N" AS requerido, 0 as minimo, 1 AS nivel FROM felementosOpciones' +
                                    '	INNER JOIN myCTE ON felementosOpciones.idformElemento = myCTE.id ' 
                                    

                        tx.executeSql(sql, [idForm, me.start, me.start + me.limit]
                            , function (tx, records) {
                                var model = null;
                                var DBModel = null;
                                var localModel = null;

                                Ext.Array.each(records.rows, function (record, index) {
                                    switch (record.nivel) {

                                        case 0:
                                            model = Ext.create('forms.model.element', { idFormElemento: record.id, descripcion: record.descripcion, elemento: record.elemento, requerido: record.requerido, minimo: record.minimo, orden: record.orden, page: me.page });
                                            elementsStore.add(model);
                                            break;

                                        case 1:
                                            model = Ext.create('forms.model.option', { idFelementoOpcion: record.id, descripcion: record.descripcion, idFormElemento: record.pid, orden: record.orden, action: '', fecha:null });
                                            optionsStore.add(model);
                                            break;

                                       
                                    }

                                });

                                // Cachear los nuevos elementos y sus opciones correspondientes
                                me.elements.loadData(elementsStore.getRange(0, elementsStore.count()), true);
                                me.options.loadData(optionsStore.getRange(0, optionsStore.count()), true);

                                

                                // -- Elementos Requeridos, estos solo deben enviarse una vez al cliente
                                sql = "SELECT    trim(formsElementosTable.idFormElemento) AS idFormElemento " +
                                        "		, COUNT(elementsDataTable.idFelementoOpcion)   AS numRespuestas " +
                                        "		, MAX(requerido) AS requerido " +
                                        "		, MAX( " +
                                        "					CASE WHEN LENGTH( IFNULL(elementsDataTable.descripcion, '') + CASE WHEN elementsDataTable.fecha IS NULL THEN " +
                                        "																					'' " +
                                        "																				ELSE " +
                                        "																					CASE WHEN elementsDataTable.fecha = 'undefined' THEN '' ELSE elementsDataTable.fecha END" +
                                        "																				END " +
                                        "									) > 0  THEN " +
                                        "						1 " +
                                        "					ELSE " +
                                        "						0 " +
                                        "					END " +
                                        "				) AS respuestaValida " +
                                        "		, MAX(elementsDataTable.descripcion) AS descripcion " +
                                        "		, MAX(elementsDataTable.fecha) AS fecha " +
                                        "		, MAX(formsElementosTable.minimo) AS minimo " +
                                        "       , MAX(formsElementosTable.orden) AS orden  " +
                                        "       , MAX(formsElementosTable.elemento) AS elemento " +
                                        "FROM formsElementos AS formsElementosTable " +
                                        "   INNER JOIN felementosOpciones ON formsElementosTable.idformElemento = felementosOpciones.idformElemento" +
                                        "	LEFT JOIN elementsData AS elementsDataTable ON felementosOpciones.idfelementoOpcion = elementsDataTable.idFelementoOpcion AND elementsDataTable.idFormUsuario = ? " +
                                        "WHERE " +
                                        "	formsElementosTable.idForm = ? " +
                                        "GROUP BY formsElementosTable.idFormElemento "
                                "ORDER BY orden;";

                                // Elementos preparados para usarse como validaciones
                                if (me.start == 0) {

                                    tx.executeSql(sql, ['-1', idForm]
                                        , function (tx, records) {
                                            var model = null;

                                            me.allElements.loadData(records.rows);

                                            me.renderControls(elementsStore, optionsStore);
                                        }

                                        , me.selectError);

                                } else
                                    me.renderControls(elementsStore, optionsStore);



                            }

                            , me.selectError);

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
    , getCacheData: function () {
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

            optionsStore.loadData(me.options.getRange(0, me.options.count()), true);

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
    , renderControls: function (elementsStore, optionsStore, disabled) {
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
            , elemento = null
            , options = []
            , disabled = (me.formUserModel !== null ? me.formUserModel.get('estatus') == 'F' : false)
        ;

        // Recorrer los elementos del formulario
        elementsStore.each(function (element, index) {
            elemento = element.get('elemento');
            // Generar un label para cada elemento y mostrar en el la descripcion de la pregunta
            type = forms.utils.common.getControlByCode(element.get('elemento'));

            formPanel.add({ xtype: 'label', name: 'label' + element.get('idFormElemento'), html: element.get('orden') + '.-' + element.get('descripcion') + (element.get('requerido') == 'S' ? '<span style="background:#FF8000;color:#FFF;font-size:8pt;border:1px solid #FFF;margin:3px;padding:1px;">REQ<span>' : '') });

            // Filtro para obtener unicamente las opciones que pertenecen al elemento
            var optionsFilter = new Ext.util.Filter({
                id: 'elementsFilter'
                , property: 'idFormElemento'
                , value: element.get('idFormElemento')
            });

            // Aplicar el filtro
            optionsStore.addFilter(optionsFilter);


            if (elemento == forms.utils.common.CONTROL_CODES.SELECT) {
                options = new Array();

                elementControl = Ext.create({
                    xtype: type
                    , valueField: 'value'
                    , displayField: 'text'
                    , name: defaultName
                    , reference: type + element.get('idFormElemento')
                    , disabled: disabled
                });

                options.push({ text: 'Seleccione una opción', value: 'NULL' });
            }

            // Generar una a una las opciones del elemento
            optionsStore.each(function (option, index) {
                defaultName = type + option.get('idFelementoOpcion');
                

                // Si la opcion se debe mostrar como un control de radio, entonces necesita un tratamiento especial, ya que todos los controles generados deben tener el mismo NAME
                if (elemento == forms.utils.common.CONTROL_CODES.RADIO) {
                    elementControl = Ext.create({
                        xtype: type
                        , name: type + element.get('idFormElemento')
                        , inputValue: option.get('idFelementoOpcion')
                        , labelWidth: tm.getWidth(option.get('descripcion')) * WIDTH_FACTOR + MARGIN
                        , reference: defaultName
                        , disabled: disabled
                    });
                } else if (elemento == forms.utils.common.CONTROL_CODES.DATE || elemento == forms.utils.common.CONTROL_CODES.TIME) {
                    elementControl = Ext.create({
                        xtype: type
                        , name: defaultName
                        , dateFormat: 'd/m/Y'
                        , labelWidth: tm.getWidth(option.get('descripcion')) * WIDTH_FACTOR + MARGIN
                        , reference: defaultName
                        , disabled: disabled
                    });
                } else if (elemento == forms.utils.common.CONTROL_CODES.SELECT) {
                    options.push({ text: option.get('descripcion'), value: option.get('idFelementoOpcion') });
                } else
                    elementControl = Ext.create({
                        xtype: type
                        , name: defaultName
                        , labelWidth: tm.getWidth(option.get('descripcion')) * WIDTH_FACTOR + MARGIN
                        , reference: defaultName
                        , disabled: disabled
                    });

                elementControl.setLabel(option.get('descripcion'));


                // Agregar el control al form
                formPanel.add(elementControl);
            });

            // Quitar el filtro al store de opciones
            optionsStore.clearFilter();

            if (elemento == forms.utils.common.CONTROL_CODES.SELECT) {
                elementControl.setOptions(options);
            }

            // Aplicar el filtro de opciones a los respuestas de las opciones

            me.localOptions.addFilter(optionsFilter);

            if (type == 'selectfield' && me.localOptions.count() == 0)
                elementControl.setValue('NULL');

            // Asignar los valores de respuesta a las opciones del elemento
            me.localOptions.each(function (option, index) {

                //if (option.get('action') !== DELETE) {
                    defaultName = type + option.get('idFelementoOpcion');

                    currControl = me.lookupReference(defaultName)

                    if (type == 'radiofield' || type == 'checkboxfield')
                        currControl.setChecked(true);
                    else if (type == 'selectfield')
                        elementControl.setValue(option.get('idFelementoOpcion'));
                    else if (type == 'datepickerfield')
                        currControl.setValue(option.get('fecha'));
                    else
                        currControl.setValue(option.get('descripcion'));
                //}
            });

            // Remover el filtro
            me.localOptions.clearFilter();
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
        this.DBOptions.removeAll();
        this.localOptions.removeAll();
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
            , DBOption = null
            , option = null
        ;

        // Cargar únicamente los elementos renderizados en el form
        elementsStore.loadData(me.elements.getRange(me.start, (me.start + me.limit) - 1));

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


            if (element.get('elemento') == forms.utils.common.CONTROL_CODES.CHECK || element.get('elemento') == forms.utils.common.CONTROL_CODES.RADIO ) {
                //// Si se trata de un checkbox, se remueven todas las opciones
                me.options.each(function (option, index) {

                    optionData = me.localOptions.getById(option.get('idFelementoOpcion'));

                    if (optionData)
                        me.localOptions.remove(optionData);

                });


                //  y se agregan las respuestas nuevas
                me.options.each(function (option, index) {
                    currControl = me.lookupReference(type + option.get('idFelementoOpcion'));

                    if (currControl.isChecked()) {
                        me.localOptions.add(Ext.create('forms.model.option', { idFelementoOpcion: option.get('idFelementoOpcion'), idFormElemento: option.get('idFormElemento'), orden: option.get('orden') }));
                    }
                });
            } else if (element.get('elemento') == forms.utils.common.CONTROL_CODES.SELECT) {
                //// Si se trata de un checkbox, se remueven todas las opciones
                me.options.each(function (option, index) {
                    optionData = me.localOptions.getById(option.get('idFelementoOpcion'));

                    if (optionData)
                        me.localOptions.remove(optionData);

                });

                currControl = me.lookupReference(type + element.get('idFormElemento'));
                option = me.options.getById(currControl.getValue())

                if ( option  )
                    me.localOptions.add( Ext.create('forms.model.option', { idFelementoOpcion: option.get('idFelementoOpcion'), idFormElemento: option.get('idFormElemento'), orden: option.get('orden') }));


            } else {
                // Para todos los controles distintos de CHECK u RADIO
                // Remover el unico option que hay el store para este elemento

                currOption = me.localOptions.getById(me.options.getAt(0).get('idFelementoOpcion'));

                if (currOption == null || currOption == undefined) {

                    currOption = me.options.getAt(0);

                    currOption = Ext.create('forms.model.option', { idFelementoOpcion: currOption.get('idFelementoOpcion'), idFormElemento: element.get('idFormElemento'), orden: currOption.get('orden') });

                    me.localOptions.add(currOption);

                    currControl = me.lookupReference(type + currOption.get('idFelementoOpcion'));

                    if (type == 'datepickerfield') {
                        currOption.set('fecha', currControl.getValue());
                    }
                    else {
                        currOption.set('descripcion', currControl.getValue());
                    }
                }


                currControl = me.lookupReference(type + currOption.get('idFelementoOpcion'));

                localOption = me.localOptions.getById(currOption.get('idFelementoOpcion'));
                DBOption = me.DBOptions.getById(currOption.get('idFelementoOpcion'));


                if (DBOption !== null) {
                    if (type == 'datepickerfield') {
                        if (DBOption.get('fecha') !== currControl.getValue() ) 
                            currOption.set('fecha', currControl.getValue());
                    }
                    else {
                        if (DBOption.get('descripcion') !== currControl.getValue() ) 
                            currOption.set('descripcion', currControl.getValue());
                    }
                } else {
                    if (localOption !== null) {
                        if (type == 'datepickerfield') {
                            if (localOption.get('fecha') !== currControl.getValue() )
                                currOption.set('fecha', currControl.getValue());
                        }
                        else {
                            if (localOption.get('descripcion') !== currControl.getValue())
                                currOption.set('descripcion', currControl.getValue());
                        }

                    }

                }
            }

            me.options.clearFilter();

        });


        //return optionsData;

    }


    // Validacion
    // Verifica que las preguntas requeridas estén contestadas
    , validateResponse: function (data, validationElements) {
        var me = this
            , element = null
            , invalidElements = []
        ;


        // Filtro para obtener unicamente las opciones que pertenecen al elemento
        var optionsFilter = new Ext.util.Filter({
            id: 'elementsFilter'
            , property: 'idFormElemento'
            , value: null
        });


        validationElements.each(function (validator, index) {

            optionsFilter.setConfig('value', validator.get('idFormElemento'));

            data.addFilter(optionsFilter);

            if (validator.get('requerido') == 'S' && ( validator.get('numRespuestas') == 0  || validator.get('minimo') > validator.get('numRespuestas') ))
                invalidElements.push({ orden: validator.get('orden'), requerido: validator.get('requerido'), minimo: validator.get('minimo'), numRespuestas: validator.get('numRespuestas') });

        });

        data.clearFilter();

        return invalidElements;
    }

    // Valida que esten contestadas el minimo de preguntas solicitadas a nivel formulario
    , validateMinResponse: function (validationElements) {
        var me = this
            , elementosContestados = 0
            , valido = false;

        validationElements.each(function (element, index) {

            if (element.get('minimo') == null)
                element.set('minimo', 0);

            // Agregar validacion respuestas minimas por elemento
            if (element.get('numRespuestas') >= element.get('minimo')) {

                elementosContestados++;

                if (elementosContestados >= (me.formModel !== null ? me.formModel.get('minimo') : me.formUserModel.get('minimo'))) {
                    valido = true;
                    //return valido;
                }
            }

        });

        return valido;
    }

    // Valida que las preguntas requeridas o no, si están contestadas, tengan el minimo de respuetas indicadas
    , validateMinResponseForElement: function (validationElements) {
        var me = this
            , invalidElements = [];

        validationElements.each(function (validator, index) {

            if (validator.get('elemento') == forms.utils.common.CONTROL_CODES.CHECK) {
                if (validator.get('minimo') == null)
                    validator.set('minimo', 0);

                if  ( ( validator.get('requerido') == 'S' && (validator.get('numRespuestas') < validator.get('minimo')) ) || ( validator.get('requerido') == 'N' && validator.get('numRespuestas') > 0 &&  (validator.get('numRespuestas') < validator.get('minimo')) ) )
                        invalidElements.push({ orden: validator.get('orden'), requerido: validator.get('requerido'), minimo: validator.get('minimo'), numRespuestas: validator.get('numRespuestas') });
            
            }

        });


        return invalidElements;
    }

    , updateNumResponse: function (data) {
        var me = this
            , validator = null
            , option = null
            , validationElements = Ext.create('forms.store.localStore', { model: Ext.create('forms.model.requiredElement') })
        ;

        validationElements.loadData( me.allElements.getRange( 0, me.allElements.count() ) );

        // Filtro para obtener unicamente las opciones que pertenecen al elemento
        var optionsFilter = new Ext.util.Filter({
            id: 'elementsFilter'
            , property: 'idFormElemento'
            , value: null
        });

        data.addFilter(optionsFilter);

        me.elements.each(function (element, index) {

            optionsFilter.setConfig('value', element.get('idFormElemento'));

            data.addFilter(optionsFilter);

            validator = validationElements.getById(element.get('idFormElemento'));

            if (element.get('elemento') == forms.utils.common.CONTROL_CODES.TEXT || element.get('elemento') == forms.utils.common.CONTROL_CODES.DATE) {
                option = data.getAt(0);

                // Respuestas para el elemento
                validator.set('numRespuestas', ((option.get('descripcion') == null || option.get('descripcion') == '') && option.get('fecha') == null) ? 0 : 1);
            } else if (element.get('elemento') == forms.utils.common.CONTROL_CODES.SELECT) {
                // Respuestas para el elemento
                validator.set('numRespuestas', (data.count() == 0) ? 0 : 1);
            } else
                // Respuestas para el elemento
                validator.set('numRespuestas', data.count());
        });

        data.clearFilter();


        return validationElements;
    }



    , selectError: function (tx, error) {
        alert(error.message);
    }

    

    
    , localDataToDBData: function(){
        
        var me = this;
        var processedData = Ext.create('forms.store.localStore', { model: Ext.create('forms.model.option') })  // Mantiene en cache las respuestas de los elementos
        var option = null;
        var element = null;

        me.localOptions.each(function (localOption, index) {
            element = me.elements.getById(localOption.get('idFormElemento'));

            var DBOption = me.DBOptions.getById(localOption.get('idFelementoOpcion'));

            if (DBOption) {
                if (element.get('elemento') == forms.utils.common.CONTROL_CODES.DATE || element.get('elemento') == forms.utils.common.CONTROL_CODES.TEXT) {

                    option = Ext.create('forms.model.option', {
                        idFelementoOpcion: localOption.get('idFelementoOpcion')
                        , idFormElemento: localOption.get('idFormElemento')
                        , orden: localOption.get('orden')
                        , descripcion: localOption.get('descripcion')
                        , fecha: localOption.get('fecha')
                        , idElementData: localOption.get('idElementData')
                        , action: 'U'
                    });

                    processedData.add(option);
                }
            } else {

                option = Ext.create('forms.model.option', {
                    idFelementoOpcion: localOption.get('idFelementoOpcion')
                        , idFormElemento: localOption.get('idFormElemento')
                        , orden: localOption.get('orden')
                        , descripcion: localOption.get('descripcion')
                        , fecha: localOption.get('fecha')
                        , idElementData: null
                        , action: 'N'
                });

                processedData.add(option);
            }
        });


        me.DBOptions.each(function (DBOption, index) {
            var localOption = me.localOptions.getById(DBOption.get('idFelementoOpcion'));

            if (localOption == null || localOption == undefined) {
                option = Ext.create('forms.model.option', {
                    idFelementoOpcion: DBOption.get('idFelementoOpcion')
                        , idFormElemento: DBOption.get('idFormElemento')
                        , orden: DBOption.get('orden')
                        , descripcion: DBOption.get('descripcion')
                        , fecha: DBOption.get('fecha')
                        , idElementData: DBOption.get('idElementData')
                        , action: 'D'
                });

                processedData.add(option);
            }
                
        });


        return processedData;
    }

    // Metodos para guardado

    , colectData: function ( isRemoteSave ) {
        var me = this
            , loadMask = new Ext.LoadMask({ message: 'Recolectando datos...' })
            , data = []
            , element = null
            , optionsData = me.localDataToDBData();

        me.getView().add(loadMask);

        loadMask.show();

        var optionsFilter = new Ext.util.Filter({
            id: 'unchangeFilter'
            , filterFn: function (model) {
                return model.get('action') !== '';
            }
        });


        // Solo enviar los items que son nuevos o los que se van a eliminar
        optionsData.addFilter(optionsFilter);

        optionsData.each(function (option, index) {
            element = me.elements.getById(option.get('idFormElemento'));

            data.push([
                option.get('idFelementoOpcion')
                , option.get('idFormElemento')
                , option.get('descripcion')
                , (forms.utils.common.CONTROL_CODES.DATE == element.get('elemento') ? (isRemoteSave ? forms.utils.common.serialize(option.get('fecha')) : option.get('fecha')) : null)
                , option.get('action')
                
            ]);


            if (!isRemoteSave) 
                data[data.length - 1].push(option.get('idElementData'))
        });

        optionsData.clearFilter();


        loadMask.hide();

        return data;

    }

    , saveNewForm: function () {
        var me = this;

        navigator.geolocation.getCurrentPosition(function (position) {
            
            var cm = forms.utils.common.coockiesManagement();
            var idFormUsuario = forms.utils.common.guid();
            var values = [idFormUsuario, me.formModel.get('idForm'), cm.get('idUsuario'), 'C', forms.utils.common.dateToUnixTime(new Date()), position.coords.latitude, position.coords.longitude];
            
            sql = "INSERT INTO bformsUsuarios( idFormUsuario, idForm, idUsuario, estatus, fecha, latitud, longitud ) VALUES (?, ?, ?, ?, ?, ?, ?)";


            forms.globals.DBManagger.connection.transaction(
                    function (tx) {
                        tx.executeSql(sql, values
                             , function (tx, result) {

                                 me.localSave(idFormUsuario);

                             }

                            , function (tx, error) {
                                alert(error.message);
                            });

                    }

                , function (tx, error) {
                    alert(error.message);
                });



        }
        ,
        function (error) {
            alert(' código: ' + error.code + '\n' + ' mensaje: ' + error.message + '\n');
        });

    }

    , localSave: function (idFormUsuario) {

        var me = this
            , data = me.colectData(false)
            , sql = ''
            , loadMask = new Ext.LoadMask({ message: 'Guardado local...' })
            , idFormUsuario = (idFormUsuario || null);

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
            switch (row[4]) {

                case 'U':
                    updateArguments.push('SELECT ? AS idElementData, ? AS descripcion, ? AS fecha ');

                    updateValues.push(row[5].trim());
                    updateValues.push(row[2]);
                    updateValues.push(forms.utils.common.dateToUnixTime(row[3]));

                    break;

                case 'N':
                    insertArguments.push('(?, ?, ?, ?, ?)');
                    
                    insertValues.push(forms.utils.common.guid());
                    insertValues.push(row[0].trim());
                    insertValues.push(( idFormUsuario == null ? me.formUserModel.get('idFormUsuario') : idFormUsuario )); // Es el Id relacionado con la tabla bformsUsuarios
                    insertValues.push(row[2]);
                    insertValues.push(( row[3] !== null || row[3] !== '' ) ? forms.utils.common.dateToUnixTime(row[3]) : null  ) ;

                    break;

                case 'D':
                    deleteArguments.push('SELECT ? AS idElementData');

                    deleteValues.push(row[5].trim() );

                    break;
            }
        });

        // INICIA EL PROCESO DE GUARDADO
        


        // Verificar si hay registros para actualizar
        if (updateArguments.length > 0) {
            sql = updateArguments.join(' UNION ALL ');

            sql = 'WITH myCTE AS ( ' + sql + ') ' +
                                    'UPDATE elementsData SET  descripcion = (SELECT descripcion FROM myCTE WHERE myCTE.idElementData = elementsData.idElementData )' +
                                    ', fecha = (SELECT fecha FROM myCTE WHERE myCTE.idElementData = elementsData.idElementData )'
                             
        } else {
            // Si no hay, se crea una consulta para obligar a execute a ejecutar el bloque
            sql = 'SELECT ? AS exec;'
            updateValues.push(0);
        }


        forms.globals.DBManagger.connection.transaction(
                    function (tx) {
                        tx.executeSql(sql, updateValues
                             , function (tx, result) {

                                 if (insertArguments.length > 0) {
                                     sql = 'INSERT INTO elementsData (idElementData, idFelementoOpcion, idFormUsuario, descripcion, fecha) VALUES' + insertArguments.join(',');
                                 } else {
                                     // Si no hay, se crea una consulta para obligar a execute a ejecutar el bloque
                                     sql = 'SELECT ? AS exec;'
                                     insertValues.push(0);
                                 }



                                 tx.executeSql(sql, insertValues
                                     , function (tx, result) {

                                         if (deleteArguments.length > 0) {
                                             sql = 'WITH myCTE AS ( ' + deleteArguments.join(' UNION ALL ') + ') ' +
                                              'DELETE FROM elementsData WHERE idElementData = ( SELECT idElementData FROM myCTE WHERE idElementData = elementsData.idElementData) ';
                                         } else {
                                             // Si no hay, se crea una consulta para obligar a execute a ejecutar el bloque
                                             sql = 'SELECT ? AS exec;'
                                             deleteValues.push(0);
                                         }


                                         tx.executeSql(sql, deleteValues
                                             , function (tx, result) {

                                                 me.getView().getParent().down('formsApplied').getController().getList();
                                                 me.getView().destroy();

                                                 Ext.Msg.alert('Formularios', 'El formulario se guardó correctamente', Ext.emptyFn);
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

        // TERMINA EL PROCESO DE GUARDADO

        loadMask.hide();
    }

    , save: function () {
        var me = this;

        Ext.Msg.confirm("Confirmación", "¿Desea guardar los cambios realizados?"
            , function (response, eOpts, msg) {
                if (response == 'yes') {

                    me.updateData();

                    //if (me.isDownload(me.formModel)) 
                    if (me.formModel !== null)
                        me.saveNewForm();
                    else if (me.formUserModel !== null)
                        me.localSave();
                    else
                        alert('No se ha podido iniciar el proceso de guardado.');

                }
            });
    }


    , finalizeFromLocal: function () {
        var me = this
           , idFormUsuario = ( this.formUserModel !== null ? this.formUserModel.get('idFormUsuario').trim() : '-1')
            , savedData = []
            , unsavedData = me.colectData(true)
            , idForm = (me.formUserModel !== null ? me.formUserModel.get('idForm') : me.formModel.get('idForm'));
        ;
        // Obtener los datos locales
        forms.globals.DBManagger.connection.transaction(
            function (tx) {
                var sql = 'SELECT idFelementoOpcion, descripcion, fecha ' +
                                'FROM elementsData ' +
                                'WHERE idFormUsuario = ? ; '

                tx.executeSql(sql, [idFormUsuario],
                    function (tx, result) {
                        Ext.Object.each(result.rows, function (index, option) {

                            savedData.push([
                                option.idFelementoOpcion
                                , option.descripcion
                                , forms.utils.common.serialize(forms.utils.common.unixTimeToDate(option.fecha))
                            ]);
                        });


                        var exist = false;

                        Ext.Array.each(unsavedData, function (unsavedOption, index) {
                            if (unsavedOption[4] !== 'D') {

                                // Actualizar los datos guardados con los nuevos
                                Ext.Array.each(savedData, function (savedOption, index) {
                                    //if (unsavedOption[1] == savedOption[1] && unsavedOption[0] == savedOption[0]) {
                                    if (unsavedOption[0] == savedOption[0]) {
                                        savedOption[1] = unsavedOption[2];
                                        savedOption[2] = unsavedOption[3];
                                    }

                                });


                                exist = false;
                                // Agregar las repuestas nuevas
                                Ext.Array.each(savedData, function (savedOption, index) {
                                    //if (unsavedOption[1] == savedOption[1] && unsavedOption[0] == savedOption[0]) {
                                    if (unsavedOption[0] == savedOption[0]) {
                                        exist = true;
                                        return;
                                    }

                                });

                                if (!exist)
                                    savedData.push([
                                    unsavedOption[0]
                                    , unsavedOption[2]
                                    , unsavedOption[3]
                                    ]);

                            }

                        });





                        // Guardar REMOTAMENTE y finalizar

                        var cm = forms.utils.common.coockiesManagement();
                        

                        if (me.formModel !== null) {
                            

                            navigator.geolocation.getCurrentPosition(function (position) {
                                var modelRequest = Ext.create('forms.model.model', { NAME: 'sps_forms_finalizar', idSession: cm.get('idSession'), idForm: idForm, latitud: position.coords.latitude, longitud: position.coords.longitude, datos: savedData })
                               
                                forms.utils.common.request(
                                    modelRequest.getData()
                                    , function (response, opts) {

                                        var data = JSON.parse((response.responseText == '' ? "{}" : response.responseText));

                                        if (data.type !== 'EXCEPTION') {
                                            // Refrescar el listado de la vista principal


                                            var idFormUsuario = forms.utils.common.guid();
                                            var values = [idFormUsuario, idForm, cm.get('idUsuario'), 'F', forms.utils.common.dateToUnixTime(new Date()), forms.utils.common.dateToUnixTime(new Date()), position.coords.latitude, position.coords.longitude];

                                            sql = "INSERT INTO bformsUsuarios( idFormUsuario, idForm, idUsuario, estatus, fecha, fechaFinalizacion, latitud, longitud ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";


                                            forms.globals.DBManagger.connection.transaction(
                                                    function (tx) {
                                                        tx.executeSql(sql, values
                                                             , function (tx, result) {

                                                                 Ext.Msg.alert('Forms', 'La finalización del formulario se realizó con exito.', Ext.emptyFn);

                                                                 me.getView().getParent().down('formsApplied').getController().getList();

                                                                 // Cerrar la vista de detalle
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

                                        else
                                            Ext.Msg.alert('Error al realizar la solicitud', data.mensajeUsuario, Ext.emptyFn);


                                    }
                                    , function (response, opts) {
                                        alert("Error no esperado");
                                    });



                            }
                            , function (error) {
                                alert(' código: ' + error.code + '\n' + ' mensaje: ' + error.message + '\n');

                                latitud = null;
                                longitud = null;
                            });

                        } else {
                            var modelRequest = Ext.create('forms.model.model', { NAME: 'sps_forms_finalizar', idSession: cm.get('idSession'), idForm: idForm, latitud: me.formUserModel.get('latitud'), longitud: me.formUserModel.get('longitud'), datos: savedData })

                            // Finalización de encuesta previamente guardada
                            forms.utils.common.request(
                                    modelRequest.getData()
                                    , function (response, opts) {

                                        var data = JSON.parse((response.responseText == '' ? "{}" : response.responseText));

                                        if (data.type !== 'EXCEPTION') {
                                            // Refrescar el listado de la vista principal

                                            forms.globals.DBManagger.connection.transaction(
                                                function (tx) {
                                                    var sql = "UPDATE bformsUsuarios SET estatus = ?, fechaFinalizacion = ? WHERE idFormUsuario = ? ;";

                                                    tx.executeSql(sql, ['F', forms.utils.common.dateToUnixTime( new Date() ) , idFormUsuario],
                                                        function (tx, result) {

                                                            Ext.Msg.alert('Forms', 'La finalización del formulario se realizo con exito.', Ext.emptyFn);

                                                            me.getView().getParent().down('formsApplied').getController().getList();

                                                            // Cerrar la vista de detalle
                                                            me.getView().destroy();

                                                        }

                                                        , me.selectError)
                                                }
                                                , function (err) {
                                                    alert(err.message);
                                                });


                                        }

                                        else
                                            Ext.Msg.alert('Error al realizar la solicitud', data.mensajeUsuario, Ext.emptyFn);


                                    }
                                    , function (response, opts) {
                                        alert("Error no esperado");
                                    });



                        }


                    }

                    , me.selectError)
            }
            , function (err) {
                alert(err.message);
            });

    }

     , finalize: function () {
        var me = this
            , text = ''
        ;

        Ext.Msg.confirm("Finalizar formulario", "Una vez realizada esta acción ya no será posible modificar las respuestas del formulario. ¿Esta seguro de finalizar el formulario?"
                    , function (response, eOpts, msg) {
                        if (response == 'yes') {
                            me.updateData();
                            var validationElements = me.updateNumResponse(me.localOptions);

                            if (me.validateMinResponse(validationElements)) {

                                var invalidElements = me.validateResponse(me.localOptions, validationElements);

                                
                                if (invalidElements.length > 0) {
                                    text = '<table style="border-collapse:collapse; border:1px solid #6E6E6E;width:100%"> <tr style="border:1px solid #6E6E6E;"> <td>N° </td> <td style="border:1px solid #6E6E6E;">Es Requerida </td> <td>Resp. requeridas </td> <tr>'

                                    Ext.Array.each(invalidElements, function (item, index) {
                                        text = text + '<tr style="border:1px solid #6E6E6E;"> <td>' + item.orden + '</td> <td style="border:1px solid #6E6E6E;">' + (item.requerido == 'S' ? 'Si' : 'No') + '</td> <td>' + item.minimo + '</td>' + '</tr>';
                                    });

                                    text = text + '</table>'

                                    Ext.Msg.alert('Validación del formulario', 'Las siguientes preguntas son requeridas. <br>' + text, Ext.emptyFn);


                                } else {

                                    invalidElements = me.validateMinResponseForElement(validationElements);

                                    if (invalidElements.length > 0) {
                                        text = '<table style="border-collapse:collapse; border:1px solid #6E6E6E;width:100%"> <tr style="border:1px solid #6E6E6E;"> <td>N° </td> <td style="border:1px solid #6E6E6E;">Requerida </td> <td>Min. Resp. </td> <td style="border:1px solid #6E6E6E;">Num. Resp. </td> <tr>'

                                        Ext.Array.each(invalidElements, function (item, index) {
                                            text = text + '<tr style="border:1px solid #6E6E6E;"> <td>' + item.orden + '</td> <td style="border:1px solid #6E6E6E;">' + (item.requerido == 'S' ? 'Si' : 'No') + '</td> <td>' + item.minimo + '</td> <td style="border:1px solid #6E6E6E;">' + item.numRespuestas + '</td>' + '</tr>';
                                        });

                                        text = text + '</table>'

                                        Ext.Msg.alert('Validación del formulario', 'Es requerido que responda el mínimo de respuestas solicitadas. <br>' + text, Ext.emptyFn);


                                    } else {

                                        //if (me.isDownload(me.formModel))
                                            me.finalizeFromLocal();
                                        //else
                                        //    me.remoteSave(true);
                                    }
                                }
                            } else {
                                Ext.Msg.alert('Validación del formulario', 'Es requerido que responda al menos ' + me.formModel.get('minimo') + ' pregunta' + (me.formModel.get('minimo')  > 1 ?  's' : '') + ' del formulario.' , Ext.emptyFn);

                            }

                        }
                    });
    }

    , exit: function () {
        this.getView().destroy();
    }


    , close: function () {
        var me = this;

        Ext.Msg.confirm("Cerrar formulario", "La información que no se haya guardado se perderá. ¿Desea continuar?"
                 , function (response, eOpts, msg) {
                     if (response == 'yes') {
                         me.exit();
                     }
                 });

    }


    , closeDB: function() {
        forms.globals.DBManagger.connection.close(function () {
            //alert("DB closed!");
        }, function (error) {
            console.log("Error al intentar cerrar la base de datos : " + error.message);
        });
    }


});