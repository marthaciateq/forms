Mi.Cookie.get = function (name) {
	if (Mi.Cookie.exist(name)) return Mi.JSON.deserialize(sessionStorage[name])
	return null;
}
Mi.Cookie.set = function (name, value) {
	sessionStorage[name] = Mi.JSON.serialize(value);
}
Mi.Cookie.exist = function (name) {
	if (sessionStorage[name]) return true;
	return false;
}
Mi.Cookie.remove = function (name) {
	if (Mi.Cookie.exist(name)) delete sessionStorage[name];
}
