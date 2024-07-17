![isadb-logo](https://i.ibb.co/0thV6wj/logo-green.png)

# 😎 IsaDB - Easy DB.

### A new way for you to control your project data.

[![npm](https://img.shields.io/badge/npm_version-v1.0.3-FF0000)](https://npmjs.com/package/isadb)  [![renatiin](https://img.shields.io/badge/maded_with_love_by-renatiin-29AB76)](https://github.com/renato425)  [![docs](https://img.shields.io/badge/docs-8A2BE)](https://isadb.js.org)

[!["Buy Me A Coffee"](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](https://www.buymeacoffee.com/renatiin)


#### About
> With a new look, IsaDB works in the same way, but supports new entries and maximizes its use even more!

Read the [official documentation!](https://isadb.js.org)


##### Compatibility: Supports EcmaScript, CommonJS and TypeScript

## Instalation & Example Usage
(Tested in node `v18.18.2`)
#### Install isadb
```
npm install isadb
yarn add isadb
pnpm add isadb
bun add isadb
```

#### Creating a instance and saving things
```js
//using Ecma
import { Instance } from 'isadb'

async function main() {
    const instance = new Instance() // Create a new instance, you can change the name of the file inside this class.

    instance.set('foo', 'bar') // Save inside the instance file.
    console.log(instance.get('foo')) // Returns -> bar
}

//using CommonJS
const isaDB = require('isadb')

async function main() {
    const instance = new isaDB.Instance()

    instance.set('foo', 'bar')
    console.log(instance.get('foo'))
}
```

## Contribuing
Before creating an issue, please ensure that it hasn't already been reported/suggested, and double-check the [documentation](https://isadb.js.org).

Check the [repository](https://github.com/renato425/isadb) if you'd like to submit a PR.

## Help
If you don't undestand something in the documentation, you are experiencing problems, or you just need a gentle nudge in the right direction, please don't hesitate to make a issue in [GitHub](https://github.com/renato425/isadb). And if it's extremely serious, contact me on Discord - My username: `renatiinofc`.
