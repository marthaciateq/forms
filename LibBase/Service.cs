using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LibBase
{
    class Service
    {
        private String name = null;
        private Dictionary<String, Object> parameters = new Dictionary<string, object>();
        public Service(String name)
        {
            this.name = name;
        }
        public String Name
        {
            get { return this.name; }
        }
        public Dictionary<String, Object> Parameters
        {
            get { return this.parameters; }
        }
    }
}
