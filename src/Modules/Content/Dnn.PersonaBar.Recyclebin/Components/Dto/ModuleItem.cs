﻿﻿#region Copyright
// DotNetNuke® - http://www.dotnetnuke.com
// Copyright (c) 2002-2016
// by DotNetNuke Corporation
// All Rights Reserved
#endregion

namespace Dnn.PersonaBar.Recyclebin.Components.Dto
{

    public class ModuleItem
    {
        public int Id { get; set; }

        public int TabModuleId { get; set; }

        public string Title { get; set; }

        public int PortalId { get; set; }

        public string TabName { get; set; }

        public int TabID { get; set; }

        public bool TabDeleted { get; set; }

        public string LastModifiedOnDate { get; set; }

        public string FriendlyLastModifiedOnDate { get; set; }
    }
}
