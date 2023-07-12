import React, { useEffect, useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { getGroupDataList } from "../utils/stateHelper";
import { GroupData, TitleData } from "../app/model";
// import {getGroupDataList} from ''

type Props = {
  id: any,
  value: string,
  indent: number,
  handle: boolean,
  manana: Function,
  onReturn: Function,
  onChange: Function,
  onIndent: Function,
  delete: Function
}

const SortableItem = (props: Props) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    isDragging
  } = useSortable({ id: props.id });

  const [field, setField] = useState(props.value);
  const [moveTo, setMoveTo] = useState({gid:-1,tdi:-1});


  useEffect(() => {
    const element = document.getElementById('field ' + props.id) as HTMLInputElement;
    if (!element) {
      return;
    }
    element.value = props.value;
    console.log(props.id, ' is ', props.value);
    setField(props.value);
  }, [props])


  const keyup = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key != 'Enter') {
      return;
    }
    props.onReturn();
  }

  const jump = () => {
    console.log('move to',moveTo);
  }

  const valueRef = (element: HTMLInputElement) => {
    if (!element) {
      return;
    }
    element.value = props.value;
  }

  const manana = () => {
    props.manana(props.id);
  }

  const indent = () => {
    props.onIndent(1);
  }

  const unindent = () => {
    props.onIndent(-1);
  }

  const indents = [];
  for (let i = 0; i < props.indent; i++) {
    indents.push('\t');
  }

  const showIndent = (isNaN(props.indent) || props.indent < 4) && props.id > 0;
  const showManana = props.id == 0 || (isNaN(props.indent) || props.indent == 0);

  const move = () =>{

  }

  return (
    <div className={"grid grid-cols-[0fr,3fr,10fr,0fr,0fr] w-full"}>
      <div ref={setNodeRef} className={"w-6/12 m-10 border-2 outline outline-blue" + isDragging ? 'z-50 opacity-30' : 'opacity-100'} >
        <button className="h-21 self-center" {...listeners} {...attributes}>
          <svg viewBox="0 0 20 20" width="30"><path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z"></path></svg>
        </button>
      </div>
      <div className="grid grid-cols-[1fr,1fr,1fr] w-20 ">
        {!showManana && <div className="w-9"></div>}
        {showManana && <button onClick={() => manana()} title='Do it tomorrow' className="butt-colour w-5 h-6 mr-4 rounded-lg text-sm ">T</button>}
        {showIndent && <button onClick={() => indent()} title='indent' className="butt-colour w-5 h-6 mr-4 rounded-lg text-sm ">+</button>}
        {!showIndent && <div></div>}
        {props.indent > 0 && <button onClick={() => unindent()} title='unindent' className="butt-colour w-5 h-6 mr-4 rounded-lg text-sm ">-</button>}
      </div>
      <span>
        {indents.map((t, i) => <span key={i}>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>)}
        <input ref={valueRef} name={field} title={'field ' + props.id} id={'input-' + props.id} className='lg:w-10/12 sg:w-40 h-7' onKeyUp={keyup}
          onChange={e => props?.onChange(props.id, e.target.value)}
          type='text' ></input>

      </span>

      {/* @ts-ignore */}
      <div className="bg-blue-400 shadow-lg rounded-lg w-6/12" id={"jumpto-popover" + props.id} popover="true">
        <div className="border border-solid h-10m-5 block p-2 hover:bg-white rounded-lg border border-gray-200 shadow-md bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700">
          <p>
            <h1 className="bg-blue-400 text-white">
            <div className="grid grid-cols-[12fr,0fr]">

              <div className="ml-1">Moved to....</div>
              {/* @ts-ignore */}
              <button className="butt inline float-right align-top m-0.5 w-6 h-5 bg-blue-100" popovertarget={"jumpto-popover" + props.id} popovertargetaction="hide">
                <span aria-hidden="true">x</span>
                <span className="sr-only">Close</span>
              </button>
              </div>
            </h1>
            {getGroupDataList().map((gd:GroupData, gdIndex:number) =>(
              <div key={gd.groupName}>
                <h3><b>{gd.groupName}</b></h3>
                {gd.titles.map((td:TitleData, tdIndex:number) => (
                  <h4 key='tdIndex' className="ml-4">
                    <div className="grid grid-cols-[0fr,12fr]">
                          <div >{td.titleName}</div>
                          <div className="text-end">
                          <input onChange={() => setMoveTo({gid:gdIndex,tdi:tdIndex})} type="radio" id={'rb-'+gdIndex+','+tdIndex} name="movers" value={'rb-'+gdIndex+','+tdIndex}></input>
                          </div>
                          </div> 
                  </h4>
                ))}
              </div>
            ))}
            <div className="text-end">
              <button onClick={() =>jump()} className="butt text-end">Move</button>
            </div>
          </p>
        </div>
      </div>

      {/* @ts-ignore */}
      <button popovertarget={"jumpto-popover" + props.id} title="Jump to another list" className="ml-3 justify-self-end text-white bg-blue-400 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm w-6 h-6 sg:mr-1.5 dark:bg-red-600 dark:hover:bg-red-700 focus:outline-none dark:focus:ring-red-800 ">»</button>


      <button title="delete" onClick={e => props.delete(props.id)} className="ml-3 justify-self-end text-white bg-blue-400 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm w-6 h-6 sg:mr-1.5 dark:bg-red-600 dark:hover:bg-red-700 focus:outline-none dark:focus:ring-red-800 ">X</button>
    </div>
  );
};

export default SortableItem;
