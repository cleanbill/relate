import { useState } from "react";
import { Field, GroupData, Session, TitleData } from "../app/model";
import GroupTitle from "./groupTitle";
import TodoGroup from "./todoGroups";

interface GroupsProps {
    groups: Array<GroupData>, selectedTitleIndex: number, selectedGroupIndex: number
    , select: Function, overrideFields: Function, updateTitleData: Function, deleteGroup: Function,
    deleteTitle: Function, toggleShow: Function
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

const determineScroll = (state: any, props: GroupsProps) => {
    if (!props.selectedTitleIndex || !props.selectedGroupIndex ||
        !state.selectedTitle || !state.selectedGroup) {
        return false;
    }
    // if (props.selectedTitleIndex.indexOf(state.selectedTitle) > -1){
    //     return false;
    // }
    return state.selectedGroup != props.selectedGroupIndex || state.selectedTitle != props.selectedTitleIndex;
}

const Groups = (props: GroupsProps) => {

    const [showGroupIndex, setShowGroupIndex] = useState(0);


    const deleteGroup = (index: number) => {
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

    const deleteTitle = (groupIndex: number, titleIndex: number) => {
        props.deleteTitle(groupIndex, titleIndex);
    }


    const selectTitle = (groupDataIndex: number, titleIndex: number): void => {
        setShowGroupIndex(groupDataIndex);
        props.select(groupDataIndex, titleIndex);
    }

    const showHistory = (td: TitleData, selected: boolean): boolean => {
        if (td.singleton && !selected) {
            return true;
        }
        if (!td.singleton && selected) {
            return true;
        }

        return false;
    }

    const display = (index: number): boolean => showGroupIndex == index;
    const toggle = (index: number, e: null | Event): void => {
        e?.stopPropagation();
        if (index === showGroupIndex) {
            setShowGroupIndex(-1);
        } else {
            setShowGroupIndex(index);
            selectTitle(index, 0);
        }
    }

    const toggleShow = (e: null | MouseEvent): void => {
        e?.stopPropagation();
        props.toggleShow();
    }

    type Matcher = (haystack:string) => boolean;

    const matchSetup = (needle: string): Matcher => {
        if (!needle) {
            return (s: string) => false;
        }
        return (haystack: string):boolean => {
            if (!haystack){
                return false;
            }
            return (haystack+'').toLowerCase().indexOf(needle.toLowerCase()) > -1;
        }
    }

    const search = (inputElement: HTMLInputElement) => {
        const match = matchSetup(inputElement.value);
        props.groups.forEach((gd: GroupData, groupDataIndex:number) => {
            // if (match(gd.groupName)) {
            //     console.log('group name found ', gd.groupName);
            // }
            gd.titles.forEach((td: TitleData, titleIndex:number) => {
                if (match(td.titleName)) {
                    // console.log('title name found ', td.titleName);
                    selectTitle(groupDataIndex,titleIndex);
                }
                // const sessions = Object.values(td.sessions);
                // sessions.forEach((session: Session) => {
                //     session.fields.forEach((field: Field) => {
                //         if (match(field.fieldName)) {
                //             console.log('fieldname found ', field);
                //         }
                //         if (match(field.fieldType)) {
                //             console.log('fieldType found ', field);
                //         }
                //         if (match(field.value)) {
                //             console.log('fieldValue found ', field);

                //         }
                //     });
                // });

            });

        })
    }

    return (
        <>
            <h5 title={'Group ' + props.selectedGroupIndex + '. Title ' + props.selectedTitleIndex} className=" mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white ">
                Groups and Titles
                <button onClick={(e: any) => toggleShow(e)} className="z-10 float-right butt mb-10 w-6 h-5 bg-blue-100">
                    <span>X</span> </button>
            </h5>
            <input onChange={e => search(e.target)}
                id='search-input'
                defaultValue=''
                type='text'
                placeholder="Search"
                className="bg-gray-50 mb-4 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block lg:w-full sg:w-56 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required />
            <div className="font-normal text-gray-700 dark:text-gray-400">
                {props.groups.map((gd: GroupData, groupIndex: number) => (
                    gd &&
                    <div key={groupIndex}>

                        {gd.groupName != 'todo' &&
                            <div className="tabhead">
                                <span title={gd.groupName + " group has " + gd.titles.length + " titles"} onClick={(e: any) => toggle(groupIndex, e)} className='text-stone-700 w-full pt-1 pl-3'>{gd.groupName}
                                    <button title={'Delete ' + gd.groupName} className="float-right mr-4 bg-white rounded-xl w-8 " onClick={() => deleteGroup(groupIndex)}>X</button>
                                </span>
                            </div>}

                        {gd.groupName == 'todo' &&
                            <TodoGroup toggle={(e: MouseEvent) => toggle(groupIndex, null)} selectTitle={(dayIndex: number) => selectTitle(groupIndex, dayIndex)} />}

                        {display(groupIndex) &&
                            gd.titles.map((titleData: TitleData, titleIndex: number) => (
                                <GroupTitle
                                    key={titleIndex}
                                    titleData={titleData}
                                    deletable={gd.groupName != 'todo'}
                                    selectTitle={() => selectTitle(groupIndex, titleIndex)}
                                    showHistory={showHistory(titleData, titleIndex == props.selectedTitleIndex)}
                                    overrideFields={props.overrideFields}
                                    updateTitleData={props.updateTitleData}
                                    deleteTitle={() => deleteTitle(groupIndex, titleIndex)}
                                    i={titleIndex}
                                    selected={titleIndex == props.selectedTitleIndex} />
                            ))}
                    </div>
                ))}
            </div>
        </>
    )

}


export default Groups;