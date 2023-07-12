import { useState } from "react";
import { useEffect } from "react";
import { TitleData, Field } from "../app/model";
import { showDate } from "../utils/renderHelper";

interface HistoryState { titleData: TitleData, keys: Array<string>, selected: string };
interface HistoryProps { titleData: TitleData, overrideFields: Function, updateTitleData: Function };

const History = (props: HistoryProps) => {

    let singleKey = props.titleData.sessions.single ? 'single' : '';

    useEffect(() => {
        resetState(props);
    }, [props])

    const [state, setState] = useState({
        titleData: { titleName: 'No History', sessions: {} },
        keys: new Array(),
        selected: '',
    } as HistoryState);

    const resetState = (props: HistoryProps) => {
        singleKey = props.titleData.sessions.single ? 'single' : '';
        const sessions = props.titleData.sessions;
        if (!sessions) {
            return;
        }
        const keys = Object.keys(sessions) as Array<string>;
        setState(() => ({ titleData: props.titleData, keys, selected: '' }));
    }

    const show = (key: string) => {
        const selected = (key == state.selected) ? "" : key;
        setState((pre: HistoryState) => ({ titleData: pre.titleData, keys: pre.keys, selected }));
        const fieldDefs = state.titleData.sessions[key].fields;
        props.overrideFields(fieldDefs, key);
    }

    const del = (key: string) => {
        console.log('delete',key);
        delete state.titleData.sessions[key];
        Object.keys(state.titleData.sessions).filter(mark => mark != key);
        props.updateTitleData(key);
    }

    const getValueAndIndents = (field: Field) => {
        const indents = [];
        for (let i = 0; i < field.indent; i++) {
            indents.push('>');
        }
        indents.push(' ' + field.value);
        return indents.join('');
    }


    const getList = (): Field[] | undefined => {
        if (!props.titleData.singleton) {
            console.log('not singleton', props);
            return undefined;
        }
        const key = singleKey;
        if (!props.titleData.sessions[key]) {
            console.log('session no single', props);
            return undefined;
        }
        if (!props.titleData.sessions[key].fields[0].list) {
            console.log('session first field has no list', props);
            return undefined;
        }
        return props.titleData.sessions[key].fields[0].list;
    }

    const possibleList = getList();
    const list = possibleList == undefined ? [] : possibleList;

    return (
        <div >
            {list.map((field: Field, index: number) => (
                <div className="w-100 mt-4 text-left h-auto" key={index}>

                    <div className="grid grid-cols-[11fr,1fr] w-full h-auto">

                        <button onClick={() => show(singleKey)}>
                            <p className="text-left text-ellipsis">{getValueAndIndents(field)}</p>
                        </button>
                        {props.titleData.sessions[singleKey].group != 'todo' && <button onClick={() => del(singleKey)} className="butt mb-10 w-6 h-5 bg-blue-100 left-11">X</button>}
                    </div>
                </div>
            ))}
            <div className="h-auto grid grid-cols-1 ">
                {!props.titleData.singleton && state?.keys && state.keys.map((key: string, i: number) => (
                    <button key={i} onClick={() => show(key)} className="whitespace-nowrap h-10 text-left">{showDate(key)}</button>
                ))}
            </div>
        </div>
    )
}

export default History;