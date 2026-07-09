<p align="center">
  <img src="./assets/logo.png" alt="Oxide Icons" width="160" />
</p>

<h1 align="center">Oxide Icons</h1>

<p align="center">
  <strong>Uma biblioteca de ícones que sabe onde está.</strong><br />
  Web Component nativo, zero dependências, e o único sistema de ícones
  construído em torno de isolamento explícito entre famílias visuais na
  mesma aplicação.
</p>

<p align="center">
  <strong>Em desenvolvimento activo. Sem release publicado ainda.</strong>
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

## Porque ainda não há release

Preferimos um repositório pequeno e honesto a uma lista de
funcionalidades que ainda não existem. Uma versão anterior deste
projecto foi abandonada a meio de uma refactorização. Em vez de
publicar por cima disso, recomeçámos com a arquitectura definida e
documentada antes da primeira linha de implementação. O desenvolvimento
é público, no repositório de trabalho (link a adicionar aqui assim que
ambos os repositórios estiverem publicados).

## O que já está decidido

- Web Component nativo (`<ox-icon>`), zero dependências em runtime.
- Carregamento sob demanda (JIT), por família de ícones.
- Sistema de contexto e isolamento (`soft`/`exclusive`/`strict`), o
  diferencial central do produto.
- TypeScript em modo strict desde o primeiro ficheiro.
- Arquitectura dirigida por contratos, documentada em Architecture
  Decision Records antes de qualquer implementação.

## Roteiro

- [x] Arquitectura e contratos do domínio definidos e documentados.
- [ ] Implementações de referência (`Registry`, `Catalog`, `Loader`,
      `Renderer`, resolução de contexto).
- [ ] `<ox-icon>` funcional, primeiro exemplo a correr no browser.
- [ ] Plugin Vite.
- [ ] Primeiro conjunto de ícones publicado (transparência total sobre
      quantos ícones existem, sem números inflacionados).
- [ ] Primeiro release `0.1.0`.

## Acompanhar o desenvolvimento

Código, testes e decisões de arquitectura ficam no repositório de
desenvolvimento (link a adicionar aqui).

## Licença

MIT, ver [LICENSE](./LICENSE).
