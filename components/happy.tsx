import { useState, useEffect } from "react";
import Face from "./face";

type SelectionState = {
    index: number,
    hoveringIndex: number,
    selectedIndex: number
}

export type HappyProps = {
    onChange: Function;
    defaultValue: string;
    id: string;
}

const isSelected = (selectionState: SelectionState): boolean => {
    if (selectionState.hoveringIndex >= selectionState.index && selectionState.selectedIndex == 0) {
        return true;
    }
    if (selectionState.selectedIndex >= selectionState.index) {
        return true;
    }
    return false;
}
const determineValue = (value: string) => {
    const parsed = parseInt(value);
    const index = isNaN(parsed) ? 0 : parsed;
    return index;
}


const Happy = (props: HappyProps) => {
    const index = determineValue(props.defaultValue);

    const [hoveringIndex, setHoveringIndex] = useState(0);
    const [selectedIndex, setSelectedIndex] = useState(index);

    const choose = (index: number) => {
        setSelectedIndex(() => index);
        props.onChange(index);
    }
    useEffect(() => {
        const index = determineValue(props.defaultValue);
        setSelectedIndex(index);
    }, [props.defaultValue])

    return (
        <>
            <ul className="mt-4 pl-3 grid grid-cols-3">
                {[1, 2, 3, 4, 5, 7, 8, 9, 10].map((index: number) => (
                    <li className=""
                        key={index}
                        onMouseEnter={() => setHoveringIndex(index)}
                        onMouseLeave={() => setHoveringIndex(-1)}
                        onMouseUp={() => index == selectedIndex ? choose(0) : choose(index)}
                    >
                        <span className={index < 10 ? 'pl-2' : 'pl-1'}>{index}</span>
                        <Face selected={isSelected({ index, hoveringIndex, selectedIndex })}></Face>
                    </li>
                ))}
            </ul>
            <input type='hidden' id={props.id} value={selectedIndex} ></input>
        </>)
}

export default Happy;