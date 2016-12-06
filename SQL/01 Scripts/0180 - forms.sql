CREATE TABLE forms(
	idform char(32) NOT NULL,
	descripcion varchar(256) NOT NULL,
	estatus int NOT NULL, --(0)Generada, (1)Aprobada, (9)Cancelada
	fecha date NOT NULL,
	CONSTRAINT PK_forms PRIMARY KEY (idform),
	CONSTRAINT CK_forms_estatus CHECK (estatus in (0,1,9))
)
GO

CREATE TABLE bforms(
	idform char(32) NOT NULL,
	idusuario char(32) NOT NULL,
	fecha datetime NOT NULL,
	estatus int NOT NULL,
	comentarios varchar(max),
	CONSTRAINT CK_bforms_estatus CHECK (estatus in (0,1,9))
)
GO

CREATE INDEX IX_bforms_idform on bforms(idform)
