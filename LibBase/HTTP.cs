using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Web;
using System.IO;

namespace LibBase
{
		public class HTTP
		{
			public static void GetStringParam(HttpRequest Request, HttpResponse Response, String paramName)
			{
				if (Request[paramName] == null) Response.Write("null");
				else Response.Write("'" + Request[paramName] + "'");
			}
			public static void GetIntParam(HttpRequest Request, HttpResponse Response, String paramName)
			{
				if (Request[paramName] == null) Response.Write("null");
				else Response.Write(Request[paramName]);
			}

            public static bool hasSession(){
                return HttpContext.Current.Session["login"] == null ;
            }


            public static void login(HttpRequest request, HttpResponse response)
            {
                string responseText = LibBase.AJAX_SP.Execute(request, response);

                if (responseText != "")
                {
                    dynamic o = (dynamic)JSON.Deserialize(responseText);


                    string idsession = o[0][0]["idsesion"];

                    bool startSession = (idsession != "null");

                    if (startSession)
                    {
                        HttpContext.Current.Session.Add("login", responseText);

                    }
                    //else{
                    //    HttpContext.Current.Session.Abandon();
                    //}
                }

            }


            public static void logout(HttpRequest request, HttpResponse response)
            {
                HttpContext.Current.Session["login"] = null;
                HttpContext.Current.Session.Abandon();
            }
		}
}
