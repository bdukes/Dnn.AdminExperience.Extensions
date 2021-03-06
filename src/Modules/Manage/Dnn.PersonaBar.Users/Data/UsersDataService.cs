﻿// DotNetNuke® - http://www.dnnsoftware.com
// Copyright (c) 2002-2016, DNN Corp.
// by DNN Corporation
// All Rights Reserved

using System;
using System.Collections.Generic;
using Dnn.PersonaBar.Users.Components.Dto;
using DotNetNuke.Common.Utilities;
using DotNetNuke.Framework;

namespace Dnn.PersonaBar.Users.Data
{
    public class UsersDataService : ServiceLocator<IUsersDataService, UsersDataService>, IUsersDataService
    {
        #region Overrides of ServiceLocator

        protected override Func<IUsersDataService> GetFactory()
        {
            return () => new UsersDataService();
        }

        #endregion

        public IList<UserBasicDto> GetUsersByUserIds(int portalId, string userIds)
        {
            return CBO.FillCollection<UserBasicDto>(DotNetNuke.Data.DataProvider.Instance()
                .ExecuteReader("Personabar_GetUsersByUserIds",
                    portalId, userIds));
        }
    }
}