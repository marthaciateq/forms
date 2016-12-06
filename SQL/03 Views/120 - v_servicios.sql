CREATE VIEW v_servicios (idservicio, servicio) AS
	SELECT 
		object_id idservicio, 
		name servicio
	FROM 
		sys.procedures
	WHERE 
		name like 'sps_%'
