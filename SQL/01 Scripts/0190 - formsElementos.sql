CREATE TABLE formsElementos(
	idformElemento varchar(32) NOT NULL,
	idform char(32) NOT NULL,
	elemento int NOT NULL, --(0) textbox (1) textarea (2) listbox 
	descripcion varchar(max) NOT NULL,
	orden int NOT NULL,
	CONSTRAINT PK_formsElementos PRIMARY KEY (idformElemento),
	CONSTRAINT CK_formsElementos_elemento CHECK (elemento in (0,1,2,3,4,5,6,7))
)
GO

ALTER TABLE formsElementos ADD CONSTRAINT FK_formsElementos_idform FOREIGN KEY(idform)
REFERENCES forms(idform)

CREATE INDEX IX_formsElementos_01 on formsElementos(idform) include(elemento)
GO