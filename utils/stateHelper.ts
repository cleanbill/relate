import { Field, FieldComponentType, FieldType, GroupData, Matcher, Session, TitleData } from "../app/model";

const json = (text: string): any => {
  try {
    return JSON.parse(text);
  } catch (error) {
    return text;
  }
};


export const matchSetup = (needle: string): Matcher => {
  if (!needle) {
      return (s: string) => false;
  }
  return (haystack: string):boolean => {
      if (!haystack){
          return false;
      }
      return (haystack+'').toLowerCase().indexOf(needle.toLowerCase()) > -1;
  }
}

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
  const mark = now.getFullYear() + "-" + z(now.getMonth()+1) + "-" + z(now.getDate()) + ":" + z(now.getHours()) + ':' + minutes;
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
  const dir = document.getElementById('importData') as any;
  dir?.click();
  const file = dir.files[0] as File;
  console.log('data is ',file);
  const content = await file.text();
  localStorage.setItem('groups', content);
  return content;
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

const createDayTitleData = (no: number,day: string): TitleData => {
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
  const session = { no, group: 'todo', title: day, mark: day, fields }
  return { titleName, singleton: true, sessions: { "single": session } }
}

const createTodoGroup = (): GroupData => {
  const monday = createDayTitleData(0,'Monday')
  const tuesday = createDayTitleData(1,'Tuesday')
  const wednesday = createDayTitleData(2,'Wednesday')
  const thursday = createDayTitleData(3,'Thursday')
  const friday = createDayTitleData(4,'Friday')
  const titles = [monday, tuesday, wednesday, thursday, friday];
  const groupData = { groupName: 'todo', titles, display: false };
  return groupData;
}

export { establish, getGroupDataList, getTitleData, exportData, importData, getMark, createNewGroup, createTitleData, isSingleton, getComponentType, fillInComponentType, createTodoGroup };
