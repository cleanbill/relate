import { useState } from "react";
import { useEffect } from "react";
import { TitleData, Field } from "../app/model";
import { showDate } from "../utils/renderHelper";

interface HistoryState { titleData: TitleData, keys: Array<string>, selected: string };
interface HistoryProps { titleData: TitleData, overrideFields: Function, updateTitleData: Function };

const History = (props: HistoryProps) => {

    useEffect(() => {
        resetState(props);
    }, [props])

    const [state, setState] = useState({
        titleData: { titleName: 'No History', sessions: {} },
        keys: new Array(),
        selected: '',
    } as HistoryState);

    const resetState = (props: HistoryProps) => {
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
        delete state.titleData.sessions[key];
        Object.keys(state.titleData.sessions).filter(mark => mark != key);
        props.updateTitleData(key);
    }


    const getIndents = (field: Field) => {
        const indents = [];
        for (let i = 0; i < field.indent; i++) {
            indents.push('\t');
        }
        return indents;
    }


    return (
        <div >
            {props.titleData.singleton
                && props.titleData.sessions['single']
                && props.titleData.sessions['single'].fields[0].list
                && props.titleData.sessions['single'].fields[0].list.map((field: Field, index: number) => (
                    <div className="w-100 mt-4 text-left" key={index}>

                        <div className="grid grid-cols-[11fr,1fr] h-4">
                            <span>
                                {getIndents(field).map((t,i) => <div key={i}>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</div>)}
                                <button onClick={() => show('single')} className="whitespace-nowrap text-left h-10">{field.value}</button>
                            </span>
                            <button onClick={() => del('single')} className="butt mb-10 w-6 h-5 bg-blue-100">X</button>
                        </div>
                    </div>
                ))}
            {!props.titleData.singleton && state?.keys && state.keys.map((key: string, i:number) => (
                <div className="w-100 mt-4" key={i}>

                    <div className="grid grid-cols-[11fr,1fr] h-4">
                        <button onClick={() => show(key)} className="whitespace-nowrap h-10">{showDate(key)}</button>
                        {/* <button onClick={() => del(key)} className="butt mb-10 w-6 h-5 bg-red-400">X</button> */}
                    </div>
                </div>
            ))}
        </div>
    )
}

export default History;