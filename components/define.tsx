import { ChangeEvent, useEffect, useState } from "react";
import { Field, fieldTypesArray } from "../app/model";

interface DefineProps {
    fields: Array<Field>, group: string, title: string,
    setGroup: Function,
    setTitle: Function,
    add: Function,
    take: Function,
    updateField: Function
};


const Define = (props: DefineProps) => {

    useEffect(() => {
        const lastFieldID = "fieldName-" + (props.fields.length - 1);
        const lastField = document.getElementById(lastFieldID);
        lastField?.focus();
        //            lastField?.scrollIntoView();
    }, [props.fields.length]);


    const valueRef = (element: HTMLInputElement, val: string) => {
        if (!element) {
            return;
        }
        element.value = val;
    }

    const change = (fn: Function, e: ChangeEvent<HTMLInputElement>) => {
        fn(e.target.value);
    }

    const newTitle = () => {
        props.setTitle();
        const titleField = document.getElementById('titleField');
        titleField?.focus();
    }

    const newGroup = () => {
        props.setGroup();
        const txtField = document.getElementById('groupField');
        txtField?.focus();
    }

    return (
        <>
            <div className="font-normal p-12 text-gray-700 dark:text-gray-400">
                <form >
                    <div className="mb-6">
                        <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Group</label>
                        <div className="grid grid-cols-[12fr,0fr] gap-5">
                            <input ref={(e: HTMLInputElement) => valueRef(e, props.group)} defaultValue={props.group} onChange={e => change(props.setGroup, e)} type="text" id="groupField" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required />
                            <button title="New Group" type="button" onClick={() => newGroup()} className="butt-colour font-medium rounded-lg text-sm px-2 w-10 h-10 focus:outline-none ">
                                <svg aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
                            </button>
                        </div>
                    </div>
                    <div className="mb-6">
                        <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Title</label>
                        <div className="grid grid-cols-[12fr,0fr] gap-5">
                            <input ref={(e: HTMLInputElement) => valueRef(e, props.title)} onChange={e => change(props.setTitle, e)}
                                defaultValue={props.title} type="text" id="titleField" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required />
                            <button title="New Title" type="button" onClick={() => newTitle()} className="butt-colour font-medium rounded-lg text-sm px-2 w-10 h-10 focus:outline-none ">
                                <svg aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
                            </button>
                        </div>
                    </div>
                    <div className='w-full grid grid-cols-[5fr,6fr] gap-12'>

                        <label className="mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Field name</label>
                        <label className="mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Field Type </label>
                    </div>

                    {props.fields.length == 0 && <div className='float-right' style={{ float: 'right' }}>
                        <button title="New Field" type="button" onClick={() => props.add()} className="butt-colour focus:ring-4  font-medium float-right rounded-lg text-sm w-10 p-1 focus:outline-none ">
                            <svg aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
                            <span className="sr-only">add field</span>
                        </button>
                    </div>
                    }

                    {props.fields.map((field, index: number) => (
                        <div key={index} className={index != (props.fields.length - 1) ? 'w-full grid grid-cols-[6fr,6fr,0fr] gap-5' : 'w-full grid grid-cols-[5.5fr,5fr,0fr,0fr] gap-5'}>
                            <div className="w-full ">
                                <input ref={(e: HTMLInputElement) => valueRef(e, field.fieldName)} onChange={e => props.updateField(index)}
                                    defaultValue={field.fieldName} type="text" id={"fieldName-" + index} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required />
                            </div>
                            <div className="mb-6">
                                <select value={field.fieldType} onChange={e => props.updateField(index)} id={"fieldType-" + index}
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                                    {fieldTypesArray().map(fieldType =>
                                        <option key={fieldType + ''} value={fieldType + ''}>{fieldType}</option>
                                    )}
                                </select>
                            </div>
                            <button title="Delete Field" type="button" onClick={() => props.take(index)} className="butt-colour font-medium rounded-lg text-sm px-2 w-10 h-10 focus:outline-none ">
                                <svg aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
                                </svg>
                            </button>
                            {index != (props.fields.length - 1) || <div className='float-right' style={{ float: 'right' }}>
                                <button title="New Field" type="button" onClick={() => props.add()} className="butt-colour focus:ring-4  font-medium float-right rounded-lg text-sm w-10 p-1 focus:outline-none ">
                                    <svg aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
                                    <span className="sr-only">add field</span>
                                </button>
                            </div>
                            }
                        </div>
                    ))}
                </form>

            </div>

        </>
    )

}

export default Define;