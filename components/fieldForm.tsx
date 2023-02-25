import { useEffect, useState } from "react";
import { Field, FieldComponentType } from "../app/model";
import { showDate } from "../utils/renderHelper";
import ExtendableTextList from "./extendableTextList";
import Happy from "./happy";

interface FieldFormState { title: string, fields: Array<Field>, mark: string };
interface FieldFormProps {
    title: string, fields: Array<Field>, mark: string,
    updateFieldData: Function,
    saveData: Function,
    next: Function
};

const FieldForm = (props:FieldFormProps) => {

    const [state, setState] = useState({ title: props.title, fields: props.fields, mark: props.mark } as FieldFormState );

    const clearETL = (field:Field) => {
        if (!field.list){
            return;
        }
        field.list = field.list.map(field =>{
            field.value = '';
            return field;
        });
    }

    const clearData = (field:Field, index: number) =>{
        if (field.fieldComponentType = FieldComponentType.ETL){
            clearETL(field);
            return;
        } 
        props.updateFieldData(index, "");
        const fieldElement = document.getElementById('fieldData-' + index) as HTMLInputElement;
        fieldElement.value = '';
        fieldElement.defaultValue = '';
        const event = new Event("change");
        fieldElement.dispatchEvent(event);
    }

    const clearAllData = () => {
        for (var index = 0; index < state.fields.length; index++) {
          clearData(state.fields[index], index);
        }
        setState(old => ({ title: old.title, fields: [... old.fields], mark: old.mark }));
    }

    const moveToNext = (field:Field) =>{
        props.next(field);
    }

    const indent = (fieldIndex:number, listNo: number, tabs:number) =>{
        const field = state.fields[fieldIndex];
        const list = field.list;
        if (!list){
            return;
        }
        const updatedList = list.map((f:Field, i:number)  => {
            if (listNo != i){
                return f;
            }
            f.indent = isNaN(f.indent)? tabs: f.indent + tabs;
            return f;
        })
        field.list = updatedList;
        const fields = state.fields.map((f:Field,i:number) => {
            if (i == fieldIndex){
                return field;
            }
            return f;
        });
        setState(old => ({ title: old.title, fields: [... fields], mark: old.mark }));
    }

    useEffect(() =>{
        setState(() => ({ title: props.title, fields: [... props.fields], mark: props.mark }));
    }, [props])

    return (
        <>
            {!state.title || (
                <><h5 title='fill in the form' className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{state.title} <span className="text-sm">- {showDate(state.mark)}</span></h5>
                    <div className="font-normal text-gray-700 dark:text-gray-400">
                        {state.fields.map((field, index: number) => (
                            <div key={index} className="mb-6">
                                <label title={field.value} className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">{field.fieldName} </label>
                                {field.fieldComponentType == FieldComponentType.NONE &&
                                    <input onChange={e => props.updateFieldData(index, e.target)}
                                        id={"fieldData-" + index}
                                        defaultValue={field.value}
                                        type={field.fieldType}
                                        checked={field.value == 'true'}
                                        className="b)g-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required />
                                }
                                {field.fieldComponentType == FieldComponentType.HAPPY &&
                                    <Happy id={"fieldData-" + index} onChange={(value: string) => props.updateFieldData(index, value)}
                                        defaultValue={field.value}
                                    ></Happy>
                                }
                                {field.fieldComponentType == FieldComponentType.ETL &&
                                    <ExtendableTextList indent={(listNo:number, i:number)=> indent(index,listNo, i)} next={(field:Field) => moveToNext(field)} 
                                        onChange={(value: string) => props.updateFieldData(index, value)}
                                        defaultFields={field.list || []} setFields={(fields:Array<Field>) => 
                                            props.updateFieldData(index, null, fields)}
                                    ></ExtendableTextList>
                                }
                            </div>
                        ))}
                    </div>
                    <div className="grid grid-cols-3">
                        <button type="submit" onClick={e => clearAllData()} className="butt justify-self-start">Reset</button>
                        <div></div>
                        <button type="submit" onClick={e => props.saveData()} className="butt justify-self-end">Save</button>
                    </div>
                </>)}
        </>
    )

}

export default FieldForm;