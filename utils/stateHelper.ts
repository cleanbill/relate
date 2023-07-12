import { Field, FieldComponentType, FieldType, GroupData, Session, TitleData } from "../app/model";

const json = (text: string): any => {
  try {
    return JSON.parse(text);
  } catch (error) {
    return text;
  }
};

function establish<T>(
  statename: string,
  defaultValue: T,
  setter: Function = () => {},
): T {
  const stored = localStorage.getItem(statename);
  try {
    const place = stored ? json(stored) : defaultValue;
    setter(place);
    return place;
  } catch (error) {
    console.error(error, stored);
    setter(defaultValue);
    return defaultValue;
  }
}

const getGroupDataList = (): Array<GroupData> =>{
  const stored = localStorage.getItem("groups");
  try {
    const place = stored ? json(stored) : new Array<GroupData>();
    return place;
  } catch (error) {
    console.error(error, stored);
    return new Array<GroupData>();
  }

}

const getTitleData = (
  groupDataList: Array<GroupData>,
  groupName: string,
  titleName: string,
): TitleData => {
  console.log("getTitleData ", groupDataList, groupName, titleName);
  const groupData = groupDataList.find((listData: GroupData) =>
    listData.groupName == groupName
  );
  if (!groupData) {
    console.log("getTitleData: no group data");
    return {} as TitleData;
  }
  const td = groupData.titles.find((td: TitleData) =>
    td.titleName == titleName
  );
  if (!td) {
    console.log("getTitleData: no title data");

    return {} as TitleData;
  }
  console.log("getTitleData: td is ", td);
  return td;
};


const z = (n: number) => n < 10 ? "0" + n : n + "";

const getMark = (includeMinutes = false) => {
  const now = new Date();
  const minutes = includeMinutes ? z(now.getMinutes()) : '00';
  const mark = now.getFullYear() + "-" + z(now.getMonth()) + "-" + z(now.getDate()) + ":" + z(now.getHours()) + ':' + minutes;
  return mark;
}


const exportData = (groupDataList:Array<GroupData>) => {
  console.log('Exporting ', groupDataList);
  const fileName = 'relate-' + getMark(true) + '.json';
  const fileToSave = new Blob([JSON.stringify(groupDataList, null, 4)], {
      type: 'application/json'
  });

  const url = window.URL || window.webkitURL;
  const link = url.createObjectURL(fileToSave);
  const a = document.createElement("a");
  a.download = fileName;
  a.href = link;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

const importData = async () => {
  const filename = document.getElementById('export') as any;
  filename?.click();
  console.log(filename.files[0]);
  // const formData = new FormData();

  const file_reader = new FileReader();
  file_reader.addEventListener("load", () => {
      const uploaded = file_reader.result;
      console.log('uploaded.....', uploaded);
  });
  file_reader.readAsDataURL(filename.files[0]);

  // formData.append("savedData", filename.files[0]);
  // const what = await fetch('', { method: "POST", body: formData });
  // console.log(await what.json());
}

const isSingleton = (fds: Field[]) => fds[0]?.fieldComponentType == FieldComponentType.ETL;

const createTitleData = (session: Session, titleName: string) => {
  const sessions: Record<string, Session> = {};
  sessions[session.mark] = session;
  const singleton = isSingleton(session.fields);
  const titleData: TitleData = { titleName, sessions, singleton }
  return titleData;
}

const createNewGroup = (session: Session, groupName: string, titleName: string) => {
  const titles = [createTitleData(session, titleName)];
  const groupData: GroupData = { groupName, titles, display: true };
  return groupData;
}

const getComponentType = (fieldType: FieldType): FieldComponentType => {
  if (fieldType == FieldType.happy) {
      return FieldComponentType.HAPPY;
  }
  if (fieldType == FieldType.list) {
      return FieldComponentType.ETL;
  }

  return FieldComponentType.NONE;
}

const fillInComponentType = (field: Field): Field => {
  field.fieldComponentType = getComponentType(field.fieldType);
  return field;
}

const createDayTitleData = (day: string): TitleData => {
  const titleName = day;
  const fields = new Array<Field>();
  const ETLField = {
      fieldComponentType: FieldComponentType.ETL,
      fieldName: day,
      fieldType: FieldType.list,
      value: "",
      list: Array<Field>()
  } as Field;
  fields.push(ETLField);
  const session = { group: 'todo', title: day, mark: day, fields }
  return { titleName, singleton: true, sessions: { 'single': session } }
}

const createTodoGroup = (): GroupData => {
  const monday = createDayTitleData('Monday')
  const tuesday = createDayTitleData('Tuesday')
  const wednesday = createDayTitleData('Wednesday')
  const thursday = createDayTitleData('Thursday')
  const friday = createDayTitleData('Friday')
  const titles = [monday, tuesday, wednesday, thursday, friday];
  const groupData = { groupName: 'todo', titles, display: false };
  return groupData;
}

export { establish, getGroupDataList, getTitleData, exportData, importData, getMark, createNewGroup, createTitleData, isSingleton, getComponentType, fillInComponentType, createTodoGroup };
