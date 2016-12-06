CREATE FUNCTION fn_utcDatetimeToGMTDatetime
(
	@gmtNow varchar(max),
	@utcDatetime datetime
)
RETURNS datetime
AS
BEGIN
	declare @d datetime = convert(datetime, @gmtNow, 121)
	return dateadd(hour,round(datediff(minute, getutcdate(), @d) / 60.0, 0, null),@utcDatetime);
END