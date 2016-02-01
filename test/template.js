require('babel-core/register')

const Template = require('../src/template').default

var tpl = Template.createPartial('hello <ul>{{each collection}}<li>#{title}</li>{{/each}}</ul>')
console.log(tpl({
  collection: [
    {
      title: 'Alakazam'
    },
    {
      title: 'Hocus your pocus'
    },
    {
      title: 'Mamer jamer'
    }
  ],
  foo: 'bar'
}))
/*var injecta = Template.processString('hello #{foo}', {foo: 'bar'})
console.log(injecta)*/
