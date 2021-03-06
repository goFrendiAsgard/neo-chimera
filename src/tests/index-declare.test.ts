import { declare } from "../index";
import { asyncMinus, commandRootSquare, nodebackMultiply, syncAdd } from "./fixtures/lib";
import { initPlayer, Player } from "./fixtures/Player";

describe("non-error declarative style", () => {

    it ("works for normal config", async () => {
        const main = declare({
            bootstrap: "run",
            injection: { asyncMinus, commandRootSquare, nodebackMultiply, syncAdd },
            component: {
                run: {
                    setup: "R.pipeP",
                    parts: [
                        "${plusAndMinus}",
                        "${spreadListAndMultiply}",
                        "${rootSquare}",
                    ],
                },
                plusAndMinus: {
                    setup: "X.concurrent",
                    parts: ["${syncAdd}", "${asyncMinus}"],
                },
                spreadListAndMultiply: {
                    setup: "R.apply",
                    parts: "${multiply}",
                },
                multiply: {
                    setup: "X.wrapNodeback",
                    parts: "${nodebackMultiply}",
                },
                rootSquare: {
                    setup: "X.wrapCommand",
                    parts: ["${commandRootSquare}"],
                },
            },
        });
        // action
        const result = await main(10, 6);
        expect(result).toBe(8);
        return null;
    });

    it("works when returning promise", async () => {
        const main = declare({
            bootstrap: "hello",
            injection: {
                hello: (name) => Promise.resolve(`Hello ${name}`),
            },
        });
        const result = await main("mantan");
        expect(result).toBe("Hello mantan");
        return null;
    });

    it("works with non-string parts", () => {
        const main = declare({
            bootstrap: "addFour",
            component: {
                addFour: {
                    setup: "R.add",
                    parts: 4,
                },
            },
        });
        const result = main(3);
        expect(result).toBe(7);
    });

    it("works with injected value as bootstrap", () => {
        const main = declare({
            bootstrap: "seven",
            injection: {seven: 7},
        });
        const result = main();
        expect(result).toBe(7);
    });

    it("works with injected-dotted-element as bootstrap", () => {
        const main = declare({
            bootstrap: "Math.pow",
            injection: {Math},
        });
        const result = main(5, 2);
        expect(result).toBe(25);
    });

    it("works with injected-dotted-element as component", () => {
        const main = declare({
            bootstrap: "powerBy",
            injection: {Math},
            component: {
                powerBy: {
                    setup: "Math.pow",
                },
            },
        });
        const result = main(5, 2);
        expect(result).toBe(25);
    });

    it("works with non-template-string parts", () => {
        const main = declare({
            bootstrap: "sayHello",
            component: {
                sayHello: {
                    setup: "R.concat",
                    parts: "Hello ",
                },
            },
        });
        const result = main("world");
        expect(result).toBe("Hello world");
    });

    it("works with template-string", () => {
        const main = declare({
            bootstrap: "run",
            injection: {
                four: 4,
                five: 5,
                createAreaCalculator: (box) => () => {
                    return box.width * box.height;
                },
            },
            component: {
                run: {
                    setup: "createAreaCalculator",
                    parts: {
                        width: "${four}",
                        height: "${five}",
                    },
                },
            },
        });
        const result = main();
        expect(result).toBe(20);
    });

    it("works with escaped template-string", () => {
        const main = declare({
            bootstrap: "run",
            injection: {
                hi: "hello",
            },
            component: {
                run: {
                    setup: "R.concat",
                    parts: "\\${hi}",
                },
            },
        });
        const result = main("world");
        expect(result).toBe("${hi}world");
    });

    it("works with escaped template-string that has no curly brace", () => {
        const main = declare({
            bootstrap: "run",
            injection: {
                hi: "hello",
            },
            component: {
                run: {
                    setup: "R.concat",
                    parts: "\\$hi",
                },
            },
        });
        const result = main("world");
        expect(result).toBe("$hiworld");
    });

    it("works with no arity setting", () => {
        const main = declare({
            bootstrap: "run",
            injection: {
                join: (...args) => args.join("-"),
            },
            component: {
                run: {
                    setup: "join",
                },
            },
        });
        const result = main("a", "b", "c");
        expect(result).toBe("a-b-c");
    });

    it("works with arity setting", () => {
        const main = declare({
            bootstrap: "run",
            injection: {
                join: (...args) => args.join("-"),
            },
            component: {
                run: {
                    arity: 2,
                    setup: "join",
                },
            },
        });
        const result = main("a", "b", "c");
        expect(result).toBe("a-b");
    });

    it("works with non-function component", () => {
        const main = declare({
            bootstrap: "run",
            injection: {
                four: 4,
                five: 5,
            },
            component: {
                run: {
                    setup: "R.add",
                    parts: ["${four}", "${five}"],
                },
            },
        });
        const result = main();
        expect(result).toBe(9);
    });

});

describe("brief syntax", () => {

    it("works with brief structure", () => {
        const main = declare({
            bootstrap: "run",
            component: {
                run: ["R.pipe", "${add}", "${addOne}"],
                add: "R.add",
                addOne: {
                    setup: ["R.add", 1],
                },
            },
        });
        const result = main(4, 5);
        expect(result).toBe(10);
    });

    it("works with brief component name without curly brace", () => {
        const main = declare({
            bootstrap: "run",
            component: {
                run: ["R.pipe", "$add", "$addOne"],
                add: "R.add",
                addOne: {
                    setup: ["R.add", 1],
                },
            },
        });
        const result = main(4, 5);
        expect(result).toBe(10);
    });

});

describe("non-error declarative style with class helpers", () => {

    it("works with class helper: R.construct, X.invoker", () => {
        const main = declare({
            bootstrap: "run",
            injection: { Player },
            component: {
                run: {
                    setup: "R.pipe",
                    parts: [
                        "${constructPlayer}",
                        "${setWeaponToFrostmourne}",
                        "${R.last}",
                        "${setDamageTo50}",
                        "${R.last}",
                        "${attack}",
                        "${R.head}",
                    ],
                },
                constructPlayer: ["R.construct", "${Player}"],
                setWeaponToFrostmourne: ["X.invoker", 1, "setWeapon", "Frostmourne"],
                setDamageTo50: ["X.invoker", 1, "setDamage", 50],
                attack: ["X.invoker", 0, "attack"],
            },
        });
        const result = main("Arthas");
        expect(result).toBe("Arthas attack with Frostmourne, deal 50 damage");
    });

    it("works with classHelper: R.construct, X.initAndFluent", () => {
        const main = declare({
            bootstrap: "run",
            injection: { Player },
            component: {
                run: {
                    setup: "X.initAndFluent",
                    parts: [[
                        [1, "$constructPlayer"],
                        [1, "setWeapon"],
                        [1, "setDamage"],
                        [0, "attack"],
                    ]],
                },
                constructPlayer: ["R.construct", "${Player}"],
            },
        });
        const result = main("Thrall", "Lightning Bolt", 50);
        expect(result).toBe("Thrall attack with Lightning Bolt, deal 50 damage");
    });

    it("works with classHelper: X.initAndFluent", () => {
        const main = declare({
            bootstrap: "run",
            injection: { initPlayer },
            component: {
                run: {
                    setup: "X.initAndFluent",
                    parts: [[
                        [1, "$initPlayer"],
                        [1, "setWeapon"],
                        [1, "setDamage"],
                        [0, "attack"],
                    ]],
                },
            },
        });
        const result = main("Thrall", "Lightning Bolt", 50);
        expect(result).toBe("Thrall attack with Lightning Bolt, deal 50 damage");
    });

});

describe("error declarative style", () => {

    it("throw error if component is not exists ", () => {
        try {
            const main = declare({
                bootstrap: "average",
                component: {
                    average: {
                        setup: "R.pipe",
                        parts: "${rataRata}",
                    },
                },
            });
            const result = main();
            throw(new Error(`Expect error, but get result: ${result}`));
        } catch (error) {
            expect(error.message).toContain(
                "Parse error, component `average`: Component `rataRata` is not defined",
            );
        }
    });

    it("throw error if bootstrap is not exists", () => {
        try {
            const main = declare({
                bootstrap: "oraono",
                component: {
                    nor: {
                        setup: "R.pipe",
                        parts: ["${R.or}", "${R.not}"],
                    },
                },
            });
            const result = main();
            throw(new Error(`Expect error, but get result: ${result}`));
        } catch (error) {
            expect(error.message).toContain(
                "Parse error, bootstrap component `oraono`: `oraono` is not defined",
            );
        }
    });

    it("throw error if `setup` yield error", () => {
        try {
            const main = declare({
                injection: {
                    errorAction: () => { throw(new Error("invalid action")); },
                },
                component: {
                    errorTest: {
                        setup: "errorAction",
                        parts: ["${R.or}"],
                    },
                },
                bootstrap: "errorTest",
            });
            const result = main();
            throw(new Error(`Expect error, but get result: ${result}`));
        } catch (error) {
            expect(error.message).toContain(
                "Parse error, component `errorTest`: invalid action",
            );
        }
    });

    it("throw error if component yield error-object on execution", () => {
        try {
            const main = declare({
                bootstrap: "run",
                injection: {
                    errorComponent: (val) => {
                        if (val === 9) {
                            throw(new Error("I hate nine"));
                        }
                        return val;
                    },
                },
                component: {
                    run: {
                        setup: "errorComponent",
                    },
                },
            });
            const result = main(9);
            throw(new Error(`Expect error, but get result: ${result}`));
        } catch (error) {
            expect(error.message).toContain(
                "Runtime error, component `run( 9 )`: I hate nine",
            );
        }
    });

    it("throw error if component yield error-string on execution", () => {
        try {
            const main = declare({
                bootstrap: "run",
                injection: {
                    errorComponent: (val) => {
                        if (val === 9) {
                            // tslint:disable
                            throw("I hate nine");
                        }
                        return val;
                    },
                },
                component: {
                    run: {
                        setup: "errorComponent",
                    },
                },
            });
            const result = main(9);
            throw(new Error(`Expect error, but get result: ${result}`));
        } catch (error) {
            expect(error.message).toContain(
                "Runtime error, component `run( 9 )`: I hate nine",
            );
        }
    });

    it("throw error if component yield rejected Promise", async () => {
        const main = declare({
            bootstrap: "run",
            injection: {
                errorComponent: (val) => {
                    if (val === 9) {
                        return Promise.reject("I hate nine");
                    }
                    return Promise.resolve(val);
                },
            },
            component: {
                run: {
                    setup: "errorComponent",
                },
            },
        });
        try {
            const result = await main(9);
            throw(new Error(`Expect error, but get result: ${result}`));
        } catch (error) {
            expect(error.message).toContain(
                "Runtime error, component `run( 9 )`: I hate nine",
            );
        }
    });

    it("throw error if component yield rejected Promise", async () => {
        const main = declare({
            bootstrap: "run",
            injection: {
                run: (val) => {
                    if (val === 9) {
                        return Promise.reject("I hate nine");
                    }
                    return Promise.resolve(val);
                },
            },
        });
        try {
            const result = await main(9);
            throw(new Error(`Expect error, but get result: ${result}`));
        } catch (error) {
            expect(error.message).toContain(
                "Runtime error, component `run( 9 )`: I hate nine",
            );
        }
    });

    it("throw error if component's setup is not executable", () => {
        try {
            const main = declare({
                bootstrap: "run",
                injection: {
                    four: 4,
                    five: 5,
                },
                component: {
                    run: {
                        setup: "four",
                    },
                },
            });
            const result = main();
            throw(new Error(`Expect error, but get result: ${result}`));
        } catch (error) {
            expect(error.message).toContain(
                "Parse error, component `run`: `four` is not a function",
            );
        }
    });

    it("throw error if component's setup not found", () => {
        try {
            const main = declare({
                bootstrap: "run",
                component: {
                    run: {
                        setup: "four",
                    },
                },
            });
            const result = main();
            throw(new Error(`Expect error, but get result: ${result}`));
        } catch (error) {
            expect(error.message).toContain(
                "Parse error, component `run`: `four` is not defined",
            );
        }
    });

    it("throw error if component's parts is not executable", () => {
        try {
            const main = declare({
                bootstrap: "run",
                component: {
                    run: {
                        setup: "R.add",
                        parts: ["${four}", "${five}"]
                    },
                },
            });
            const result = main();
            throw(new Error(`Expect error, but get result: ${result}`));
        } catch (error) {
            expect(error.message).toContain(
                "Parse error, component `run`: Component `four` is not defined",
            );
        }
    });

    it("throw error on infinite recursive call", () => {
        try {
            const main = declare({
                bootstrap: "run",
                component: {
                    run: {
                        setup: "R.pipe",
                        parts: ["${run}"]
                    },
                },
            });
            const result = main(10);
            throw(new Error(`Expect error, but get result: ${result}`));
        } catch (error) {
            expect(error.message).toContain(
                "Parse error, component `run`: Maximum call stack size exceeded",
            );
        }
    });

});
