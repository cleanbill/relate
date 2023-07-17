import { MouseEventHandler, useState } from "react";
import { useEffect } from "react";
import { GroupData, TitleData } from "../app/model";
import GroupTitle from "./groupTitle";
import TodoGroup from "./todoGroups";

interface GroupsState { groups: Array<GroupData>, selectedTitle: string, selectedGroup: string | null };
interface GroupsProps {
    groups: Array<GroupData>, selectedTitle: string, selectedGroup: string | null
    , select: Function, overrideFields: Function, updateTitleData: Function, deleteGroup: Function,
    toggleShow: Function
};

export const stepArray = (titles: Array<TitleData>, index: number): Array<TitleData> => {
    if (titles.length == 0) {
        return titles;
    }
    return titles.slice(index).concat(titles.slice(0, index))
}


const changeLayout = (titles: Array<TitleData>, index: number) => {
    const doc: any = document;
    const nextIndex: number = index + 1 == titles.length ? 0 : index + 1;
    if (!doc.startViewTransition) {
        console.warn("No view transistion");
        stepArray(titles, nextIndex)
    } else {
        doc.startViewTransition(() => stepArray(titles, nextIndex));
    }
}

const determineScroll = (state:any,props:GroupsProps) =>{
    if (!props.selectedTitle || !props.selectedGroup ||
        !state.selectedTitle || !state.selectedGroup){
        return false;
    }
    if (props.selectedTitle.indexOf(state.selectedTitle) > -1){
        return false;
    }
    return state.selectedGroup != props.selectedGroup || state.selectedTitle != props.selectedTitle;
}

const Groups = (props: GroupsProps) => {

    const [state, setState] = useState({ groups: props.groups, selectedTitle: "", selectedGroup: null } as GroupsState);

    useEffect(() => {
        const scroll = determineScroll(state,props);
        const groups = updateGroups(props.groups, props.selectedGroup, props.selectedTitle, scroll);
        setState({ groups, selectedTitle: props.selectedTitle, selectedGroup: props.selectedGroup });
    }, [props]);

    const updateTitle = (titles: Array<TitleData>, titleName: string, shuffle = true) => {
        const titleIndex = titles.length == 1 && !titles[0].titleName ? 0 :
            titles.findIndex((td: TitleData) => titleName.indexOf(td.titleName) > -1 || td.titleName.indexOf(titleName) > -1);
        if (titleIndex > -1) {
            titles[titleIndex].titleName = titleName;
            const nextIndex: number = titleIndex + 1 == titles.length ? 0 : titleIndex + 1;
            return shuffle ? stepArray(titles, nextIndex) : titles;
        }
        const newTitle: TitleData = {
            titleName,
            singleton: false,
            sessions: {}
        };
        titles.push(newTitle);
        return titles;
    }

    const updateGroups = (groups: GroupData[], groupName: string | null, titleName: string, scrollUp = true) => {
        if (!groupName) {
            return groups;
        }
        if (scrollUp) {
            window.scrollTo(0, 0);
        }
        const group = groups.find((gp: GroupData) => (props.selectedGroup && props.selectedGroup.indexOf(gp.groupName) > -1));
        if (groupName.length == 1 && group == undefined) {
            const newGroup = generateGroup(groupName, titleName);
            groups.push(newGroup);
            toggle(groups.length - 1,null);
            return groups;
        }
        if (group == undefined) {
            return groups;
        }
        group.groupName = props.selectedGroup ? props.selectedGroup : group.groupName;
        if (group.titles.length > 0 && (!selectTitle || !titleName)) {
            return groups;
        }
        group.titles = updateTitle(group.titles, titleName, groupName == 'todo');
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

    const toggle = (index: number,e:null|Event): void => {
        e?.stopPropagation(); 
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

    return (
        <>
            <h5 className=" mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white ">
                Groups and Titles
                <button onClick={() => props.toggleShow()} className="z-10 float-right butt mb-10 w-6 h-5 bg-blue-100">
                    <span>X</span> </button>
            </h5>
            <div className="font-normal text-gray-700 dark:text-gray-400">
                {state.groups.map((gd: GroupData, index: number) => (
                    gd && 
                        <div key={index}>
                        
                            {gd.groupName != 'todo' && 
                                <div  className="tabhead">
                                    <span title={gd.groupName+ " group has " + gd.titles.length + " titles"} onClick={(e:any) => toggle(index,e)} className='text-stone-700 w-full pt-1 pl-3'>{gd.groupName}
                                    <button title={'Delete '+gd.groupName} className="float-right mr-4 bg-white rounded-xl w-8 " onClick={() => deleteGroup(index)}>X</button>
                                    </span>
                                </div>}
                        
                            {gd.groupName == 'todo' &&
                                <TodoGroup toggle={(e:MouseEvent) => toggle(index,e)} selectTitle={(day: string) => selectTitle(gd, day)}/>}

                            {gd.display &&
                                gd.titles.map((titleData: TitleData, i: number) => (
                                    <GroupTitle
                                    key={i}
                                        titleData={titleData}
                                        deletable={gd.groupName != 'todo'}
                                        selectTitle={() => selectTitle(gd, titleData.titleName)}
                                        showHistory={showHistory(titleData)}
                                        overrideFields={() => props.overrideFields()}
                                        updateTitleData={() => props.updateTitleData()}
                                        deleteTitle={() => deleteTitle(index, titleData.titleName)}
                                        i={i}
                                        selected={titleData.titleName == state.selectedTitle} />
                                ))}
                    </div>
                ))}
            </div>
        </>
    )

}


export default Groups;