import React, { Component } from "react";
import { PropTypes } from "prop-types";
import { IconSelector } from "./icons";
import * as shortid from "shortid";
import { global } from "./_global";

const styles = global.styles;
const floatLeft = styles.float();
const merge = styles.merge;
const inlineBlock = styles.display("inline-block");

let memoize_lastTab = null;
let STATE = false;
let context = [];
let rootContext = null;


export class PagePickerDesktop extends Component {

    constructor(props) {
        super(props);
        this.id = shortid.generate();
        this.debug = true;
        this.checked = 1;
        this.unchecked = 0;
        this.checked_partially = -1;

        const icon_type = props.icon_type;
        this.icon = IconSelector(icon_type);
        this.flatTabs = props.flatTabs;
        this.tabs = props.tabs;
        this.getChildTabs = props.getChildTabs;
        this.export = props.export;
        this.root = props.root;
        rootContext = props.rootContext;


        this.setMasterRootCheckedState = props.setMasterRootCheckedState;
    }

    componentWillMount() {
        STATE = STATE || this.flatTabs;
        this.__setMasterRoot();
        const unique_context = (context.filter(ref => ref.id === this.id).length === 0);
        unique_context ? context.push(this) : null;
    }

    componentWillUnmount() {
        let index = null;
        context.forEach((ref, i) => {
            const left = (i) => index = i;
            const right = () => null;
            ref.id === this.id ? left(i) : right();
        });

        const split1 = context.slice(0, index);
        const split2 = context.slice(index + 1);
        context = [...split1, ...split2];
    }

    componentWillUpdate() {
        const flatTabs = Object.keys(this.flatTabs).map(key => this.flatTabs[key]);
        const update = flatTabs.filter(tab => typeof STATE === "object" && `${tab.TabId}-${tab.Name}` in STATE === false);
        update.forEach(tab => STATE[`${tab.TabId}-${tab.Name}`] = tab);

    }

    __setMasterRoot = () => {
        this.RootTab = Object.keys(STATE)
            .map(key => STATE[key])
            .filter(tab => parseInt(tab.TabId) === -1 && parseInt(tab.ParentTabId) === 0)[0];

        const children = Object.keys(STATE)
            .map(key => STATE[key])
            .filter(tab => parseInt(tab.ParentTabId) === -1);
        this.RootTab.ChildTabs = children;
    }

    _update() {
        this.setMasterRootCheckedState();
        const contexts = context.concat(rootContext);
        contexts.forEach(ref => this.forceUpdate.call(ref));
        this.export(STATE);
    }

    _getState() {
        return this.state;
    }

    _log(msg) {
        this.debug ? console.log(msg) : null;
    }

    _hasChildren = (tab) => {
        const bool = "HasChildren" in tab && !!tab.HasChildren ? true : false;
        return bool;
    }

    _noChildren = (tab) => {
        const bool = "HasChildren" in tab && !!tab.HasChildren === false && tab.ChildTabs.length === 0;
        return bool;
    }

    _notTopLevel = (tab) => {
        const bool = "ParentTabId" in tab && parseInt(tab.ParentTabId) !== -1;
        return bool;
    }

    _isOpen = (tab) => {
        const bool = "IsOpen" in tab && !!tab.IsOpen ? true : false;
        return bool;
    }

    _getTabById = (TabId) => {
        return Object.keys(STATE)
            .map(key => STATE[key])
            .filter(tab => parseInt(tab.TabId) === parseInt(TabId));
    }

    _getRootTab = (TabId) => {
        let tab = this._getTabById(TabId)[0];
        const condition = (tab) => parseInt(tab.ParentTabId) !== -1;

        const loop = () => {
            TabId = tab.ParentTabId;
            tab = this._getTabById(TabId)[0];
            condition(tab) ? loop() : exit();
        };

        const exit = () => tab;

        loop();
        return tab;
    }

    _setParentTabChildrenSelected = (tab) => {
        console.log("set parent tab selected");
        const Left = () => {
            let ParentTabId = tab.ParentTabId;
            let parent = this._getTabById(ParentTabId)[0];
            const truthyCheckedStates = [];
            const AreChildrenChecked = (tab) => tab.CheckedState ? truthyCheckedStates.push(true) : truthyCheckedStates.push(false);
            this._mapChildTabs(parent, AreChildrenChecked);

            const truthyLength = truthyCheckedStates.filter(bool => !!bool).length;
            const allChildrenSelected = (truthyLength === truthyCheckedStates.length);
            const someChildrenSelected = (truthyCheckedStates.indexOf(true) !== -1);
            const noChildrenSelected = (truthyLength === 0);

            switch (true) {
                case allChildrenSelected:
                    console.log("all children selected");
                    parent.CheckedState = parent.CheckedState === 0 ? 2 : parent.CheckedState;
                    return;

                case someChildrenSelected:
                    console.log("some children selected");
                    parent.CheckedState = parent.CheckedState ? 1 : 0;
                    parent.ChildrenSelected = true;
                    return;

                case noChildrenSelected:
                    console.log("no children selected");
                    parent.CheckedState = parent.CheckedState ? 1 : 0;
                    parent.ChildrenSelected = false;
                    return;

                default:
                    console.log("default called");
                    return;
            }
        };

        const Right = () => {
            let ParentTabId = tab.ParentTabId;
            let parent = this._getTabById(ParentTabId)[0];
            delete parent.ChildrenSelected;
        };
        parseInt(tab.ParentTabId) !== -1 ? Left() : Right();
    }

    _setRootTabChildrenSelected = (tab) => {
        console.log("set root tab selected");
        const Left = () => {
            const TabId = tab.TabId;
            const RootTab = this._getRootTab(TabId);
            const truthyCheckedStates = [];
            const AreChildrenChecked = (tab) => tab.CheckedState ? truthyCheckedStates.push(true) : truthyCheckedStates.push(false);
            this._mapChildTabs(RootTab, AreChildrenChecked);

            const truthyLength = truthyCheckedStates.filter(bool => !!bool).length;
            const allChildrenSelected = (truthyLength === truthyCheckedStates.length);
            const someChildrenSelected = (truthyCheckedStates.indexOf(true) !== -1);
            const noChildrenSelected = (truthyLength === 0);

            switch (true) {
                case allChildrenSelected:
                    console.log("all children selected");
                    RootTab.CheckedState = 2;
                    RootTab.ChildrenSelected = true;
                    return;

                case someChildrenSelected:
                    console.log("some children selected");
                    RootTab.CheckedState = RootTab.CheckedState ? 1 : 0;
                    RootTab.ChildrenSelected = true;
                    return;

                case noChildrenSelected:
                    console.log("no children");
                    RootTab.CheckedState = RootTab.CheckedState ? 1 : 0;
                    RootTab.ChildrenSelected = false;
                    return;

                default:
                    console.log("default called");
            }
        };

        const Right = () => {
            console.log("In Root Right");
            tab.ChildrenSelected = false;
        };
        tab.ParentTabId !== -1 ? Left() : Right();
    }

    _mapChildTabs = (tab, fn) => {
        let ChildTabs = tab.ChildTabs;
        const cached_ChildTabs = [];
        const loop = () => {
            ChildTabs.forEach(tab => {
                fn(tab);
                tab.HasChildren ? cached_ChildTabs.push(tab.ChildTabs) : null;
                const left = () => {
                    ChildTabs = cached_ChildTabs.shift();
                    loop();
                };
                const right = () => null;
                cached_ChildTabs.length > 0 ? left() : right();
            });
        };
        loop();
        return;
    }

    _generateListItem = (tab) => {
        const bullet = this.render_ListBullet(tab, this.showChildTabs.bind(this, tab));
        const checkbox = this.render_ListCheckbox(tab);
        const list_item = this.render_ListItem(tab);

        const width = styles.width(100);
        const textLeft = styles.textAlign("left");
        const padding = styles.padding({ all: 0 });

        return (
            <li
                key={`${tab.TabId}-${tab.Name}`}
                style={merge(width, padding, textLeft)} >
                {bullet}
                {checkbox}
                {list_item}
            </li>
        );
    }

    _setChildCheckedState = (tab) => {
        console.log("set Child State");
        const TabIdName = `${tab.TabId}-${tab.Name}`;
        const state = Object.assign({}, STATE);
        tab.CheckedState = !tab.CheckedState;
        tab.CheckedState = tab.CheckedState ? 1 : 0;
        state[TabIdName].CheckedState = tab.CheckedState ? 1 : 0;
        STATE = state;

        parseInt(tab.ParentTabId) !== -1 ? this._setChildrenSelectedIndicator(tab.ParentTabId) : null;
        this._setRootTabChildrenSelected(tab);
        this._setParentTabChildrenSelected(tab);

        //console.log(STATE);
        this._update();
    }

    _openTabs = (tab) => {
        console.log("in open tabs");
        const ParentTabIdName = `${tab.TabId}-${tab.Name}`;
        tab.IsOpen = true;
        tab.CheckedState = tab.CheckedState === 2 ? 0 : tab.CheckedState;
        tab.CheckedState = tab.CheckedState === 1 ? 0 : tab.CheckedState;
        tab.CheckedState = tab.CheckedState === 0 && tab.HasChildren ? 2 : tab.CheckedState;
        tab.CheckedState = tab.CheckedState === 0 && tab.ChildTabs.Length === 0 ? 1 : tab.CheckedState;

        const ParentState = {};
        const parent = ParentState[ParentTabIdName] = Object.assign({}, tab);

        parent.CheckedState = parent.HasChildren ? 2 : 0;
        parent.ChildrenSelected = parent.HasChildren ? true : null;

        const isSingular = parent.HasChildren === false;
        const singularCheckState = () => parent.CheckedState = parent.HasChildren ? 1 : 0;
        const ParentCheckedState = () => parent.CheckedState = parent.HasChildren ? 2 : 0;

        isSingular ? singularCheckState() : ParentCheckedState();

        let ChildStates = {};
        const openAllChildTabs = (tab) => tab.IsOpen = true;
        const parentShowIndicators = (tab) => tab.HasChildren ? tab.ChildrenSelected = true : tab.ChildrenSelected = false;
        const toggleCheckAllChildtabs = (tab) => tab.CheckedState = tab.HasChildren ? 2 : 1;
        const setState = (tab) => ChildStates[`${tab.TabId}-${tab.Name}`] = tab;

        this._mapChildTabs(tab, openAllChildTabs);
        this._mapChildTabs(tab, toggleCheckAllChildtabs);
        this._mapChildTabs(tab, parentShowIndicators);
        this._mapChildTabs(tab, setState);

        const updates = Object.assign({}, ParentState, ChildStates);
        Object.keys(updates).forEach(key => STATE[key] = updates[key]);

        this._setRootTabChildrenSelected(tab);
        this._setParentTabChildrenSelected(tab);

        console.log(STATE);
        this._update();
    }

    _setParentCheckedState = (tab) => {
        console.log("in parent check update");
        tab.CheckedState = tab.CheckedState === 2 ? 0 : tab.CheckedState;
        tab.CheckedState = tab.CheckedState === 1 ? 0 : tab.CheckedState;
        tab.CheckedState = tab.CheckedState === 0 ? 2 : tab.CheckedState;

        tab.ChildrenSelected = true;
        const ParentTabIdName = `${tab.TabId}-${tab.Name}`;
        const ParentState = {};
        ParentState[ParentTabIdName] = Object.assign({}, tab);
        ParentState[ParentTabIdName].CheckedState = 2;

        let ChildStates = {};
        const openAllChildTabs = (tab) => tab.IsOpen = true;
        const parentShowIndicators = (tab) => tab.HasChildren ? tab.ChildrenSelected = true : tab.ChildrenSelected = false;
        const toggleCheckAllChildtabs = (tab) => tab.HasChildren ? tab.CheckedState = 2 : tab.CheckedState = 1;
        const setState = (tab) => ChildStates[`${tab.TabId}-${tab.Name}`] = tab;

        this._mapChildTabs(tab, openAllChildTabs);
        this._mapChildTabs(tab, toggleCheckAllChildtabs);
        this._mapChildTabs(tab, parentShowIndicators);
        this._mapChildTabs(tab, setState);

        const updates = Object.assign({}, ParentState, ChildStates);
        Object.keys(updates).forEach(key => STATE[key] = updates[key]);

        this._setRootTabChildrenSelected(tab);
        this._setParentTabChildrenSelected(tab);

        //console.log(STATE);
        this._update();
    }

    _setChildrenSelectedIndicator = (ParentTabId) => {
        ParentTabId = String(ParentTabId);
        const parent = this._getTabById(ParentTabId)[0];
        const TabIdName = `${parent.TabId}-${parent.Name}`;
        const update = Object.assign({}, parent);
        const state = Object.assign({}, STATE);

        const left = () => {
            memoize_lastTab = ParentTabId;
            update.ChildrenSelected = !update.ChildrenSelected;
            state[TabIdName].ChildrenSelected = update.ChildrenSelected;
            STATE = state;
            this._update();
        };

        const right = () => {
            const truthyCheckedStates = [];
            const isAllChildrenChecked = (tab) => tab.CheckedState ? truthyCheckedStates.push(true) : truthyCheckedStates.push(false);
            this._mapChildTabs(parent, isAllChildrenChecked);
            const conditional = !!truthyCheckedStates.filter(v => !!v).length === 0;
            conditional ? delete parent.ChildrenSelected : parent.ChildrenSelected = true;
        };
        memoize_lastTab !== ParentTabId || memoize_lastTab === null ? left() : right();
    }

    expandParentTab = (tab) => {

        const left = () => {
            tab.IsOpen = !tab.IsOpen;
            const Tab = Object.assign({}, tab);
            const TabIdName = `${tab.TabId}-${tab.Name}`;
            const ChildrenSelected = STATE[TabIdName].ChildrenSelected;

            STATE[TabIdName] = Tab;
            STATE[TabIdName].ChildrenSelected = ChildrenSelected;

            this._update();
        };

        const right = () => {
            this.getChildTabs(tab.TabId)
                .then(() => {
                    tab.IsOpen = !tab.IsOpen;
                    const Tab = Object.assign({}, tab);
                    const TabIdName = `${tab.TabId}-${tab.Name}`;
                    const ChildrenSelected = STATE[TabIdName].ChildrenSelected;
                    STATE[TabIdName] = Tab;
                    STATE[TabIdName].ChildrenSelected = ChildrenSelected;
                })
                .then(() => this._setParentTabChildrenSelected(tab))
                .then(() => this._setRootTabChildrenSelected(tab))
                .then(() => this._update());
        };
        tab.ChildTabs.length ? left() : right();
    }

    showChildTabs = (tab) => {
        this.expandParentTab(tab);
    }

    setCheckedState = (tab) => {
        if (tab.IsOpen && tab.CheckedState) {
            console.log("in reset");
            tab.CheckedState = 0;
            parseInt(tab.ParentTabId) === -1 ? delete tab.ChildrenSelected : null;

            const TabIdName = `${tab.TabId}-${tab.Name}`;
            STATE[TabIdName].CheckedState = 0;

            this._setRootTabChildrenSelected(tab);
            this._setParentTabChildrenSelected(tab);
            this._update();
            return;
        }

        const isParent = this._hasChildren(tab);
        const isOpen = this._isOpen(tab);
        const notTopLevel = this._notTopLevel(tab);
        const noChildren = this._noChildren(tab);

        const Left = () => isParent ? this._setParentCheckedState(tab) : this._setChildCheckedState(tab);
        const Right = () => this._openTabs(tab);

        isOpen || noChildren && notTopLevel ? Left() : Right();
    }


    render_icon = (direction) => {
        const width = styles.width(100);
        const animate = direction === "90deg" ? true : false;

        const render = (
            <div style={merge(width)}>
                <this.icon animate={animate} reset={false} direction={direction} />
            </div>
        );
        return render;
    }

    render_Bullet = (tab) => {
        const conditional = this._hasChildren(tab);
        const direction = tab.IsOpen && tab.ChildTabs.length ? "90deg" : "0deg";
        const render = (conditional ? this.render_icon(direction) : () => null);
        return render;
    }

    render_ListBullet = (tab, fn) => {
        const bullet = (() => {
            const width = styles.width(20, "px");
            const height = styles.height(20, "px");
            const padding = styles.padding({ top: 3 });

            return (
                <div
                    onClick={() => fn()}
                    style={merge(floatLeft, padding, width, height)}>
                    {this.render_Bullet(tab)}
                </div>);
        })();
        return bullet;
    }

    render_ListCheckbox = (tab) => {
        const checkbox = (() => {
            const padding = styles.padding({ top: 6 });
            return (
                <div style={merge(floatLeft, padding)}>
                    <input
                        type="checkbox"
                        onChange={() => this.setCheckedState(tab)}
                        checked={tab.CheckedState}
                    />
                </div>);
        })();
        return checkbox;
    }

    render_ChildrenSelectedIndicator = (tab) => {
        const TabIdName = `${tab.TabId}-${tab.Name}`;
        const tabState = STATE[TabIdName];
        const condition = typeof tabState === "object" && "ChildrenSelected" in tabState && tabState.ChildrenSelected;
        const template = (condition ? <span>*</span> : <span></span>);
        const indicator = (() => {
            return (
                template
            );
        })();
        return indicator;
    }

    render_ListItem = (tab) => {
        const TabId = tab.TabId;
        const pageName = tab.Name;
        const list_item = (() => {
            const padding = styles.padding({ all: 6 });
            return (
                <div
                    style={merge(inlineBlock, padding)}
                    key={TabId + "listItem"}
                >
                    {pageName}
                </div>);
        })();
        return list_item;
    }

    render_li(childtab) {
        const render = (childtab) => childtab.map((tab) => {
            const textLeft = styles.textAlign("left");
            const padding = styles.padding({ left: 20 });
            const childrenSelectedIndicator = this.render_ChildrenSelectedIndicator(tab);
            const bullet = this.render_ListBullet(tab, this.showChildTabs.bind(this, tab));
            const checkbox = this.render_ListCheckbox(tab);
            const list_item = this.render_ListItem(tab);

            return (
                <li
                    key={shortid.generate()}
                    style={merge(textLeft, padding)}
                >
                    {bullet}
                    {checkbox}
                    {list_item}
                    {childrenSelectedIndicator}
                    {tab.HasChildren && tab.IsOpen ?
                        <PagePickerDesktop
                            root={this.root}
                            setMasterRootCheckedState={this.setMasterRootCheckedState}
                            rootContext={rootContext}
                            export={this.export.bind(this)}
                            tabs={tab.ChildTabs}
                            getChildTabs={this.getChildTabs}
                        />
                        : <span></span>}
                </li>
            );
        });
        return render(childtab);
    }

    render() {
        const { tabs } = this.props;
        const listStyle = styles.listStyle();
        const padding = styles.padding({ left: 20 });
        return (
            <ul style={merge(listStyle, padding)}>
                {this.render_li(tabs)}
            </ul>
        );

    }
}

PagePickerDesktop.propTypes = {
    flatTabs: PropTypes.object.isRequired,
    tabs: PropTypes.object.isRequired,
    setMasterRootCheckedState: PropTypes.func.isRequired,
    rootContext: PropTypes.object.isRequired,
    root: PropTypes.object.isRequired,
    icon_type: PropTypes.object.isRequired,
    export: PropTypes.func.isRequired,
    getChildTabs: PropTypes.func.isRequired
};