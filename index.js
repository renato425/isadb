const fs = require('fs');
const path = require('path');

/**
 * Parses the content of an array string and returns an array of items
 * 
 * @param {string} arrayString - A string representando o array
 * @returns {Array} - Um array de itens
 */
function arrayContent(arrayString) {
    const items = [];
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
        if (item.startsWith('Object(') && item.endsWith(')')) {
            return JSON.parse(item.slice(7, -1).replace(/(\w+):/g, '"$1":').replace(/'/g, '"'));
        } else if (!item.startsWith('Object(') && !item.startsWith('Array(') && isNaN(item) && item !== 'true' && item !== 'false' && !item.startsWith('"') && !item.startsWith("'")) {
            item = '${item}';
        }
        return item;
    });
}

/**
 * Classe Parser para analisar arquivos .isadb.
 */
class Parser {
    /**
     * Cria uma instância de Parser
     * 
     * @param {string} fileName - O nome do arquivo a ser analisado. 
     */
    constructor(fileName) {
        let content = fs.readFileSync(fileName, 'utf-8');

        const lines = content.split('\n');
        this.lines = lines;
    }

    /**
     * It analyzes the database file and returns the analyzed database object.
     * 
     * @returns {object} - The object of the database analyzed.
     */
    databaseFile() {
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
                        console.error('[IsaDB] Erro ao avaliar objeto:', variableName, e);
                    }
                } else if (variableValue.startsWith('Number(') && variableValue.endsWith(')')) {
                    this.db[variableName] = Number(variableValue.slice(7, -1));
                } else if (variableValue.startsWith('Boolean(') && variableValue.endsWith(')')) {
                    this.db[variableName] = variableValue.slice(8, -1) === 'true';
                } else if (variableValue.startsWith('Array(') && variableValue.endsWith(')')) {
                    try {
                        let arrayContententer = arrayContent(variableValue.slice(6, -1))
                        this.db[variableName] = arrayContententer;
                    } catch (e) {
                        console.error(`[IsaDB] Erro ao avaliar array: ${variableName}`, e);
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
    /**
     * Cria um InstanceValue
     * 
     * @param {Instance} instance - A instância do banco de dados. 
     * @param {string} key - A chave do valor
     * @param {*} value - O valor
     */
    constructor(instance, key, value) {
        this.instance = instance;
        this.key = key;
        this.value = value
    }

    /**
     * Obtém um valor subKey.
     * 
     * @param {string} subKey - A subKey para obter o valor.
     * @returns {*} - O valor da subKey.
     */
    get(subKey) {
        return this.instance.get(`${this.key}.${subKey}`);
    }

    /**
     * Define um valor subKey.
     * 
     * @param {string} subKey - A subKey para definir o valor.
     * @param {*} value - O valor a ser definido.
     * @returns {*} - O valor atualizado.
     */
    set(subKey, value) {
        if (value) {
            return this.instance.set(`${this.key}.${subKey}`, value);
        } else {
            return this.instance.set(`${this.key}`, value);
        }
    }
    
    /**
     * Verifica se uma subKey existe.
     * 
     * @param {string} subKey - A subKey para verificar a existência. 
     * @returns {boolean} - True se a subKey existir, caso contrário false.
     */
    has(subKey) {
        return this.instance.has(`${this.key}.${subKey}`);
    }

    /**
     * Remove uma subKey.
     * 
     * @param {string} subKey - A subKey a ser removida. 
     * @returns {boolean} - True se a subKey for removida, caso contrário false.
     */
    remove(subKey) {
        if (subKey) {
            return this.instance.remove(`${this.key}.${subKey}`);
        } else {
            return this.instance.remove(`${this.key}`);
        }
    }

    number = {
        /**
         * Adiciona um valor ao número atual.
         * 
         * @param {number} value - O valor a ser adicionado. 
         * @returns {void}
         */
        add: (value) => {
            return this.instance.number.add(this.key, value);
        },
        /**
         * Subtrai um valor do número atual.
         * 
         * @param {number} value - O valor a ser subtraído.
         * @returns {void}
         */
        sub: (value) => {
            return this.instance.number.sub(this.key, value);
        },
        /**
         * Multiplica o número atual por um valor.
         * 
         * @param {number} value - O valor a ser multiplicado.
         * @returns {void}
         */
        multiply: (value) => {
            return this.instance.number.multiply(this.key, value);
        },
        /**
         * Divide o número atual por um valor.
         * 
         * @param {number} value - O valor a ser dividido. 
         * @returns {void}
         */
        divide: (value) => {
            return this.instance.number.divide(this.key, value);
        }
    }

    array = {
        /**
         * Verifica se um valor existe no array.
         * 
         * @param {*} value - O valor a ser verificado.  
         * @returns {boolean} - True se o valor existir no array, caso contrário false.
         */
        has: (value) => {
            return this.instance.array.has(this.key, value);
        },
        /**
         * Adiciona um valor ao array.
         * 
         * @param {*} value - O valor a ser adicionado.
         * @returns {void}
         */
        push: (...value) => {
            return this.instance.array.push(this.key, ...value);
        }
    }
}

/**
 * Representa uma instância do banco de dados.
 */
class Instance {
    /**
     * Cria uma instância.
     * 
     * @param {string} fileName - O nome do arquivo do banco de dados.
     */
    constructor(fileName) {
        if (fileName !== undefined && fileName !== null) {
            if (fs.existsSync(path.join(__dirname, fileName.replace('.isadb', '') + '.isadb'))) {
                this.fileName = fileName.replace('.isadb', '') + '.isadb';
            } else {
                fs.writeFileSync(fileName.replace('.isadb', '') + '.isadb', '');
                this.fileName = fileName.replace('.isadb', '') + '.isadb';
            }
        } else {
            if (fs.existsSync(path.join(__dirname, 'db.isadb'))) {
                this.fileName = 'db.isadb';
                return;
            }
            fs.writeFileSync('db.isadb', '');
            this.fileName = 'db.isadb';
        }
    }

    /**
     * Obtém todo o banco de dados.
     * 
     * @returns {object | void} - O objeto do banco de dados, se existir.
     */
    all() {
        const parser = new Parser(this.fileName).databaseFile();
        return parser;
    }

    /**
     * Obtém uma propriedade do banco de dados.
     * 
     * @param {string} propertyName - O nome da propriedade
     * @returns {InstanceValue | undefined} - Funções para manipular o valor retornado, ou undefined se não existir.
     */
    get(propertyName) {
        const keys = propertyName.replace(/\[(\w+)\]/g, '.$1').split('.');
        let value = new Parser(this.fileName).databaseFile();
        
        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                return undefined;
            }
        }

        return new InstanceValue(this, propertyName, value);
    }

    /**
     * Função para escrever no banco de dados. Não é necessário escrever dentro do seu código.
     * 
     * @param {object} db - O banco de dados inteiro.
     */
    _writeDb(db) {
        let content = '';
        for (const [key, value] of Object.entries(db)) {
            if (typeof value === 'object' && !Array.isArray(value)) {
                content += `$${key}[Object(${JSON.stringify(value).replace(/"([^"]+)":/g, '$1:').replace(/"/g, "'")})]\n`;
            } else if (Array.isArray(value)) {
                content += `$${key}[Array(${value.map(v => {
                    if (typeof v === 'object') return `Object(${JSON.stringify(v).replace(/"([^"]+)":/g, '$1:').replace(/"/g, "'")})`;
                    return JSON.stringify(v);
                }).join(', ')})]\n`;
            } else if (typeof value === 'number') {
                content += `$${key}[Number(${value})]\n`;
            } else if (typeof value === 'boolean') {
                content += `$${key}[Boolean(${value})]\n`;
            } else {
                content += `$${key}[${value}]\n`;
            }
        }

        fs.writeFileSync(this.fileName, content);
    }

    /**
     * Salva uma nova propriedade no banco de dados.
     * 
     * @param {string} propertyName - O nome da propriedade a ser salva.
     * @param {*} value - O valor dessa propriedade.
     */
    set(propertyName, value) {
        const keys = propertyName.replace(/\[(\w+)\]/g, '.$1').split('.');
        let db = new Parser(this.fileName).databaseFile();
        let obj = db;

        for (let i = 0; i < keys.length - 1; i++) {
            if (!obj[keys[i]]) {
                obj[keys[i]] = {};
            }
            obj = obj[keys[i]];
        }

        obj[keys[keys.length - 1]] = value;

        this._writeDb(db);
    }

    /**
     * Verifica se a propriedade existe.
     * 
     * @param {string} propertyName - O nome da propriedade a ser verificada.
     * @returns {boolean} - True se a propriedade existir no banco de dados, caso contrário false.
     */
    has(propertyName) {
        const keys = propertyName.replace(/\[(\w+)\]/g, '.$1').split('.');
        let value = new Parser(this.fileName).databaseFile();

        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                return false;
            }
        }

        return true;
    }

    /**
     * Remove uma propriedade do banco de dados.
     * 
     * @param {string} propertyName - O nome da propriedade a ser removida.
     * @returns {boolean} - True se a propriedade for removida, caso contrário false.
     */
    remove(propertyName) {
        const keys = propertyName.replace(/\[(\w+)\]/g, '.$1').split('.');
        let db = new Parser(this.fileName).databaseFile();
        let obj = db;

        for (let i = 0; i < keys.length - 1; i++) {
            if (!obj[keys[i]]) return;
            obj = obj[keys[i]];
        }
        delete obj[keys[keys.length - 1]];

        this._writeDb(db);
        return true;
    }

    array = {
        /**
         * Verifica se um valor existe no array.
         * 
         * @param {string} propertyName - O nome da propriedade a ser modificada
         * @param {*} value - O valor a ser verificado.  
         * @returns {boolean} - True se o valor existir no array, caso contrário false.
         */
        has: (propertyName, value) => {
            const array = this.get(propertyName).value;
            if (!Array.isArray(array)) return false;
            return array.includes(value);
        },
        /**
         * Adiciona um valor ao array.
         * 
         * @param {string} propertyName - O nome da propriedade a ser modificada
         * @param {*} value - O valor a ser adicionado.
         * @returns {void}
         */
        push: (propertyName, ...value) => {
            const array = this.get(propertyName).value;
            if (!Array.isArray(array)) return;
            array.push(...value);
            this.set(propertyName, array);
        }
    }

    number = {
        /**
         * Adiciona um valor ao número atual.
         * 
         * @param {string} propertyName - O nome da propriedade a ser modificada
         * @param {number} value - O valor a ser adicionado. 
         * @returns {void}
         */
        add: (propertyName, value) => {
            const num = this.get(propertyName).value;
            if (typeof num !== 'number' || typeof value !== 'number') return;
            this.set(propertyName, num + value);
        },
        /**
         * Subtrai um valor do número atual.
         * 
         * @param {string} propertyName - O nome da propriedade a ser modificada
         * @param {number} value - O valor a ser subtraído.
         * @returns {void}
         */
        sub: (propertyName, value) => {
            const num = this.get(propertyName).value;
            if (typeof num !== 'number' || typeof value !== 'number') return;
            this.set(propertyName, num - value);
        },
        /**
         * Multiplica o número atual por um valor.
         * 
         * @param {string} propertyName - O nome da propriedade a ser modificada
         * @param {number} value - O valor a ser multiplicado.
         * @returns {void}
         */
        multiply: (propertyName, value) => {
            const num = this.get(propertyName).value;
            if (typeof num !== 'number' || typeof value !== 'number') return;
            this.set(propertyName, num * value);
        },
        /**
         * Divide o número atual por um valor.
         * 
         * @param {string} propertyName - O nome da propriedade a ser modificada
         * @param {number} value - O valor a ser dividido.
         * @returns {void}
         */
        divide: (propertyName, value) => {
            const num = this.get(propertyName).value;
            if (typeof num !== 'number' || typeof value !== 'number') return;
            this.set(propertyName, num / value);
        }
    }
}

module.exports.arrayContent = arrayContent;
module.exports.Instance = Instance;
module.exports.InstanceValue = InstanceValue;
module.exports.Parser = Parser;
