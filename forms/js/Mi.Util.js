Mi.Util.months = {
	1: { value: 1, value: 1, name: 'Enero', shortName: 'Ene' },
	2: { value: 2, name: 'Febrero', shortName: 'Feb' },
	3: { value: 3, name: 'Marzo', shortName: 'Mar' },
	4: { value: 4, name: 'Abril', shortName: 'Abr' },
	5: { value: 5, name: 'Mayo', shortName: 'May' },
	6: { value: 6, name: 'Junio', shortName: 'Jun' },
	7: { value: 7, name: 'Julio', shortName: 'Jul' },
	8: { value: 8, name: 'Agosto', shortName: 'Ago' },
	9: { value: 9, name: 'Septiembre', shortName: 'Sep' },
	10: { value: 10, name: 'Octubre', shortName: 'Oct' },
	11: { value: 11, name: 'Noviembre', shortName: 'Nov' },
	12: { value: 12, name: 'Diciembre', shortName: 'Dic' }
}
Mi.Util.weekDays = {
	0: { value: 0, name: 'Domingo', shortName: 'Dom' },
	1: { value: 1, name: 'Lunes', shortName: 'Lun' },
	2: { value: 2, name: 'Martes', shortName: 'Mar' },
	3: { value: 3, name: 'Miércoles', shortName: 'Mie' },
	4: { value: 4, name: 'Jueves', shortName: 'Jue' },
	5: { value: 5, name: 'Viernes', shortName: 'Vie' },
	6: { value: 6, name: 'Sábado', shortName: 'Sab' }
}
Mi.Util.arrayToObject = function (a) {
	var o = {}
	if ($.isArray(a))
		for (var i = 0; i < a.length; i++)
			if (!$.isArray(a[i]) && !$.isPlainObject(a[i])) o[a[i]] = a[i];
			else for (var j in a[i]) o[a[i][j]] = a[i][j];
	return o;
}