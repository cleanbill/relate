import { TitleData } from '../app/model';
import History from './history';

interface Props {
    titleData: TitleData, deletable: boolean, selectTitle: Function, showHistory: boolean, overrideFields: Function, updateTitleData: Function, deleteTitle: Function, i: number, selected: boolean
};

const GroupTitle = (props: Props) => {

    return (
        <>
            <div key={props.titleData.titleName} id={'selected-' + props.i} className="p-5 font-light border border-b-0 border-gray-200 dark:border-gray-700 dark:bg-blue-300" >
                <div className="mb-2 text-gray-500 dark:text-gray-400">
                    <span className={props.selected ? 'font-bold mr-4' : "mr-4"} onClick={() => props.selectTitle()}>{props.i + 1} . {props.titleData.titleName} </span>
                    {props.deletable && <button onClick={() => props.deleteTitle()} className="z-10 butt mb-10 w-6 h-5 bg-blue-100">X</button>}
                    {props.showHistory && (
                        <History
                            titleData={props.titleData}
                            overrideFields={props.overrideFields}
                            updateTitleData={props.updateTitleData} ></History>
                    )}
                </div>
            </div>
        </>
    )

}


export default GroupTitle;