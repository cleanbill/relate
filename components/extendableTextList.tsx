import { useState, useEffect } from "react";

import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    rectSortingStrategy
} from "@dnd-kit/sortable";

import SortableItem, { Destination } from "./sortableItem";
import { Field, FieldComponentType, FieldType } from "../app/model";

type Props = {
    indent: Function;
    onChange: Function;
    defaultFields: Array<Field>;
    setFields: Function;
    next: Function;
}

export type ArchivedFile = {
    field: Field;
    archivedOn: Date
}

const ExtendableTextList = (props: Props) => {
    const [activeId, setActiveId] = useState(null);
    const [focusID, setfocusID] = useState(null as string | null);
    const [fields, setFields] = useState([] as Array<Field>);

    const add = () => {
        console.log('Adding field number ' + fields.length);
        setfocusID('input-' + fields.length);
        const newField: Field = { id: fields.length, fieldName: '', fieldType: FieldType.text, indent: 0, fieldComponentType: FieldComponentType.NONE, value: '' };
        props.setFields([...fields, newField]);
        setFields([...fields, newField]);
    }

    const getFocused = (el: HTMLInputElement) => {
        if (!el) {
            return;
        }
        el.focus();
        if (!props.defaultFields) {
            return;
        }
        el.value = '';
        if (props.defaultFields.length == 0) {
            return;
        }
        const newIndex = props.defaultFields.length - 1;
        const lastField = props.defaultFields[newIndex];
        if (!lastField) {
            return;
        }
        el.value = lastField.value;
    }

    useEffect(() => {
        const el = document.getElementById(focusID || 'missing') as HTMLInputElement;
        getFocused(el);
        setFields([...props.defaultFields])
    }, [focusID, props.defaultFields])

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates
        })
    );

    const handleDragStart = (event: any) => {
        setActiveId(event.active.id);
    };

    const handleDragEnd = (event: { active: any; over: any; }) => {
        const { active, over } = event;

        if (active.id === over.id) {
            return;
        }

        const oldIndex = active.id;
        const newIndex = over.id;
        props.setFields(arrayMove(props.defaultFields, oldIndex, newIndex));
        setActiveId(null);
    };

    const fieldChange = (index: number, value: string) => {
        const field = props.defaultFields[index]
        field.id = index;
        field.value = value;
        props.defaultFields[index] = field;
    }

    const deleteField = (index: number) => {
        console.log('deleting ' + index);
        const archivedField = fields[index];
        if (archivedField.value) {
            const storedArchivedFields = localStorage.getItem('archive');
            const archivedFields = storedArchivedFields ? JSON.parse(storedArchivedFields) : [];
            archivedFields.push({ date: new Date(), field: archivedField });
            localStorage.setItem('archive', JSON.stringify(archivedFields));
        }

        props.setFields([
            ...fields.slice(0, index),
            ...fields.slice(index + 1, fields.length)
        ]);
        setFields([
            ...fields.slice(0, index),
            ...fields.slice(index + 1, fields.length)
        ])
    }

    const nextIndentend = (index: number) => {
        if (props.defaultFields.length == index + 1) {
            return false;
        }
        const nextField = props.defaultFields[index + 1];
        if (!nextField){
            return false;
        }
        if (isNaN(nextField.indent)) {
            return false;
        }
        if (nextField.indent == 0) {
            return false;
        }
        return true;
    }

    const lastIndexIndented = (index: number): number => {
        let checker = index;
        while (nextIndentend(checker)) {
            checker = checker + 1;
        }
        return checker;
    }

    const moveIndent = (dest:Destination, to: number): Array<Field> => {
        let updatedFields = fields;
        for (let index = to; index >= dest.tdi; index--) {
            const location = {tdi:dest.tdi,gid:dest.gid};
            updatedFields = [...moveIt(location, updatedFields)];
        }
        return updatedFields;
    }

    const moveIt = (dest:Destination, currentFields: Array<Field>): Array<Field> => {
        const move = props.defaultFields[dest.tdi];
        const updatedFields = [
            ...currentFields.slice(0, dest.tdi),
            ...currentFields.slice(dest.tdi + 1, fields.length)
        ];
        props.setFields([...updatedFields]);
        props.next(move, dest.tdi);
        return updatedFields;
    }

    const tomorrow = (index: number) => {
        const lastIndex = lastIndexIndented(index);
        const dest:Destination = {
            tdi: index,
            gid: -1
        }
        const newFields = (lastIndex == index) ? moveIt(dest, fields) : moveIndent(dest, lastIndex);
        const reindexed = newFields.map((f: Field, id: number) => { f.id = id; return f });
        setFields([...reindexed]);
    }

    const move = (dest:Destination) => {
        const lastIndex = lastIndexIndented(dest.tdi);
        const newFields = (lastIndex == dest.tdi) ? moveIt(dest, fields) : moveIndent(dest, lastIndex);
        const reindexed = newFields.map((f: Field, id: number) => { f.id = id; return f });
        setFields([...reindexed]);
    }

    const indent = (id: number, tabs: number) => {
        props.indent(id, tabs);
    }

    const iColours = new Map([
        [1, 'bg-blue-100'],
        [2, 'bg-red-100'],
        [3, 'bg-yellow-100'],
        [4, 'bg-blue-200']
    ]);

    const indentColour = (field: Field): string => {
        if (field.id == 0) {
            return "";
        }
        if (isNaN(field.indent)) {
            return "";
        }
        if (field.indent == 0) {
            return "";
        }

        return iColours.get(field.indent) || '';
    }

    return (
        <>
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
                onDragStart={handleDragStart}
            >
                <SortableContext items={fields} strategy={rectSortingStrategy}>
                    <ul>
                        {fields.map((field: Field, index: number) => (
                            <li className={indentColour(field)} key={index}>
                                <SortableItem onIndent={(i: number) => indent(index, i)} 
                                              key={index} 
                                              indent={field.indent} 
                                              id={index} 
                                              handle={true} 
                                              value={field.value} 
                                              onReturn={() => add()}
                                              onChange={fieldChange} 
                                              manana={(id: number) => tomorrow(id)} 
                                              delete={(id: number) => deleteField(id)}
                                              move={(destination:Destination) => move(destination)}
                                />
                            </li>))}
                    </ul>
                    <DragOverlay>
                        {activeId ? (
                            <div className="w-10/12 bg-green-100 border-2 outline outline-blue h-10">
                                {fields[activeId].value}
                            </div>
                        ) : null}
                    </DragOverlay>
                </SortableContext>
            </DndContext>
            <button onClick={() => add()} className="butt w-full h-7">ADD</button>
        </>
    );
}

export default ExtendableTextList;