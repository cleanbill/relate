"use client";

import React, { useEffect, useState } from 'react';
import Define from '../components/define';
import Groups from '../components/groups';
import FieldForm from '../components/fieldForm';
import { createNewGroup, createTitleData, createTodoGroup, establish, exportData, fillInComponentType, getComponentType, getMark, importData, isSingleton } from '../utils/stateHelper';
import { TitleData, Field, FieldComponentType, FieldType, GroupData, Session } from './model';



const Home = () => {
    const [groupDataList, setGroupDataList] = useState([] as Array<GroupData>);
    const [group, setGroup] = useState("");
    const [title, setTitle] = useState("");
    const [fields, setFields] = useState([] as Array<Field>);
    const [mark, setMark] = useState('Unsaved');
    const [showGroup, setShowGroup] = useState(true);

    useEffect(() => {
        const startingData = establish<Array<GroupData>>("groups", groupDataList, setGroupDataList);

        const hasTodo = startingData.findIndex(gd => gd.groupName == 'todo') > -1;
        if (!hasTodo) {
            startingData.push(createTodoGroup());
        }
        const startGroup = startingData[startingData.length - 1]; // Get first group, maybe could default to another in future
        setGroup(startGroup.groupName);
        const titleKeys = Object.keys(startGroup.titles);
        const startTitleKey = titleKeys[titleKeys.length - 1]; // get first title... same as above, perhaps should be in A...Z order
        const startTitle = startGroup.titles.find((td: TitleData) => (td.titleName == startTitleKey));
        if (!startTitle) {
            return;
        }
        setTitle(startTitle.titleName);
        const sessionKeys = Object.keys(startTitle.sessions);
        const startSession = startTitle.sessions[sessionKeys[0]]; // get first session... should be in date order
        updateFields(startSession.fields);
    }, []);


    const updateFields = (fields: Array<Field>) =>
        setFields(fields.map(field => fillInComponentType(field)));

    const updateField = (index: number) => {
        const fieldNameElement = document.getElementById('fieldName-' + index) as HTMLInputElement;
        const fieldName = fieldNameElement.value;
        const fieldTypeElement = document.getElementById('fieldType-' + index) as HTMLInputElement;
        const fieldType = fieldTypeElement.value as FieldType;
        const componentType = getComponentType(fieldType);
        const updatedList = fields.map((field, i) => (i == index) ? { fieldName, fieldType, fieldComponentType: componentType, value: '' } as Field : field);
        updateFields([...updatedList]);
    }

    const getValue = (target: HTMLInputElement): string => {
        if (target.type == 'checkbox') {
            return '' + target.checked;
        }
        return target.value;
    }

    const updateFieldData = (index: number, target?: HTMLInputElement, list?: Array<Field>) => {
        if (target) {
            fields[index].value = getValue(target);
        }
        if (list) {
            fields[index].list = list;
        }
        updateFields([...fields]);
    }

    const add = () => {
        updateFields([...fields, { id: fields.length, indent: 0, fieldName: '', fieldType: FieldType.text, fieldComponentType: FieldComponentType.NONE, value: '' }])
    }

    const overrideFields = (fields: Array<Field>, mark: string) => {
        updateFields([...fields]);
        setMark(mark);
    }

    const selectData = (gd: GroupData, title: string) => {
        const titleData = gd.titles.find((td: TitleData) => (td.titleName.indexOf(title) > -1));
        if (!titleData) {
            setTitle("");
            return;
        }
        const sessionKeys = Object.keys(titleData.sessions);
        const startSession = titleData.sessions[sessionKeys[0]]; // get first session... should be in date order
        if (!startSession) {
            setTitle("");
            return;
        }
        setGroup(gd.groupName);
        setTitle(title);
        const startFields = startSession.fields.map(field => fillInComponentType(field));
        updateFields(startFields);
        titleData.singleton = isSingleton(startFields);
        if (titleData.sessions) {
            setMark('');
        }
    }

    const take = (index: number) => {
        const newList = fields.filter((_, i) => index != i);
        updateFields([...newList]);
        const fieldNameElement = document.getElementById('fieldName-' + newList.length) as HTMLInputElement;
        fieldNameElement.focus();
    }

    const replaceGroupData = (gd: GroupData) => {
        const newList = groupDataList.map((listData: GroupData) => gd.groupName == listData.groupName ? gd : listData);
        return newList;
    }

    const saveData = () => {
        const groupDataInList = groupDataList.find((gd: GroupData) => (gd.groupName.indexOf(group) > -1));
        if (!groupDataInList) {
            const session = getCurrentSession();
            const newGroup = createNewGroup(session, group, title);
            const newList = [...groupDataList, newGroup];
            commit(newList);
            return;
        }
        const expandedGroup = addToGroup(groupDataInList);
        const newList = replaceGroupData(expandedGroup);
        commit(newList);
    }

    const getCurrentSession = () => {
        setMark(() => getMark());
        const session: Session = { group, title, mark, fields };
        return session;
    }

    const deleteGroup = (index: number) => {
        const updatedList = groupDataList.filter((gd: GroupData, i: number) => i != index);
        setGroupDataList([...updatedList]);
    }

    const addToGroup = (gd: GroupData) => {
        const td = gd.titles.find((td: TitleData) => (td.titleName.indexOf(title) > -1));
        if (!td) {
            const session = getCurrentSession();
            gd.titles.push(createTitleData(session, title));
            return gd;
        }
        setMark(() => getMark());
        const session = td.sessions[mark];
        if (session) {
            const updatedSession = { group, title, mark, fields };
            td.sessions[updatedSession.mark] = updatedSession;
            return gd;
        }
        const newSession = getCurrentSession();
        td.sessions[newSession.mark] = newSession;
        return gd;
    }

    const updateTitleData = (mark: string) => {
        const groupDataInList = groupDataList.find((gd: GroupData) => gd.groupName.indexOf(group) > -1);
        if (!groupDataInList) {
            return;
        }
        const groupsTitles = groupDataInList.titles.find((td: TitleData) => (td.titleName == title));
        if (!groupsTitles) {
            return;
        }
        delete groupsTitles.sessions[mark];
        const expandedGroup = addToGroup(groupDataInList);
        const newList = replaceGroupData(expandedGroup);
        commit(newList);
    }

    const deleteTitleData = (mark: string) => {
        const groupDataInList = groupDataList.find((gd: GroupData) => gd.groupName === group);
        if (!groupDataInList) {
            return;
        }
        const groupsTitles = groupDataInList.titles.find((td: TitleData) => (td.titleName == title));
        if (!groupsTitles) {
            return;
        }
        delete groupsTitles.sessions[mark];
        const newList = replaceGroupData(groupDataInList);
        commit(newList);
        setTitle("");
    }

    const commit = (newList: Array<GroupData>) => {
        setGroupDataList(newList);
        localStorage.setItem('groups', JSON.stringify(newList));
    }

    const next = (field: Field) => {
        const selectedGroup = groupDataList.find((groupData: GroupData) => groupData.groupName == group);
        if (!selectedGroup) {
            return;
        }
        const titleIndex = selectedGroup.titles.findIndex((td: TitleData) => td.titleName == title);
        const nextIndex = titleIndex + 1 == selectedGroup.titles.length ? 0 : titleIndex + 1;
        const nextTitleData = selectedGroup.titles[nextIndex];
        const session = nextTitleData.sessions['single'];
        session.fields[0].list?.unshift(field);
    }

    const update = (value: string, setFn: Function) => {
        if (value) {
            setFn(value);
            return;
        }
        saveData();
        setFn("");
    }

    const changeLayout = (on: boolean) => {
        const doc: any = document;
        if (!doc.startViewTransition) {
            console.warn("No view transistion");
            setShowGroup(on);
        } else {
            doc.startViewTransition(() => setShowGroup(on));
        }
    }


    return (
        <div className="lg:bg-blue-200 ">
            <div className={showGroup ? "lg:bg-blue-200 grid sg:grid-cols-1 w-100 h-full lg:grid-cols-3 gap-10 " : "lg:bg-blue-200 grid sg:grid-cols-1 w-100 h-full"} >

                <div className='sg:col-span-2'>
                    {showGroup && <a className="blocked">
                        <Groups selectedGroup={group} selectedTitle={title} groups={groupDataList} select={selectData}
                            overrideFields={overrideFields}
                            updateTitleData={updateTitleData}
                            deleteGroup={deleteGroup}
                            toggleShow={() => changeLayout(false)}
                        ></Groups>
                    </a>}
                    {!showGroup && <a className="blocked w-10">
                        <button className="ml-1" onClick={() => changeLayout(true)}><b>G</b></button>
                    </a>}
                </div>

                {/* <SpinWheel></SpinWheel> */}

                <div className='col-span-2 align-top '>
                    {fields.length > 0 && <a className="blocked">
                        <FieldForm
                            next={(field: Field) => next(field)}
                            title={title}
                            fields={fields}
                            updateFieldData={updateFieldData}
                            deleteTitleData={deleteTitleData}
                            saveData={saveData}
                            mark={mark}
                        ></FieldForm>
                    </a>}

                </div>
            </div>
            <a className="blocked">
                <Define
                    fields={fields} group={group} title={title}
                    setGroup={(value: string) => update(value, setGroup)}
                    setTitle={(value: string) => update(value, setTitle)}
                    add={add}
                    take={take}
                    updateField={updateField}></Define>

            </a>


            <footer className="pt-4 w-full  bg-white max-w rounded-lg shadow md:flex md:items-center md:justify-between md:p-6 dark:bg-gray-800 static bottom-0 mt-96">

                <div className=" grid grid-cols-2 w-100 gap-10 h-full">

                    <button onClick={() => importData()} className="butt sg:mb-4 justify-self-start ml-3">Import</button>
                    <input type="file" hidden
                        id="export" name="export"
                        accept="application/json" onChange={() => importData()} />
                    <button onClick={() => exportData(groupDataList)} className="butt sg:mb-4 justify-self-end">Export</button>
                </div>

                <span className="text-sm text-gray-500 sm:text-center dark:text-gray-400">© 2022 <a href="https://github.com/cleanbill/relate" className="hover:underline">Relatable™</a>. All Rights Reserved.
                </span>
                <ul className="flex flex-wrap items-center mt-3 text-sm text-gray-500 dark:text-gray-400 sm:mt-0">
                    <li>
                        <a href="#" className="mr-4 hover:underline md:mr-6 ">About</a>
                    </li>
                    <li>
                        <a href="#" className="mr-4 hover:underline md:mr-6">Privacy Policy</a>
                    </li>
                    <li>
                        <a href="#" className="mr-4 hover:underline md:mr-6">Licensing</a>
                    </li>
                    <li>
                        <a href="#" className="hover:underline">Contact</a>
                    </li>
                </ul>
            </footer>
        </div>
    )
}

export default Home