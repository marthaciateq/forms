using System;
using System.Data;
using System.Data.Common;
using System.Data.SqlClient;
using System.Collections;
using System.Collections.Generic;
using System.Text;
using System.Text.RegularExpressions;
//using MySql.Data.MySqlClient;

namespace LibBase
{
		public class BD
		{

            //public static DbConnection DBConnection(String connectionName)
            //{
            //    DbConnection dbConnection = null;
            //    dbConnection = new MySqlConnection(Config.ConnectionStrings[connectionName]);
            //    dbConnection.Open();
            //    return dbConnection;
            //}
			public static SqlConnection Connection(String connectionName)
			{
				SqlConnection sqlConnection = null;
				sqlConnection = new SqlConnection(Config.ConnectionStrings[connectionName]);
				sqlConnection.Open();
				return sqlConnection;
			}
			public static SqlConnection Connection()
			{
				return BD.Connection("Default");
			}
			private static String LogName(String commandText)
			{
				Match match = null;
				Regex regex = new Regex(@"^ *execute *\w*", RegexOptions.IgnoreCase);
				match = regex.Match(commandText);
				if (match.Success)
				{
					commandText = match.Value;
					regex = new Regex(@"^ *execute *", RegexOptions.IgnoreCase);
					match = regex.Match(commandText);
					commandText = commandText.Substring(match.Index + match.Length);
				}
				return commandText;
			}
			public static int LogInit(SqlCommand sqlCommand, SqlConnection sqlConnectionAdmin)
			{
				int idlog = -1;
				SqlCommand cmd = null;
				ArrayList table = null;
				try
				{
					table = new ArrayList();
					for (int i = 0; i < sqlCommand.Parameters.Count; i++)
						table.Add(new Object[] { sqlCommand.Parameters[i].ParameterName, sqlCommand.Parameters[i].Value });
					cmd = new SqlCommand("execute sp_log_begin @name, @parameters", sqlConnectionAdmin);
					cmd.Parameters.Add("@name", SqlDbType.VarChar).Value = BD.LogName(sqlCommand.CommandText);
					cmd.Parameters.Add("@parameters", SqlDbType.VarChar).Value = BD.TableToString(table.ToArray());
					idlog = (int)cmd.ExecuteScalar();
				}
				catch
				{
				}
				return idlog;
			}
			public static void LogOk(int idlog, SqlConnection sqlConnectionAdmin)
			{
				SqlCommand cmd = null;
				try
				{
					cmd = new SqlCommand("execute sp_log_ok @idlog", sqlConnectionAdmin);
					cmd.Parameters.Add("@idlog", SqlDbType.Int).Value = idlog;
					cmd.ExecuteNonQuery();
				}
				catch
				{
				}
			}
			public static void LogException(int idlog, Exception exception, SqlConnection sqlConnectionAdmin)
			{
				SqlCommand cmd = null;
				try
				{
					cmd = new SqlCommand("execute sp_log_exception @idlog, @exception", sqlConnectionAdmin);
					cmd.Parameters.Add("@idlog", SqlDbType.Int).Value = idlog;
					cmd.Parameters.Add("@exception", SqlDbType.VarChar).Value = exception.Message;
					cmd.ExecuteNonQuery();
				}
				catch
				{
				}
			}
			public static SqlDataReader ExecuteReader(SqlCommand sqlCommand)
			{
				SqlConnection sqlConnectionAdmin = null;
				SqlDataReader sqlDataReader = null;
				int idlog = -1;
				try
				{
					sqlConnectionAdmin = BD.Connection("Admin");
					idlog = BD.LogInit(sqlCommand, sqlConnectionAdmin);
					sqlDataReader = sqlCommand.ExecuteReader();
					BD.LogOk(idlog, sqlConnectionAdmin);
					return sqlDataReader;
				}
				catch (Exception exception)
				{
					BD.LogException(idlog, exception, sqlConnectionAdmin);
					throw exception;
				}
				finally
				{
					if (sqlConnectionAdmin != null)
						try
						{
							sqlConnectionAdmin.Close();
						}
						catch { }
				}
			}
			public static DataSet ExecuteAdapter(SqlCommand sqlCommand)
			{
				SqlConnection sqlConnectionAdmin = null;
				SqlDataAdapter sqlDataAdapter = null;
				DataSet dataSet = new DataSet();
				int idlog = -1;
				try
				{
					sqlConnectionAdmin = BD.Connection("Admin");
					idlog = BD.LogInit(sqlCommand, sqlConnectionAdmin);
					sqlDataAdapter = new SqlDataAdapter(sqlCommand);
					sqlDataAdapter.Fill(dataSet);
					BD.LogOk(idlog, sqlConnectionAdmin);
					return dataSet;
				}
				catch (Exception exception)
				{
					BD.LogException(idlog, exception, sqlConnectionAdmin);
					throw exception;
				}
				finally
				{
					if (sqlConnectionAdmin != null)
						try
						{
							sqlConnectionAdmin.Close();
						}
						catch { }
				}
			}
			public static int ExecuteNonQuery(SqlCommand sqlCommand)
			{
				SqlConnection sqlConnectionAdmin = null;
				int result = -1;
				int idlog = -1;
				try
				{
					sqlConnectionAdmin = BD.Connection("Admin");
					idlog = BD.LogInit(sqlCommand, sqlConnectionAdmin);
					result = sqlCommand.ExecuteNonQuery();
					BD.LogOk(idlog, sqlConnectionAdmin);
					return result;
				}
				catch (Exception exception)
				{
					BD.LogException(idlog, exception, sqlConnectionAdmin);
					throw exception;
				}
				finally
				{
					if (sqlConnectionAdmin != null)
						try
						{
							sqlConnectionAdmin.Close();
						}
						catch { }
				}
			}
			public static object ExecuteScalar(SqlCommand sqlCommand)
			{
				SqlConnection sqlConnectionAdmin = null;
				object result = null;
				int idlog = -1;
				try
				{
					sqlConnectionAdmin = BD.Connection("Admin");
					idlog = BD.LogInit(sqlCommand, sqlConnectionAdmin);
					result = sqlCommand.ExecuteScalar();
					BD.LogOk(idlog, sqlConnectionAdmin);
					return result;
				}
				catch (Exception exception)
				{
					BD.LogException(idlog, exception, sqlConnectionAdmin);
					throw exception;
				}
				finally
				{
					if (sqlConnectionAdmin != null)
						try
						{
							sqlConnectionAdmin.Close();
						}
						catch { }
				}
			}
			public static SqlCommand GetSqlCommandFromStoreProcedure(String storeProcedureName, Dictionary<string, object> parameters)
			{
				SqlConnection sqlConnectionAdmin = null;
				SqlCommand sqlCommand = null;
				SqlDataReader sqlDataReader = null;
				SqlParameter sqlParameter = null;

				try
				{
					sqlConnectionAdmin = BD.Connection("Admin");
					sqlCommand = new SqlCommand("select b.name parameterName, c.name typeName from sys.procedures a inner join sys.parameters b on a.object_id=b.object_id inner join sys.types c on b.system_type_id=c.system_type_id where a.name=@storeProcedureName order by b.parameter_id", sqlConnectionAdmin);
					sqlCommand.Parameters.Add("@storeProcedureName", SqlDbType.VarChar).Value = storeProcedureName;
					sqlDataReader = sqlCommand.ExecuteReader();
					sqlCommand = new SqlCommand();
					sqlCommand.CommandText = "execute " + storeProcedureName + " ";
					while (sqlDataReader.Read())
					{
						sqlParameter = new SqlParameter();
						sqlCommand.Parameters.Add(sqlParameter);
						sqlParameter.ParameterName = sqlDataReader.GetString(0);

						if (!parameters.ContainsKey(sqlParameter.ParameterName.Substring(1))) sqlParameter.Value = System.DBNull.Value;
						else if (parameters[sqlParameter.ParameterName.Substring(1)] == null) sqlParameter.Value = System.DBNull.Value;
						else if (sqlDataReader.GetString(1) == "varchar" && parameters[sqlParameter.ParameterName.Substring(1)].GetType().IsArray) sqlParameter.Value = BD.TableToString((Array)parameters[sqlParameter.ParameterName.Substring(1)]);
						else sqlParameter.Value = parameters[sqlParameter.ParameterName.Substring(1)];

						switch (sqlDataReader.GetString(1))
						{
							case "bigint": sqlParameter.SqlDbType = SqlDbType.BigInt; break;
							case "binary": sqlParameter.SqlDbType = SqlDbType.Binary; break;
							case "bit": sqlParameter.SqlDbType = SqlDbType.Bit; break;
							case "char": sqlParameter.SqlDbType = SqlDbType.Char; break;
							case "date": sqlParameter.SqlDbType = SqlDbType.Date; break;
							case "datetime": sqlParameter.SqlDbType = SqlDbType.DateTime; break;
							case "decimal": sqlParameter.SqlDbType = SqlDbType.Decimal; break;
							case "float": sqlParameter.SqlDbType = SqlDbType.Float; break;
							case "image": sqlParameter.SqlDbType = SqlDbType.Image; break;
							case "int": sqlParameter.SqlDbType = SqlDbType.Int; break;
							case "money": sqlParameter.SqlDbType = SqlDbType.Money; break;
							case "nchar": sqlParameter.SqlDbType = SqlDbType.NChar; break;
							case "ntext": sqlParameter.SqlDbType = SqlDbType.NText; break;
							case "numeric": sqlParameter.SqlDbType = SqlDbType.Decimal; break;
							case "nvarchar": sqlParameter.SqlDbType = SqlDbType.NVarChar; break;
							case "real": sqlParameter.SqlDbType = SqlDbType.Real; break;
							case "smalldatetime": sqlParameter.SqlDbType = SqlDbType.SmallDateTime; break;
							case "smallint": sqlParameter.SqlDbType = SqlDbType.SmallInt; break;
							case "smallmoney": sqlParameter.SqlDbType = SqlDbType.SmallMoney; break;
							case "text": sqlParameter.SqlDbType = SqlDbType.Text; break;
							case "timestamp": sqlParameter.SqlDbType = SqlDbType.Timestamp; break;
							case "tinyint": sqlParameter.SqlDbType = SqlDbType.TinyInt; break;
							case "uniqueidentifier": sqlParameter.SqlDbType = SqlDbType.UniqueIdentifier; break;
							case "varbinary": sqlParameter.SqlDbType = SqlDbType.VarBinary; break;
							case "varchar": sqlParameter.SqlDbType = SqlDbType.VarChar; break;
							case "xml": sqlParameter.SqlDbType = SqlDbType.Xml; break;
						}
						sqlCommand.CommandText = sqlCommand.CommandText + sqlParameter.ParameterName + ",";
					}
					sqlDataReader.Close();
					if (sqlCommand.CommandText.Substring(sqlCommand.CommandText.Length - 1, 1).Equals(","))
						sqlCommand.CommandText = sqlCommand.CommandText.Substring(0, sqlCommand.CommandText.Length - 1);
					return sqlCommand;
				}
				finally
				{
					if (sqlDataReader != null)
						try
						{
							sqlDataReader.Close();
						}
						catch { }
					if (sqlConnectionAdmin != null)
						try
						{
							sqlConnectionAdmin.Close();
						}
						catch { }
				}
			}
			public static String TableToString(Array table)
			{
				if (table.Length > 0) if (table.GetValue(0)==null || !table.GetValue(0).GetType().IsArray)
					{
						Object[] tmp = new Object[] { table };
						table = (Array)tmp;
					}

				StringBuilder s = new StringBuilder();
				for (int i = 0; i < table.Length; i++)
				{
					Array row = (Array)table.GetValue(i);
					for (int j = 0; j < row.Length; j++)
						if (row.GetValue(j) == null) s.Append("|");
						else if (row.GetValue(j).GetType().Namespace + "." + row.GetValue(j).GetType().Name == "System.DateTime")
							s.Append(JSON.Serialize(row.GetValue(j)).Replace("\"", "") + "|");
						else s.Append(row.GetValue(j).ToString().Replace("<PIPE>", "<PIPE2>").Replace("|", "<PIPE>") + "|");
				}
				return s.ToString();
			}
			public static int KeysNext(String key)
			{
				SqlConnection sqlConnectionAdmin = null;
				SqlCommand sqlCommand = null;
				int result = -1;
				int idlog = -1;
				try
				{
					sqlConnectionAdmin = BD.Connection("Admin");
					sqlCommand = new SqlCommand("execute sp_keys_next @key, 'S'", sqlConnectionAdmin);
					sqlCommand.Parameters.Add("@key", SqlDbType.VarChar).Value = key;
					idlog = BD.LogInit(sqlCommand, sqlConnectionAdmin);
					result = (int)sqlCommand.ExecuteScalar();
					BD.LogOk(idlog, sqlConnectionAdmin);
					return result;
				}
				catch (Exception exception)
				{
					BD.LogException(idlog, exception, sqlConnectionAdmin);
					throw exception;
				}
				finally
				{
					if (sqlConnectionAdmin != null)
						try
						{
							sqlConnectionAdmin.Close();
						}
						catch { }
				}
			}
		}
	}