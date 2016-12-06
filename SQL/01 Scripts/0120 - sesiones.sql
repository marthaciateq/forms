CREATE TABLE sesiones(
	idsesion char(32) NOT NULL,
	idusuario char(32) NOT NULL,
	fcreacion datetime NOT NULL
	CONSTRAINT PK_sesiones PRIMARY KEY (idsesion)
)
GO