import { useState } from "react";
import { useEffect } from "react";
import { GroupData, TitleData } from "../app/model";
import History from '../components/history';

interface GroupsState { groups: Array<GroupData>, selectedTitle: string, selectedGroup: string | null };
interface GroupsProps {
    groups: Array<GroupData>, selectedTitle: string, selectedGroup: string | null
    , select: Function, overrideFields: Function, updateTitleData: Function, deleteGroup: Function,
    toggleShow: Function
};

const Groups = (props: GroupsProps) => {

    const [state, setState] = useState({ groups: props.groups, selectedTitle: "", selectedGroup: null } as GroupsState);
    const [show, setShow] = useState(true);

    useEffect(() => {
        const groups = updateGroups(props.groups, props.selectedGroup, props.selectedTitle);
        setState({ groups, selectedTitle: props.selectedTitle, selectedGroup: props.selectedGroup });
    }, [props]);

    const updateTitle = (titles: Array<TitleData>, titleName: string) => {
        const titleIndex = titles.length == 1 && !titles[0].titleName ? 0 :
            titles.findIndex((td: TitleData) => titleName.indexOf(td.titleName) > -1 || td.titleName.indexOf(titleName) > -1);
        if (titleIndex > -1) {
            titles[titleIndex].titleName = titleName;
            return titles;
        }
        const newTitle: TitleData = {
            titleName,
            singleton: false,
            sessions: {}
        };
        titles.push(newTitle);
        return titles;
    }

    const updateGroups = (groups: GroupData[], groupName: string | null, titleName: string) => {
        if (!groupName) {
            return groups;
        }
        const group = groups.find((gp: GroupData) => (props.selectedGroup && props.selectedGroup.indexOf(gp.groupName) > -1));
        if (groupName.length == 1 && group == undefined) {
            const newGroup = generateGroup(groupName, titleName);
            groups.push(newGroup);
            toggle(groups.length - 1);
            return groups;
        }
        if (group == undefined) {
            return groups;
        }
        group.groupName = props.selectedGroup ? props.selectedGroup : group.groupName;
        if (group.titles.length > 0 && (!selectTitle || !titleName)) {
            return groups;
        }
        group.titles = updateTitle(group.titles, titleName);
        const newGroups = groups.map((gd: GroupData) => (group.groupName == gd.groupName) ? group : gd);
        return newGroups;
    }

    const generateGroup = (groupName: string, titleName: string) => {
        const title: TitleData = {
            titleName,
            singleton: false,
            sessions: {}
        };
        return {
            groupName,
            titles: [title],
            display: false
        } as GroupData;
    }

    const deleteGroup = (index: number) => {
        const groups = state.groups.filter((g: GroupData, i: number) => i != index);
        setState(old => ({ groups, selectedTitle: old.selectedTitle, selectedGroup: old.selectedGroup }));
        props.deleteGroup(index);
    }

    const findNextSelectedTitle = (g: GroupData, titleName: string) => {
        if (g.titles.length == 1) {
            return "";
        }
        const titleIndex = g.titles.findIndex((td: TitleData) => td.titleName != titleName);
        if (titleIndex == -1) {
            return "";
        }
        const selectedTitleIndex = titleIndex == 0 ? g.titles.length - 1 : titleIndex - 1;
        const selectedTitleData = g.titles[selectedTitleIndex];
        if (!selectedTitleData) {
            return "";
        }
        return selectedTitleData.titleName;
    }

    const deleteTitle = (groupNo: number, titleName: string) => {
        let newSelectedTitle = "";
        const groups = state.groups.map((g: GroupData, i: number) => {
            if (i != groupNo) {
                return g;
            }
            newSelectedTitle = findNextSelectedTitle(g, titleName);
            props.select(g, selectTitle);
            g.titles = g.titles.filter((td: TitleData) => td.titleName != titleName);
            return g;
        });
        setState(old => ({ groups, selectedTitle: newSelectedTitle, selectedGroup: old.selectedGroup }));
    }

    const toggle = (index: number): void => {
        const groups = state.groups.map((grp: GroupData, i: number) => {
            grp.display = (i == index) ? !grp.display : grp.display;
            return grp;
        });
        console.log('toggle');
        setState(old => ({ groups, selectedTitle: old.selectedTitle, selectedGroup: old.selectedGroup }));
    }

    const selectTitle = (gd: GroupData, title: string): void => {
        console.log('Selecting ' + title);
        props.select(gd, title);
        setState((prev: GroupsState) => ({
            groups: prev.groups,
            selectedTitle: title,
            selectedGroup: gd.groupName
        }))
    }

    const showHistory = (td: TitleData): boolean => {
        if (td.singleton && td.titleName != state.selectedTitle) {
            return true;
        }
        if (!td.singleton && td.titleName == state.selectedTitle) {
            return true;
        }

        return false;
    }

    const baseClass = "p-5 font-light border border-b-0 border-gray-200 dark:border-gray-700 dark:bg-blue-300";

    return (
        <>
            <h5 className=" mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                Groups and Titles
                <button onClick={() => props.toggleShow()} className="z-10 float-right butt mb-10 w-6 h-5 bg-blue-100">
                    <span>X</span> </button>
            </h5>
            <div className="font-normal text-gray-700 dark:text-gray-400">
                {state.groups.map((gd: GroupData, index: number) => (
                    gd && <div key={index}>
                        <div onClick={() => toggle(index)} className="flex items-center justify-between w-full p-5 font-medium text-left border border-b-0 border-gray-200 rounded-t-xl focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-800 dark:border-gray-700 hover:bg-yellow-600 dark:hover:bg-gray-800 bg-blue-300 dark:bg-gray-800 text-gray-900 dark:text-white">
                            <span className={gd.display ? 'text-white w-full' : 'text-stone-700 w-full'}>{gd.groupName}
                                <button onClick={() => deleteGroup(index)} className="z-10 float-right butt mb-10 w-6 h-5 bg-blue-100">X</button>
                            </span>
                        </div>
                        {gd.display &&
                            gd.titles.map((titleData: TitleData, i: number) => (

                                <div key={titleData.titleName} id={'selected-' + i} className={baseClass} >
                                    <div className="mb-2 text-gray-500 dark:text-gray-400">
                                        {titleData.titleName == state.selectedTitle && (<span></span>)}
                                        <span className={titleData.titleName == state.selectedTitle ? 'font-bold' : ""} onClick={() => selectTitle(gd, titleData.titleName)}>{i + 1} . {titleData.titleName} </span>
                                        <button onClick={() => deleteTitle(index, titleData.titleName)} className="z-10 float-right butt mb-10 w-6 h-5 bg-blue-100">X</button>

                                        {showHistory(titleData) && (
                                            <History
                                                titleData={titleData}
                                                overrideFields={props.overrideFields}
                                                updateTitleData={props.updateTitleData} ></History>
                                        )}
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                ))}
            </div>
        </>
    )

}

export default Groups;