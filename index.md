# IsaDB

**NPM:** [npm](https://npmjs.com/package/isadb.js)

**GITHUB:** [github](https://github.com/renato425/isadb)



IsaDB é um novo banco de dados para pessoas que iniciam na carreira de programador e para aqueles que já sabem programar.

Todos os conteúdos serão salvos em um arquivo `db.isadb` com fácil configuração.

# Exemplos
**Exemplo simples!**
```js
const isaDB = require('isadb')
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
