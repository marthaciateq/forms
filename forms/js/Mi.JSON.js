Mi.JSON.serialize = function (o) {
	function miStringify(o) {
		if ($.isArray(o)) {
			var a = [];
			for (var i = 0; i < o.length; i++) a.push(miStringify(o[i]));
			return a;
		}
		if ($.isPlainObject(o)) {
			var l = {}
			for (var i in o) l[i] = miStringify(o[i]);
			return l;
		}
		if ($.type(o) == 'date') return 'UTC:' + o.getUTCFullYear() + ',' + (o.getUTCMonth() + 1) + ',' + o.getUTCDate() + ',' + o.getUTCHours() + ',' + o.getUTCMinutes() + ',' + o.getUTCSeconds() + ',' + o.getUTCMilliseconds();
		return o;
	}
	return JSON.stringify(miStringify(o));
}
Mi.JSON.deserialize = function (s) {
	function miParse(o) {
		if ($.isArray(o)) for (var i = 0; i < o.length; i++) o[i] = miParse(o[i]);
		else if ($.isPlainObject(o)) for (var i in o) o[i] = miParse(o[i]);
		else if ($.type(o) == 'string') {
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
	return miParse(JSON.parse(s));
}