using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Web.Script.Serialization;

namespace LibBase
{
		public class JSON
		{
			private static Object MiSerialize(Object o)
			{
				if (o == null) return null;
				if (o.GetType().Namespace + "." + o.GetType().Name == "System.DBNull") return null;
				if (o.GetType().IsArray)
				{
					Array array = (Array)o;
					Object[] a = new Object[array.Length];
					for (int i = 0; i < array.Length; i++)
						a[i] = MiSerialize(array.GetValue(i));
					return a;
				}
				if (o.GetType().Namespace + "." + o.GetType().Name == "System.Collections.Generic.Dictionary`2" && o.GetType().GetGenericArguments().Length == 2 && o.GetType().GetGenericArguments()[0].Name == "String" && o.GetType().GetGenericArguments()[1].Name == "Object")
				{
					Dictionary<String, Object> l = new Dictionary<String, object>();
					foreach (String key in ((Dictionary<String, object>)o).Keys)
						l[key] = MiSerialize(((Dictionary<String, object>)o)[key]);
					return l;
				}
				switch (o.GetType().Namespace + "." + o.GetType().Name)
				{
					case "System.Int16":
					case "System.Int32":
					case "System.Int64":
					case "System.String":
					case "System.Double":
					case "System.Decimal":
					case "System.Boolean":
						return o;
					case "System.DateTime":
						DateTime d = (DateTime)o;
						return "UTC:" + d.Year + "," + d.Month + "," + d.Day + "," + d.Hour + "," + d.Minute + "," + d.Second + "," + d.Millisecond;
				}
				throw new Exception("Type: " + o.GetType().Namespace + "." + o.GetType().Name + " no puede serializarse.");
			}
			public static String Serialize(Object o)
			{
				JavaScriptSerializer javaScriptSerializer = new JavaScriptSerializer();
				return javaScriptSerializer.Serialize(JSON.MiSerialize(o));
			}
			private static Object MiDeserialize(Object o)
			{
				if (o == null) return null;
				if (o.GetType().IsArray)
				{
					Array array = (Array)o;
					Object[] a = new Object[array.Length];
					for (int i = 0; i < array.Length; i++)
						a[i] = MiDeserialize(array.GetValue(i));
					return a;
				}
				if (o.GetType().Namespace == "System.Collections.Generic" && o.GetType().Name == "Dictionary`2" && o.GetType().GetGenericArguments().Length == 2 && o.GetType().GetGenericArguments()[0].Name == "String" && o.GetType().GetGenericArguments()[1].Name == "Object")
				{
					Dictionary<String, Object> l = new Dictionary<String, object>();
					foreach (String key in ((Dictionary<String, object>)o).Keys)
						l[key] = MiDeserialize(((Dictionary<String, object>)o)[key]);
					return l;
				}
				if (o.GetType().Namespace + "." + o.GetType().Name == "System.String" && (new Regex(@"^UTC:\d*,\d*,\d*,\d*,\d*,\d*,\d*$")).IsMatch((String)o))
				{
					String[] s = ((String)o).Substring(4).Split(new char[] { ',' });
					return new DateTime(Int32.Parse(s[0]), Int32.Parse(s[1]), Int32.Parse(s[2]), Int32.Parse(s[3]), Int32.Parse(s[4]), Int32.Parse(s[5]), Int32.Parse(s[6]));
				}
				return o;
			}
			public static Object Deserialize(String s)
			{
				JavaScriptSerializer javaScriptSerializer = new JavaScriptSerializer();
				return JSON.MiDeserialize(javaScriptSerializer.Deserialize(s, null));
			}
		}
	}