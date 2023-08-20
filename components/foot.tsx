import { GroupData } from "../app/model";
import { exportData, importData } from "../utils/stateHelper";



const Foot = (props:{groupDataList:Array<GroupData>}) =>{

    return (
        <footer className="pt-4 w-full  bg-white max-w rounded-lg shadow md:flex md:items-center md:justify-between md:p-6 dark:bg-gray-800 static bottom-0 mt-96">

        <div className=" grid grid-cols-2 w-100 gap-10 h-full">

            <button onClick={() => importData()} className="butt sg:mb-4 justify-self-start ml-3">Import</button>
            <input type="file" hidden
                id="importData" name="importData"
                accept="application/json" onChange={() => importData()} />
            <button onClick={() => exportData(props.groupDataList)} className="butt sg:mb-4 justify-self-end">Export</button>
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
    )

}

export default Foot;