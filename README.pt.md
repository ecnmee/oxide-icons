<p align="center">
  <img src="./assets/logo.png" alt="Oxide Icons" width="160" />
</p>

<h1 align="center">Oxide Icons</h1>

<p align="center">
  <strong>Uma biblioteca de ícones que sabe onde está.</strong><br />
  Web Component nativo, zero dependências e um sistema de ícones pensado para
  manter famílias visuais isoladas dentro da mesma aplicação. Assim, um
  ícone de outro conjunto não aparece por engano numa área que deveria usar
  um estilo diferente.
</p>

<p align="center">
  <strong>Fase 3 de 4: Getting Started a ser escrito sobre o pacote real.</strong><br />
  A arquitectura, o runtime, e o catálogo de 104 ícones já estão feitos.
  Consulte as
  <a href="#fases-de-desenvolvimento">fases de desenvolvimento</a> abaixo.
</p>

<p align="center">
  <a href="./README.md">Read in English</a>
</p>

## O problema que resolve

Bibliotecas como Lucide, Heroicons e Feather resolvem muito bem uma tarefa
simples: escolher e apresentar um ícone. O problema aparece quando uma
aplicação precisa de trabalhar com duas ou mais famílias de ícones sem que
elas se misturem.

Imagine um dashboard que usa uma família de ícones em estilo outline e que,
por causa de outra dependência, acaba por apresentar um ícone filled numa
secção onde ele não deveria aparecer. Ou um design system que precisa de
garantir que determinados componentes usam sempre a mesma família visual.

O Oxide Icons foi criado para resolver esse problema através de contexto e
isolamento. Cada zona da aplicação pode declarar a família que pretende usar,
e a biblioteca define de forma previsível o que acontece quando um ícone de
outra família é utilizado. O comportamento pode ser configurado através dos
modos `soft`, `exclusive` e `strict`.

```html
<div data-icon-family="ui" data-icon-isolation="strict">
  <ox-icon name="add"></ox-icon>
  <ox-icon name="add" family="arrows"></ox-icon>
</div>
```

Neste exemplo, o primeiro ícone pertence à família `ui` e é aceite. O
segundo pertence à família `arrows` e é bloqueado pelo modo `strict`.

Leia mais em
[Como o Oxide Icons pensa sobre ícones](./docs/concepts.pt.md).

## O que já está feito

- Web Component nativo (`<ox-icon>`) sem dependências em runtime.
- Carregamento sob demanda (JIT) por família de ícones.
- Sistema de contexto e isolamento com os modos `soft`, `exclusive` e `strict`.
- TypeScript em modo strict desde o primeiro ficheiro.
- Arquitectura orientada por contratos, documentada em Architecture Decision
  Records antes da implementação.
- 104 ícones distribuídos por 11 famílias: `ui`, `arrows`, `actions`,
  `navigation`, `files-folders`, `communication`, `media`, `devices`,
  `commerce`, `security` e `weather`.
- Exemplo funcional no browser a demonstrar o fluxo completo.

## Fases de desenvolvimento

O pacote já foi publicado e pode ser instalado e utilizado num projecto. O
desenvolvimento continua activo e está organizado em quatro fases, cada uma
com um objectivo concreto.

1. **Arquitectura e runtime:** concluída. Os contratos do domínio, o sistema
   de isolamento, o `<ox-icon>` e o plugin Vite foram construídos e testados.

2. **Catálogo de ícones:** concluído. As 11 famílias planeadas estão
   disponíveis: `UI Essentials`, `Actions`, `Navigation`,
   `Files & Folders`, `Communication`, `Media`, `Devices`, `Commerce`,
   `Security`, `Weather` e `Arrows`, num total de 104 ícones.
   O objectivo é ter uma cobertura útil e consistente, não atingir uma
   quantidade arbitrária de ícones.

3. **Getting Started:** em desenvolvimento com base no pacote que já está
   disponível para utilização.

4. **Evolução do projecto:** continuar a melhorar o catálogo, a documentação,
   os testes e as próximas releases.

O objectivo não é chegar a milhares de ícones apenas para atingir um número.
Um conjunto coerente e realmente útil é mais importante do que uma contagem
elevada. A principal diferença do Oxide Icons está na arquitectura e na forma
como as famílias são tratadas.

## Estado actual

O Oxide Icons já está publicado e pode ser instalado e utilizado num
projecto. A versão actual ainda está em desenvolvimento, por isso deve ser
encarada como uma versão inicial e não como um catálogo terminado.

Uma versão anterior do projecto foi abandonada durante uma refactorização.
Em vez de continuar a partir daquela base, o projecto foi reiniciado com a
arquitectura definida e documentada antes da implementação. A versão actual
é o resultado desse reinício e já foi utilizada num projecto de teste.

## Acompanhar o desenvolvimento

O código, os testes e as decisões de arquitectura ficam no repositório de
desenvolvimento.

## Licença

MIT, consulte [LICENSE](./LICENSE).
