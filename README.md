# ATENÇÃO
A IsaDB em breve vai estar de cara nova, lembrando que o README abaixo vai ser do projeto que está sendo desenvolvido. Ele ainda não foi atualizado, mas será em breve. :)

# ATTENTION
IsaDB will soon have a new look, remembering that the README below will be from the project that is being developed. It hasn't been updated yet, but it will be soon. :)

# 😎 IsaDB - Easy DB.

### A new way for you to control your project data.

[![npm](https://img.shields.io/badge/npm_version-v1.0.0-FF0000)](https://npmjs.com/package/isadb)  [![renatiin](https://img.shields.io/badge/maded_with_love_by-renatiin-29AB76)](https://github.com/renato425)  [![docs](https://img.shields.io/badge/docs-8A2BE)](https://isadb.js.org)

#### About
> With a new look, IsaDB works in the same way, but supports new entries and maximizes its use even more!

The [official documentation](https://isadb.js.org) is supported in Portuguese and English.


##### Compatibility: Supports EcmaScript, CommonJS and TypeScript

## Instalation & Example Usage
(Tested in node `v18.18.2`)
#### Install isadb
```
npm install isadb
yarn install isadb
pnpm install isadb
bun install isadb
```

#### Creating a instance and saving things
```js
//using Ecma
import { Instance } from 'isadb'

async function main() {
    const instance = new Instance() // Create a new instance, you can change the name of the file inside this class.

    await instance.set('foo', 'bar') // Save inside the instance file.
    console.log(await instance.get('foo')) // Returns -> bar
}

//using CommonJS
const isaDB = require('isadb')

async function main() {
    const instance = new isaDB.Instance()

    await instance.set('foo', 'bar')
    console.log(await instance.get('foo'))
}
```

## Contribuing
Before creating an issue, please ensure that it hasn't already been reported/suggested, and double-check the [documentation](https://isadb.js.org).

Check the [repository](https://github.com/renato425/isadb) if you'd like to submit a PR.

## Help
If you don't undestand something in the documentation, you are experiencing problems, or you just need a gentle nudge in the right direction, please don't hesitate to make a issue in [GitHub](https://github.com/renato425/isadb). And if it's extremely serious, contact me on Discord - My username: `renatiinofc`.
