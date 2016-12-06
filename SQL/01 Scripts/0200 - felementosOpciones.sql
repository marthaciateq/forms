CREATE TABLE felementosOpciones(
	idformElemento varchar(32),
	descripcion varchar(max) NOT NULL,
	orden int NOT NULL
)
GO

ALTER TABLE felementosOpciones ADD CONSTRAINT FK_felementosOpciones_idformElemento FOREIGN KEY(idformElemento)
REFERENCES formsElementos(idformElemento)
GO