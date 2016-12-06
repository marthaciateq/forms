CREATE function fn_table
(	
	@columnas int,
	@cadena varchar (max)	
)
RETURNS @tabla table(col1 varchar(max),col2 varchar(max),col3 varchar(max),col4 varchar(max),col5 varchar(max),col6 varchar(max),col7 varchar(max),col8 varchar(max),col9 varchar(max),col10 varchar(max),col11 varchar(max),col12 varchar(max),col13 varchar(max),col14 varchar(max),col15 varchar(max),col16 varchar(max),col17 varchar(max),col18 varchar(max),col19 varchar(max),col20 varchar(max),col21 varchar(max),col22 varchar(max),col23 varchar(max),col24 varchar(max),col25 varchar(max),col26 varchar(max),col27 varchar(max),col28 varchar(max),col29 varchar(max),col30 varchar(max),col31 varchar(max),col32 varchar(max),col33 varchar(max),col34 varchar(max),col35 varchar(max),row int)
AS
BEGIN
	declare @c char(1);
	declare @i int;
	declare @row int;
	declare @col int;
	declare @length int;
	declare @dato varchar(max);
	declare @dato1 varchar(max);
	declare @dato2 varchar(max);
	declare @dato3 varchar(max);
	declare @dato4 varchar(max);
	declare @dato5 varchar(max);
	declare @dato6 varchar(max);
	declare @dato7 varchar(max);
	declare @dato8 varchar(max);
	declare @dato9 varchar(max);
	declare @dato10 varchar(max);
	declare @dato11 varchar(max);
	declare @dato12 varchar(max);
	declare @dato13 varchar(max);
	declare @dato14 varchar(max);
	declare @dato15 varchar(max);
	declare @dato16 varchar(max);
	declare @dato17 varchar(max);
	declare @dato18 varchar(max);
	declare @dato19 varchar(max);
	declare @dato20 varchar(max);
	declare @dato21 varchar(max);
	declare @dato22 varchar(max);
	declare @dato23 varchar(max);
	declare @dato24 varchar(max);
	declare @dato25 varchar(max);
	declare @dato26 varchar(max);
	declare @dato27 varchar(max);
	declare @dato28 varchar(max);
	declare @dato29 varchar(max);
	declare @dato30 varchar(max);
	declare @dato31 varchar(max);
	declare @dato32 varchar(max);
	declare @dato33 varchar(max);
	declare @dato34 varchar(max);
	declare @dato35 varchar(max);

	set @length=len(@cadena)
	if @length > 0 and SUBSTRING(@cadena, @length, 1) <> '|'
	begin
		set @cadena = @cadena + '|'
		set @length=len(@cadena)
	end
	
	set @i=1;
	set @row=1;
	set @col=1;
	set @dato='';
	while @i<=@length
	begin
		set @c=substring(@cadena,@i,1);
		if @c='|'
		begin
			set @dato=replace(@dato,'<PIPE>','|');
			set @dato=replace(@dato,'<PIPE2>','<PIPE>');
			if @col=1 set @dato1=@dato;
			else if @col=2 set @dato2=@dato;
			else if @col=3 set @dato3=@dato;
			else if @col=4 set @dato4=@dato;
			else if @col=5 set @dato5=@dato;
			else if @col=6 set @dato6=@dato;
			else if @col=7 set @dato7=@dato;
			else if @col=8 set @dato8=@dato;
			else if @col=9 set @dato9=@dato;
			else if @col=10 set @dato10=@dato;
			else if @col=11 set @dato11=@dato;
			else if @col=12 set @dato12=@dato;
			else if @col=13 set @dato13=@dato;
			else if @col=14 set @dato14=@dato;
			else if @col=15 set @dato15=@dato;
			else if @col=16 set @dato16=@dato;
			else if @col=17 set @dato17=@dato;
			else if @col=18 set @dato18=@dato;
			else if @col=19 set @dato19=@dato;
			else if @col=20 set @dato20=@dato;
			else if @col=21 set @dato21=@dato;
			else if @col=22 set @dato22=@dato;
			else if @col=23 set @dato23=@dato;
			else if @col=24 set @dato24=@dato;
			else if @col=25 set @dato25=@dato;
			else if @col=26 set @dato26=@dato;
			else if @col=27 set @dato27=@dato;
			else if @col=28 set @dato28=@dato;
			else if @col=29 set @dato29=@dato;
			else if @col=30 set @dato30=@dato;
			else if @col=31 set @dato31=@dato;
			else if @col=32 set @dato32=@dato;
			else if @col=33 set @dato33=@dato;
			else if @col=34 set @dato34=@dato;
			else if @col=35 set @dato35=@dato;
			if @col=@columnas
			begin
				insert into @tabla values(@dato1,@dato2,@dato3,@dato4,@dato5,@dato6,@dato7,@dato8,@dato9,@dato10,@dato11,@dato12,@dato13,@dato14,@dato15,@dato16,@dato17,@dato18,@dato19,@dato20,@dato21,@dato22,@dato23,@dato24,@dato25,@dato26,@dato27,@dato28,@dato29,@dato30,@dato31,@dato32,@dato33,@dato34,@dato35,@row);
				set @row=@row+1;
				set @col=1;
			end
			else set @col=@col+1;
			set @dato='';
		end
		else set @dato=@dato+@c;
		set @i=@i+1;
	end
	return;
END
