"use client";

import React, { useEffect, useState } from 'react';
import Define from '../components/define';
import Groups from '../components/groups';
import FieldForm from '../components/fieldForm';
import { createNewGroup, createTitleData, createTodoGroup, establish, fillInComponentType, getComponentType, getMark, isSingleton, matchSetup } from '../utils/stateHelper';
import { TitleData, Field, FieldComponentType, FieldType, GroupData, Session } from './model';
import Foot from '../components/foot';

type State = {
    groupIndex: number,
    titleIndex: number,
    session: Session
}

const Home = () => {
    const [groupDataList, setGroupDataList] = useState([] as Array<GroupData>);
    const [group, setGroup] = useState("");
    const [groupIndex, setGroupIndex] = useState(-1);
    const [title, setTitle] = useState("");
    const [titleIndex, setTitleIndex] = useState(-1);
    const [fields, setFields] = useState([] as Array<Field>);

    const [showGroup, setShowGroup] = useState(false);
    const [mark, setMark] = useState("Unsaved");
    const [readonly, setReadonly] = useState(true);

    useEffect(() => {
        const startingData = establish<Array<GroupData>>("groups", groupDataList, setGroupDataList);

        const hasTodo = startingData.findIndex(gd => gd.groupName == 'todo') > -1;
        if (!hasTodo) {
            startingData.push(createTodoGroup());
        }
        const groupIndex = startingData.length - 1;
        const startGroup = startingData[groupIndex]; // Get first group, maybe could default to another in future
        const titleKeys = Object.keys(startGroup.titles);
        const startTitleKey = titleKeys[titleKeys.length - 1]; // get first title... same as above, perhaps should be in A...Z order
        const startIndex = getTitleIndexByName(startGroup, startTitleKey);
        if (startIndex == -1) {
            return;
        }
        const startTitle = startGroup.titles[startIndex];
        const sessionKeys = Object.keys(startTitle.sessions);
        const startSession = startTitle.sessions[sessionKeys[0]]; // get first session... should be in date order
        setState({ groupIndex, titleIndex: startIndex, session: startSession })
        const field = document.getElementById('search-input');
        field?.focus();
    }, []);

    const setState = (state: State) => {
        setGroupIndex(state.groupIndex);
        setGroup(state.session.group);
        setTitleIndex(state.titleIndex);
        setTitle(state.session.title);
        setMark(state.session.mark);
        rebuild(state.session.fields, state.groupIndex, state.titleIndex, state.session.mark);
    }

    const updateFieldFn = (index: number) => {
        const fieldNameElement = document.getElementById('fieldName-' + index) as HTMLInputElement;
        const fieldName = fieldNameElement.value;
        const fieldTypeElement = document.getElementById('fieldType-' + index) as HTMLInputElement;
        const fieldType = fieldTypeElement.value as FieldType;
        const componentType = getComponentType(fieldType);
        const updatedFields = fields.map((field: Field, i: number) => (i == index) ? { fieldName, fieldType, fieldComponentType: componentType, value: '' } as Field : field);
        const fieldsArray = updatedFields ? updatedFields : [];
        const filledFields = fieldsArray.map((field: Field) => fillInComponentType(field));
        rebuild(filledFields);
    }

    const getValue = (target: HTMLInputElement): string => {
        if (target.type == 'checkbox') {
            return '' + target.checked;
        }
        return target.value;
    }

    const rebuild = (newFields: Array<Field>, gi = groupIndex, ti = titleIndex, m = mark) => {
        setFields([...newFields]);
        if (!groupDataList[gi]?.titles[ti]?.sessions[m]?.fields) {
            return;
        }
        groupDataList[gi].titles[ti].sessions[m].fields = fields;
        setGroupDataList(groupDataList);
    }

    const updateFieldDataFn = (index: number, target?: HTMLInputElement, list?: Array<Field>) => {
        const newFields = fields.map(field => fillInComponentType(field));
        if (target) {
            newFields[index].value = getValue(target);
        }
        if (list) {
            newFields[index].list = list;
        }
        rebuild(newFields);
        const latestMark = getMark();
        setMark(latestMark);
    }

    const addFieldFn = () => {
        const newFields = [...fields, { id: fields.length, indent: 0, fieldName: '', fieldType: FieldType.text, fieldComponentType: FieldComponentType.NONE, value: '' }];
        rebuild(newFields);
    }

    const takeFieldFn = (index: number) => {
        const newFields = fields.filter((_, i) => index != i);
        rebuild(newFields);
    }

    const overrideFieldsFn = (overrideFields: Array<Field>, mark: string, editable: boolean) => {
        if (!overrideFields) {
            return;
        }
        const newFields = overrideFields.map(field => fillInComponentType(field));
        rebuild(newFields);
        setMark(mark);
        setReadonly(!editable);
    }

    const selectGroupTitleFn = (groupIndex: number, titleIndex: number) => {
        const group = groupDataList[groupIndex];
        if (!group) {
            return;
        }
        const titleData = group.titles[titleIndex];
        if (!titleData) {
            return;
        }
        const sessionKeys = Object.keys(titleData.sessions);
        const startSession = titleData.sessions[sessionKeys[0]]; // get first session... should be in date order
        if (!startSession) {
            setTitle(titleData.titleName);
            setTitleIndex(group.titles.length - 1);
            return;
        }
        const startFields = startSession.fields.map(field => fillInComponentType(field));
        startSession.fields = startFields;
        startSession.title = titleData.titleName;
        titleData.singleton = isSingleton(startFields);
        //      if (titleData.sessions) {
        //          setMark('');
        //      }
        setState({ groupIndex, titleIndex, session: startSession })
    }

    const replaceGroupData = (gd: GroupData) => {
        const newList = groupDataList.map((listData: GroupData) => gd.groupName == listData.groupName ? gd : listData);
        return newList;
    }

    const saveDataFn = () => {
        const groupDataInList = getGroupDataByName(group);
        if (!groupDataInList) {
            const session = getCurrentSession(0);
            const newGroup = createNewGroup(session, group, title);
            const newList = [...groupDataList, newGroup];
            commit(newList);
            return;
        }
        const expandedGroup = addToGroup(groupDataInList);
        const newList = replaceGroupData(expandedGroup);
        commit(newList);
    }

    const getCurrentSession = (id: number) => {
        const mark = getMark();
        const sess: Session = { no: id, group, title, mark, fields: fields };
        return sess;
    }

    const deleteGroupFn = (index: number) => {
        const updatedList = groupDataList.filter((gd: GroupData, i: number) => i != index);
        setGroupDataList([...updatedList]);
    }

    const deleteTitleFn = (groupIndex: number, titleIndex: number) => {
        const updatedList = groupDataList.map((gd: GroupData, i: number) => {
            if (i == groupIndex) {
                gd.titles.splice(1, titleIndex)
            }
            return gd;
        });
        setGroupDataList([...updatedList]);
    }

    const addToGroup = (gd: GroupData) => {
        const td = getTitleDataByName(gd, title);
        if (!td) {
            const session = getCurrentSession(0);
            gd.titles.push(createTitleData(session, title));
            return gd;
        }
        const currentMark = getMark();
        console.log('current mark ' + mark);
        const oldMark = currentMark !== mark || td.singleton;
        if (oldMark) {
            return gd;
        }
        const session = td.sessions[mark];
        if (session) {
            const updatedSession = { no: session.no, group, title, mark, fields };
            td.sessions[updatedSession.mark] = updatedSession;
            return gd;
        }
        const no = Object.keys(td.sessions).length;
        const newSession = { no, group, title, mark, fields };
        td.sessions[newSession.mark] = newSession;
        return gd;
    }

    const updateTitleDataFn = (mark: string) => {
        const groupDataInList = getGroupDataByName(group);
        if (!groupDataInList) {
            return;
        }
        const groupsTitles = getTitleDataByName(groupDataInList, title);
        if (!groupsTitles) {
            return;
        }
        delete groupsTitles.sessions[mark];
        const expandedGroup = addToGroup(groupDataInList);
        const newList = replaceGroupData(expandedGroup);
        commit(newList);
    }

    const deleteTitleDataFn = (mark: string) => {
        const groupDataInList = getGroupDataByName(group);
        if (!groupDataInList) {
            return;
        }
        const groupsTitles = groupDataInList.titles[titleIndex]; //.find((td: TitleData) => (td.titleName == title));
        if (!groupsTitles) {
            return;
        }
        delete groupsTitles.sessions[mark];
        const newList = replaceGroupData(groupDataInList);
        commit(newList);
        setTitle("");
        setTitleIndex(-1);
    }

    const commit = (newList: Array<GroupData>) => {
        setGroupDataList(newList);
        localStorage.setItem('groups', JSON.stringify(newList));
    }

    const calcNextIndex = (titleIndex: number, nextIndex: number, titleQty: number) => {
        if (nextIndex > -1) {
            return nextIndex;
        }
        if (titleIndex + 1 == titleQty) {
            return 0;
        }
        return titleIndex + 1;
    }

    const getGroupIndexByName = (name: string): number => {
        const selectedGroupIndex = groupDataList.findIndex((groupData: GroupData) => (groupData.groupName.indexOf(name) > -1));
        return selectedGroupIndex;
    }

    const getGroupDataByName = (name: string): GroupData | undefined => {
        const selectedGroupIndex = getGroupIndexByName(name);
        setGroupIndex(selectedGroupIndex);
        return groupDataList[selectedGroupIndex];
    }


    const getTitleIndexByName = (selectedGroup: GroupData, name: string): number => {
        const selectedTitleIndex = selectedGroup.titles.findIndex((td: TitleData) => td.titleName.indexOf(name) > -1);
        setTitleIndex(selectedTitleIndex);
        return selectedTitleIndex;
    }

    const getTitleDataByName = (selectedGroup: GroupData, name: string): TitleData | undefined => {
        const selectedTitleIndex = getTitleIndexByName(selectedGroup, name);
        return selectedGroup.titles[selectedTitleIndex];
    }

    const nextFn = (field: Field, nextIndex = -1) => {
        const selectedGroup = getGroupDataByName(group);
        if (!selectedGroup) {
            return;
        }
        const titleIndex = getTitleIndexByName(selectedGroup, title);
        const index = calcNextIndex(titleIndex, nextIndex, selectedGroup.titles.length);;
        const nextTitleData = selectedGroup.titles[index];
        const session = nextTitleData.sessions['single'];
        session.fields[0].list?.unshift(field);
    }

    const updateTitle = (value: string) => {
        if (value == null) {
            return;
        }
        const groupData = (groupIndex == -1) ? getGroupDataByName(group) : groupDataList[groupIndex];
        if (!groupData) {
            const { index } = addGroup(group, title);
            selectGroupTitleFn(index, 0);
            return;
        }

        if (titleIndex == -1 || !groupData) {
            addTitle();
            return;
        }
        groupData.titles[titleIndex].titleName = value;
    }

    const updateGroup = (value: string) => {
        if (value) {
            setGroup(value);
            return;
        }
        saveDataFn();
        setGroup("");
    }

    const addTitle = () => {
        const value: string = '';
        const selectedGroup = getGroupDataByName(group);
        if (!selectedGroup) {
            return;
        }
        const session: Session = { no: 0, group, title: value, mark: getMark(), fields: fields };
        const index = selectedGroup.titles.length;
        selectedGroup.titles.push(createTitleData(session, value));
        const newList = replaceGroupData(selectedGroup);
        setTitleIndex(index);
        commit(newList);
        setTitle("");
    }

    const addGroup = (groupName = "", titleName = ""): { group: GroupData, index: number } => {
        const index = getGroupIndexByName(group);
        if (index != -1) {
            const selectedGroup = groupDataList[index];
            return { group: selectedGroup, index };
        }
        const session: Session = { no: 0, group: groupName, title: titleName, mark: getMark(), fields };
        const newGroup = createNewGroup(session, groupName, title);
        groupDataList.push(newGroup);
        commit(groupDataList);

        setState({ groupIndex: groupDataList.length - 1, titleIndex: 0, session })
        return { group: newGroup, index: groupDataList.length - 1 };
    }

    const changeLayout = (on: boolean) => {
        const doc: any = document;
        if (!doc.startViewTransition) {
            console.warn("No view transition");
            setShowGroup(on);
        } else {
            doc.startViewTransition(() => setShowGroup(on));
        }
    }

    const search = (inputElement: HTMLInputElement) => {
        const match = matchSetup(inputElement.value);
        groupDataList.forEach((gd: GroupData, groupDataIndex: number) => {
            gd.titles.forEach((td: TitleData, titleIndex: number) => {
                if (match(td.titleName)) {
                    selectGroupTitleFn(groupDataIndex, titleIndex);
                }
            });
        })
    }
    return (
        <div className="lg:bg-blue-200 ">
            <div className={showGroup ? "lg:bg-blue-200 grid sg:grid-cols-1 w-100 h-full lg:grid-cols-3 gap-10 " : "lg:bg-blue-200 grid sg:grid-cols-1 w-100 h-full"} >

                <div className='sg:col-span-2'>
                    {showGroup && <a className="blocked">
                        <Groups selectedGroupIndex={groupIndex}
                            selectedTitleIndex={titleIndex}
                            groups={groupDataList}
                            select={selectGroupTitleFn}
                            overrideFields={overrideFieldsFn}
                            updateTitleData={updateTitleDataFn}
                            deleteGroup={deleteGroupFn}
                            deleteTitle={deleteTitleFn}
                            toggleShow={() => changeLayout(false)}
                        ></Groups>
                    </a>}
                    {!showGroup && <a className="blocked">
                        <div className="grid grid-cols-[0fr,12fr] gap-2">
                        <button className="ml-1 butt mb-3" onClick={() => changeLayout(true)}><b>G</b></button>
                            <input onChange={e => search(e.target)}
                                id='search-input'
                                defaultValue=''
                                type='text'
                                placeholder="Search"
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block lg:w-full sg:w-56 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required />

                        </div>
                    </a>}
                </div>

                <div className='col-span-2 align-top '>
                    {fields && fields.length > 0 && <a className="blocked">
                        <FieldForm
                            title={title}
                            id={groupIndex + "-" + titleIndex + '-' + mark}
                            fields={fields}
                            mark={mark}
                            readonly={readonly}
                            next={nextFn}
                            updateFieldData={updateFieldDataFn}
                            deleteTitleData={deleteTitleDataFn}
                            saveData={saveDataFn}
                        ></FieldForm>
                    </a>}

                </div>
            </div>

            {fields && <a className="blocked">
                <Define
                    fields={fields} group={group} title={title}
                    setGroup={(value: string) => updateGroup(value)}
                    addGroup={() => addGroup()}
                    setTitle={(value: string) => updateTitle(value)}
                    addTitle={() => addTitle()}
                    add={addFieldFn}
                    take={takeFieldFn}
                    updateField={updateFieldFn}></Define>

            </a>}

            <Foot groupDataList={groupDataList}></Foot>

        </div>
    )
}

export default Home