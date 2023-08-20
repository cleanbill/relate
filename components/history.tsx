import { useState } from "react";
import { TitleData, Field } from "../app/model";
import { showDate } from "../utils/renderHelper";

interface HistoryProps { titleData: TitleData, overrideFields: Function, updateTitleData: Function };

const History = (props: HistoryProps) => {

    let singleKey = props.titleData.sessions.single ? 'single' : '';

    const [selected, setSelected] = useState("no date mark yet");


    const selectDateMark = (mark: string, editable = false) => {
        const fieldDefs = props.titleData.sessions[mark].fields || [];
        setSelected(mark)
        props.overrideFields(fieldDefs, mark, editable);
    }

    const del = (key: string) => {
        console.log('delete', key);
        props.updateTitleData(key);
    }

    const getValueAndIndents = (field: Field): string => {
        if (!field) {
            return "";
        }
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
            console.log(key, ' session no single', props);
            return undefined;
        }
        if (!props.titleData.sessions[key].fields[0].list) {
            console.log(key, ' session first field has no list', props);
            return undefined;
        }
        return props.titleData.sessions[key].fields[0].list;
    }

    const possibleList = getList();
    const list = possibleList == undefined ? [] : possibleList;

    const keys = Object.keys(props?.titleData?.sessions);
    const todo = props.titleData.sessions[singleKey]?.group == 'todo';
    return (
        <div >
            {list.filter((field: Field) => field.fieldName?.trim().length > 0).map((field: Field, index: number) => (
                <div className="w-100 mt-4 text-left h-auto" key={index}>

                    <div className="grid grid-cols-[11fr,1fr] w-full h-auto">

                        <button onClick={() => selectDateMark(singleKey)}>
                            <p className="text-left text-ellipsis">{getValueAndIndents(field)}</p>
                        </button>
                        {!todo && <button onClick={() => del(singleKey)} className="butt mb-10 w-6 h-5 bg-blue-100 left-11">X</button>}
                    </div>
                </div>
            ))}
            <div className="h-auto grid grid-cols-[12fr,0fr] ">
                {!props.titleData.singleton && keys.map((key: string, i: number) => (
                    <> 
                        <button key={i} onClick={() => selectDateMark(key, keys.length-1 == i)} 
                        title={key+' has '+props.titleData.sessions[key].fields.length+' fields'}
                        className={selected==key?"whitespace-nowrap h-10 font-bold text-left text-cyan-500":"whitespace-nowrap h-10 text-left hover:text-cyan-500"}>{showDate(key)}</button>
                        {!todo && <button onClick={() => del(key)} className="float-right butt mb-10 w-6 h-5 bg-blue-100 left-11">X</button>}
                    </>))}
            </div>
        </div>
    )
}

export default History;