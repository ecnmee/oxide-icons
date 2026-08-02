<p align="center">
  <img src="./assets/logo.png" alt="Oxide Icons" width="160" />
</p>

<h1 align="center">Oxide Icons</h1>

<p align="center">
  <strong>Uma biblioteca de ícones que sabe onde está.</strong><br />
  Web Component nativo, zero dependências, e o único sistema de ícones
  construído em torno de isolamento explícito entre famílias visuais na
  mesma aplicação. Chega de descobrir porque é que o estilo de ícone
  errado se infiltrou numa secção da app que nunca devia vê-lo.
</p>

<p align="center">
  <strong>Fase 2 de 4 — a construir o catálogo de ícones.</strong>
  Arquitectura e runtime feitos. Ver <a href="#fases-de-desenvolvimento">fases</a> abaixo.
</p>

<p align="center">
  <a href="./README.md">Read in English</a>
</p>

---

## O problema que resolve

Todas as bibliotecas de ícones populares, Lucide, Heroicons, Feather,
resolvem bem "dá-me um ícone". Nenhuma resolve o problema de duas
famílias de ícones a coexistir na mesma aplicação sem se misturarem por
acidente: um dashboard que usa um conjunto de ícones "outline" e
acidentalmente herda um ícone "filled" de outra dependência, ou um
design system que precisa de garantir que uma secção da aplicação nunca
mistura estilos.

O Oxide Icons resolve isto com um sistema de contexto e isolamento:
zonas da aplicação declaram a que família pertencem, e a biblioteca
decide, de forma previsível e configurável (`soft` / `exclusive` /
`strict`), o que acontece quando aparece ali um ícone de fora.

```html
<div data-icon-family="ui" data-icon-isolation="strict">
  <ox-icon name="add"></ox-icon>              <!-- ok, família "ui" -->
  <ox-icon name="add" family="arrows"></ox-icon>  <!-- bloqueado -->
</div>
```

Lê mais: [Como o Oxide Icons pensa sobre ícones](./docs/concepts.pt.md).

## O que já está feito

- Web Component nativo (`<ox-icon>`), zero dependências em runtime.
- Carregamento sob demanda (JIT), por família de ícones.
- Sistema de contexto e isolamento (`soft`/`exclusive`/`strict`).
- TypeScript em modo strict desde o primeiro ficheiro.
- Arquitectura dirigida por contratos, documentada em Architecture
  Decision Records antes de qualquer implementação.
- 34 ícones em quatro famílias (`ui`, `arrows`, `actions`,
  `navigation`) e um exemplo funcional no browser a ligar tudo ponta
  a ponta.

## Fases de desenvolvimento

Ainda sem release, sem fingir o contrário, mas sem estar parado
também. Quatro fases, em ordem, cada uma um marco real:

1. **Arquitectura e runtime** — feito. Contratos do domínio, o
   sistema de isolamento, `<ox-icon>`, o plugin Vite, tudo construído
   contra testes reais, não esboçado.
2. **Catálogo de ícones** — em curso. Feito até agora: `UI
   Essentials`, `Actions`, `Navigation` (34 ícones). Ainda por fazer:
   `Files & Folders`, `Communication`, `Media`, `Devices`, `Commerce`,
   `Security`, `Weather`, e `Brands` se ficar no âmbito. Cobertura, não
   uma contagem, é a linha de chegada, ver a nota abaixo.
3. **Getting Started, escrito contra o pacote real** — não antes de
   haver algo instalável. Uma promessa que se corre vale mais que uma
   promessa que se lê.
4. **Publicar** — `npm publish`, primeira release no GitHub.

Não perseguimos "5000 ícones" como número de lançamento. Um conjunto
útil e coerente vale mais que um número arbitrário, o que diferencia
este projecto é a arquitectura, não o tamanho do catálogo.

## Porque ainda não há release

Preferimos um repositório pequeno e honesto a uma lista de
funcionalidades que ainda não existem. Uma versão anterior deste
projecto foi abandonada a meio de uma refactorização. Em vez de
publicar por cima disso, recomeçámos com a arquitectura definida e
documentada antes da primeira linha de implementação. O desenvolvimento
começa num repositório de trabalho privado; este repositório é onde o
projecto é publicado para a comunidade.

## Acompanhar o desenvolvimento

Código, testes e decisões de arquitectura ficam no repositório de
desenvolvimento.

## Licença

MIT, ver [LICENSE](./LICENSE).
