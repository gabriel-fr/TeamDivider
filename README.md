# ⚽ TeamDivider - Separador de Times


Aplicação web desenvolvida em **React** e **Next.js** para realizar a divisão automática de jogadores em equipes equilibradas de futebol, considerando o nível de habilidade de cada participante e a distribuição de goleiros.

O objetivo é tornar o sorteio mais justo, evitando que um time concentre apenas jogadores mais fortes ou fique sem goleiro.

---


## ▶️ Acessando o projeto

https://team-divider.vercel.app/

<img width="1080" height="1350" alt="Beige Minimalist Mockup Instagram Post" src="https://github.com/user-attachments/assets/ea417ba5-6d8e-4f04-8755-28d1f5380713" />


---


## 🚀 Tecnologias

- React
- Next.js
- TypeScript
- Lucide React (ícones)
- CSS Inline (React)

---

## ✨ Funcionalidades

### 👤 Cadastro de jogadores

- Adicionar jogadores manualmente.
- Definir o nível de habilidade:
  - 🔴 Joga mal
  - 🟡 Joga médio
  - 🟢 Joga bem
  - ⭐ Joga muito bem
- Marcar jogadores como goleiros.
- Validação para impedir nomes duplicados.

---

### ✏️ Edição dos jogadores

Após adicionar um jogador é possível:

- Alterar o nome
- Alterar o nível
- Definir ou remover a função de goleiro
- Excluir jogadores

---

### 📋 Importação em lote

É possível colar diretamente uma lista copiada do WhatsApp ou de qualquer outro aplicativo.

Exemplo:

```text
Rafael - joga bem
Marcos - goleiro muito bem
Pedro - médio
Lucas - ruim
João
```

A aplicação identifica automaticamente:

- Nome do jogador
- Nível
- Goleiro

Caso uma linha não possua um nível reconhecido, é utilizado o nível padrão escolhido pelo usuário.

Antes da importação é exibida uma prévia onde é possível:

- editar nomes;
- alterar níveis;
- marcar/desmarcar goleiros;
- remover jogadores da lista.

Também são ignorados automaticamente jogadores duplicados.

---

## ⚽ Algoritmo de balanceamento

O sorteio utiliza uma estratégia gulosa (**Greedy Algorithm**) para manter as equipes o mais equilibradas possível.

### Etapa 1

Todos os jogadores são embaralhados utilizando o algoritmo **Fisher-Yates**, garantindo que jogadores com o mesmo nível não sejam distribuídos sempre da mesma forma.

---

### Etapa 2

Os goleiros são separados dos jogadores de linha.

Sempre que possível:

- cada time recebe um goleiro;
- os goleiros são distribuídos antes dos demais jogadores.

Caso existam mais goleiros do que times, os excedentes passam a ser tratados como jogadores comuns durante o restante da distribuição.

---

### Etapa 3

Os jogadores restantes são ordenados do maior nível para o menor.

Cada jogador é inserido no time que possui:

1. menor soma de níveis;
2. em caso de empate, menor quantidade de jogadores.

Esse processo reduz significativamente a diferença de força entre as equipes.

---

## 📊 Indicadores

Durante a montagem dos times a aplicação apresenta:

- quantidade total de jogadores;
- distribuição por nível;
- quantidade de goleiros cadastrados;
- aviso quando não há goleiros suficientes;
- força total de cada equipe;
- nível médio dos times;
- medidor visual de equilíbrio (para dois times).

---

## 🎽 Formação dos times

É possível gerar:

- 2 times
- 3 times
- 4 times

Cada equipe apresenta:

- jogadores escalados;
- identificação dos goleiros;
- força total do time;
- nível médio;
- alerta caso não exista goleiro.

---

## 🧠 Níveis utilizados

| Nível | Descrição | Valor |
|-------|-----------|------:|
| 1 | Joga mal | 1 |
| 2 | Joga médio | 2 |
| 3 | Joga bem | 3 |
| 4 | Joga muito bem | 4 |

O algoritmo utiliza esses valores para calcular o equilíbrio das equipes.

---

## 📥 Formatos reconhecidos na importação

A aplicação consegue interpretar automaticamente diversas formas de escrever o nível dos jogadores.

### Muito bem

```text
Muito bem
Muito boa
```

### Bem

```text
Joga bem
Bem
```

### Médio

```text
Médio
Mediano
Mais ou menos
```

### Mal

```text
Joga mal
Mal
Ruim
Fraco
```

Também reconhece goleiros utilizando palavras como:

```text
goleiro
goleira
GK
```

---

## 🔒 Validações

- Não permite jogadores com nomes duplicados.
- Não permite nomes vazios.
- Ignora duplicidades durante a importação em lote.
- Exibe mensagens de erro amigáveis para facilitar a utilização.

---

## 🎯 Objetivo

A proposta da aplicação é eliminar discussões durante o tradicional "racha", realizando uma divisão automática, rápida e equilibrada dos jogadores.

Em poucos segundos é possível cadastrar toda a lista, importar participantes diretamente do WhatsApp e gerar equipes balanceadas com base na habilidade individual de cada jogador.

---

## 📈 Melhorias futuras

- Compartilhamento dos times por WhatsApp.
- Estatísticas por jogador.
- Restrição de jogadores que desejam atuar juntos ou separados.
- Persistência dos jogadores em banco de dados.
- Tema claro e escuro.

---

## 📄 Licença

Este projeto foi desenvolvido para fins de estudo e utilização em partidas de futebol amador.
