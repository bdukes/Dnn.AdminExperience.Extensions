import React, { Component, PropTypes } from "react";
import { connect } from "react-redux";
import {
    theme as ThemeActions
} from "actions";
import Localization from "localization";
import OverflowText from "dnn-text-overflow-wrapper";

import SvgIcon from "../../../SvgIcon";

import "./style.less";

class ThemeFile extends Component {
    constructor() {
        super();
        this.state = {};
    }

    selectedAsSite() {
        const {props} = this;
        let themeFile = props.themeFile;
        let currentTheme = props.currentTheme;

        if (themeFile.type === 0) {
            return currentTheme.SiteLayout.path.toLowerCase() === themeFile.path.toLowerCase();
        } else {
            return currentTheme.SiteContainer.path.toLowerCase() === themeFile.path.toLowerCase();
        }
    }

    selectedAsEdit() {
        const {props} = this;
        let themeFile = props.themeFile;
        let currentTheme = props.currentTheme;

        if (themeFile.type === 0) {
            return currentTheme.EditLayout.path.toLowerCase() === themeFile.path.toLowerCase();
        } else {
            return currentTheme.EditContainer.path.toLowerCase() === themeFile.path.toLowerCase();
        }
    }

    getClassName() {
        const {props} = this;
        let themeFile = props.themeFile;
        let className = themeFile.type === 0 ? "theme-file-skin" : "theme-file-container";

        let selected = false;

        if (this.selectedAsSite()) {
            selected = true;
            className += " site";
        }

        if (this.selectedAsEdit()) {
            selected = true;
            className += " edit";
        }

        if (selected) {
            className += " selected";
        }

        return className;
    }

    setSiteTheme() {
        const {props} = this;
        let themeFile = props.themeFile;

        props.dispatch(ThemeActions.applyTheme(themeFile, 1));
    }

    setEditTheme() {
        const {props} = this;
        let themeFile = props.themeFile;

        props.dispatch(ThemeActions.applyTheme(themeFile, 2));
    }

    /*eslint-disable eqeqeq*/
    renderActions() {
        const {props} = this;
        let themeFile = props.themeFile;
        let type = themeFile.type;

        if (this.selectedAsSite() && this.selectedAsEdit()) {
            return null;
        }

        return <span className="actions">
            {!this.selectedAsSite() ?
                <a href="#" className="set-site" onClick={this.setSiteTheme.bind(this)}>
                    {type == 0 ? Localization.get("SetSiteLayout") : Localization.get("SetSiteContainer")}
                </a> : null}
            {!this.selectedAsEdit() ?
                <a href="#" className={"set-edit" + (!this.selectedAsSite() ? " split" : "")} onClick={this.setEditTheme.bind(this)}>
                    {type == 0 ? Localization.get("SetEditLayout") : Localization.get("SetEditContainer")}
                </a> : null}
        </span>;
    }

    renderThumbnail() {
        const {props} = this;

        let themeFile = props.themeFile;
        let className = "thumbnail" + (themeFile.thumbnail ? "" : " empty");

        return <span className={className}>
            {themeFile.thumbnail ? <img src={themeFile.thumbnail} alt={themeFile.name} /> : <SvgIcon name="EmptyThumbnail" />}
            <span className="status">
                <span className="status-site"><SvgIcon name="Site" /></span>
                <span className="status-edit"><SvgIcon name="Edit" /></span>
            </span>
            {this.renderActions()}

        </span>;
    }

    render() {
        const {props} = this;

        return (
            <li className={this.getClassName()}>
                {this.renderThumbnail()}
                <OverflowText text={props.themeFile.name} maxWidth={80} className="title" />
            </li>
        );
    }
}

ThemeFile.propTypes = {
    dispatch: PropTypes.func.isRequired,
    themeFile: PropTypes.object
};

function mapStateToProps(state) {
    return {
        currentTheme: state.theme.currentTheme
    };
}

export default connect(mapStateToProps)(ThemeFile);