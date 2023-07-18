import { MouseEventHandler } from "react";

interface Props {
    toggle: Function, selectTitle: Function
};


const TodoGroup = (props: Props) => {

    const toggle = (e:MouseEvent) =>{
        props.toggle(e);
    }

    return (
        <>
            <div onClick={() => props.toggle()} className="tabhead">
                <span onClick={(e:any) => toggle(e)} className='pl-4 text-stone-700'>To do
                </span>
            </div>
            <ul className="flex list-none">
                <li className="tab">
                    <button onClick={() => props.selectTitle("Monday")}>Mo</button>
                </li>
                <li className="tab">
                    <button onClick={() => props.selectTitle("Tuesday")}>Tu</button>
                </li>
                <li className="tab">
                    <button onClick={() => props.selectTitle("Wednesday")}>We</button>
                </li>
                <li className="tab">
                    <button onClick={() => props.selectTitle("Thursday")}>Th</button>
                </li>
                <li className="tab">
                    <button onClick={() => props.selectTitle("Friday")}>Fr</button>
                </li>
            </ul>
        </>
    )

}


export default TodoGroup;