declare module 'query-string' {
    let x: {
        parse: (value: string) => any;
        stringify: (value: any) => string;
    }
    export = x;
}