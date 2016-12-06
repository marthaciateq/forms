CREATE VIEW v_roles (
	idrol,
	nombre,
	deleted,
	deletedS,
	rol
) AS
	select 
		a.*,
		dbo.fn_deleted(a.deleted) deletedS,
		nombre rol
	from roles a
		