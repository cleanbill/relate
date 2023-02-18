import { useState, useEffect } from "react";
import { ComponentType, Field, FieldType } from "../app/page";

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

import SortableItem from "./sortableItem";

export type Props = {
    onChange: Function;
    defaultFields: Array<Field>;
    setFields: Function;
    next: Function;
}

const grid = 8;

const ExtendableTextList = (props: Props) => {
    const [activeId, setActiveId] = useState(null);
    const [focusId, setfocusId] = useState(null as string | null);

    const add = () => {
        console.log('Adding field number ' + props.defaultFields.length);
        setfocusId('input-' + props.defaultFields.length);
        const newField: Field = { id: props.defaultFields.length, fieldName: '', fieldType: FieldType.text, componentType: ComponentType.NONE, value: '' };
        props.setFields([...props.defaultFields, newField]);
    }

    useEffect(() => {
        const el = document.getElementById(focusId || 'missing') as HTMLInputElement;
        if (el) {
            el.focus();
            el.value = props.defaultFields[props.defaultFields.length - 1].value;
        }
    }, [focusId, props.defaultFields])

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
        field.value = value;
        props.defaultFields[index] = field;
    }

    const deleteField = (index: number) => {
        console.log('deleting ' + index);
        props.setFields([
            ...props.defaultFields.slice(0, index),
            ...props.defaultFields.slice(index + 1, props.defaultFields.length)
        ]);
    }

    const tomorrow = (index: number) => {
        const move =  props.defaultFields[index];
        props.setFields([
            ...props.defaultFields.slice(0, index),
            ...props.defaultFields.slice(index + 1, props.defaultFields.length)
        ]);
        props.next(move);
    }

    return (
        <>
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
                onDragStart={handleDragStart}
            >
                <SortableContext items={props.defaultFields} strategy={rectSortingStrategy}>
                    {props.defaultFields.map((field: Field, index: number) => (
                        <div key={index}>
                            <SortableItem key={index} id={index} handle={true} value={field.value} onReturn={() => add()}
                                onChange={fieldChange} manana={(id: number) => tomorrow(id)} delete={(id: number) => deleteField(id)}
                            />
                        </div>))}
                    <DragOverlay>
                        {activeId ? (
                            <div className="w-10/12 bg-green-100 border-2 outline outline-blue h-10">
                                {props.defaultFields[activeId].value}
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