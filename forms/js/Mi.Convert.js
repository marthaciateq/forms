Mi.Convert.dateToString = function (fecha, format) {
	if ($.type(fecha) != 'date' || $.type(format) != 'string') return '';
	var d = parseInt(fecha.getDate());
	var m = parseInt(fecha.getMonth()) + 1;
	var a = parseInt(fecha.getFullYear());
	var h = parseInt(fecha.getHours());
	var i = parseInt(fecha.getMinutes());
	var s = parseInt(fecha.getSeconds());
	var l = parseInt(fecha.getMilliseconds());
	var dd = d < 10 ? '0' + d : d;
	var mm = m < 10 ? '0' + m : m;
	var aa = a > 1000 ? a.toString().substring(a.toString().length - 2) : a;
	var hh = h < 10 ? '0' + h : h;
	var ii = i < 10 ? '0' + i : i;
	var ss = s < 10 ? '0' + s : s;
	var lll = l < 10 ? '00' + l : l < 100 ? '0' + l : l;
	var ddd = Mi.Util.weekDays[fecha.getDay()].shortName;
	var dddd = Mi.Util.weekDays[fecha.getDay()].name;
	var mmm = Mi.Util.months[fecha.getMonth() + 1].shortName;
	var mmmm = Mi.Util.months[fecha.getMonth() + 1].name;
	var fechaS = format;
	fechaS = fechaS.replace(/\x25aa/g, aa);
	fechaS = fechaS.replace(/\x25a/g, a);
	fechaS = fechaS.replace(/\x25mmmm/g, mmmm);
	fechaS = fechaS.replace(/\x25mmm/g, mmm);
	fechaS = fechaS.replace(/\x25mm/g, mm);
	fechaS = fechaS.replace(/\x25m/g, m);
	fechaS = fechaS.replace(/\x25dddd/g, dddd);
	fechaS = fechaS.replace(/\x25ddd/g, ddd);
	fechaS = fechaS.replace(/\x25dd/g, dd);
	fechaS = fechaS.replace(/\x25d/g, d);
	fechaS = fechaS.replace(/\x25hh/g, hh);
	fechaS = fechaS.replace(/\x25h/g, h);
	fechaS = fechaS.replace(/\x25ii/g, ii);
	fechaS = fechaS.replace(/\x25i/g, i);
	fechaS = fechaS.replace(/\x25ss/g, ss);
	fechaS = fechaS.replace(/\x25s/g, s);
	fechaS = fechaS.replace(/\x25lll/g, lll);
	fechaS = fechaS.replace(/\x25l/g, l);
	return fechaS;
}
Mi.Convert.dateToGMTString = function (fecha) {
	return Mi.Convert.dateToString(fecha, '%a-%mm-%dd %hh:%ii:%ss.%lll');
}
Mi.Convert.numberToString = function (n, decimales, separador) {
	if (!$.isNumeric(n)) return null;
	var negativo = n < 0 ? true : false;
	if ($.isNumeric(decimales)) n = (parseFloat(n)).toFixed(decimales);
	else n = n.toString();
	if (!separador) return n;
	var a = n.split('.');
	var unsignedInt = (negativo ? parseInt(a[0]) * -1 : parseInt(a[0])).toString();
	var decimal = a.length > 1 ? '.' + a[1] : '';
	var b = [];
	for (var i = unsignedInt.length - 1; i >= 0; i--) {
		if ((unsignedInt.length - i - 1) % 3 == 0 && i < (unsignedInt.length - 1)) b.unshift(',');
		b.unshift(unsignedInt.charAt(i));
	}
	return (negativo ? '-' : '') + b.join('') + decimal;
}
Mi.Convert.stringToDate = function (s) {
	if ($.type(s) != 'string') return null;
	var s = s.split('/');
	if (s.length != 3) return null;
	return new Date(parseInt(s[2]), parseInt(s[1]) - 1, parseInt(s[0]));
}
Mi.Convert.stringToNumber = function (s) {
	if ($.type(s) != 'string') return null;
	s = parseFloat(s.replace(/[^\d.-]/g, ''));
	if (!$.isNumeric(s)) return null;
	return s;
}