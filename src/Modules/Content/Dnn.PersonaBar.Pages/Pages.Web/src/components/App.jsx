import React, { Component, PropTypes } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import SocialPanelHeader from "dnn-social-panel-header";
import SocialPanelBody from "dnn-social-panel-body";
import PersonaBarPage from "dnn-persona-bar-page";
import {
    pageActions as PageActions,
    addPagesActions as AddPagesActions,
    templateActions as TemplateActions,
    visiblePanelActions as VisiblePanelActions
} from "../actions";
import PageSettings from "./PageSettings/PageSettings";
import AddPages from "./AddPages/AddPages";
import Localization from "../localization";
import PageList from "./PageList/PageList";
import SaveAsTemplate from "./SaveAsTemplate/SaveAsTemplate";
import Button from "dnn-button";
import utils from "../utils";
import BackTo from "./common/BackTo/BackTo";
import panels from "../constants/panels";

function getSelectedTabBeingViewed(viewTab) {
    switch (viewTab) {
        case "details":
            return 0;
        case "permissions":
            return 1;
        case "localization":
            return 2;
        case "advanced":
            return 3;
    }
}

class App extends Component {
    constructor() {
        super();
        this.state = {
            referral: "",
            referralText: ""
        };
    }
    componentDidMount() {
        const {props} = this;
        const viewName = utils.getViewName();
        const viewParams = utils.getViewParams();

        if (viewName === "edit") {
            props.onLoadPage(utils.getCurrentPageId());
        }

        //Resolve tab being viewed, if view params are present.
        this.resolveTabBeingViewed(viewParams);

        //Listen to event fired to view page settings (from site settings)
        document.addEventListener("viewPageSettings", this.resolveTabBeingViewed.bind(this), false);
    }

    //Update referral text if coming from a referral. (ex: "SiteSettings", resx.get("BackToLanguages"))
    updateReferral(referral, referralText) {
        this.setState({
            referral,
            referralText
        });
    }

    //Method to go back to referral panel.
    goToReferralPanel(referral) {
        let personaBar = window.parent.dnn ? window.parent.dnn.PersonaBar : null;
        if (personaBar) {
            personaBar.openPanel(referral, {}); //Open, panel should already be rendered, so no need to pass params.
            this.updateReferral("", "");
        }
    }

    //Call method to go back to referral panel
    backToReferral(referral) {
        this.goToReferralPanel(referral);
    }

    //Resolves tab being viewed if view params are present.
    resolveTabBeingViewed(viewParams) {
        if (!viewParams) {
            return;
        }
        if (viewParams.pageId) {
            this.props.onLoadPage(viewParams.pageId);
        }
        if (viewParams.viewTab) {
            this.selectPageSettingTab(getSelectedTabBeingViewed(viewParams.viewTab));
        }
        if (viewParams.referral) {
            this.updateReferral(viewParams.referral, viewParams.referralText);
        }
    }

    componentWillUnmount() {
        document.removeEventListener("viewPageSettings");
    }

    componentWillReceiveProps(newProps) {
        this.notifyErrorIfNeeded(newProps);
    }

    notifyErrorIfNeeded(newProps) {
        if (newProps.error !== this.props.error) {
            const errorMessage = (newProps.error && newProps.error.message) || Localization.get("AnErrorOccurred");
            utils.notifyError(errorMessage);
        }
    }

    onPageSettings(pageId) {
        const {props} = this;
        props.onLoadPage(pageId);
    }

    onSavePage() {
        const {props} = this;
        props.onSavePage(props.selectedPage);
    }

    onAddPage() {
        const {props} = this;
        props.onAddPage();
    }

    onCancelSettings() {
        if (this.props.selectedPageDirty) {
            this.showCancelWithoutSavingDialog();
        }
        else {
            this.props.onCancelPage();
        }
    }

    showCancelWithoutSavingDialog() {
        const onConfirm = () => this.props.onCancelPage();
        utils.confirm(
            Localization.get("CancelWithoutSaving"),
            Localization.get("Close"),
            Localization.get("Cancel"),
            onConfirm);
    }

    isNewPage() {
        const {selectedPage} = this.props;
        return selectedPage.tabId === 0;
    }

    getPageTitle() {
        const {selectedPage} = this.props;
        return this.isNewPage() ?
            Localization.get("AddPage") :
            Localization.get("PageSettings") + ": " + selectedPage.name;
    }

    getSettingsButtons() {
        const {settingsButtonComponents, onLoadSavePageAsTemplate, onDuplicatePage, onShowPanel, onHidePanel} = this.props;
        const SaveAsTemplateButton = settingsButtonComponents.SaveAsTemplateButton || Button;

        return (
            <div className="heading-buttons">
                <SaveAsTemplateButton
                    type="secondary"
                    size="large"
                    onClick={onLoadSavePageAsTemplate}
                    onShowPanelCallback={onShowPanel}
                    onHidePanelCallback={onHidePanel}
                    onSaveAsPlatformTemplate={onLoadSavePageAsTemplate}>
                    {Localization.get("SaveAsTemplate")}
                </SaveAsTemplateButton>
                <Button
                    type="secondary"
                    size="large"
                    onClick={onDuplicatePage}>
                    {Localization.get("DuplicatePage")}
                </Button>
            </div>
        );
    }

    selectPageSettingTab(index) {
        this.props.selectPageSettingTab(index);
    }

    getSettingsPage() {
        const {props} = this;
        const titleSettings = this.getPageTitle();
        const cancelAction = this.onCancelSettings.bind(this);
        const backToReferral = this.backToReferral.bind(this, this.state.referral);
        const backToPages = <BackTo onClick={this.state.referral ? backToReferral : cancelAction} label={this.state.referralText || Localization.get("BackToPages")} />;

        return (<PersonaBarPage isOpen={props.selectedView === panels.PAGE_SETTINGS_PANEL}>
            <SocialPanelHeader title={titleSettings}>
                {!this.isNewPage() &&
                    this.getSettingsButtons()
                }
            </SocialPanelHeader>
            <SocialPanelBody
                workSpaceTrayOutside={true}
                workSpaceTray={backToPages}
                workSpaceTrayVisible={true}>
                <PageSettings selectedPage={props.selectedPage}
                    selectedPageErrors={props.selectedPageErrors}
                    selectedPageDirty={props.selectedPageDirty}
                    onCancel={cancelAction}
                    onSave={this.onSavePage.bind(this)}
                    selectedPageSettingTab={props.selectedPageSettingTab}
                    selectPageSettingTab={this.selectPageSettingTab.bind(this)}
                    onChangeField={props.onChangePageField}
                    onPermissionsChanged={props.onPermissionsChanged}
                    onChangePageType={props.onChangePageType}
                    onDeletePageModule={props.onDeletePageModule}
                    onEditingPageModule={props.onEditingPageModule}
                    onCancelEditingPageModule={props.onCancelEditingPageModule}
                    editingSettingModuleId={props.editingSettingModuleId}
                    onCopyAppearanceToDescendantPages={props.onCopyAppearanceToDescendantPages}
                    onCopyPermissionsToDescendantPages={props.onCopyPermissionsToDescendantPages}
                    pageDetailsFooterComponents={props.pageDetailsFooterComponents}
                    pageTypeSelectorComponents={props.pageTypeSelectorComponents} />
            </SocialPanelBody>
        </PersonaBarPage>);
    }

    getAddPages() {
        const {props} = this;
        const backToPages = <BackTo onClick={props.onCancelAddMultiplePages} label={Localization.get("BackToPages")} />;

        return (<PersonaBarPage isOpen={props.selectedView === panels.ADD_MULTIPLE_PAGES_PANEL}>
            <SocialPanelHeader title={Localization.get("AddMultiplePages")}>
            </SocialPanelHeader>
            <SocialPanelBody
                workSpaceTrayOutside={true}
                workSpaceTray={backToPages}
                workSpaceTrayVisible={true}>
                <AddPages
                    bulkPage={props.bulkPage}
                    onCancel={props.onCancelAddMultiplePages}
                    onSave={props.onSaveMultiplePages}
                    onChangeField={props.onChangeAddMultiplePagesField}
                    components={props.multiplePagesComponents} />
            </SocialPanelBody>
        </PersonaBarPage>);
    }

    getSaveAsTemplatePage() {
        const {props} = this;
        const pageName = props.selectedPage && props.selectedPage.name;
        const backToLabel = Localization.get("BackToPageSettings") + ": " + pageName;
        const backToPageSettings = <BackTo onClick={props.onCancelSavePageAsTemplate} label={backToLabel} />;

        return (<PersonaBarPage isOpen={props.selectedView === panels.SAVE_AS_TEMPLATE_PANEL}>
            <SocialPanelHeader title={Localization.get("SaveAsTemplate")}>
            </SocialPanelHeader>
            <SocialPanelBody
                workSpaceTrayOutside={true}
                workSpaceTray={backToPageSettings}
                workSpaceTrayVisible={true}>
                <SaveAsTemplate
                    onCancel={props.onCancelSavePageAsTemplate} />
            </SocialPanelBody>
        </PersonaBarPage>);
    }

    getAdditionalPanels() {
        const additionalPanels = [];
        const {props} = this;

        if (props.additionalPanels) {
            for (let i = 0; i < props.additionalPanels.length; i++) {
                const panel = props.additionalPanels[i];
                if (props.selectedView === panel.panelId) {
                    const Component = panel.component;
                    additionalPanels.push(
                        <Component 
                            onSave={()=> {}} 
                            onCancel={props.onCancelSavePageAsTemplate}
                            selectedPage={props.selectedPage}
                        />
                    );
                }
            }
        }

        return additionalPanels;
    }

    render() {
        const {props} = this;
        const additionalPanels = this.getAdditionalPanels();
        return (
            <div className="pages-app personaBar-mainContainer">
                <PersonaBarPage isOpen={props.selectedView === panels.MAIN_PANEL}>
                    <SocialPanelHeader title={Localization.get("Pages")}>
                        <Button type="primary" size="large" onClick={this.onAddPage.bind(this)}>{Localization.get("AddPage")}</Button>
                        <Button type="secondary" size="large" onClick={props.onLoadAddMultiplePages}>{Localization.get("AddMultiplePages")}</Button>
                    </SocialPanelHeader>
                    <PageList onPageSettings={this.onPageSettings.bind(this)} />
                </PersonaBarPage>
                {props.selectedView === panels.PAGE_SETTINGS_PANEL && props.selectedPage &&
                    this.getSettingsPage()
                }
                {props.selectedView === panels.ADD_MULTIPLE_PAGES_PANEL &&
                    this.getAddPages()
                }
                {props.selectedView === panels.SAVE_AS_TEMPLATE_PANEL &&
                    this.getSaveAsTemplatePage()
                }
                {additionalPanels}
            </div>
        );
    }
}

App.propTypes = {
    dispatch: PropTypes.func.isRequired,
    selectedView: PropTypes.number,
    selectedPage: PropTypes.object,
    selectedPageErrors: PropTypes.object,
    selectedPageDirty: PropTypes.boolean,
    bulkPage: PropTypes.object,
    editingSettingModuleId: PropTypes.number,
    onCancelPage: PropTypes.func.isRequired,
    onSavePage: PropTypes.func.isRequired,
    onLoadPage: PropTypes.func.isRequired,
    onAddPage: PropTypes.func.isRequired,
    onCancelAddMultiplePages: PropTypes.func.isRequired,
    onSaveMultiplePages: PropTypes.func.isRequired,
    onLoadAddMultiplePages: PropTypes.func.isRequired,
    onChangeAddMultiplePagesField: PropTypes.func.isRequired,
    onChangePageField: PropTypes.func.isRequired,
    onChangePageType: PropTypes.func.isRequired,
    onPermissionsChanged: PropTypes.func.isRequired,
    onDeletePageModule: PropTypes.func.isRequired,
    onEditingPageModule: PropTypes.func.isRequired,
    onCancelEditingPageModule: PropTypes.func.isRequired,
    onCopyAppearanceToDescendantPages: PropTypes.func.isRequired,
    onCopyPermissionsToDescendantPages: PropTypes.func.isRequired,
    onLoadSavePageAsTemplate: PropTypes.func.isRequired,
    onCancelSavePageAsTemplate: PropTypes.func.isRequired,
    onDuplicatePage: PropTypes.func.isRequired,
    error: PropTypes.object,
    multiplePagesComponents: PropTypes.array.isRequired,
    pageDetailsFooterComponents: PropTypes.array.isRequired,
    settingsButtonComponents: PropTypes.object.isRequired,
    pageTypeSelectorComponents: PropTypes.array.isRequired,
    selectedPageSettingTab: PropTypes.number,
    selectPageSettingTab: PropTypes.func,
    additionalPanels: PropTypes.array.isRequired,
    onShowPanel: PropTypes.func.isRequired,
    onHidePanel: PropTypes.func.isRequired
};

function mapStateToProps(state) {
    return {
        selectedView: state.visiblePanel.selectedPage,
        selectedPage: state.pages.selectedPage,
        selectedPageErrors: state.pages.errors,
        selectedPageDirty: state.pages.dirtyPage,
        bulkPage: state.addPages.bulkPage,
        editingSettingModuleId: state.pages.editingSettingModuleId,
        error: state.errors.error,
        multiplePagesComponents: state.extensions.multiplePagesComponents,
        pageDetailsFooterComponents: state.extensions.pageDetailsFooterComponents,
        settingsButtonComponents: state.extensions.settingsButtonComponents,
        pageTypeSelectorComponents: state.extensions.pageTypeSelectorComponents,
        selectedPageSettingTab: state.pages.selectedPageSettingTab,
        additionalPanels: state.extensions.additionalPanels
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        onCancelPage: PageActions.cancelPage,
        onSavePage: PageActions.savePage,
        selectPageSettingTab: PageActions.selectPageSettingTab,
        onLoadPage: PageActions.loadPage,
        onAddPage: PageActions.addPage,
        onSaveMultiplePages: AddPagesActions.addPages,
        onCancelAddMultiplePages: AddPagesActions.cancelAddMultiplePages,
        onLoadAddMultiplePages: AddPagesActions.loadAddMultiplePages,
        onChangeAddMultiplePagesField: AddPagesActions.changeAddMultiplePagesField,
        onChangePageField: PageActions.changePageField,
        onChangePageType: PageActions.changePageType,
        onPermissionsChanged: PageActions.changePermissions,
        onDeletePageModule: PageActions.deletePageModule,
        onEditingPageModule: PageActions.editingPageModule,
        onCancelEditingPageModule: PageActions.cancelEditingPageModule,
        onCopyAppearanceToDescendantPages: PageActions.copyAppearanceToDescendantPages,
        onCopyPermissionsToDescendantPages: PageActions.copyPermissionsToDescendantPages,
        onLoadSavePageAsTemplate: TemplateActions.loadSavePageAsTemplate,
        onCancelSavePageAsTemplate: TemplateActions.cancelSavePageAsTemplate,
        onDuplicatePage: PageActions.duplicatePage,
        onShowPanel: VisiblePanelActions.showPanel,
        onHidePanel: VisiblePanelActions.hidePanel
    }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
