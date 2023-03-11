import { useState } from "react";
import { useEffect } from "react";
import { GroupData, TitleData } from "../app/model";
import History from '../components/history';

interface GroupsState { groups: Array<GroupData>, selectedTitle: string, selectedGroup: string | null };
interface GroupsProps {
    groups: Array<GroupData>, selectedTitle: string, selectedGroup: string | null
    , select: Function, overrideFields: Function, updateTitleData: Function
};

// change have inbedded history

const Groups = (props: GroupsProps) => {

    const [state, setState] = useState({ groups: props.groups, selectedTitle: "", selectedGroup: null } as GroupsState);

    useEffect(() => {
        setState({ groups: props.groups, selectedTitle: props.selectedTitle, selectedGroup: props.selectedGroup });
    }, [props]);

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

    const showHistory = (td:TitleData): boolean =>{
        if (td.singleton && td.titleName != state.selectedTitle){
            return true;
        }
        if (!td.singleton && td.titleName == state.selectedTitle){
            return true;
        }

        return false;
    }

    const baseClass = "p-5 font-light border border-b-0 border-gray-200 dark:border-gray-700 dark:bg-yellow-900";

    return (
        <>
            <h5 className=" mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Groups and Titles</h5>
            <div className="font-normal text-gray-700 dark:text-gray-400">
                {state.groups.map((gd: GroupData, index: number) => (
                    <div key={index}>
                        <button onClick={() => toggle(index)} type="button" className="flex items-center justify-between w-full p-5 font-medium text-left border border-b-0 border-gray-200 rounded-t-xl focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-800 dark:border-gray-700 hover:bg-yellow-600 dark:hover:bg-gray-800 bg-yellow-400 dark:bg-gray-800 text-gray-900 dark:text-white">
                            <span className={gd.display ? 'text-white': 'text-stone-700'}>{gd.groupName}</span>
                        </button>
                        {gd.display &&
                            Object.keys(gd.titles).map((key: string, i: number) => (

                                <div key={key} id={'selected-' + i}  className={baseClass} >
                                    <div className="mb-2 text-gray-500 dark:text-gray-400">
                                        {gd.titles[key].titleName == state.selectedTitle && (<span></span>)}
                                        <span className={gd.titles[key].titleName == state.selectedTitle? 'font-bold': ""} onClick={() => selectTitle(gd, gd.titles[key].titleName)}>{i + 1} . {gd.titles[key].titleName} </span>
                                        { showHistory(gd.titles[key]) && (
                                            <History 
                                            titleData={gd.titles[key]} 
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