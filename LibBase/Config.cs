using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace LibBase
{
		public class Config
		{
			private static String defaultErrorMessage = null;
			private static Dictionary<String, String> connectionStrings = new Dictionary<String, String>();
			private static String serverHome = null;

			public static String DefaultErrorMessage
			{
				get { return Config.defaultErrorMessage; }
				set { Config.defaultErrorMessage = value; }
			}
			public static Dictionary<String, String> ConnectionStrings
			{
				get { return Config.connectionStrings; }
			}
			public static String ServerHome
			{
				get { return Config.serverHome; }
				set { Config.serverHome = value; }
			}

		}
	}
