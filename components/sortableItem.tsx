import React, { useEffect, useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
const SortableItem = (props: { id: any, value: string, handle: boolean, manana: Function, onReturn: Function, onChange: Function, delete: Function }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    isDragging
  } = useSortable({ id: props.id });

  const [field, setField] = useState(props.value);

  useEffect(() => {
    const element = document.getElementById('field ' + props.id) as HTMLInputElement;
    if (!element) {
      return;
    }
    element.value = props.value;
    console.log(props.id, ' is ', props.value);
    setField(props.value);
  }, [])


  const keyup = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key != 'Enter') {
      return;
    }
    props.onReturn();
  }

  const shact = (element: HTMLInputElement) => {
    if (!element) {
      return;
    }
    element.value = props.value;
  }

  const manana = () =>{
    console.log('tomorrow tomorrow '+props.value);
    props.manana(props.id);
  }

  return (
    <div className="grid grid-cols-[0fr,1fr,9fr,1fr]">
        <button onClick={() => manana()} className="butt-colour w-5 h-6 mr-4 rounded-lg text-sm ">T</button>
      <div ref={setNodeRef} className={"w-6/12 m-10 border-2 outline outline-blue" + isDragging ? 'z-50 opacity-30' : 'opacity-100'} >
        <button className="h-21 self-center" {...listeners} {...attributes}>
          <svg viewBox="0 0 20 20" width="30"><path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z"></path></svg>
        </button>
      </div>
      <input ref={shact} name={field} title={'field ' + props.id} id={'input-' + props.id} className='w-full h-7' onKeyUp={keyup}
        onChange={e => props?.onChange(props.id, e.target.value)}
        type='text' ></input>
      <button onClick={e => props.delete(props.id)} className="ml-3 justify-self-end text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm w-6 h-6 dark:bg-red-600 dark:hover:bg-red-700 focus:outline-none dark:focus:ring-red-800 ">X</button>
    </div>
  );
};

export default SortableItem;
