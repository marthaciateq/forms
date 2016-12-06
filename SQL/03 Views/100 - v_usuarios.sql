CREATE VIEW v_usuarios (
	idusuario,
	nombre,
	apaterno,
	amaterno,
	correo,
	login,
	password,
	deleted,
	deletedS
) AS
	select 
		a.*,
		dbo.fn_deleted(a.deleted) deletedS
	from usuarios a