interface ClassOf<T> {
    new(...args: any[]): T
}

export const extendClass = <T, S>(class_: ClassOf<T>, dynamicMethods: S) =>
    (...args: any[]) => {
        const o = new class_(args) as T & S;
        for (const key of Object.keys(dynamicMethods) as Array<keyof S>) {
            const method = dynamicMethods[key];
            (o as S)[key] = method; // type sig seems unnecessary
        }
        return o;
    }
