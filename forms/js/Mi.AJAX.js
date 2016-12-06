Mi.AJAX.request = function (params) {
	if (!$.isPlainObject(params)) params = {}
	if ($.type(params.url) != 'string') params.url = Mi.webHome + 'pages/ajax.aspx';
	if ($.type(params.onsuccess) != 'function') params.onsuccess = function () { }
	if ($.type(params.onerror) != 'function') params.onerror = function (r) { alert(r); }
	if ($.type(params.data) == 'undefined') params.data = null;
	if (Mi.Cookie.exist('SESIONFORMS')) {
		if ($.isPlainObject(params.data)) params.data.idsesion = Mi.Cookie.get('SESIONFORMS').idsesion;
		else if ($.isArray(params.data)) for (var i = 0; i < params.data.length; i++) params.data[i].idsesion = Mi.Cookie.get('SESIONFORMS').idsesion
	}
	var request = {
		cache: false,
		type: 'post',
		error: function (jqXHR, textStatus, errorThrown) {
			params.onerror(errorThrown)
		},
		success: function (data, textStatus, jqXHR) {
			if (data.length == 0) params.onsuccess();
			else {
				var o = Mi.JSON.deserialize(data);
				if ($.isPlainObject(o)) if (o.type) if (o.type == 'EXCEPTION') {
					params.onerror(o.mensajeUsuario);
					return;
				}
				params.onsuccess(o);
			}
		},
		data: { DATA: Mi.JSON.serialize(params.data) }
	}
	$.ajax(params.url, request);
}