# Famílias de ícones e isolamento

Esta página explica o modelo mental do Oxide Icons: o que é uma
família e como funciona o isolamento entre famílias. Descreve o
desenho tal como foi decidido (ver ADR-0004), antes de existir uma
implementação a funcionar. Ainda não há nenhum `<ox-icon>` executável,
ver o roteiro no README principal para o estado actual.

## O problema numa frase

A maioria das aplicações acaba por misturar ícones de mais de uma
origem ao longo do tempo, normalmente por acidente, e nada apanha isso.

## Os ícones vivem em famílias

Cada ícone pertence exactamente a uma família, um grupo nomeado com
uma linguagem visual partilhada, por exemplo `ui` ou `arrows`. A
identidade completa de um ícone é sempre `family:name`, por exemplo
`ui:add`. Não existe ícone sem família.

## Uma zona da aplicação pode declarar o que espera

Marca-se uma parte do DOM com a família que espera:

```html
<div data-icon-family="ui">
  <ox-icon name="add"></ox-icon>
</div>
```

Todos os `<ox-icon>` dentro dessa zona herdam `ui` como a sua família
esperada, a não ser que peçam explicitamente outra.

## O que acontece quando algo não bate certo

É aqui que entra o modo de isolamento. Três modos, escolhidos por
zona:

- `soft` (o padrão): um ícone de outra família continua a ser
  renderizado, mas fica registado um aviso. Usa-se enquanto estás a
  migrar ou a explorar, quando queres visibilidade sem quebrar nada.
- `exclusive`: um ícone de outra família simplesmente não é
  renderizado, em silêncio. Usa-se quando um desencontro deve ser
  invisível para o utilizador final, não uma falha dura.
- `strict`: um ícone de outra família lança erro. Usa-se em zonas onde
  um desencontro é um bug que deve falhar de forma ruidosa, em
  desenvolvimento e em testes.

```html
<div data-icon-family="finance" data-icon-isolation="strict">
  <ox-icon name="invoice"></ox-icon>                 <!-- ok -->
  <ox-icon name="hospital" family="medical"></ox-icon>  <!-- lança erro -->
</div>
```

## Porque isto não é só uma regra de lint

Uma regra de lint apanha isto no momento do commit, se alguém se
lembrar de a correr, e só para ícones que um analisador estático
consiga ver. Isto é uma garantia em runtime: mantém-se
independentemente de como o nome do ícone chegou até ali, uma prop, um
campo de CMS, saída de outro sistema, e mantém-se em qualquer ambiente
onde a aplicação corra a sério, não só em CI.

## O que esta página ainda não cobre

A referência de API do próprio `<ox-icon>`, do plugin Vite e do
sistema de loaders será documentada quando existirem como código a
funcionar, não antes. Ver as ADRs em `docs/en/adr/` para o detalhe ao
nível de implementação, se precisares disso hoje.
