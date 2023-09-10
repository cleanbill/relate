export enum FieldComponentType {
    NONE = "N/A",
    HAPPY = 'HAPPY',
    ETL = 'EXTENDABLE TEXT LIST'
}

export enum FieldType {
    "text" = "text",
    "checkbox" = "checkbox",
    "color" = "color",
    "email" = "email",
    "image" = "image",
    "month" = "month",
    "number" = "number",
    "range" = "range",
    "tel" = "tel",
    "time" = "time",
    "url" = "url",
    "week" = "week",
    "date" = "date",
    "happy" = "happy",
    "list" = "list"
}
const fieldTypesArray = ():Array<String> =>{
    const result = new Array<String>();
    for (let fieldType in FieldType) {
        const add = isNaN(parseInt(fieldType));
        if (add){
            result.push(fieldType);
        }
    }
    return result;
}
export {fieldTypesArray};

export type Field = {
    id: number;
    fieldComponentType: FieldComponentType;
    fieldName: string;
    fieldType: FieldType;
    value: string;
    list?: Array<Field>;
    indent: number;
}

export type Session = {
    no: number,
    group: string,
    title: string,
    mark: string,
    fields: Array<Field>
}

export type GroupData = {
    groupName: string,
    titles: Array<TitleData>,
    display: boolean
}

export type TitleData = {
    titleName: string,
    singleton: boolean,
    sessions: Record<string, Session>
}


export type Matcher = (haystack:string) => boolean;
