# IsaDB

**NPM:** [npm](https://npmjs.com/package/isadb.js)

**GITHUB:** [github](https://github.com/renato425/isadb)



IsaDB é um novo banco de dados para pessoas que iniciam na carreira de programador e para aqueles que já sabem programar.

Todos os conteúdos serão salvos em um arquivo `db.isadb` com fácil configuração.

# Exemplos
**Exemplo simples!**
```js
const isaDB = require('isadb.js')
const db = new isaDB()

//adicionando comentários
db.addComent('Olá, eu sou um comentário!')

//adicionando um conteúdo no database!
db.set('Valor', 'Conteúdo')
```

*Como vai ficar o db.isadb*

```
#Olá, eu sou um comentário
$Valor[Conteúdo]
```

**Removendo valores da db**
```js
db.remove('Valor')
```

*Como vai ficar o db.isadb*

```
#Olá, eu sou um comentário
```

*Em breve teremos um pacote onde você pode guardar senhas!*


# Manipulação do arquivo .isadb!

**Como setar um comentário:**

```
#Aqui está um comentário!
#Coloque uma # antes de comentar qualquer coisa!
#O Conteúdo do comentário não será lido pelo "package"
```


**Adicionando um conteúdo**

```
#Para colocar um conteúdo na db. adicione um $ antes... exemplo:
$NomeEmQuePoderáSerChamadoNoJs[ValorEmQueSeráRetornadoNoJs]
```

*Retornando no JS*

```js
console.log(db.get('NomeEmQuePoderáSerChamadoNoJs'))
```

# Setando outros valores!

**Setando um array**

```js
db.set('newArray', 'setArray([Olá, Tudo bem?])')
```


**Setando um número**

```js
db.set('newNumber', 'setNumber(150)')
```

# arrayTransformer - Como usar

**Primeiro, comece iniciando ele no seu index ou em qualquer outro arquivo**

```js
const arrayTransformer = new isadb.arrayTransformer()
```

**Depois, só usar os métodos. Essas funções são recomendadas ao usar o db normal**

```js
console.log(arrayTransformer.stringToArray('[Olá, Beleza?, Tudo bem!]')) //['Olá', 'Beleza?', 'Tudo bem!]
console.log(arrayTransformer.arrayToString(['Olá', 'Beleza?', 'Tudo bem!'])) //[Olá, Beleza?, Tudo bem!]
```

como já indicado. Esses métodos podem ser usados no db normal.
```js
db.set('newArray', `setArray(${arrayTransformer.arrayToString(['Arroz', 'Feijão', 'e Batata'])})`)
```

```js
console.log(arrayTransformer.stringToArray(db.get('newArray')))
```
