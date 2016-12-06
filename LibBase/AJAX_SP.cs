using System;
using System.Data.SqlClient;
using System.Collections;
using System.Collections.Generic;
using System.Web;

namespace LibBase
{
		public class AJAX_SP
		{
			public static string Execute(HttpRequest Request, HttpResponse Response)
			{

				SqlConnection sqlConnection = null;
				SqlCommand sqlCommand = null;
				SqlDataReader sqlDataReader = null;
				Object DATA = null;
				ArrayList storeProcedures = null;
				Dictionary<String, Object> storeProcedure = null;
				bool isResulTable = true;
				ArrayList resultTables = null, resultTable = null;
				Dictionary<String, Object> resultRow = null;
				try
				{
					if (Request.Params["DATA"] == null) throw new Exception("Param DATA nulo.");
					DATA = JSON.Deserialize(Request.Params["DATA"]);
					storeProcedures = new ArrayList();
					if (DATA.GetType().Namespace + "." + DATA.GetType().Name == "System.Collections.Generic.Dictionary`2")
						storeProcedures.Add(DATA);
					else if (DATA.GetType().IsArray)
					{
						Array array = (Array)DATA;
						for (int i = 0; i < array.Length; i++)
							storeProcedures.Add(array.GetValue(i));
					}
					sqlConnection = BD.Connection();
					resultTables = new ArrayList();
					for (int i = 0; i < storeProcedures.Count; i++)
					{
						if (storeProcedures[i].GetType().Namespace + "." + storeProcedures[i].GetType().Name != "System.Collections.Generic.Dictionary`2")
							throw new Exception("El Store Procedure no es un objeto System.Collections.Generic.Dictionary`2.");
						storeProcedure = (Dictionary<String, Object>)storeProcedures[i];
						if (!storeProcedure.ContainsKey("NAME")) throw new Exception("El Store Procedure no tiene definido NAME.");
						sqlCommand = BD.GetSqlCommandFromStoreProcedure(storeProcedure["NAME"].ToString(), storeProcedure);
						sqlCommand.Connection = sqlConnection;
						sqlDataReader = BD.ExecuteReader(sqlCommand);
						isResulTable = true;
						if (sqlDataReader.FieldCount == 0) isResulTable = false;
						while (isResulTable)
						{
							resultTable = new ArrayList();
							while (sqlDataReader.Read())
							{
								resultRow = new Dictionary<String, Object>();
								for (int j = 0; j < sqlDataReader.FieldCount; j++)
									if (!resultRow.ContainsKey(sqlDataReader.GetName(j)))
										resultRow.Add(sqlDataReader.GetName(j), sqlDataReader.GetValue(j));
								resultTable.Add(resultRow);
							}
							resultTables.Add(resultTable.ToArray());
							isResulTable = sqlDataReader.NextResult();
						}
						sqlDataReader.Close();
					}
                    if (resultTables.Count == 1) { 
                        
                        Response.Output.Write(JSON.Serialize(resultTables[0]));

                        return JSON.Serialize(resultTables[0]);
                    }
                    else if (resultTables.Count > 1) { 
                        
                        Response.Output.Write(JSON.Serialize(resultTables.ToArray()));

                        return JSON.Serialize(resultTables.ToArray());
                    }
				}
				catch (Exception exception)
				{
					bool excepcionUsuario = false;
					String mensajeUsuario = null, mensajeSistema = null;
					if (exception.Message.IndexOf("EXCEPCION USUARIO:") >= 0) excepcionUsuario = true;
					mensajeSistema = exception.Message.Replace("EXCEPCION SISTEMA:", "").Replace("EXCEPCION USUARIO:", "");
					if (excepcionUsuario) mensajeUsuario = mensajeSistema;
					else mensajeUsuario = Config.DefaultErrorMessage;

					Dictionary<String, Object> error = new Dictionary<String, Object>();
					error.Add("type", "EXCEPTION");
					error.Add("mensajeUsuario", mensajeUsuario);
					error.Add("mensajeSistema", mensajeSistema);
					Response.Output.Write(JSON.Serialize(error));

                    return "";
				}
				finally
				{
					if (sqlConnection != null) try { sqlConnection.Close(); }
						catch { }
				}

                return "";

			}
		}
}