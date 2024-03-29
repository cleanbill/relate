import { useEffect } from "react";
import { Field, FieldComponentType } from "../app/model";
import { showDate } from "../utils/renderHelper";
import ExtendableTextList from "./extendableTextList";
import Happy from "./happy";

interface FieldFormProps {
    title: string,
    fields: Array<Field>,
    id: string,
    mark: string,
    updateFieldData: Function,
    deleteTitleData: Function,
    saveData: Function,
    next: Function,
    readonly: boolean
};


const FieldForm = (props: FieldFormProps) => {

    useEffect(() =>{
        console.log('updated');
    },[props]);

    const ID_PREFIX = 'fieldData-' + props.id + "-";

    const clearETL = (field: Field) => {
        if (!field.list) {
            return;
        }
        field.list = field.list.map(field => {
            field.value = '';
            return field;
        });
    }

    const clearData = (field: Field, index: number) => {
        if (field.fieldComponentType == FieldComponentType.ETL) {
            clearETL(field);
            return;
        }
        props.updateFieldData(index, "");
        const fieldElement = document.getElementById(ID_PREFIX + index) as HTMLInputElement;
        if (!fieldElement) {
            return;
        }
        fieldElement.value = '';
        fieldElement.defaultValue = '';

        const event = new Event("change");
        fieldElement.dispatchEvent(event);
    }

    const clearAllData = () => {
        for (var index = 0; index < props.fields.length; index++) {
            clearData(props.fields[index], index);
        }
        const firstFieldElement = document.getElementById(ID_PREFIX + '0') as HTMLInputElement;
        firstFieldElement.focus();
    }

    const moveToNext = (field: Field) => {
        props.next(field);
    }

    const indent = (fieldIndex: number, listNo: number, tabs: number) => {
        const field = props.fields[fieldIndex];
        const list = field.list;
        if (!list) {
            return;
        }
        const updatedList = list.map((f: Field, i: number) => {
            if (listNo != i) {
                return f;
            }
            f.indent = isNaN(f.indent) ? tabs : f.indent + tabs;
            f.id = i;
            return f;
        })
        field.list = updatedList;
        props.updateFieldData(fieldIndex, null, updatedList);
    }

    return (
        <>
            {!props.title || (
                <><h5 title='fill in the form' className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                    {props.title}
                    <span className="text-sm">- {showDate(props.mark)}
                        <button onClick={() => { props.deleteTitleData(props.mark) }} className="butt float-right mb-10 w-6 h-5 bg-blue-100">X</button>
                    </span>
                </h5>
                    <div className="font-normal text-gray-700 dark:text-gray-400">
                        {props.fields.map((field, index: number) => (
                            <div key={index} className="mb-6">
                                <label title={field.value} className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">{field.fieldName} </label>
                                {field.fieldComponentType == FieldComponentType.NONE &&
                                    <input onChange={e => props.updateFieldData(index, e.target)}
                                             // readOnly={props.readonly}
                                        key={ID_PREFIX + index}
                                        id={ID_PREFIX + index}
                                        defaultValue={field.value}
                                        type={field.fieldType}
                                        checked={field.value == 'true'}
                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block lg:w-full sg:w-56 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required />
                                }
                                {field.fieldComponentType == FieldComponentType.HAPPY &&
                                    <Happy id={ID_PREFIX + index} onChange={(value: string) => props.updateFieldData(index, value)}
                                        defaultValue={field.value}
                                    ></Happy>
                                }
                                {field.fieldComponentType == FieldComponentType.ETL &&
                                    <ExtendableTextList indent={(listNo: number, i: number) => indent(index, listNo, i)} next={(field: Field) => moveToNext(field)}
                                        onChange={(value: string) => props.updateFieldData(index, value)}
                                        defaultFields={field.list || []} setFields={(fields: Array<Field>) =>
                                            props.updateFieldData(index, null, fields)}
                                    ></ExtendableTextList>
                                }
                            </div>
                        ))}
                    </div>
                    <div className="grid grid-cols-3 sg:mb-2">
                        <button type="submit" onClick={e => clearAllData()} className="butt justify-self-start sg:mb-2">Reset</button>
                        <div></div>
                        <button type="submit" onClick={e => props.saveData()} className="butt justify-self-end sg:mb-2">Save</button>
                    </div>
                </>)}
        </>
    )

}

export default FieldForm;
