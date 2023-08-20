import { MouseEventHandler } from "react";

interface Props {
    toggle: Function, selectTitle: Function
};


const TodoGroup = (props: Props) => {

    return (
        <>
            <div onClick={() => props.toggle()} className="tabhead">
                <span  className='pl-4 text-stone-700'>To do
                </span>
            </div>
            <ul className="flex list-none">
                <li className="tab">
                    <button onClick={() => props.selectTitle(0)}>Mo</button>
                </li>
                <li className="tab">
                    <button onClick={() => props.selectTitle(1)}>Tu</button>
                </li>
                <li className="tab">
                    <button onClick={() => props.selectTitle(2)}>We</button>
                </li>
                <li className="tab">
                    <button onClick={() => props.selectTitle(3)}>Th</button>
                </li>
                <li className="tab">
                    <button onClick={() => props.selectTitle(4)}>Fr</button>
                </li>
            </ul>
        </>
    )

}


export default TodoGroup;