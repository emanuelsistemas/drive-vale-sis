# Drive Vale-Sis React

Versão React do projeto Drive Vale-Sis, uma aplicação de armazenamento de arquivos com tema cyberpunk.

## Estrutura do Projeto

O projeto está organizado seguindo as melhores práticas de desenvolvimento React:

```
drive-react/
├── public/               # Arquivos públicos estáticos
├── src/                  # Código fonte
│   ├── assets/           # Recursos estáticos
│   │   ├── images/       # Imagens
│   │   └── fonts/        # Fontes
│   ├── components/       # Componentes reutilizáveis
│   ├── contexts/         # Contextos React (estado global)
│   ├── hooks/            # Hooks personalizados
│   ├── pages/            # Páginas/rotas da aplicação
│   ├── services/         # Serviços (API, Supabase, etc.)
│   ├── styles/           # Estilos globais e temas
│   └── utils/            # Funções utilitárias
├── package.json          # Dependências e scripts
└── tsconfig.json         # Configuração TypeScript
```

## Tecnologias Utilizadas

- **React**: Biblioteca para construção de interfaces
- **TypeScript**: Superset tipado de JavaScript
- **React Router**: Navegação entre páginas
- **Styled Components**: Estilização com CSS-in-JS
- **Supabase**: Backend as a Service para autenticação e armazenamento

## Tema Visual

O Drive Vale-Sis segue um tema cyberpunk inspirado em terminais de computador antigos, com as seguintes características:

- **Paleta de Cores:**
  - Verde Terminal (`#00ff41`): Cor principal de texto
  - Azul Neon (`#0084ff`): Elementos de destaque
  - Fundo Escuro (`#0a0a0a`): Fundo da página

- **Tipografia:**
  - "Share Tech Mono": Fonte monoespaçada que remete a terminais

- **Efeitos Visuais:**
  - Brilho de terminal (text-shadow e box-shadow)
  - Efeito de cintilação (flickering)
  - Cursor piscante de terminal

## Instalação e Execução

1. Clone o repositório
2. Instale as dependências:
   ```
   npm install
   ```
3. Execute o projeto:
   ```
   npm start
   ```

## Integração com Supabase

O projeto utiliza o Supabase como backend para autenticação e armazenamento de dados.
## Funcionalidades

- Autenticação de usuários (login/cadastro)
- Upload e download de arquivos
- Compartilhamento de arquivos
- Interface com tema cyberpunk
