const fs = require('fs')

class main {
    constructor() {
        if (!fs.existsSync('db.isadb')) {
            fs.writeFileSync('./db.isadb', '')
        }
    }
    addComent(comment) {
        let file = fs.readFileSync('./db.isadb').toString()
        try {
            fs.writeFileSync('./db.isadb', file + '\n' + '#' + comment)
        } catch (e) {
            return e
        }
    }
    get(value) {
        let file = fs.readFileSync('./db.isadb').toString()
        let arrayContents = file.split('\n')
        for (const i in arrayContents) {
            let newString = arrayContents[i],
            two = newString.split('[')
            for (const j in two) {
                let new2String = two[j],
                three = new2String.split(']')
                for (const k in three) {
                    if (three[k].replace('$', '') == value) {
                        try {
                        let content = newString.split('$' + three[k].replace('$', ''))
                        return content[1].replace('[', '').replace(']', '')
                        } catch(e) {
                            return e
                        }
                    }
                }
            }
        }
    }
    set(value, content) {
        let file = fs.readFileSync('./db.isadb').toString()
        try {
            fs.writeFileSync('./db.isadb', file + '\n' + `$${value}[${content}]`)
        } catch (e) {
            console.log(e)
            return
        }
        }
    remove(value) {
        let file = fs.readFileSync('./db.isadb').toString()
        let arrayContents = file.split('\n')
        for (const i in arrayContents) {
            let newString = arrayContents[i],
            two = newString.split('[')
            for (const j in two) {
                let new2String = two[j],
                three = new2String.split(']')
                for (const k in three) {
                    if (three[k].replace('$', '') == value) {
                        try {
                        let content = newString.split('$' + three[k].replace('$', ''))
                        if (content[1].replace('[', '').replace(']', '') !== '') {
                            let newContent = '$' + value + '[' + content[1].replace('[', '').replace(']', '') + ']'
                            let newStringFile = file.replace(newContent, '')
                            fs.writeFileSync('./db.isadb', newStringFile)
                        }
                        } catch(e) {
                            return e
                        }
                    }
                }
            }
        }
    }
}

module.exports = main