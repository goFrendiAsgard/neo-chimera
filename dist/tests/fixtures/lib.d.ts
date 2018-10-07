export declare function add(a: number, b: number): number;
export declare function minus(a: number, b: number): Promise<number>;
export declare function multiply(a: number, b: number, callback: (error: Error, result: number) => void): void;
export declare const syncFunction: typeof add;
export declare const asyncFunction: (a: number, b: number) => Promise<number>;
export declare const functionWithCallback: (a: number, b: number, cb: (error: any, result: any) => void) => void;
export declare const cmd: string;
export declare const rootSquare: string;
export declare const resolvingPromise: Promise<number>;
export declare const rejectingPromise: Promise<never>;
