using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Security;
using System.Web.SessionState;
using System.Configuration;
using LibBase;

namespace forms
{
    public class Global : System.Web.HttpApplication
    {

        protected void Application_Start(object sender, EventArgs e)
        {
            Config.DefaultErrorMessage = ConfigurationManager.AppSettings["DefaultErrorMessage"];
            Config.ConnectionStrings.Add("Default", ConfigurationManager.AppSettings["DefaultConnectionString"]);
            Config.ConnectionStrings.Add("Admin", ConfigurationManager.AppSettings["AdminConnectionString"]);
            Config.ConnectionStrings.Add("MySQL", ConfigurationManager.AppSettings["MySQL"]);
        }

        protected void Session_Start(object sender, EventArgs e)
        {

        }

        protected void Application_BeginRequest(object sender, EventArgs e)
        {

        }

        protected void Application_AuthenticateRequest(object sender, EventArgs e)
        {

        }

        protected void Application_Error(object sender, EventArgs e)
        {

        }

        protected void Session_End(object sender, EventArgs e)
        {

        }

        protected void Application_End(object sender, EventArgs e)
        {

        }
    }
}