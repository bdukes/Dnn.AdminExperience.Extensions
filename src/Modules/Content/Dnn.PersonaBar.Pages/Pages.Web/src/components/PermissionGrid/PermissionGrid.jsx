import React, {Component, PropTypes} from "react";
import DnnPermissionGrid from "dnn-permission-grid";
import utils from "../../utils";
import cloneDeep from "lodash/cloneDeep";
import style from "./style.less";
import Localization from "localization";

class PermissionGrid extends Component {
        
    onPermissionsChanged(permissions) {
        const p = { 
            ...this.props.permissions,
            ...permissions
        };
        this.props.onPermissionsChanged(p);
    }

    render() {
        const serviceFramework = utils.getServiceFramework(); 

        return (
            <div className={style.permissionGrid}>
                <DnnPermissionGrid 
                    localization={{
                        permissionsByRole: Localization.get("PermissionsByRole"),
                        permissionsByUser: Localization.get("PermissionsByUser"),
                        filterByGroup: Localization.get("FilterByGroup"),
                        addRolePlaceHolder: Localization.get("AddRolePlaceHolder"),
                        addUserPlaceHolder: Localization.get("AddUserPlaceHolder"),
                        addRole: Localization.get("AddRole"),
                        addUser: Localization.get("AddUser"),
                        emptyRole: Localization.get("EmptyRole"),
                        emptyUser: Localization.get("EmptyUser"),
                        globalGroupsText: Localization.get("GlobalGroupsText"),
                        allGroupsText: Localization.get("AllGroupsText"),
                        roleText: Localization.get("Role"),
                        userText: Localization.get("User"),
                        ViewTab: Localization.get("ViewTab"),
                        EditTab: Localization.get("EditTab")
                    }}
                    permissions={cloneDeep(this.props.permissions)} 
                    onPermissionsChanged={this.onPermissionsChanged.bind(this)}
                    service={serviceFramework} />
                <div style={{clear:"both"}} />
            </div>
        );
    }
}

PermissionGrid.propTypes = {
    permissions: PropTypes.object.isRequired,
    onPermissionsChanged: PropTypes.func.isRequired
};

export default PermissionGrid;