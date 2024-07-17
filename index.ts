'use strict'
import * as fs from 'fs';
import * as path from 'path';

/**
 * Parses the content of an array string and returns an array of items
 * 
 * @param {string} arrayString - A string representing the array
 * @returns {Array<string>} - An array of items
 */
function arrayContent(arrayString: string): string {
    const items: string[] = [];
    let currentItem = '';
    let inString = false;
    let stringChar = '';
    let inObject = 0;

    for (let i = 0; i < arrayString.length; i++) {
        const char = arrayString[i];

        if (inString) {
            if (char === stringChar) {
                inString = false;
            }
            currentItem += char;
        } else {
            if (char === '"' || char === "'") {
                inString = true;
                stringChar = char;
                currentItem += char;
            } else if (char === '{') {
                inObject++;
                currentItem += char;
            } else if (char === '}') {
                inObject--;
                currentItem += char;
            } else if (char === ',' && inObject === 0) {
                items.push(currentItem.trim());
                currentItem = '';
            } else {
                currentItem += char;
            }
        }
    }

    if (currentItem) {
        items.push(currentItem.trim());
    }

    return items.map(item => {
        if (!item.startsWith('Object(') && !item.startsWith('Array(') && isNaN(Number(item)) && item !== 'true' && item !== 'false' && !item.startsWith('"') && !item.startsWith("'")) {
            item = `\${item}`;
        }
        return item;
    }).join(',');
}

/**
 * Parser class for analyzing .isadb files.
 */
class Parser {
    private lines: string[];
    public db: { [key: string]: any } = {};

    /**
     * Creates an instance of Parser
     * 
     * @param {string} fileName - The name of the file to be analyzed.
     */
    constructor(fileName: string) {
        const content = fs.readFileSync(fileName, 'utf-8');
        this.lines = content.split('\n');
    }

    /**
     * Analyzes the database file and returns the parsed database object.
     * 
     * @returns {object} - The parsed database object.
     */
    databaseFile(): { [key: string]: any } {
        let inBlockComment = false;
        this.db = {};
        this.lines.forEach(line => {
            line = line.trim();

            if (inBlockComment) {
                if (line.endsWith('*/')) {
                    inBlockComment = false;
                }
                return;
            }

            if (line.startsWith('#') || line.startsWith('/*')) {
                if (!line.endsWith('*/')) {
                    inBlockComment = true;
                }
                return;
            }

            const regex = /\$(\w+)\[(.*)\]/;
            const match = regex.exec(line);

            if (match) {
                const variableName = match[1];
                let variableValue = match[2];
                if (variableValue.startsWith('Object(') && variableValue.endsWith(')')) {
                    try {
                        const objectString = variableValue.slice(7, -1);
                        const parsedObject = JSON.parse(objectString.replace(/(\w+):/g, '"$1":').replace(/'/g, '"'));
                        this.db[variableName] = parsedObject;
                    } catch (e) {
                        console.error('[IsaDB] Error evaluating object:', variableName, e);
                    }
                } else if (variableValue.startsWith('Number(') && variableValue.endsWith(')')) {
                    this.db[variableName] = Number(variableValue.slice(7, -1));
                } else if (variableValue.startsWith('Boolean(') && variableValue.endsWith(')')) {
                    this.db[variableName] = variableValue.slice(8, -1) === 'true';
                } else if (variableValue.startsWith('Array(') && variableValue.endsWith(')')) {
                    try {
                        const arrayContentDone = arrayContent(variableValue.slice(6, -1));
                        this.db[variableName] = JSON.parse(`[${arrayContentDone}]`);
                    } catch (e) {
                        console.error(`[IsaDB] Error evaluating array: ${variableName}`, e);
                    }
                } else {
                    this.db[variableName] = variableValue.replace(/"/g, '').replace(/'/g, '');
                }
            }
        });
        return this.db;
    }
}

/**
 * Represents a value within a database instance.
 */
class InstanceValue {
    instance: Instance;
    key: string;
    value: any;

    /**
     * Creates an instance of InstanceValue
     * 
     * @param {Instance} instance - The database instance. 
     * @param {string} key - The key of the value
     * @param {*} value - The value 
     */
    constructor(instance: Instance, key: string, value: any) {
        this.instance = instance;
        this.key = key;
        this.value = value;
    }

    /**
     * Gets a sub-key value.
     * 
     * @param {string} subKey - The sub-key to get the value. 
     * @returns {*} - The value of the sub-key. 
     */
    get(subKey: string): any {
        return this.instance.set(`${this.key}.${subKey}`, this.value);
    }

    /**
     * Sets a sub-key value.
     * 
     * @param {string} subKey - The sub-key to set the value. 
     * @param {*} value - The value to set.
     * @returns {*} - The updated value.
     */
    set(subKey: string, value: any): any {
        if (value) {
            return this.instance.set(`${this.key}.${subKey}`, value);
        } else {
            return this.instance.set(`${this.key}`, value);
        }
    }

    /**
     * Checks if a sub-key exists.
     * 
     * @param {string} subKey - The sub-key to check existence. 
     * @returns {boolean} - True if the sub-key exists, false otherwise.
     */
    has(subKey: string): boolean {
        return this.instance.has(`${this.key}.${subKey}`);
    }

    /**
     * Removes a sub-key.
     * 
     * @param {string} subKey - The sub-key to be removed. 
     * @returns {boolean} - True if the sub-key is removed, false otherwise.
     */
    remove(subKey: string): boolean {
        if (subKey) {
            return this.instance.remove(`${this.key}.${subKey}`);
        } else {
            return this.instance.remove(`${this.key}`);
        }
    }

    number = {
        /**
         * Adds a value to the current number.
         * 
         * @param {number} value - The value to add. 
         * @returns {void}
         */
        add: (value: number) => {
            return this.instance.number.add(this.key, value);
        },
        /**
         * Subtracts a value from the current number.
         * 
         * @param {number} value - The value to subtract.
         * @returns {void}
         */
        sub: (value: number) => {
            return this.instance.number.sub(this.key, value);
        },
        /**
         * Multiplies the current number by a value.
         * 
         * @param {number} value - The value to multiply.
         * @returns {void}
         */
        multiply: (value: number) => {
            return this.instance.number.multiply(this.key, value);
        },
        /**
         * Divides the current number by a value.
         * 
         * @param {number} value - The value to divide. 
         * @returns {void}
         */
        divide: (value: number) => {
            return this.instance.number.divide(this.key, value);
        }
    }

    array = {
        /**
         * Checks if a value exists in the array.
         * 
         * @param {*} value - The value to check.  
         * @returns {boolean} - True if the value exists in the array, false otherwise.
         */
        has: (value: any) => {
            return this.instance.array.has(this.key, value);
        },
        /**
         * Adds a value to the array.
         * 
         * @param {*} value - The value to add.
         * @returns {void}
         */
        push: (...value: any[]) => {
            return this.instance.array.push(this.key, ...value);
        }
    }
}

/**
 * Represents a database instance.
 */
class Instance {
    fileName: string;

    /**
     * Creates an instance.
     * 
     * @param {string} [fileName] - The name of the database file.
     */
    constructor(fileName?: string) {
        if (fileName !== undefined && fileName !== null) {
            if (fs.existsSync(path.join(__dirname, fileName.replace('.isadb', '') + '.isadb'))) {
                this.fileName = fileName.replace('.isadb', '') + '.isadb';
            } else {
                fs.writeFileSync(fileName.replace('.isadb', '') + '.isadb', '');
                this.fileName = fileName.replace('.isadb', '') + '.isadb';
            }
        }
    }

    /**
     * Gets all the values from the instance.
     * 
     * @returns {object} - An object containing all the values of the instance.
     */

    all(): { [key: string]: any } {
        const db = new Parser(path.join(__dirname, this.fileName)).databaseFile()
        return db
    }

    /**
     * Sets a value for a key.
     * 
     * @param {string} key - The key to set the value. 
     * @param {*} value - The value to set.
     * @returns {*} - The value set.
     */
    set(key: string, value: any): any {
        const parser = new Parser(this.fileName);
        parser.databaseFile();
        parser.db[key] = value;
        this.write(parser.db);
        return parser.db[key];
    }

    /**
     * Checks if a key exists.
     * 
     * @param {string} key - The key to check existence.
     * @returns {boolean} - True if the key exists, false otherwise.
     */
    has(key: string): boolean {
        const parser = new Parser(this.fileName);
        parser.databaseFile();
        return parser.db[key] !== undefined;
    }

    /**
     * Removes a key.
     * 
     * @param {string} key - The key to be removed. 
     * @returns {boolean} - True if the key is removed, false otherwise.
     */
    remove(key: string): boolean {
        const parser = new Parser(this.fileName);
        parser.databaseFile();
        delete parser.db[key];
        this.write(parser.db);
        return !parser.db[key];
    }

    /**
     * Writes the database object to the file.
     * 
     * @param {object} db - The database object to write.
     */
    private write(db: { [key: string]: any }): void {
        const data = Object.entries(db).map(([key, value]) => {
            if (typeof value === 'object') {
                return `\$${key}[${JSON.stringify(value)}]`;
            } else {
                return `\$${key}[${value}]`;
            }
        }).join('\n');

        fs.writeFileSync(this.fileName, data);
    }

    number = {
        /**
         * Adds a value to the current number.
         * 
         * @param {string} key - The key of the number. 
         * @param {number} value - The value to add.
         * @returns {void}
         */
        add: (key: string, value: number) => {
            const currentValue = this.get(key);
            if (typeof currentValue === 'number') {
                this.set(key, currentValue + value);
            }
        },
        /**
         * Subtracts a value from the current number.
         * 
         * @param {string} key - The key of the number. 
         * @param {number} value - The value to subtract.
         * @returns {void}
         */
        sub: (key: string, value: number) => {
            const currentValue = this.get(key);
            if (typeof currentValue === 'number') {
                this.set(key, currentValue - value);
            }
        },
        /**
         * Multiplies the current number by a value.
         * 
         * @param {string} key - The key of the number. 
         * @param {number} value - The value to multiply.
         * @returns {void}
         */
        multiply: (key: string, value: number) => {
            const currentValue = this.get(key);
            if (typeof currentValue === 'number') {
                this.set(key, currentValue * value);
            }
        },
        /**
         * Divides the current number by a value.
         * 
         * @param {string} key - The key of the number. 
         * @param {number} value - The value to divide.
         * @returns {void}
         */
        divide: (key: string, value: number) => {
            const currentValue = this.get(key);
            if (typeof currentValue === 'number') {
                this.set(key, currentValue / value);
            }
        }
    }

    array = {
        /**
         * Checks if a value exists in the array.
         * 
         * @param {string} key - The key of the array. 
         * @param {*} value - The value to check.
         * @returns {boolean} - True if the value exists in the array, false otherwise.
         */
        has: (key: string, value: any) => {
            const currentValue = this.get(key);
            if (Array.isArray(currentValue)) {
                return currentValue.includes(value);
            }
            return false;
        },
        /**
         * Adds a value to the array.
         * 
         * @param {string} key - The key of the array. 
         * @param {*} value - The value to add.
         * @returns {void}
         */
        push: (key: string, ...value: any[]) => {
            const currentValue = this.get(key);
            if (Array.isArray(currentValue)) {
                this.set(key, [...currentValue, ...value]);
            }
        }
    }

    /**
     * Gets a value from the database.
     * 
     * @param {string} key - The key of the value to get.
     * @returns {*} - The value of the key.
     */
    get(key: string): any {
        const parser = new Parser(this.fileName);
        parser.databaseFile();
        return parser.db[key];
    }

    /**
     * Gets a value instance for a key.
     * 
     * @param {string} key - The key of the value instance. 
     * @returns {InstanceValue} - The value instance.
     */
    value(key: string): InstanceValue {
        return new InstanceValue(this, key, this.get(key));
    }
}

export { Parser, Instance, InstanceValue };
