# Como o Oxide Icons pensa sobre ícones

A maioria das bibliotecas de ícones responde a uma pergunta: dá-me um
ícone. O Oxide Icons também responde a uma segunda, que nenhuma das
bibliotecas populares aborda: este ícone devia sequer ser permitido
aqui.

## Cada ícone pertence a uma família

Não é uma etiqueta solta, é uma fronteira a sério. `ui:add`,
`arrows:left`, `medical:hospital`. Um ícone nunca é só um nome, é
sempre um nome dentro de uma família.

## Uma zona da tua aplicação pode declarar o que espera

```html
<div data-icon-family="finance" data-icon-isolation="strict">
  <ox-icon name="invoice"></ox-icon>              <!-- ok -->
  <ox-icon name="hospital" family="medical"></ox-icon>  <!-- bloqueado -->
</div>
```

Três modos de isolamento, escolhidos por zona: `soft` avisa,
`exclusive` bloqueia em silêncio, `strict` lança erro. Isto não é uma
regra de lint que apanha erros no momento do commit, se alguém se
lembrar de a correr. É uma garantia em runtime, em qualquer ambiente
onde a tua aplicação corra a sério.

## Porque é que isto importa

Design systems, produtos white-label e bases de código com várias
equipas acabam sempre por misturar origens de ícones por acidente.
Hoje, nada apanha isso no momento em que acontece. É esta a parte do
problema em torno da qual o Oxide Icons é construído, tudo o resto
(tamanho do bundle, estratégia de carregamento, o próprio Web
Component) existe para servir bem essa garantia.

O detalhe técnico completo vive nas Architecture Decision Records no
repositório de desenvolvimento.

[Read this page in English](./concepts.md)
