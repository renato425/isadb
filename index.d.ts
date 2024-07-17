declare module 'isadb' {
    /**
     * Parses the content of an array string and returns an array of items
     * 
     * @param {string} arrayString - A string representing the array
     * @returns {Array<string>} - An array of items
     */
    export function arrayContent(arrayString: string): string[]

    /**
     * Parser class for analyzing .isadb files.
     */
    export class Parser {
        constructor(fileName: string)

        lines: string[]
        db: { [key: string]: any }

        /**
         * Analyzes the database file and returns the parsed database object.
         * 
         * @returns {object} - The parsed database object.
         */
        databaseFile(): { [key: string]: any }
    }

    /**
     * Represents a value within a database instance.
     */
    export class InstanceValue {
        constructor(instance: Instance, key: string, value: any)

        instance: Instance
        key: string
        value: any

        /**
         * Gets a sub-key value.
         * 
         * @param {string} subKey - The sub-key to get the value.
         * @returns {*} - The value of the sub-key
         */
        get(subKey: string): any

        /**
         * Sets a sub-key value.
         * 
         * @param {string} subKey - The sub-key to set the value.
         * @param {*} value - The value to set.
         * @returns {*} - The updated value.
         */
        set(subKey: string, value: any): any

        /**
         * Checks if a sub-key exists.
         * 
         * @param {string} subKey - The sub-key to check existence.
         * @returns {boolean} - True if the sub-key exists, false otherwise.
         */
        has(subKey: string): boolean

        /**
         * Removes a sub-key.
         * 
         * @param {string} subKey - The sub-key to be removed.
         * @returns {boolean} - True if the sub-key is removed, false otherwise.
         */
        remove(subKey: string): boolean

        number: {
            add: (value: number) => void
            sub: (value: number) => void
            multiply: (value: number) => void
            divide: (value: number) => void
        }

        array: {
            has: (value: any) => boolean
            push: (...value: any[]) => void
        }
    }

    /**
     * Represents a database instance.
     */
    export class Instance {
        constructor(fileName?: string)

        fileName: string

        /**
         * Sets a value for a key.
         * 
         * @param {string} key - The key to set the value.
         * @param {*} value - The value to set.
         * @returns {*} - The value set.
         */
        set(key: string, value: any): any

        /**
         * Checks if a key exists.
         * 
         * @param {string} key - The key to check existence.
         * @returns {boolean} - True if the key exists, false otherwise.
         */
        has(key: string): boolean

        /**
         * Removes a key.
         * 
         * @param {string} key - The key to be removed.
         * @returns {boolean} - True if the key is removed, false otherwise.
         */
        remove(key: string): boolean

        /**
         * Gets all the values from the instance.
         * 
         * @returns {object} - An object containing all the values of the instance.
         */
        all(): { [key: string]: any }

        number: {
            add: (key: string, value: number) => void
            sub: (key: string, value: number) => void
            multiply: (key: string, value: number) => void
            divide: (key: string, value: number) => void
        }
        
        array: {
            has: (key: string, value: any) => boolean
            push: (key: string, ...value: any[]) => void
        }

        /**
         * Gets a value from the database.
         * 
         * @param {string} key - The key of the value to get.
         * @returns {*} - The value of the key.
         */
        get(key: string): any
    }
}